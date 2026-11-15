"""Local authorization simulation; no network or real user data."""
import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

USERS = {"alice", "bob"}
DOCUMENTS = {
    1: {"owner": "alice", "content": "Alice's training note"},
    2: {"owner": "bob", "content": "flag{check_document_ownership}"},
}


def read_document(user, document_id, mode):
    if mode not in {"vulnerable", "fixed"}:
        raise ValueError("Unknown mode")
    if user not in USERS:
        return {"allowed": False, "reason": "unknown_user"}
    document = DOCUMENTS.get(document_id)
    if document is None:
        return {"allowed": False, "reason": "not_found"}
    # Reference fix: authorize the authenticated user for this resource.
    if mode == "fixed" and document["owner"] != user:
        return {"allowed": False, "reason": "forbidden"}
    return {"allowed": True, "reason": "ok", "content": document["content"]}


def main():
    parser = argparse.ArgumentParser(description="가상 문서 접근 제어 실습")
    parser.add_argument("--mode", choices=["vulnerable", "fixed"], required=True)
    parser.add_argument("--user", required=True)
    parser.add_argument("--document", type=int, required=True)
    parser.add_argument("--log", type=Path, default=Path(__file__).with_name("events.jsonl"))
    args = parser.parse_args()
    result = read_document(args.user, args.document, args.mode)
    event = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "mode": args.mode, "user": args.user, "document": args.document,
        "allowed": result["allowed"], "reason": result["reason"],
    }
    # Do not copy document contents or flags into the audit log.
    with args.log.open("a", encoding="utf-8") as stream:
        stream.write(json.dumps(event, ensure_ascii=False) + "\n")
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
