# GhostMemory AI — Where Memories Never Die 🕯️👻

> **Hacktoberfest Open-Source AI Challenge · Week 4: “Ghost in the Machine”**  
> An atmospheric storytelling and remembrance web application powered by **Google's open-weight Gemma models** on **Cloudflare Workers AI**, deployed serverless on **Netlify**.

---

## 🌟 Concept & Architecture Overview

GhostMemory AI brings together atmospheric Halloween ghost lore, forgotten childhood memories, and the sacred reverence of Día de los Muertos. Built for free cloud deployment, it completely eliminates local terminal, Ollama, or desktop server requirements.

- **Cloud Inference**: Powered by Cloudflare Workers AI running Google's open-weight `@cf/google/gemma-4-26b-a4b-it` on global edge GPUs.
- **Serverless Backend**: Netlify Serverless Functions (`netlify/functions/`) proxying requests securely without exposing Cloudflare API tokens to the browser.
- **Browser Persistence**: Generated stories and memorial tributes are stored directly in browser `localStorage`.
- **Zero Terminal Required**: Anyone can deploy and run this application directly using the GitHub and Netlify web dashboards.

---

## 🏗️ Project Structure

```
ghostmemory-ai/
├── netlify/
│   └── functions/
│       ├── generate-story.ts          # POST /.netlify/functions/generate-story
│       ├── remember.ts                # POST /.netlify/functions/remember
│       ├── reimagine.ts               # POST /.netlify/functions/reimagine
│       └── health.ts                  # GET /.netlify/functions/health
├── src/
│   ├── components/
│   │   ├── AtmosphericBackground.tsx  # Interactive canvas & candlelight glow
│   │   ├── CandleFlame.tsx            # Animated SVG candlelight
│   │   ├── Footer.tsx                 # Hacktoberfest & open innovation footer
│   │   ├── ModelStatusBanner.tsx      # Real-time Cloudflare AI status banner
│   │   ├── Navbar.tsx                 # Top bar complying with 3-zone contract
│   │   └── Toast.tsx                  # Action feedback notifications
│   ├── pages/
│   │   ├── HomePage.tsx               # Cinematic hero, features, and curriculum
│   │   ├── StoryStudioPage.tsx        # Ghost story creation studio
│   │   ├── MemoryKeeperPage.tsx       # Tribute letters & memorial remembrance
│   │   ├── DiaryReimaginerPage.tsx    # Journal prose transmutation
│   │   ├── StoryLibraryPage.tsx       # LocalStorage personal story archive
│   │   └── ModelStatusPage.tsx        # Live Cloudflare AI health check & guide
│   ├── server/
│   │   └── cloudflareAiService.ts     # Cloudflare Workers AI REST client
│   ├── services/
│   │   ├── api.ts                     # Frontend HTTP API client for Netlify functions
│   │   └── storage.ts                 # Browser LocalStorage & TXT export
│   ├── types/
│   │   └── index.ts                   # Full TypeScript definitions
│   ├── App.tsx                        # Master app router & state coordinator
│   ├── index.css                      # Tailwind v4 gothic theme & animations
│   └── main.tsx                       # React DOM entry point
├── server.ts                          # Express server for local / preview dev
├── netlify.toml                       # Netlify build, functions, & SPA redirect rules
├── .env.example                       # Cloudflare environment variable template
├── package.json                       # Dependencies & execution scripts
└── README.md                          # Full deployment & documentation guide
```

---

## 🚀 Free Deployment Guide (No Terminal Required)

Deploy GhostMemory AI in under 3 minutes using the GitHub and Netlify web interfaces.

### Step 1: Obtain Cloudflare Credentials
1. Sign up or log into [Cloudflare](https://dash.cloudflare.com).
2. Copy your **Account ID** (visible in your browser URL or on the Workers & Pages overview page).
3. Go to **My Profile > API Tokens > Create Token**.
4. Choose the **Workers AI** template (or create a custom token with **Account > Workers AI: Read** and **Account > Workers AI: Edit** permissions).
5. Copy your newly created **API Token**.

### Step 2: Push to GitHub
1. Create a new repository on [GitHub](https://github.com/new) named `ghostmemory-ai`.
2. Push or upload this project repository to your GitHub account.

### Step 3: Deploy on Netlify
1. Log into [Netlify](https://app.netlify.com).
2. Click **Add new site > Import an existing project**.
3. Select **GitHub** and authorize access to your `ghostmemory-ai` repository.
4. Verify the detected build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
5. Click **Add environment variables** before deploying and add:
   - `CLOUDFLARE_ACCOUNT_ID` = `(Your Cloudflare Account ID)`
   - `CLOUDFLARE_API_TOKEN` = `(Your Cloudflare API Token)`
   - `CLOUDFLARE_AI_MODEL` = `@cf/google/gemma-4-26b-a4b-it`
6. Click **Deploy ghostmemory-ai**.

Netlify will automatically build the React Vite frontend and deploy the serverless functions!

---

## 🧪 Testing Serverless Endpoints

Once deployed on Netlify (or when running locally), you can test the endpoints via `curl`:

### 1. Health Probe
```bash
curl https://your-site.netlify.app/.netlify/functions/health
```
*Expected response:*
```json
{
  "status": "healthy",
  "provider": "Cloudflare Workers AI",
  "configuredModel": "@cf/google/gemma-4-26b-a4b-it",
  "modelAvailable": true,
  "isConfigured": true,
  "latencyMs": 420
}
```

### 2. Generate Ghost Story
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/generate-story \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "An unmoored wooden rowboat drifts through midnight fog with a glowing lantern",
    "storyType": "Forgotten Soul",
    "tone": "Gothic",
    "length": "Short"
  }'
```

### 3. Generate Remembrance Tribute
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/remember \
  -H "Content-Type: application/json" \
  -d '{
    "title": "A Tribute for Grandmother Sofia",
    "recipientName": "Abuela Sofia",
    "memories": "Singing boleros while preparing spiced hot chocolate in the autumn kitchen",
    "style": "Gentle Letter"
  }'
```

### 4. Reimagine Diary Entry
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/reimagine \
  -H "Content-Type: application/json" \
  -d '{
    "originalText": "Rain on the window. The house was quiet after everyone left.",
    "targetStyle": "Gothic Prose"
  }'
```

---

## 🛡️ Privacy & Storage Architecture

1. **Serverless Cloud Inference**:
   AI generation requests are processed by Netlify serverless functions communicating securely with Cloudflare Workers AI. No API credentials or tokens are exposed to the client.
2. **Browser LocalStorage**:
   All saved stories, remembrance letters, and transformed diaries are saved in the user's browser `localStorage`. No user-generated story text is permanently persisted on third-party databases.
3. **Ethical Remembrance Standard**:
   The application strictly positions the Memory Keeper as an affectionate, poetic memorial tribute tool. It does not claim to summon, channel, or contact deceased spirits.

---

## 🎃 Hacktoberfest Open-Source AI Challenge Compliance

- [x] Cloud deployment ready for Netlify without local terminal/Ollama dependencies.
- [x] Genuine open-weight model integration with Gemma via Cloudflare Workers AI REST API.
- [x] Real-time verified health probe (`GET /.netlify/functions/health`).
- [x] Complete Story Studio, Memory Keeper, Diary Reimaginer, and Story Library.
- [x] Browser `localStorage` persistence with `.txt` export and delete confirmation.
- [x] Atmospheric cinematic design with candlelight animations, zero broken assets, and responsive layout.

---

## 📜 License
Licensed under Apache 2.0. Built with pride for Hacktoberfest 2026.
