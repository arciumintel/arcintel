"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import PortalNav from "./PortalNav";
import PortalTopBar from "./PortalTopBar";
import { SpineProvider, useSpine } from "./SpineContext";

const EASE = "cubic-bezier(0.22,1,0.36,1)";

function ShellInner({ children }: { children: ReactNode }) {
  const { collapsed } = useSpine();
  const pathname = usePathname();

  if (pathname.startsWith("/staff")) {
    return <>{children}</>;
  }

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      <PortalNav />
      <div
        className="relative isolate z-0 flex min-h-screen flex-1 flex-row"
        data-portal-layout
        style={{
          marginLeft: "var(--spine-ml, 0px)",
          transition: `margin-left 320ms ${EASE}`,
        }}
      >
        <style>{`
          @media (min-width: 768px) {
            [data-portal-layout] { --spine-ml: ${collapsed ? "56px" : "260px"}; }
          }
        `}</style>

        <div className="flex min-w-0 flex-1 flex-col pb-24 md:pb-0">
          <PortalTopBar />
          <main
            id="main-content"
            className="relative z-0 w-full flex-1 overflow-x-clip"
            style={{
              paddingLeft: "clamp(20px, 4vw, 64px)",
              paddingRight: "clamp(20px, 4vw, 64px)",
              transition: `padding 320ms ${EASE}`,
            }}
          >
            <div
              key={pathname}
              className="mx-auto w-full page-enter"
              style={{ maxWidth: "1440px" }}
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default function PortalShell({ children }: { children: ReactNode }) {
  return (
    <SpineProvider>
      <ShellInner>{children}</ShellInner>
    </SpineProvider>
  );
}
