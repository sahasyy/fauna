"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopNav } from "@/components/TopNav";
import { Camera, Check, MapPin, X } from "lucide-react";
import Link from "next/link";
import { CAPTURE_PIPELINE, RARITY_META, getSpecies } from "@/lib/data";
import { reveal } from "@/lib/motion";

type State = "idle" | "scanning" | "identified" | "zoo";

export default function CapturePage() {
  const [state, setState] = useState<State>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewSpecies = getSpecies("sp-002");

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCapture = () => {
    setState("scanning");
    timeoutRef.current = setTimeout(() => {
      setState(Math.random() < 0.15 ? "zoo" : "identified");
    }, 2200);
  };

  if (!previewSpecies) return null;

  const statusCopy = {
    idle: {
      label: "Ready",
      title: "Point the camera at a wild animal.",
      body: "This is still a mocked screen, but the flow is already structured around the real product logic: frame, verify, score, then log.",
      statuses: [
        { label: "Geofence", value: "Waiting for location", okay: true },
        { label: "Photo save", value: "Queued for mobile build", okay: true },
        { label: "Fact drop", value: "Will appear after ID", okay: true },
      ],
    },
    scanning: {
      label: "Scanning",
      title: "Resolving species and place context.",
      body: "In the actual app, this slot will combine visual inference, location signals, and the zoo-check layer before the catch is accepted.",
      statuses: [
        { label: "Geofence", value: "Checking enclosure data", okay: true },
        { label: "Photo save", value: "Holding until verify", okay: true },
        { label: "Fact drop", value: "Selecting a species note", okay: true },
      ],
    },
    identified: {
      label: "Accepted",
      title: `${previewSpecies.commonName} added to the dex.`,
      body: previewSpecies.facts[0],
      statuses: [
        { label: "Geofence", value: "Wild capture confirmed", okay: true },
        { label: "Photo save", value: "Ready for camera roll later", okay: true },
        { label: "Fact drop", value: "Species fact unlocked", okay: true },
      ],
    },
    zoo: {
      label: "Journal only",
      title: "Enclosure detected. No score added.",
      body: "The animal can still be logged for memory, but the game stays fair by refusing points inside zoos, aquariums, and similar enclosures.",
      statuses: [
        { label: "Geofence", value: "Enclosure match found", okay: false },
        { label: "Photo save", value: "Still eligible later", okay: true },
        { label: "Fact drop", value: "Allowed, but no score", okay: true },
      ],
    },
  } as const;

  const activeState = statusCopy[state];

  return (
    <main className="relative min-h-screen pb-20 pt-24">
      <TopNav />

      <div className="page-shell pt-10">
        <motion.section
          {...reveal(0.06, 24, 12, 0.82)}
          className="grid gap-6 lg:grid-cols-12"
        >
          <div className="lg:col-span-7">
            <p className="kicker">Capture</p>
            <h1 className="display-title mt-4 text-[color:var(--color-navy)]">
              Frame the animal.
              <span className="block text-[color:var(--color-forest)]">
                Let the system do the rest.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--color-text-soft)] md:text-lg">
              This screen is intentionally mocked, but it already expresses the
              important promise: capture something real, validate that it belongs
              to the wild, and make the result feel rewarding.
            </p>
          </div>

          <div className="panel lg:col-span-5 p-6 md:p-7">
            <p className="kicker">Current state</p>
            <h2 className="section-title mt-4 text-[color:var(--color-navy)]">
              {activeState.title}
            </h2>
            <p className="mt-4 text-sm leading-7 text-[color:var(--color-text-soft)]">
              {activeState.body}
            </p>

            <div className="section-rule my-6" />

            <div className="space-y-4">
              {activeState.statuses.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4 rounded-[10px] border border-[color:var(--color-line)] bg-white/35 px-4 py-4"
                >
                  <div>
                    <p className="kicker">{item.label}</p>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--color-text-soft)]">
                      {item.value}
                    </p>
                  </div>
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-[10px] ${
                      item.okay
                        ? "bg-[color:var(--color-forest)] text-[color:var(--color-cream)]"
                        : "bg-[color:var(--color-clay)] text-[color:var(--color-cream)]"
                    }`}
                  >
                    {item.okay ? <Check size={16} strokeWidth={1.9} /> : <X size={16} strokeWidth={1.9} />}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <section className="mt-8 grid gap-6 lg:grid-cols-12">
          <motion.div
            {...reveal(0.12, 28, 14, 0.85)}
            className="panel lg:col-span-7 p-3 md:p-4"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[10px] md:aspect-[4/3]">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(54,84,68,0.95)_0%,rgba(16,38,58,0.98)_100%)]" />

              <svg
                className="absolute inset-0 h-full w-full opacity-50"
                preserveAspectRatio="xMidYMid slice"
                viewBox="0 0 900 620"
              >
                <defs>
                  <linearGradient id="capture-haze" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-lime)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--color-navy)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <rect width="900" height="620" fill="url(#capture-haze)" />
                {Array.from({ length: 22 }).map((_, index) => {
                  const x = index * 42;
                  const height = 120 + ((index * 37) % 90);

                  return (
                    <path
                      key={index}
                      d={`M ${x} 620 L ${x} ${620 - height} L ${x + 14} ${620 - height - 18} L ${x + 24} ${620 - height} L ${x + 24} 620 Z`}
                      fill="rgba(16,38,58,0.45)"
                    />
                  );
                })}
              </svg>

              <div className="absolute left-5 right-5 top-5 flex items-center justify-between text-[color:var(--color-cream)]">
                <div className="inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-cream-soft)]">
                  <MapPin size={13} strokeWidth={1.8} />
                  Trinity River Greenbelt
                </div>
                <div className="inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-cream-soft)]">
                  {activeState.label}
                </div>
              </div>

              <div className="absolute inset-6 border border-white/20">
                <span className="absolute left-0 top-0 h-8 w-8 border-l border-t border-[color:var(--color-lime)]" />
                <span className="absolute right-0 top-0 h-8 w-8 border-r border-t border-[color:var(--color-lime)]" />
                <span className="absolute bottom-0 left-0 h-8 w-8 border-b border-l border-[color:var(--color-lime)]" />
                <span className="absolute bottom-0 right-0 h-8 w-8 border-b border-r border-[color:var(--color-lime)]" />
              </div>

              <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-[color:var(--color-cream)]">
                <AnimatePresence mode="wait">
                  {state === "idle" ? (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, y: 20, filter: "blur(12px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -14, filter: "blur(8px)" }}
                      transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
                      className="flex flex-col items-center gap-5"
                    >
                      <button
                        type="button"
                        onClick={handleCapture}
                        className="flex h-24 w-24 items-center justify-center rounded-full border border-white/30 bg-white/8"
                      >
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--color-cream)] text-[color:var(--color-navy)]">
                          <Camera size={24} strokeWidth={1.8} />
                        </span>
                      </button>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-[color:var(--color-cream-soft)]">
                        Tap to capture
                      </p>
                    </motion.div>
                  ) : null}

                  {state === "scanning" ? (
                    <motion.div
                      key="scanning"
                      initial={{ opacity: 0, y: 20, filter: "blur(12px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -14, filter: "blur(8px)" }}
                      transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
                      className="flex flex-col items-center gap-5"
                    >
                      <div className="relative h-24 w-24">
                        <motion.div
                          className="absolute inset-0 rounded-full border border-[color:var(--color-lime)]"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.85, 0, 0.85] }}
                          transition={{ duration: 1.6, ease: "easeOut", repeat: Infinity }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-full border border-[color:var(--color-lime)]"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.85, 0, 0.85] }}
                          transition={{
                            duration: 1.6,
                            ease: "easeOut",
                            repeat: Infinity,
                            delay: 0.45,
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center rounded-full border border-[color:var(--color-lime)] bg-[color:var(--color-lime)]/12">
                          <Camera size={26} strokeWidth={1.8} className="text-[color:var(--color-lime)]" />
                        </div>
                      </div>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[color:var(--color-lime)]">
                        Identifying
                      </p>
                    </motion.div>
                  ) : null}

                  {state === "identified" ? (
                    <motion.div
                      key="identified"
                      initial={{ opacity: 0, y: 24, filter: "blur(14px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -18, filter: "blur(10px)" }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      className="max-w-lg"
                    >
                      <p className="kicker text-[color:var(--color-lime)]">Capture accepted</p>
                      <h2 className="mt-4 font-display text-[3.4rem] leading-none tracking-[-0.05em] md:text-[4.8rem]">
                        {previewSpecies.commonName}
                      </h2>
                      <p className="mt-3 italic text-sm text-[color:var(--color-cream-soft)]">
                        {previewSpecies.scientificName}
                      </p>
                      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                        <span className={`chip ${RARITY_META[previewSpecies.rarity].chip}`}>
                          {RARITY_META[previewSpecies.rarity].label}
                        </span>
                        <span className="font-display text-[2.3rem] leading-none tracking-[-0.04em]">
                          +{previewSpecies.points}
                        </span>
                      </div>
                    </motion.div>
                  ) : null}

                  {state === "zoo" ? (
                    <motion.div
                      key="zoo"
                      initial={{ opacity: 0, y: 24, filter: "blur(14px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -18, filter: "blur(10px)" }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      className="max-w-lg"
                    >
                      <p className="kicker text-[color:var(--color-cream-soft)]">
                        Journal only
                      </p>
                      <h2 className="mt-4 font-display text-[3rem] leading-[0.95] tracking-[-0.05em] md:text-[4.2rem]">
                        No points inside enclosures.
                      </h2>
                      <p className="mt-4 text-sm leading-7 text-[color:var(--color-cream-soft)]">
                        The animal still matters. The score just stays reserved for
                        wild encounters.
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-[color:var(--color-cream-soft)]">
                  Earth Day prototype
                </p>
                <div className="flex flex-wrap gap-3">
                  {state === "idle" || state === "zoo" ? (
                    <button
                      type="button"
                      onClick={handleCapture}
                      className="button-primary"
                    >
                      Capture
                    </button>
                  ) : null}

                  {state === "identified" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setState("idle")}
                        className="button-secondary bg-white/8 text-[color:var(--color-cream)]"
                      >
                        Capture another
                      </button>
                      <Link href="/species/sp-002" className="button-primary">
                        View species
                      </Link>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6 lg:col-span-5">
            <motion.div
              {...reveal(0.18, 24, 12, 0.82)}
              className="panel p-5 md:p-6"
            >
              <p className="kicker">Capture pipeline</p>
              <div className="mt-5 space-y-4">
                {CAPTURE_PIPELINE.map((step, index) => (
                  <div
                    key={step.label}
                    className="rounded-[10px] border border-[color:var(--color-line)] bg-white/35 px-4 py-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-forest)]">
                        {step.label}
                      </span>
                      <div>
                        <p className="font-semibold tracking-[-0.02em] text-[color:var(--color-navy)]">
                          {step.title}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-[color:var(--color-text-soft)]">
                          {step.body}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              {...reveal(0.24, 24, 12, 0.82)}
              className="panel-dark p-5 md:p-6"
            >
              <p className="kicker text-[color:var(--color-cream-soft)]">
                Why the zoo rule matters
              </p>
              <h2 className="mt-4 font-display text-[2.2rem] leading-none tracking-[-0.04em] text-[color:var(--color-cream)]">
                Fairness is part of the fun.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[color:var(--color-cream-soft)]">
                If enclosure sightings counted, the scoring economy would collapse.
                The wild-only rule keeps rarity meaningful and makes outdoor
                observation the real behavior the game rewards.
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}
