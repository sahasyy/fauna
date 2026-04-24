"use client";

import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AuthScreen, type AuthMode } from "@/components/auth/AuthScreen";
import { GradientCanvas } from "@/components/GradientCanvas";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const DEFAULT_REDIRECT = "/dex";

type EntryScene = "landing" | "login" | "signup";

function getScene(pathname: string): EntryScene {
  if (pathname === "/auth/signup") return "signup";
  if (pathname === "/auth/login" || pathname === "/auth") return "login";
  return "landing";
}

export function EntryExperienceShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isNavigating, setIsNavigating] = useState(false);
  const scene = useMemo(() => getScene(pathname), [pathname]);
  const isAuthScene = scene !== "landing";
  const authMode: AuthMode = scene === "signup" ? "signup" : "login";

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let stopped = false;
    const play = async () => {
      try {
        audio.volume = 0.5;
        await audio.play();
      } catch {
        // autoplay blocked — wait for first interaction
      }
    };
    void play();

    const retry = () => {
      if (stopped) return;
      void play();
      window.removeEventListener("pointerdown", retry);
      window.removeEventListener("keydown", retry);
    };
    window.addEventListener("pointerdown", retry, { once: true });
    window.addEventListener("keydown", retry, { once: true });

    return () => {
      stopped = true;
      window.removeEventListener("pointerdown", retry);
      window.removeEventListener("keydown", retry);
    };
  }, []);

  const fadeOutAudio = useCallback((duration = 1200): Promise<void> => {
    const audio = audioRef.current;
    if (!audio || audio.paused) return Promise.resolve();

    const startVolume = audio.volume;
    const startedAt = performance.now();

    return new Promise((resolve) => {
      const tick = (now: number) => {
        const p = Math.min((now - startedAt) / duration, 1);
        audio.volume = startVolume * (1 - p);
        if (p < 1) requestAnimationFrame(tick);
        else {
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
    if (isNavigating) return;
    setIsNavigating(true);
    router.push("/auth/login");
    setTimeout(() => setIsNavigating(false), 800);
  }, [router, isNavigating]);

  const handleAuthenticated = useCallback(
    async (redirectTo?: string) => {
      if (isNavigating) return;
      setIsNavigating(true);
      const destination = redirectTo || DEFAULT_REDIRECT;

      router.push(destination);
      await fadeOutAudio(1200);
    },
    [fadeOutAudio, router, isNavigating],
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
        <div className="entry-stage absolute inset-[10px] overflow-hidden rounded-[6px] border border-white/60 md:inset-[14px]">
          <div className="absolute inset-0">
            <GradientCanvas palette="forest" speed={0.000011} amplitude={100} />
          </div>

          <motion.section
            initial={false}
            animate={{ width: isAuthScene ? "50%" : "100%" }}
            transition={{ duration: 0.9, ease: EASE }}
            className="absolute inset-y-0 left-0 overflow-hidden"
          >
            <motion.div
              initial={false}
              animate={{ opacity: isAuthScene ? 0 : 1 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_52%_54%,rgba(246,249,239,0.26),transparent_18%)]"
            />

            <motion.div
              layout
              transition={{ duration: 0.9, ease: EASE }}
              className={`relative z-10 flex h-full p-6 sm:p-8 lg:p-10 ${
                isAuthScene
                  ? "items-end justify-start"
                  : "items-center justify-center text-center"
              }`}
            >
              <motion.div
                layout
                transition={{ duration: 0.9, ease: EASE }}
                className={
                  isAuthScene
                    ? "max-w-[26rem] text-left"
                    : "mx-auto flex max-w-[42rem] -translate-y-[2vh] flex-col items-center text-center"
                }
              >
                <motion.h1
                  layout
                  transition={{ duration: 0.9, ease: EASE }}
                  className={
                    isAuthScene
                      ? "wordmark-hero text-[clamp(4.4rem,8vw,8.4rem)]"
                      : "wordmark-hero"
                  }
                >
                  fauna
                </motion.h1>
                <motion.p
                  layout
                  transition={{ duration: 0.9, ease: EASE }}
                  className={`landing-line ${isAuthScene ? "max-w-[24rem]" : "mx-auto"}`}
                >
                  nature keeps its own ledger. this is yours.
                </motion.p>

                <AnimatePresence>
                  {!isAuthScene && (
                    <motion.div
                      key="explore-btn"
                      initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -6, filter: "blur(8px)" }}
                      transition={{ duration: 0.6, ease: EASE }}
                      className="mt-10"
                    >
                      <button
                        type="button"
                        onClick={handleExplore}
                        disabled={isNavigating}
                        className="cta-btn disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <span>explore now</span>
                        <span className="arrow">&rarr;</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </motion.section>

          <AnimatePresence>
            {isAuthScene && (
              <motion.section
                key="auth-panel"
                initial={{ x: "100%", opacity: 0, filter: "blur(12px)" }}
                animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ x: "100%", opacity: 0, filter: "blur(12px)" }}
                transition={{ duration: 0.85, ease: EASE, delay: 0.05 }}
                className="absolute inset-y-0 right-0 z-20 w-full p-4 sm:p-6 lg:w-1/2 lg:p-8"
              >
                <div className="auth-card h-full overflow-hidden rounded-[6px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={authMode}
                      initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
                      transition={{ duration: 0.45, ease: EASE }}
                      className="h-full"
                    >
                      <AuthScreen
                        mode={authMode}
                        locked={isNavigating}
                        onAuthenticated={handleAuthenticated}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </main>

      <div className="sr-only">{children}</div>
    </>
  );
}
