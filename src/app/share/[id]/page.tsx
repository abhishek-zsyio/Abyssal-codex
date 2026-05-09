import SharedNoteClient from "./SharedNoteClient";
import { AppShell } from "@/components/layout/AppShell";

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ id: "null" }];
}
export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return (
    <AppShell>
      <SharedNoteClient params={params} />
    </AppShell>
  );
}
