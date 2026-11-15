# 코드핵 (CodeHack)

정해진 기간 없이 CTF·정보보안기사·모의해킹을 병행하는 개인 학습 웹 앱.
DB·SQL과 리눅스 명령어를 직접 실행하고, 문제를 풀면서 결과·정답·해설을 한 화면에서 확인한다. 웹사이트 배포는 별도로 진행한다.

## 구성

| 메뉴 | 제공 내용 | 기록 방식 |
|---|---|---|
| 리눅스 명령어 | 직접 실행 4문제 + 기존 학습 4개 | 실행 결과 채점·완료 기록·노트 |
| DB · SQL | SQLite 실행 5문제 + 기존 학습 4개 | 결과 표·자동 채점·완료 기록·노트 |
| CTF | 12개 문제, 7개 분야, 힌트, 서버 정답 검증 | 해결 기록·점수·노트 |
| 정보보안기사 | 5과목 개념 15개, 자체 제작 필기 15문항, 실기 서술 5과제 | 개념 완료·마지막 필기 결과·응시 횟수·오답 복습·답안 |
| 모의해킹 | 범위 설정, 접근 제어, SQL, 출력 처리, 세션, 보고서 6개 실습 | 직접 검토한 완료 여부·진단 보고서 |
| 학습 현황 | 분야별 바로가기, 진도, 접을 수 있는 공통 체크리스트 | 기존 기록 표시 |
| 노트 | 저장한 기록을 분야별 필터링 | Markdown 전체 내보내기 |

화면은 블랙·차콜 배경의 작업형 UI다. 왼쪽 메뉴를 유지하고, 문제 화면은 왼쪽 문제·입력창과 오른쪽 실행 결과·정답·해설로 구성한다. 입력창은 줄 번호를 표시하며, SQL 키워드는 파랑, 명령어·함수는 금색, 옵션은 청록, 문자열은 초록, 숫자는 주황, 변수는 보라로 구분한다. 입력창과 정답 예시에 같은 구문 색상을 적용한다. CTF와 필기는 제출 즉시 해설을 표시한다. 서술형과 모의해킹은 답안 저장 후 예시 답안과 검토 기준을 표시한다. 이전·다음 버튼으로 문제를 전환한다. 모바일은 위아래로 배치하고 실행 후 결과로 이동한다.

- 리눅스: [just-bash](https://github.com/vercel-labs/just-bash)의 가상 Bash와 메모리 파일시스템. 권한 변경, 로그 추출, 실패 횟수 계산, 백업을 실제 실행 상태와 출력으로 채점한다. 전체 Linux VM은 아니며 네트워크·실제 OS 파일·패키지 설치는 연결하지 않는다. `ls -l`은 라이브러리의 고정 권한 표시를 보완해 실제 가상 파일 권한을 표시한다.
- SQL: [sql.js](https://github.com/sql-js/sql.js)의 SQLite WASM을 사용한다. SELECT·JOIN·GROUP BY·UPDATE·매개변수 바인딩을 실행한다. `?` 입력값은 JSON 배열로 바인딩한다. 학습 기록을 저장하는 D1과는 별도의 메모리 DB다.
- 두 실행기는 Web Worker에서 실행하며 4초 제한·실행 중지·환경 초기화·최근 입력 다시 불러오기를 제공한다. SQL 결과는 최대 200행을 표시한다. 파일/테이블 변경과 입력 기록은 문제를 닫거나 초기화하면 사라지고, 로그인한 사용자의 완료 기록과 명시적으로 저장한 노트는 D1에 남는다.
- 실행 문제는 브라우저에서 채점하는 개인 연습용이다. 대회용 부정행위 방지 채점기가 아니며, 실행 실습 완료는 CTF 점수에 합산하지 않는다.
- 기존 기사 실기 권한 과제와 SQL 과제, SQL 모의해킹에서도 실행창을 사용할 수 있다. 코드 조건 통과와 서술형·보고서 검토 완료는 구분한다. 기존 학습 ID와 노트는 유지한다.

필기 연습 점수는 CTF 점수와 분리한다. 오답 목록은 마지막 제출이 오답인 문항이다.
실기와 모의해킹의 서술형 답안은 자동 채점하지 않는다. 본인이 답안·검토 기준·재검증 근거를 비교한다.
교재나 전체 출제기준을 대체하지 않는 입문 자료이며 실제 기출·공식 모범답안이 아니다.

## 로컬 실행

Node 22.13 이상과 npm이 필요하다. 처음 내려받는 경우 다음 순서로 준비한다.

```sh
git clone https://github.com/whdtjr416/codehack.git
cd codehack
npm ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_spotty_nomad.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_demonic_captain_universe.sql
npm run dev
```

터미널에 표시된 Local 주소(기본 `http://127.0.0.1:5173`)를 연다.
`로그인` 버튼은 로컬에서 개발용 `local_seedy` 계정으로 연결한다.
실제 ChatGPT 로그인은 배포 플랫폼의 기능이므로 로컬에서는 외부 인증이 필요 없다.

이미 설치와 DB 준비가 끝난 작업 폴더에서는 `npm run dev`로 다시 실행한다.
DB가 이미 있으면 적용한 마이그레이션을 다시 실행하지 않는다. 이전 버전에서 업그레이드할 때는 새 `0001`만 실행한다.

학습 기록은 `.wrangler/state`에 보관되며 Git 저장소에 포함되지 않는다. 이 폴더를 지우면 로컬 기록도 사라진다. 백업할 때는 먼저 서버를 중지한다.

## 검증

```sh
npm test
npx tsc --noEmit
npm run build
```

`npm test`는 기존 자료 연결, 9개 실행 정답, 오답·오류 복구, 파일 상태·권한·경로, SQL 변경 범위·바인딩·출력 제한, 루프 제한을 검사한다.

`node tests/local-api.mjs`는 로컬 dev 서버가 켜진 상태에서만 실행한다. 신규 시험용 기록을 만들고 정리한다. 같은 ID에 기존 기록이 있으면 덮어쓰지 않고 중단한다. 익명·교차 출처 차단, 퀴즈 결과·횟수·오답 전환, 노트 저장·입력 제한, 완료 중복 방지, CTF 점수 분리, 가상 접근 제어를 검사한다.

## 자료와 구현

- 시험 과목·방법 출처: [KCA 정보보안기사](https://www.cq.or.kr/qh_quagm01_020.do), 확인일 2026-11-16. 응시자격·일정·최신 출제기준은 공식 안내에서 확인한다.
- `lib/topics.ts`, `lib/exercises.ts`: 리눅스·DB 학습 목록과 실행 과제
- `components/execution-lab.tsx`, `lib/runtime/`: 실행 UI, Worker, 가상 Bash와 SQLite 엔진
- `lib/ctf-solutions.ts`, `lib/written-solutions.ts`: CTF 해설과 서술형 참고 답안
- `lib/curriculum.ts`: 기사 학습과 모의해킹 자료
- `lib/training.ts`: CTF와 기존 공통 학습 트랙
- `lib/answers.ts`, `lib/quiz-keys.ts`: 서버 전용 정답
- `public/labs/`: 내려받을 수 있는 가상 실습 자료
- `/api/lab`: 네트워크 대상을 입력받지 않는 문서 접근 제어 시뮬레이터
- DB의 `weeks`는 이전 버전과 호환을 위해 유지한 공통 트랙 저장 테이블명이다. 기간 제약이나 주간 일정 기능은 없다.

React / Vinext / Cloudflare D1 기반. 실제 외부 대상을 진단하는 플랫폼이 아니며 공개 경쟁 대회 운영 기능은 포함하지 않는다. 다른 호스팅 환경으로 직접 배포하려면 인증과 DB 연결을 그 환경에 맞춰 구성해야 한다.
