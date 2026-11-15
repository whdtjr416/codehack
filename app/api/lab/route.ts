import {readDocument} from '../../../lib/document-lab';
export async function GET(request:Request){const q=new URL(request.url).searchParams;const mode=q.get('mode')||'',user=q.get('user')||'',document=Number(q.get('document'));const result=readDocument(mode,user,document);return Response.json({simulation:true,...result},{headers:{'Cache-Control':'no-store'}});}
