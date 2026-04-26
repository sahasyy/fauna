"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { getSpecies, ENTRIES, RARITY_META } from "@/lib/data";
import { reveal, stepDelay } from "@/lib/motion";

export default function SpeciesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const species = getSpecies(id);
  if (!species) notFound();

  const entries = ENTRIES.filter((entry) => entry.speciesId === id);
  const rarity = RARITY_META[species.rarity];

  return (
    <main className="relative min-h-screen pb-20 pt-24">
      <TopNav />

      <div className="page-shell pt-10">
        <motion.div {...reveal(0.04, 18, 8, 0.65)}>
          <Link
            href="/field"
            className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-text-faint)] hover:text-[color:var(--color-text)]"
          >
            <ArrowLeft size={14} strokeWidth={1.75} />
            Back to field
          </Link>
        </motion.div>

        <section className="mt-8 grid gap-6 lg:grid-cols-12">
          <motion.div
            {...reveal(0.08, 24, 12, 0.82)}
            className="lg:col-span-8"
          >
            <span className={`chip ${rarity.chip}`}>{rarity.label}</span>
            <h1 className="display-title mt-5 text-[color:var(--color-navy)]">
              {species.commonName}
            </h1>
            <p className="mt-4 text-lg italic text-[color:var(--color-text-faint)]">
              {species.scientificName}
            </p>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--color-text-soft)] md:text-lg">
              {species.note}
            </p>
          </motion.div>

          <motion.div
            {...reveal(0.14, 24, 12, 0.82)}
            className="panel-dark lg:col-span-4 p-6 md:p-7"
          >
            <p className="kicker text-[color:var(--color-cream-soft)]">
              Points per sighting
            </p>
            <p className="mt-4 font-display text-[5rem] leading-none tracking-[-0.06em] text-[color:var(--color-cream)]">
              +{species.points}
            </p>
            <div className="section-rule my-6 border-white/10" />
            <div className="grid grid-cols-2 gap-4">
              <Detail label="Window" value={species.observationWindow} inverted />
              <Detail label="Status" value={species.conservation} inverted />
              <Detail label="Sightings" value={`${entries.length}`} inverted />
              <Detail
                label="Tier"
                value={`${rarity.points[0]}–${rarity.points[1]}`}
                inverted
              />
            </div>
          </motion.div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-12">
          <motion.div
            {...reveal(0.18, 24, 12, 0.82)}
            className="panel lg:col-span-7 p-6 md:p-8"
          >
            <p className="kicker">Species dossier</p>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <Detail label="Habitat" value={species.habitat} />
              <Detail label="Range" value={species.region} />
              <Detail label="Observation window" value={species.observationWindow} />
              <Detail label="Conservation" value={species.conservation} />
            </div>
          </motion.div>

          <motion.div
            {...reveal(0.22, 24, 12, 0.82)}
            className="panel lg:col-span-5 p-6 md:p-8"
          >
            <p className="kicker">Fact bank</p>
            <div className="mt-5 space-y-4">
              {species.facts.map((fact) => (
                <div
                  key={fact}
                  className="rounded-[10px] border border-[color:var(--color-line)] bg-white/35 px-4 py-4 text-sm leading-7 text-[color:var(--color-text-soft)]"
                >
                  {fact}
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-12">
          <motion.div
            {...reveal(0.26, 24, 12, 0.82)}
            className="panel lg:col-span-8 overflow-hidden"
          >
            <div className="border-b border-[color:var(--color-line)] px-5 py-5 md:px-6">
              <p className="kicker">Your sightings of this species</p>
              <h2 className="mt-3 font-display text-[2.2rem] leading-none tracking-[-0.04em] text-[color:var(--color-navy)]">
                Observation log.
              </h2>
            </div>

            {entries.length > 0 ? (
              <ul className="px-5 md:px-6">
                {entries.map((entry, index) => (
                  <motion.li
                    key={entry.id}
                    {...reveal(stepDelay(index, 0.3, 0.08), 18, 8, 0.68)}
                    className="grid gap-4 border-t border-[color:var(--color-line)] py-5 md:grid-cols-[64px_1.4fr_1fr_110px]"
                  >
                    <span className="font-display text-[1.9rem] leading-none tracking-[-0.04em] text-[color:var(--color-text-faint)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-display text-[1.95rem] leading-none tracking-[-0.04em] text-[color:var(--color-navy)]">
                        {entry.locationLabel}
                      </p>
                    </div>
                    <p className="text-sm leading-7 text-[color:var(--color-text-soft)]">
                      {new Date(entry.capturedAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="font-display text-[2rem] leading-none tracking-[-0.04em] text-[color:var(--color-forest)] md:text-right">
                      +{species.points}
                    </p>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="px-5 py-8 text-sm leading-7 text-[color:var(--color-text-soft)] md:px-6">
                No sightings have been logged for this species yet.
              </div>
            )}
          </motion.div>

          <motion.div
            {...reveal(0.3, 24, 12, 0.82)}
            className="panel-dark lg:col-span-4 p-6 md:p-7"
          >
            <p className="kicker text-[color:var(--color-cream-soft)]">Later additions</p>
            <div className="mt-5 space-y-5 text-sm leading-7 text-[color:var(--color-cream-soft)]">
              <div>
                <p className="kicker text-[color:var(--color-cream-soft)]">Range map</p>
                <p className="mt-2">
                  Add a visual map layer so each species page can show likely habitats
                  and nearby verified sightings.
                </p>
              </div>
              <div>
                <p className="kicker text-[color:var(--color-cream-soft)]">Confidence</p>
                <p className="mt-2">
                  Surface model certainty once the CV pipeline is wired into the
                  capture page and backed by real image inputs.
                </p>
              </div>
              <div>
                <p className="kicker text-[color:var(--color-cream-soft)]">Fact rotation</p>
                <p className="mt-2">
                  Swap the static fact bank for one fresh note every time a new
                  sighting is accepted.
                </p>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}

function Detail({
  label,
  value,
  inverted = false,
}: {
  label: string;
  value: string;
  inverted?: boolean;
}) {
  return (
    <div>
      <p className={`kicker ${inverted ? "text-[color:var(--color-cream-soft)]" : ""}`}>
        {label}
      </p>
      <p
        className={`mt-2 font-display text-[1.9rem] leading-[0.95] tracking-[-0.04em] ${
          inverted ? "text-[color:var(--color-cream)]" : "text-[color:var(--color-navy)]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
