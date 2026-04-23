"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TopNav } from "@/components/TopNav";
import {
  CURRENT_USER,
  ENTRIES,
  FUN_FACT_ROTATION,
  RARITY_META,
  SPECIES,
  getSpecies,
} from "@/lib/data";
import { Camera, Leaf, MapPin } from "lucide-react";
import { reveal, stepDelay } from "@/lib/motion";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function DexPage() {
  const entries = ENTRIES
    .map((entry) => ({ entry, species: getSpecies(entry.speciesId)! }))
    .sort((a, b) => +new Date(b.entry.capturedAt) - +new Date(a.entry.capturedAt));

  const counts = SPECIES.reduce<Record<string, { captured: number; total: number }>>(
    (acc, species) => {
      acc[species.rarity] ??= { captured: 0, total: 0 };
      acc[species.rarity].total += 1;
      if (ENTRIES.some((entry) => entry.speciesId === species.id)) {
        acc[species.rarity].captured += 1;
      }
      return acc;
    },
    {}
  );

  const loggedRegions = new Set(entries.map(({ entry }) => entry.locationLabel)).size;
  const highlightedFact = entries[0]?.species.facts[0] ?? FUN_FACT_ROTATION[0];

  return (
    <main className="relative min-h-screen pb-20 pt-24">
      <TopNav />

      <div className="page-shell pt-10">
        <motion.section
          {...reveal(0.06, 26, 12, 0.82)}
          className="grid gap-6 lg:grid-cols-12"
        >
          <div className="lg:col-span-8">
            <p className="kicker">Field dex · {CURRENT_USER.handle}</p>
            <h1 className="display-title mt-4 text-[color:var(--color-navy)]">
              {entries.length} sightings
              <span className="block text-[color:var(--color-forest)]">
                logged this season.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--color-text-soft)] md:text-lg">
              This page is the heart of the first iteration: a personal record of
              what you have already seen, what rarity tiers you have cracked, and
              which habitats are shaping your score.
            </p>
          </div>

          <div className="panel lg:col-span-4 p-6 md:p-7">
            <p className="kicker">Season snapshot</p>
            <div className="mt-5 grid grid-cols-3 gap-4">
              <Stat label="Score" value={CURRENT_USER.score.toLocaleString()} />
              <Stat label="Species" value={CURRENT_USER.species} />
              <Stat label="Streak" value={`${CURRENT_USER.streakDays}d`} />
            </div>
            <div className="section-rule my-6" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="kicker">Logged places</p>
                <p className="mt-2 font-display text-[2.2rem] leading-none tracking-[-0.04em] text-[color:var(--color-forest)]">
                  {loggedRegions}
                </p>
              </div>
              <div>
                <p className="kicker">Most recent</p>
                <p className="mt-2 text-sm leading-7 text-[color:var(--color-text-soft)]">
                  {entries[0]?.entry.locationLabel}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <section className="mt-8 grid gap-6 lg:grid-cols-12">
          <motion.div
            {...reveal(0.12, 24, 12, 0.82)}
            className="panel lg:col-span-8 overflow-hidden"
          >
            <div className="flex flex-col gap-3 border-b border-[color:var(--color-line)] px-5 py-5 md:flex-row md:items-end md:justify-between md:px-6">
              <div>
                <p className="kicker">Recent captures</p>
                <h2 className="mt-3 font-display text-[2.3rem] leading-none tracking-[-0.04em] text-[color:var(--color-navy)]">
                  Your active journal.
                </h2>
              </div>
              <p className="max-w-md text-sm leading-7 text-[color:var(--color-text-soft)]">
                Each entry can later expand into notes, map traces, rotating facts,
                and model confidence. For now it proves the layout and the score loop.
              </p>
            </div>

            <ul className="px-5 md:px-6">
              {entries.map(({ entry, species }, index) => (
                <motion.li
                  key={entry.id}
                  {...reveal(stepDelay(index, 0.18, 0.08), 20, 10, 0.7)}
                >
                  <Link
                    href={`/species/${species.id}`}
                    className="grid gap-4 border-t border-[color:var(--color-line)] py-6 md:grid-cols-[64px_1.6fr_1fr_140px_112px]"
                  >
                    <span className="font-display text-[1.9rem] leading-none tracking-[-0.04em] text-[color:var(--color-text-faint)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div>
                      <h3 className="font-display text-[2.2rem] leading-none tracking-[-0.04em] text-[color:var(--color-navy)]">
                        {species.commonName}
                      </h3>
                      <p className="mt-2 text-xs italic text-[color:var(--color-text-faint)]">
                        {species.scientificName}
                      </p>
                    </div>

                    <div className="text-sm leading-7 text-[color:var(--color-text-soft)]">
                      <p className="kicker">Location</p>
                      <p className="mt-2">{entry.locationLabel}</p>
                    </div>

                    <div className="flex items-start md:justify-start">
                      <span className={`chip ${RARITY_META[species.rarity].chip}`}>
                        {RARITY_META[species.rarity].label}
                      </span>
                    </div>

                    <div className="md:text-right">
                      <p className="kicker">{formatDate(entry.capturedAt)}</p>
                      <p className="mt-2 font-display text-[2.2rem] leading-none tracking-[-0.04em] text-[color:var(--color-forest)]">
                        +{species.points}
                      </p>
                    </div>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <div className="space-y-6 lg:col-span-4">
            <motion.div
              {...reveal(0.16, 24, 12, 0.78)}
              className="panel p-5 md:p-6"
            >
              <p className="kicker">Rarity ladder</p>
              <div className="mt-5 space-y-4">
                {(["common", "uncommon", "rare", "epic", "legendary"] as const).map(
                  (rarity) => {
                    const current = counts[rarity] ?? { captured: 0, total: 0 };
                    const progress = current.total === 0 ? 0 : (current.captured / current.total) * 100;

                    return (
                      <div key={rarity}>
                        <div className="flex items-center justify-between gap-3">
                          <span className={`chip ${RARITY_META[rarity].chip}`}>
                            {RARITY_META[rarity].label}
                          </span>
                          <span className="text-sm font-semibold text-[color:var(--color-text-soft)]">
                            {current.captured}/{current.total}
                          </span>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-[color:var(--color-line)]">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${progress}%`,
                              backgroundColor: RARITY_META[rarity].tone,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </motion.div>

            <motion.div
              {...reveal(0.22, 24, 12, 0.78)}
              className="panel p-5 md:p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="kicker">Fact drop placeholder</p>
                <Leaf size={16} strokeWidth={1.8} className="text-[color:var(--color-forest)]" />
              </div>
              <p className="mt-4 font-display text-[2rem] leading-[0.98] tracking-[-0.04em] text-[color:var(--color-navy)]">
                Every catch can teach something.
              </p>
              <p className="mt-4 text-sm leading-7 text-[color:var(--color-text-soft)]">
                {highlightedFact}
              </p>
              <div className="section-rule my-5" />
              <div className="space-y-3">
                {FUN_FACT_ROTATION.map((fact) => (
                  <div
                    key={fact}
                    className="rounded-[10px] border border-[color:var(--color-line)] bg-white/35 px-4 py-4 text-sm leading-7 text-[color:var(--color-text-soft)]"
                  >
                    {fact}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              {...reveal(0.28, 24, 12, 0.78)}
              className="panel-dark p-5 md:p-6"
            >
              <p className="kicker text-[color:var(--color-cream-soft)]">
                Next action
              </p>
              <h2 className="mt-4 font-display text-[2.2rem] leading-none tracking-[-0.04em] text-[color:var(--color-cream)]">
                Keep the journal growing.
              </h2>
              <div className="mt-6 space-y-4 text-sm leading-7 text-[color:var(--color-cream-soft)]">
                <div className="flex items-start gap-3">
                  <MapPin size={16} strokeWidth={1.8} className="mt-1 shrink-0" />
                  <p>Later we can add map traces, habitat summaries, and local hot spots.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Camera size={16} strokeWidth={1.8} className="mt-1 shrink-0" />
                  <p>The capture flow already has room for CV confidence and camera-roll saves.</p>
                </div>
              </div>

              <Link href="/capture" className="button-primary mt-7 w-full">
                Log a new sighting
                <Camera size={14} strokeWidth={1.8} />
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="kicker">{label}</p>
      <p className="mt-2 font-display text-[2.3rem] leading-none tracking-[-0.04em] text-[color:var(--color-forest)]">
        {value}
      </p>
    </div>
  );
}
