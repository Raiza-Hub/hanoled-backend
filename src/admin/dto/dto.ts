export interface ISubject {
  organizationId: string;
  memberId: string;
  subjectName: string;
}

export interface IClass {
  organizationId: string;
  memberId: string;
  class: string;
  level: string;
  limit: number;
}

export interface IStudent {
  organizationId: string;
  firstName: string;
  lastName: string;
  middleName: string;
  gender: "male" | "female";
  dateOfBirth: string;
  guardianFullName: string;
  guardianPhone: string;
  guardianEmail: string;
  address: string;
  classLevel: string;
  admissionDate: string;
}

export interface IObject {
  id: string;
  createdAt: Date;
  userId: string;
  organizationId: string;
  role: "member" | "owner" | "admin";
  isAssigned: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
  };
}
