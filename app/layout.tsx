import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "코드핵 | 보안 학습",
  description: "리눅스 명령어, DB·SQL, CTF, 모의해킹과 정보보안기사 학습.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
