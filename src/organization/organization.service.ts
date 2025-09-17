import { eq, inArray } from "drizzle-orm";
import { db } from "../db/db";
import { Member, organization } from "../db/schema";

class OrganizationService {
  static async getAllMemberOrganizations(memberships: Member | Member[]) {
    const membershipArray = Array.isArray(memberships)
      ? memberships
      : [memberships];
    return await db.query.organization.findMany({
      where: inArray(
        organization.id,
        membershipArray.map((m: Member) => m.organizationId)
      ),
    });
  }
  static async getActiveOrganization(organizationId: string) {
    return await db.query.organization.findFirst({
      where: eq(organization.id, organizationId),
    });
  }

  static async getOrganizationBySlug(slug: string) {
    return await db.query.organization.findFirst({
      where: eq(organization.slug, slug),
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
