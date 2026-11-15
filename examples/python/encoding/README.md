# 01: 겹쳐진 메시지

난이도: 첫 입문. 보안 취약점 공격이 아닌 바이트 변환 연습이다.

`python3 examples/python/encoding/challenge.py`를 프로젝트 루트에서 실행한다.
출력된 문자열에서 `flag{...}`를 복원하자. 문제 소스를 읽어도 되지만 정답 검사 함수보다는 출력 데이터 분석부터 시작한다.

처음 25분은 직접 시도한다. 아래 힌트는 필요할 때 하나씩 확인한다.

<details><summary>힌트 1</summary>
출력 문자는 0~9와 a~f로만 구성된다. 두 글자가 한 바이트를 나타낼 수 있다.
</details>

<details><summary>힌트 2</summary>
Python의 bytes.fromhex를 사용해 첫 번째 변환을 되돌린다. 결과는 아직 flag가 아니다.
</details>

<details><summary>힌트 3</summary>
첫 변환 결과는 Base64다. Python 표준 라이브러리 base64의 b64decode로 확인한다.
</details>

완료 기준: 정답 검사 통과, 변환 코드 기록, 인코딩이 비밀을 보호하지 못하는 이유 설명.
