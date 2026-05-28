"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Library,
  CircleUser,
  LogIn,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { useSpine } from "./SpineContext";

interface NavEntry {
  href: string;
  label: string;
  Icon: LucideIcon;
  match: (p: string) => boolean;
}

const HUB: NavEntry[] = [
  { href: "/", label: "Hub", Icon: House, match: (p) => p === "/" },
  {
    href: "/programs",
    label: "Programs",
    Icon: Library,
    match: (p) => p === "/programs" || p.startsWith("/programs/"),
  },
];

const ACCOUNT: NavEntry[] = [
  {
    href: "/account",
    label: "Account",
    Icon: CircleUser,
    match: (p) => p.startsWith("/account"),
  },
];

const EASE = "cubic-bezier(0.22,1,0.36,1)";

function NavLink({
  entry,
  collapsed,
}: {
  entry: NavEntry;
  collapsed: boolean;
}) {
  const pathname = usePathname() || "/";
  const active = entry.match(pathname);
  const Icon = entry.Icon;
  const colorCls = active ? "text-accent" : "text-ink-muted hover:text-accent";
  return (
    <Link
      href={entry.href}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? entry.label : undefined}
      title={collapsed ? entry.label : undefined}
      className={[
        "group/navlink relative block isolate font-sans text-[0.86rem] font-medium tracking-[-0.005em]",
        colorCls,
        collapsed ? "mx-auto h-10 w-10" : "mx-2 h-9 pl-5 pr-3",
      ].join(" ")}
      style={{
        transition: `color 220ms ${EASE}, padding 320ms ${EASE}, margin 320ms ${EASE}, width 320ms ${EASE}, height 320ms ${EASE}`,
      }}
    >
      <span
        aria-hidden
        className={[
          "absolute -z-10 bg-paper-deep",
          collapsed
            ? "left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full"
            : "inset-0 rounded-[2px]",
          active ? "opacity-80 scale-100" : "opacity-0 scale-95",
          "group-hover/navlink:opacity-100 group-hover/navlink:scale-100",
        ].join(" ")}
        style={{
          transition: `opacity 220ms ${EASE}, transform 320ms ${EASE}, background-color 220ms ${EASE}`,
        }}
      />
      {active ? (
        <span
          aria-hidden
          className="absolute left-1.5 top-1/2 -translate-y-1/2"
          style={{
            opacity: collapsed ? 0 : 1,
            transition: `opacity 240ms ${EASE}`,
            width: "2px",
            height: "16px",
            backgroundColor: "var(--accent-c, #C5462E)",
          }}
        />
      ) : null}
      <span
        className="flex h-full items-center transition-transform group-hover/navlink:translate-x-1"
        style={{
          opacity: collapsed ? 0 : 1,
          transform: collapsed ? "translateX(-6px)" : "translateX(0)",
          transition: `opacity 220ms ${EASE}, transform 280ms ${EASE}`,
          pointerEvents: collapsed ? "none" : "auto",
        }}
      >
        {entry.label}
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center group-hover/navlink:scale-110"
        style={{
          opacity: collapsed ? 1 : 0,
          transform: collapsed ? "scale(1)" : "scale(0.82)",
          transition: `opacity 220ms ${EASE} 60ms, transform 320ms ${EASE}, color 220ms ${EASE}`,
          color: active ? "var(--accent-c, #C5462E)" : undefined,
        }}
      >
        <Icon size={18} strokeWidth={1.6} />
      </span>
      {collapsed ? (
        <span
          aria-hidden
          className="pointer-events-none absolute left-full top-1/2 ml-4 -translate-y-1/2 -translate-x-1 whitespace-nowrap rounded-[2px] border border-ink bg-ink px-2.5 py-1 font-sans text-[0.72rem] font-medium text-paper-deep opacity-0 shadow-leaf group-hover/navlink:translate-x-0 group-hover/navlink:opacity-100"
          style={{
            transition: `opacity 200ms ${EASE} 80ms, transform 300ms ${EASE} 80ms`,
            zIndex: 60,
          }}
        >
          {entry.label}
        </span>
      ) : null}
    </Link>
  );
}

function SectionLabel({
  numeral,
  children,
  collapsed,
}: {
  numeral: string;
  children: React.ReactNode;
  collapsed: boolean;
}) {
  return (
    <p
      className={[
        "mb-2 flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-ink-soft",
        collapsed ? "justify-center px-0" : "pl-5",
      ].join(" ")}
    >
      <span className="text-accent num-tabular">{numeral}</span>
      <span
        style={{
          opacity: collapsed ? 0 : 1,
          transition: `opacity 220ms ${EASE}`,
          width: collapsed ? 0 : "auto",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </span>
      {!collapsed ? (
        <span aria-hidden className="ml-2 inline-block h-px w-5 self-center bg-ink/20" />
      ) : null}
    </p>
  );
}

export default function PortalNav() {
  const { collapsed, toggle } = useSpine();

  return (
    <nav
      className="fixed bottom-0 left-0 top-0 z-50 hidden flex-col border-r border-ink/15 bg-paper-shade md:flex"
      style={{ width: collapsed ? "56px" : "260px", transition: `width 320ms ${EASE}` }}
      aria-label="Primary"
    >
      <Link
        href="/"
        aria-label="Arcidex home"
        className="mt-8 mb-10 block"
        style={{
          paddingLeft: collapsed ? "0" : "1.4rem",
          paddingRight: collapsed ? "0" : "1.4rem",
          textAlign: collapsed ? "center" : "left",
          transition: `padding 320ms ${EASE}`,
        }}
      >
        <span
          className="inline-block font-sans leading-none text-ink"
          style={{
            fontWeight: 700,
            letterSpacing: "-0.03em",
            fontSize: collapsed ? "1.1rem" : "1.3rem",
            transition: `font-size 320ms ${EASE}`,
          }}
        >
          {collapsed ? (
            <span>a<span className="text-accent">.</span></span>
          ) : (
            <>arcidex<span className="text-accent">.</span></>
          )}
        </span>
      </Link>

      <div className="flex flex-1 flex-col">
        <div className="mb-7">
          <SectionLabel numeral="01" collapsed={collapsed}>The hub</SectionLabel>
          {HUB.map((entry) => (
            <NavLink key={entry.href} entry={entry} collapsed={collapsed} />
          ))}
        </div>

        <div>
          <SectionLabel numeral="02" collapsed={collapsed}>Account</SectionLabel>
          {ACCOUNT.map((entry) => (
            <NavLink key={entry.href} entry={entry} collapsed={collapsed} />
          ))}
          <NavLink
            entry={{ href: "/login", label: "Sign in", Icon: LogIn, match: () => false }}
            collapsed={collapsed}
          />
          <NavLink
            entry={{ href: "/register", label: "Create account", Icon: UserPlus, match: () => false }}
            collapsed={collapsed}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? "Expand spine" : "Collapse spine"}
        aria-expanded={!collapsed}
        className="group absolute right-0 top-1/2 z-10 flex h-9 w-4 -translate-y-1/2 translate-x-1/2 items-center justify-center bg-paper-shade text-ink-soft hover:bg-ink hover:text-paper-deep focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-0"
        style={{
          borderTop: "1px solid #1A1814",
          borderBottom: "1px solid #1A1814",
          borderRight: "1px solid #1A1814",
          borderLeft: "none",
          borderRadius: "0 2px 2px 0",
          transition: `color 200ms ${EASE}, background-color 200ms ${EASE}`,
        }}
      >
        <span
          aria-hidden
          className="block leading-none font-sans"
          style={{
            fontSize: "11px",
            fontWeight: 600,
            transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
            transition: `transform 320ms ${EASE}`,
          }}
        >
          ›
        </span>
      </button>
    </nav>
  );
}
