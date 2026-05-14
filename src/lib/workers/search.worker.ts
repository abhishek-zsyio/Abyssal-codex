import Fuse from "fuse.js";
import { Note } from "@/types/note";

let fuse: Fuse<Note> | null = null;

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case "INIT":
      // Initialize or update the index
      fuse = new Fuse(payload.notes, {
        keys: ["title", "content"],
        threshold: 0.4,
        ignoreLocation: true,
        includeScore: true
      });
      self.postMessage({ type: "READY" });
      break;

    case "SEARCH":
      if (!fuse) {
        self.postMessage({ type: "RESULTS", results: [], query: payload.query });
        return;
      }
      
      const startTime = performance.now();
      const results = fuse.search(payload.query);
      const endTime = performance.now();
      
      self.postMessage({ 
        type: "RESULTS", 
        results: results.map(r => r.item),
        query: payload.query,
        time: endTime - startTime
      });
      break;
  }
};
