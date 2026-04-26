"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Check, Plus } from "lucide-react";
import { GradientCanvas } from "@/components/GradientCanvas";
import { RARITY_META, type Rarity } from "@/lib/data";

const RARITY_ORDER: Rarity[] = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
];
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface ProfileCardUser {
  handle: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  score: number;
  species: number;
  streakDays: number;
  unlockedRarities: Rarity[];
}

interface ProfileCardProps {
  user: ProfileCardUser;
  isSelf?: boolean;
  initiallyFollowing?: boolean;
  onFollowToggle?: (next: boolean) => void;
}

export function ProfileCard({
  user,
  isSelf = false,
  initiallyFollowing = false,
  onFollowToggle,
}: ProfileCardProps) {
  const [following, setFollowing] = useState(initiallyFollowing);

  const handleFollow = () => {
    const next = !following;
    setFollowing(next);
    onFollowToggle?.(next);
  };

  const initials = user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <motion.article
      initial={{ opacity: 0, y: 20, filter: "blur(12px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.9, ease: EASE }}
      className="relative w-full max-w-[420px] overflow-hidden rounded-[16px] border border-[color:var(--color-line)] bg-[color:var(--color-bone)] shadow-[0_10px_30px_rgba(24,36,18,0.08)]"
    >
      <div className="relative h-[180px] overflow-hidden">
        <GradientCanvas palette="forest" speed={0.000011} amplitude={90} />

        {!isSelf && (
          <button
            type="button"
            onClick={handleFollow}
            className={`absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[0.72rem] font-medium tracking-[0.14em] backdrop-blur-md transition-all duration-300 ${
              following
                ? "border-white/60 bg-white/12 text-white hover:bg-white/20"
                : "border-white/50 bg-white/92 text-[color:var(--color-navy)] hover:bg-white"
            }`}
          >
            {following ? (
              <>
                <Check size={12} strokeWidth={2.2} />
                <span>Following</span>
              </>
            ) : (
              <>
                <Plus size={12} strokeWidth={2.2} />
                <span>Follow</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="relative px-6">
        <div className="absolute -top-[52px] left-6">
          <div className="h-[104px] w-[104px] overflow-hidden rounded-full border-4 border-[color:var(--color-bone)] bg-[color:var(--color-paper)] shadow-[0_6px_20px_rgba(24,36,18,0.12)]">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[color:var(--color-forest)] to-[color:var(--color-navy)]">
                <span className="font-display text-[2rem] leading-none tracking-[-0.03em] text-[color:var(--color-cream)]">
                  {initials}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-5">
          <RarityLadder unlocked={user.unlockedRarities} />
        </div>
      </div>

      <div className="px-6 pt-10">
        <h2 className="font-display text-[2rem] leading-none tracking-[-0.04em] text-[color:var(--color-navy)]">
          {user.name}
        </h2>
        <p className="mt-2 text-[0.78rem] uppercase tracking-[0.18em] text-[color:var(--color-text-faint)]">
          {user.handle}
        </p>
        {user.bio ? (
          <p className="mt-4 text-[0.95rem] leading-[1.55] text-[color:var(--color-text-soft)]">
            {user.bio}
          </p>
        ) : null}
      </div>

      <div className="mt-6 grid grid-cols-3 border-t border-[color:var(--color-line)]">
        <Stat label="Score" value={user.score.toLocaleString()} />
        <Stat label="Species" value={user.species} divider />
        <Stat label="Streak" value={`${user.streakDays}d`} divider />
      </div>

      <Link
        href={`/profile/${user.handle.replace(/^@/, "")}/field`}
        className="group flex items-center justify-between border-t border-[color:var(--color-line)] px-6 py-4 text-[0.75rem] uppercase tracking-[0.16em] text-[color:var(--color-navy)] transition-colors hover:bg-[color:var(--color-paper)]/50"
      >
        <span>View their field</span>
        <ArrowUpRight
          size={14}
          strokeWidth={1.8}
          className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </Link>
    </motion.article>
  );
}

function Stat({
  label,
  value,
  divider = false,
}: {
  label: string;
  value: string | number;
  divider?: boolean;
}) {
  return (
    <div
      className={`px-4 py-4 text-center ${
        divider ? "border-l border-[color:var(--color-line)]" : ""
      }`}
    >
      <p className="font-display text-[1.5rem] leading-none tracking-[-0.03em] text-[color:var(--color-navy)]">
        {value}
      </p>
      <p className="mt-1.5 text-[0.65rem] uppercase tracking-[0.18em] text-[color:var(--color-text-faint)]">
        {label}
      </p>
    </div>
  );
}

function RarityLadder({ unlocked }: { unlocked: Rarity[] }) {
  const unlockedSet = new Set(unlocked);

  return (
    <div className="flex items-center gap-2">
      <span className="text-[0.6rem] uppercase tracking-[0.22em] text-white/78">
        rarity
      </span>
      <div className="flex items-center gap-1">
        {RARITY_ORDER.map((tier) => {
          const isUnlocked = unlockedSet.has(tier);
          const tone = RARITY_META[tier].tone;
          return (
            <span
              key={tier}
              title={RARITY_META[tier].label}
              className="block h-[5px] w-[22px] rounded-full transition-all duration-300"
              style={{
                background: isUnlocked ? tone : "rgba(255,255,255,0.26)",
                boxShadow: isUnlocked ? `0 0 8px ${tone}55` : undefined,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
