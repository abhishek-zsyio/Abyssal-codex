export default function NotFound() {
  return (
    <div className="bg-black text-white p-10 flex flex-col items-center justify-center h-screen font-mono">
      <h1 className="text-2xl mb-4 uppercase tracking-widest">404_Page_Not_Found</h1>
      <p className="text-xs opacity-50 uppercase mb-8">The requested address does not exist in the codex.</p>
      <a href="/" className="px-6 py-2 border border-white hover:bg-white hover:text-black transition-all uppercase text-[10px] tracking-widest">
        Return_To_Core
      </a>
    </div>
  );
}
