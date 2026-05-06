export default function NotFound() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#09090b] text-white">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-muted-foreground mb-8">The page you are looking for does not exist.</p>
      <a href="/" className="px-6 py-3 bg-blue-600 rounded-xl hover:bg-blue-500 transition-all">
        Go Home
      </a>
    </div>
  );
}
