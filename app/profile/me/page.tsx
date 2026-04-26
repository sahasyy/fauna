import { redirect } from "next/navigation";
import { CURRENT_USER } from "@/lib/data";

export default function MyProfileRedirectPage() {
  redirect(`/profile/${CURRENT_USER.handle.replace(/^@/, "")}`);
}
