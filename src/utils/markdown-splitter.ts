
/**
 * Splits markdown content into semantic chunks based on headings.
 * If no headings are found, or chunks are too small, it falls back to line-based splitting.
 */
export function splitMarkdown(content: string, maxChunkSize: number = 8000): string[] {
  if (!content) return [""];
  
  // Phase 1: Split by headings (H1 or H2)
  const headingRegex = /^#{1,2}\s+/gm;
  const chunks: string[] = [];
  let lastIndex = 0;
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      chunks.push(content.substring(lastIndex, match.index).trim());
      lastIndex = match.index;
    }
  }
  chunks.push(content.substring(lastIndex).trim());

  // Phase 2: Refine chunks that are still too large
  const refinedChunks: string[] = [];
  for (let chunk of chunks) {
    if (!chunk) continue;

    if (chunk.length > maxChunkSize * 1.5) {
      // Try splitting by paragraphs
      const paragraphs = chunk.split(/\n\n+/);
      let currentSubChunk = "";
      
      for (const p of paragraphs) {
        if (currentSubChunk.length + p.length > maxChunkSize) {
          if (currentSubChunk) refinedChunks.push(currentSubChunk.trim());
          
          // If a single paragraph is still too large, split it by lines
          if (p.length > maxChunkSize) {
            const lines = p.split("\n");
            let lineBuffer = "";
            for (const line of lines) {
              if (lineBuffer.length + line.length > maxChunkSize) {
                if (lineBuffer) refinedChunks.push(lineBuffer.trim());
                lineBuffer = line;
              } else {
                lineBuffer += (lineBuffer ? "\n" : "") + line;
              }
            }
            currentSubChunk = lineBuffer;
          } else {
            currentSubChunk = p;
          }
        } else {
          currentSubChunk += (currentSubChunk ? "\n\n" : "") + p;
        }
      }
      if (currentSubChunk) refinedChunks.push(currentSubChunk.trim());
    } else {
      refinedChunks.push(chunk);
    }
  }

  // Phase 3: Merge small consecutive chunks for better UX
  const finalChunks: string[] = [];
  let buffer = "";
  for (const chunk of refinedChunks) {
    if (!chunk) continue;
    if (buffer.length + chunk.length < maxChunkSize * 0.8) {
      buffer += (buffer ? "\n\n" : "") + chunk;
    } else {
      if (buffer) finalChunks.push(buffer);
      buffer = chunk;
    }
  }
  if (buffer) finalChunks.push(buffer);

  return finalChunks.length > 0 ? finalChunks : [content];
}
