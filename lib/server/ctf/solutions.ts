import "server-only";
import { extraCtfSolutions } from "./answer-bank.ts";
import { answers } from "./answers";
export type CtfSolution = { answer: string; explanation: string[]; code?: string };
const explanations: Record<string, { explanation: string[]; code?: string }> = {
  encoding: {
    explanation: [
      "먼저 hex 문자열을 바이트로 복원한 뒤 Base64를 디코딩합니다.",
      "인코딩은 표현을 바꾸는 방법이며 암호화처럼 비밀을 보호하지 않습니다.",
    ],
    code: "import base64\nraw = bytes.fromhex('5a6d78685a33746d61584a7a6446397a6447567758324e305a6e303d')\nprint(base64.b64decode(raw).decode())",
  },
  headers: {
    explanation: [
      "HTTP 헤더는 첫 빈 줄 이전입니다. X-Training-Flag 헤더 값이 정답입니다.",
      "클라이언트에 전달하는 헤더에는 비밀값을 넣지 않아야 합니다.",
    ],
  },
  ownership: {
    explanation: [
      "로그인은 인증(authentication)입니다. 문서에 접근할 권한은 인가(authorization)로 별도 확인합니다.",
      "서버에서 요청 사용자와 문서 소유자를 비교하고 타인 접근은 거절해야 합니다.",
    ],
    code: "if document.owner_id != user.id:\n    return 403\nreturn document.content",
  },
  logs: {
    explanation: [
      "03:12에 user=alice, owner=bob인데 status=200입니다. 타인 문서를 읽은 계정은 alice입니다.",
      "carol의 요청은 403으로 거부됐습니다. 시도와 성공을 구분합니다.",
    ],
  },
  xor: {
    explanation: [
      "같은 값으로 XOR를 두 번 적용하면 원래 바이트가 됩니다.",
      "각 바이트에 0x23을 다시 XOR해 문자열을 복원합니다.",
    ],
    code: "raw = bytes.fromhex('454f4244585b4c517c4a507c5146554651504a414f465e')\nprint(bytes(b ^ 0x23 for b in raw).decode())",
  },
  reverse: {
    explanation: [
      "candidate[::-1]은 문자열을 뒤집습니다. 비교 대상 eruces를 뒤집으면 secure입니다.",
      "클라이언트에 검증 규칙이 있으면 역분석할 수 있습니다.",
    ],
  },
  permissions: {
    explanation: [
      "소유자는 rw-=6, 그룹은 r--=4, 기타는 ---=0입니다. 따라서 640입니다.",
      "디렉터리의 x는 경로 탐색 권한이며 일반 파일의 실행 권한과 의미가 다릅니다.",
    ],
  },
  signature: {
    explanation: [
      "89 50 4E 47 0D 0A 1A 0A는 PNG 파일 시그니처입니다.",
      "확장자만 바뀌어도 이 바이트는 남을 수 있습니다. 시그니처만으로 파일 전체의 안전성을 확정하지 않습니다.",
    ],
  },
  rot13: {
    explanation: [
      "알파벳을 13칸 이동하는 ROT13을 다시 적용합니다. 괄호와 밑줄은 그대로입니다.",
      "ROT13은 키 없이 되돌릴 수 있어 비밀 보호에 적합하지 않습니다.",
    ],
    code: "import codecs\nprint(codecs.decode('synt{ebg13_vf_abg_rapelcgvba}', 'rot_13'))",
  },
  subnet: {
    explanation: [
      "/24는 앞 24비트를 네트워크 부분으로 사용합니다. 마지막 8비트는 호스트 부분입니다.",
      "192.0.2.77의 마지막 옥텟을 0으로 만들면 네트워크 주소는 192.0.2.0입니다.",
    ],
  },
  branches: {
    explanation: [
      "x × 3 = 126이므로 x = 42입니다. 42 % 2 = 0도 참입니다.",
      "AND로 연결된 두 조건을 모두 만족해야 합니다.",
    ],
  },
  audit: {
    explanation: [
      "alice의 event 101, 102는 denied입니다. 첫 success는 event 103입니다.",
      "로그인 성공 사실만으로 공격 성공이나 계정 탈취를 단정하지 않습니다.",
    ],
  },
};
export function ctfSolution(id: string): CtfSolution | undefined {
  if (extraCtfSolutions[id]) return extraCtfSolutions[id];
  const explanation = explanations[id];
  return explanation && answers[id] ? { answer: answers[id], ...explanation } : undefined;
}
