import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"hack_p | 보안 학습",description:"CTF 문제 풀이, 점수, 진도 및 보안 분석 노트."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>}
