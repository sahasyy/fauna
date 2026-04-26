import { identifyWithOpenAI } from "@/lib/identification/openai";
import { getINaturalistPrior } from "@/lib/identification/inaturalist";
import { queryHostedAnimalModel } from "@/lib/identification/hosted-animal-model";
import type {
  IdentificationResult,
  IdentifyImageInput,
} from "@/lib/identification/types";

export async function identifyImage(
  input: IdentifyImageInput,
): Promise<IdentificationResult> {
  const iNaturalistPrior = await getINaturalistPrior(input.location);
  const inputWithPriors = {
    ...input,
    priors: iNaturalistPrior.priors,
  };
  const [speciesNet, bioClip] = await Promise.all([
    queryHostedAnimalModel({
      provider: "speciesnet",
      endpoint: process.env.SPECIESNET_ENDPOINT,
      apiKey: process.env.SPECIESNET_API_KEY,
      input: inputWithPriors,
    }),
    queryHostedAnimalModel({
      provider: "bioclip",
      endpoint: process.env.BIOCLIP_ENDPOINT,
      apiKey: process.env.BIOCLIP_API_KEY,
      input: inputWithPriors,
    }),
  ]);
  const externalCandidates = [
    ...speciesNet.candidates,
    ...bioClip.candidates,
  ];
  const ensembleSignals = [
    iNaturalistPrior.signal,
    speciesNet.signal,
    bioClip.signal,
  ];
  const result = await identifyWithOpenAI({
    ...inputWithPriors,
    signals: ensembleSignals,
    externalCandidates,
  });

  return {
    ...result,
    priors: iNaturalistPrior.priors,
    externalCandidates,
    signals: result.signals || ensembleSignals,
  };
}
