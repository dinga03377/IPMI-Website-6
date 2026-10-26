import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
const envFile=resolve(dirname(fileURLToPath(import.meta.url)),'../../../.env');
if(existsSync(envFile))process.loadEnvFile(envFile);
const {Pool}=pg;
if(!process.env.DATABASE_URL){console.error('DATABASE_URL is required to run migrations.');process.exit(1);}
const pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.DATABASE_SSL==='true'?{rejectUnauthorized:process.env.DATABASE_SSL_REJECT_UNAUTHORIZED!=='false'}:undefined});
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../../../database');
const migrations=['001_initial_schema.sql','003_v6_identity_admissions.sql','004_production_workflows.sql','005_public_content_management.sql','006_homepage_content_cleanup.sql','002_seed_programmes.sql'];
try{
 await pool.query('CREATE TABLE IF NOT EXISTS schema_migrations(name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
 for(const name of migrations){
  const exists=await pool.query('SELECT 1 FROM schema_migrations WHERE name=$1',[name]);
  if(exists.rowCount){console.log(`skip ${name}`);continue;}
  const sql=await readFile(resolve(root,name),'utf8');
  const client=await pool.connect();
  try{await client.query('BEGIN');await client.query(sql);await client.query('INSERT INTO schema_migrations(name) VALUES($1)',[name]);await client.query('COMMIT');console.log(`applied ${name}`);}catch(e){await client.query('ROLLBACK');throw new Error(`${name}: ${e.message}`);}finally{client.release();}
 }
 console.log('Database migrations complete.');
}catch(e){console.error(e.message);process.exitCode=1;}finally{await pool.end();}
