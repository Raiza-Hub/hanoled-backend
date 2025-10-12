import { db } from "@/db/db.js";
import { Member, organization } from "@/db/schema.js";
import { and, eq, inArray } from "drizzle-orm";

class OrganizationService {
  static async getAllOrganizations(organizationId: string) {
    return await db.query.organization.findMany({
      where: eq(organization.id, organizationId),
    });
  }
  static async getActiveOrganization(organizationId: string) {
    return await db.query.organization.findFirst({
      where: eq(organization.id, organizationId),
      with: {
        members: {
          with: {
            user: true,
          },
        },
      },
    });
  }

  // static async getOrganizationBySlug(slug: string) {
  //   return await db.query.organization.findFirst({
  //     where: eq(organization.slug, slug),
  //     with: {
  //       members: {
  //         with: {
  //           user: true,
  //         },
  //       },
  //     },
  //   });
  // }
  static async getOrganizationBySlug(organizationId: string, slug: string) {
    return await db.query.organization.findFirst({
      where: and(
        eq(organization.id, organizationId),
        eq(organization.slug, slug)
      ),
      with: {
        members: {
          with: {
            user: true,
          },
        },
      },
    });
  }
}

export default OrganizationService;
