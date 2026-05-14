/**
 * Wiki-link utility for Abyssal Docs
 */

export interface ParsedWikiLink {
  raw: string;
  target: string;
  alias: string;
  isFolder: boolean;
}

const WIKI_LINK_REGEX = /@\{(.*?)\}/g;

/**
 * Parses all wiki links in a given text
 */
export function parseWikiLinks(text: string): ParsedWikiLink[] {
  if (!text) return [];
  
  const links: ParsedWikiLink[] = [];
  let match;
  
  // Reset regex index
  WIKI_LINK_REGEX.lastIndex = 0;
  
  while ((match = WIKI_LINK_REGEX.exec(text)) !== null) {
    const content = match[1];
    if (!content) continue;
    
    let target = content;
    let alias = content;
    
    if (content.includes('|')) {
      const parts = content.split('|');
      target = parts[0].trim();
      alias = parts.slice(1).join('|').trim();
    }
    
    const isFolder = target.endsWith('/');
    if (isFolder) {
      target = target.slice(0, -1);
    }
    
    links.push({
      raw: match[0],
      target,
      alias,
      isFolder
    });
  }
  
  return links;
}

/**
 * Resolves a target title to a note ID
 */
export function resolveNoteId(targetTitle: string, allNotes: { id: string; title: string }[]): string | undefined {
  const targetLower = targetTitle.toLowerCase().trim();
  
  // 1. Try exact match (case insensitive)
  let found = allNotes.find(n => n.title.toLowerCase().trim() === targetLower);
  if (found) return found.id;
  
  // 2. Try matching the end of the path (if target is just "Note" and note title is "Folder/Note")
  found = allNotes.find(n => n.title.toLowerCase().endsWith('/' + targetLower));
  if (found) return found.id;
  
  return undefined;
}

/**
 * Updates all wiki links in content when a note is renamed
 */
export function updateLinksInContent(content: string, oldTitle: string, newTitle: string): string {
  if (!content) return content;

  // Escape special regex characters in the title
  const escapedOldTitle = oldTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Regex matches @{Old Title} or @{Old Title|Alias}
  // The first group is the target, the second (optional) group is the alias part starting with |
  const regex = new RegExp(`@\\{(${escapedOldTitle})(\\|.*?)?\\}`, 'g');
  
  return content.replace(regex, (match, target, alias) => {
    return `@{${newTitle}${alias || ''}}`;
  });
}
