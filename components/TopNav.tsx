"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import { CURRENT_USER } from "@/lib/data";

const NAV_ITEMS = [
  { label: "Field", href: "/field" },
  { label: "Board", href: "/leaderboard" },
  { label: "Journal", href: "/journal" },
  { label: "Rules", href: "/rules" },
];

export function TopNav() {
  const pathname = usePathname();
  const initials =
    CURRENT_USER.handle.replace(/^@/, "").charAt(0).toUpperCase() || "Y";

  return (
    <motion.header
      initial={{ opacity: 0, y: -8, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-40 border-b border-[color:var(--color-line)] bg-[color:var(--color-bone)]/82 backdrop-blur-md"
    >
      <div className="page-shell flex h-16 items-center justify-between gap-8">
        <Link
          href="/field"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-70"
        >
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
            <circle
              cx="11"
              cy="11"
              r="10"
              stroke="currentColor"
              strokeWidth="1.1"
            />
            <path
              d="M6 13 Q 11 6, 16 13"
              stroke="currentColor"
              strokeWidth="1.1"
              fill="none"
            />
            <circle cx="11" cy="11" r="1.5" fill="currentColor" />
          </svg>
          <span className="font-display text-[1.15rem] tracking-[-0.02em] text-[color:var(--color-navy)]">
            fauna
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.16em] transition-colors"
                style={{
                  color: active
                    ? "var(--color-navy)"
                    : "var(--color-text-faint)",
                }}
              >
                {item.label}
                {active ? (
                  <motion.span
                    layoutId="nav-underline"
                    transition={{
                      duration: 0.45,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute inset-x-4 -bottom-0.5 h-px bg-[color:var(--color-navy)]"
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/capture"
            className="group inline-flex items-center gap-2 rounded-full bg-[color:var(--color-forest)] px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-[color:var(--color-cream)] shadow-[0_4px_14px_rgba(66,92,60,0.28)] transition-all hover:bg-[color:var(--color-navy)] hover:shadow-[0_6px_18px_rgba(28,42,58,0.32)]"
          >
            <Camera
              size={14}
              strokeWidth={1.8}
              className="transition-transform duration-300 group-hover:scale-110"
            />
            <span className="hidden sm:inline">Capture</span>
          </Link>

          <Link
            href="/profile/me"
            aria-label="Your profile"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-paper)] transition-all hover:border-[color:var(--color-forest)]/40 hover:scale-105"
          >
            <span className="text-[0.72rem] font-medium tracking-[0.04em] text-[color:var(--color-navy)]">
              {initials}
            </span>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
