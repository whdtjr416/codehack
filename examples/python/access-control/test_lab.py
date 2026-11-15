import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from lab import read_document


class AccessControlTests(unittest.TestCase):
    def test_vulnerable_exposes_other_users_document(self):
        self.assertTrue(read_document("alice", 2, "vulnerable")["allowed"])

    def test_fixed_denies_cross_owner_access_in_both_directions(self):
        for user, document in [("alice", 2), ("bob", 1)]:
            with self.subTest(user=user):
                result = read_document(user, document, "fixed")
                self.assertFalse(result["allowed"])
                self.assertNotIn("content", result)

    def test_fixed_preserves_owner_access(self):
        for user, document in [("alice", 1), ("bob", 2)]:
            with self.subTest(user=user):
                self.assertTrue(read_document(user, document, "fixed")["allowed"])

    def test_missing_document_and_unknown_user(self):
        for mode in ["vulnerable", "fixed"]:
            self.assertEqual(read_document("alice", 99, mode)["reason"], "not_found")
            self.assertEqual(read_document("mallory", 1, mode)["reason"], "unknown_user")

    def test_cli_appends_audit_events_without_document_content(self):
        with tempfile.TemporaryDirectory() as folder:
            log = Path(folder) / "events.jsonl"
            for mode in ["vulnerable", "fixed"]:
                result = subprocess.run([
                    sys.executable, str(Path(__file__).with_name("lab.py")),
                    "--mode", mode, "--user", "alice", "--document", "2",
                    "--log", str(log),
                ], check=True, capture_output=True, text=True)
                self.assertEqual(json.loads(result.stdout)["allowed"], mode == "vulnerable")
            events = [json.loads(line) for line in log.read_text().splitlines()]
            self.assertEqual([e["allowed"] for e in events], [True, False])
            self.assertTrue(all("timestamp" in e for e in events))
            self.assertNotIn("flag{", log.read_text())
            self.assertTrue(all("content" not in e for e in events))


if __name__ == "__main__":
    unittest.main()
