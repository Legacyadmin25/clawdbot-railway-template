#!/bin/bash
# Start the bridge in the background
/usr/local/bin/node /app/bridge.js &
# Start the main agent in the foreground
exec /usr/local/bin/node /openclaw/dist/entry.js