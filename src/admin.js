// Parchment — admin page (teacher side)
// The record table beside the live map: every row with its status, the problems with their reasons, coverage by
// unit and topic, and a place finder that shows a place on the map before anyone copies its id. Editing happens in
// the Google Sheet (data/sheet.json); this page reads it live. CED tags are shown here and nowhere students look.

import * as d3 from 'd3';
import { loadJSON } from './data/loader.js';
import { loadRecordsText, sheetRowURL } from './data/source.js';
import { validateRecords, yearLabel } from './data/records.js';
import { createStage } from './render/base.js';
import stage from './stages/afro-eurasia.json';
import extent from './trackers/extent.json';

const params = new URLSearchParams(location.search);

async function main() {
  const [calendar, ne, bathy, vocab, ced] = await Promise.all([
    loadJSON('data/calendar.json'), loadJSON('data/base/derived/ne.topojson'), loadJSON('data/base/derived/bathymetry.topojson'),
    loadJSON('data/vocab.json'), loadJSON('data/ced.json').catch(() => ({})),
  ]);
  const years = calendar.snapshots.map((s) => s.year);
  const bySnapshot = new Map(calendar.snapshots.map((s) => [s.year, s]));
  const snapshot = (year) => loadJSON(`data/base/derived/world_${year}.topojson`);
  const homeYear = (start) => years.find((y) => y >= start) ?? years[years.length - 1];

  const atlas = createStage(d3.select('#map'), stage, { ne, bathy }, { tracker: extent, years, onYear: (y) => showYear(y) });
  let shownYear = null, highlightId = null, marks = [];
  async function showYear(year, { highlight = highlightId, mark = marks } = {}) {
    highlightId = highlight; marks = mark;
    const topo = await snapshot(year);
    atlas.showSnapshot(year, topo, (f) => (highlight && f.properties.id === highlight ? { status: 'highlight', label: f.properties.name } : { status: 'muted' }));
    atlas.showMarks(marks);
    atlas.setYear(year, bySnapshot.get(year).source_year);
    shownYear = year;
  }

  const state = { unit: 'all', topic: 'all', tracker: 'all', tab: 'rows', selected: null, data: null, source: null };

  async function load() {
    const source = await loadRecordsText();
    state.source = source;
    state.data = source.text == null
      ? { records: [], templates: [], problems: [{ line: 0, id: '', message: 'the record table could not be loaded' }], examples: 0, total: 0 }
      : validateRecords(source.text, vocab);
    d3.select('#open-sheet').classed('hidden', !source.sheet?.edit_url).attr('href', source.sheet?.edit_url || '#');
    document.title = `Parchment · Admin (${state.data.total} rows)`;
    renderAll();
  }

  // Every row of the table, in sheet order, with a status for the dot.
  function allRows() {
    const { records, templates, problems } = state.data;
    const rows = [
      ...records.map((r) => ({ r, line: r.line, status: r.kind === 'point' && (r.lon == null || r.lat == null) ? 'nocoords' : r.qc_status === 'ok' ? 'ok' : r.qc_status === 'wrong' ? 'wrong' : r.qc_status === 'unsure' ? 'unsure' : 'unreviewed' })),
      ...templates.map((r) => ({ r, line: r.line, status: 'template' })),
      ...problems.filter((p) => p.raw).map((p) => ({ r: p.raw, line: p.line, status: 'problem', message: p.message })),
    ];
    return rows.sort((a, b) => a.line - b.line);
  }
  const STATUS_TEXT = { ok: 'reviewed ok', problem: 'skipped: has a problem', unreviewed: 'not yet reviewed', template: 'example row (never drawn)', wrong: 'marked wrong (not drawn)', unsure: 'marked unsure', nocoords: 'waiting for coordinates' };
  const passes = ({ r }) => (state.unit === 'all' || String(r.unit) === state.unit) && (state.topic === 'all' || r.topic === state.topic) && (state.tracker === 'all' || r.tracker === state.tracker);

  function renderAll() { renderFilters(); renderCoverage(); renderRows(); renderProblems(); renderDetail(); }

  function renderFilters() {
    const rows = allRows();
    const units = [...new Set(rows.map((x) => String(x.r.unit)).filter((u) => u && u !== 'null'))].sort((a, b) => a - b);
    const topics = [...new Set(rows.filter((x) => state.unit === 'all' || String(x.r.unit) === state.unit).map((x) => x.r.topic).filter(Boolean))].sort();
    const f = d3.select('#filters').html('');
    const sel = (label, key, opts, all) => {
      f.append('label').text(label);
      const s = f.append('select').on('change', function () { state[key] = this.value; if (key === 'unit') state.topic = 'all'; renderAll(); });
      s.selectAll('option').data([['all', all], ...opts.map((o) => [o, o])]).join('option').attr('value', (d) => d[0]).text((d) => d[1]).property('selected', (d) => d[0] === state[key]);
    };
    sel('unit', 'unit', units, 'all units');
    sel('topic', 'topic', topics, 'all topics');
    sel('tracker', 'tracker', Object.keys(vocab.trackers), 'all trackers');
    f.append('span').style('margin-left', 'auto').style('font-size', '12px').style('opacity', 0.75)
      .text(state.source.from === 'sheet' ? 'live from the Google Sheet' : state.source.from === 'fallback' ? `Sheet unreachable (${state.source.error}); saved copy` : 'from records.csv (no Sheet set yet)');
  }

  // Coverage: how many drawn rows each topic has in the chosen unit. Titles come from data/ced.json when filled.
  function renderCoverage() {
    const drawn = state.data.records.filter((r) => state.unit === 'all' || String(r.unit) === state.unit);
    const course = drawn[0]?.course === 'apush' ? 'apush' : 'apworld';
    const cedTopics = state.unit !== 'all' ? Object.entries(ced?.[course]?.units?.[state.unit]?.topics ?? {}) : [];
    const counts = d3.rollup(drawn, (v) => v.length, (r) => r.topic);
    const topics = cedTopics.length ? cedTopics.map(([code, t]) => ({ code, title: t.title ?? t })) : [...counts.keys()].filter(Boolean).sort().map((code) => ({ code }));
    const c = d3.select('#coverage').html('');
    if (!topics.length) { c.append('span').style('font-size', '12px').style('opacity', 0.7).text(state.unit === 'all' ? 'Pick a unit to see coverage by topic.' : 'No topics yet for this unit. Fill data/ced.json to list them all.'); return; }
    c.selectAll('span.chip').data(topics).join('span').attr('class', (t) => `chip ${counts.get(t.code) ? '' : 'empty'} ${state.topic === t.code ? 'active' : ''}`)
      .attr('title', (t) => t.title ?? '').html((t) => `${t.code} <b>${counts.get(t.code) ?? 0}</b>`)
      .on('click', (_, t) => { state.topic = state.topic === t.code ? 'all' : t.code; renderAll(); });
  }

  function renderRows() {
    const rows = allRows().filter(passes);
    const host = d3.select('#rows').html('');
    if (!rows.length) { host.append('p').style('opacity', 0.7).text('No rows match. Add one in the Sheet, then Reload.'); return; }
    const t = host.append('table').attr('class', 'rows');
    t.append('thead').append('tr').selectAll('th').data(['', 'label', 'tracker · kind', 'where', 'when', 'review']).join('th').text((d) => d);
    const tb = t.append('tbody');
    const tr = tb.selectAll('tr').data(rows, (x) => x.line).join('tr').classed('selected', (x) => state.selected === x.line).on('click', (_, x) => select(x.line));
    tr.append('td').html((x) => `<span class="dot ${x.status}" title="${STATUS_TEXT[x.status]}"></span><span class="muted">${x.line}</span>`);
    tr.append('td').text((x) => x.r.label || x.r.id || '(blank)');
    tr.append('td').html((x) => `${x.r.tracker}<br><span class="muted">${x.r.kind}${x.r.value ? ` · ${x.r.value}` : ''}</span>`);
    tr.append('td').text((x) => x.r.where);
    tr.append('td').text((x) => (typeof x.r.start === 'number' ? yearLabel(x.r) : `${x.r.start}–${x.r.end}`));
    tr.append('td').html((x) => x.status === 'problem' ? `<span class="muted">—</span>` : `${x.r.qc_status || '<span class="muted">pending</span>'}${x.r.qc_by ? ` <span class="muted">${x.r.qc_by}</span>` : ''}`);
  }

  function renderProblems() {
    const { problems } = state.data;
    const noCoords = state.data.records.filter((r) => r.kind === 'point' && (r.lon == null || r.lat == null));
    d3.select('[data-tab="problems"]').text(`Problems${problems.length ? ` (${problems.length})` : ''}`);
    const host = d3.select('#problems-tab').html('');
    if (!problems.length && !noCoords.length) { host.append('p').style('opacity', 0.7).text('No problems. Every row passes.'); return; }
    if (problems.length) {
      host.append('p').html(`<b>${problems.length}</b> row${problems.length === 1 ? '' : 's'} skipped. Each is kept in the Sheet; fix it there and Reload.`);
      host.append('ol').selectAll('li').data(problems).join('li').html((p) => `<b>line ${p.line}</b>${p.id ? ` (${p.id})` : ''}: ${esc(p.message)}`).on('click', (_, p) => select(p.line));
    }
    if (noCoords.length) host.append('p').html(`<b>${noCoords.length}</b> point row${noCoords.length === 1 ? '' : 's'} waiting for coordinates: ${noCoords.map((r) => esc(r.id)).join(', ')}. Run <code>npm run geocode</code> after pulling, or use Find a place to check the point.`);
  }

  async function select(line) {
    state.selected = line;
    const x = allRows().find((y) => y.line === line);
    renderRows(); renderDetail();
    if (!x) return;
    const r = x.r;
    const whereYear = /@(-?\d+)$/.exec(r.where || '')?.[1];
    const year = whereYear && years.includes(Number(whereYear)) ? Number(whereYear) : homeYear(Number(r.start) || years[0]);
    const isRegion = r.kind !== 'point' && /@-?\d+$/.test(r.where || '');
    const mark = r.kind === 'point' && r.lon != null && r.lat != null ? [{ ...r, shape: r.shape ?? 'rust-diamond' }] : [];
    await showYear(year, { highlight: isRegion ? r.where : null, mark });
  }

  function renderDetail() {
    const host = d3.select('#detail').html('');
    const x = state.selected != null ? allRows().find((y) => y.line === state.selected) : null;
    if (!x) { host.append('p').style('opacity', 0.75).text('Click a row to see it on the map, or use Find a place to check an id before you type it into the Sheet.'); return; }
    const r = x.r;
    const h = host.append('h2');
    h.append('span').text(r.label || r.id || '(blank)');
    h.append('span').attr('class', 'when').text(typeof r.start === 'number' ? yearLabel(r) : `${r.start}–${r.end}`);
    h.append('span').html(`<span class="dot ${x.status}"></span><span style="font-weight:400;font-variant:normal;letter-spacing:0;font-size:12px">${STATUS_TEXT[x.status]}</span>`);
    if (x.message) host.append('p').attr('class', 'warn').text(x.message);
    const dl = host.append('dl');
    const row = (k, v, cls) => { if (v === '' || v == null) return; dl.append('dt').text(k); dl.append('dd').attr('class', cls ?? null).html(v); };
    row('id', `<code>${esc(r.id)}</code>`);
    row('tracker', `${esc(r.tracker)} · ${esc(r.kind)}${r.value !== '' && r.value != null ? ` · ${esc(String(r.value))}` : ''}`);
    row('where', `<code>${esc(r.where)}</code>${r.lon != null ? ` <span class="muted">${r.lon}, ${r.lat}</span>` : ''}`);
    row('certainty', `${esc(r.certainty)} · ${esc(r.grade)}`);
    row('source', esc(r.source));
    row('framework', [r.course, r.unit != null && r.unit !== '' ? `unit ${r.unit}` : '', r.topic ? `topic ${r.topic}` : '', r.kc, r.theme ? `${r.theme}${ced?.[r.course]?.themes?.[r.theme] ? ` (${ced[r.course].themes[r.theme]})` : ''}` : ''].filter(Boolean).map(esc).join(' · '), 'ced');
    row('review', r.qc_status ? `${esc(r.qc_status)}${r.qc_by ? ` by ${esc(r.qc_by)}` : ''}${r.qc_note ? ` — ${esc(r.qc_note)}` : ''}` : 'not yet reviewed');
    const a = host.append('div').attr('class', 'actions');
    const url = sheetRowURL(state.source.sheet, x.line);
    if (url) a.append('a').attr('class', 'btn primary').attr('href', url).attr('target', '_blank').attr('rel', 'noopener').text(`Open row ${x.line} in the Sheet ↗`);
    else a.append('span').style('opacity', 0.7).text(`Row ${x.line} of records.csv. Set the Sheet in data/sheet.json to edit from here.`);
  }

  // Find a place: base-map names for regions; Wikidata for points, with the dot shown before the id is copied.
  function renderPlaces() {
    const host = d3.select('#places').html('');
    host.append('h3').text('A state or region (for where)');
    host.append('p').attr('class', 'note').text('Type part of a name as the base map spells it. Click a hit to see it, then copy the id into the Sheet.');
    const q1 = host.append('input').attr('placeholder', 'e.g. Ottoman, Songhai, Mughal');
    const hits1 = host.append('div');
    const units = vocab.base_units ?? [];
    q1.on('input', () => {
      const q = q1.property('value').trim().toLowerCase();
      hits1.html('');
      if (q.length < 2) return;
      const found = units.filter((u) => u.name.toLowerCase().includes(q) || u.id.includes(q)).slice(0, 40);
      hits1.selectAll('div.hit').data(found).join('div').attr('class', 'hit')
        .html((u) => `<span>${esc(u.name)}</span><code>${esc(u.id)}</code><span class="desc">${u.years.join(', ')}</span>`)
        .on('click', (e, u) => { copy(u.id, e.currentTarget); showYear(u.years[0], { highlight: u.id, mark: [] }); });
    });
    host.append('h3').text('A point (for a battle, founding, treaty)');
    host.append('p').attr('class', 'note').text('Searches Wikidata by name, only to put the dot in the right place. Check the dot on the map before copying the id; the claim itself comes from your sources.');
    const q2 = host.append('input').attr('placeholder', 'e.g. Battle of Panipat, Isfahan, Timbuktu');
    const hits2 = host.append('div');
    let timer;
    q2.on('input', () => {
      clearTimeout(timer);
      const q = q2.property('value').trim();
      hits2.html('');
      if (q.length < 3) return;
      timer = setTimeout(async () => {
        try {
          const res = await fetch(`https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&origin=*&language=en&limit=8&search=${encodeURIComponent(q)}`);
          const j = await res.json();
          hits2.selectAll('div.hit').data(j.search ?? []).join('div').attr('class', 'hit')
            .html((s) => `<span>${esc(s.label)}</span><code>${s.id}</code><span class="desc">${esc(s.description ?? '')}</span>`)
            .on('click', async (e, s) => {
              const r2 = await fetch(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&origin=*&props=claims&ids=${s.id}`);
              const v = (await r2.json()).entities?.[s.id]?.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
              if (!v) { d3.select(e.currentTarget).select('.desc').text('no coordinates on Wikidata for this item'); return; }
              copy(s.id, e.currentTarget);
              await showYear(shownYear ?? years[0], { highlight: null, mark: [{ id: `_find-${s.id}`, label: s.label, lon: v.longitude, lat: v.latitude, start: shownYear ?? years[0], end: shownYear ?? years[0], grade: 'exact', shape: 'rust-diamond', source: 'Wikidata (position only)' }] });
            });
        } catch (err) { hits2.html(`<p class="note">Wikidata not reachable (${esc(err.message)}).</p>`); }
      }, 350);
    });
  }

  function copy(text, el) {
    navigator.clipboard?.writeText(text).then(() => {
      const code = d3.select(el).select('code');
      const old = code.text(); code.text('copied ✓'); setTimeout(() => code.text(old), 1200);
    }).catch(() => {});
  }

  d3.selectAll('#tabs button').on('click', function () {
    state.tab = this.dataset.tab;
    d3.selectAll('#tabs button').classed('active', function () { return this.dataset.tab === state.tab; });
    d3.select('#rows').classed('hidden', state.tab !== 'rows');
    d3.select('#problems-tab').classed('hidden', state.tab !== 'problems');
    d3.select('#places').classed('hidden', state.tab !== 'places');
  });
  d3.select('#reload').on('click', () => load());
  renderPlaces();
  await showYear(Number(params.get('year')) || years[0]);
  await load();
  if (params.get('tab')) d3.select(`#tabs button[data-tab="${params.get('tab')}"]`).dispatch('click');
}

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

main().catch((err) => {
  console.error(err);
  d3.select('#problems').classed('hidden', false).text(`The admin page could not start: ${err.message}`);
});
