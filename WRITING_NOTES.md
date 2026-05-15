# Writing Notes in Abyssal Codex

The Abyssal Codex uses a high-performance, technical markdown engine optimized for neural knowledge mapping. This guide covers the specialized syntax and organizational patterns available in the IDE.

---

## 1. Neural Wiki-Links
Connections are the core of the Codex. Use "Wiki-links" to link notes together. These connections are automatically detected by the **Graph Engine**.

- **Syntax**: `@{Note Title}`
- **Example**: `See the documentation on @{Projects/Codex/Architecture} for details.`
- **Visual Effect**: Creating a link between two notes generates a physical "edge" in the Neural Graph.

## 2. Hierarchical Folders
Folders in the Abyssal Codex are virtual and based on the **Path Syntax** in the note's title.

- **Syntax**: Use `/` in the title to create nesting.
- **Example**: A note titled `Research/Physics/Quantum` will automatically appear inside a `Physics` folder, which is inside a `Research` folder.
- **Root Folders**: These appear as "Suns" or "Hubs" in the Graph View.

## 3. Technical Markdown
The editor supports standard GFM (GitHub Flavored Markdown) with premium HUD styling.

### Code Blocks
Full syntax highlighting for 20+ languages.
```typescript
function sync() {
  console.log("Handshake initiated...");
}
```

### HUD-Styled Tables
Tables are rendered with a monospaced, technical aesthetic.
| Module | Status | Latency |
| :--- | :--- | :--- |
| Graph Engine | ACTIVE | 12ms |
| Sync Service | STABLE | 45ms |

### Quotes & Data Logs
Blockquotes are styled as "Data Logs" for a terminal feel.
> CRITICAL: Ensure all data segments are encrypted before cloud transmission.

## 4. Metadata & Discovery
Use the Sidebar HUD to add metadata that affects discovery and visualization.

- **Tags**: Use `#tag` in the tag input. Tags appear as clusters in the graph.
- **Favorites**: Starred notes are rendered with a brighter "Corona" effect in the graph view.
- **Public Fragments**: Toggling "Public" generates a secure, read-only link for external consultation.

---

## 5. Pro-Tips
- **Refactoring**: If you rename a note, the Codex automatically updates all `@{Wiki-Links}` pointing to it across your entire library.
- **Graph Focus**: Hovering over a note in the Graph View will highlight its immediate neighbors and show its metadata in the Info Panel.
- **Search**: The global search (`Cmd/Ctrl + K`) scans both titles and content in real-time.
