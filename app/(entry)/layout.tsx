import type { ReactNode } from "react";
import { EntryExperienceShell } from "@/components/entry/EntryExperienceShell";

export default function EntryLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <EntryExperienceShell>{children}</EntryExperienceShell>;
}
