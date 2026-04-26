import type {
  IdentificationModelCandidate,
  IdentificationSignal,
  IdentifyImageInput,
  TaxonRank,
} from "@/lib/identification/types";

type HostedAnimalProvider = "speciesnet" | "bioclip";

interface HostedAnimalModelOptions {
  provider: HostedAnimalProvider;
  endpoint?: string;
  apiKey?: string;
  input: IdentifyImageInput;
}

type HostedAnimalModelResponse = {
  candidates?: {
    commonName?: string;
    common_name?: string;
    scientificName?: string;
    scientific_name?: string;
    rank?: string;
    confidence?: number;
    evidence?: string;
  }[];
  summary?: string;
};

const TIMEOUT_MS = 25_000;
const TAXON_RANKS: TaxonRank[] = [
  "species",
  "genus",
  "family",
  "order",
  "class",
  "unknown",
];

export async function queryHostedAnimalModel({
  provider,
  endpoint,
  apiKey,
  input,
}: HostedAnimalModelOptions): Promise<{
  candidates: IdentificationModelCandidate[];
  signal: IdentificationSignal;
}> {
  if (!endpoint) {
    return {
      candidates: [],
      signal: {
        provider,
        status: "skipped",
        summary:
          provider === "speciesnet"
            ? "SpeciesNet is free/open, but needs a hosted animal inference endpoint."
            : "BioCLIP is free/open, but needs a hosted animal verification endpoint.",
      },
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        imageDataUrl: input.imageDataUrl,
        mimeType: input.mimeType,
        capturedAt: input.capturedAt,
        location: input.location,
        priors: input.priors || [],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        candidates: [],
        signal: {
          provider,
          status: "error",
          summary: `${provider} endpoint returned status ${response.status}.`,
        },
      };
    }

    const payload = (await response.json()) as HostedAnimalModelResponse;
    const candidates = (payload.candidates || [])
      .map((candidate) => normalizeCandidate(provider, candidate))
      .filter(
        (candidate): candidate is IdentificationModelCandidate =>
          Boolean(candidate),
      )
      .slice(0, 5);

    return {
      candidates,
      signal: {
        provider,
        status: "used",
        summary:
          payload.summary ||
          `${provider} returned ${candidates.length} animal candidate${candidates.length === 1 ? "" : "s"}.`,
      },
    };
  } catch (error) {
    return {
      candidates: [],
      signal: {
        provider,
        status: "error",
        summary:
          error instanceof Error
            ? error.message
            : `${provider} endpoint request failed.`,
      },
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

function normalizeCandidate(
  provider: HostedAnimalProvider,
  candidate: NonNullable<HostedAnimalModelResponse["candidates"]>[number],
): IdentificationModelCandidate | undefined {
  const scientificName =
    candidate.scientificName || candidate.scientific_name || "";
  const commonName = candidate.commonName || candidate.common_name || "";
  const confidence = clamp(candidate.confidence ?? 0);

  if (!scientificName && !commonName) return undefined;

  return {
    provider,
    commonName,
    scientificName,
    rank: normalizeRank(candidate.rank),
    confidence,
    evidence: candidate.evidence || `${provider} hosted animal model`,
  };
}

function normalizeRank(rank: string | undefined): TaxonRank {
  if (rank && TAXON_RANKS.includes(rank as TaxonRank)) {
    return rank as TaxonRank;
  }

  return "unknown";
}

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}
