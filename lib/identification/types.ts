import type { Rarity } from "@/lib/data";

export type IdentificationStatus =
  | "identified"
  | "uncertain"
  | "not_wild_organism"
  | "error";

export type CaptureSource = "live_camera" | "upload" | "unknown";
export type IntegrityStatus = "passed" | "review" | "blocked";

export type TaxonRank =
  | "species"
  | "genus"
  | "family"
  | "order"
  | "class"
  | "unknown";

export interface IdentificationLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface IdentificationCandidate {
  commonName: string;
  scientificName: string;
  rank: TaxonRank;
  confidence: number;
  evidence: string;
  faunaSpeciesId?: string;
  rarity?: Rarity;
  points?: number;
  scoringEligible: boolean;
}

export interface IdentificationModelCandidate {
  provider: "speciesnet" | "bioclip";
  commonName: string;
  scientificName: string;
  rank: TaxonRank;
  confidence: number;
  evidence: string;
}

export interface IdentificationIntegrity {
  source: CaptureSource;
  status: IntegrityStatus;
  score: number;
  issues: string[];
}

export interface IdentificationPriorTaxon {
  provider: "inaturalist";
  taxonId: number;
  commonName: string;
  scientificName: string;
  rank: TaxonRank;
  iconicTaxonName?: string;
  observationCount: number;
}

export interface IdentificationSignal {
  provider:
    | "openai"
    | "inaturalist"
    | "bioclip"
    | "speciesnet"
    | "integrity";
  status: "used" | "skipped" | "error";
  summary: string;
}

export interface IdentificationResult {
  status: IdentificationStatus;
  provider: string;
  model: string;
  summary: string;
  reason: string;
  capturedAt: string;
  location?: IdentificationLocation;
  candidates: IdentificationCandidate[];
  externalCandidates: IdentificationModelCandidate[];
  primaryCandidate?: IdentificationCandidate;
  integrity: IdentificationIntegrity;
  priors: IdentificationPriorTaxon[];
  signals: IdentificationSignal[];
  scoringEligible: boolean;
}

export interface IdentifyImageInput {
  imageDataUrl: string;
  mimeType: string;
  sizeBytes: number;
  capturedAt: string;
  source: CaptureSource;
  location?: IdentificationLocation;
  priors?: IdentificationPriorTaxon[];
  signals?: IdentificationSignal[];
  externalCandidates?: IdentificationModelCandidate[];
}

export function createIdentificationError(
  summary: string,
  reason: string,
  capturedAt = new Date().toISOString(),
  source: CaptureSource = "unknown",
): IdentificationResult {
  return {
    status: "error",
    provider: "fauna",
    model: "none",
    summary,
    reason,
    capturedAt,
    candidates: [],
    externalCandidates: [],
    integrity: {
      source,
      status: "review",
      score: 0,
      issues: [reason],
    },
    priors: [],
    signals: [],
    scoringEligible: false,
  };
}
