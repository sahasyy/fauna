"use client";

import { motion } from "framer-motion";
import { TopNav } from "@/components/TopNav";
import { FRIENDS, CURRENT_USER } from "@/lib/data";
import { reveal, stepDelay } from "@/lib/motion";

export default function LeaderboardPage() {
  const ranked = [...FRIENDS].sort((a, b) => b.score - a.score);
  const yourRank = ranked.findIndex((f) => f.id === CURRENT_USER.id) + 1;
  const nextAbove = ranked[yourRank - 2];
  const gapToNext = nextAbove ? nextAbove.score - CURRENT_USER.score : 0;
  const topThree = ranked.slice(0, 3);

  return (
    <main className="relative min-h-screen pb-20 pt-24">
      <TopNav />

      <div className="page-shell pt-10">
        <motion.section
          {...reveal(0.06, 24, 12, 0.82)}
          className="grid gap-6 lg:grid-cols-12"
        >
          <div className="lg:col-span-8">
            <p className="kicker">Leaderboard · Earth Day season</p>
            <h1 className="display-title mt-4 text-[color:var(--color-navy)]">
              Compete by noticing
              <span className="block text-[color:var(--color-forest)]">
                what most people miss.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--color-text-soft)] md:text-lg">
              The competitive layer stays intentionally private and low-drama.
              Rare animals swing the score, but the real habit is paying closer
              attention to the living world around you.
            </p>
          </div>

          <div className="panel-dark lg:col-span-4 p-6 md:p-7">
            <p className="kicker text-[color:var(--color-cream-soft)]">
              Your standing
            </p>
            <div className="mt-5 grid grid-cols-2 gap-5">
              <div>
                <p className="kicker text-[color:var(--color-cream-soft)]">Rank</p>
                <p className="mt-2 font-display text-[3rem] leading-none tracking-[-0.04em] text-[color:var(--color-cream)]">
                  {String(yourRank).padStart(2, "0")}
                </p>
              </div>
              <div>
                <p className="kicker text-[color:var(--color-cream-soft)]">Gap to next</p>
                <p className="mt-2 font-display text-[3rem] leading-none tracking-[-0.04em] text-[color:var(--color-cream)]">
                  {gapToNext ? gapToNext : "—"}
                </p>
              </div>
            </div>
            <div className="section-rule my-6 border-white/10" />
            <p className="text-sm leading-7 text-[color:var(--color-cream-soft)]">
              You are chasing {nextAbove ? nextAbove.name : "the top spot"}.
              A single rare sighting could change the board quickly.
            </p>
          </div>
        </motion.section>

        <section className="mt-8 grid gap-6 lg:grid-cols-12">
          <motion.div
            {...reveal(0.12, 24, 12, 0.82)}
            className="panel lg:col-span-5 p-5 md:p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="kicker">Top three</p>
                <h2 className="mt-3 font-display text-[2.3rem] leading-none tracking-[-0.04em] text-[color:var(--color-navy)]">
                  Current leaders.
                </h2>
              </div>
              <p className="kicker">Private circle only</p>
            </div>

            <div className="mt-6 space-y-4">
              {topThree.map((friend, index) => {
                const isFirst = index === 0;

                return (
                  <div
                    key={friend.id}
                    className={`rounded-[10px] border px-4 py-5 ${
                      isFirst
                        ? "border-[color:var(--color-line-strong)] bg-[color:var(--color-paper)]"
                        : "border-[color:var(--color-line)] bg-white/35"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="kicker">Place {String(index + 1).padStart(2, "0")}</p>
                        <h3 className="mt-3 font-display text-[2rem] leading-none tracking-[-0.04em] text-[color:var(--color-navy)]">
                          {friend.name}
                        </h3>
                        <p className="mt-2 text-sm text-[color:var(--color-text-faint)]">
                          {friend.handle}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="kicker">Score</p>
                        <p className="mt-2 font-display text-[2.4rem] leading-none tracking-[-0.04em] text-[color:var(--color-forest)]">
                          {friend.score.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            {...reveal(0.16, 24, 12, 0.82)}
            className="panel lg:col-span-7 overflow-hidden"
          >
            <div className="flex flex-col gap-3 border-b border-[color:var(--color-line)] px-5 py-5 md:flex-row md:items-end md:justify-between md:px-6">
              <div>
                <p className="kicker">Full standings</p>
                <h2 className="mt-3 font-display text-[2.3rem] leading-none tracking-[-0.04em] text-[color:var(--color-navy)]">
                  Season board.
                </h2>
              </div>
              <p className="max-w-md text-sm leading-7 text-[color:var(--color-text-soft)]">
                Keeping this list readable matters more than spectacle. The game
                should feel social and motivating, not loud.
              </p>
            </div>

            <ul className="px-5 md:px-6">
              {ranked.map((friend, index) => {
                const isYou = friend.id === CURRENT_USER.id;

                return (
                  <motion.li
                    key={friend.id}
                    {...reveal(stepDelay(index, 0.22, 0.06), 18, 8, 0.66)}
                    className={`grid gap-4 border-t border-[color:var(--color-line)] py-5 md:grid-cols-[64px_1.4fr_110px_110px_140px] ${
                      isYou ? "bg-[rgba(185,214,85,0.12)]" : ""
                    }`}
                  >
                    <span className="font-display text-[2rem] leading-none tracking-[-0.04em] text-[color:var(--color-text-faint)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div>
                      <p className="font-display text-[2rem] leading-none tracking-[-0.04em] text-[color:var(--color-navy)]">
                        {friend.name}
                        {isYou ? (
                          <span className="ml-3 align-middle text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-forest)]">
                            You
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-2 text-sm text-[color:var(--color-text-faint)]">
                        {friend.handle}
                      </p>
                    </div>

                    <div>
                      <p className="kicker">Species</p>
                      <p className="mt-2 text-sm font-semibold text-[color:var(--color-text-soft)]">
                        {friend.species}
                      </p>
                    </div>

                    <div>
                      <p className="kicker">Streak</p>
                      <p className="mt-2 text-sm font-semibold text-[color:var(--color-text-soft)]">
                        {friend.streakDays}d
                      </p>
                    </div>

                    <div className="md:text-right">
                      <p className="kicker">Score</p>
                      <p className="mt-2 font-display text-[2.2rem] leading-none tracking-[-0.04em] text-[color:var(--color-forest)]">
                        {friend.score.toLocaleString()}
                      </p>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
