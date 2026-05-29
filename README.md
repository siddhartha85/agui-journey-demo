# AG-UI Journey Demo

A config-driven agentic UI demo — AI agent renders real React components at runtime based on JSON journey configs. Built with AG-UI protocol, FastAPI, React, and Ollama (fully local AI, no API keys needed).

## What it does

The AI agent reads journey configs and dynamically renders UI components — forms, progress bars, decision screens — all driven by the agent at runtime.

Journeys included:
- 🏦 Personal Loan Application
- 🏛️ Open a Bank Account  
- 📋 Insurance Claim
- Add your own by dropping a JSON file in `journeys/`

## How it works

```
User message → FastAPI backend → Ollama AI model
                                      ↓
                              reads journey config
                                      ↓
                         streams AG-UI events (SSE)
                                      ↓
                    React renders components live
```

## Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- [Ollama](https://ollama.com) installed

### 1. Install Ollama model
```bash
ollama pull qwen2.5:7b
```

### 2. Backend
```bash
pip install -r requirements.txt
python app.py
```
Server runs at `http://localhost:8000`

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
App opens at `http://localhost:5173`

## Adding a new journey

Just add a JSON file to the `journeys/` folder — no code changes needed. Use `journeys/loan.json` as a template. Restart the backend to pick it up.

## Project structure

```
app.py                  ← FastAPI backend + AG-UI event streaming
journeys/               ← Journey config files (source of truth)
  loan.json
  account.json
  insurance.json
frontend/
  src/
    hooks/
      useAgentStream.ts ← Handles SSE streaming from agent
    agui/
      ComponentRenderer.tsx ← Maps events → React components
    components/         ← All UI components
      WelcomeScreen, ProgressBar, JourneyForm, SummaryCard,
      DecisionScreen, Confirmation, InfoCard, ComparisonTable, OptionsButtons
```

## AG-UI Protocol

The agent emits typed Server-Sent Events:

| Event | Purpose |
|---|---|
| `RUN_STARTED` | Agent started |
| `TEXT_MESSAGE_CONTENT` | Streams text word by word |
| `CUSTOM_COMPONENT` | Renders a UI component |
| `TOOL_CALL_START/END` | Agent called a tool |
| `RUN_FINISHED` | Agent done |
