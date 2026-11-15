import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { solves, notes, weeks, checkpoints, quizResults } from "../../../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { challenges, roadmap } from "../../../lib/training";
import { completionIds, studyItems, quizzes } from "../../../lib/curriculum";
import { answers } from "../../../lib/answers";
import { ctfSolution } from "../../../lib/ctf-solutions";
import { quizKeys } from "../../../lib/quiz-keys";
export const dynamic = "force-dynamic";
const response = (data: unknown, status=200) => Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
export async function GET() {
 const user = await getChatGPTUser(); if(!user) return response({error:"로그인이 필요합니다."},401);
 const db=getDb();
 const [done, entries, completed, checked, results]=await Promise.all([
  db.select().from(solves).where(eq(solves.userId,user.userId)),
  db.select().from(notes).where(eq(notes.userId,user.userId)),
  db.select().from(weeks).where(eq(weeks.userId,user.userId)),
  db.select().from(checkpoints).where(eq(checkpoints.userId,user.userId)),
  db.select().from(quizResults).where(eq(quizResults.userId,user.userId))
 ]);
 return response({solved:done.map(x=>x.challengeId),notes:Object.fromEntries(entries.map(x=>[x.challengeId,x.body])),weeks:completed.map(x=>x.week),completed:checked.map(x=>x.itemId),quiz:Object.fromEntries(results.map(x=>[x.questionId,{choice:x.choice,correct:x.correct,attempts:x.attempts}]))});
}
export async function POST(request:Request) {
 const user=await getChatGPTUser(); if(!user) return response({error:"로그인이 필요합니다."},401);
 if(request.headers.get("origin") !== new URL(request.url).origin) return response({error:"허용되지 않은 요청입니다."},403);
 if(Number(request.headers.get("content-length")||0)>40000) return response({error:"요청이 너무 큽니다."},413);
 let data; try {const raw=await request.text(); if(raw.length>20000)return response({error:"요청이 너무 큽니다."},413);data=JSON.parse(raw);}catch{return response({error:"잘못된 요청입니다."},400);}
 if(!data||typeof data!=="object"||Array.isArray(data))return response({error:"잘못된 요청입니다."},400);
 const db=getDb();
 if(data.action==="week" && Number.isInteger(data.week) && data.week>=1 && data.week<=roadmap.length && typeof data.completed==="boolean") {
  if(data.completed)await db.insert(weeks).values({userId:user.userId,week:data.week}).onConflictDoNothing();
  else await db.delete(weeks).where(and(eq(weeks.userId,user.userId),eq(weeks.week,data.week)));
  return response({ok:true});
 }
 if(data.action==="complete" && completionIds.includes(data.id) && typeof data.completed==="boolean") {
  if(data.completed)await db.insert(checkpoints).values({userId:user.userId,itemId:data.id}).onConflictDoNothing();
  else await db.delete(checkpoints).where(and(eq(checkpoints.userId,user.userId),eq(checkpoints.itemId,data.id)));
  return response({ok:true});
 }
 if(data.action==="quiz") {
  const question=quizzes.find(x=>x.id===data.id);
  if(!question||!Number.isInteger(data.choice)||data.choice<0||data.choice>=question.options.length)return response({error:"문항과 선택지를 확인하세요."},400);
  const key=quizKeys[question.id]; const correct=data.choice===key.answer;
  const values={userId:user.userId,questionId:question.id,choice:data.choice,correct,attempts:1,updatedAt:new Date().toISOString()};
  const [result]=await db.insert(quizResults).values(values).onConflictDoUpdate({target:[quizResults.userId,quizResults.questionId],set:{choice:data.choice,correct,attempts:sql`${quizResults.attempts} + 1`,updatedAt:values.updatedAt}}).returning();
  return response({correct,answer:key.answer,explanation:key.explanation,attempts:result.attempts});
 }
 if(data.action==="note" && [...challenges,...studyItems].some(x=>x.id===data.id) && typeof data.body==="string" && data.body.length<=8000) {
  await db.insert(notes).values({userId:user.userId,challengeId:data.id,body:data.body}).onConflictDoUpdate({target:[notes.userId,notes.challengeId],set:{body:data.body}});return response({ok:true});
 }
 if(data.action==="solution" && typeof data.id==="string") {
  const solution=ctfSolution(data.id);
  return solution ? response({solution}) : response({error:"문제를 찾을 수 없습니다."},400);
 }
 if(data.action==="submit" && challenges.some(x=>x.id===data.id) && typeof data.flag==="string" && data.flag.length<=200) {
  if(data.flag.trim()!==answers[data.id])return response({correct:false,message:"오답입니다.",solution:ctfSolution(data.id)});
  await db.insert(solves).values({userId:user.userId,challengeId:data.id,solvedAt:new Date().toISOString()}).onConflictDoNothing();
  return response({correct:true,message:"정답입니다.",solution:ctfSolution(data.id)});
 }
 return response({error:"입력값을 확인해주세요."},400);
}
