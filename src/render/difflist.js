// Parchment — diff list
// The auto-generated appeared / vanished / persisted list, drawn inside the frame under the legend.

export function createDiffList(root, { x1, y0 }) {
  const W = 236, PAD = 14, ROW = 17, MAX = 7;
  const g = root.append('g').attr('class', 'difflist hidden');
  const box = g.append('rect').attr('class', 'difflist-box').attr('width', W);
  const body = g.append('g').attr('transform', `translate(${PAD},${PAD})`);

  function section(y, title, items, small, cls) {
    body.append('text').attr('class', `difflist-head ${cls}`).attr('x', 0).attr('y', y + 10).text(`${title} · ${items.length + small}`);
    y += ROW + 2;
    const shown = items.slice(0, MAX);
    for (const it of shown) {
      body.append('text').attr('class', `difflist-item ${cls}`).attr('x', 10).attr('y', y + 10).text(it.label);
      y += ROW;
    }
    const rest = items.length - shown.length + small;
    if (rest > 0) {
      body.append('text').attr('class', 'difflist-more').attr('x', 10).attr('y', y + 10).text(`and ${rest} smaller`);
      y += ROW;
    }
    return y + 8;
  }

  return {
    set(diff, top) {
      body.selectAll('*').remove();
      let y = 0;
      y = section(y, 'Appeared', diff.appeared, diff.small.appeared, 'appeared');
      y = section(y, 'Vanished', diff.vanished, diff.small.vanished, 'vanished');
      y = section(y, 'Persisted', diff.persisted, diff.small.persisted, 'persisted');
      box.attr('height', y + PAD);
      g.attr('transform', `translate(${x1 - 22 - W},${top})`).classed('hidden', false);
    },
    hide() { g.classed('hidden', true); },
  };
}
