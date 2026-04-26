export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface Species {
  id: string;
  commonName: string;
  scientificName: string;
  rarity: Rarity;
  points: number;
  habitat: string;
  region: string;
  conservation: string;
  observationWindow: string;
  note: string;
  facts: string[];
}

export interface Entry {
  id: string;
  speciesId: string;
  capturedAt: string;
  locationLabel: string;
  coords: [number, number];
}

export interface Friend {
  id: string;
  name: string;
  handle: string;
  score: number;
  species: number;
  streakDays: number;
}

export interface RouteCard {
  href: string;
  label: string;
  title: string;
  body: string;
  cta: string;
}

export interface CopyBlock {
  label: string;
  title: string;
  body: string;
}

export interface CaptureStep {
  label: string;
  title: string;
  body: string;
}

export const RARITY_META: Record<
  Rarity,
  { label: string; chip: string; points: [number, number]; tone: string }
> = {
  common: {
    label: "Common",
    chip: "chip-common",
    points: [5, 15],
    tone: "#667a65",
  },
  uncommon: {
    label: "Uncommon",
    chip: "chip-uncommon",
    points: [20, 40],
    tone: "#7f9c3c",
  },
  rare: {
    label: "Rare",
    chip: "chip-rare",
    points: [60, 120],
    tone: "#33586e",
  },
  epic: {
    label: "Epic",
    chip: "chip-epic",
    points: [200, 400],
    tone: "#10263a",
  },
  legendary: {
    label: "Legendary",
    chip: "chip-legendary",
    points: [500, 1000],
    tone: "#b9d655",
  },
};

export const HOME_ROUTES: RouteCard[] = [
  {
    href: "/onboarding",
    label: "Walkthrough",
    title: "Learn the rules",
    body: "See the capture flow, the zoo block, and the scoring loop in one clear pass.",
    cta: "Open onboarding",
  },
  {
    href: "/field",
    label: "Field",
    title: "Browse the field",
    body: "Review captured species, rarity progress, and the shape of the product after your first few sightings.",
    cta: "View your field",
  },
  {
    href: "/capture",
    label: "Capture",
    title: "Prototype the camera flow",
    body: "Run through the mocked identify-or-refuse states before we wire in computer vision.",
    cta: "Test capture",
  },
  {
    href: "/leaderboard",
    label: "Friends",
    title: "Compete by attention",
    body: "Track who is noticing the most in a private group, with rarity deciding the real swings.",
    cta: "See the board",
  },
];

export const MISSION_PILLARS: CopyBlock[] = [
  {
    label: "Wild only",
    title: "Only real encounters count.",
    body: "Zoo and enclosure sightings can still be saved to a personal journal, but they never score.",
  },
  {
    label: "Rarity first",
    title: "Every animal changes the score differently.",
    body: "A rabbit keeps the loop moving. A fox changes the table. A wolf should feel unforgettable.",
  },
  {
    label: "Earth Day",
    title: "The game is a behavior shift.",
    body: "The point is to make everyday wildlife feel worth noticing, protecting, and talking about.",
  },
];

export const FUTURE_MODULES: CopyBlock[] = [
  {
    label: "Computer vision",
    title: "Species recognition",
    body: "Swap the mocked capture resolution for a real CV pipeline with confidence scoring.",
  },
  {
    label: "Database",
    title: "Persistent player history",
    body: "Move sightings, friends, seasons, and map traces into a free-tier backend when we are ready.",
  },
  {
    label: "Field facts",
    title: "Rotating fact drops",
    body: "Reveal a different species fact after each verified catch to reward curiosity, not just points.",
  },
  {
    label: "Camera roll",
    title: "Save the memory instantly",
    body: "Queue the verified shot to the device photo library once capture permissions and mobile storage land.",
  },
];

export const CAPTURE_PIPELINE: CaptureStep[] = [
  {
    label: "01",
    title: "Frame the animal",
    body: "Keep the subject visible long enough for the model to resolve motion, shape, and silhouette.",
  },
  {
    label: "02",
    title: "Verify context",
    body: "Use location and enclosure awareness to reject zoo, aquarium, and sanctuary points.",
  },
  {
    label: "03",
    title: "Score the sighting",
    body: "Apply rarity weighting, then log the encounter to the player's running season total.",
  },
  {
    label: "04",
    title: "Reward the curiosity",
    body: "Surface a fact, store the photo, and make the catch feel memorable instead of disposable.",
  },
];

export const FUN_FACT_ROTATION = [
  "Red foxes can hear rodents moving under snow and dive straight through the crust to catch them.",
  "Barred owls do not migrate much, which makes repeat sightings feel like learning a local neighborhood.",
  "Indigo buntings navigate at night by reading star patterns and the planetarium above them.",
];

export const SPECIES: Species[] = [
  {
    id: "sp-001",
    commonName: "Eastern Cottontail",
    scientificName: "Sylvilagus floridanus",
    rarity: "common",
    points: 10,
    habitat: "Grassland edge",
    region: "North America",
    conservation: "Stable",
    observationWindow: "Dawn and dusk",
    note: "Most active at dawn and dusk. Listen for soft thumps before you ever see the ears.",
    facts: [
      "A cottontail can pivot almost instantly, which is why their escape paths feel chaotic to predators.",
      "They do not dig burrows very often; shallow nests hidden under grass are more common.",
      "The white tail flash is both a warning and a distraction when they bolt.",
    ],
  },
  {
    id: "sp-002",
    commonName: "Red Fox",
    scientificName: "Vulpes vulpes",
    rarity: "uncommon",
    points: 35,
    habitat: "Mixed woodland",
    region: "Holarctic",
    conservation: "Stable",
    observationWindow: "Golden hour",
    note: "Crepuscular and precise. A single set of tracks often reveals a whole route.",
    facts: [
      "Red foxes can use the Earth's magnetic field to help line up a successful pounce.",
      "Their tails work like balance poles during quick turns and sudden leaps.",
      "A fox den is often reused over years, even when the residents change.",
    ],
  },
  {
    id: "sp-003",
    commonName: "Barred Owl",
    scientificName: "Strix varia",
    rarity: "rare",
    points: 90,
    habitat: "Old-growth forest",
    region: "Eastern North America",
    conservation: "Stable",
    observationWindow: "Early night",
    note: "Who cooks for you? A call answered is a find confirmed.",
    facts: [
      "Barred owls can swivel their heads far enough to watch a sound source without moving the body much.",
      "Their feather edges break up airflow, which is why their approach feels nearly silent.",
      "Juveniles keep begging calls long after they start moving through branches on their own.",
    ],
  },
  {
    id: "sp-004",
    commonName: "Bobcat",
    scientificName: "Lynx rufus",
    rarity: "epic",
    points: 280,
    habitat: "Chaparral, pine scrub",
    region: "Continental US",
    conservation: "Stable",
    observationWindow: "Blue hour",
    note: "Rarely seen. Scrapes, prints, and stillness are often the only evidence.",
    facts: [
      "Bobcats often move in stop-start bursts, freezing in place so long that people miss them entirely.",
      "Their tufted ears help with sound localization, especially in rough brush.",
      "A bobcat can cover a surprisingly large territory if prey gets scarce.",
    ],
  },
  {
    id: "sp-005",
    commonName: "Indigo Bunting",
    scientificName: "Passerina cyanea",
    rarity: "uncommon",
    points: 28,
    habitat: "Forest edges, roadside brush",
    region: "Eastern US in summer",
    conservation: "Stable",
    observationWindow: "Morning light",
    note: "Migrates by starlight. Males sing from high perches and brief clearings.",
    facts: [
      "The blue looks electric, but the feathers are structured to scatter light rather than hold blue pigment.",
      "Males often return to the same breeding area, which makes repeated sightings possible across years.",
      "Open brush at a woodland edge is one of the best places to hear them before you see them.",
    ],
  },
  {
    id: "sp-006",
    commonName: "Gray Wolf",
    scientificName: "Canis lupus",
    rarity: "legendary",
    points: 740,
    habitat: "Boreal forest, tundra",
    region: "Northern Hemisphere",
    conservation: "Recovering in select regions",
    observationWindow: "Low light and distance",
    note: "A howl at dusk is often closer than it sounds, and far less common than stories suggest.",
    facts: [
      "A wolf pack is a family first, not just a loose hunting unit.",
      "Long-distance travel is normal; a single individual can cover dozens of miles in a day.",
      "Howling is more about locating and coordinating than constant aggression.",
    ],
  },
];

export const ENTRIES: Entry[] = [
  {
    id: "e-101",
    speciesId: "sp-002",
    capturedAt: "2026-04-22T07:14:00Z",
    locationLabel: "Trinity River Greenbelt",
    coords: [32.78, -96.8],
  },
  {
    id: "e-102",
    speciesId: "sp-001",
    capturedAt: "2026-04-20T17:40:00Z",
    locationLabel: "White Rock Lake",
    coords: [32.83, -96.72],
  },
  {
    id: "e-103",
    speciesId: "sp-005",
    capturedAt: "2026-04-18T09:22:00Z",
    locationLabel: "Cedar Ridge Preserve",
    coords: [32.63, -96.93],
  },
  {
    id: "e-104",
    speciesId: "sp-003",
    capturedAt: "2026-04-15T19:05:00Z",
    locationLabel: "Caddo NF, Unit 3",
    coords: [33.35, -95.45],
  },
];

export const CURRENT_USER: Friend = {
  id: "u-0",
  name: "You",
  handle: "@you",
  score: 163,
  species: 4,
  streakDays: 7,
};

export const FRIENDS: Friend[] = [
  {
    id: "u-1",
    name: "Maya Okafor",
    handle: "@maya.o",
    score: 1240,
    species: 23,
    streakDays: 31,
  },
  {
    id: "u-2",
    name: "Diego Navarro",
    handle: "@dnav",
    score: 892,
    species: 19,
    streakDays: 12,
  },
  {
    id: "u-3",
    name: "Priya Shenoy",
    handle: "@priya_s",
    score: 644,
    species: 17,
    streakDays: 9,
  },
  {
    id: "u-4",
    name: "Theo Lindqvist",
    handle: "@theo.l",
    score: 411,
    species: 14,
    streakDays: 4,
  },
  CURRENT_USER,
  {
    id: "u-5",
    name: "Jun Park",
    handle: "@junp",
    score: 120,
    species: 3,
    streakDays: 2,
  },
];

export function getSpecies(id: string): Species | undefined {
  return SPECIES.find((species) => species.id === id);
}

export function getEntry(id: string): Entry | undefined {
  return ENTRIES.find((entry) => entry.id === id);
}
