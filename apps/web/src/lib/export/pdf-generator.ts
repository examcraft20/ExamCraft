import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface Question {
  id: string;
  title: string;
  difficulty: string;
  bloomLevel: string;
}

interface ExportPaperData {
  institutionName: string;
  institutionLogo?: string;
  title: string;
  examType: string;
  durationMinutes: number;
  totalMarks: number;
  subjectName?: string;
  sections: Array<{
    title: string;
    marks: number;
    isOrGroup?: boolean;
    questions?: Question[];
    choiceA?: { label: string; questions: Question[] };
    choiceB?: { label: string; questions: Question[] };
  }>;
}

export async function generateExamPDF(data: ExportPaperData) {
  const doc = new jsPDF() as any;
  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 15;

  const renderQuestions = (questions: Question[], startIdx: number, subLabel?: string) => {
    questions.forEach((q, idx) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      const qPrefix = subLabel ? `  (${String.fromCharCode(97 + idx)}) ` : `${startIdx + idx + 1}. `;
      const qText = q.title;
      
      const splitText = doc.splitTextToSize(qText, pageWidth - 60);
      doc.text(qPrefix, subLabel ? 25 : 18, currentY);
      doc.text(splitText, subLabel ? 35 : 25, currentY);
      
      // Calculate individual marks (placeholder)
      const marks = subLabel ? "" : "[05]"; 
      doc.text(marks, pageWidth - 25, currentY);

      currentY += (splitText.length * 5) + 5;

      if (currentY > 275) {
        doc.addPage();
        currentY = 20;
      }
    });
  };

  // --- Header Section ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(data.institutionName.toUpperCase(), pageWidth / 2, currentY, { align: "center" });
  currentY += 10;

  doc.setFontSize(12);
  doc.text(data.title, pageWidth / 2, currentY, { align: "center" });
  currentY += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Exam Type: ${data.examType}`, pageWidth / 2, currentY, { align: "center" });
  currentY += 10;

  doc.line(15, currentY, pageWidth - 15, currentY);
  currentY += 7;
  
  doc.setFont("helvetica", "bold");
  doc.text(`Subject: ${data.subjectName || "N/A"}`, 15, currentY);
  doc.text(`Marks: ${data.totalMarks}`, pageWidth - 45, currentY);
  currentY += 7;
  
  doc.text(`Time: ${data.durationMinutes} mins`, 15, currentY);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 45, currentY);
  currentY += 7;

  doc.line(15, currentY, pageWidth - 15, currentY);
  currentY += 12;

  // --- Sections ---
  data.sections.forEach((section, sIdx) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setFillColor(245, 245, 245);
    doc.rect(15, currentY - 5, pageWidth - 30, 8, "F");
    doc.text(`${section.title.toUpperCase()}`, 18, currentY + 1);
    doc.text(`${section.marks}M`, pageWidth - 25, currentY + 1);
    currentY += 12;

    if (section.isOrGroup && section.choiceA && section.choiceB) {
      // Option A
      doc.setFont("helvetica", "bold");
      doc.text(`Q.${sIdx + 1} ${section.choiceA.label}`, 18, currentY);
      currentY += 8;
      renderQuestions(section.choiceA.questions, sIdx, "a");
      
      // OR separator
      currentY += 5;
      doc.setFont("helvetica", "bolditalic");
      doc.text("OR", pageWidth / 2, currentY, { align: "center" });
      currentY += 10;

      // Option B
      doc.setFont("helvetica", "bold");
      doc.text(`Q.${sIdx + 1} ${section.choiceB.label}`, 18, currentY);
      currentY += 8;
      renderQuestions(section.choiceB.questions, sIdx, "b");

    } else if (section.questions) {
      renderQuestions(section.questions, sIdx);
    }

    currentY += 10;
    if (currentY > 270) {
      doc.addPage();
      currentY = 20;
    }
  });

  // Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`© ${new Date().getFullYear()} ${data.institutionName} | ExamCraft SaaS`, pageWidth / 2, 285, { align: "center" });
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 25, 285);
  }

  doc.save(`${data.title.replace(/\s+/g, "_")}.pdf`);
}
