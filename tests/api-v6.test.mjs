import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const port=18086;
let child;
const base=`http://127.0.0.1:${port}`;
const request=async(path,options={})=>{const r=await fetch(base+path,options);let body={};if(r.status!==204)body=await r.json();return {status:r.status,body,headers:r.headers};};



let serverOutput = '';

test.before(async () => {
  child = spawn(process.execPath, ['src/server.mjs'], {
    cwd: new URL('../apps/api/', import.meta.url),
    env: {
      ...process.env,
      DATABASE_URL: '',
      PORT: String(port),
      ADMIN_EMAIL: 'admin@test.local',
      ADMIN_PASSWORD: 'AdminPassword-2026!',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (data) => {
    serverOutput += data.toString();
  });

  child.stderr.on('data', (data) => {
    serverOutput += data.toString();
  });

  child.on('error', (error) => {
    serverOutput += `\nStartup error: ${error.message}`;
  });

  const deadline = Date.now() + 10000;

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Test API exited early:\n${serverOutput}`);
    }

    try {
      const response = await fetch(`${base}/healthz`);

      if (response.ok) {
        return;
      }
    } catch {
      // The server may still be starting.
    }

    await delay(100);
  }

  child.kill();

  throw new Error(
    `Test API did not become ready within 10 seconds.\n${serverOutput}`
  );
});

test.after(() => {
  if (child && child.exitCode === null) {
    child.kill();
  }
});


test('health and programme catalogue',async()=>{const h=await request('/healthz');assert.equal(h.status,200);const p=await request('/api/v1/programmes');assert.equal(p.status,200);assert.equal(p.body.count,10);});
test('register, login, session and application',async()=>{const email=`test-${Date.now()}@example.com`;const reg=await request('/api/v1/auth/register',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password:'CorrectHorseBattery12!'})});assert.equal(reg.status,201);const login=await request('/api/v1/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password:'CorrectHorseBattery12!'})});assert.equal(login.status,200);const token=login.body.accessToken;const me=await request('/api/v1/auth/me',{headers:{authorization:`Bearer ${token}`}});assert.equal(me.status,200);const app=await request('/api/v1/applications',{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${token}`},body:JSON.stringify({programmeId:'ppm'})});assert.equal(app.status,201);const mine=await request('/api/v1/applications/me',{headers:{authorization:`Bearer ${token}`}});assert.equal(mine.status,200);assert.equal(mine.body.data.length,1);});
test('authorization boundaries and admin dashboard',async()=>{const unauth=await request('/api/v1/admin/overview');assert.equal(unauth.status,401);const studentEmail=`student-${Date.now()}@example.com`;const reg=await request('/api/v1/auth/register',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:studentEmail,password:'CorrectHorseBattery12!'})});assert.equal(reg.status,201);const studentLogin=await request('/api/v1/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:studentEmail,password:'CorrectHorseBattery12!'})});assert.equal(studentLogin.status,200);const forbidden=await request('/api/v1/admin/overview',{headers:{authorization:`Bearer ${studentLogin.body.accessToken}`}});assert.equal(forbidden.status,403);const adminLogin=await request('/api/v1/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:'admin@test.local',password:'AdminPassword-2026!'})});assert.equal(adminLogin.status,200);assert.equal(adminLogin.body.user.role,'admin');const overview=await request('/api/v1/admin/overview',{headers:{authorization:`Bearer ${adminLogin.body.accessToken}`}});assert.equal(overview.status,200);assert.equal(overview.body.data.programmes,10);});

test('CORS, logout and malformed/oversized requests are handled safely',async()=>{
  const preflight=await request('/api/v1/auth/login',{method:'OPTIONS',headers:{origin:'http://localhost:5173','access-control-request-method':'POST','access-control-request-headers':'content-type'}});
  assert.equal(preflight.status,204);
  assert.equal(preflight.headers.get('access-control-allow-origin'),'http://localhost:5173');
  assert.match(preflight.headers.get('access-control-allow-methods')||'',/POST/);

  const badJson=await request('/api/v1/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:'{"email":'});
  assert.equal(badJson.status,400);
  assert.equal(badJson.body.error.code,'INVALID_JSON');

  const tooLarge=await request('/api/v1/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:'{"password":"'+'x'.repeat(1024*1024)+'"}'});
  assert.equal(tooLarge.status,413);
  assert.equal(tooLarge.body.error.code,'BODY_TOO_LARGE');

  const login=await request('/api/v1/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:'admin@test.local',password:'AdminPassword-2026!'})});
  assert.equal(login.status,200);
  const token=login.body.accessToken;
  const logout=await request('/api/v1/auth/logout',{method:'POST',headers:{authorization:`Bearer ${token}`} });
  assert.equal(logout.status,204);
  const after=await request('/api/v1/auth/me',{headers:{authorization:`Bearer ${token}`}});
  assert.equal(after.status,401);
});

test('login abuse protection activates after repeated failures',async()=>{
  for(let i=0;i<10;i++){
    const r=await request('/api/v1/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:`unknown-${i}@example.com`,password:'WrongPassword-2026!'})});
    assert.equal(r.status,401);
  }
  const limited=await request('/api/v1/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:'unknown-final@example.com',password:'WrongPassword-2026!'})});
  assert.equal(limited.status,429);
  assert.equal(limited.body.error.code,'RATE_LIMITED');
  assert.ok(Number(limited.headers.get('retry-after'))>0);
});
