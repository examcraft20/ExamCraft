import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { InstitutionContext, AuthenticatedUser } from "../common/types/authenticated-request";

@Injectable()
export class SyllabusService {
  private readonly logger = new Logger(SyllabusService.name);

  async extractTopics(fileBuffer: Buffer) {
    const apiKey = process.env["GEMINI_API_KEY"];
    if (!apiKey) {
      throw new InternalServerErrorException("GEMINI_API_KEY is not configured.");
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = "Extract the core academic topics, chapters, or units from this syllabus or document. Return ONLY a pure JSON array of strings representing these topics. Do not include markdown formatting or backticks around the JSON array.";

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: fileBuffer.toString("base64"),
            mimeType: "application/pdf",
          },
        },
      ]);
      
      let rawText = result.response.text();
      // Clean possible markdown code blocks if the model ignores our instruction
      if (rawText.startsWith("```json")) {
        rawText = rawText.substring(7);
      }
      if (rawText.startsWith("```")) {
        rawText = rawText.substring(3);
      }
      if (rawText.endsWith("```")) {
        rawText = rawText.substring(0, rawText.length - 3);
      }
      
      const topics = JSON.parse(rawText.trim());

      return {
        topics: Array.isArray(topics) ? topics : [],
        confidence: 0.95,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      this.logger.error("Failed to extract topics via Gemini", err);
      // Fallback
      return {
        topics: ["Extraction Failed"],
        confidence: 0.0,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async analyzeSyllabusAndGenerate(
    institutionContext: InstitutionContext,
    currentUser: AuthenticatedUser,
    text: string,
    subject = "General",
    count = 5,
  ) {
    const apiKey = process.env["GEMINI_API_KEY"];
    if (!apiKey) {
      throw new InternalServerErrorException("GEMINI_API_KEY is not configured.");
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = this.buildSyllabusPrompt(text, subject, count);
      const result = await model.generateContent(prompt);
      const raw = result.response.text();
      const items = this.parseGeminiJson(raw);

      const generatedQuestions = items.slice(0, count).map((item: any) => ({
        title: typeof item.title === "string" ? item.title.trim() : "Untitled question",
        subject: typeof item.subject === "string" ? item.subject : subject,
        bloomLevel: item.bloom_level || "Understand",
        difficulty: item.difficulty || "Medium",
        tags: Array.isArray(item.tags) ? item.tags : ["AI Generated"],
        courseOutcomes: ["CO1"],
        unitNumber: item.unit_number || 1,
        status: "draft",
      }));

      return {
        generatedQuestions,
        metadata: {
          wordCount: text.length,
          model: "gemini-1.5-flash",
          requestedCount: count,
          returnedCount: generatedQuestions.length,
        },
      };
    } catch (err) {
      this.logger.error("Gemini generation failed", err);
      throw new InternalServerErrorException("AI generation failed.");
    }
  }

  private buildSyllabusPrompt(text: string, subject: string, count: number): string {
    return `Generate ${count} exam questions as a JSON array for subject "${subject}". 
    Syllabus: ${text.slice(0, 4000)}
    Schema: { "title": string, "bloom_level": string, "difficulty": string, "subject": string, "tags": string[], "unit_number": number }`;
  }

  private parseGeminiJson(raw: string): any[] {
    try {
      let cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      const parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) {
        throw new Error("Expected an array of questions");
      }
      return parsed;
    } catch (err) {
      this.logger.error("Failed to parse Gemini JSON response", { raw: raw.slice(0, 500), err });
      throw new InternalServerErrorException(
        "AI returned an invalid response format. Please try again."
      );
    }
  }
}
