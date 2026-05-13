# Notes & Docs - Premium Note-Taking App

A beautifully designed, glassmorphic note-taking application built with **Next.js**, **Tailwind CSS**, and **Framer Motion**.

## Features

- ✨ **Glassmorphic UI**: Premium aesthetics with backdrop blurs and subtle gradients.
- 📝 **Markdown Support**: Write in rich markdown and preview instantly.
- 🔍 **Real-time Search**: Quickly find notes by title or content.
- 💾 **Local Persistence**: All notes are saved to your browser's LocalStorage.
- 🌓 **Dark Mode**: Optimized for high-end dark mode aesthetics.
- 🚀 **Fast Performance**: Built on Next.js for lightning-fast interactions.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The easiest way to deploy this app is using [Vercel](https://vercel.com/new).

For detailed instructions, troubleshooting, and environment configuration, see the [Deployment Guide](./DEPLOYMENT.md).

1. Push your code to a GitHub repository.
2. Connect the repository to Vercel.
3. Vercel will automatically detect Next.js and deploy your app.

## Project Structure

- `src/app/`: Next.js App Router pages and layouts.
- `src/components/`: Reusable UI components (Sidebar, Editor, EmptyState).
- `src/hooks/`: Custom hooks for state and persistence.
- `src/lib/`: Utility functions.
- `src/types/`: TypeScript interfaces.
- `src/app/globals.css`: Design system and custom styles.
