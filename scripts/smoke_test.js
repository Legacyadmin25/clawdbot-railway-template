#!/usr/bin/env node
/*
 * Developer→Architect HTTP relay smoke test
 * Spins up a temporary local architect listener and verifies that bridge.js
 * posts a task payload successfully.
 */
const http = require('http');

async function run() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (req.method !== 'POST' || req.url !== '/tasks') {
        res.statusCode = 404;
        return res.end('not_found');
      }

      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: 'accepted' }));
          server.close(() => {
            resolve(payload);
          });
        } catch (err) {
          res.statusCode = 400;
          res.end('invalid_json');
          server.close(() => reject(err));
        }
      });
    });

    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      process.env.ARCHITECT_BRIDGE_URL = `http://127.0.0.1:${port}/tasks`;
      const { emit } = require('../bridge');
      emit({ id: 'smoke-test', type: 'ping', ts: new Date().toISOString() });
      setTimeout(() => {
        server.close(() => {
          reject(new Error('Timed out waiting for bridge POST'));
        });
      }, 5000);
    });

    server.on('error', (err) => {
      reject(err);
    });
  });
}

run()
  .then((payload) => {
    console.log('Smoke test passed. Architect received:', payload);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Smoke test failed:', err.message);
    process.exit(1);
  });
