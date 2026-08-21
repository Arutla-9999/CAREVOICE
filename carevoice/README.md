# CareVoice
AI-assisted voice health screening demo.

## Local
npm install
Create `.env` with `GEMINI_API_KEY=...`
npm run dev

## Render
Use a Node Web Service, Root Directory blank.
Build: `npm install && npm run build`
Start: `npm start`
Health: `/health`
Add `GEMINI_API_KEY` in Environment Variables.

The browser uses Web Speech API for voice input/output; the Gemini key stays server-side. This is not a medical diagnostic system.