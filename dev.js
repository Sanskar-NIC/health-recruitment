
import { spawn, spawnSync } from 'node:child_process';
import http from 'node:http';
import { rmSync } from 'node:fs';
import { networkInterfaces } from 'node:os';

const isWin = process.platform === 'win32';
const BACKEND_HOST = '127.0.0.1';
const BACKEND_PORT = '8000';
const FRONTEND_PORT = 5173; // public, on the network IP

function getNetworkIp() {
    for (const list of Object.values(networkInterfaces())) {
        for (const net of list ?? []) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}

const networkIp = getNetworkIp();
const children = [];
let shuttingDown = false;

function shutdown(code = 0) {
    if (shuttingDown) return;
    shuttingDown = true;
    for (const { proc } of children) {
        if (proc.exitCode !== null) continue;
        if (isWin) {
            spawnSync('taskkill', ['/pid', String(proc.pid), '/T', '/F']);
        } else {
            proc.kill('SIGTERM');
        }
    }
    process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

const colors = { server: 36, queue: 35 };

function pipeWithPrefix(stream, name, out) {
    let buffer = '';
    stream.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop();
        for (const line of lines) {
            out.write(`\x1b[${colors[name]}m[${name}]\x1b[0m ${line}\n`);
        }
    });
}

function run(name, command, args, env = {}) {
    const proc = spawn(command, args, {
        env: { ...process.env, ...env },
        shell: isWin, // needed to resolve npm.cmd on Windows
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    children.push({ name, proc });
    pipeWithPrefix(proc.stdout, name, process.stdout);
    pipeWithPrefix(proc.stderr, name, process.stderr);
    proc.on('exit', (code) => {
        if (!shuttingDown) {
            console.log(`[${name}] exited with code ${code}; stopping all.`);
            shutdown(code ?? 1);
        }
    });
    return proc;
}

// 1. Build the frontend first (blocking). Pass `--skip-build` to reuse the existing public/build
// (frontend changes will NOT show up until you build again).
if (process.argv.includes('--skip-build')) {
    console.log('> skipping npm run build (--skip-build)');
} else {
    console.log('> npm run build');
    const build = spawnSync('npm', ['run', 'build'], {
        stdio: 'inherit',
        shell: isWin,
    });
    if (build.status !== 0) {
        console.error('npm run build failed; aborting.');
        process.exit(build.status ?? 1);
    }
}

// A leftover public/hot would make Laravel load from a Vite dev server.
rmSync('public/hot', { force: true });

const origin = `http://${networkIp}:${FRONTEND_PORT}`;

// 2. Backend on localhost.
run(
    'server',
    'php',
    ['artisan', 'serve', `--host=${BACKEND_HOST}`, `--port=${BACKEND_PORT}`],
    { APP_URL: origin, PHP_CLI_SERVER_WORKERS: "4" },
);
run('queue', 'php', ['artisan', 'queue:listen', '--tries=1', '--timeout=0']);

// 3. Public proxy on the network IP -> Laravel.
const proxy = http.createServer((req, res) => {
    const upstream = http.request(
        {
            host: BACKEND_HOST,
            port: Number(BACKEND_PORT),
            method: req.method,
            path: req.url,
            headers: req.headers,
        },
        (r) => {
            res.writeHead(r.statusCode, r.headers);
            r.pipe(res);
        },
    );
    upstream.on('error', () => {
        res.writeHead(502);
        res.end('Backend not ready yet, retry in a moment.');
    });
    req.pipe(upstream);
});

proxy.listen(FRONTEND_PORT, networkIp, () => {
    console.log(`\nApp (frontend): ${origin}`);
    console.log(`Backend:        http://localhost:${BACKEND_PORT}\n`);
});
proxy.on('error', (e) => {
    console.error(`Proxy error: ${e.message}`);
    shutdown(1);
});
