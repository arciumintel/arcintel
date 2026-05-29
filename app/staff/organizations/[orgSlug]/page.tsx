import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveTenantContext } from "@/lib/tenant/context";
import { getOrganizationBySlugForStaff } from "@/lib/tenant/repositories/staff-organizations";
import { listProgramsForOrg } from "@/lib/tenant/repositories/staff-programs";
import { NotFoundError } from "@/lib/errors";

type PageProps = {
  params: Promise<{ orgSlug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { orgSlug } = await params;
  return { title: `${orgSlug} · Programs` };
}

export default async function StaffOrgProgramsPage({ params }: PageProps) {
  const { orgSlug } = await params;
  const ctx = await resolveTenantContext();

  let org;
  try {
    org = await getOrganizationBySlugForStaff(ctx, orgSlug);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  const programs = await listProgramsForOrg(ctx, orgSlug);

  return (
    <div className="mx-auto max-w-[1040px] px-5 py-12 md:px-8">
      <nav className="font-sans text-[0.82rem] text-ink-soft">
        <Link href="/staff/organizations" className="hover:text-ink">
          Organizations
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-muted">{org.name}</span>
      </nav>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-sans text-h2 text-ink">{org.name}</h1>
          <p className="mt-2 font-mono text-[0.72rem] text-ink-soft">{org.slug}</p>
        </div>
        <Link
          href={`/staff/organizations/${orgSlug}/programs/new`}
          className="rounded-sm bg-accent px-5 py-2.5 font-sans text-[0.92rem] font-medium text-accent-on hover:bg-accent-deep"
        >
          New program
        </Link>
      </div>

      <ul className="mt-12 border-t border-ink/20">
        {programs.length === 0 ? (
          <li className="border-b border-ink/15 py-10 font-body text-body-sm text-ink-muted">
            No programs yet. Create the first program for this organization.
          </li>
        ) : (
          programs.map((program) => (
            <li key={program.slug} className="border-b border-ink/15">
              <Link
                href={`/staff/organizations/${orgSlug}/programs/${program.slug}`}
                className="block py-8 transition-colors hover:bg-paper-deep/60"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <div>
                    <h2 className="font-sans text-[1.1rem] font-semibold text-ink">
                      {program.title}
                    </h2>
                    <p className="mt-1 font-mono text-[0.72rem] text-ink-soft">
                      {program.slug}
                    </p>
                  </div>
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-soft">
                    {program.hubStatus} · {program.lessonCount} lessons
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
