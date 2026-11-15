import "server-only";
import { extraQuizKeys } from "./answer-bank.ts";
export const quizKeys: Record<string, { answer: number; explanation: string }> = {
  "q-perm": {
    answer: 0,
    explanation: "6=소유자 읽기·쓰기, 4=그룹 읽기, 0=기타 권한 없음이다.",
  },
  "q-mfa": {
    answer: 2,
    explanation:
      "비밀번호는 지식 요소, 하드웨어 키는 소유 요소다. 지식 요소 두 개는 서로 다른 요소의 결합이 아니다.",
  },
  "q-evidence": {
    answer: 1,
    explanation:
      "해시는 비교 대상의 동일성 확인을 돕지만 수집 전 진위나 로그의 완전성을 보장하지 않는다.",
  },
  "q-tcp": {
    answer: 1,
    explanation: "일반적인 TCP 3-way handshake는 SYN, SYN-ACK, ACK다. 연결 해제와 구분한다.",
  },
  "q-firewall": {
    answer: 1,
    explanation: "허용할 출발지·목적지·서비스를 제한하고 반환 트래픽과 정상 연결을 확인한다.",
  },
  "q-tls": {
    answer: 0,
    explanation:
      "전송 보호와 애플리케이션 인가는 별개다. TLS는 타인 문서 접근을 허용한 서버 로직을 수정하지 않는다.",
  },
  "q-sql": {
    answer: 2,
    explanation: "값과 SQL 구조를 분리한다. 동적 식별자는 별도 허용 목록이 필요할 수 있다.",
  },
  "q-xss": {
    answer: 3,
    explanation:
      "textContent는 값을 HTML로 파싱하지 않고 텍스트로 표시한다. HTML 허용 요구와는 별도로 판단한다.",
  },
  "q-cookie": {
    answer: 1,
    explanation:
      "HttpOnly는 JavaScript 쿠키 접근을 제한한다. XSS의 모든 영향이나 CSRF를 해결하지는 않는다.",
  },
  "q-cia": {
    answer: 2,
    explanation: "가용성은 필요할 때 서비스를 이용할 수 있는 성질이다.",
  },
  "q-sign": {
    answer: 0,
    explanation:
      "서명자의 개인키로 생성한 서명은 대응하는 공개키로 검증한다. 공개키가 누구의 것인지 신뢰 검증도 필요하다.",
  },
  "q-risk": {
    answer: 1,
    explanation: "같은 기술적 약점도 자산과 실제 운영 맥락에 따라 우선순위가 달라질 수 있다.",
  },
  "q-policy": {
    answer: 2,
    explanation: "최소 권한, 승인, 만료와 회수, 감사 기록을 함께 관리한다.",
  },
  "q-law": {
    answer: 1,
    explanation:
      "법규는 개정과 적용 조건을 확인해야 한다. 이 문제는 특정 법률 해석이나 기간을 단정하지 않는다.",
  },
  "q-rpo": {
    answer: 0,
    explanation:
      "RPO는 장애 후 어느 시점의 데이터까지 복구할지에 관한 목표다. RTO는 복구 시간 목표다.",
  },
};
Object.assign(quizKeys, extraQuizKeys);
