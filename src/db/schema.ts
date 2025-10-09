import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  // lastActive: timestamp("last_active").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  activeOrganizationId: text("active_organization_id"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  metadata: text("metadata"),
  userId: text("user_id"),
  createdAt: timestamp("created_at").notNull(),
});

export const memberRole = pgEnum("role", ["member", "owner", "admin"]);

export const member = pgTable("member", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  // role: text("role").default("member").notNull(),
  role: memberRole("role").default("member").notNull(),
  isAssigned: boolean("is_assigned").default(false).notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const invitation = pgTable("invitation", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const parent = pgTable("parent", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  studentId: text("student_ids").array().notNull(),
  role: text("role").default("parent").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const classLevel = pgTable("class", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberId: text("member_id")
    .notNull()
    .references(() => member.id, { onDelete: "set null" }),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  level: text("level").notNull(),
  class: text("class").notNull(),
  limit: integer("limit").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subject = pgTable("subject", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  memberId: text("member_id")
    .notNull()
    .references(() => member.id, { onDelete: "cascade" }),
  subjectName: varchar("subject_name", { length: 256 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const genderEnum = pgEnum("gender", ["male", "female"]);

export const student = pgTable("student", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  middleName: text("middle_name").notNull(),
  gender: genderEnum("gender").notNull(),
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
  organization: one(organization),
  classLevel: one(classLevel),
  subject: many(subject),
  member: many(member),
  parent: many(parent),
}));

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

export type Member = typeof member.$inferSelect & {
  user: typeof user.$inferSelect;
};
export type student = typeof student.$inferSelect;

export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;

export type Organization = typeof organization.$inferSelect;

export type Subject = typeof subject.$inferSelect;

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
};
