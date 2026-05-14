import SharedNoteClient from "./SharedNoteClient";

export const dynamic = "force-dynamic";
export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return (
    <SharedNoteClient params={params} />
  );
}
