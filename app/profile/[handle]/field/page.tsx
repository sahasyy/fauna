"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { TopNav } from "@/components/TopNav";
import { ENTRIES, FRIENDS, RARITY_META, getSpecies } from "@/lib/data";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function ProfileFieldPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = use(params);
  const user = FRIENDS.find((friend) => friend.handle.replace(/^@/, "") === handle);

  if (!user) notFound();

  const entries = ENTRIES
    .map((entry) => ({ entry, species: getSpecies(entry.speciesId)! }))
    .sort((a, b) => +new Date(b.entry.capturedAt) - +new Date(a.entry.capturedAt));

  return (
    <main className="min-h-screen pb-24 pt-24">
      <TopNav />

      <div className="page-shell pt-12">
        <Link
          href={`/profile/${handle}`}
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[color:var(--color-text-faint)] transition-colors hover:text-[color:var(--color-navy)]"
        >
          <ArrowLeft size={14} />
          Back to profile
        </Link>

        <motion.section
          initial={{ opacity: 0, y: 22, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 panel overflow-hidden"
        >
          <div className="border-b border-[color:var(--color-line)] px-6 py-6">
            <p className="kicker">{user.handle} · field</p>
            <h1 className="mt-3 font-display text-[clamp(2.2rem,4vw,3.6rem)] leading-none tracking-[-0.05em] text-[color:var(--color-navy)]">
              Their logged catches.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--color-text-soft)]">
              This is a demo readout for the profile flow. Later, each person will
              have their own real capture history, rarity spread, and map trace.
            </p>
          </div>

          <ul className="px-6">
            {entries.map(({ entry, species }, index) => (
              <li
                key={entry.id}
                className="grid gap-4 border-t border-[color:var(--color-line)] py-6 md:grid-cols-[52px_1.6fr_1fr_120px_100px]"
              >
                <span className="font-display text-[1.8rem] leading-none tracking-[-0.04em] text-[color:var(--color-text-faint)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="font-display text-[1.8rem] leading-none tracking-[-0.04em] text-[color:var(--color-navy)]">
                    {species.commonName}
                  </h2>
                  <p className="mt-2 text-xs italic text-[color:var(--color-text-faint)]">
                    {species.scientificName}
                  </p>
                </div>
                <p className="text-sm leading-7 text-[color:var(--color-text-soft)]">
                  {entry.locationLabel}
                </p>
                <span className={`chip ${RARITY_META[species.rarity].chip}`}>
                  {RARITY_META[species.rarity].label}
                </span>
                <div className="md:text-right">
                  <p className="kicker">{formatDate(entry.capturedAt)}</p>
                  <p className="mt-2 font-display text-[1.8rem] leading-none tracking-[-0.04em] text-[color:var(--color-forest)]">
                    +{species.points}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </motion.section>
      </div>
    </main>
  );
}
