"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { SiteMark } from "@/components/SiteMark";
import { reveal } from "@/lib/motion";

export default function NotFound() {
  return (
    <main className="relative min-h-screen pb-16 pt-6 md:pb-20 md:pt-8">
      <div className="page-shell">
        <motion.div
          {...reveal(0)}
          className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between"
        >
          <SiteMark detail="route not found" />
          <p className="max-w-sm text-sm leading-7 text-[color:var(--color-text-soft)]">
            That page is not part of the current Fauna prototype build, but the
            core routes are ready to explore.
          </p>
        </motion.div>

        <section className="mt-10 grid gap-6 lg:grid-cols-12">
          <motion.div
            {...reveal(0.1, 26, 12, 0.82)}
            className="panel lg:col-span-8 p-6 md:p-8"
          >
            <p className="kicker">404</p>
            <h1 className="display-title mt-4 text-[color:var(--color-navy)]">
              The trail ends here.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--color-text-soft)] md:text-lg">
              Head back to the landing page or jump into the field dex and capture
              flow. Those are the strongest parts of the first iteration.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/" className="button-primary">
                Return home
              </Link>
              <Link href="/dex" className="button-secondary">
                Open the dex
              </Link>
            </div>
          </motion.div>

          <motion.div
            {...reveal(0.16, 26, 12, 0.82)}
            className="panel-dark lg:col-span-4 p-6 md:p-7"
          >
            <p className="kicker text-[color:var(--color-cream-soft)]">Quick path</p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-cream)]"
            >
              <ArrowLeft size={14} strokeWidth={1.75} />
              Back to landing
            </Link>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
