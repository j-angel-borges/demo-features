import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

export function zentrySyncPlugin(): Plugin {
  let isLocked = false;
  let latestCommand: any = null;
  const stateFilePath = path.resolve(process.cwd(), '../../sync-state.json');

  // Try to load initial state from shared disk file
  try {
    if (fs.existsSync(stateFilePath)) {
      const raw = fs.readFileSync(stateFilePath, 'utf-8');
      const parsed = JSON.parse(raw);
      isLocked = Boolean(parsed.locked);
      if (parsed.latestCommand) {
        latestCommand = parsed.latestCommand;
      }
    }
  } catch {
    // Fallback to in-memory defaults
  }

  const sseClients: any[] = [];

  const broadcastToClients = (locked: boolean) => {
    isLocked = locked;
    try {
      fs.writeFileSync(
        stateFilePath,
        JSON.stringify({ locked: isLocked, latestCommand, updatedAt: Date.now() })
      );
    } catch {
      // Ignore write errors
    }

    const payload = `data: ${JSON.stringify({ type: 'LOCK', locked: isLocked, timestamp: Date.now() })}\n\n`;
    for (let i = sseClients.length - 1; i >= 0; i--) {
      try {
        sseClients[i].write(payload);
      } catch {
        sseClients.splice(i, 1);
      }
    }
  };

  const broadcastCommand = (command: any) => {
    latestCommand = command;
    try {
      fs.writeFileSync(
        stateFilePath,
        JSON.stringify({ locked: isLocked, latestCommand, updatedAt: Date.now() })
      );
    } catch {
      // Ignore write errors
    }

    const payload = `data: ${JSON.stringify({ type: 'COMMAND', command: latestCommand, timestamp: Date.now() })}\n\n`;
    for (let i = sseClients.length - 1; i >= 0; i--) {
      try {
        sseClients[i].write(payload);
      } catch {
        sseClients.splice(i, 1);
      }
    }
  };

  return {
    name: 'zentry-cross-app-sync',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Set CORS headers for all sync requests
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control');

        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }

        const url = req.url || '';

        // GET /api/sync/lock
        if (url.startsWith('/api/sync/lock') && req.method === 'GET') {
          // Re-check disk file in case another app updated it
          try {
            if (fs.existsSync(stateFilePath)) {
              const raw = fs.readFileSync(stateFilePath, 'utf-8');
              const parsed = JSON.parse(raw);
              isLocked = Boolean(parsed.locked);
              if (parsed.latestCommand) latestCommand = parsed.latestCommand;
            }
          } catch {
            // Keep current
          }

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(JSON.stringify({ success: true, locked: isLocked }));
          return;
        }

        // POST /api/sync/lock
        if (url.startsWith('/api/sync/lock') && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => (body += chunk));
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              const newLocked = Boolean(data.locked);
              broadcastToClients(newLocked);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, locked: isLocked }));
            } catch (err: any) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err?.message || 'Invalid JSON' }));
            }
          });
          return;
        }

        // GET /api/sync/skinner-command
        if (url.startsWith('/api/sync/skinner-command') && req.method === 'GET') {
          try {
            if (fs.existsSync(stateFilePath)) {
              const raw = fs.readFileSync(stateFilePath, 'utf-8');
              const parsed = JSON.parse(raw);
              if (parsed.latestCommand) latestCommand = parsed.latestCommand;
            }
          } catch {
            // Keep current
          }

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(JSON.stringify({ success: true, command: latestCommand }));
          return;
        }

        // POST /api/sync/skinner-command
        if (url.startsWith('/api/sync/skinner-command') && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => (body += chunk));
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              const cmd = data.command || data;
              broadcastCommand(cmd);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, command: latestCommand }));
            } catch (err: any) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err?.message || 'Invalid JSON' }));
            }
          });
          return;
        }

        // GET /api/sync/events (SSE)
        if (url.startsWith('/api/sync/events') && req.method === 'GET') {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          });

          // Send current state immediately on connection
          try {
            if (fs.existsSync(stateFilePath)) {
              const raw = fs.readFileSync(stateFilePath, 'utf-8');
              const parsed = JSON.parse(raw);
              isLocked = Boolean(parsed.locked);
              if (parsed.latestCommand) latestCommand = parsed.latestCommand;
            }
          } catch {
            // Keep current
          }

          res.write(`data: ${JSON.stringify({ type: 'LOCK', locked: isLocked, timestamp: Date.now() })}\n\n`);
          if (latestCommand) {
            res.write(`data: ${JSON.stringify({ type: 'COMMAND', command: latestCommand, timestamp: Date.now() })}\n\n`);
          }
          sseClients.push(res);

          req.on('close', () => {
            const idx = sseClients.indexOf(res);
            if (idx !== -1) {
              sseClients.splice(idx, 1);
            }
          });
          return;
        }

        next();
      });
    },
  };
}
