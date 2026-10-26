
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const port = 18080;
const base = `http://127.0.0.1:${port}`;

const child = spawn(
  process.execPath,
  ['apps/api/src/server.mjs'],
  {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: '',
      PORT: String(port),
    },
    stdio: 'ignore',
  }
);

const waitForServer = async () => {
  const deadline = Date.now() + 10000;

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(
        `API process exited unexpectedly with code ${child.exitCode}`
      );
    }

    try {
      const response = await fetch(`${base}/healthz`);
      if (response.ok) return;
    } catch {
      // The API may still be starting.
    }

    await new Promise(resolve => setTimeout(resolve, 200));
  }

  throw new Error('API did not become ready within 10 seconds');
};

test('API smoke checks', async t => {
  t.after(() => {
    if (child.exitCode === null) {
      child.kill('SIGTERM');
    }
  });

  await waitForServer();

  const health = await fetch(`${base}/healthz`);
  assert.equal(health.status, 200);
  assert.equal((await health.json()).status, 'ok');

  const programmes = await fetch(`${base}/api/v1/programmes`);
  assert.equal(programmes.status, 200);
  assert.equal((await programmes.json()).count, 10);
});