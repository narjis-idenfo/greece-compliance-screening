# Greece Compliance — PEP & Adverse Media Screening

A next-generation name screening web application for PEP and adverse media detection, integrated with **Greece Compliance Intelligence** via the OpenAI API.

## Quick start

```bash
npm install
cp .env.example .env.local   # if you don't already have .env.local
# Edit .env.local — add OPENAI_API_KEY (and optional ASSISTANT_ID)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dashboard banner shows **Live agent** or **Mock mode**.

Check connection: [http://localhost:3000/api/agent/status](http://localhost:3000/api/agent/status)

## Connect your ChatGPT compliance agent

ChatGPT Custom GPTs cannot be called directly by URL. Link your app using one of these options:

### Option A — Assistants API (closest to your Custom GPT)

1. Go to [platform.openai.com/assistants](https://platform.openai.com/assistants)
2. Create an **Assistant** with the **same instructions, model, and files** as your "Greece Compliance Intelligence" Custom GPT
3. Copy the Assistant ID (`asst_...`)
4. In `.env.local`:

```env
OPENAI_API_KEY=sk-...
GREECE_COMPLIANCE_ASSISTANT_ID=asst_...
USE_MOCK_AGENT=false
```

The app uses the Assistants API (threads + runs). Your Assistant’s instructions should ask for JSON output — see `prompts/screening-agent-system.md` for the expected schema.

### Option B — Web search + prompt (default, no Assistant ID)

Leave `GREECE_COMPLIANCE_ASSISTANT_ID` empty. With `OPENAI_USE_WEB_SEARCH=true` (default), the app uses the **Responses API with web search** to find PEP/adverse media hits and **source images**, then returns structured JSON.

### Option C — Chat Completions only (no web search)

Set `OPENAI_USE_WEB_SEARCH=false`. The app sends screenings to Chat Completions using:

- System prompt from `prompts/screening-agent-system.md`, or
- `GREECE_COMPLIANCE_SYSTEM_PROMPT` in `.env.local` (paste your Custom GPT instructions)

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
USE_MOCK_AGENT=false
```

### Mock mode

Without `OPENAI_API_KEY`, or with `USE_MOCK_AGENT=true`, the app uses local mock data (no API charges).

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | For live mode | From [OpenAI API keys](https://platform.openai.com/api-keys) |
| `GREECE_COMPLIANCE_ASSISTANT_ID` | Optional | `asst_...` — enables Assistants API |
| `OPENAI_MODEL` | Optional | Default `gpt-4o` for Chat Completions |
| `USE_MOCK_AGENT` | Optional | `true` forces mock even with API key |
| `OPENAI_ASSISTANT_TIMEOUT_MS` | Optional | Default `120000` |
| `GREECE_COMPLIANCE_SYSTEM_PROMPT` | Optional | Override system prompt (Chat Completions) |

See `.env.example` for a full template.

## Features

- **Dashboard** — stats, recent cases, risk chart, agent status banner
- **New screening** — multi-parameter form + profile completeness
- **Results** — PEP, adverse media, identity analysis, agent reasoning
- **Case review** — analyst decision + PDF export

## Architecture

```
src/
├── lib/agent/              # OpenAI integration (chat + assistants)
├── services/
│   └── greeceComplianceAgentService.ts
├── prompts/
│   └── screening-agent-system.md
└── app/api/
    ├── screening/
    └── agent/status/
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/agent/status` | Live vs mock, assistant configured |
| GET | `/api/dashboard` | Dashboard statistics |
| POST | `/api/screening` | Submit screening |
| GET | `/api/screening/[id]` | Get results |
| POST | `/api/screening/[id]/decision` | Save analyst decision |
