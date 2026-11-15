# 개발과 검증

## 개발 환경

- Node.js 22.13 이상, npm
- Git 저장소 루트에서 명령 실행
- 로컬 데이터: `.wrangler/state` — Git에 포함하지 않으며 백업 전에는 서버 중지

```sh
npm ci
npm run build
```

## 로컬 DB 준비

처음 설치한 DB에만 아래 세 마이그레이션을 순서대로 적용합니다. 빌드가 만든 로컬 Wrangler 설정을 사용합니다.

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_spotty_nomad.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_demonic_captain_universe.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0002_exotic_doctor_spectrum.sql
```

직전 버전에서 업데이트했다면 새 `0002`만 적용합니다. 이미 적용한 SQL을 반복 실행하거나 기존 DB를 지우지 않습니다. 이 작업 공간의 로컬 DB에는 세 마이그레이션이 적용되어 있습니다.

`db/schema.ts`를 변경한 경우 `npm run db:generate`로 다음 마이그레이션을 생성하고 SQL을 검토합니다. 이미 공유한 마이그레이션은 이름이나 내용을 바꾸지 않습니다.

## 실행

```sh
npm run dev
```

기본 주소는 `http://127.0.0.1:5173`입니다. 실제 주소는 터미널의 Local 출력을 따릅니다. 로그인 버튼은 로컬에서 개발용 `local_seedy` 계정으로 연결합니다. 브라우저의 풀이 임시 저장과 서버의 제출 기록을 구분합니다.

```sh
npm run start
```

빌드 결과를 로컬 Wrangler에서 실행하는 명령입니다. 웹사이트를 게시하지 않습니다. 외부 호스팅의 인증·DB 연동은 별도 설정입니다.

## 검증

```sh
npm run check
```

포맷, 타입, 단위 테스트와 프로덕션 빌드를 확인합니다. 단위 테스트는 다음을 검증합니다.

- 각 실습 분야 100개, 모의고사 5과목 × 20문항과 ID·자료·해설 연결
- 200개 리눅스·SQL 예시 답안의 실제 실행·채점
- 파일 권한·경로·원본 보존·오류 복구·루프 제한
- SQL의 동등한 조회, 변경 범위·바인딩·결과 제한·커밋
- 모의고사 미응답·과락·합격 기준과 입력 검증

포맷을 적용하려면 `npm run format`을 실행합니다. 외부 UI 원본과 생성된 파일은 대상에서 제외합니다.

로컬 dev 서버가 실행 중일 때:

```sh
npm run test:integration
```

`tests/integration/`은 인증·출처·입력 검증, 노트·완료·CTF 기록, 모의고사 전체 채점·응시 저장·중복 제출을 확인합니다. 기존 기록과 충돌하는 고정 ID는 덮어쓰지 않고 중단합니다. 테스트가 만든 기록만 정리합니다. `tests/helpers/`는 서버 전용 데이터 파일을 실행하지 않고 리터럴 정답 자료를 읽습니다.

독립 Python 실습:

```sh
python3 examples/python/encoding/challenge.py
python3 -m unittest discover -s examples/python/access-control -p 'test_*.py' -v
```

## 화면과 README

`docs/images/`에는 실제 로컬 앱에서 촬영한 화면만 저장합니다. 이미지와 소개는 같은 기능 상태를 보여줘야 합니다. 문항 수·난이도·학습 흐름이 바뀌면 README 표, 화면 캡처와 관련 안내를 함께 갱신합니다.

임시 화면 검증 자료는 무시되는 `outputs/`를 사용합니다. 사용자 학습 기록, 환경 파일, 인증 정보, 빌드·패키지 캐시는 커밋하지 않습니다.
