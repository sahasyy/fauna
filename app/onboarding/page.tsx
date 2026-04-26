"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Camera, MapPin, Trophy } from "lucide-react";
import { reveal } from "@/lib/motion";

const steps = [
  {
    icon: Camera,
    label: "Step one",
    title: "See it in the wild.",
    body: "When you notice a creature outside the built environment, open the app and capture it. The point is not just identification. The point is paying attention.",
    points: [
      "Use the camera as the main game action.",
      "Keep the first capture flow simple and fast.",
      "Make the result feel satisfying even before ML lands.",
    ],
  },
  {
    icon: MapPin,
    label: "Step two",
    title: "Reject enclosure points.",
    body: "Location awareness is part of the product fantasy. Zoos, aquariums, and sanctuaries can still be remembered, but they should never inflate the score.",
    points: [
      "Geofence or reverse-geocode later against zoo data.",
      "Save the sighting to a journal-only bucket when blocked.",
      "Make the refusal feel fair, not punishing.",
    ],
  },
  {
    icon: Trophy,
    label: "Step three",
    title: "Make rarity worth chasing.",
    body: "Once the sighting is real, score it by rarity and stack it into a private friends board. That creates the habit loop and the social reason to keep looking.",
    points: [
      "Common sightings keep momentum going.",
      "Rare sightings create actual swings on the leaderboard.",
      "Facts and seasonal streaks can deepen the reward later.",
    ],
  },
];

export default function OnboardingPage() {
  const [i, setI] = useState(0);
  const step = steps[i];
  const Icon = step.icon;
  const isLast = i === steps.length - 1;

  return (
    <main className="relative min-h-screen pb-16 pt-6 md:pb-20 md:pt-8">
      <div className="page-shell">
        <motion.div
          {...reveal(0)}
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-text-faint)] hover:text-[color:var(--color-text)]"
          >
            <ArrowLeft size={14} strokeWidth={1.75} />
            Back to home
          </Link>
          <p className="kicker">
            Step {String(i + 1).padStart(2, "0")} of {String(steps.length).padStart(2, "0")}
          </p>
        </motion.div>

        <section className="mt-8 grid gap-6 lg:grid-cols-12">
          <motion.aside
            {...reveal(0.08, 22, 10, 0.75)}
            className="panel lg:col-span-4 p-5 md:p-6"
          >
            <p className="kicker">How the game works</p>
            <div className="mt-5 space-y-2">
              {steps.map((item, index) => {
                const ActiveIcon = item.icon;
                const active = index === i;

                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setI(index)}
                    className={`flex w-full items-start gap-4 rounded-[10px] border px-4 py-4 text-left ${
                      active
                        ? "border-[color:var(--color-line-strong)] bg-[color:var(--color-paper)]"
                        : "border-transparent bg-transparent hover:border-[color:var(--color-line)] hover:bg-white/20"
                    }`}
                  >
                    <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-[10px] border border-[color:var(--color-line)] bg-white/40 text-[color:var(--color-navy)]">
                      <ActiveIcon size={18} strokeWidth={1.8} />
                    </span>
                    <span>
                      <span className="kicker">{item.label}</span>
                      <span className="mt-2 block font-display text-[1.75rem] leading-none tracking-[-0.04em] text-[color:var(--color-navy)]">
                        {item.title}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="section-rule my-6" />

            <p className="text-sm leading-7 text-[color:var(--color-text-soft)]">
              This first web pass stays intentionally minimal. It is here to lock
              the product story, the navigation, and the capture feel before we
              add database and model work.
            </p>
          </motion.aside>

          <motion.div
            {...reveal(0.14, 28, 12, 0.82)}
            className="panel lg:col-span-8 p-6 md:p-8"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 28, filter: "blur(14px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -16, filter: "blur(10px)" }}
                transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
                className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]"
              >
                <div>
                  <p className="kicker">{step.label}</p>
                  <h1 className="display-title mt-4 text-[color:var(--color-navy)]">
                    {step.title}
                  </h1>
                  <p className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--color-text-soft)] md:text-lg">
                    {step.body}
                  </p>

                  <div className="mt-8 grid gap-3">
                    {step.points.map((point, index) => (
                      <div
                        key={point}
                        className="flex items-start gap-3 rounded-[10px] border border-[color:var(--color-line)] bg-white/35 px-4 py-4"
                      >
                        <span className="mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-forest)]">
                          0{index + 1}
                        </span>
                        <p className="text-sm leading-7 text-[color:var(--color-text-soft)]">
                          {point}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[10px] border border-[color:var(--color-line)] bg-[color:var(--color-paper)] p-5 md:p-6">
                  <div className="flex items-center justify-between">
                    <p className="kicker">Preview panel</p>
                    <span className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-[color:var(--color-line)] bg-white/55 text-[color:var(--color-navy)]">
                      <Icon size={20} strokeWidth={1.8} />
                    </span>
                  </div>

                  <div className="mt-8 rounded-[10px] border border-dashed border-[color:var(--color-line-strong)] bg-white/55 p-5">
                    <p className="kicker">What this screen should communicate</p>
                    <h2 className="mt-3 font-display text-[2rem] leading-none tracking-[-0.04em] text-[color:var(--color-forest)]">
                      {step.title}
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-[color:var(--color-text-soft)]">
                      Strong clarity, minimal chrome, and one obvious next action.
                      The blur-up entry gives it a little ceremony without making
                      the UI feel noisy.
                    </p>
                  </div>

                  <div className="section-rule my-6" />

                  <div className="space-y-4">
                    <div>
                      <p className="kicker">Earth Day launch lens</p>
                      <p className="mt-2 text-sm leading-7 text-[color:var(--color-text-soft)]">
                        Keep the tone optimistic and grounded. The app is playful,
                        but it should still feel rooted in real creatures and real
                        places.
                      </p>
                    </div>
                    <div>
                      <p className="kicker">Later plug-ins</p>
                      <p className="mt-2 text-sm leading-7 text-[color:var(--color-text-soft)]">
                        Confidence scores, rotating facts, map traces, and camera
                        roll saves can all slot into this structure without
                        redesigning the page.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="section-rule my-8" />

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setI(index)}
                    aria-label={`Go to step ${index + 1}`}
                    className={`h-2 rounded-full ${
                      index === i ? "w-10 bg-[color:var(--color-navy)]" : "w-2 bg-[color:var(--color-line-strong)]"
                    }`}
                  />
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                {i > 0 ? (
                  <button
                    type="button"
                    onClick={() => setI(i - 1)}
                    className="button-secondary"
                  >
                    <ArrowLeft size={14} strokeWidth={1.75} />
                    Previous
                  </button>
                ) : null}

                {isLast ? (
                  <Link href="/field" className="button-primary">
                    Enter the field
                    <ArrowRight size={14} strokeWidth={1.75} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setI(i + 1)}
                    className="button-primary"
                  >
                    Continue
                    <ArrowRight size={14} strokeWidth={1.75} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </section>

        <motion.div
          {...reveal(0.18, 18, 8, 0.7)}
          className="flex justify-end pt-8"
        >
          <Link
            href="/field"
            className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-text-faint)] hover:text-[color:var(--color-text)]"
          >
            Skip to the field
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
