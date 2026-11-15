export function readDocument(mode:string,user:string,document:number){
 if(!['vulnerable','fixed'].includes(mode))return {status:400,reason:'invalid_mode'};
 if(!['alice','bob'].includes(user))return {status:401,reason:'unknown_user'};
 const docs:Record<number,{owner:string;content:string}>={1:{owner:'alice',content:'alice의 가상 문서'},2:{owner:'bob',content:'bob의 가상 문서'}};
 const entry=docs[document];if(!entry)return {status:404,reason:'not_found'};
 if(mode==='fixed'&&entry.owner!==user)return {status:403,reason:'forbidden'};
 return {status:200,reason:'ok',owner:entry.owner,content:entry.content};
}
