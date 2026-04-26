import type {
  IdentificationLocation,
  IdentificationPriorTaxon,
  IdentificationSignal,
  TaxonRank,
} from "@/lib/identification/types";

const INAT_SPECIES_COUNTS_URL =
  "https://api.inaturalist.org/v1/observations/species_counts";
const DEFAULT_RADIUS_KM = 50;
const DEFAULT_LIMIT = 20;
const ANIMAL_ICONIC_TAXA = [
  "Mammalia",
  "Aves",
  "Reptilia",
  "Amphibia",
  "Actinopterygii",
  "Insecta",
  "Arachnida",
  "Mollusca",
];

type INaturalistSpeciesCountsResponse = {
  total_results?: number;
  results?: {
    count?: number;
    taxon?: {
      id?: number;
      name?: string;
      preferred_common_name?: string;
      rank?: string;
      iconic_taxon_name?: string;
    };
  }[];
};

export async function getINaturalistPrior(
  location: IdentificationLocation | undefined,
): Promise<{
  priors: IdentificationPriorTaxon[];
  signal: IdentificationSignal;
}> {
  if (!location) {
    return {
      priors: [],
      signal: {
        provider: "inaturalist",
        status: "skipped",
        summary: "No location was available for nearby species priors.",
      },
    };
  }

  const url = new URL(INAT_SPECIES_COUNTS_URL);
  url.searchParams.set("lat", String(location.latitude));
  url.searchParams.set("lng", String(location.longitude));
  url.searchParams.set("radius", String(DEFAULT_RADIUS_KM));
  url.searchParams.set("quality_grade", "research");
  url.searchParams.set("verifiable", "true");
  url.searchParams.set("photos", "true");
  url.searchParams.set("iconic_taxa", ANIMAL_ICONIC_TAXA.join(","));
  url.searchParams.set("per_page", String(DEFAULT_LIMIT));

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Fauna/0.1 identification prior",
      },
      next: {
        revalidate: 60 * 60,
      },
    });

    if (!response.ok) {
      return {
        priors: [],
        signal: {
          provider: "inaturalist",
          status: "error",
          summary: `iNaturalist prior failed with status ${response.status}.`,
        },
      };
    }

    const data = (await response.json()) as INaturalistSpeciesCountsResponse;
    const priors = (data.results || [])
      .map(toPrior)
      .filter((prior): prior is IdentificationPriorTaxon => Boolean(prior));

    return {
      priors,
      signal: {
        provider: "inaturalist",
        status: "used",
        summary: `Loaded ${priors.length} nearby research-grade animal species from iNaturalist.`,
      },
    };
  } catch (error) {
    return {
      priors: [],
      signal: {
        provider: "inaturalist",
        status: "error",
        summary:
          error instanceof Error
            ? error.message
            : "iNaturalist prior request failed.",
      },
    };
  }
}

function toPrior(
  result: NonNullable<INaturalistSpeciesCountsResponse["results"]>[number],
): IdentificationPriorTaxon | undefined {
  const taxon = result.taxon;
  if (!taxon?.id || !taxon.name) return undefined;

  return {
    provider: "inaturalist",
    taxonId: taxon.id,
    commonName: taxon.preferred_common_name || taxon.name,
    scientificName: taxon.name,
    rank: normalizeRank(taxon.rank),
    iconicTaxonName: taxon.iconic_taxon_name,
    observationCount: result.count || 0,
  };
}

function normalizeRank(rank: string | undefined): TaxonRank {
  if (
    rank === "species" ||
    rank === "genus" ||
    rank === "family" ||
    rank === "order" ||
    rank === "class"
  ) {
    return rank;
  }

  return "unknown";
}
