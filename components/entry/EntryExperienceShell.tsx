"use client";

import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { AuthScreen, type AuthMode } from "@/components/auth/AuthScreen";
import { GradientCanvas } from "@/components/GradientCanvas";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type EntryScene = "landing" | "login" | "signup";

function getScene(pathname: string): EntryScene {
  if (pathname === "/auth/signup") {
    return "signup";
  }

  if (pathname === "/auth/login" || pathname === "/auth") {
    return "login";
  }

  return "landing";
}

export function EntryExperienceShell({
  children,
}: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [preAuthTransition, setPreAuthTransition] = useState(false);
  const preAuthTimeoutRef = useRef<number | null>(null);
  const settleTimeoutRef = useRef<number | null>(null);
  const scene = useMemo(() => getScene(pathname), [pathname]);
  const isAuthScene = scene !== "landing";
  const visualAuthScene = isAuthScene || preAuthTransition;
  const authMode: AuthMode = scene === "signup" ? "signup" : "login";
  const leftPanelOverlay = visualAuthScene
    ? "bg-[linear-gradient(180deg,rgba(242,245,238,0.08),rgba(126,142,78,0.08))]"
    : "bg-[radial-gradient(circle_at_18%_20%,rgba(244,247,238,0.5),transparent_24%),radial-gradient(circle_at_58%_36%,rgba(123,141,95,0.26),transparent_34%),radial-gradient(circle_at_80%_34%,rgba(208,223,126,0.34),transparent_22%),radial-gradient(circle_at_64%_68%,rgba(244,247,236,0.46),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.04))]";

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    let stopped = false;

    const playAudio = async () => {
      try {
        audio.volume = 0.5;
        await audio.play();
      } catch {
        return;
      }
    };

    void playAudio();

    const retryPlayback = () => {
      if (stopped) {
        return;
      }

      void playAudio();
      window.removeEventListener("pointerdown", retryPlayback);
      window.removeEventListener("keydown", retryPlayback);
    };

    window.addEventListener("pointerdown", retryPlayback, { once: true });
    window.addEventListener("keydown", retryPlayback, { once: true });

    return () => {
      stopped = true;
      window.removeEventListener("pointerdown", retryPlayback);
      window.removeEventListener("keydown", retryPlayback);
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    if (settleTimeoutRef.current) {
      window.clearTimeout(settleTimeoutRef.current);
    }

    settleTimeoutRef.current = window.setTimeout(() => {
      setTransitioning(false);
      if (scene !== "landing") {
        setPreAuthTransition(false);
      }
    }, 820);

    return () => {
      if (settleTimeoutRef.current) {
        window.clearTimeout(settleTimeoutRef.current);
      }
    };
  }, [scene]);

  useEffect(() => {
    return () => {
      if (preAuthTimeoutRef.current) {
        window.clearTimeout(preAuthTimeoutRef.current);
      }
      if (settleTimeoutRef.current) {
        window.clearTimeout(settleTimeoutRef.current);
      }
    };
  }, []);

  const fadeOutAndStop = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio || audio.paused || audio.volume <= 0) {
      if (audio) {
        audio.pause();
      }

      return;
    }

    const duration = 900;
    const startedAt = performance.now();
    const startVolume = audio.volume;

    await new Promise<void>((resolve) => {
      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        audio.volume = startVolume * (1 - progress);

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = startVolume;
          resolve();
        }
      };

      requestAnimationFrame(tick);
    });
  }, []);

  const handleExplore = useCallback(() => {
    if (transitioning) {
      return;
    }

    setTransitioning(true);
    setPreAuthTransition(true);

    if (preAuthTimeoutRef.current) {
      window.clearTimeout(preAuthTimeoutRef.current);
    }

    preAuthTimeoutRef.current = window.setTimeout(() => {
      router.push("/auth/login");
    }, 320);
  }, [router, transitioning]);

  const handleAuthenticated = useCallback(
    async (redirectTo: string) => {
      if (transitioning) {
        return;
      }

      setTransitioning(true);
      await fadeOutAndStop();
      router.push(redirectTo);
    },
    [fadeOutAndStop, router, transitioning],
  );

  return (
    <>
      <audio
        ref={audioRef}
        src="/sahasaudio.mp3"
        autoPlay
        loop
        playsInline
        preload="auto"
        className="hidden"
      />

      <main className="fixed inset-0 overflow-hidden bg-white">
        <div className="absolute inset-[10px] overflow-hidden rounded-[6px] border border-white/60 md:inset-[14px]">
          <LayoutGroup id="entry-shell">
            <motion.div
              layout
              transition={{ duration: 0.8, ease: EASE }}
              className="relative flex h-full flex-col lg:flex-row"
            >
              <motion.section
                layout
                transition={{ duration: 1, ease: EASE }}
                className={`relative overflow-hidden ${
                  visualAuthScene
                    ? "h-[40%] min-h-[230px] w-full lg:h-full lg:w-1/2"
                    : "h-full w-full"
                }`}
              >
                <GradientCanvas palette="forest" speed={0.000011} amplitude={100} />
                <div className={`absolute inset-0 ${leftPanelOverlay}`} />
                {!visualAuthScene ? (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_54%,rgba(246,249,239,0.26),transparent_18%)]" />
                ) : null}

                <motion.div
                  layout
                  transition={{ duration: 1, ease: EASE }}
                  className={`relative z-10 flex h-full p-6 sm:p-8 lg:p-10 ${
                    visualAuthScene
                      ? "items-end justify-start"
                      : "items-center justify-center text-center"
                  }`}
                >
                  <motion.div
                    layout
                    transition={{ duration: 1, ease: EASE }}
                    className={`${
                      visualAuthScene
                        ? "max-w-[26rem] text-left"
                        : "mx-auto flex max-w-[42rem] -translate-y-[2vh] flex-col items-center text-center"
                    }`}
                  >
                    <motion.h1
                      layout
                      transition={{ duration: 1, ease: EASE }}
                      className={`wordmark-hero ${
                        visualAuthScene
                          ? "text-[clamp(4.4rem,8vw,8.4rem)]"
                          : "text-[clamp(6.8rem,13vw,11.5rem)]"
                      }`}
                    >
                      fauna
                    </motion.h1>
                    <motion.p
                      layout
                      transition={{ duration: 1, ease: EASE }}
                      className={`landing-line ${
                        visualAuthScene ? "max-w-[24rem]" : "mx-auto"
                      }`}
                    >
                      nature keeps its own ledger. this is yours.
                    </motion.p>

                    {!visualAuthScene ? (
                      <motion.div
                        layoutId="entry-auth-shell"
                        transition={{ duration: 1, ease: EASE }}
                        className="mt-10 rounded-[6px] border border-white/38 bg-[rgba(15,31,43,0.74)] shadow-[0_12px_28px_rgba(24,36,18,0.12)] backdrop-blur-md"
                      >
                        <button
                          type="button"
                          onClick={handleExplore}
                          disabled={transitioning}
                          className="cta-btn disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <span>explore now</span>
                          <span className="arrow">&rarr;</span>
                        </button>
                      </motion.div>
                    ) : null}
                  </motion.div>
                </motion.div>
              </motion.section>

              {visualAuthScene ? (
                <div className="relative z-20 flex flex-1 items-end px-4 pb-4 sm:px-6 sm:pb-6 lg:w-1/2 lg:items-stretch lg:px-8 lg:py-8">
                  <AnimatePresence initial={false} mode="popLayout">
                    <motion.div
                      layoutId="entry-auth-shell"
                      key={isAuthScene ? "auth-shell" : "auth-shell-placeholder"}
                      transition={{ duration: 1, ease: EASE }}
                      className="pointer-events-auto w-full lg:h-full"
                    >
                      <div className="h-full overflow-hidden rounded-[6px] border border-[#8a9760]/22 bg-[linear-gradient(180deg,rgba(249,251,244,0.94),rgba(236,242,229,0.9))] shadow-[0_8px_24px_rgba(45,60,31,0.08)]">
                        {isAuthScene ? (
                          <motion.div
                            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{
                              duration: 0.7,
                              delay: 0.12,
                              ease: EASE,
                            }}
                            className="h-full"
                          >
                            <AuthScreen
                              key={scene}
                              mode={authMode}
                              locked={transitioning}
                              onAuthenticated={handleAuthenticated}
                            />
                          </motion.div>
                        ) : (
                          <div className="flex h-full min-h-[520px] items-center justify-center bg-[linear-gradient(180deg,rgba(249,251,244,0.82),rgba(236,242,229,0.88))]">
                            <div className="h-[88%] w-[88%] rounded-[6px] border border-[#87945a]/14 bg-white/38 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              ) : null}
            </motion.div>
          </LayoutGroup>
        </div>
      </main>

      <div className="sr-only">{children}</div>
    </>
  );
}
