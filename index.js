require('dotenv').config();
const fs = require('fs');
const path = require('path');
const RPC = require('discord-rpc');

const STATE_PATH = path.join(__dirname, 'state.json');
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;

if (!CLIENT_ID) {
  console.error('Missing DISCORD_CLIENT_ID in .env');
  process.exit(1);
}

// --- Persistent start timestamp ---
function loadOrCreateState() {
  if (fs.existsSync(STATE_PATH)) {
    const raw = fs.readFileSync(STATE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed.start_timestamp) return parsed;
  }
  const state = { start_timestamp: Math.floor(Date.now() / 1000) };
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
  return state;
}

const state = loadOrCreateState();
const startTimestamp = new Date(state.start_timestamp * 1000);

// --- RPC client with reconnect loop ---
const client = new RPC.Client({ transport: 'ipc' });
let ready = false;
let activityInterval = null;

async function setPresence() {
  try {
    await client.setActivity({
      details: 'Building Zeus St. Croix',
      state: 'github.com/Agrazel1459',
      startTimestamp,
      largeImageKey: 'main_image',
      largeImageText: 'Zeus St. Croix',
      smallImageKey: 'small_image',
      smallImageText: 'Visual Studio',
      buttons: [{ label: 'GitHub', url: 'https://github.com/Agrazel1459' }],
      instance: false,
    });
  } catch (err) {
    // Discord likely closed mid-session; let the disconnect handler deal with it
  }
}

client.on('ready', () => {
  ready = true;
  console.log('Connected to Discord. Presence active.');
  setPresence();
  if (activityInterval) clearInterval(activityInterval);
  activityInterval = setInterval(setPresence, 15000);
});

client.on('disconnected', () => {
  ready = false;
  console.log('Discord disconnected. Will retry connection...');
  if (activityInterval) {
    clearInterval(activityInterval);
    activityInterval = null;
  }
  attemptLogin();
});

function attemptLogin() {
  client.login({ clientId: CLIENT_ID }).catch(() => {
    console.log('Discord not detected. Retrying in 12s...');
    setTimeout(attemptLogin, 12000);
  });
}

attemptLogin();

process.on('SIGINT', () => {
  if (activityInterval) clearInterval(activityInterval);
  process.exit(0);
});
