export interface JournalEntry {
  slug: string;
  place: string;
  date: string;
  caption: string;
  body: string[];
  notes?: string;
  imagePath: string;
  imageSrc?: string;
  imageAlt?: string;
  prev?: { slug: string; place: string };
  next?: { slug: string; place: string };
}

const RAW_ENTRIES: Omit<JournalEntry, "prev" | "next" | "imageSrc">[] = [];

export const JOURNAL_ENTRIES: JournalEntry[] = RAW_ENTRIES.map((entry, index) => {
  const prev = RAW_ENTRIES[index - 1];
  const next = RAW_ENTRIES[index + 1];
  return {
    ...entry,
    imageSrc: entry.imagePath,
    prev: prev ? { slug: prev.slug, place: prev.place } : undefined,
    next: next ? { slug: next.slug, place: next.place } : undefined,
  };
});
