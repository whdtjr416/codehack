import {test} from 'node:test';
import assert from 'node:assert/strict';
import initSqlJs from 'sql.js';
import {exercises} from '../lib/exercises.ts';
import {createLinuxRuntime,CONFIG} from '../lib/runtime/linux.ts';
import {createSqlRuntime} from '../lib/runtime/sql.ts';
const SQL=await initSqlJs();

test('9개 실행 문제의 예시 답안은 실제 실행 결과로 통과한다',async()=>{
 for(const exercise of exercises){
  const runtime=exercise.engine==='linux'?await createLinuxRuntime():createSqlRuntime(SQL);
  const result=await runtime.run(exercise.solution,exercise.id,exercise.params);
  assert.equal(result.correct,true,exercise.id);assert.equal(result.exitCode,0,exercise.id);runtime.close?.();
 }
});
test('리눅스 명령의 파일 상태·경로를 유지하고 권한을 정확히 표시한다',async()=>{
 const runtime=await createLinuxRuntime();
 assert.equal((await runtime.run('ls -l config.env','linux-permissions')).correct,false);
 assert.equal((await runtime.run('chmod u=rw,g=r,o= config.env','linux-permissions')).correct,true);
 const permission=await runtime.run('ls -l config.env','linux-permissions');assert.match(permission.stdout,/-rw-r-----/);
 await runtime.run('cd logs','linux-errors');assert.equal((await runtime.run('pwd','linux-errors')).stdout.trim(),'/home/student/logs');
 const pipe=await runtime.run("cat auth.log | grep 'result=failed' | wc -l",'linux-count');assert.equal(pipe.correct,true);
 assert.notEqual((await runtime.run('unknown_command','linux-count')).exitCode,0);
 assert.notEqual((await runtime.run('cat /etc/real-host-secret','linux-count')).exitCode,0);
 const fresh=await createLinuxRuntime();assert.equal((await fresh.run('stat -c %a config.env','linux-permissions')).stdout.trim(),'666');
});
test('백업은 출력이 아니라 파일과 원본의 내용으로 채점한다',async()=>{
 const runtime=await createLinuxRuntime();
 assert.equal((await runtime.run("echo 'backup completed'",'linux-backup')).correct,false);
 await runtime.run('mkdir -p backup','linux-backup');
 assert.equal((await runtime.run('cp config.env backup/config.env','linux-backup')).correct,true);
 const read=await runtime.run('cat config.env','linux-backup');assert.equal(read.stdout,CONFIG);
 assert.equal((await runtime.run("echo changed > config.env",'linux-backup')).correct,false);
});
test('루프 제한이 작동하고 가상 셸은 외부 명령을 실행하지 않는다',async()=>{
 const runtime=await createLinuxRuntime();
 const result=await runtime.run('while true; do echo x; done','linux-count');assert.notEqual(result.exitCode,0);assert.ok(result.stdout.length<=32000);
 assert.notEqual((await runtime.run('curl https://example.com','linux-count')).exitCode,0);
});
test('SQL은 조건과 정렬을 검사하며 동등한 쿼리도 통과한다',()=>{
 const runtime=createSqlRuntime(SQL);
 assert.equal(runtime.run('SELECT id,name FROM users','sql-filter').correct,false);
 assert.equal(runtime.run("select id as user_id, name as username from users where active <> 0 and role in ('analyst') order by id",'sql-filter').correct,true);
 assert.equal(runtime.run('SELEC name FROM users','sql-filter').exitCode,1);
 assert.equal(runtime.run('SELECT count(*) FROM users','sql-filter').tables[0].values[0][0],4);
 runtime.close();
});
test('UPDATE 범위·DB 상태 유지·초기화와 빈 결과를 검증한다',()=>{
 const runtime=createSqlRuntime(SQL);
 assert.equal(runtime.run('UPDATE users SET active=0','sql-update').correct,false);
 assert.equal(runtime.run('SELECT active FROM users','sql-update').tables[0].values.every(r=>r[0]===0),true);
 assert.equal(runtime.run('SELECT id FROM users WHERE id=99','sql-filter').tables[0].values.length,0);
 runtime.close();
 const fresh=createSqlRuntime(SQL);assert.equal(fresh.run('SELECT active FROM users WHERE id=1','sql-update').tables[0].values[0][0],1);fresh.close();
});
test('매개변수 바인딩과 결과 제한을 검증한다',()=>{
 const runtime=createSqlRuntime(SQL);
 assert.equal(runtime.run('SELECT id,name FROM users WHERE name=?','sql-bind',JSON.stringify(["O'Brien"])).correct,true);
 assert.equal(runtime.run('SELECT id,name FROM users WHERE name=?','sql-bind',JSON.stringify(["' OR 1=1 --"])).correct,false);
 assert.equal(runtime.run("SELECT 4,'O''Brien' /* ? */",'sql-bind',JSON.stringify(["O'Brien"])).correct,false);
 assert.throws(()=>runtime.run('SELECT 1','sql-filter','{"x":1}'),/JSON 배열/);
 const large=runtime.run('WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n WHERE x<500) SELECT x FROM n','sql-filter');assert.equal(large.truncated,true);assert.equal(large.tables[0].values.length,200);
 runtime.close();
});
