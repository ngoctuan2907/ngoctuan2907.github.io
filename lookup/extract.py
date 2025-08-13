#!/usr/bin/env python3
import argparse, os, sys, gzip
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

IGNORE_DIRS = {".git","node_modules",".next","build","dist",".cache",".venv","__pycache__",".turbo",".svelte-kit"}
TEXT_EXTS = {
    ".js",".jsx",".ts",".tsx",".mjs",".cjs",
    ".json",".md",".mdx",".yml",".yaml",
    ".css",".scss",".sass",".less",
    ".html",".htm",
    ".py",".sh",".env",".txt",".toml",".ini",".sql"
}
SEPARATOR = "-" * 80

def looks_textual(sample: bytes) -> bool:
    if b"\x00" in sample: return False
    if not sample: return True
    printable = set(range(32,127)) | {9,10,13}
    bad = sum(1 for b in sample if b not in printable)
    return (bad/len(sample)) <= 0.30

def is_text_file(p: Path) -> bool:
    if p.suffix.lower() in TEXT_EXTS: return True
    try:
        with open(p, "rb") as f: return looks_textual(f.read(4096))
    except Exception: return False

def iter_files(root: Path):
    for dp, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]
        for fn in filenames:
            yield Path(dp) / fn

def read_file(p: Path, max_bytes: int):
    try:
        with open(p, "rb") as f:
            data = f.read(max_bytes + 1)
        trunc = len(data) > max_bytes
        text = data[:max_bytes].decode("utf-8", errors="replace")
        if trunc:
            text += f"\n\n[... TRUNCATED: file exceeds {max_bytes} bytes ...]"
        return p, text
    except Exception as e:
        return p, f"[Error reading file: {e}]"

def open_out(path: Path, gzip_enabled: bool):
    return gzip.open(path, "wt", encoding="utf-8") if gzip_enabled else open(path, "w", encoding="utf-8")

def main():
    ap = argparse.ArgumentParser("Create a single catalog file of your repo’s source code.")
    ap.add_argument("--repo", default=".", help="Repo root (default: current dir)")
    ap.add_argument("--out",  default="lookup/output-files-contents-from-repo.txt", help="Output file")
    ap.add_argument("--max-bytes", type=int, default=1_200_000, help="Max bytes per file")
    ap.add_argument("--workers", type=int, default=min(8, os.cpu_count() or 2))
    ap.add_argument("--gzip", action="store_true", help="Write .gz")
    ap.add_argument("--include", action="append", default=[], help="Top-level dirs to include (repeatable). If omitted, scans all except ignored.")
    ap.add_argument("--extra-ignore-dir", action="append", default=[], help="Extra dirs to ignore (repeatable)")
    args = ap.parse_args()

    repo = Path(args.repo).resolve()
    if not repo.is_dir():
        print(f"[!] Not a directory: {repo}", file=sys.stderr); sys.exit(2)

    # ensure output dir exists
    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    # build the set of roots to scan
    top_entries = [p for p in repo.iterdir() if p.is_dir()]
    ignore = set(IGNORE_DIRS) | set(args.extra_ignore_dir)
    if args.include:
        roots = [repo / name for name in args.include if (repo / name).is_dir()]
    else:
        roots = [p for p in top_entries if p.name not in ignore]

    # collect candidate files
    files = []
    for r in roots:
        for p in iter_files(r):
            files.append(p)
    files.sort()

    # filter to textual
    text_files = [p for p in files if is_text_file(p)]

    # read files (parallel) keeping deterministic output ordering
    results = {}
    if args.workers > 1:
        with ThreadPoolExecutor(max_workers=args.workers) as ex:
            futs = {ex.submit(read_file, p, args.max_bytes): p for p in text_files}
            for fut in as_completed(futs):
                p, content = fut.result()
                results[p] = content
    else:
        for p in text_files:
            _, content = read_file(p, args.max_bytes)
            results[p] = content

    # write one big catalog
    with open_out(out_path, args.gzip) as out:
        out.write(f"{SEPARATOR}\nREPO: {repo}\nINCLUDE: {', '.join([r.name for r in roots])}\nFILES: {len(text_files)}\n{SEPARATOR}\n")
        for p in text_files:
            rel = p.relative_to(repo)
            out.write(f"\n--- FILE: {rel} ---\n")
            out.write(results[p])
            out.write("\n")

    print(f"[✓] Completed. {repo} → {out_path} ({len(text_files)} files)")

if __name__ == "__main__":
    main()
