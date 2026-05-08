import { AppShell } from "@/components/layout/AppShell";
import HomeWrapper from "./HomeWrapper";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export default async function Home() {
  return (
    <AppShell>
      <HomeWrapper />
    </AppShell>
  );
}
