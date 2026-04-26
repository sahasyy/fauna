import { RARITY_META, SPECIES } from "@/lib/data";
import type {
  IdentificationCandidate,
  IdentificationIntegrity,
  IdentificationResult,
  IdentifyImageInput,
  TaxonRank,
} from "@/lib/identification/types";
import { createIdentificationError } from "@/lib/identification/types";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5.2";
const IDENTIFIED_THRESHOLD = 0.68;
const SCORING_THRESHOLD = 0.82;

const TAXON_RANKS: TaxonRank[] = [
  "species",
  "genus",
  "family",
  "order",
  "class",
  "unknown",
];

type OpenAIJson = {
  is_wild_organism: boolean;
  organism_type:
    | "animal"
    | "insect"
    | "arachnid"
    | "bird"
    | "reptile"
    | "amphibian"
    | "fish"
    | "mollusk"
    | "non_animal"
    | "other"
    | "none"
    | "unknown";
  overall_confidence: number;
  summary: string;
  media_integrity: {
    is_live_scene: boolean;
    spoof_risk: number;
    issues: string[];
    evidence: string;
  };
  candidates: {
    common_name: string;
    scientific_name: string;
    rank: TaxonRank;
    confidence: number;
    evidence: string;
  }[];
};

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "is_wild_organism",
    "organism_type",
    "overall_confidence",
    "summary",
    "media_integrity",
    "candidates",
  ],
  properties: {
    is_wild_organism: { type: "boolean" },
    organism_type: {
      type: "string",
      enum: [
        "animal",
        "insect",
        "arachnid",
        "bird",
        "reptile",
        "amphibian",
        "fish",
        "mollusk",
        "non_animal",
        "other",
        "none",
        "unknown",
      ],
    },
    overall_confidence: { type: "number" },
    summary: { type: "string" },
    media_integrity: {
      type: "object",
      additionalProperties: false,
      required: ["is_live_scene", "spoof_risk", "issues", "evidence"],
      properties: {
        is_live_scene: { type: "boolean" },
        spoof_risk: { type: "number" },
        issues: {
          type: "array",
          items: { type: "string" },
        },
        evidence: { type: "string" },
      },
    },
    candidates: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "common_name",
          "scientific_name",
          "rank",
          "confidence",
          "evidence",
        ],
        properties: {
          common_name: { type: "string" },
          scientific_name: { type: "string" },
          rank: {
            type: "string",
            enum: TAXON_RANKS,
          },
          confidence: { type: "number" },
          evidence: { type: "string" },
        },
      },
    },
  },
} as const;

export async function identifyWithOpenAI(
  input: IdentifyImageInput,
): Promise<IdentificationResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_IDENTIFICATION_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    return withInputContext(
      createIdentificationError(
        "Identification is not configured yet.",
        "Add OPENAI_API_KEY to .env.local, restart the dev server, and try again.",
        input.capturedAt,
        input.source,
      ),
      input,
    );
  }

  try {
    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: buildSystemPrompt(),
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: buildUserPrompt(input),
              },
              {
                type: "input_image",
                image_url: input.imageDataUrl,
                detail: "high",
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "fauna_identification",
            strict: true,
            schema: responseSchema,
          },
        },
        max_output_tokens: 1400,
      }),
    });

    const data: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      return withInputContext(
        createIdentificationError(
          "The identification model could not read this image.",
          getOpenAIErrorMessage(data, response.status),
          input.capturedAt,
          input.source,
        ),
        input,
      );
    }

    const outputText = extractOutputText(data);
    if (!outputText) {
      return withInputContext(
        createIdentificationError(
          "The identification model returned an empty result.",
          "No structured output text was found in the model response.",
          input.capturedAt,
          input.source,
        ),
        input,
      );
    }

    const parsed = JSON.parse(outputText) as OpenAIJson;
    return normalizeModelResult(parsed, input, model);
  } catch (error) {
    return withInputContext(
      createIdentificationError(
        "Something interrupted identification.",
        error instanceof Error ? error.message : "Unknown identification error.",
        input.capturedAt,
        input.source,
      ),
      input,
    );
  }
}

function buildSystemPrompt(): string {
  return [
    "You are Fauna's conservative field naturalist.",
    "Fauna is animal-only. Identify wild animals: mammals, birds, insects, arachnids, reptiles, amphibians, fish, mollusks, and other animal taxa.",
    "Do not identify plants, fungi, flowers, trees, leaves, mushrooms, or habitat as the subject. If the image contains only plants/fungi/habitat and no animal, set is_wild_organism=false, organism_type='non_animal', and return no scoring candidate.",
    "Do not treat humans, pets, livestock in obvious domestic settings, toys, statues, screens, drawings, taxidermy, food, scenery, or habitat-only photos as wild organisms.",
    "Before identifying, inspect media integrity. Block or flag photo-of-photo attempts: screens, monitor pixels, phone bezels, printed paper, framed photos, glare/reflections from a display, artificial cutouts, illustrations, museum dioramas, taxidermy, plush/toy animals, posters, or obvious enclosure signage.",
    "If the organism is blurry, partly hidden, too small, or missing diagnostic features, lower confidence and provide candidates instead of guessing.",
    "Prefer species-level only when the photo shows enough diagnostic detail. Otherwise use genus/family/order.",
    "Confidence must be conservative and calibrated from 0 to 1.",
    "Return JSON that matches the schema exactly.",
  ].join(" ");
}

function buildUserPrompt(input: IdentifyImageInput): string {
  const location = input.location
    ? `${input.location.latitude.toFixed(5)}, ${input.location.longitude.toFixed(5)} (accuracy ${Math.round(input.location.accuracy ?? 0)}m)`
    : "not provided";

  const trustedSpecies = SPECIES.map(
    (species) =>
      `- ${species.commonName} (${species.scientificName}), ${RARITY_META[species.rarity].label}, ${species.points} pts`,
  ).join("\n");
  const nearbySpecies = (input.priors || [])
    .slice(0, 20)
    .map(
      (prior) =>
        `- ${prior.commonName} (${prior.scientificName}), ${prior.iconicTaxonName || "unknown group"}, ${prior.observationCount} nearby observations`,
    )
    .join("\n");
  const externalCandidates = (input.externalCandidates || [])
    .slice(0, 10)
    .map(
      (candidate) =>
        `- ${candidate.provider}: ${candidate.commonName || candidate.scientificName} (${candidate.scientificName || "unknown scientific name"}), ${candidate.rank}, ${Math.round(candidate.confidence * 100)}%`,
    )
    .join("\n");

  return [
    `Captured at: ${input.capturedAt}`,
    `Capture source: ${input.source}`,
    `Location: ${location}`,
    "",
    "Known Fauna scoring species. This is not a closed universe, but exact matches can score if confidence is high:",
    trustedSpecies,
    "",
    nearbySpecies
      ? `Nearby iNaturalist animal species prior. Use this only as geographic context, never as proof:\n${nearbySpecies}`
      : "Nearby iNaturalist animal species prior: unavailable.",
    "",
    externalCandidates
      ? `Hosted animal model candidates. Species-level scoring should be conservative if these disagree:\n${externalCandidates}`
      : "Hosted animal model candidates: unavailable.",
    "",
    "Identify the main organism in the image. If multiple organisms are present, pick the most central/prominent organism and include alternatives in candidates.",
  ].join("\n");
}

function normalizeModelResult(
  parsed: OpenAIJson,
  input: IdentifyImageInput,
  model: string,
): IdentificationResult {
  const candidates = parsed.candidates
    .slice(0, 3)
    .map(normalizeCandidate)
    .filter((candidate) => candidate.commonName || candidate.scientificName);

  const primaryCandidate = candidates[0];
  const integrity = buildIntegrity(parsed, input);
  const isTargetAnimal = isAnimalType(parsed.organism_type);
  const isIdentified =
    parsed.is_wild_organism &&
    isTargetAnimal &&
    primaryCandidate?.rank === "species" &&
    primaryCandidate.confidence >= IDENTIFIED_THRESHOLD;
  const externalModelAgreement = hasExternalAgreement(
    primaryCandidate,
    input.externalCandidates || [],
  );

  const scoringEligible =
    isIdentified &&
    Boolean(primaryCandidate.faunaSpeciesId) &&
    primaryCandidate.confidence >= SCORING_THRESHOLD &&
    externalModelAgreement &&
    integrity.status === "passed";

  const normalizedPrimary = primaryCandidate
    ? { ...primaryCandidate, scoringEligible }
    : undefined;

  const normalizedCandidates = normalizedPrimary
    ? [normalizedPrimary, ...candidates.slice(1)]
    : candidates;

  if (integrity.status === "blocked") {
    return {
      status: "not_wild_organism",
      provider: "openai",
      model,
      summary:
        integrity.issues[0] ||
        "This looks like a photo, screen, artificial subject, or otherwise non-live capture.",
      reason:
        "Fauna blocks points for screens, printed photos, drawings, taxidermy, toys, and other non-live evidence.",
      capturedAt: input.capturedAt,
      location: input.location,
      candidates: normalizedCandidates,
      externalCandidates: input.externalCandidates || [],
      primaryCandidate: normalizedPrimary,
      integrity,
      priors: input.priors || [],
      signals: [
        ...(input.signals || []),
        {
          provider: "integrity",
          status: "used",
          summary: "Media integrity blocked scoring for this capture.",
        },
      ],
      scoringEligible: false,
    };
  }

  if (!parsed.is_wild_organism || !isTargetAnimal) {
    return {
      status: "not_wild_organism",
      provider: "openai",
      model,
      summary:
        parsed.summary ||
        "This does not look like a target wild animal from the photo.",
      reason:
        "Fauna is animal-only and did not find enough evidence of a target wild animal to score this capture.",
      capturedAt: input.capturedAt,
      location: input.location,
      candidates: normalizedCandidates,
      externalCandidates: input.externalCandidates || [],
      primaryCandidate: normalizedPrimary,
      integrity,
      priors: input.priors || [],
      signals: input.signals || [],
      scoringEligible: false,
    };
  }

  if (!isIdentified) {
    return {
      status: "uncertain",
      provider: "openai",
      model,
      summary:
        parsed.summary ||
        "The image has a possible organism, but not enough detail for a safe species ID.",
      reason:
        "Fauna only scores high-confidence species-level identifications.",
      capturedAt: input.capturedAt,
      location: input.location,
      candidates: normalizedCandidates,
      externalCandidates: input.externalCandidates || [],
      primaryCandidate: normalizedPrimary,
      integrity,
      priors: input.priors || [],
      signals: input.signals || [],
      scoringEligible: false,
    };
  }

  return {
    status: "identified",
    provider: "openai",
    model,
    summary:
      parsed.summary ||
      `Likely ${normalizedPrimary?.commonName || "identified organism"}.`,
    reason: getIdentifiedReason({
      scoringEligible,
      integrity,
      externalModelAgreement,
    }),
    capturedAt: input.capturedAt,
    location: input.location,
    candidates: normalizedCandidates,
    externalCandidates: input.externalCandidates || [],
    primaryCandidate: normalizedPrimary,
    integrity,
    priors: input.priors || [],
    signals: input.signals || [],
    scoringEligible,
  };
}

function isAnimalType(organismType: OpenAIJson["organism_type"]): boolean {
  return (
    organismType === "animal" ||
    organismType === "insect" ||
    organismType === "arachnid" ||
    organismType === "bird" ||
    organismType === "reptile" ||
    organismType === "amphibian" ||
    organismType === "fish" ||
    organismType === "mollusk"
  );
}

function hasExternalAgreement(
  candidate: IdentificationCandidate | undefined,
  externalCandidates: NonNullable<IdentifyImageInput["externalCandidates"]>,
): boolean {
  if (!candidate || externalCandidates.length === 0) return true;

  return externalCandidates.some((externalCandidate) => {
    if (externalCandidate.confidence < 0.7) return false;

    const sameScientificName =
      normalizeName(externalCandidate.scientificName) ===
      normalizeName(candidate.scientificName);
    const sameCommonName =
      normalizeName(externalCandidate.commonName) ===
      normalizeName(candidate.commonName);

    return sameScientificName || sameCommonName;
  });
}

function getIdentifiedReason({
  scoringEligible,
  integrity,
  externalModelAgreement,
}: {
  scoringEligible: boolean;
  integrity: IdentificationIntegrity;
  externalModelAgreement: boolean;
}): string {
  if (scoringEligible) {
    return "High-confidence match to a trusted Fauna scoring species.";
  }

  if (integrity.status === "review") {
    return `Identified, but ${integrity.issues[0] || "this capture needs review before scoring."}`;
  }

  if (!externalModelAgreement) {
    return "Identified, but hosted animal models did not agree strongly enough for scoring.";
  }

  return "Identified, but not eligible for points until it matches a trusted Fauna species at high confidence.";
}

function withInputContext(
  result: IdentificationResult,
  input: IdentifyImageInput,
): IdentificationResult {
  return {
    ...result,
    priors: input.priors || [],
    signals: input.signals || [],
    externalCandidates: input.externalCandidates || [],
  };
}

function buildIntegrity(
  parsed: OpenAIJson,
  input: IdentifyImageInput,
): IdentificationIntegrity {
  const spoofRisk = clampConfidence(parsed.media_integrity.spoof_risk);
  const evidence = parsed.media_integrity.evidence.trim();
  const modelIssues = parsed.media_integrity.issues
    .map((issue) => issue.trim())
    .filter(Boolean);
  const issues = [...modelIssues];

  if (input.source === "upload") {
    issues.unshift("Uploaded images require review before scoring.");
  } else if (input.source !== "live_camera") {
    issues.unshift("Unknown capture source requires review before scoring.");
  }

  const looksSpoofed =
    !parsed.media_integrity.is_live_scene ||
    spoofRisk >= 0.6 ||
    issues.some((issue) =>
      /screen|monitor|display|printed|paper|photo of|photograph|poster|drawing|illustration|taxidermy|plush|toy|statue|frame|bezel/i.test(
        issue,
      ),
    );

  if (looksSpoofed) {
    return {
      source: input.source,
      status: "blocked",
      score: 1 - spoofRisk,
      issues: issues.length
        ? issues
        : [
            evidence ||
              "The image does not look like a live wild organism capture.",
          ],
    };
  }

  if (input.source !== "live_camera") {
    return {
      source: input.source,
      status: "review",
      score: 1 - spoofRisk,
      issues,
    };
  }

  return {
    source: input.source,
    status: "passed",
    score: 1 - spoofRisk,
    issues,
  };
}

function normalizeCandidate(
  candidate: OpenAIJson["candidates"][number],
): IdentificationCandidate {
  const rank = TAXON_RANKS.includes(candidate.rank)
    ? candidate.rank
    : "unknown";
  const confidence = clampConfidence(candidate.confidence);
  const trustedSpecies = findTrustedSpecies(
    candidate.common_name,
    candidate.scientific_name,
  );

  return {
    commonName: candidate.common_name.trim(),
    scientificName: candidate.scientific_name.trim(),
    rank,
    confidence,
    evidence: candidate.evidence.trim(),
    faunaSpeciesId: trustedSpecies?.id,
    rarity: trustedSpecies?.rarity,
    points: trustedSpecies?.points,
    scoringEligible: false,
  };
}

function findTrustedSpecies(commonName: string, scientificName: string) {
  const normalizedCommon = normalizeName(commonName);
  const normalizedScientific = normalizeName(scientificName);

  return SPECIES.find((species) => {
    return (
      normalizeName(species.scientificName) === normalizedScientific ||
      normalizeName(species.commonName) === normalizedCommon
    );
  });
}

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function clampConfidence(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function extractOutputText(data: unknown): string | null {
  if (!isRecord(data)) return null;
  if (typeof data.output_text === "string") return data.output_text;

  const output = data.output;
  if (!Array.isArray(output)) return null;

  for (const item of output) {
    if (!isRecord(item) || !Array.isArray(item.content)) continue;

    for (const content of item.content) {
      if (!isRecord(content)) continue;
      if (typeof content.text === "string") return content.text;
      if (typeof content.refusal === "string") return null;
    }
  }

  return null;
}

function getOpenAIErrorMessage(data: unknown, status: number): string {
  if (isRecord(data) && isRecord(data.error)) {
    const message = data.error.message;
    if (typeof message === "string") return message;
  }

  return `OpenAI request failed with status ${status}.`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
