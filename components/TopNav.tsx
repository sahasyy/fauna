"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { SiteMark } from "@/components/SiteMark";
import { reveal } from "@/lib/motion";

const nav = [
  { label: "Home", href: "/" },
  { label: "Dex", href: "/dex" },
  { label: "Capture", href: "/capture" },
  { label: "Board", href: "/leaderboard" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <motion.header
      {...reveal(0.05, -14, 10, 0.75)}
      className="fixed inset-x-0 top-0 z-40"
    >
      <div className="page-shell pt-4">
        <div className="panel flex flex-wrap items-center justify-between gap-4 px-4 py-3 md:px-5">
          <Link href="/" className="shrink-0">
            <SiteMark detail="earth day build" />
          </Link>

          <nav className="flex flex-wrap items-center gap-1">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link ${active ? "nav-link-active" : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <p className="kicker hidden xl:block">Wild captures only</p>
        </div>
      </div>
    </motion.header>
  );
}
