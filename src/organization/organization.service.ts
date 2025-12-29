import { IOrganization } from "@/admin/dto/dto.js";
import { db } from "@/db/db.js";
import { Member, Organization, organization } from "@/db/schema.js";
import { and, eq, inArray } from "drizzle-orm";

class OrganizationService {
  static async getAllOrganizations(organizationId: string) {
    return await db.query.organization.findFirst({
      where: eq(organization.id, organizationId),
      // with: {
      //   members: true,
      // },
    });
  }
  static async getSpecificOrganization(slug: string) {
    return await db.query.organization.findFirst({
      where: eq(organization.slug, slug),
    });
  }
  static async getActiveOrganization(organizationId: string) {
    return await db.query.organization.findFirst({
      where: eq(organization.id, organizationId),
      with: {
        members: {
          with: {
             user: {
              columns: {
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });
  }

  static async getOrganizationBySlug(organizationId: string, slug: string) {
    return await db.query.organization.findFirst({
      where: and(
        eq(organization.id, organizationId),
        eq(organization.slug, slug)
      ),
      with: {
        members: {
          with: {
            user: {
              columns: {
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });
  }
  static async getOrganization(name: string, slug: string) {
    return await db.query.organization.findFirst({
      where: and(eq(organization.name, name), eq(organization.slug, slug)),
    });
  }
  static async findOrgBySlug(slug: string) {
    return await db.query.organization.findFirst({
      where: eq(organization.slug, slug),
    });
  }
  static async createOrganization(data: IOrganization) {
    return await db.insert(organization).values(data).returning();
  }
  static async findAllOrganization() {
    return await db.query.organization.findMany();
  }
  static async updateOrganization(id: string, data: Partial<Organization>) {
    return await db
      .update(organization)
      .set(data)
      .where(eq(organization.id, id))
      .returning();
  }
  static async deleteOrganization(id: string) {
    return await db.delete(organization).where(eq(organization.id, id));
  }
}

export default OrganizationService;
