export interface TemplateSection {
  title: string;
  questionCount: number;
  marks: number;
  description?: string;
}

export interface Template {
  id: string;
  institutionId: string;
  name: string;
  examType: string;
  durationMinutes: number;
  totalMarks: number;
  sections: TemplateSection[];
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
}
