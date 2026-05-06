# amd-ideathon-kshitij
# Calorie Counter & Food Checker — Web App (React + Firebase)

Quick start (local preview)
1. Install prerequisites:
   - Node.js 18+
   - npm (or pnpm/yarn)
   - Firebase CLI (optional for emulators/deploy): `npm install -g firebase-tools`

2. Clone / open repo and set up env:
   - Copy `frontend/.env.example` to `frontend/.env.local` and fill your Firebase config (if using Firebase).
   - For backend functions, either set `GOOGLE_APPLICATION_CREDENTIALS` to a service account JSON or use Firebase emulators.

3. One-command local dev (recommended):
   - Make the dev script executable:
       chmod +x scripts/start-local.sh
   - Run:
       ./scripts/start-local.sh
   - Open http://localhost:5173

4. Manual run:
   - Frontend:
       cd frontend
       npm ci
       npm run dev
   - Backend (dev mode):
       cd backend/functions
       npm ci
       npm run start:dev

What this scaffold includes
- Frontend (React + Vite) with:
  - Login (Firebase email + Google)
  - Food search (calls backend /search)
  - Log food (calls backend /log)
  - Dashboard showing EXP and level
- Backend (Firebase Functions using Express):
  - /search -> proxies OpenFoodFacts
  - /log -> verifies Firebase ID token (bypass in DEV_MODE) and updates EXP
- Dev convenience:
  - scripts/start-local.sh — starts backend in DEV_MODE and runs Vite

Notes & next steps
- Replace heuristics with a curated dataset or external nutrition API for better results (Edamam/Nutritionix).
- Fine-tune EXP rules, add leaderboards, weekly streaks, and rate-limiting on logs.
- Secure Firestore rules (see `firestore.rules`) when deploying.

CI / Deploy
- A GitHub Actions workflow is included to deploy preview channels and production using a Google service account. Add secrets:
  - FIREBASE_PROJECT_ID
  - FIREBASE_SERVICE_ACCOUNT (base64 JSON or raw JSON)

License
- MIT (add LICENSE file if desired)
