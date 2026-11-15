# 02: 타인의 문서가 보인다

목표: CTF의 접근 제어 문제를 방어·검증·로그 분석으로 연결한다.
Python 3 표준 라이브러리만 사용한다. 실제 계정·네트워크·외부 시스템을 사용하지 않는다.

## 상황

가상 문서 1은 alice, 문서 2는 bob의 소유다. 취약 버전은 문서 번호만 알면 내용을 반환한다. 문서 2에 연습용 flag가 있다.

여기서 `--user`는 로그인 후 신뢰할 수 있는 세션에서 얻었다고 가정한 사용자 식별자다. 실제 서비스가 요청자가 임의로 보낸 사용자 이름을 신뢰해도 된다는 뜻은 아니다. 이 실습은 인증이 아닌 문서 소유권 검사를 다룬다.

## 단계

1. `--mode vulnerable --user alice --document 1`과 `--document 2`의 결과를 비교하고 flag를 찾는다.
2. `lab.py`의 `read_document`에서 빠진 검사를 설명한다.
3. `--mode fixed`로 바꿔 타인 문서는 거부되고 소유자는 읽는지 확인한다. fixed는 참고 구현이다. 먼저 보았다면 독립 수정으로 기록하지 않는다.
4. 직접 수정 연습은 `lab.py`를 별도 파일로 복사해 취약 분기에 소유권 검사를 추가한다. 원본의 취약·수정 비교는 유지한다.
5. 아래 자동 검증을 실행한다. 직접 수정한 파일도 같은 조건으로 검사한다.
6. 생성된 `events.jsonl`을 읽어 사용자·문서·허용 여부를 정리한다. 접근 거부만으로 악의적인 공격이라고 단정할 수 있는지 설명한다.
7. `docs/templates/security-report.md`와 `docs/templates/incident-report.md`에 증거를 기록한다.

프로젝트 루트에서 실행:

```sh
python3 examples/python/access-control/lab.py --mode vulnerable --user alice --document 2
python3 examples/python/access-control/lab.py --mode fixed --user alice --document 2
python3 examples/python/access-control/lab.py --mode fixed --user bob --document 2
python3 -m unittest discover -s examples/python/access-control -p 'test_*.py' -v
```

명령은 실습 결과가 거부여도 정상 실행이면 종료 코드 0을 반환한다. 거부 여부는 출력의 `allowed`와 `reason`으로 확인한다. 로그는 기본적으로 이 실습 폴더의 `events.jsonl`에 누적된다. `--log 경로`로 별도 파일을 지정할 수 있다. 시간은 UTC로 기록한다.

완료 기준: 타인 접근 거부, 소유자 접근 허용, 없는 문서 처리, 알 수 없는 사용자 거부를 검증하고 근거를 보고한다. 이 예제는 소유권 정책만 다루며 운영 서비스의 완전한 보안 구현은 아니다.
