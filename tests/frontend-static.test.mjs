import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const main = await readFile(new URL('../apps/web/src/main.jsx', import.meta.url), 'utf8');
const css = await readFile(new URL('../apps/web/src/styles.css', import.meta.url), 'utf8');
const admin = await readFile(new URL('../apps/web/src/Admin.jsx', import.meta.url), 'utf8');
const adminHtml = await readFile(new URL('../apps/web/admin.html', import.meta.url), 'utf8');
const learnerHtml = await readFile(new URL('../apps/web/learn.html', import.meta.url), 'utf8');
const learner = await readFile(new URL('../apps/web/src/Learner.jsx', import.meta.url), 'utf8');
const migrationRunner = await readFile(new URL('../apps/api/scripts/migrate.mjs', import.meta.url), 'utf8');

test('frontend navigation uses a full-width header with constrained inner content', () => {
  assert.match(main, /<header className="nav">/);
  assert.match(main, /<div className="nav-inner shell">/);
  assert.match(css, /\.nav\{width:100%;/);
  assert.match(css, /\.nav-inner\{width:100%;display:flex/);
});

test('admin portal is a separate route and not embedded in public website', () => {
  assert.match(adminHtml, /noindex, nofollow/);
  assert.match(adminHtml, /admin-entry\.jsx/);
  assert.match(learnerHtml, /learn-entry\.jsx/);
  assert.match(learner, /\/api\/v1\/learning\/me/);
  assert.match(learner, /\/api\/v1\/assessments/);
  assert.match(admin, /Private staff access/);
  assert.match(admin, /\/api\/v1\/auth\/login/);
  assert.match(admin, /\/api\/v1\/admin\/overview/);
  assert.match(admin, /\/api\/v1\/admin\/applications/);
  assert.doesNotMatch(main, /id="admin" className="admin section"/);
  assert.doesNotMatch(main, /href="\/admin\//);
  assert.doesNotMatch(main, /AdminPassword-2026|AdminPassword-[0-9]+/);
});

test('public credential verification uses the API boundary', () => {
  assert.match(main, /\/api\/v1\/credentials\/verify\?id=/);
  assert.doesNotMatch(main, /value==='IPMI-2026-0001'/);
});


test('admin dashboard pages declare all form state and load the matching data routes', () => {
  assert.match(admin, /\[editingProgramme,\s*setEditingProgramme\]\s*=\s*useState\(null\)/);
  assert.match(admin, /\[siteContent,\s*setSiteContent\]\s*=\s*useState\(\{\}\)/);
  assert.match(admin, /Edit public homepage/);
  assert.match(admin, /Save homepage content/);
  assert.doesNotMatch(admin, /Homepage content JSON/);
  assert.match(admin, /\[eventDraft,\s*setEventDraft\]\s*=\s*useState\(/);
  assert.match(admin, /\[resourceDraft,\s*setResourceDraft\]\s*=\s*useState\(/);
  assert.match(admin, /\[membershipDraft,\s*setMembershipDraft\]\s*=\s*useState\(/);
  assert.match(admin, /'Finance & Operations':'events'/);
  assert.match(admin, /'Content & Knowledge':'resources'/);
  assert.match(admin, /'Site Content':'site-content'/);
  assert.match(admin, /'Content & Knowledge':'Knowledge Centre'/);
});

test('content-management migrations are included and public copy avoids stale placeholders', () => {
  assert.match(migrationRunner, /005_public_content_management\.sql/);
  assert.match(migrationRunner, /006_homepage_content_cleanup\.sql/);
  assert.doesNotMatch(main, /V3 FOUNDATION/);
  assert.doesNotMatch(main, /Privacy and governance documentation is planned/);
  assert.doesNotMatch(main, /statAccessValue\|\|'24\/7'/);
  assert.doesNotMatch(main, /statUnifiedValue\|\|'01'/);
});
