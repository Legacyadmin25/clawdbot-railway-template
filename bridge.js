const fetch = require('node-fetch');

const ARCHITECT_URL =
process.env.ARCHITECT_BRIDGE_URL ||
'http://openclaw-bridge.railway.internal:3000/tasks';

async function relayTask(task) {
try {
const res = await fetch(ARCHITECT_URL, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(task),
});

if (!res.ok) {
const text = await res.text();
console.error(
`[bridge] Architect responded ${res.status}: ${text}`.substring(0, 500)
);
}
} catch (err) {
console.error('[bridge] Failed to relay task:', err);
}
}

module.exports = {
emit(task) {
if (!task || typeof task !== 'object') return;
relayTask(task);
},
};
