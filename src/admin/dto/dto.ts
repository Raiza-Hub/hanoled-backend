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

export interface IOtp {
  otp: string;
  email: string;
  expiresAt: string;
}

export interface IUser {
  name: string;
  email: string;
  password: string;
}

export interface IOrganization {
  name: string;
  slug: string;
  logo: string;
  metadata: string;
}

export interface IMember {
  organizationId: string;
  userId: string;
  role: "member" | "owner" | "admin";
  isAssigned: boolean;
}

export interface IInvite {
  organizationId: string;
  email: string;
  role: "member" | "parent" | "admin";
  status: "pending" | "success" | "failed";
  expiresAt: string;
  inviterId: string;
}

export type status = "pending" | "success" | "failed";

export interface IParent {
  organizationId: string;
  userId: string;
  studentId: string[];
  role: string;
}
