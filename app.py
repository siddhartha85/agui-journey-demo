"""
AG-UI — Config-Driven Journey Demo
====================================
Journey definitions live in journeys/*.json  ← source of truth
Agent reads configs at runtime via get_journey_config()
Adding a new journey = add a new JSON file, zero code changes.

Architecture:
  journeys/loan.json         ← designed by product / designer
  journeys/account.json
  journeys/insurance.json
        ↓
  get_journey_config(id)     ← agent reads the exact spec
        ↓
  show_welcome / show_form   ← agent renders it faithfully
"""

import json, uuid, os, glob, math
from datetime import datetime
from fastapi import FastAPI
from fastapi.responses import StreamingResponse, HTMLResponse
from pydantic import BaseModel
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware

client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
app    = FastAPI()

# Allow React dev server to call the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # open for local dev
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/ping")
async def ping():
    """Simple connectivity test — React app calls this on load."""
    return {"status": "ok", "journeys": list(JOURNEY_CONFIGS.keys())}
threads: dict[str, list] = {}
thread_layout: dict[str, str] = {}   # thread_id → active layout name

# ── Load all journey configs from disk at startup ─────────────────────────────
JOURNEYS_DIR = os.path.join(os.path.dirname(__file__), "journeys")

def load_journeys() -> dict:
    configs = {}
    for path in glob.glob(os.path.join(JOURNEYS_DIR, "*.json")):
        with open(path) as f:
            cfg = json.load(f)
            configs[cfg["id"]] = cfg
    return configs

JOURNEY_CONFIGS = load_journeys()   # e.g. {"loan": {...}, "account": {...}, ...}
print(f"✅ Loaded {len(JOURNEY_CONFIGS)} journey configs: {list(JOURNEY_CONFIGS.keys())}")

# ── System prompt ─────────────────────────────────────────────────────────────

SYSTEM_PROMPT = f"""You are a Journey Orchestrator. Journey definitions are stored as config files.
You MUST read the config before starting any journey — never improvise fields or steps.

━━ JOURNEY EXECUTION RULES ━━
1. User asks for a journey → call get_journey_config(journey_id) FIRST
2. Read the config carefully — it defines exact steps, fields, labels, and options
3. Render EXACTLY what the config says — same field names, labels, types, options
4. Do NOT add, remove, or rename any fields

EXECUTION FLOW (follow strictly):
  A. show_welcome() ← use config: icon, name, description, cta_label, color
  B. User clicks CTA → show_progress(1, N, step_names) + show_form(config.steps[0])
  C. [Form Response] → show_progress(2, N) + show_form(config.steps[1])
     ...repeat for every step in config.steps...
  D. After LAST step → show_summary(config.summary_title, all collected data as label/value pairs)
     + show_options(["✅ Confirm & Submit", "✏️ Edit Details"])
  E. User confirms → apply config.decision_rule to collected data → show_decision()
     → show_confirmation(generated_ref_number, config.confirmation.title, config.confirmation.next_steps)

━━ REFERENCE NUMBER FORMAT ━━
Loan: LN-YYYY-XXXXXX  |  Account: AC-YYYY-XXXXXX  |  Insurance: CLM-YYYY-XXXXXX
(use current year, random 6-digit number)

━━ AVAILABLE JOURNEYS ━━
{json.dumps([{"id": k, "name": v["name"]} for k, v in JOURNEY_CONFIGS.items()], indent=2)}

━━ GENERAL TOOLS (non-journey questions) ━━
show_card() → single-topic info  |  show_table() → comparisons  |  show_options() → choices

━━ RULES ━━
- Always call get_journey_config() before starting a journey
- One short sentence after every tool call
- [Form Response] messages: extract silently, move to next step
- If user is unsure which journey → call list_journeys() and show_options()"""

# ── Tools ─────────────────────────────────────────────────────────────────────

TOOLS = [
    # ── Config tools ──
    {
        "type": "function",
        "function": {
            "name": "get_journey_config",
            "description": "Loads the full journey definition from the config file. ALWAYS call this before starting a journey.",
            "parameters": {
                "type": "object",
                "properties": {
                    "journey_id": {
                        "type": "string",
                        "description": f"One of: {', '.join(JOURNEY_CONFIGS.keys())}"
                    }
                },
                "required": ["journey_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_journeys",
            "description": "Returns all available journey IDs and names. Use when user is unsure which journey to start.",
            "parameters": {"type": "object", "properties": {}, "required": []}
        }
    },
    # ── Journey display tools ──
    {
        "type": "function",
        "function": {
            "name": "show_welcome",
            "description": "Renders the journey intro screen. Populate from config fields.",
            "parameters": {
                "type": "object",
                "properties": {
                    "icon":        {"type": "string"},
                    "title":       {"type": "string"},
                    "description": {"type": "string"},
                    "cta_label":   {"type": "string"},
                    "color":       {"type": "string", "description": "One of: blue, green, purple, yellow, red"}
                },
                "required": ["icon", "title", "description", "cta_label", "color"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "show_progress",
            "description": "Renders a step progress bar. Call at the start of each step.",
            "parameters": {
                "type": "object",
                "properties": {
                    "current": {"type": "integer"},
                    "total":   {"type": "integer"},
                    "steps":   {"type": "array", "items": {"type": "string"}}
                },
                "required": ["current", "total", "steps"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "show_form",
            "description": "Renders a data collection form. Use EXACT field definitions from the config.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title":        {"type": "string"},
                    "submit_label": {"type": "string"},
                    "fields": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name":        {"type": "string"},
                                "label":       {"type": "string"},
                                "type":        {"type": "string", "description": "One of: text, number, email, tel, date, select"},
                                "placeholder": {"type": "string"},
                                "options":     {"type": "array", "items": {"type": "string"}},
                                "required":    {"type": "boolean"}
                            },
                            "required": ["name", "label", "type"]
                        }
                    }
                },
                "required": ["title", "fields", "submit_label"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "show_summary",
            "description": "Shows all collected data for review before submission.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "items": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "label": {"type": "string"},
                                "value": {"type": "string"}
                            },
                            "required": ["label", "value"]
                        }
                    }
                },
                "required": ["title", "items"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "show_decision",
            "description": "Renders the outcome screen. Apply the config decision_rule to collected data.",
            "parameters": {
                "type": "object",
                "properties": {
                    "status":  {"type": "string", "description": "One of: approved, rejected, pending, review"},
                    "title":   {"type": "string"},
                    "message": {"type": "string"},
                    "details": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "label": {"type": "string"},
                                "value": {"type": "string"}
                            }
                        }
                    }
                },
                "required": ["status", "title", "message"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "show_confirmation",
            "description": "Final confirmation screen. Use config.confirmation fields.",
            "parameters": {
                "type": "object",
                "properties": {
                    "reference_number": {"type": "string"},
                    "title":            {"type": "string"},
                    "next_steps":       {"type": "array", "items": {"type": "string"}}
                },
                "required": ["reference_number", "title", "next_steps"]
            }
        }
    },
    # ── General display tools ──
    {
        "type": "function",
        "function": {
            "name": "show_card",
            "description": "Renders a visual info card.",
            "parameters": {
                "type": "object",
                "properties": {
                    "emoji": {"type": "string"},
                    "title": {"type": "string"},
                    "body":  {"type": "string"},
                    "color": {"type": "string", "description": "One of: blue, green, yellow, purple, red"}
                },
                "required": ["emoji", "title", "body", "color"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "show_table",
            "description": "Renders a comparison table.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title":   {"type": "string"},
                    "headers": {"type": "array", "items": {"type": "string"}},
                    "rows":    {"type": "array",  "items": {"type": "array", "items": {"type": "string"}}}
                },
                "required": ["title", "headers", "rows"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "show_options",
            "description": "Renders clickable choice buttons.",
            "parameters": {
                "type": "object",
                "properties": {
                    "question": {"type": "string"},
                    "options":  {"type": "array", "items": {"type": "string"}}
                },
                "required": ["question", "options"]
            }
        }
    }
]

# ── Tool execution ─────────────────────────────────────────────────────────────

DISPLAY_TOOLS = {
    "show_welcome", "show_progress", "show_form", "show_summary",
    "show_decision", "show_confirmation", "show_card", "show_table", "show_options"
}

def run_tool(name: str, args: dict, thread_id: str = "") -> dict:
    # Config tools — return data to the agent, no component rendered
    if name == "get_journey_config":
        jid = args.get("journey_id", "")
        if jid in JOURNEY_CONFIGS:
            cfg = JOURNEY_CONFIGS[jid]
            if thread_id:
                thread_layout[thread_id] = cfg.get("layout", "")
            return {"ai_result": json.dumps(cfg, indent=2)}
        return {"ai_result": f"Journey '{jid}' not found. Available: {list(JOURNEY_CONFIGS.keys())}"}

    if name == "list_journeys":
        listing = [{"id": k, "name": v["name"], "icon": v["icon"]} for k, v in JOURNEY_CONFIGS.items()]
        return {"ai_result": json.dumps(listing)}

    # Display tools — emit as CUSTOM_COMPONENT
    if name in DISPLAY_TOOLS:
        layout = thread_layout.get(thread_id, "") if thread_id else ""

        # Fallback: detect layout from keywords in the tool call args
        if not layout and thread_id:
            args_text = json.dumps(args).lower()
            if "credit card" in args_text or ("credit" in args_text and "card" in args_text):
                layout = "card_preview"
            elif "loan" in args_text and "credit" not in args_text:
                layout = "financial"
            elif "bank account" in args_text or ("account" in args_text and "bank" in args_text):
                layout = "onboarding"
            elif "insurance" in args_text or "claim" in args_text or "incident" in args_text:
                layout = "document"
            if layout:
                thread_layout[thread_id] = layout

        return {
            "ai_result": f"{name} rendered.",
            "component": {"type": name.replace("show_", ""), "data": args, "layout": layout}
        }

    return {"ai_result": f"Unknown tool: {name}"}

# ── AG-UI event emitter ────────────────────────────────────────────────────────

def agui_event(p: dict) -> str:
    return f"data: {json.dumps(p)}\n\n"

# ── Streaming generator ────────────────────────────────────────────────────────

def stream_agui_events(message: str, thread_id: str):
    run_id = str(uuid.uuid4())
    msg_id = str(uuid.uuid4())

    if thread_id not in threads:
        threads[thread_id] = [{"role": "system", "content": SYSTEM_PROMPT}]

    history = threads[thread_id]
    history.append({"role": "user", "content": message})

    yield agui_event({"type": "RUN_STARTED",       "threadId": thread_id, "runId": run_id})
    yield agui_event({"type": "TEXT_MESSAGE_START", "messageId": msg_id,   "role": "assistant"})

    try:
        while True:
            stream = client.chat.completions.create(
                model="qwen2.5:7b",
                messages=history,
                tools=TOOLS,
                stream=True,
            )

            text_parts: list[str]       = []
            tool_calls: dict[int, dict] = {}

            for chunk in stream:
                delta = chunk.choices[0].delta
                if delta.content:
                    text_parts.append(delta.content)
                    yield agui_event({"type": "TEXT_MESSAGE_CONTENT", "messageId": msg_id, "delta": delta.content})
                if delta.tool_calls:
                    for tc in delta.tool_calls:
                        i = tc.index
                        if i not in tool_calls:
                            tool_calls[i] = {"id": "", "name": "", "args": ""}
                        if tc.id:                          tool_calls[i]["id"]   = tc.id
                        if tc.function and tc.function.name:      tool_calls[i]["name"] = tc.function.name
                        if tc.function and tc.function.arguments: tool_calls[i]["args"] += tc.function.arguments

            full_text = "".join(text_parts)

            if not tool_calls:
                history.append({"role": "assistant", "content": full_text})
                break

            groq_tool_calls  = []
            tool_results_map: dict[int, tuple] = {}

            for i, tc in sorted(tool_calls.items()):
                tc_id  = str(uuid.uuid4())
                args   = json.loads(tc["args"] or "{}")
                result = run_tool(tc["name"], args, thread_id)
                tool_results_map[i] = (tc, result)

                yield agui_event({"type": "TOOL_CALL_START", "toolCallId": tc_id, "toolCallName": tc["name"]})

                if "component" in result:
                    yield agui_event({
                        "type":      "CUSTOM_COMPONENT",
                        "component": result["component"]["type"],
                        "data":      result["component"]["data"],
                        "layout":    result["component"].get("layout", ""),
                    })

                yield agui_event({"type": "TOOL_CALL_END", "toolCallId": tc_id, "result": result["ai_result"][:120]})

                groq_tool_calls.append({
                    "id": tc["id"], "type": "function",
                    "function": {"name": tc["name"], "arguments": tc["args"]},
                })

            history.append({"role": "assistant", "content": None, "tool_calls": groq_tool_calls})
            for i, (tc, result) in sorted(tool_results_map.items()):
                history.append({"role": "tool", "tool_call_id": tc["id"], "content": result["ai_result"]})

    except Exception as e:
        yield agui_event({"type": "RUN_ERROR", "message": str(e)})
        return

    yield agui_event({"type": "TEXT_MESSAGE_END",  "messageId": msg_id})
    yield agui_event({"type": "RUN_FINISHED",       "threadId": thread_id, "runId": run_id})

# ── Routes ─────────────────────────────────────────────────────────────────────

class RunRequest(BaseModel):
    message: str
    thread_id: str = None

@app.post("/run")
async def run_agent(req: RunRequest):
    thread_id = req.thread_id or str(uuid.uuid4())
    return StreamingResponse(
        stream_agui_events(req.message, thread_id),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )

@app.get("/")
async def serve_ui():
    with open(os.path.join(os.path.dirname(__file__), "index.html")) as f:
        return HTMLResponse(f.read())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
