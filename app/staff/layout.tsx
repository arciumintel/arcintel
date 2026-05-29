import { resolveTenantContext } from "@/lib/tenant/context";
import { requireStaffOrRedirect } from "@/lib/tenant/require-staff";
import StaffTopNav from "@/components/staff/StaffTopNav";

export const metadata = {
  title: "Staff Studio",
};

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await resolveTenantContext();
  requireStaffOrRedirect(ctx, "/staff/organizations");

  return (
    <div className="min-h-screen bg-background text-ink">
      <StaffTopNav />
      {children}
    </div>
  );
}
