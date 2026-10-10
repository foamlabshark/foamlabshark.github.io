'use strict';
(() => {
  const host = document.querySelector('#fo-list');
  if (!host) return;
  const query = document.querySelector('#fo-query');
  const sort = document.querySelector('#fo-sort');
  const count = document.querySelector('#fo-count');
  const filters = [...document.querySelectorAll('[data-fo-category]')];
  const common = ['probes', 'sets', 'surfaces', 'fieldMinMax', 'volFieldValue', 'surfaceFieldValue', 'fieldAverage', 'forces', 'forceCoeffs', 'yPlus', 'wallHeatFlux', 'solverInfo'];
  let entries = [], category = '全部';
  function restore() {
    const params = new URLSearchParams(location.search);
    query.value = params.get('q') || '';
    category = filters.some(button => button.dataset.foCategory === params.get('category')) ? params.get('category') : '全部';
    sort.value = ['name', 'name-desc'].includes(params.get('sort')) ? params.get('sort') : 'common';
    for (const button of filters) {
      const selected = button.dataset.foCategory === category;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    }
  }
  function el(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function card(item) {
    const article = el('article', '', 'fo-quick-card');
    const header = el('header');
    const title = el('h2');
    const link = el('a', item.name); link.href = item.url; title.append(link);
    header.append(title, el('span', item.category, 'pill'));
    article.append(header, el('p', item.description));
    if (item.parameters) {
      const list = el('dl', '', 'config-focus'), value = el('dd', '', 'key-chips');
      // Keep each parameter (and any qualifying text) together as a text-only chip.
      item.parameters.split(/[、；，]/).map(part => part.replace(/`/g, '').trim()).filter(Boolean).forEach(part => value.append(el('span', part)));
      list.append(el('dt', '配置重点'), value); article.append(list);
    }
    const detail = el('a', '参数、配置与示例 →', 'text-link'); detail.href = item.url;
    article.append(detail);
    return article;
  }
  function render() {
    const terms = query.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const found = entries.filter(item => (category === '全部' || item.category === category) && terms.every(term => [item.name, item.category, item.description, item.parameters, item.searchText].join(' ').toLowerCase().includes(term)));
    found.sort((a, b) => {
      const names = a.name.localeCompare(b.name, 'en');
      if (sort.value === 'name') return names;
      if (sort.value === 'name-desc') return -names;
      const rank = name => common.includes(name) ? common.indexOf(name) : common.length;
      return rank(a.name) - rank(b.name) || names;
    });
    count.textContent = '找到 ' + found.length + ' 种功能对象';
    host.replaceChildren();
    if (!found.length) host.append(el('p', '没有匹配的功能对象。请调整关键词或选择“全部”。', 'empty-state'));
    window.FoamPagination.slice(host, found, render, 12).forEach(item => host.append(card(item)));
  }
  function update(push = false) {
    window.foamListState.write({q: query.value, category, sort: sort.value === 'common' ? '' : sort.value}, push);
    restore(); render();
    window.FoamDirectory?.nav();
  }
  restore();
  window.foamListState.remember(host);
  query.addEventListener('input', () => update());
  sort.addEventListener('change', () => update(true));
  filters.forEach(button => button.addEventListener('click', () => { category = button.dataset.foCategory; update(true); }));
  window.addEventListener('popstate', () => { restore(); render(); });
  Promise.all([fetch('/assets/function-objects.json').then(response => {
    if (!response.ok) throw new Error('Index unavailable');
    return response.json();
  }), window.foamReferenceRows({type:'functionObject'}).catch(() => null)]).then(([data, rows]) => {
    if (rows === null) entries = data;
    else {
      const original = new Map(data.map(item => [item.url, item]));
      entries = rows.filter(row => /^\/function-objects\/[a-z0-9-]+\/$/.test(row.metadata?.canonical_path || '')).map(row => ({
        ...(original.get(row.metadata.canonical_path) || {}),
        name: row.title, description: row.summary, category: row.series,
        url: original.has(row.metadata.canonical_path) ? row.metadata.canonical_path : '/read/?slug=' + encodeURIComponent(row.slug), linkLabel: '参数、配置与示例'
      }));
    }
    render();
  }).catch(() => {
    count.textContent = '速查索引暂时无法加载';
    host.append(el('p', '请刷新页面，或通过站内搜索查找工具名称。', 'empty-state'));
  });
})();
