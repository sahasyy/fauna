import { redirect } from "next/navigation";

export default async function ProfileDexRedirectPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  redirect(`/profile/${handle}/field`);
}
