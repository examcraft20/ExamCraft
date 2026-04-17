export interface Paper {
  id: string;
  institutionId: string;
  title: string;
  templateId: string;
  templateName: string;
  subject: string;
  totalMarks: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'published';
  sections: any[]; 
  createdAt: string;
}
