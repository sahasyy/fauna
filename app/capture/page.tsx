"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Camera, Check, MapPin, Upload, X } from "lucide-react";
import { RARITY_META } from "@/lib/data";
import type {
  IdentificationCandidate,
  IdentificationLocation,
  IdentificationResult,
  IdentificationStatus,
  CaptureSource,
} from "@/lib/identification/types";

type Phase =
  | "requesting"
  | "denied"
  | "live"
  | "identifying"
  | IdentificationStatus;

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const MAX_CAPTURE_SIDE = 1280;
const JPEG_QUALITY = 0.82;

export default function CapturePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [phase, setPhase] = useState<Phase>("requesting");
  const [errorDetail, setErrorDetail] = useState("");
  const [frozenFrame, setFrozenFrame] = useState<string | null>(null);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [locationLabel, setLocationLabel] = useState("Location optional");

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera not supported on this browser.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {
            // Some browsers still wait for a user gesture.
          });
        }

        setPhase("live");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown camera error.";
        setErrorDetail(message);
        setPhase("denied");
      }
    };

    void start();

    return () => {
      cancelled = true;
      abortRef.current?.abort();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  const identifyBlob = async (
    image: Blob,
    previewUrl: string,
    source: CaptureSource,
  ) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const capturedAt = new Date().toISOString();
    setFrozenFrame(previewUrl);
    setResult(null);
    setPhase("identifying");
    setLocationLabel("Checking location");

    const location = await getApproximateLocation();
    setLocationLabel(location ? "Location attached" : "Location optional");

    const formData = new FormData();
    formData.append("image", image, "fauna-capture.jpg");
    formData.append("capturedAt", capturedAt);
    formData.append("source", source);

    if (location) {
      formData.append("latitude", String(location.latitude));
      formData.append("longitude", String(location.longitude));
      if (location.accuracy !== undefined) {
        formData.append("accuracy", String(location.accuracy));
      }
    }

    try {
      const response = await fetch("/api/identify", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      const payload = (await response.json()) as IdentificationResult;

      setResult(payload);
      setPhase(phaseFromResult(payload));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;

      const payload = clientErrorResult(
        "Identification could not reach the server.",
        error instanceof Error ? error.message : "Unknown network error.",
        capturedAt,
      );
      setResult(payload);
      setPhase("error");
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  };

  const handleShutter = async () => {
    if (phase !== "live") return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
      const payload = clientErrorResult(
        "The camera frame was not ready.",
        "Wait a moment for the camera preview to settle, then try again.",
      );
      setResult(payload);
      setPhase("error");
      return;
    }

    const previewUrl = drawVideoFrame(video, canvas);
    const blob = await canvasToBlob(canvas);

    if (!blob) {
      const payload = clientErrorResult(
        "The frame could not be prepared.",
        "Your browser could not convert the capture into an image.",
      );
      setResult(payload);
      setPhase("error");
      return;
    }

    await identifyBlob(blob, previewUrl, "live_camera");
  };

  const handleUpload = async (file: File) => {
    const previewUrl = await readFileAsDataUrl(file);
    await identifyBlob(file, previewUrl, "upload");
  };

  const handleReset = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setFrozenFrame(null);
    setResult(null);
    setLocationLabel("Location optional");
    setPhase(streamRef.current ? "live" : "denied");
  };

  return (
    <main className="fixed inset-0 overflow-hidden bg-black">
      <div className="absolute inset-0">
        {phase !== "denied" ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
            style={{
              opacity: frozenFrame ? 0 : 1,
              transition: "opacity 0.25s ease",
            }}
          />
        ) : null}

        {frozenFrame ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={frozenFrame}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, transparent 45%, rgba(10,16,12,0.55) 100%)",
          }}
        />

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 30% at 50% 84%, rgba(183, 228, 142, 0.28) 0%, rgba(183, 228, 142, 0.12) 36%, transparent 74%), radial-gradient(circle at 72% 22%, rgba(206, 232, 189, 0.16) 0%, transparent 34%)",
          }}
        />

        <canvas ref={canvasRef} className="hidden" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
        className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-5 md:p-7"
      >
        <Link
          href="/field"
          className="glass-chip inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.16em]"
        >
          <ArrowLeft size={14} strokeWidth={1.8} />
          <span>Field</span>
        </Link>

        <div className="glass-chip inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.16em]">
          <MapPin size={12} strokeWidth={1.8} />
          <span>{locationLabel}</span>
        </div>
      </motion.div>

      <AnimatePresence>
        {phase === "live" ? (
          <motion.div
            key="hint"
            initial={{ opacity: 0, y: 20, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
            transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
            className="absolute left-1/2 top-[16%] z-10 w-[min(92%,420px)] -translate-x-1/2"
          >
            <div className="glass-card glass-card--subtle">
              <p className="glass-kicker">Hold steady</p>
              <h2 className="mt-2 font-display text-[1.9rem] font-light leading-[1.05] tracking-[-0.03em] text-[color:var(--color-navy)]">
                Frame the organism.
                <span className="block text-[color:var(--color-text-soft)] italic">
                  Clear beats close.
                </span>
              </h2>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {phase === "identifying" ? (
          <motion.div
            key="identifying"
            initial={{ opacity: 0, y: 30, filter: "blur(14px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="absolute left-1/2 top-1/2 z-10 w-[min(92%,460px)] -translate-x-1/2 -translate-y-1/2"
          >
            <div className="glass-card glass-card--subtle text-center">
              <IdentifyingPulse />
              <p className="mt-5 glass-kicker">Identifying</p>
              <p className="mt-2 font-display text-[1.55rem] font-light leading-tight tracking-[-0.02em] text-[color:var(--color-navy)]">
                Checking shape, context, and taxonomy...
              </p>
            </div>
          </motion.div>
        ) : null}

        {phase === "identified" && result ? (
          <IdentifiedCard result={result} onReset={handleReset} />
        ) : null}

        {phase === "uncertain" && result ? (
          <UncertainCard result={result} onReset={handleReset} />
        ) : null}

        {phase === "not_wild_organism" && result ? (
          <NotWildCard result={result} onReset={handleReset} />
        ) : null}

        {phase === "error" && result ? (
          <ErrorCard result={result} onReset={handleReset} />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "live" ? (
          <motion.div
            key="shutter"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="absolute inset-x-0 bottom-[6%] z-10 flex justify-center"
          >
            <button
              onClick={handleShutter}
              aria-label="Capture"
              className="shutter group"
            >
              <span className="shutter__inner" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {phase === "requesting" ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="glass-card w-[min(88%,380px)] text-center">
            <IdentifyingPulse />
            <p className="mt-5 glass-kicker">Opening the camera</p>
            <p className="mt-2 text-sm text-white/75">
              Allow camera access when your browser asks.
            </p>
          </div>
        </div>
      ) : null}

      {phase === "denied" ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[color:var(--color-bone)] p-6">
          <div className="max-w-[440px] text-center">
            <Camera
              size={32}
              strokeWidth={1.3}
              className="mx-auto text-[color:var(--color-forest)]"
            />
            <h2 className="mt-6 font-display text-[2.2rem] font-light leading-[1.05] tracking-[-0.03em] text-[color:var(--color-navy)]">
              Camera unavailable.
            </h2>
            <p className="mt-4 text-[0.95rem] leading-[1.6] text-[color:var(--color-text-soft)]">
              {errorDetail ||
                "We couldn't open your camera. Check permissions in your browser, or upload a photo instead."}
            </p>

            <div className="mt-8 flex items-center justify-center gap-3">
              <label className="button-ghost cursor-pointer">
                <Upload size={14} strokeWidth={1.8} />
                <span>Upload instead</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  capture="environment"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    void handleUpload(file);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
              <Link href="/field" className="button-primary">
                Back to field
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function IdentifiedCard({
  result,
  onReset,
}: {
  result: IdentificationResult;
  onReset: () => void;
}) {
  const candidate = result.primaryCandidate;
  const rarity = candidate?.rarity;

  return (
    <ResultShell>
      <div className="glass-card__hero">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-white">
            <Check size={10} strokeWidth={2.4} />
            Identified
          </span>
          {rarity ? (
            <span className={`chip ${RARITY_META[rarity].chip}`}>
              {RARITY_META[rarity].label}
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-white/78">
              Review
            </span>
          )}
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <h2 className="font-display text-[3.1rem] font-light leading-[0.94] tracking-[-0.04em] text-white sm:text-[3.8rem]">
              {candidate?.commonName || "Organism found"}
            </h2>
            <p className="mt-2 text-sm italic text-white/68">
              {candidate?.scientificName || "Scientific name unavailable"}
            </p>
            {candidate ? (
              <p className="mt-3 text-sm text-white/72">
                {formatConfidence(candidate.confidence)} confidence
              </p>
            ) : null}
          </div>

          <div className="sm:text-right">
            <p
              className="glass-kicker"
              style={{ color: "rgba(200, 217, 111, 0.88)" }}
            >
              {result.scoringEligible ? "Earned" : "No score yet"}
            </p>
            <p className="mt-2 font-display text-[2.8rem] font-light leading-none tracking-[-0.04em] text-[color:var(--color-lime)]">
              {result.scoringEligible && candidate?.points
                ? `+${candidate.points}`
                : "--"}
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card__footer">
        <p className="max-w-[20rem] text-sm leading-6 text-[color:var(--color-text-soft)]">
          {result.reason}
        </p>

        <div className="flex items-center gap-3">
          <button onClick={onReset} className="glass-btn-ghost">
            Another
          </button>
          {candidate?.faunaSpeciesId ? (
            <Link
              href={`/species/${candidate.faunaSpeciesId}`}
              className="glass-btn-primary"
            >
              View species
            </Link>
          ) : null}
        </div>
      </div>
    </ResultShell>
  );
}

function UncertainCard({
  result,
  onReset,
}: {
  result: IdentificationResult;
  onReset: () => void;
}) {
  return (
    <ResultShell>
      <div className="glass-card__hero">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-white">
          <Camera size={10} strokeWidth={2.4} />
          Not sure
        </span>

        <h2 className="mt-6 font-display text-[2.25rem] font-light leading-[1.02] tracking-[-0.03em] text-white sm:text-[2.9rem]">
          I need a clearer shot.
        </h2>
        <p className="mt-4 max-w-[34rem] text-[0.95rem] leading-[1.6] text-white/78">
          {result.summary}
        </p>
        <CandidateList candidates={result.candidates} />
      </div>

      <div className="glass-card__footer">
        <p className="max-w-[20rem] text-sm leading-6 text-[color:var(--color-text-soft)]">
          No points awarded. Fauna only scores high-confidence species-level
          identifications.
        </p>

        <button onClick={onReset} className="glass-btn-primary">
          Try again
        </button>
      </div>
    </ResultShell>
  );
}

function NotWildCard({
  result,
  onReset,
}: {
  result: IdentificationResult;
  onReset: () => void;
}) {
  return (
    <ResultShell>
      <div className="glass-card__hero glass-card__hero--clay">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-white">
          <X size={10} strokeWidth={2.4} />
          Not scored
        </span>

        <h2 className="mt-6 font-display text-[2.2rem] font-light leading-[1.02] tracking-[-0.03em] text-white sm:text-[2.8rem]">
          This one does not count.
        </h2>
        <p className="mt-4 max-w-[34rem] text-[0.95rem] leading-[1.6] text-white/78">
          {result.summary}
        </p>
      </div>

      <div className="glass-card__footer">
        <p className="max-w-[20rem] text-sm leading-6 text-[color:var(--color-text-soft)]">
          {result.reason}
        </p>

        <button onClick={onReset} className="glass-btn-primary">
          Try again
        </button>
      </div>
    </ResultShell>
  );
}

function ErrorCard({
  result,
  onReset,
}: {
  result: IdentificationResult;
  onReset: () => void;
}) {
  return (
    <ResultShell>
      <div className="glass-card__hero glass-card__hero--clay">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-white">
          <X size={10} strokeWidth={2.4} />
          Needs setup
        </span>

        <h2 className="mt-6 font-display text-[2.2rem] font-light leading-[1.02] tracking-[-0.03em] text-white sm:text-[2.8rem]">
          {result.summary}
        </h2>
        <p className="mt-4 max-w-[34rem] text-[0.95rem] leading-[1.6] text-white/78">
          {result.reason}
        </p>
      </div>

      <div className="glass-card__footer">
        <p className="max-w-[20rem] text-sm leading-6 text-[color:var(--color-text-soft)]">
          Add the server key, restart the dev server, and the same camera flow
          will use the real model.
        </p>

        <button onClick={onReset} className="glass-btn-primary">
          Try again
        </button>
      </div>
    </ResultShell>
  );
}

function ResultShell({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, filter: "blur(18px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
      transition={{ duration: 0.9, ease: EASE }}
      className="absolute inset-x-0 bottom-[11%] z-10 flex justify-center px-5"
    >
      <div className="glass-card glass-card--result w-[min(94%,560px)]">
        {children}
      </div>
    </motion.div>
  );
}

function CandidateList({
  candidates,
}: {
  candidates: IdentificationCandidate[];
}) {
  if (candidates.length === 0) return null;

  return (
    <ul className="mt-6 space-y-2 border-t border-white/14 pt-4">
      {candidates.slice(0, 3).map((candidate, index) => (
        <li
          key={`${candidate.scientificName}-${index}`}
          className="flex items-center justify-between gap-4 text-sm text-white/76"
        >
          <span>
            {candidate.commonName || candidate.scientificName}
            {candidate.rank !== "unknown" ? (
              <span className="text-white/46"> · {candidate.rank}</span>
            ) : null}
          </span>
          <span className="tabular-nums text-white/58">
            {formatConfidence(candidate.confidence)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function IdentifyingPulse() {
  return (
    <div className="relative mx-auto h-14 w-14">
      <motion.span
        className="absolute inset-0 rounded-full border border-[color:var(--color-lime)]"
        animate={{ scale: [1, 1.7, 1], opacity: [0.8, 0, 0.8] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.span
        className="absolute inset-0 rounded-full border border-[color:var(--color-lime)]"
        animate={{ scale: [1, 1.7, 1], opacity: [0.8, 0, 0.8] }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeOut",
          delay: 0.6,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center rounded-full border border-[color:var(--color-lime)]/50 bg-[color:var(--color-lime)]/10 shadow-[0_0_24px_rgba(200,217,111,0.2)]">
        <Camera
          size={20}
          strokeWidth={1.4}
          className="text-[color:var(--color-lime)]"
        />
      </div>
    </div>
  );
}

function drawVideoFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
): string {
  const scale = Math.min(
    1,
    MAX_CAPTURE_SIDE / Math.max(video.videoWidth, video.videoHeight),
  );
  const width = Math.round(video.videoWidth * scale);
  const height = Math.round(video.videoHeight * scale);
  const context = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;
  context?.drawImage(video, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function getApproximateLocation(): Promise<IdentificationLocation | undefined> {
  if (!navigator.geolocation) return Promise.resolve(undefined);

  return new Promise((resolve) => {
    let settled = false;
    const finish = (location?: IdentificationLocation) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      resolve(location);
    };

    const timeoutId = window.setTimeout(() => finish(), 2200);

    navigator.geolocation.getCurrentPosition(
      (position) =>
        finish({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }),
      () => finish(),
      {
        enableHighAccuracy: false,
        maximumAge: 5 * 60 * 1000,
        timeout: 2000,
      },
    );
  });
}

function phaseFromResult(result: IdentificationResult): Phase {
  return result.status;
}

function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

function clientErrorResult(
  summary: string,
  reason: string,
  capturedAt = new Date().toISOString(),
): IdentificationResult {
  return {
    status: "error",
    provider: "fauna",
    model: "client",
    summary,
    reason,
    capturedAt,
    candidates: [],
    externalCandidates: [],
    integrity: {
      source: "unknown",
      status: "review",
      score: 0,
      issues: [reason],
    },
    priors: [],
    signals: [],
    scoringEligible: false,
  };
}
