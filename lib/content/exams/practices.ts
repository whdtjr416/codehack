import type { Practice } from "../types.ts";
export const practices: Practice[] = [
  {
    id: "practical-perm",
    title: "권한 진단 서술",
    subject: "시스템보안",
    prompt:
      "가상 서비스의 비밀 설정 파일이 666으로 설정되어 있다. 문제점, 변경 권한 예시, 정상 동작 검증을 서술하라.",
    criteria: [
      "모든 사용자의 읽기·쓰기 가능성을 설명",
      "소유자·실행 계정을 먼저 확인",
      "예: 소유자만 읽기·쓰기이면 600, 그룹 읽기가 필요하면 640",
      "서비스 재시작·설정 읽기 등 정상 기능 확인",
    ],
    related: "lesson-sys-perm",
  },
  {
    id: "practical-network",
    title: "방화벽 변경 계획",
    subject: "네트워크보안",
    prompt:
      "앱 서버 192.0.2.10만 DB 192.0.2.20의 TCP 5432에 접속해야 한다. 허용 규칙, 기본 정책, 검증과 복구 절차를 서술하라. 주소는 문서용 가상 주소다.",
    criteria: [
      "출발지·목적지·TCP·5432 명시",
      "불필요한 접근 거부와 규칙 순서 확인",
      "앱 서버 연결 허용·다른 출발지 차단 확인",
      "사전 백업·되돌리기 조건과 담당 기록",
    ],
    related: "lesson-net-filter",
  },
  {
    id: "practical-sql",
    title: "안전한 쿼리 수정",
    subject: "어플리케이션보안",
    prompt:
      'query = "SELECT * FROM users WHERE name = \\"" + name + "\\""\n문자열 조합의 문제점을 설명하고 Python sqlite3의 매개변수 쿼리로 고쳐라.',
    criteria: [
      "입력이 SQL 구조로 해석되는 문제 설명",
      '예: con.execute("SELECT * FROM users WHERE name = ?", (name,))',
      "특수 문자가 포함된 정상 이름·없는 사용자 검증",
      "DB 권한 축소는 추가 방어임을 구분",
    ],
    related: "lesson-app-input",
  },
  {
    id: "practical-crypto",
    title: "암호 기술 선택 근거",
    subject: "정보보안일반",
    prompt:
      "파일 기밀성, 파일 변경 확인, 발신자 서명 검증, 비밀번호 검증에 필요한 기술을 각각 쓰고 키 관리 유의점을 설명하라.",
    criteria: [
      "암호화·해시·전자서명·비밀번호 해시 구분",
      "전자서명 검증은 공개키, 서명 생성은 개인키",
      "비밀번호에는 salt와 전용 알고리즘 사용",
      "해시 단독으로 발신자를 인증할 수 없음을 설명",
    ],
    related: "lesson-gen-crypto",
  },
  {
    id: "practical-response",
    title: "사고 대응 서술",
    subject: "정보보안관리 및 법규",
    prompt:
      "한 계정이 다른 사용자의 문서를 조회한 로그가 발견됐다. 확인 사실, 추가 조사, 차단·수정·복구·재발 방지를 구분해 서술하라.",
    criteria: [
      "사용자·문서 소유자·응답·시간대 등 증거 확인",
      "성공 조회와 악의적 의도 단정 구분",
      "세션 회수 등 차단과 서버 인가 수정 구분",
      "정상 기능·차단 재검증, 영향 범위·통지 적용 요건 검토",
    ],
    related: "lesson-gov-incident",
  },
];
