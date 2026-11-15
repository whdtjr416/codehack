# HACK P Web

CTF 문제 제출·계정별 점수와 진도·보안 분석 노트를 제공하는 개인 훈련 웹 앱.

React / Vinext / Cloudflare Workers / D1. 로그인은 Sites의 ChatGPT 인증을 사용한다.

- 정답은 서버 전용 모듈에서 검사한다.
- 점수는 해결 기록에서 계산하고 사용자·문제 기본 키로 중복 득점을 막는다.
- 모든 기록은 인증된 사용자 ID에 연결한다.
- 힌트는 감점 없이 제공하고 트랙 목표 달성는 사용자가 직접 표시한다.
- 문제 6개는 입문 교육 자료다. 실제 취약한 네트워크 서비스를 실행하지 않는다.
- 학습 트랙의 추가 실습 자료는 아직 포함하지 않는다.

## 로컬 개발

```sh
npm ci
npm run db:generate
npm run build
```

생성된 `drizzle/*.sql` 중 미적용 마이그레이션을 순서대로 실행한다.

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_REPLACE.sql
npm run dev
```

실제 생성된 파일명으로 교체한다. 로컬 로그인: `/signin-with-chatgpt?return_to=/`. 로컬 데이터와 배포 데이터는 별개다.

## 검증 항목

오답 점수 미반영, 정답 후 새로고침, 중복 제출, 노트 저장·다시 열기, 트랙 목표 달성·취소, 카테고리·검색, 모바일, 로그아웃 시 제출 차단.

현재는 개인 훈련 MVP다. 공개 경쟁 대회 운영 전에는 속도 제한·동적 문제 격리·운영 감사 기록 등을 별도로 구현해야 한다.
