import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { InstitutionContext, AuthenticatedUser } from "../common/types/authenticated-request";

@Injectable()
export class SyllabusService {
  private readonly logger = new Logger(SyllabusService.name);

  async extractTopics(fileBuffer: Buffer) {
    // Stub for now, can be implemented with PDF parsing libs
    return {
      topics: ["Newton's Laws", "Friction", "Circular Motion"],
      confidence: 0.95,
      timestamp: new Date().toISOString(),
    };
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
    let cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    return JSON.parse(cleaned);
  }
}
