# BANGER.AI — Viral TikTok Concept Engine

Upload your photo → AI brainstorms the full scene → generates the image with people added → gives you text overlays ready to post.

---

## What It Does

1. You upload your photo
2. Claude AI analyzes the scene and brainstorms 3 viral concepts
3. For each concept it tells you exactly who/what to add to the scene
4. Click "Generate This Scene" → fal.ai generates the full image with people added
5. Text overlays are shown on a TikTok phone mockup ready to copy

---

## Setup (takes about 10 minutes)

### Step 1 — Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/banger-ai.git
cd banger-ai
npm install
```

### Step 2 — Get your API keys

**Anthropic (Claude) API key:**
- Go to https://console.anthropic.com
- Create an account → API Keys → Create Key
- Copy the key

**fal.ai API key (image generation):**
- Go to https://fal.ai
- Sign up → Dashboard → API Keys → Add Key
- Copy the key
- Free tier gives you $10 credit — enough for ~500 images

### Step 3 — Add your keys
```bash
cp .env.example .env.local
```
Open `.env.local` and fill in:
```
ANTHROPIC_API_KEY=sk-ant-...your key here...
FAL_KEY=...your fal key here...
```

### Step 4 — Run locally
```bash
npm run dev
```
Open http://localhost:3000

---

## Deploy to Vercel (free, takes 2 minutes)

1. Push your code to GitHub
2. Go to https://vercel.com → New Project → Import your repo
3. In Vercel settings → Environment Variables → add:
   - `ANTHROPIC_API_KEY` = your Anthropic key
   - `FAL_KEY` = your fal.ai key
4. Click Deploy
5. You get a live URL like `https://banger-ai.vercel.app`

---

## Tech Stack

- **Next.js 14** — frontend + backend in one
- **Claude claude-sonnet-4-20250514** — concept brainstorming + scene analysis
- **fal.ai Flux** — image generation and editing
- **Vercel** — hosting (free tier works fine)

---

## Your Identity

This app is built for: intelligent, funny, confident content. Smart humor that makes people think AND laugh. Never mean, never arrogant. The TikTok gap nobody is filling consistently.
