import Link from "next/link";
import { resolveTenantContext } from "@/lib/tenant/context";
import { listOrganizationsForStaff } from "@/lib/tenant/repositories/staff-organizations";

export const metadata = {
  title: "Organizations",
};

export default async function StaffOrganizationsPage() {
  const ctx = await resolveTenantContext();
  const organizations = await listOrganizationsForStaff(ctx);

  return (
    <div className="mx-auto max-w-[1040px] px-5 py-12 md:px-8">
      <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft">
        Staff · Organizations
      </p>
      <h1 className="mt-3 font-sans text-h2 text-ink">Organizations</h1>
      <p className="mt-2 max-w-[640px] font-body text-body-sm text-ink-muted">
        Select a partner organization to manage programs and draft curricula.
      </p>

      <ul className="mt-12 border-t border-ink/20">
        {organizations.length === 0 ? (
          <li className="border-b border-ink/15 py-10 font-body text-body-sm text-ink-muted">
            No organizations yet. Seed or create an organization in the database to
            get started.
          </li>
        ) : (
          organizations.map((org) => (
            <li key={org.slug} className="border-b border-ink/15">
              <Link
                href={`/staff/organizations/${org.slug}`}
                className="flex flex-wrap items-baseline justify-between gap-4 py-8 transition-colors hover:bg-paper-deep/60"
              >
                <div>
                  <h2 className="font-sans text-[1.15rem] font-semibold text-ink">
                    {org.name}
                  </h2>
                  <p className="mt-1 font-mono text-[0.72rem] text-ink-soft">{org.slug}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-soft">
                    {org.programCount} {org.programCount === 1 ? "program" : "programs"}
                  </p>
                  <p className="mt-1 font-sans text-[0.82rem] text-ink-muted">
                    {org.trustLevel.replace(/_/g, " ")}
                  </p>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
