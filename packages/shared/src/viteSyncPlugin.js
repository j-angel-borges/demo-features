import fs from 'fs';
import path from 'path';
export function zentrySyncPlugin() {
    var isLocked = false;
    var latestCommand = null;
    var stateFilePath = path.resolve(process.cwd(), '../../sync-state.json');
    // Try to load initial state from shared disk file
    try {
        if (fs.existsSync(stateFilePath)) {
            var raw = fs.readFileSync(stateFilePath, 'utf-8');
            var parsed = JSON.parse(raw);
            isLocked = Boolean(parsed.locked);
            if (parsed.latestCommand) {
                latestCommand = parsed.latestCommand;
            }
        }
    }
    catch (_a) {
        // Fallback to in-memory defaults
    }
    var sseClients = [];
    var broadcastToClients = function (locked) {
        isLocked = locked;
        try {
            fs.writeFileSync(stateFilePath, JSON.stringify({ locked: isLocked, latestCommand: latestCommand, updatedAt: Date.now() }));
        }
        catch (_a) {
            // Ignore write errors
        }
        var payload = "data: ".concat(JSON.stringify({ type: 'LOCK', locked: isLocked, timestamp: Date.now() }), "\n\n");
        for (var i = sseClients.length - 1; i >= 0; i--) {
            try {
                sseClients[i].write(payload);
            }
            catch (_b) {
                sseClients.splice(i, 1);
            }
        }
    };
    var broadcastCommand = function (command) {
        latestCommand = command;
        try {
            fs.writeFileSync(stateFilePath, JSON.stringify({ locked: isLocked, latestCommand: latestCommand, updatedAt: Date.now() }));
        }
        catch (_a) {
            // Ignore write errors
        }
        var payload = "data: ".concat(JSON.stringify({ type: 'COMMAND', command: latestCommand, timestamp: Date.now() }), "\n\n");
        for (var i = sseClients.length - 1; i >= 0; i--) {
            try {
                sseClients[i].write(payload);
            }
            catch (_b) {
                sseClients.splice(i, 1);
            }
        }
    };
    return {
        name: 'zentry-cross-app-sync',
        configureServer: function (server) {
            server.middlewares.use(function (req, res, next) {
                // Set CORS headers for all sync requests
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control');
                if (req.method === 'OPTIONS') {
                    res.writeHead(200);
                    res.end();
                    return;
                }
                var url = req.url || '';
                // GET /api/sync/lock
                if (url.startsWith('/api/sync/lock') && req.method === 'GET') {
                    // Re-check disk file in case another app updated it
                    try {
                        if (fs.existsSync(stateFilePath)) {
                            var raw = fs.readFileSync(stateFilePath, 'utf-8');
                            var parsed = JSON.parse(raw);
                            isLocked = Boolean(parsed.locked);
                            if (parsed.latestCommand)
                                latestCommand = parsed.latestCommand;
                        }
                    }
                    catch (_a) {
                        // Keep current
                    }
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('Cache-Control', 'no-cache');
                    res.end(JSON.stringify({ success: true, locked: isLocked }));
                    return;
                }
                // POST /api/sync/lock
                if (url.startsWith('/api/sync/lock') && req.method === 'POST') {
                    var body_1 = '';
                    req.on('data', function (chunk) { return (body_1 += chunk); });
                    req.on('end', function () {
                        try {
                            var data = JSON.parse(body_1 || '{}');
                            var newLocked = Boolean(data.locked);
                            broadcastToClients(newLocked);
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ success: true, locked: isLocked }));
                        }
                        catch (err) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: (err === null || err === void 0 ? void 0 : err.message) || 'Invalid JSON' }));
                        }
                    });
                    return;
                }
                // GET /api/sync/skinner-command
                if (url.startsWith('/api/sync/skinner-command') && req.method === 'GET') {
                    try {
                        if (fs.existsSync(stateFilePath)) {
                            var raw = fs.readFileSync(stateFilePath, 'utf-8');
                            var parsed = JSON.parse(raw);
                            if (parsed.latestCommand)
                                latestCommand = parsed.latestCommand;
                        }
                    }
                    catch (_b) {
                        // Keep current
                    }
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('Cache-Control', 'no-cache');
                    res.end(JSON.stringify({ success: true, command: latestCommand }));
                    return;
                }
                // POST /api/sync/skinner-command
                if (url.startsWith('/api/sync/skinner-command') && req.method === 'POST') {
                    var body_2 = '';
                    req.on('data', function (chunk) { return (body_2 += chunk); });
                    req.on('end', function () {
                        try {
                            var data = JSON.parse(body_2 || '{}');
                            var cmd = data.command || data;
                            broadcastCommand(cmd);
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ success: true, command: latestCommand }));
                        }
                        catch (err) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: (err === null || err === void 0 ? void 0 : err.message) || 'Invalid JSON' }));
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
                            var raw = fs.readFileSync(stateFilePath, 'utf-8');
                            var parsed = JSON.parse(raw);
                            isLocked = Boolean(parsed.locked);
                            if (parsed.latestCommand)
                                latestCommand = parsed.latestCommand;
                        }
                    }
                    catch (_c) {
                        // Keep current
                    }
                    res.write("data: ".concat(JSON.stringify({ type: 'LOCK', locked: isLocked, timestamp: Date.now() }), "\n\n"));
                    if (latestCommand) {
                        res.write("data: ".concat(JSON.stringify({ type: 'COMMAND', command: latestCommand, timestamp: Date.now() }), "\n\n"));
                    }
                    sseClients.push(res);
                    req.on('close', function () {
                        var idx = sseClients.indexOf(res);
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
