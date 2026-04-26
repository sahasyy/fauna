"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { ProfileCard } from "@/components/ProfileCard";
import {
  ENTRIES,
  FRIENDS,
  RARITY_META,
  SPECIES,
  getSpecies,
  type Rarity,
} from "@/lib/data";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = use(params);
  const user = FRIENDS.find((friend) => friend.handle.replace(/^@/, "") === handle);

  if (!user) notFound();

  const unlockedRarities = Array.from(
    new Set<Rarity>(
      SPECIES.filter((species) =>
        ENTRIES.some((entry) => entry.speciesId === species.id),
      ).map((species) => species.rarity),
    ),
  );

  const recent = ENTRIES.slice(0, 3)
    .map((entry) => ({ entry, species: getSpecies(entry.speciesId)! }))
    .sort((a, b) => +new Date(b.entry.capturedAt) - +new Date(a.entry.capturedAt));

  return (
    <main className="min-h-screen pb-24 pt-24">
      <TopNav />

      <div className="page-shell pt-12">
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[color:var(--color-text-faint)] transition-colors hover:text-[color:var(--color-navy)]"
        >
          <ArrowLeft size={14} />
          Back to board
        </Link>

        <div className="mt-10 grid gap-10 lg:grid-cols-[420px_1fr] lg:gap-14">
          <ProfileCard
            user={{
              handle: user.handle,
              name: user.name,
              bio: "Tracks what most people walk past. Usually at dawn.",
              score: user.score,
              species: user.species,
              streakDays: user.streakDays,
              unlockedRarities,
            }}
          />

          <motion.section
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="kicker">Recent sightings</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,3vw,2.75rem)] leading-none tracking-[-0.04em] text-[color:var(--color-navy)]">
              Their latest few.
            </h2>

            <ul className="mt-8">
              {recent.map(({ entry, species }, idx) => (
                <li key={entry.id}>
                  <Link
                    href={`/species/${species.id}`}
                    className="group grid grid-cols-[48px_1.6fr_1fr_96px] items-center gap-4 border-t border-[color:var(--color-line)] py-6"
                  >
                    <span className="font-display text-[1.4rem] leading-none tracking-[-0.04em] text-[color:var(--color-text-faint)]">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-display text-[1.6rem] leading-none tracking-[-0.04em] text-[color:var(--color-navy)] transition-colors duration-300 group-hover:text-[color:var(--color-forest)]">
                        {species.commonName}
                      </h3>
                      <p className="mt-1.5 text-xs italic text-[color:var(--color-text-faint)]">
                        {species.scientificName}
                      </p>
                    </div>
                    <span className={`chip ${RARITY_META[species.rarity].chip}`}>
                      {RARITY_META[species.rarity].label}
                    </span>
                    <p className="text-right font-display text-[1.5rem] leading-none tracking-[-0.04em] text-[color:var(--color-forest)]">
                      +{species.points}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mt-8 text-sm leading-7 text-[color:var(--color-text-soft)]">
              Follow to get a nudge when they log something new.
            </p>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
