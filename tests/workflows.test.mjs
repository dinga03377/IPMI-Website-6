import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
const port=18087,base=`http://127.0.0.1:${port}`;let child;
const req=async(path,options={})=>{const r=await fetch(base+path,options);return {status:r.status,body:r.status===204?{}:await r.json().catch(()=>({}))};};
const post=(body,token)=>({method:'POST',headers:{'content-type':'application/json',...(token?{authorization:`Bearer ${token}`}:{})},body:JSON.stringify(body)});

test.before(async () => {
  child = spawn(process.execPath, ['src/server.mjs'], {
    cwd: new URL('../apps/api/', import.meta.url),
    env: {
      ...process.env,
      DATABASE_URL: '',
      PORT: String(port),
      ADMIN_EMAIL: 'workflow-admin@test.local',
      ADMIN_PASSWORD: 'WorkflowAdmin-2026!'
    },
    stdio: 'ignore'
  });

  const timeout = Date.now() + 10000;
  let startupError;

  child.once('error', (error) => {
    startupError = error;
  });

  while (Date.now() < timeout) {
    if (startupError) {
      throw startupError;
    }

    if (child.exitCode !== null) {
      throw new Error(
        `Workflow API exited before becoming ready (code ${child.exitCode})`
      );
    }

    try {
      const response = await fetch(`${base}/healthz`);

      if (response.ok) {
        return;
      }
    } catch {
      // The API may still be starting.
    }

    await delay(100);
  }

  child.kill();
  throw new Error('Workflow API did not become ready within 10 seconds');
});

test.after(()=>child?.kill());
test('public enquiries, newsletter and event interest persist in API workflow',async()=>{
 const enq=await req('/api/v1/public/enquiries',post({organisation:'Example Co',email:'contact@example.org',scope:'20 people',goals:'Leadership training'}));assert.equal(enq.status,201);assert.ok(enq.body.reference);
 assert.equal((await req('/api/v1/public/newsletter',post({email:'news@example.org'}))).status,201);
 assert.equal((await req('/api/v1/public/events/interest',post({eventName:'Open Day',email:'event@example.org'}))).status,201);
 const login=await req('/api/v1/auth/login',post({email:'workflow-admin@test.local',password:'WorkflowAdmin-2026!'}));assert.equal(login.status,200);const token=login.body.accessToken;
 assert.equal((await req('/api/v1/admin/enquiries',{headers:{authorization:`Bearer ${token}`}})).body.data.length,1);
 assert.equal((await req('/api/v1/admin/newsletter',{headers:{authorization:`Bearer ${token}`}})).body.data.length,1);
 assert.equal((await req('/api/v1/admin/events',{headers:{authorization:`Bearer ${token}`}})).body.data.length,1);
});
test('course authoring, enrolment, assessment submission and grading boundaries',async()=>{
 const al=await req('/api/v1/auth/login',post({email:'workflow-admin@test.local',password:'WorkflowAdmin-2026!'}));const admin=al.body.accessToken;
 const c=await req('/api/v1/admin/courses',post({slug:'test-course',title:'Test Course',description:'Test curriculum'},admin));assert.equal(c.status,201);
 assert.equal((await req('/api/v1/admin/courses/test-course',{method:'PATCH',headers:{'content-type':'application/json',authorization:`Bearer ${admin}`},body:JSON.stringify({status:'published'})})).status,200);
 const m=await req('/api/v1/admin/courses/test-course/modules',post({title:'Module One',content:'Learning content',sortOrder:1,published:true},admin));assert.equal(m.status,201);
 const a=await req('/api/v1/admin/courses/test-course/assessments',post({title:'Assessment One',instructions:'Answer the prompt',maxScore:20,published:true},admin));assert.equal(a.status,201);
 const email=`learner-${Date.now()}@example.org`;assert.equal((await req('/api/v1/auth/register',post({email,password:'CorrectHorseBattery12!',fullName:'Test Learner'}))).status,201);
 const ll=await req('/api/v1/auth/login',post({email,password:'CorrectHorseBattery12!'}));const learner=ll.body.accessToken;
 assert.equal((await req('/api/v1/courses/test-course/enrol',post({},learner))).status,201);
 assert.equal((await req('/api/v1/courses/test-course/modules',{headers:{authorization:`Bearer ${learner}`}})).body.data.length,1);
 const ass=(await req('/api/v1/courses/test-course/assessments',{headers:{authorization:`Bearer ${learner}`}})).body.data[0];assert.ok(ass);
 assert.equal((await req(`/api/v1/assessments/${ass.id}/submissions`,post({response:'My answer'},learner))).status,201);
 const subs=await req('/api/v1/admin/submissions',{headers:{authorization:`Bearer ${admin}`}});assert.equal(subs.body.data.length,1);
 const grade=await req(`/api/v1/admin/submissions/${subs.body.data[0].id}`,{method:'PATCH',headers:{'content-type':'application/json',authorization:`Bearer ${admin}`},body:JSON.stringify({score:18,feedback:'Good work'})});assert.equal(grade.status,200);assert.equal(grade.body.submission.score,18);
});
test('programme publishing, application review and staff role restrictions',async()=>{
 const login=await req('/api/v1/auth/login',post({email:'workflow-admin@test.local',password:'WorkflowAdmin-2026!'}));const admin=login.body.accessToken;
 const created=await req('/api/v1/admin/programmes',post({id:'review-programme',code:'IPMI-REVIEW',title:'Review Programme',category:'Management',level:'Professional',description:'Test',duration:'4 weeks'},admin));assert.equal(created.status,201);
 assert.equal((await req('/api/v1/admin/programmes/review-programme',{method:'PATCH',headers:{'content-type':'application/json',authorization:`Bearer ${admin}`},body:JSON.stringify({status:'published'})})).status,200);
 const email=`applicant-${Date.now()}@example.org`;assert.equal((await req('/api/v1/auth/register',post({email,password:'CorrectHorseBattery12!',fullName:'Application User'}))).status,201);const learner=(await req('/api/v1/auth/login',post({email,password:'CorrectHorseBattery12!'}))).body.accessToken;
 const submitted=await req('/api/v1/applications',post({programmeId:'review-programme',fullName:'Application User'},learner));assert.equal(submitted.status,201);
 const reviewed=await req(`/api/v1/admin/applications/${submitted.body.application.id}`,{method:'PATCH',headers:{'content-type':'application/json',authorization:`Bearer ${admin}`},body:JSON.stringify({status:'under_review',reviewNote:'Documents pending'})});assert.equal(reviewed.status,200);assert.equal(reviewed.body.application.status,'under_review');
 const user=(await req('/api/v1/admin/users',{headers:{authorization:`Bearer ${admin}`}})).body.data.find(x=>x.email===email);assert.ok(user);
 assert.equal((await req(`/api/v1/admin/users/${user.id}`,{method:'PATCH',headers:{'content-type':'application/json',authorization:`Bearer ${admin}`},body:JSON.stringify({role:'admissions'})})).status,200);
 const admissions=(await req('/api/v1/auth/login',post({email,password:'CorrectHorseBattery12!'}))).body.accessToken;
 assert.equal((await req('/api/v1/admin/applications',{headers:{authorization:`Bearer ${admissions}`}})).status,200);
 assert.equal((await req('/api/v1/admin/credentials',{headers:{authorization:`Bearer ${admissions}`}})).status,403);
});
