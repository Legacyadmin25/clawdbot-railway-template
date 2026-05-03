# Deployment Checklist

This checklist keeps the Architect (listener) and Developer (producer) bridges in sync when pushing changes to production.

## Prerequisites

- Architect repo (`openclaw-bridge`) and developer repo (`clawdbot-railway-template`) are both cloned locally.
- Railway CLI authenticated (`railway login`).
- GitHub token available for pushes.

## 1. Architect bridge

1. Pull latest code:
   ```bash
   cd openclaw-bridge
   git pull
   npm install
   ```
2. Run locally (optional):
   ```bash
   PORT=3000 npm start
   ```
   Confirm `/healthz` returns `{ "status": "ok" }`.
3. Commit + push any pending changes.
4. Redeploy on Railway (or target host).

## 2. Developer bridge

1. Pull latest code:
   ```bash
   cd clawdbot-railway-template
   git pull
   npm install
   ```
2. Run smoke test:
   ```bash
   npm run smoke:test
   ```
   Expected output: `Smoke test passed. Architect received: ...`
3. Commit + push:
   ```bash
   git status
   git add ...
   git commit -m "<summary>"
   git push origin main
   ```
4. Redeploy the developer Railway service.

## 3. Verification

1. Architect health check:
   ```bash
   curl https://<architect-app>.railway.app/healthz
   ```
2. Trigger a sample task from the developer gateway (e.g., via `/setup` or CLI) and confirm architect logs `Architect received task: ...`.
3. Monitor both Railway logs for 2–3 minutes to ensure no errors.

## 4. Notifications

- Post a status update via `scripts/notify.sh` (coming soon) or your preferred channel summarizing:
  - Commit hashes deployed
  - Smoke-test result
  - Verification timestamp

Keeping this order (architect first, developer second) prevents race conditions and ensures the new listener is ready before the producer switches over.
