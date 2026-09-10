# Virtual Dyno Tester (MVP)

## Overview
This project is a browser-based virtual dyno tester. It computes torque and horsepower vs RPM using a simplified 1D breathing model and shows a particle-based exhaust flow visualization.

## Run locally
1. Install Node 18+ and npm.
2. `npm install`
3. `npm run dev`
4. Open `http://localhost:5173`

## Build
`npm run build` then serve `dist/` with any static host.

## Deploy
Use GitHub + Vercel or Netlify. See deployment instructions in the project root (or follow the guide below).

## Notes
This is an MVP. The physics are simplified for interactivity. For high-fidelity flow, consider server-side CFD (OpenFOAM) and precomputed velocity fields.
