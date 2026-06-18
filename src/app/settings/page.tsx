import SettingsClient from "@/components/SettingsClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  return <SettingsClient session={session} />;
}
