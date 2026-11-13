#!/usr/bin/env python3
"""합격 판정기 (AI 도구와 무관).

SPEC.md 안의 `cmd: 명령` 표시를 모두 찾아 실행하고, 전부 성공하면 통과(종료 코드 0).
승인(approve) 이후에는 보호 파일(SPEC.md, tests/, 이 파일)이 바뀌었는지도 검사한다.

사용법 (프로젝트 루트에서):
    python scripts/verify.py           # 검사 실행
    python scripts/verify.py approve   # [사람] 합격 기준 승인 + 보호 파일 잠금
    python scripts/verify.py close     # [사람] 최종 확인 후 작업 종료
    python scripts/verify.py status    # 현재 상태 보기
"""
from __future__ import annotations

import datetime as dt
import glob
import hashlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SPEC = ROOT / "SPEC.md"
HARNESS = ROOT / ".harness"
LOCK = HARNESS / "lock.json"

DEFAULT_PROTECTED = ["SPEC.md", "scripts/verify.py", "tests/**/*"]
CMD_RE = re.compile(r"`cmd:\s*([^`]+)`")
PROTECT_RE = re.compile(r"`protect:\s*([^`]+)`")
CHECK_TIMEOUT_SEC = 600
TAIL_LINES = 40


def out(msg: str = "") -> None:
    sys.stdout.buffer.write((msg + "\n").encode("utf-8", "replace"))
    sys.stdout.flush()


def read_spec() -> str:
    if not SPEC.exists():
        out("SPEC.md가 없습니다. 먼저 합격 기준을 작성하세요 (spec 스킬).")
        sys.exit(1)
    return strip_comments(SPEC.read_text(encoding="utf-8"))


def strip_comments(text: str) -> str:
    return re.sub(r"<!--.*?-->", "", text, flags=re.DOTALL)


def parse_checks(spec: str) -> list[tuple[str, str]]:
    """(설명, 명령) 목록. 설명은 같은 줄의 체크박스 문구."""
    checks = []
    for line in spec.splitlines():
        m = CMD_RE.search(line)
        if not m:
            continue
        label = CMD_RE.sub("", line)
        label = re.sub(r"^\s*[-*]\s*\[[ xX]\]\s*", "", label).strip(" —-:")
        checks.append((label or m.group(1).strip(), m.group(1).strip()))
    return checks


def protected_patterns(spec: str) -> list[str]:
    return DEFAULT_PROTECTED + [m.group(1).strip() for m in PROTECT_RE.finditer(spec)]


def protected_files(patterns: list[str]) -> list[str]:
    files: set[str] = set()
    for pat in patterns:
        for p in glob.glob(str(ROOT / pat), recursive=True):
            path = Path(p)
            if path.is_file() and "__pycache__" not in path.parts:
                files.add(path.relative_to(ROOT).as_posix())
    return sorted(files)


def sha256(rel: str) -> str:
    data = (ROOT / rel).read_bytes().replace(b"\r\n", b"\n")
    return hashlib.sha256(data).hexdigest()


def load_lock() -> dict | None:
    if not LOCK.exists():
        return None
    return json.loads(LOCK.read_text(encoding="utf-8"))


def save_lock(lock: dict) -> None:
    HARNESS.mkdir(exist_ok=True)
    LOCK.write_text(json.dumps(lock, ensure_ascii=False, indent=2), encoding="utf-8")


def now() -> str:
    return dt.datetime.now().isoformat(timespec="seconds")


def check_protected(lock: dict) -> list[str]:
    """잠금 이후 바뀐 보호 파일 목록."""
    problems = []
    current = set(protected_files(lock["patterns"]))
    locked = lock["hashes"]
    for rel, h in locked.items():
        if rel not in current:
            problems.append(f"삭제됨: {rel}")
        elif sha256(rel) != h:
            problems.append(f"변경됨: {rel}")
    for rel in sorted(current - set(locked)):
        problems.append(f"추가됨: {rel}")
    return problems


def run_checks(checks: list[tuple[str, str]]) -> list[tuple[str, str, int, str]]:
    results = []
    env = dict(os.environ, PYTHONIOENCODING="utf-8")
    for label, cmd in checks:
        try:
            proc = subprocess.run(
                cmd, shell=True, cwd=ROOT, capture_output=True,
                encoding="utf-8", errors="replace", timeout=CHECK_TIMEOUT_SEC, env=env,
            )
            code, log = proc.returncode, (proc.stdout or "") + (proc.stderr or "")
        except subprocess.TimeoutExpired:
            code, log = 124, f"시간 초과 ({CHECK_TIMEOUT_SEC}초)"
        results.append((label, cmd, code, log))
    return results


def cmd_verify() -> int:
    spec = read_spec()
    checks = parse_checks(spec)
    if not checks:
        out("SPEC.md에 `cmd: 명령` 형식의 합격 기준이 없습니다.")
        out("VERIFY: FAIL (검사 항목 0개)")
        return 1

    failed = 0
    lock = load_lock()
    if lock and lock.get("active"):
        problems = check_protected(lock)
        if problems:
            failed += 1
            out("[실패] 보호 파일이 승인 이후 바뀌었습니다:")
            for p in problems:
                out(f"  - {p}")
            out("  → 되돌리거나, 기준 변경이 필요하면 사람에게 요청하세요 (재승인 필요).")

    for label, cmd, code, log in run_checks(checks):
        if code == 0:
            out(f"[통과] {label}")
        else:
            failed += 1
            out(f"[실패] {label}  (명령: {cmd}, 종료 코드 {code})")
            tail = log.strip().splitlines()[-TAIL_LINES:]
            for line in tail:
                out(f"    {line}")

    total = len(checks) + (1 if lock and lock.get("active") else 0)
    if failed:
        out(f"VERIFY: FAIL ({failed}/{total} 실패)")
        return 1
    out(f"VERIFY: PASS ({total}/{total})")
    if lock and lock.get("active"):
        lock["last_pass"] = now()
        save_lock(lock)
    return 0


def cmd_approve() -> int:
    spec = read_spec()
    checks = parse_checks(spec)
    if not checks:
        out("승인 불가: `cmd: 명령` 형식의 합격 기준이 하나도 없습니다.")
        return 1
    patterns = protected_patterns(spec)
    files = protected_files(patterns)
    save_lock({
        "active": True,
        "approved_at": now(),
        "patterns": patterns,
        "hashes": {rel: sha256(rel) for rel in files},
    })
    out(f"승인 완료: 검사 {len(checks)}개, 보호 파일 {len(files)}개 잠금")
    for rel in files:
        out(f"  - {rel}")
    return 0


def cmd_close() -> int:
    lock = load_lock()
    if not lock or not lock.get("active"):
        out("진행 중인 작업이 없습니다.")
        return 1
    if cmd_verify() != 0:
        out("종료 불가: verify를 통과해야 합니다.")
        return 1
    lock["active"] = False
    lock["closed_at"] = now()
    save_lock(lock)
    out("작업 종료 처리했습니다. 다음 작업은 SPEC.md를 새로 쓰고 approve 하세요.")
    return 0


def cmd_status() -> int:
    lock = load_lock()
    if not lock:
        out("상태: 승인 전 (자동 검증 루프 꺼짐)")
    elif lock.get("active"):
        out(f"상태: 진행 중 (승인 {lock['approved_at']}, 마지막 통과 {lock.get('last_pass', '없음')})")
    else:
        out(f"상태: 종료됨 ({lock.get('closed_at')})")
    if SPEC.exists():
        out(f"검사 항목: {len(parse_checks(strip_comments(SPEC.read_text(encoding='utf-8'))))}개")
    return 0


def main() -> int:
    action = sys.argv[1] if len(sys.argv) > 1 else "verify"
    actions = {"verify": cmd_verify, "approve": cmd_approve, "close": cmd_close, "status": cmd_status}
    if action not in actions:
        out(__doc__ or "")
        return 2
    return actions[action]()


if __name__ == "__main__":
    sys.exit(main())
