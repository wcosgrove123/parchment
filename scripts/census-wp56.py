#!/usr/bin/env python3
"""Parchment — census-wp56.py

Reads the American Indian (later "American Indian, Eskimo, and Aleut") count for every state and census year,
1860-1990, from the Census Bureau's Population Division Working Paper No. 56 (Campbell Gibson and Kay Jung, 2002,
"Historical Census Statistics on Population Totals by Race, 1790 to 1990 ... for the United States, Regions,
Divisions, and States"), which is published only as a PDF.

Input is the PDF's text as `pdftotext -table` lays it out (one table row per line; pdftotext ships with Git for
Windows). The numbers run together ("1 485 053 1 402 727 11 045 ..."), so each row is split where the census's own
arithmetic holds: Total = White + Black + American Indian + Asian and Pacific Islander (+ Other race, where counted).
A row that no split satisfies is reported, never guessed.

Usage: pdftotext -table POP-twps0056.pdf wp56-table.txt
       python -P scripts/census-wp56.py POP-twps0056.pdf wp56-table.txt out.csv
Writes: state,year,aian,total,row  (row = the label as printed, e.g. "1890 3", so footnoted rows can be told apart)
"""
import csv
import re
import sys

YEAR = re.compile(r'^\s*(1[789]\d0)(?:\s*/?\s*(\d))?\s*\.{2,}\s*(.*)$')
TITLE = re.compile(r'Table (\d+)\.\s+(.+?)\s+-\s+Race\s+and\s+Hispanic\s+Origin')
NA = {'(NA)', '(X)', '-', '(Z)'}


def numbers(tokens, i):
    """Every way to read one cell starting at tokens[i]: (value, next index)."""
    t = tokens[i]
    if t in NA:
        return [(None, i + 1)]
    if re.fullmatch(r'\d{1,3}(,\d{3})+', t):  # "3,685,296": commas make it one number
        return [(int(t.replace(',', '')), i + 1)]
    if not re.fullmatch(r'\d{1,3}', t):
        return []
    out = []
    v, j = int(t), i + 1
    out.append((v, j))
    while j < len(tokens) and re.fullmatch(r'\d{3}', tokens[j]):
        v = v * 1000 + int(tokens[j])
        j += 1
        out.append((v, j))
    return out


def split_row(tokens, ncols):
    """A split of the row into ncols cells whose parts add up to the total. When more than one adds up (Ohio 1920:
    "186 187 151" can be Black 186,187 and Indian 151, or other groupings), the largest White, then the largest Black
    wins: those columns hold nearly everyone in every state, so the reading that gives them the most digits is the
    printed one. scripts/derive-us.mjs then checks every year's states against the national total."""
    found = []

    def rec(i, cells):
        if len(cells) == ncols:
            total, *parts = cells
            if total is not None and total == sum(p or 0 for p in parts):
                found.append(cells)
            return
        if i >= len(tokens):
            return
        for v, j in numbers(tokens, i):
            rec(j, cells + [v])

    rec(0, [])
    if not found:
        return None
    return max(found, key=lambda c: (c[1] or 0, c[2] or 0))


def main(pdf, table_txt, out):
    # Two readings of the same PDF: pypdf's text keeps most tables as rows; pdftotext -table recovers the pages that
    # pypdf reads column by column. Every row must pass the arithmetic check either way; the first reading wins.
    import pypdf
    pages_a = [p.extract_text() or '' for p in pypdf.PdfReader(pdf).pages]
    pages_b = open(table_txt, encoding='utf-8', errors='replace').read().split('\f')
    rows_a, prob_a = parse(pages_a)
    rows_b, prob_b = parse(pages_b)
    seen, rows = set(), []
    for r in rows_a + rows_b:
        k = (r['state'], r['row'])
        if k in seen:
            continue
        seen.add(k)
        rows.append(r)
    done = {f"{r['state']} {r['row']}" for r in rows}
    problems = sorted({p for p in prob_a + prob_b if p.split(':')[0] not in done})
    with open(out, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=['state', 'year', 'aian', 'total', 'row'])
        w.writeheader()
        w.writerows(rows)
    print(f'{len(rows)} rows from {len({r["state"] for r in rows})} tables; {len(problems)} rows read by neither')
    for p in problems:
        print('  not split:', p)


def parse(pages):
    rows, problems = [], []
    for text in pages:
        m = TITLE.search(text)
        if not m:
            continue
        place = re.sub(r'\s+', ' ', m.group(2)).strip()
        in_number = False
        for line in text.splitlines():
            if line.strip().startswith('NUMBER'):
                in_number = True
                continue
            if line.strip().startswith('PERCENT'):
                break
            if not in_number:
                continue
            ym = YEAR.match(line)
            if not ym:
                continue
            year, note, rest = int(ym.group(1)), ym.group(2), ym.group(3)
            if year < 1860:
                continue
            tokens = rest.replace(' ', ' ').split()
            # 1860-1870 rows run on into the free/slave columns: the race columns come first, so try six cells
            # (with Other race), then five, then four.
            cut = next((k for k, t in enumerate(tokens) if re.search(r'[A-Za-z]', t) and t not in NA), len(tokens))
            tokens = tokens[:cut]
            cells = None
            for ncols in (6, 5, 4):
                cells = split_row(tokens, ncols)
                if cells:
                    break
            label = f'{year}{" " + note if note else ""}'
            if not cells:
                problems.append(f'{place} {label}: {rest.strip()[:90]}')
                continue
            rows.append({'state': place, 'year': year, 'aian': cells[3], 'total': cells[0], 'row': label})
    return rows, problems


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], sys.argv[3])
