# REA setup (webpage design reverse engineering)

[REA](https://github.com/morluto/rea) (`rea-agents` on npm) is a local CLI + MCP toolkit for reverse-engineering apps and sites. For **live webpage design**, use its Chrome DevTools Protocol (CDP) browser tools — no cloud API and no REA account.

Official sources: [github.com/morluto/rea](https://github.com/morluto/rea) · [rea.tools](https://rea.tools/) · npm package `rea-agents`.

## What this VM has

| Item | Status |
| --- | --- |
| Repo clone | `/agent/rea` (public clone; no PR opened) |
| CLI | `rea` **6.7.0** at `~/.local/bin/rea` |
| Node | **22.23.4** (meets engines: 22.x ≥22.23.4 / 24.x ≥24.22.1 / 26.12.1+) |
| Chrome | Google Chrome **156** at `/usr/local/bin/google-chrome` |
| Smoke check | `list-browser-targets`, `inspect-web-page`, `capture-web-screenshot`, `analyze-web-bundle` succeeded against a local fixture page |
| Screenshot artifact | [`media/rea-smoke-screenshot.png`](../media/rea-smoke-screenshot.png) |

Put `~/.local/bin` on your `PATH` (or call the binary by absolute path):

```bash
export PATH="$HOME/.local/bin:$PATH"
rea --version   # 6.7.0
rea --help
```

## Install (fresh machine)

**Fast path (recommended):**

```bash
npm install --global --prefix "$HOME/.local" rea-agents@latest
export PATH="$HOME/.local/bin:$PATH"
```

Or one-shot without a global install:

```bash
npx -y rea-agents@latest --help
```

Or from the cloned tree / installer (registers agents interactively):

```bash
git clone https://github.com/morluto/rea.git
# Official installer (skips interactive agent setup with --no-setup):
curl -fsSL https://raw.githubusercontent.com/morluto/rea/main/install.sh | bash -s -- --no-setup
```

Optional: wire REA into Cursor / Claude Code / etc.:

```bash
npx rea-agents@latest setup
# or: rea setup --client cursor --dry-run
```

Restart the agent after approving MCP registration.

## How to reverse-engineer a live page’s design

REA does **not** launch your browsing session for passive CDP tools. You start a Chrome-family browser with a debugging port, open the page, then point REA at it.

### 1. Start Chrome with CDP (dedicated profile)

```bash
google-chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/rea-browser-profile \
  --password-store=basic \
  "https://example.com"
```

Use a disposable profile. Do **not** expose port `9222` off loopback. On Linux containers, headed Chrome may need GLES/EGL/Mesa; headless (`--headless=new`) works for smoke checks.

### 2. List page targets

```bash
rea list-browser-targets http://127.0.0.1:9222 --json
```

Copy the `target_id` for the page you care about (filter with `--allowed-origins` if many tabs are open).

### 3. Capture structure (DOM / a11y / scripts / network metadata)

```bash
rea inspect-web-page http://127.0.0.1:9222 TARGET_ID \
  --observation-ms 1000 \
  --include-accessibility-text \
  --json > page-inspect.json
```

**Expected output:** Evidence JSON with DOM node inventory (names/types/attribute *names*, not text/values by default), accessibility tree, scripts, resources, frames, and network metadata. Add flags only when needed (`--include-script-sources`, `--include-storage-keys`, etc.) — those can retain sensitive content.

### 4. Capture the visual design (viewport PNG)

```bash
rea capture-web-screenshot http://127.0.0.1:9222 TARGET_ID --json > page-shot.json
```

**Expected output:** Evidence with `normalized_result.artifact` (`media_type`, `sha256`, `bytes`, `data_base64` PNG). Decode base64 to a `.png` for design review. Compare two shots with `rea compare-web-screenshots`.

### 5. Inspect client JS / routes / bundles

```bash
rea analyze-web-bundle http://127.0.0.1:9222 TARGET_ID --json > page-bundle.json
```

**Expected output:** Static inferences over captured scripts (chunk edges, route/endpoint candidates, vendor fingerprints) plus limitations/unknowns.

### 6. Multi-step UI flows (optional)

For click → wait → screenshot sequences, use a Playwright scenario (REA can launch Chrome for you):

```bash
rea capture-browser-scenario ./browser-scenario.json --json > scenario.json
```

Minimal scenario shape (set `executable_path` to your Chrome):

```json
{
  "browser": {
    "mode": "launch",
    "executable_path": "/usr/local/bin/google-chrome",
    "headless": true
  },
  "start_url": { "url": "https://example.com" },
  "actions": [
    { "step_id": "settle", "action": "wait_for_timeout", "duration_ms": 500 }
  ]
}
```

Request DOM/screenshot artifacts in the scenario when you need them; see upstream `docs/browser-scenario-contract.md`.

### Agent workflow (after `rea setup`)

Ask the agent something like:

> Open this live page, inspect its layout/structure with REA, capture a viewport screenshot, and explain the design system signals (hierarchy, spacing rhythm, CTA placement) with Evidence.

The agent should call MCP tools equivalent to the CLI above (`list_browser_targets` → `inspect_web_page` / `capture_web_screenshot` / `analyze_web_bundle`).

## Secrets, env vars, accounts

| Need | Required for webpage design RE? | Notes |
| --- | --- | --- |
| REA / npm API key | **No** | Public MIT package; analysis is local |
| Cloud LLM / OpenAI / Anthropic key | **No for REA itself** | Only whatever your *agent host* already uses |
| Chrome / Chromium | **Yes** | CDP attach; set path in scenario JSON when launching via Playwright |
| Hopper / Ghidra / IDA / JADX | **No** | Native/Android/binary only |
| `REA_BROWSER_EXECUTABLE` | Optional | Used by some verify scripts / tooling; not required for the CLI smoke path above |
| `REA_MCP_INPUT_SCHEMA_PROFILE=full` | Optional | Richer MCP schemas in agent registration |
| Scenario secrets | Only if declared | `capture-browser-scenario` can require env vars you name in the scenario JSON |

`rea doctor` will report missing Hopper/Ghidra/etc. as unhealthy in an audit-wide scan — that is expected and **does not block** website observation.

## Quick reference

```bash
export PATH="$HOME/.local/bin:$PATH"
rea --help
rea list-browser-targets http://127.0.0.1:9222 --json
rea inspect-web-page http://127.0.0.1:9222 TARGET_ID --json
rea capture-web-screenshot http://127.0.0.1:9222 TARGET_ID --json
rea analyze-web-bundle http://127.0.0.1:9222 TARGET_ID --json
```

Upstream guides: [browser observation](https://github.com/morluto/rea/blob/main/docs/browser-observation.md) · [installation](https://github.com/morluto/rea/blob/main/docs/installation.md) · [CLI](https://github.com/morluto/rea/blob/main/docs/cli.md).
