"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { JOURNAL_ENTRIES } from "@/lib/journal";
import { TopNav } from "@/components/TopNav";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function JournalIndexPage() {
  return (
    <main className="journal-page relative min-h-screen pt-24">
      <div className="journal-grain" aria-hidden="true" />
      <TopNav />

      <div className="relative z-10 mx-auto max-w-[900px] px-6 py-12 md:py-20">
        <motion.header
          initial={{ opacity: 0, y: 20, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
          transition={{ duration: 1, ease: EASE }}
        >
          <p className="text-[0.72rem] uppercase tracking-[0.25em] text-[color:var(--color-text-faint)]">
            The journal
          </p>
          <h1 className="mt-5 font-display text-[clamp(3.25rem,7vw,5.75rem)] font-light leading-[0.95] tracking-[-0.04em] text-[color:var(--color-navy)]">
            Places, remembered.
          </h1>
          <p className="mt-6 max-w-xl text-[1rem] leading-[1.7] text-[color:var(--color-text-soft)]">
            Not every walk produces a catch. Some produce a feeling — and that's
            worth a page too.
          </p>
        </motion.header>

        <motion.ul
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
          className="mt-20"
        >
          {JOURNAL_ENTRIES.length > 0 ? (
            JOURNAL_ENTRIES.map((entry, index) => (
              <li key={entry.slug}>
                <Link
                  href={`/journal/${entry.slug}`}
                  className="group grid grid-cols-12 items-center gap-6 border-t border-[color:var(--color-line)] py-8 transition-colors"
                >
                  <span className="col-span-1 font-display text-[1.2rem] text-[color:var(--color-text-faint)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="col-span-8">
                    <h2 className="font-display text-[clamp(1.8rem,3vw,2.6rem)] font-light leading-none tracking-[-0.03em] text-[color:var(--color-navy)] transition-colors group-hover:text-[color:var(--color-forest)]">
                      {entry.place}
                    </h2>
                    <p className="mt-3 text-sm italic text-[color:var(--color-text-soft)]">
                      {entry.caption}
                    </p>
                  </div>
                  <p className="col-span-3 text-right text-[0.72rem] uppercase tracking-[0.2em] text-[color:var(--color-text-faint)]">
                    {entry.date}
                  </p>
                </Link>
              </li>
            ))
          ) : (
            <li className="panel px-6 py-10 text-center">
              <p className="font-display text-[2rem] leading-none tracking-[-0.04em] text-[color:var(--color-navy)]">
                The journal is empty for now.
              </p>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[color:var(--color-text-soft)]">
                We cleared the temporary sheep memory, so this section is blank
                until you decide what belongs here next.
              </p>
            </li>
          )}
        </motion.ul>
      </div>
    </main>
  );
}
