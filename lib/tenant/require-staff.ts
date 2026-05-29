import { redirect } from "next/navigation";
import type { TenantContext } from "@/lib/tenant/context";
import { ForbiddenError } from "@/lib/errors";

export type StaffContext = Extract<TenantContext, { kind: "staff" }>;

export function requireStaff(ctx: TenantContext): asserts ctx is StaffContext {
  if (ctx.kind !== "staff") {
    throw new ForbiddenError();
  }
}

export function requireStaffOrRedirect(ctx: TenantContext, loginNext: string) {
  if (ctx.kind !== "staff") {
    redirect(`/login?next=${encodeURIComponent(loginNext)}`);
  }
}
