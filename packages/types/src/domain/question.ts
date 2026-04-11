export interface Question {
  id: string;
  institutionId: string;
  title: string;
  content?: string;
  subject: string;
  bloomLevel: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  courseOutcomes: string[];
  programOutcomes?: string[];
  unitNumber?: number;
  status: 'draft' | 'ready' | 'archived';
  createdAt: string;
}
