#!/usr/bin/env python3
"""Rebuild tanpz-brain-chat.html from chat_template.html + chat_corpus.json + GROQ_API_KEY."""
import re
from pathlib import Path

SRC = Path(__file__).parent
OUT = SRC.parent / "tanpz-brain-chat.html"
ENV_FILE = Path.home() / ".config" / "watch" / ".env"


def read_env_key(name):
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        key, _, val = line.partition("=")
        if key.strip() == name:
            return val.strip()
    raise SystemExit(f"{name} not found in {ENV_FILE}")


def main():
    template = (SRC / "chat_template.html").read_text(encoding="utf-8")
    corpus = (SRC / "chat_corpus.json").read_text(encoding="utf-8")
    groq_key = read_env_key("GROQ_API_KEY")

    html = template.replace("__CORPUS_JSON__", corpus)
    html = html.replace("__GROQ_API_KEY__", groq_key)

    OUT.write_text(html, encoding="utf-8")
    print(f"wrote {OUT} ({OUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
