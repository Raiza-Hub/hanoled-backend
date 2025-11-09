import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const session = pgTable("session", {
  id: uuid("id").defaultRandom().primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  activeOrganizationId: text("active_organization_id"),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verification = pgTable("verification", {
  id: uuid("id").defaultRandom().primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categoryEnum = pgEnum("category", [
  "primary",
  "secondary",
  "tertiary",
]);

export const schoolType = pgEnum("school_type", [
  "public",
  "private",
  "federal",
  "state",
]);

export const organization = pgTable("organization", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  logo: text("logo").notNull(),
  email: text("email").notNull(),
  country: text("country").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  studentNo: integer("student_number").default(0).notNull(),
  teacherNo: integer("teacher_no").default(0).notNull(),
  parentNo: integer("parent_no").default(0).notNull(),
  category: categoryEnum("category").notNull(),
  schoolType: schoolType("school_type").notNull(),
  website: text("website"),
  socialLinks: jsonb("social_links")
    .$type<
      { type: "facebook" | "instagram" | "twitter" | "linkedin"; url: string }[]
    >()
    .default([]),
  paymentStatus: boolean("payment_status").default(false).notNull(),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const memberRole = pgEnum("role", ["member", "owner", "admin"]);

export const member = pgTable("member", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  // role: text("role").default("member").notNull(),
  role: memberRole("role").default("member").notNull(),
  isAssigned: boolean("is_assigned").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inviteRole = pgEnum("invite-role", ["member", "parent", "admin"]);
export const status = pgEnum("status", ["pending", "success", "failed"]);

export const invitation = pgTable("invitation", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: inviteRole("invite-role").default("member").notNull(),
  status: status("status").default("pending").notNull(),
  expiresAt: date("expires_at").notNull(),
  inviterId: uuid("inviter_id")
    .notNull()
    .references(() => member.id, { onDelete: "cascade" }),
});

export const parent = pgTable("parent", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  // studentId: uuid("student_ids").array().notNull().default([]),
  role: text("role").default("parent").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const parentToStudents = pgTable("parents_to_students", {
  parentId: uuid("parent_id")
    .notNull()
    .references(() => parent.id, { onDelete: "cascade" }),
  studentId: uuid("student_id")
    .notNull()
    .references(() => student.id, { onDelete: "cascade" }),
});

export const classLevel = pgTable("classLevel", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => member.id, { onDelete: "set null" }),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  level: text("level").notNull(),
  class: text("class").notNull(),
  limit: integer("limit").notNull(),
  totalStudents: integer("total_students").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subject = pgTable("subject", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  memberId: uuid("member_id")
    .notNull()
    .references(() => member.id, { onDelete: "cascade" }),
  subjectName: varchar("subject_name", { length: 256 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const genderEnum = pgEnum("gender", ["male", "female"]);

export const student = pgTable("student", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  middleName: text("middle_name").notNull(),
  gender: genderEnum("gender").notNull(),
  image: text("image"),
  dateOfBirth: date("date_of_birth").notNull(),
  guardianFullName: text("guardian_full_name").notNull(),
  guardianPhone: varchar("guardian_phone", { length: 11 }).notNull(),
  guardianEmail: text("guardian_email").notNull(),
  address: text("address").notNull(),
  classLevel: uuid("class_level")
    .notNull()
    .references(() => classLevel.id, { onDelete: "cascade" }),
  admissionDate: date("admission_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const otp = pgTable("otp", {
  id: uuid("id").defaultRandom().primaryKey(),
  otp: text("otp").notNull(),
  email: text("email").notNull(),
  expiresAt: date("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subjectSpreadsheet = pgTable("class_spreadsheets", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  organizationId: uuid("organization_id").references(() => organization.id, {
    onDelete: "cascade",
  }),
  classId: uuid("class_id").references(() => classLevel.id, {
    onDelete: "cascade",
  }),
  subjectId: uuid("subject_id").references(() => subject.id, {
    onDelete: "cascade",
  }),
  memberId: uuid("member_id").references(() => member.id, {
    onDelete: "cascade",
  }),
  data: jsonb("data").notNull().default("[]"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const results = pgTable("results", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => student.id),
  organizationId: uuid("organization_id").references(() => organization.id, {
    onDelete: "cascade",
  }),
  classId: uuid("class_id").references(() => classLevel.id, {
    onDelete: "cascade",
  }),
  subjectId: uuid("subject_id").references(() => subject.id, {
    onDelete: "cascade",
  }),
  memberId: uuid("member_id").references(() => member.id, {
    onDelete: "cascade",
  }),
  subjectName: text("subject_name").notNull(),
  data: jsonb("data").$type<Record<string, number>>().notNull(),
});

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}));

export const studentRelations = relations(student, ({ many, one }) => ({
  organization: one(organization, {
    fields: [student.organizationId],
    references: [organization.id],
  }),
  classLevel: one(classLevel, {
    fields: [student.classLevel],
    references: [classLevel.id],
  }),
  subject: many(subject),
  member: many(member),
  parent: many(parentToStudents),
}));

export const parentRelations = relations(parent, ({ many, one }) => ({
  students: many(parentToStudents),
  user: one(user, {
    fields: [parent.userId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [parent.organizationId],
    references: [organization.id],
  }),
}));

export const parentsToStudentsRelations = relations(
  parentToStudents,
  ({ one }) => ({
    parent: one(parent, {
      fields: [parentToStudents.parentId],
      references: [parent.id],
    }),
    student: one(student, {
      fields: [parentToStudents.studentId],
      references: [student.id],
    }),
  })
);

export const usersRelations = relations(user, ({ many }) => ({
  members: many(member),
  invitationsSent: many(invitation),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  invitations: many(invitation),
  parents: many(parent),
  subject: many(subject),
  classLevel: many(classLevel),
  student: many(student),
}));

export const classRelations = relations(classLevel, ({ many, one }) => ({
  member: one(member, {
    fields: [classLevel.memberId],
    references: [member.id],
  }),
  students: many(student),
}));

export type Member = typeof member.$inferSelect & {
  user: typeof user.$inferSelect;
};
export type Student = typeof student.$inferSelect;

export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;

export type Organization = typeof organization.$inferSelect;

export type Subject = typeof subject.$inferSelect;

export type Otp = typeof otp.$inferSelect;

export type ClassLevel = typeof classLevel.$inferSelect;

export type SubjectSpreadsheet = typeof subjectSpreadsheet.$inferSelect;

export const schema = {
  user,
  session,
  account,
  verification,
  organization,
  member,
  parent,
  invitation,
  classLevel,
  subject,
  student,
  studentRelations,
  memberRelations,
  organizationRelations,
  otp,
  subjectSpreadsheet,
  usersRelations,
  parentRelations,
  classRelations,
  parentsToStudentsRelations,
  parentToStudents,
  results,
};
