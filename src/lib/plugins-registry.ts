import { PluginMetadata } from "@/types/plugin";
import { CodeBlockHeader } from "./plugins/code-runner";

export const AVAILABLE_PLUGINS: PluginMetadata[] = [
  {
    id: "stats-plugin",
    name: "Word Counter Pro",
    description: "Detailed word count, character count, and estimated reading time for your notes.",
    author: "Abyssal Team",
    version: "1.0.0",
    icon: "BarChart3",
    category: "editor",
    guide: "Track your productivity in real-time. This module adds a live word and character count to the bottom of your editor. It also calculates estimated reading time based on an average speed of 200 WPM.\n\n**Features:**\n- Live character/word/paragraph counting.\n- Reading time estimation.\n- Industrial-grade progress tracking."
  },
  {
    id: "zen-mode",
    name: "Full Screen Mode (Zen)",
    description: "Focus on your writing by hiding all UI elements and entering full screen mode.",
    author: "Abyssal Team",
    version: "1.0.2",
    icon: "Maximize2",
    category: "ui",
    guide: "Escape all distractions. Toggle Zen Mode with **⌘ + B** to hide all sidebars and UI elements, leaving only you and your words. Perfect for deep-focus writing sessions.\n\n**Shortcuts:**\n- `⌘ + B`: Toggle Zen Mode\n- `Esc`: Exit Zen Mode"
  },
  {
    id: "vim-mode",
    name: "Vim Keybindings",
    description: "Enable Vim emulation in the editor for power users. Support for motions, operators, and custom keymaps.",
    author: "Abyssal Team",
    version: "2.1.0",
    icon: "Keyboard",
    category: "editor",
    guide: "Power editing for terminal veterans. This module enables a full Vim emulation layer including:\n\n**Modes:**\n- **Normal Mode**: HJKL motions, `w/e/b` word jumps, `f/t` character searches.\n- **Insert Mode**: Standard typing experience.\n- **Visual Mode**: Selection and block operations.\n- **Command Mode**: Use `:` for saving, searching, and more.\n\n**Customization:**\nEnable this plugin in the Store and your editor will automatically switch to Vim mode."
  },
  {
    id: "code-runner",
    name: "Code Execution Engine",
    description: "Execute JavaScript, Python, and SQL code blocks directly within your notes with isolated runtime environments.",
    author: "TechBrutalist",
    version: "1.4.2",
    icon: "Play",
    category: "utility",
    guide: "Turn your notes into a playground. Wrap code in blocks and click 'Run' to see output.\n\n**Supported Runtimes:**\n- **JavaScript**: Browser-safe execution.\n- **Python**: Local runtime integration.\n- **SQL**: Query your internal databases.\n\n**Usage:**\nWrite code inside standard triple-backtick blocks with the language identifier (e.g., ```js).",
    hooks: {
      codeBlockHeader: CodeBlockHeader
    }
  },
  {
    id: "daily-notes",
    name: "Daily Notes",
    description: "Quick access to a note for today. Automatically creates one if it doesn't exist.",
    author: "Abyssal Team",
    version: "1.1.0",
    icon: "Calendar",
    category: "utility",
    guide: "Maintain a daily journal with one click. This module adds a Calendar icon to the sidebar that automatically opens or creates a note for today's date.\n\n**Naming Convention:**\nNotes are created with the format `Daily_YYYY-MM-DD`."
  },
  {
    id: "wiki-links",
    name: "Auto-Wiki",
    description: "Automatically suggests links to other notes as you type [[bracketed]] text.",
    author: "Abyssal Team",
    version: "0.9.5",
    icon: "Link2",
    category: "editor",
    guide: "Connect your thoughts seamlessly. When this plugin is enabled, typing `[[` will trigger an autocomplete dropdown showing all your existing notes.\n\n**How to use:**\n1. Type `[[` in the editor.\n2. Start typing a note title.\n3. Press **Enter** to insert the link."
  },
  {
    id: "github-sync",
    name: "GitHub Sync",
    description: "Backup and sync your notes directly to a private GitHub repository.",
    author: "TechBrutalist",
    version: "2.0.0",
    icon: "Github",
    category: "system",
    guide: "Never lose a note again. Sync your workspace with a private GitHub repository for version control and cross-device availability.\n\n**Setup:**\n1. Generate a Personal Access Token (PAT) on GitHub.\n2. Configure the Repo URL in the module settings.\n3. Use `⌘ + S` to push changes automatically."
  },
  {
    id: "graph-view",
    name: "Nexus Graph",
    description: "A 3D interactive graph showing the connections and clusters between all your notes in real-time.",
    author: "Abyssal Team",
    version: "0.8.0",
    icon: "Share2",
    category: "ui",
    guide: "Visualize your second brain. The Nexus Graph shows note titles as nodes and Wiki-links as edges.\n\n**Access:**\nClick the **Share (Nexus)** icon in the far-left Activity Bar to initialize the visualization HUD.\n\n**Interaction:**\n- **Scroll**: Zoom in/out.\n- **Drag**: Rotate the graph.\n- **Click Node**: Open the corresponding note."
  },
  {
    id: "backlinks",
    name: "Backlinks Explorer",
    description: "View all notes that link to the current note in a dedicated side panel.",
    author: "Abyssal Team",
    version: "1.0.0",
    icon: "ArrowLeftRight",
    category: "ui",
    guide: "Discover unexpected connections. The Backlinks Explorer shows a list of every note that contains a `[[Wiki-link]]` to the document you are currently viewing."
  },
  {
    id: "pomodoro",
    name: "Void Focus Timer",
    description: "Integrated Pomodoro timer with deep-work statistics and automatic 'Do Not Disturb' mode.",
    author: "Abyssal Team",
    version: "1.2.0",
    icon: "Timer",
    category: "utility",
    guide: "Master your time. The Void Focus Timer follows the Pomodoro technique (25m work / 5m break).\n\n**Features:**\n- Industrial countdown timer in the status bar.\n- Automatic Zen Mode activation during work sessions.\n- Session history and productivity metrics."
  },
  {
    id: "excalidraw",
    name: "Abyssal Canvas",
    description: "Virtual whiteboard for sketching diagrams and visual notes directly embedded in your markdown.",
    author: "Abyssal Team",
    version: "1.5.0",
    icon: "Pencil",
    category: "editor",
    guide: "Sketch your ideas. Abyssal Canvas integrates a full whiteboard experience directly into your markdown files.\n\n**Usage:**\nUse the command `/canvas` to insert a drawing area."
  },
  {
    id: "flashcards",
    name: "Mnemonic Core",
    description: "Turn your notes into flashcards with spaced repetition (Anki sync) to boost your memory.",
    author: "Abyssal Team",
    version: "0.9.0",
    icon: "Brain",
    category: "utility",
    guide: "Active recall at your fingertips. Mnemonic Core scans your notes for `Q: [Question] / A: [Answer]` patterns and creates flashcards for you.\n\n**Sync:**\nOptionally connects to Anki via AnkiConnect."
  },
  {
    id: "mind-map",
    name: "Neural Map",
    description: "Generate interactive mind maps from your note headings for a visual overview of your thoughts.",
    author: "TechBrutalist",
    version: "1.1.0",
    icon: "Network",
    category: "ui",
    guide: "Structural visualization. Neural Map takes your `# Heading` structure and converts it into a branching tree map.\n\n**Shortcut:**\nClick the 'Mind Map' icon in the top-right toolbar of any note."
  },
  {
    id: "custom-css",
    name: "CSS Injector",
    description: "Complete control over the interface with custom CSS overrides and real-time theme tweaking.",
    author: "TechBrutalist",
    version: "1.0.0",
    icon: "Code2",
    category: "system",
    guide: "Your Codex, your rules. CSS Injector allows you to write custom CSS that overrides the default styling of the application.\n\n**Warning:**\nIncorrect CSS may break the UI. Use with caution."
  },
  {
    id: "theme-nord",
    name: "Nordic Frost",
    description: "An arctic, north-bluish color palette for a clean and focused writing environment.",
    author: "Arctic Ice Studio",
    version: "1.0.0",
    icon: "CloudSnow",
    category: "theme",
    guide: "Inspired by the beauty of the Arctic. Nord is a clean, north-bluish color palette that reduces eye strain and provides a calm writing experience."
  },
  {
    id: "theme-monokai",
    name: "Monokai Pro",
    description: "The classic developer theme, optimized for the Abyssal Codex aesthetic.",
    author: "Monokai",
    version: "1.0.0",
    icon: "Palette",
    category: "theme",
    guide: "The legendary Monokai palette. Known for its high contrast and vibrant colors, Monokai Pro is perfect for long-form technical writing."
  },
  {
    id: "theme-cyberpunk",
    name: "Cyber Neon",
    description: "High-contrast neon colors for a futuristic, dystopian terminal vibe.",
    author: "NeonRunner",
    version: "1.0.0",
    icon: "Zap",
    category: "theme",
    guide: "Welcome to the future. Cyber Neon uses high-contrast magentas and cyans to create a bold, high-energy environment."
  },
  {
    id: "theme-solarized",
    name: "Solarized Nebula",
    description: "The legendary precision-engineered palette for technical focus.",
    author: "Ethan Schoonover",
    version: "1.0.0",
    icon: "Sun",
    category: "theme",
    guide: "Solarized is a palette with 16 selective colors. It's designed to reduce eye strain and provide high readability in all lighting conditions."
  },
  {
    id: "theme-dracula",
    name: "Dracula Blood",
    description: "A dark theme for vampires and those who stay up until 4 AM.",
    author: "Zeno Rocha",
    version: "1.0.0",
    icon: "Moon",
    category: "theme",
    guide: "The official Dracula theme for Abyssal Codex. Featuring its signature purple and pink highlights on a deep gray background."
  },
  {
    id: "theme-onedark",
    name: "One Dark Pro",
    description: "The most balanced dark theme for the modern terminal era.",
    author: "Atom Team",
    version: "1.0.0",
    icon: "Terminal",
    category: "theme",
    guide: "Inspired by the classic Atom theme. One Dark Pro provides a clean, neutral dark environment with vibrant syntax colors."
  },
  {
    id: "theme-github",
    name: "GitHub Midnight",
    description: "The official midnight-dark look from the home of all code.",
    author: "GitHub",
    version: "1.0.0",
    icon: "Github",
    category: "theme",
    guide: "Experience the dark side of GitHub. This theme replicates the official GitHub dark mode palette for a professional dev experience."
  },
  {
    id: "theme-catppuccin",
    name: "Catppuccin Mocha",
    description: "Soothing pastel theme for high-fidelity technical documentation.",
    author: "Catppuccin Team",
    version: "1.0.0",
    icon: "Coffee",
    category: "theme",
    guide: "Catppuccin is a community-driven pastel theme that aims to be the middle ground between low and high contrast themes."
  },
  {
    id: "theme-rose-pine",
    name: "Rosé Pine",
    description: "All natural pine, ethereal shapes and colors. Very aesthetic.",
    author: "Rosé Pine",
    version: "1.0.0",
    icon: "Flower2",
    category: "theme",
    guide: "All natural pine, ethereal shapes and colors. Rosé Pine is a theme about calm and focus."
  },
  {
    id: "theme-everforest",
    name: "Everforest Dark",
    description: "Organic and warm palette designed for long writing sessions.",
    author: "Sainnhe",
    version: "1.0.0",
    icon: "Trees",
    category: "theme",
    guide: "Everforest is a green based color palette. It's designed to be warm and soft in order to protect developers' eyes."
  },
  {
    id: "theme-tokyo-night",
    name: "Tokyo Night",
    description: "A clean dark theme that celebrates the lights of Tokyo at night.",
    author: "Enki",
    version: "1.0.0",
    icon: "Component",
    category: "theme",
    guide: "A clean dark theme that celebrates the lights of Tokyo at night. Featuring vibrant purples and blues."
  },
  {
    id: "theme-tokyo-night-light",
    name: "Tokyo Night Light",
    description: "An elegant light variant of the Tokyo Night color palette.",
    author: "Enki",
    version: "1.0.0",
    icon: "Sun",
    category: "theme",
    guide: "The official light variant of the Tokyo Night color palette. Designed for maximum readability and a clean, technical look."
  },
  {
    id: "theme-ayu",
    name: "Ayu Mirage",
    description: "A refined dark theme with a warm, minimalist color palette.",
    author: "Ayu",
    version: "1.0.0",
    icon: "Wind",
    category: "theme",
    guide: "Mirage is the middle ground between light and dark. It uses warm tones and high contrast to provide a sophisticated writing experience."
  },
  {
    id: "theme-synthwave",
    name: "Synthwave '84",
    description: "Neon dreams and retro-futuristic aesthetics inspired by the 80s.",
    author: "Robb Owen",
    version: "1.0.0",
    icon: "Music",
    category: "theme",
    guide: "Step into the grid. Synthwave '84 features glowing pinks and blues against a deep purple background. For those who want their editor to feel like a neon-lit arcade."
  },
  {
    id: "theme-night-owl",
    name: "Night Owl",
    description: "A theme for the night owls who work best in deep blue environments.",
    author: "Sarah Drasner",
    version: "1.0.0",
    icon: "Bird",
    category: "theme",
    guide: "Fine-tuned for those who code late into the night. Deep blues and vibrant pastels ensure that color contrast is accessible while reducing eye strain."
  },
  {
    id: "theme-cobalt2",
    name: "Cobalt2 Official",
    description: "The official high-contrast blue theme for power users.",
    author: "Wes Bos",
    version: "1.0.0",
    icon: "CloudRain",
    category: "theme",
    guide: "A high-fidelity theme featuring yellow, blue, and orange. Cobalt2 is designed to be easy on the eyes while making important information pop."
  },
  {
    id: "theme-gruvbox-material",
    name: "Gruvbox Organic",
    description: "A more organic and softer take on the classic Gruvbox palette.",
    author: "Sainnhe",
    version: "1.0.0",
    icon: "Leaf",
    category: "theme",
    guide: "A warmer, more natural version of the legendary Gruvbox theme. Designed for maximum comfort during extended focus sessions."
  }
];
