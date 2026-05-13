export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[var(--background)] text-[var(--foreground)]">
      <h1 className="text-4xl font-bold mb-4">404 - NOT_FOUND</h1>
      <p className="text-[var(--foreground)]/60 mb-8">The requested nexus node does not exist in this sector.</p>
      <a 
        href="/"
        className="px-6 py-2 bg-[var(--primary)] text-white rounded hover:opacity-90 transition-opacity"
      >
        RETURN_TO_HOME
      </a>
    </div>
  );
}
