export const difficultyLevels = ["입문", "초급", "중급"] as const;
export type Difficulty = (typeof difficultyLevels)[number];

const practiceLevels: Record<string, Difficulty> = {
  "경로·파일": "입문",
  "텍스트 조회": "입문",
  "조회·조건": "입문",
  "검색·필터": "초급",
  "열 추출": "초급",
  권한: "초급",
  "출력·저장": "초급",
  "로그 분석": "초급",
  "치환·변환": "초급",
  "정렬·집계": "중급",
  "탐색·조합": "중급",
  집계: "초급",
  조인: "초급",
  "함수·표현식": "초급",
  바인딩: "초급",
  "서브쿼리·집합": "중급",
  "윈도 함수": "중급",
  "변경·트랜잭션": "중급",
};

const pentestLevels: Record<string, Difficulty> = {
  "보고·검증": "입문",
  "접근 제어": "초급",
  "인증·세션": "초급",
  브라우저: "초급",
  시스템: "초급",
  DB: "초급",
  네트워크: "초급",
  "입력 처리": "중급",
  API: "중급",
  "설정·공급망": "중급",
};

export function practiceDifficulty(topic?: string): Difficulty {
  return practiceLevels[topic ?? ""] ?? "초급";
}

export function pentestDifficulty(category: string): Difficulty {
  return pentestLevels[category] ?? "초급";
}
