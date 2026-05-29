import { NotFoundError } from "@/lib/errors";
import { withTenantTransaction } from "@/lib/db";
import { toTenantSession, type TenantContext } from "@/lib/tenant/context";
import { requireStaff } from "@/lib/tenant/require-staff";

export type StaffOrganizationRow = {
  slug: string;
  name: string;
  trustLevel: string;
  programCount: number;
};

export async function listOrganizationsForStaff(
  ctx: TenantContext,
): Promise<StaffOrganizationRow[]> {
  requireStaff(ctx);

  return withTenantTransaction(toTenantSession(ctx), async (client) => {
    const { rows } = await client.query<{
      slug: string;
      name: string;
      trust_level: string;
      program_count: string;
    }>(
      `select o.slug,
              o.name,
              o.trust_level::text as trust_level,
              count(p.id)::text as program_count
       from organization o
       left join program p on p.organization_id = o.id
       group by o.id
       order by o.name asc`,
    );

    return rows.map((row) => ({
      slug: row.slug,
      name: row.name,
      trustLevel: row.trust_level,
      programCount: Number(row.program_count),
    }));
  });
}

export async function getOrganizationBySlugForStaff(
  ctx: TenantContext,
  orgSlug: string,
): Promise<{ id: string; slug: string; name: string; trustLevel: string }> {
  requireStaff(ctx);

  return withTenantTransaction(toTenantSession(ctx), async (client) => {
    const { rows } = await client.query<{
      id: string;
      slug: string;
      name: string;
      trust_level: string;
    }>(
      `select id, slug, name, trust_level::text as trust_level
       from organization
       where slug = $1`,
      [orgSlug],
    );

    const row = rows[0];
    if (!row) {
      throw new NotFoundError();
    }

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      trustLevel: row.trust_level,
    };
  });
}
