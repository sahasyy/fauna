"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TopNav } from "@/components/TopNav";
import {
  CURRENT_USER,
  ENTRIES,
  RARITY_META,
  SPECIES,
  getSpecies,
} from "@/lib/data";
import { reveal } from "@/lib/motion";

function greeting(date: Date): string {
  const hour = date.getHours();
  if (hour < 5) return "Still out there";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Late walker";
}

function formatDateLong(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function firstName(handle: string): string {
  const raw = handle.replace(/^@/, "").split(/[._-]/)[0] || "Friend";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function useCountUp(target: number, duration = 900, delay = 0): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const startsAt = performance.now() + delay;

    const tick = (now: number) => {
      if (now < startsAt) {
        frame = requestAnimationFrame(tick);
        return;
      }

      const progress = Math.min((now - startsAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [delay, duration, target]);

  return value;
}

export default function FieldPage() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    setNow(new Date());
  }, []);

  const entries = ENTRIES
    .map((entry) => ({ entry, species: getSpecies(entry.speciesId)! }))
    .sort(
      (a, b) =>
        +new Date(b.entry.capturedAt) - +new Date(a.entry.capturedAt),
    );

  const latest = entries[0];
  const rest = entries.slice(1);
  const name = firstName(CURRENT_USER.handle);

  const counts = SPECIES.reduce<Record<string, { captured: number; total: number }>>(
    (acc, species) => {
      acc[species.rarity] ??= { captured: 0, total: 0 };
      acc[species.rarity].total += 1;
      if (ENTRIES.some((entry) => entry.speciesId === species.id)) {
        acc[species.rarity].captured += 1;
      }
      return acc;
    },
    {},
  );

  const scoreVal = useCountUp(CURRENT_USER.score, 1100, 200);
  const speciesVal = useCountUp(CURRENT_USER.species, 900, 300);
  const streakVal = useCountUp(CURRENT_USER.streakDays, 700, 400);

  return (
    <main className="relative min-h-screen pb-24 pt-24">
      <TopNav />

      <div className="page-shell pt-14">
        <motion.section
          {...reveal(0.02, 24, 14, 0.82)}
          className="grid items-end gap-10 lg:grid-cols-12"
        >
          <div className="lg:col-span-7">
            <p className="kicker">Field · {CURRENT_USER.handle}</p>
            <h1
              suppressHydrationWarning
              className="mt-5 font-display text-[clamp(2.5rem,5vw,4.5rem)] font-light leading-[0.98] tracking-[-0.035em] text-[color:var(--color-navy)]"
            >
              {greeting(now)}, {name}.
              <span className="block text-[color:var(--color-forest)]">
                {formatDateLong(now)}.
              </span>
            </h1>
          </div>

          <div className="flex gap-10 lg:col-span-5 lg:justify-end">
            <InlineStat label="Score" value={scoreVal.toLocaleString()} />
            <InlineStat label="Species" value={speciesVal} />
            <InlineStat label="Streak" value={`${streakVal}d`} />
          </div>
        </motion.section>

        <div className="section-rule mt-14" />

        {latest ? (
          <motion.section {...reveal(0.1, 28, 14, 0.82)} className="mt-14">
            <p className="kicker">Your latest catch</p>

            <Link
              href={`/species/${latest.species.id}`}
              className="group mt-5 grid items-end gap-8 rounded-[14px] border border-[color:var(--color-line)] bg-white/50 p-7 transition-all duration-500 hover:bg-white/75 hover:shadow-[0_12px_32px_rgba(24,36,18,0.08)] md:p-10 lg:grid-cols-12 lg:gap-12"
            >
              <div className="lg:col-span-8">
                <span className={`chip ${RARITY_META[latest.species.rarity].chip}`}>
                  {RARITY_META[latest.species.rarity].label}
                </span>
                <h2 className="mt-5 font-display text-[clamp(2.75rem,5.5vw,5rem)] font-light leading-[0.95] tracking-[-0.035em] text-[color:var(--color-navy)] transition-colors duration-500 group-hover:text-[color:var(--color-forest)]">
                  {latest.species.commonName}
                </h2>
                <p className="mt-3 text-sm italic text-[color:var(--color-text-faint)]">
                  {latest.species.scientificName}
                </p>
              </div>

              <div className="flex items-end justify-between gap-8 lg:col-span-4 lg:flex-col lg:items-end lg:gap-7">
                <div className="lg:text-right">
                  <p className="kicker">Where</p>
                  <p className="mt-2 text-base leading-7 text-[color:var(--color-text-soft)]">
                    {latest.entry.locationLabel}
                  </p>
                  <p className="mt-1 text-xs text-[color:var(--color-text-faint)]">
                    {formatDateShort(latest.entry.capturedAt)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="kicker">Earned</p>
                  <p className="mt-2 font-display text-[clamp(2.4rem,4vw,3.4rem)] font-light leading-none tracking-[-0.035em] text-[color:var(--color-forest)]">
                    +{latest.species.points}
                  </p>
                </div>
              </div>
            </Link>
          </motion.section>
        ) : null}

        <section className="mt-20 grid gap-12 lg:grid-cols-12">
          <motion.div
            {...reveal(0.18, 24, 14, 0.82)}
            className="lg:col-span-8"
          >
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="kicker">The field journal</p>
                <h2 className="mt-4 font-display text-[clamp(1.75rem,2.6vw,2.5rem)] font-light leading-none tracking-[-0.035em] text-[color:var(--color-navy)]">
                  Everything you&apos;ve logged.
                </h2>
              </div>
              <p className="hidden text-xs uppercase tracking-[0.2em] text-[color:var(--color-text-faint)] sm:block">
                {entries.length} total
              </p>
            </div>

            {rest.length > 0 ? (
              <ul className="mt-8">
                {rest.map(({ entry, species }, idx) => (
                  <li key={entry.id}>
                    <Link
                      href={`/species/${species.id}`}
                      className="group grid items-center gap-4 border-t border-[color:var(--color-line)] py-6 transition-colors md:grid-cols-[40px_1.6fr_1fr_110px_80px]"
                    >
                      <span className="font-display text-[1.25rem] font-light leading-none tracking-[-0.03em] text-[color:var(--color-text-faint)]">
                        {String(idx + 2).padStart(2, "0")}
                      </span>

                      <div>
                        <h3 className="font-display text-[1.65rem] font-light leading-none tracking-[-0.03em] text-[color:var(--color-navy)] transition-colors duration-300 group-hover:text-[color:var(--color-forest)]">
                          {species.commonName}
                        </h3>
                        <p className="mt-1.5 text-xs italic text-[color:var(--color-text-faint)]">
                          {species.scientificName}
                        </p>
                      </div>

                      <p className="text-sm text-[color:var(--color-text-soft)]">
                        {entry.locationLabel}
                      </p>

                      <div>
                        <span className={`chip ${RARITY_META[species.rarity].chip}`}>
                          {RARITY_META[species.rarity].label}
                        </span>
                      </div>

                      <div className="text-right">
                        <p className="kicker">{formatDateShort(entry.capturedAt)}</p>
                        <p className="mt-1 font-display text-[1.5rem] font-light leading-none tracking-[-0.03em] text-[color:var(--color-forest)]">
                          +{species.points}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-10 text-base leading-8 text-[color:var(--color-text-soft)]">
                Nothing else in the journal yet. Keep looking.
              </p>
            )}
          </motion.div>

          <motion.aside
            {...reveal(0.24, 20, 12, 0.78)}
            className="lg:col-span-4"
          >
            <p className="kicker">Rarity ladder</p>
            <h2 className="mt-4 font-display text-[clamp(1.5rem,2vw,2rem)] font-light leading-none tracking-[-0.03em] text-[color:var(--color-navy)]">
              Your progress.
            </h2>

            <div className="mt-8 space-y-5">
              {(["common", "uncommon", "rare", "epic", "legendary"] as const).map(
                (rarity) => {
                  const current = counts[rarity] ?? { captured: 0, total: 0 };
                  const progress =
                    current.total === 0 ? 0 : (current.captured / current.total) * 100;

                  return (
                    <div key={rarity}>
                      <div className="flex items-center justify-between gap-3">
                        <span className={`chip ${RARITY_META[rarity].chip}`}>
                          {RARITY_META[rarity].label}
                        </span>
                        <span className="tabular-nums text-xs font-medium text-[color:var(--color-text-soft)]">
                          {current.captured}
                          <span className="text-[color:var(--color-text-faint)]">
                            /{current.total}
                          </span>
                        </span>
                      </div>
                      <div className="mt-2.5 h-[3px] overflow-hidden rounded-full bg-[color:var(--color-line)]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{
                            duration: 0.9,
                            delay: 0.4,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: RARITY_META[rarity].tone }}
                        />
                      </div>
                    </div>
                  );
                },
              )}
            </div>

            <p className="mt-10 text-xs leading-6 text-[color:var(--color-text-faint)]">
              Rarity determines points. Legendary finds are the rarest and count
              the most - see{" "}
              <Link
                href="/rules"
                className="underline underline-offset-2 transition-colors hover:text-[color:var(--color-navy)]"
              >
                Rules
              </Link>
              .
            </p>
          </motion.aside>
        </section>
      </div>
    </main>
  );
}

function InlineStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <p className="kicker">{label}</p>
      <p className="tabular-nums mt-2 font-display text-[clamp(1.8rem,2.6vw,2.4rem)] font-light leading-none tracking-[-0.03em] text-[color:var(--color-navy)]">
        {value}
      </p>
    </div>
  );
}
