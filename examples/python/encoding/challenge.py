"""A local, dependency-free CTF warm-up. Run with Python 3."""

import argparse
import base64
import hmac


PAYLOAD = "5a6d78685a33746d61584a7a6446397a6447567758324e305a6e303d"


def main():
    parser = argparse.ArgumentParser(description="겹쳐진 메시지에서 flag를 복원하세요.")
    parser.add_argument("--check", metavar="FLAG", help="복원한 정답 검사")
    args = parser.parse_args()
    if args.check is None:
        print("메시지:", PAYLOAD)
        print("정답 형식: flag{...}")
        return
    expected = base64.b64decode(bytes.fromhex(PAYLOAD))
    correct = hmac.compare_digest(args.check.encode("utf-8"), expected)
    print("정답입니다! 풀이 과정을 기록하세요." if correct else "다시 시도하세요.")
    raise SystemExit(0 if correct else 1)


if __name__ == "__main__":
    main()
