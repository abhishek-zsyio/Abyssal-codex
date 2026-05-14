import { useState, useEffect, useRef, useCallback } from "react";
import { Note } from "@/types/note";

export function useSearchWorker(notes: Note[]) {
  const [results, setResults] = useState<Note[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Initialize worker
    workerRef.current = new Worker(
      new URL("../lib/workers/search.worker.ts", import.meta.url)
    );

    workerRef.current.onmessage = (e) => {
      const { type, results: searchResults, time } = e.data;
      if (type === "RESULTS") {
        setResults(searchResults);
        setSearchTime(time);
        setIsSearching(false);
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Update index when notes change
  useEffect(() => {
    if (workerRef.current && notes.length > 0) {
      workerRef.current.postMessage({ type: "INIT", payload: { notes } });
    }
  }, [notes]);

  const search = useCallback((query: string) => {
    if (!query) {
      setResults(notes.slice(0, 10));
      return;
    }

    if (query.startsWith("/")) return;

    setIsSearching(true);
    workerRef.current?.postMessage({ type: "SEARCH", payload: { query } });
  }, [notes]);

  return { results, search, isSearching, searchTime };
}
