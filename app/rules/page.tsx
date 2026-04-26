import Link from "next/link";
import { TopNav } from "@/components/TopNav";
import { CAPTURE_PIPELINE, MISSION_PILLARS, RARITY_META } from "@/lib/data";

const RARITY_ORDER = ["common", "uncommon", "rare", "epic", "legendary"] as const;

export default function RulesPage() {
  return (
    <main className="min-h-screen pb-24 pt-24">
      <TopNav />

      <div className="page-shell pt-14">
        <section className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="kicker">Rules</p>
            <h1 className="mt-5 font-display text-[clamp(2.5rem,5vw,4.5rem)] font-light leading-[0.98] tracking-[-0.035em] text-[color:var(--color-navy)]">
              How scoring works.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--color-text-soft)]">
              Fauna rewards attention in the wild. Real encounters count, rarity
              changes the score, and the point of the game is to notice more than
              you did yesterday.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="border-t border-[color:var(--color-line)] pt-4">
              <p className="kicker">Quick version</p>
              <p className="mt-4 text-sm leading-7 text-[color:var(--color-text-soft)]">
                Wild captures only. Rarer animals earn more. Verification matters.
                The leaderboard moves on the quality of what you saw, not how often
                you mash the button.
              </p>
            </div>
          </div>
        </section>

        <div className="section-rule mt-14" />

        <section className="mt-14 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="kicker">Core rules</p>
            <div className="mt-6 space-y-8">
              {MISSION_PILLARS.map((pillar) => (
                <div key={pillar.label} className="border-t border-[color:var(--color-line)] pt-6">
                  <p className="kicker">{pillar.label}</p>
                  <h2 className="mt-3 font-display text-[2rem] font-light leading-none tracking-[-0.03em] text-[color:var(--color-navy)]">
                    {pillar.title}
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-[color:var(--color-text-soft)]">
                    {pillar.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-5">
            <p className="kicker">Rarity points</p>
            <div className="mt-6 border-t border-[color:var(--color-line)]">
              {RARITY_ORDER.map((rarity) => (
                <div
                  key={rarity}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-[color:var(--color-line)] py-4"
                >
                  <div className="flex items-center gap-3">
                    <span className={`chip ${RARITY_META[rarity].chip}`}>
                      {RARITY_META[rarity].label}
                    </span>
                    <p className="text-sm text-[color:var(--color-text-soft)]">
                      Range
                    </p>
                  </div>
                  <p className="tabular-nums font-display text-[1.4rem] font-light leading-none tracking-[-0.03em] text-[color:var(--color-navy)]">
                    {RARITY_META[rarity].points[0]}-{RARITY_META[rarity].points[1]}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-xs leading-6 text-[color:var(--color-text-faint)]">
              Legendary sightings are rare by design. The rarity table is what keeps
              the board from becoming a volume contest.
            </p>
          </aside>
        </section>

        <div className="section-rule mt-16" />

        <section className="mt-14">
          <p className="kicker">Capture flow</p>
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {CAPTURE_PIPELINE.map((step) => (
              <div key={step.label} className="border-t border-[color:var(--color-line)] pt-5">
                <p className="kicker">{step.label}</p>
                <h2 className="mt-3 font-display text-[1.7rem] font-light leading-none tracking-[-0.03em] text-[color:var(--color-navy)]">
                  {step.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-[color:var(--color-text-soft)]">
                  {step.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Link
              href="/capture"
              className="inline-flex items-center gap-2 rounded-[10px] border border-[color:var(--color-line)] px-4 py-3 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[color:var(--color-navy)] transition-colors hover:border-[color:var(--color-forest)]/35 hover:bg-white/70"
            >
              Open capture
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
