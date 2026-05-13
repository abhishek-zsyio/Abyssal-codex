# Deployment Guide: Abyssal Codex

This guide outlines the steps to build and deploy the Abyssal Codex application to Vercel or any other compatible hosting provider.

## Prerequisites

- **Node.js**: v18 or higher (v19+ recommended for React 19 features)
- **NPM**: v9 or higher
- **Vercel CLI**: (Optional) For command-line deployments

## Local Development

To run the application locally:

```bash
npm install
npm run dev
```

## Production Build

Next.js 16/React 19 requires strict environment consistency during the build process.

### 1. Environment Configuration
Ensure your `NODE_ENV` is set to `production` when building. Using `development` during build will cause prerendering errors (e.g., `useContext` failures on static pages).

### 2. Build Command
Run the following command to generate an optimized production bundle:

```bash
# Standard build
npm run build

# If you encounter environment issues:
NODE_ENV=production npm run build
```

## Deployment to Vercel

### Option 1: Vercel CLI (Recommended for speed)
Use the Vercel CLI to deploy directly from your terminal:

```bash
# Preview deployment
npx vercel

# Production deployment
npx vercel --prod
```

### Option 2: Vercel Git Integration
1. Push your code to a GitHub/GitLab/Bitbucket repository.
2. Import the project in the [Vercel Dashboard](https://vercel.com/new).
3. Ensure the **Build Command** is set to `npm run build`.
4. Add all required environment variables (from `.env.local`).

## Critical Troubleshooting

### "TypeError: Cannot read properties of null (reading 'useContext')"
This error usually occurs during the prerendering of `/_not-found` or `/_global-error`. 

**Solution:**
- Ensure `AppProviders` are located in the root `src/app/layout.tsx` so that all routes (including error pages) are wrapped in the necessary context.
- Ensure `NODE_ENV` is explicitly set to `production` during the `next build` execution.

### Hydration Mismatch
Since this app uses heavy theme customization and `localStorage`, hydration mismatches can occur if components aren't mounted properly.

**Solution:**
- Use the `mounted` state pattern in the `ThemeProvider` to prevent server-side rendering of theme-dependent UI until the client has loaded.

## Infrastructure Notes
- **Framework**: Next.js 16 (Turbopack)
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set)
