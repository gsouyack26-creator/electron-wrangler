#!/usr/bin/env python3
"""Extract device-tag placement from a CC566 electrical PDF into layout_cc566.json.

The backplate layout sheets carry a real selectable text layer (not raster),
so PyMuPDF gives us each device tag with its bounding box. Coords are
normalized 0..1 within the page; the Voltbench scales them into the
physical-view cabinet. Off-page tags are dropped.

Usage: python extract_layout.py [PDF_PATH] [OUT_JSON]
"""
import json
import os
import re
import sys

import fitz

# Backplate layout pages (1-based) -> section label. Only these sheets carry
# physical device placement; schematic/elementary pages are skipped.
PAGES = {2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 18: 11, 19: 12, 20: 13, 21: 14}
TAG = re.compile(r"^[A-Z]{2,5}\d{3,5}[A-Z]?$")  # CB1001 DISC0001 SR2301 MPCB5022 ...
# Drawing/cabinet labels that match TAG but are NOT devices.
DENY_PREFIX = re.compile(r"^(CC|REV|DWG|SHT|BOM|TYP|FO|PG|SEC)\d")

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_PDF = os.path.join(
    os.path.expanduser("~"), "Downloads", "Amazon ACY1_13XP33_SSE_Elec.pdf"
)
DEFAULT_OUT = os.path.join(HERE, "layout_cc566.json")


def extract(pdf_path, out_path):
    if not os.path.isfile(pdf_path):
        sys.exit(f"PDF not found: {pdf_path}")
    out = {}
    with fitz.open(pdf_path) as doc:
        for pg1, sec in PAGES.items():
            if pg1 > doc.page_count:
                print(f"  warn: page {pg1} beyond PDF ({doc.page_count} pages), skipping")
                continue
            pg = doc[pg1 - 1]
            w, h = pg.rect.width, pg.rect.height
            if w <= 0 or h <= 0:
                print(f"  warn: page {pg1} has zero-size rect, skipping")
                continue
            words = pg.get_text("words")
            if not words:
                print(f"  warn: page {pg1} has no text layer (raster-only?), skipping")
                continue
            for x0, y0, x1, y1, word, *_ in words:
                word = word.strip()
                if not TAG.match(word) or DENY_PREFIX.match(word):
                    continue
                if word in out:
                    if out[word]["page"] != pg1:
                        print(f"  dup {word}: keeping p{out[word]['page']}, skipping p{pg1}")
                    continue
                nx, ny = round(x0 / w, 4), round(y0 / h, 4)
                if not (0 <= nx <= 1 and 0 <= ny <= 1):
                    continue  # off-page (title-block cross-ref, overflow)
                out[word] = {
                    "x": nx, "y": ny,
                    "w": round((x1 - x0) / w, 4), "h": round((y1 - y0) / h, 4),
                    "page": pg1, "section": sec,
                }
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=1)
    print(f"wrote {out_path}: {len(out)} devices")
    return out


if __name__ == "__main__":
    pdf = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_PDF
    dst = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_OUT
    extract(pdf, dst)
