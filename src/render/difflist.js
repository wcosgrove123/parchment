// Parchment — diff list
// The auto-generated appeared / vanished / persisted list, drawn inside the frame under the legend.
// set(diff, top) takes either a diff from views/diff.js (three sections: appeared, vanished, persisted) or
// { sections: [{ title, cls, items, small?, count?, note?, flow?, max?, maxLines?, empty? }] }, where an item is
// { label } or { text: [name, shorter name…], note?, year? }. A flow section runs its names on, wrapped.

export function createDiffList(root, { x1, y0 }) {
  const W = 236, PAD = 14, ROW = 17, MAX = 7, INDENT = 10;
  const TEXT_W = W - PAD * 2 - INDENT;
  const g = root.append('g').attr('class', 'difflist hidden');
  const box = g.append('rect').attr('class', 'difflist-box').attr('width', W);
  const body = g.append('g').attr('class', 'difflist-body').attr('transform', `translate(${PAD},${PAD})`);
  let top = y0, height = 0, shown = false;

  // Rendered width of a text element (0 where nothing is laid out, which then always fits).
  const widthOf = (t) => { try { return t.node().getComputedTextLength(); } catch { return 0; } };
  const altsOf = (it) => (it.text ? [].concat(it.text) : [it.label]).filter(Boolean);

  // One item on its own line: the first name that fits with its note, then without, then cut short.
  function line(y, it, cls) {
    const t = body.append('text').attr('class', `difflist-item ${cls}`).attr('x', INDENT).attr('y', y + 10);
    const name = t.append('tspan');
    if (it.year) t.append('tspan').attr('class', 'difflist-year').text(` ${it.year}`);
    const note = it.note ? t.append('tspan').attr('class', 'difflist-note').text(` · ${it.note}`) : null;
    const alts = altsOf(it);
    const fits = () => widthOf(t) <= TEXT_W;
    for (const withNote of note ? [true, false] : [false]) {
      if (note) note.style('display', withNote ? null : 'none');
      for (const a of alts) { name.text(a); if (fits()) return; }
    }
    if (note) note.remove();
    let s = alts[alts.length - 1] ?? '';
    name.text(s);
    while (!fits() && s.length > 4) { s = s.slice(0, -2).trimEnd(); name.text(`${s}…`); }
  }

  // Names run on, wrapped to the box: "Vermont 1791 · Kentucky 1792 · …".
  function flow(y, items, cls, maxLines = 12) {
    const probe = body.append('text').attr('class', `difflist-item ${cls}`);
    const w = (s) => { probe.text(s); return widthOf(probe); };
    // (SVG drops a text's own leading and trailing spaces, so the separator is measured between two letters)
    const sep = w('a · a') - w('aa');
    const room = TEXT_W - 4; // the years are italic, measured upright: a little slack
    const lines = [];
    let cur = [], curW = 0;
    for (const it of items) {
      const tail = it.year ? ` ${it.year}` : '';
      // the first name that fits a line on its own, else the last cut short
      let name = altsOf(it).find((a) => w(`${a}${tail}`) <= room);
      if (!name) { name = altsOf(it).at(-1) ?? ''; while (w(`${name}…${tail}`) > room && name.length > 4) name = name.slice(0, -2).trimEnd(); name = `${name}…`; }
      const tw = w(`${name}${tail}`);
      if (cur.length && curW + sep + tw > room) { lines.push(cur); cur = []; curW = 0; }
      curW += (cur.length ? sep : 0) + tw;
      cur.push({ ...it, name });
    }
    if (cur.length) lines.push(cur);
    probe.remove();
    const keep = lines.slice(0, maxLines);
    for (const l of keep) {
      const t = body.append('text').attr('class', `difflist-item ${cls}`).attr('x', INDENT).attr('y', y + 10);
      l.forEach((it, i) => {
        if (i) t.append('tspan').attr('class', 'difflist-sep').text(' · ');
        t.append('tspan').text(it.name);
        if (it.year) t.append('tspan').attr('class', 'difflist-year').text(` ${it.year}`);
      });
      y += ROW;
    }
    const rest = lines.slice(maxLines).reduce((n, l) => n + l.length, 0);
    return { y, rest };
  }

  function section(y, s) {
    const items = s.items ?? [];
    const small = s.small ?? 0;
    const head = body.append('text').attr('class', `difflist-head ${s.cls}`).attr('x', 0).attr('y', y + 10);
    const count = s.count !== undefined ? s.count : items.length + small;
    head.append('tspan').text(count == null ? s.title : `${s.title} · ${count}`);
    if (s.note) head.append('tspan').attr('class', 'difflist-note').text(`  ${s.note}`);
    // a heading too long for the box ("Democratic → Const. Union · 3") steps down a size rather than spill over
    const hw = widthOf(head), room = W - PAD * 2;
    if (hw > room) head.style('font-size', `${Math.max(9, (parseFloat(getComputedStyle(head.node()).fontSize) * room) / hw).toFixed(1)}px`);
    y += ROW + 2;
    if (!items.length && s.empty) {
      body.append('text').attr('class', 'difflist-more').attr('x', INDENT).attr('y', y + 10).text(s.empty);
      y += ROW;
    }
    let rest;
    if (s.flow) ({ y, rest } = flow(y, items, s.cls, s.maxLines));
    else {
      const list = items.slice(0, s.max ?? MAX);
      for (const it of list) { line(y, it, s.cls); y += ROW; }
      rest = items.length - list.length;
    }
    rest += small;
    if (rest > 0) {
      body.append('text').attr('class', 'difflist-more').attr('x', INDENT).attr('y', y + 10).text(`and ${rest} ${s.flow ? 'more' : 'smaller'}`);
      y += ROW;
    }
    return y + 8;
  }

  return {
    set(diff, at) {
      body.selectAll('*').remove();
      const sections = diff.sections ?? [
        { title: 'Appeared', cls: 'appeared', items: diff.appeared, small: diff.small.appeared },
        { title: 'Vanished', cls: 'vanished', items: diff.vanished, small: diff.small.vanished },
        { title: 'Persisted', cls: 'persisted', items: diff.persisted, small: diff.small.persisted },
      ];
      let y = 0;
      for (const s of sections) y = section(y, s);
      height = y + PAD;
      top = at;
      box.attr('height', height);
      g.attr('transform', `translate(${x1 - 22 - W},${top})`).classed('hidden', false);
      shown = true;
    },
    hide() { g.classed('hidden', true); shown = false; },
    // The list's rectangle on the sheet while it shows (a reserved zone for the label pass), else null.
    box: () => (shown ? { x: x1 - 22 - W, y: top, w: W, h: height } : null),
  };
}
