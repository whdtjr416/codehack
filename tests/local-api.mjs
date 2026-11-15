// Only run against the local development server. Uses and removes new fixtures.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const base='http://127.0.0.1:5173';
const anonymous=await fetch(base+'/api/training');assert.equal(anonymous.status,401);
const login=await fetch(base+'/signin-with-chatgpt?return_to=/',{redirect:'manual'});
assert.equal(login.status,302);
const cookie=login.headers.getSetCookie().map(x=>x.split(';')[0]).join('; ');assert.ok(cookie);
async function get(){const r=await fetch(base+'/api/training',{headers:{cookie}});assert.equal(r.status,200);return r.json();}
async function post(body,origin=base){return fetch(base+'/api/training',{method:'POST',headers:{cookie,origin,'Content-Type':'application/json'},body:JSON.stringify(body)});}
const before=await get();
const quizId='q-perm',noteId='pentest-scope',completeId='lesson-sys-perm';
const flags={permissions:'flag{640}',signature:'flag{png}',rot13:'flag{rot13_is_not_encryption}',subnet:'flag{192.0.2.0}',branches:'flag{42}',audit:'flag{103}'};
for(const id of Object.keys(flags))assert.ok(!before.solved.includes(id),'Existing CTF result: do not overwrite');
assert.equal(before.quiz[quizId],undefined,'Existing quiz data: do not overwrite');
assert.equal(before.notes[noteId],undefined,'Existing note: do not overwrite');
assert.ok(!before.completed.includes(completeId),'Existing progress: do not overwrite');
try{
 assert.equal((await post({action:'quiz',id:quizId,choice:0},'https://untrusted.invalid')).status,403);
 assert.equal((await post({action:'quiz',id:quizId,choice:99})).status,400);
 let r=await post({action:'quiz',id:quizId,choice:1});assert.equal(r.status,200);let d=await r.json();assert.equal(d.correct,false);assert.equal(d.attempts,1);assert.equal(d.answer,0);assert.ok(d.explanation);
 r=await post({action:'quiz',id:quizId,choice:0});d=await r.json();assert.equal(d.correct,true);assert.equal(d.attempts,2);
 r=await post({action:'quiz',id:quizId,choice:2});d=await r.json();assert.equal(d.correct,false);assert.equal(d.attempts,3);
 const marker='LOCAL_QA_NOTE_20261116';
 assert.equal((await post({action:'note',id:noteId,body:marker})).status,200);
 assert.equal((await post({action:'note',id:'not-in-catalog',body:marker})).status,400);
 assert.equal((await post({action:'note',id:noteId,body:'한'.repeat(8001)})).status,400);
 assert.equal((await post({action:'complete',id:completeId,completed:true})).status,200);
 assert.equal((await post({action:'complete',id:completeId,completed:true})).status,200);
 const after=await get();assert.equal(after.quiz[quizId].correct,false);assert.equal(after.quiz[quizId].attempts,3);assert.equal(after.notes[noteId],marker);assert.equal(after.completed.filter(x=>x===completeId).length,1);assert.deepEqual(after.solved,before.solved);
 assert.equal((await post({action:'complete',id:completeId,completed:false})).status,200);
 const vulnerable=await (await fetch(base+'/api/lab?mode=vulnerable&user=alice&document=2')).json();const fixed=await (await fetch(base+'/api/lab?mode=fixed&user=alice&document=2')).json();assert.equal(vulnerable.status,200);assert.equal(fixed.status,403);assert.equal(fixed.content,undefined);
 for(const [id,flag] of Object.entries(flags)){assert.equal((await post({action:'submit',id,flag:'flag{wrong}'})).status,200);const solved=await (await post({action:'submit',id,flag})).json();assert.equal(solved.correct,true);assert.equal(solved.solution.answer,flag);assert.ok(solved.solution.explanation.length);await post({action:'submit',id,flag});}
 const revealed=await (await post({action:'solution',id:'encoding'})).json();assert.equal(revealed.solution.answer,'flag{first_step_ctf}');
 const solvedState=await get();assert.equal(solvedState.solved.length,before.solved.length+Object.keys(flags).length);
 console.log('PASS: expanded CTF answers/idempotency, anonymous, origin, validation, quiz attempts/review, note persistence, completion idempotency, CTF score separation, lab comparison');
}finally{
 execFileSync(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--config','dist/server/wrangler.json','--persist-to','.wrangler/state','--command',`DELETE FROM solves WHERE user_id='local_seedy' AND challenge_id IN ('permissions','signature','rot13','subnet','branches','audit'); DELETE FROM quiz_results WHERE user_id='local_seedy' AND question_id='${quizId}'; DELETE FROM notes WHERE user_id='local_seedy' AND challenge_id='${noteId}' AND body='LOCAL_QA_NOTE_20261116'; DELETE FROM checkpoints WHERE user_id='local_seedy' AND item_id='${completeId}';`],{stdio:'pipe'});
 const restored=await get();assert.equal(restored.quiz[quizId],undefined);assert.equal(restored.notes[noteId],undefined);assert.ok(!restored.completed.includes(completeId));assert.deepEqual(restored.solved.sort(),before.solved.sort());console.log('Local fixtures removed; existing records retained.');
}
