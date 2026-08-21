# CareVoice — AI Health Intake

A polished React + TypeScript and Node.js take-home project for a voice-first preliminary health screening experience.

## What it does

- Starts and ends an AI-assisted health intake call.
- Uses turn-based voice interaction over WebSockets (acceptable scope for the assessment).
- STT → LLM → TTS pipeline.
- Adaptive questions for name, concern, duration, severity and related symptoms.
- English/Hindi conversation support through the LLM prompt.
- Live transcript.
- Text fallback when microphone access is unavailable.
- Structured report after the call.
- Graceful handling of incomplete calls and API errors.

## Stack

- React + TypeScript + Vite
- Node.js + Express
- WebSocket (`ws`)
- OpenAI for STT, LLM and TTS
- Lucide React for interface icons

## Run locally

Requirements: Node.js 18+ and an OpenAI API key.

```bash
npm install
npm run install:all
```

Create `server/.env` from `server/.env.example`:

```env
OPENAI_API_KEY=your_key_here
LLM_MODEL=gpt-4o-mini
STT_MODEL=gpt-4o-mini-transcribe
TTS_MODEL=tts-1
TTS_VOICE=alloy
PORT=8080
```

Start both apps:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Architecture

Browser microphone → WebSocket → Node server → STT → conversation LLM → TTS → WebSocket → browser audio.

The server keeps an in-memory conversation history per WebSocket connection so the model can adapt its next question and avoid repeating already-collected information. Ending the call sends the conversation history to the report generator.

## Important scope

This is a screening/demo application, not a medical diagnostic service. The report should be treated as a summary of the conversation, not clinical advice.

## Submission notes

Do not commit `.env` or real API keys. The repository can be made public after removing secrets and confirming that `server/.env.example` contains the required configuration.
