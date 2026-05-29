import { notFound } from "next/navigation";
import { Suspense } from "react";
import { resolveTenantContext } from "@/lib/tenant/context";
import { getStaffProgramOverview } from "@/lib/tenant/repositories/staff-programs";
import StaffProgramShell from "@/components/staff/StaffProgramShell";
import EditProgramDetailsForm from "@/components/staff/EditProgramDetailsForm";
import StaffFlashToast from "@/components/staff/StaffFlashToast";
import { NotFoundError } from "@/lib/errors";

type PageProps = {
  params: Promise<{ orgSlug: string; programSlug: string }>;
};

export default async function StaffProgramSettingsPage({ params }: PageProps) {
  const { orgSlug, programSlug } = await params;
  const ctx = await resolveTenantContext();

  let overview;
  try {
    overview = await getStaffProgramOverview(ctx, { orgSlug, programSlug });
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  return (
    <StaffProgramShell
      orgSlug={orgSlug}
      programSlug={programSlug}
      orgName={overview.orgName}
      programTitle={overview.title}
      active="settings"
    >
      <Suspense>
        <StaffFlashToast
          param="saved"
          title="Program updated"
          body="Your changes have been saved."
        />
      </Suspense>
      <EditProgramDetailsForm
        orgSlug={orgSlug}
        programSlug={programSlug}
        orgName={overview.orgName}
        title={overview.title}
        tagline={overview.tagline}
        hubStatus={overview.hubStatus}
      />
    </StaffProgramShell>
  );
}
