# EcoScan

A sustainability shopping assistant mobile-first web app, built with Expo and React Native Web. Deployable to Vercel as a static site.

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:8081 in your browser.

## Building for production

```bash
npm run build
```

Outputs a static site to the `dist/` folder.

## Deploying to Vercel

This project is configured for Vercel out of the box. After pushing to GitHub:

1. Go to vercel.com and import the repo
2. Vercel will detect the `vercel.json` and use the right build settings automatically
3. Click Deploy

## Project structure

- `app/` - Screen routes (Expo Router file-based routing)
- `components/` - Reusable UI components
- `constants/` - Theme tokens and shared constants
- `hooks/` - Custom React hooks
- `lib/` - Business logic, mock data, providers
- `assets/` - Images and icons

## Tech stack

- Expo SDK 54 with Expo Router for file-based routing
- React Native + react-native-web for cross-platform UI
- NativeWind for Tailwind-style styling
- React Query for data fetching
- TypeScript
