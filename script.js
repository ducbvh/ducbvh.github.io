/* Duke — monochrome portfolio · composed, minimal motion.
 * 1) Light / dark theme toggle (persisted, system-default).
 * 2) IntersectionObserver reveals (fade + rise), per-section stagger via --i.
 * 3) Nav gains a stronger hairline on scroll.
 * 4) Email copy affordance.
 * 5) ⌘K command palette — jump to sections / toggle theme / email.
 * All animation is bypassed under prefers-reduced-motion. */

var EMAIL = 'b.vinhhongduc22@gmail.com';

/* ─── Theme ─── */
var Theme = (function () {
  var root = document.documentElement;
  var mql = window.matchMedia('(prefers-color-scheme: dark)');

  function effective() {
    var set = root.getAttribute('data-theme');
    if (set === 'light' || set === 'dark') return set;
    return mql.matches ? 'dark' : 'light';
  }
  function apply(mode) {
    root.setAttribute('data-theme', mode);
    try { localStorage.setItem('theme', mode); } catch (e) {}
    var btn = document.getElementById('theme-toggle');
    if (btn) btn.setAttribute('aria-pressed', String(mode === 'dark'));
  }
  function toggle() { apply(effective() === 'dark' ? 'light' : 'dark'); }
  function init() {
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.setAttribute('aria-pressed', String(effective() === 'dark'));
      btn.addEventListener('click', toggle);
    }
  }
  return { toggle: toggle, init: init };
})();
Theme.init();

(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── Nav scroll-frost ─── */
  var nav = document.getElementById('nav');
  if (nav) {
    var ticking = false;
    function onScroll() { nav.classList.toggle('is-scrolled', window.scrollY > 16); ticking = false; }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();
  }

  /* ─── Copy email ─── */
  var copyBtn = document.querySelector('.strip__copy');
  if (copyBtn && navigator.clipboard) {
    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(EMAIL).then(function () {
        copyBtn.textContent = 'Copied';
        copyBtn.classList.add('is-copied');
        setTimeout(function () { copyBtn.textContent = 'Copy'; copyBtn.classList.remove('is-copied'); }, 1600);
      }).catch(function () {});
    });
  }

  /* ─── Reveals ─── */
  if (reduced || !('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-inview'); });
    return;
  }
  var sections = document.querySelectorAll('main > section, .hero, .foot-stmt');
  var io = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-inview'); });
      obs.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  sections.forEach(function (s) { if (s.querySelector('.reveal')) io.observe(s); });
})();

/* ─── Command palette · ⌘K / Ctrl+K ─── */
(function () {
  'use strict';
  var palette = document.getElementById('palette');
  var trigger = document.getElementById('cmdk-trigger');
  var input = document.getElementById('palette-input');
  var list = document.getElementById('palette-list');
  if (!palette || !trigger || !input || !list) return;

  var backdrop = palette.querySelector('[data-palette-close]');
  var rows = Array.prototype.slice.call(list.querySelectorAll('.palette__row'));
  var selected = 0;
  var lastFocus = null;

  var actions = {
    work:       function () { go('#work'); },
    experience: function () { go('#experience'); },
    blog:       function () { close(); window.location.href = 'blog.html'; },
    stack:      function () { go('#stack'); },
    theme:      function () { Theme.toggle(); close(); },
    email:      function () { close(); window.location.href = 'mailto:' + EMAIL; },
    copy:       function () {
      if (navigator.clipboard) { navigator.clipboard.writeText(EMAIL).catch(function () {}); }
      var btn = document.querySelector('.strip__copy');
      if (btn) { btn.textContent = 'Copied'; btn.classList.add('is-copied'); }
      close();
    }
  };

  function go(hash) {
    var el = document.querySelector(hash);
    close();
    if (el && el.scrollIntoView) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    else { window.location.hash = hash; }
  }
  function visibleRows() { return rows.filter(function (r) { return !r.hidden; }); }
  function setSelected(idx) {
    var vis = visibleRows();
    if (!vis.length) { selected = -1; input.removeAttribute('aria-activedescendant'); return; }
    if (idx < 0) idx = vis.length - 1;
    if (idx >= vis.length) idx = 0;
    selected = idx;
    rows.forEach(function (r) { r.setAttribute('aria-selected', 'false'); });
    var cur = vis[selected];
    cur.setAttribute('aria-selected', 'true');
    input.setAttribute('aria-activedescendant', cur.id);
    cur.scrollIntoView({ block: 'nearest' });
  }
  function filter(q) {
    q = q.trim().toLowerCase();
    rows.forEach(function (r) { r.hidden = q !== '' && r.textContent.toLowerCase().indexOf(q) === -1; });
    setSelected(0);
  }
  function isOpen() { return !palette.hidden; }
  function open() {
    if (isOpen()) return;
    lastFocus = document.activeElement;
    palette.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    input.value = ''; filter(''); setSelected(0); input.focus();
  }
  function close() {
    if (!isOpen()) return;
    palette.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    var dest = (lastFocus && lastFocus.focus && lastFocus !== document.body) ? lastFocus : trigger;
    dest.focus();
  }
  function toggle() { isOpen() ? close() : open(); }
  function activate() {
    var vis = visibleRows();
    if (selected < 0 || !vis[selected]) return;
    var cmd = vis[selected].getAttribute('data-cmd');
    if (actions[cmd]) actions[cmd](); else close();
  }

  trigger.addEventListener('click', open);
  if (backdrop) backdrop.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); toggle(); }
  });
  palette.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(selected + 1); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(selected - 1); return; }
    if (e.key === 'Enter') { e.preventDefault(); activate(); return; }
  });
  input.addEventListener('input', function () { filter(input.value); });
  rows.forEach(function (row) {
    row.addEventListener('mousemove', function () {
      var vis = visibleRows(); var i = vis.indexOf(row);
      if (i !== -1 && i !== selected) setSelected(i);
    });
    row.addEventListener('click', function () {
      var vis = visibleRows(); var i = vis.indexOf(row);
      if (i !== -1) { selected = i; } activate();
    });
  });
})();
