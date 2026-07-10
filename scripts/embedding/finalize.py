"""완료 보고 보장 장치 (finalizer).

임베딩 루프가 어떤 경로로 끝나든 — 성공, 실패, 중단 — 텔레그램으로 최종 상태를
한 번 보낸다. 무응답 종료를 구조적으로 막는 것이 목적이다.

사용:
    python finalize.py --status 완료 --iterations 3 --note "..."
    python finalize.py --wrap -- <실제 작업 명령>     # 명령을 감싸 실행 후 자동 보고

--wrap 모드에서는 자식 프로세스가 비정상 종료하거나 예외로 죽어도 finally 블록에서
보고가 나간다. 보고 내용에는 절대 키/토큰/개인정보를 넣지 않는다.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
LEDGER = REPO / "embedding-run-ledger.json"
KST = timezone(timedelta(hours=9))


def load_ledger() -> dict:
    if LEDGER.exists():
        return json.loads(LEDGER.read_text())
    return {"runs": []}


def record(task_id: str, status: str, iterations: int, note: str) -> dict:
    ledger = load_ledger()
    entry = {
        "task_id": task_id,
        "status": status,
        "iterations": iterations,
        "note": note,
        "reported_at_kst": datetime.now(KST).isoformat(timespec="seconds"),
    }
    ledger["runs"].append(entry)
    LEDGER.write_text(json.dumps(ledger, ensure_ascii=False, indent=2))
    return entry


def notify(entry: dict) -> bool:
    body = (
        f"[세모계 지식 임베딩 최종 보고]\n"
        f"작업 ID: {entry['task_id']}\n"
        f"상태: {entry['status']}\n"
        f"반복 횟수: {entry['iterations']}\n"
        f"보고 시각(KST): {entry['reported_at_kst']}\n"
        f"{entry['note']}"
    )
    proc = subprocess.run(
        ["hermes", "send", "--to", "telegram", body],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        print(f"[finalize] telegram 전송 실패: {proc.stderr.strip()[:200]}", file=sys.stderr)
    return proc.returncode == 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--task-id", default=datetime.now(KST).strftime("embed-%Y%m%d-%H%M%S"))
    ap.add_argument("--status", default="완료", choices=["완료", "부분 완료", "실패", "중단"])
    ap.add_argument("--iterations", type=int, default=0)
    ap.add_argument("--note", default="")
    ap.add_argument("--wrap", action="store_true", help="뒤따르는 명령을 실행하고 결과로 상태를 결정")
    ap.add_argument("cmd", nargs="*")
    args = ap.parse_args()

    status, note = args.status, args.note

    if args.wrap and args.cmd:
        try:
            proc = subprocess.run(args.cmd)
            status = "완료" if proc.returncode == 0 else "실패"
            note = note or f"exit_code={proc.returncode}"
        except BaseException as exc:  # noqa: BLE001 — 중단(KeyboardInterrupt) 포함
            status = "중단"
            note = note or f"{type(exc).__name__}"
        finally:
            entry = record(args.task_id, status, args.iterations, note)
            delivered = notify(entry)
            print(json.dumps({**entry, "telegram_delivered": delivered}, ensure_ascii=False))
        return 0 if status == "완료" else 1

    entry = record(args.task_id, status, args.iterations, note)
    delivered = notify(entry)
    print(json.dumps({**entry, "telegram_delivered": delivered}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
