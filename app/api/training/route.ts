import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { solves, notes, weeks } from "../../../db/schema";
import { eq, and } from "drizzle-orm";
import { challenges } from "../../../lib/training";
import { answers } from "../../../lib/answers";
export const dynamic = "force-dynamic";
const response = (data: unknown, status=200) => Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
export async function GET() {
 const user = await getChatGPTUser(); if(!user) return response({error:"로그인이 필요합니다."},401);
 const db=getDb(); const [done, entries, completed]=await Promise.all([db.select().from(solves).where(eq(solves.userId,user.userId)),db.select().from(notes).where(eq(notes.userId,user.userId)),db.select().from(weeks).where(eq(weeks.userId,user.userId))]);
 return response({solved:done.map(x=>x.challengeId),notes:Object.fromEntries(entries.map(x=>[x.challengeId,x.body])),weeks:completed.map(x=>x.week)});
}
export async function POST(request:Request) {
 const user=await getChatGPTUser(); if(!user) return response({error:"로그인이 필요합니다."},401);
 if(request.headers.get("origin") !== new URL(request.url).origin) return response({error:"허용되지 않은 요청입니다."},403);
 if(Number(request.headers.get("content-length")||0)>24000) return response({error:"요청이 너무 큽니다."},413);
 let data; try {const raw=await request.text(); if(raw.length>20000)return response({error:"요청이 너무 큽니다."},413);data=JSON.parse(raw);}catch{return response({error:"잘못된 요청입니다."},400);}
 if(!data||typeof data!=="object")return response({error:"잘못된 요청입니다."},400);
 const db=getDb();
 if(data.action==="week" && Number.isInteger(data.week) && data.week>=1 && data.week<=12 && typeof data.completed==="boolean") {
 if(data.completed)await db.insert(weeks).values({userId:user.userId,week:data.week}).onConflictDoNothing();
 else await db.delete(weeks).where(and(eq(weeks.userId,user.userId),eq(weeks.week,data.week)));
 return response({ok:true});
 }
 if(!challenges.some(x=>x.id===data.id))return response({error:"문제를 찾을 수 없습니다."},400);
 if(data.action==="note" && typeof data.body==="string" && data.body.length<=8000) {
 await db.insert(notes).values({userId:user.userId,challengeId:data.id,body:data.body}).onConflictDoUpdate({target:[notes.userId,notes.challengeId],set:{body:data.body}});return response({ok:true});
 }
 if(data.action==="submit" && typeof data.flag==="string" && data.flag.length<=200) {
 if(data.flag.trim()!==answers[data.id])return response({correct:false,message:"아직 정답이 아니에요. 관찰한 내용을 다시 확인해보세요."});
 await db.insert(solves).values({userId:user.userId,challengeId:data.id,solvedAt:new Date().toISOString()}).onConflictDoNothing();
 return response({correct:true,message:"정답입니다! 이제 원인과 방어 방법도 기록해보세요."});
 }
 return response({error:"입력값을 확인해주세요."},400);
}
