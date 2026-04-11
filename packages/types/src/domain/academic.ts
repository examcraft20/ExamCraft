export interface Department {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'archived';
}

export interface Course {
  id: string;
  departmentId: string;
  name: string;
  code: string;
}

export interface Subject {
  id: string;
  courseId: string;
  name: string;
  code: string;
}

export interface Batch {
  id: string;
  courseId: string;
  name: string;
  academicYear: string;
}
