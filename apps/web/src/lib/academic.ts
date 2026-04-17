export type DepartmentRecord = {
  id: string;
  institution_id: string;
  name: string;
  code: string | null;
  status: "active" | "archived";
  created_at: string;
};

export type CourseRecord = {
  id: string;
  institution_id: string;
  department_id: string | null;
  name: string;
  code: string | null;
  status: "active" | "archived";
  created_at: string;
};

export type SubjectRecord = {
  id: string;
  institution_id: string;
  department_id: string | null;
  course_id: string | null;
  name: string;
  code: string | null;
  status: "active" | "archived";
  created_at: string;
};

export type AcademicStructureResponse = {
  departments: DepartmentRecord[];
  courses: CourseRecord[];
  subjects: SubjectRecord[];
};
