# Discord Rich Presence — Build Instructions

## RULES FOR THE AGENT (STRICT)
- No monologue, no restating this file, no "thinking out loud."
- Execute steps in order. Output only: file diffs/contents created, commands run, final confirmation.
- Do not print the GitHub token. Read it only from environment variable `GH_TOKEN`.
- Minimize tokens: no explanations unless a step fails.

## Goal
A Discord Rich Presence app that:
1. Shows a large image (`compressed-cronos-clean.jpg` → asset key `main_image`).
2. Shows a small corner icon (`vscicon.png` → asset key `small_image`).
3. Uses `vsc.png` as a secondary/background asset (`bg_image`) if the layout needs a second large-image swap or button context — otherwise upload as `bg_image` for future use.
4. Has a persistent elapsed timestamp: the "elapsed time" must NEVER reset on process restart, crash, or PC reboot. It always reflects time since first-ever activation.
5. Has a button: "GitHub" → `https://github.com/Agrazel1459`
6. Only activates when Discord (Desktop or Web/PWA) is running. If Discord closes, stop trying to set presence; if Discord reopens, resume automatically without resetting the timestamp.

## Persistent Timestamp Design
- On first run ever, store `start_timestamp` (Unix seconds) in a local file `state.json`.
- On every subsequent run, read `start_timestamp` from `state.json` instead of generating a new one.
- Pass this same `start_timestamp` to Discord's `startTimestamp` field every time presence is set — this makes Discord's elapsed counter keep counting from the original moment, unaffected by restarts.
- Never overwrite `start_timestamp` once set. Only a manual delete of `state.json` resets it.

## Project Structure
```
Zeus-St-Croix/
├── drcp-instructions.md
├── package.json
├── .gitignore
├── state.json          (gitignored — local persistent state, holds start_timestamp)
├── .env                (gitignored — holds DISCORD_CLIENT_ID)
└── index.js
```

## Steps

### 1. Discord Developer Portal (manual, user does this — agent cannot)
- Create app at discord.com/developers/applications.
- Note the **Application (Client) ID**.
- Rich Presence → Art Assets: upload `compressed-cronos-clean.jpg` as key `main_image`, `vscicon.png` as key `small_image`, `vsc.png` as key `bg_image`.

### 2. package.json
Dependencies: `discord-rpc`, `dotenv`.

### 3. .env
```
DISCORD_CLIENT_ID=REPLACE_WITH_CLIENT_ID
```

### 4. .gitignore
```
node_modules/
.env
state.json
```

### 5. index.js — logic requirements
- Load `.env`.
- Load or create `state.json` with `{ "start_timestamp": <unix_seconds> }` — create only if file absent.
- Use `discord-rpc` client, `login({ clientId })`.
- On `ready`, call `setActivity` with:
  - `details`: short status line (agent picks something relevant, e.g. "Building Zeus St. Croix")
  - `state`: secondary line (e.g. "github.com/Agrazel1459")
  - `startTimestamp`: value from `state.json` (as JS `Date`/epoch ms), never regenerated
  - `largeImageKey`: `main_image`
  - `largeImageText`: optional label
  - `smallImageKey`: `small_image`
  - `smallImageText`: optional label
  - `buttons`: `[{ label: "GitHub", url: "https://github.com/Agrazel1459" }]`
  - `instance`: false
- Re-call `setActivity` on an interval (e.g. every 15s) to keep it alive — always with the same stored `startTimestamp`.
- On RPC connection error/disconnect (Discord not running), catch and retry connection every 10–15s in a loop — do not crash, do not exit.
- On successful reconnect, re-send the same stored `startTimestamp` — do not touch `state.json`.

### 6. Run
```
npm install
node index.js
```
Runs as long as the process is alive; auto-detects Discord Desktop or Web (Discord's IPC/RPC bridge handles both once the user is logged into Discord and RPC is enabled).

## Git Commit & Push
Use env var, never inline the token:
```bash
git init
git remote add origin https://github.com/Agrazel1459/Zeus-St-Croix.git
git add .
git commit -m "Add Discord Rich Presence with persistent timestamp"
git branch -M main
git push https://$GH_TOKEN@github.com/Agrazel1459/Zeus-St-Croix.git main
```
Set `GH_TOKEN` in the shell session only (`export GH_TOKEN=...`), never in a committed file.

## Post-build Checklist
- [ ] `state.json` and `.env` are gitignored, not committed.
- [ ] Restarting `node index.js` shows the same elapsed time as before restart.
- [ ] Presence disappears when Discord is fully closed; reappears without timestamp reset when reopened.
- [ ] GitHub button opens the correct profile URL.
