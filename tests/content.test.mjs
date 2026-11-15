import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {challenges} from '../lib/training.ts';
import {lessons,quizzes,practices,pentests,subjects,studyItems,completionIds} from '../lib/curriculum.ts';
import {readDocument} from '../lib/document-lab.ts';

test('학습 항목 ID가 중복되지 않고 연결된 자료가 존재한다',()=>{
 const ids=[...challenges,...studyItems].map(x=>x.id);assert.equal(new Set(ids).size,ids.length);
 for(const l of lessons)assert.ok(challenges.some(c=>c.id===l.related));
 for(const q of quizzes){assert.ok(lessons.some(l=>l.id===q.lesson));assert.equal(q.options.length,4);}
 for(const p of practices)assert.ok(lessons.some(l=>l.id===p.related));
 for(const id of completionIds)assert.ok(ids.includes(id));
});
test('필기 5과목 각각 개념·연습·실기 자료가 있다',()=>{
 assert.equal(subjects.length,5);
 for(const s of subjects){assert.ok(lessons.filter(l=>l.subject===s).length>=3);assert.ok(quizzes.filter(q=>q.subject===s).length>=3);assert.ok(practices.some(p=>p.subject===s));}
});
test('모의해킹 다운로드 자료가 실제로 존재한다',async()=>{
 for(const p of pentests){const text=await readFile(new URL(`../public/labs/${p.id}.txt`,import.meta.url),'utf8');assert.ok(text.includes(p.evidence));assert.ok(text.includes(p.scope));}
});
test('접근 제어 수정은 타인 접근을 거부하고 정상 접근을 유지한다',()=>{
 assert.equal(readDocument('vulnerable','alice',2).status,200);
 assert.equal(readDocument('fixed','alice',2).status,403);
 assert.equal(readDocument('fixed','bob',1).status,403);
 assert.equal(readDocument('fixed','alice',1).status,200);
 assert.equal(readDocument('fixed','bob',2).status,200);
 assert.equal(readDocument('fixed','alice',99).status,404);
 assert.equal(readDocument('fixed','unknown',1).status,401);
 assert.equal(readDocument('invalid','alice',1).status,400);
});
