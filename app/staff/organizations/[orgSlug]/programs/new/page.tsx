import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { resolveTenantContext } from "@/lib/tenant/context";
import { getOrganizationBySlugForStaff } from "@/lib/tenant/repositories/staff-organizations";
import CreateProgramForm from "@/components/staff/CreateProgramForm";
import { NotFoundError } from "@/lib/errors";

type PageProps = {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ intakeId?: string; title?: string; slug?: string }>;
};

export default async function NewProgramPage({ params, searchParams }: PageProps) {
  const { orgSlug } = await params;
  const query = await searchParams;
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

  return (
    <div className="px-5 py-12 md:px-8">
      <nav className="mx-auto mb-8 max-w-[640px] font-sans text-[0.82rem] text-ink-soft">
        <Link href={`/staff/organizations/${orgSlug}`} className="hover:text-ink">
          {org.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-muted">New program</span>
      </nav>
      <Suspense>
        <CreateProgramForm
          orgSlug={org.slug}
          orgName={org.name}
          intakeId={query.intakeId}
          defaultTitle={query.title}
          defaultSlug={query.slug}
        />
      </Suspense>
    </div>
  );
}
