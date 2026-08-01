# Zeus St. Croix — Discord Rich Presence

Persistent-timestamp Discord Rich Presence app.

## Setup

1. **Discord Developer Portal** (manual — you do this):
   - Create an app at https://discord.com/developers/applications
   - Copy the Application (Client) ID
   - Under Rich Presence → Art Assets, upload:
     - `assets/main_image.jpg` as key `main_image`
     - `assets/small_image.png` as key `small_image`
     - `assets/bg_image.png` as key `bg_image`

2. Copy `.env.example` to `.env` and fill in your Client ID:
   ```
   cp .env.example .env
   ```

3. Install and run:
   ```
   npm install
   node index.js
   ```

## Notes

- `state.json` stores `start_timestamp` on first run and is never overwritten — this is what makes the elapsed time survive restarts/crashes/reboots. Delete it manually to reset.
- The app retries connecting to Discord every ~12s if it's not running, and resumes without resetting the timestamp when Discord reopens.
- `.env` and `state.json` are gitignored — never commit real credentials.

## Security

Regenerate any Discord client secret/bot token that was ever pasted into a chat, file, or committed to a repo, even briefly — treat it as compromised. Only the **Client ID** (not the secret) belongs in `.env`, and only for this RPC use case.
=======

## 🛠️ Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
   cd your-repo-name
