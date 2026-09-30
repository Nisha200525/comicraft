/* Comicraft – front-end demo script (no API key required) */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- Navbar: shadow on scroll + mobile menu ---------- */
  const nav = $('#nav'), burger = $('#burger'), menu = $('#menu');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 20), { passive: true });

  const setMenu = (open) => {
    menu.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Highlight the active nav link while scrolling ---------- */
  const links = $$('.menu a[href^="#"]:not(.btn)');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(l => { const t = $(l.getAttribute('href')); if (t) spy.observe(t); });

  /* ---------- Scroll reveal (staggered inside grids) ---------- */
  $$('.grid3,.steps,.comic,.badges').forEach(g =>
    $$('.reveal', g).forEach((el, i) => el.style.setProperty('--d', (i * 0.1) + 's')));
  const reveal = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('show'); obs.unobserve(en.target); } });
  }, { threshold: 0.15 });
  $$('.reveal').forEach(el => reveal.observe(el));

  /* ---------- Comic story generator (mock AI) ---------- */
  const NAMES = ['Nova', 'Kai', 'Luna', 'Rex', 'Zara', 'Milo', 'Aria', 'Jax'];
  const ROLES = ['the hero', 'the loyal sidekick', 'the clever rival', 'the mysterious guide', 'the funny friend'];
  const GENRES = {
    Fantasy:   { place: 'the Whispering Kingdom', twist: 'an ancient spell breaks loose', act: 'casts a blazing spell', end: 'the kingdom is saved and a new legend is born' },
    Adventure: { place: 'a jungle no map has charted', twist: 'the only bridge collapses', act: 'swings across the canyon', end: 'the treasure is found and the team heads home' },
    Comedy:    { place: 'a very confusing town', twist: 'everything goes hilariously wrong', act: 'slips on a banana peel mid-chase', end: 'everyone laughs and the day is saved by accident' },
    Romance:   { place: 'a rainy city café', twist: 'a misunderstanding pulls them apart', act: 'runs through the rain to explain', end: 'they meet under one umbrella and finally say it' },
    'Sci-Fi':  { place: 'Station Orion, far past Mars', twist: 'the ship AI stops obeying orders', act: 'reroutes the reactor by hand', end: 'the AI is repaired and the crew sails on' },
    Mystery:   { place: 'a foggy old mansion', twist: 'the key clue vanishes overnight', act: 'follows muddy footprints to a hidden door', end: 'the culprit is revealed and the case is closed' }
  };
  const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(p => p[1]);

  function buildStory(idea, genre, count) {
    const g = GENRES[genre];
    const cast = shuffle(NAMES).slice(0, count).map((n, i) => ({ name: n, role: ROLES[i % ROLES.length] }));
    const hero = cast[0].name, other = (cast[1] || cast[0]).name;
    const short = idea.length > 70 ? idea.slice(0, 67) + '…' : idea;
    return {
      title: `${hero} and the ${genre} Adventure`,
      cast,
      panels: [
        ['Panel 1 – Introduction', `In ${g.place}, ${hero} is ready to begin: “${short}”`],
        ['Panel 2 – The Problem', `Suddenly, ${g.twist}! ${other} gasps: “This wasn't part of the plan!”`],
        ['Panel 3 – The Action', `${hero} ${g.act}. “Stay behind me, ${other}!”`],
        ['Panel 4 – The Ending', `In the end, ${g.end}. “Together, we did it!”`]
      ]
    };
  }

  const form = $('#genForm'), result = $('#result'), err = $('#formError'), btn = $('#genBtn');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const idea = $('#idea').value.trim();
    const count = Math.min(5, Math.max(1, parseInt($('#chars').value, 10) || 2));
    $('#chars').value = count;
    if (idea.length < 5) { err.textContent = 'Please describe your idea in at least 5 characters.'; $('#idea').focus(); return; }
    err.textContent = '';
    btn.disabled = true; btn.textContent = 'Generating…';
    result.innerHTML = '<div class="loading"><div><div class="spin"></div>Gemini is writing your story…</div></div>';

    setTimeout(() => {
      const s = buildStory(idea, $('#genre').value, count);
      result.innerHTML =
        `<h3>${esc(s.title)}</h3><p class="meta">Genre: ${esc($('#genre').value)} · Demo output</p>` +
        `<div class="cast">${s.cast.map(c => `<span>${esc(c.name)} – ${c.role}</span>`).join('')}</div>` +
        s.panels.map((p, i) => `<div class="beat" style="animation-delay:${i * 0.15}s"><b>${p[0]}:</b> ${esc(p[1])}</div>`).join('');
      btn.disabled = false; btn.textContent = 'Generate Comic Story';
    }, 1200);
  });

  /* ---------- Contact form (front-end validation only) ---------- */
  const cForm = $('#contactForm'), cMsg = $('#contactMsg');
  cForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#name').value.trim(), email = $('#email').value.trim(), msg = $('#msg').value.trim();
    cMsg.classList.remove('ok');
    if (!name || !msg) { cMsg.textContent = 'Please fill in your name and message.'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { cMsg.textContent = 'Please enter a valid email address.'; return; }
    cMsg.classList.add('ok');
    cMsg.textContent = `Thanks ${name}! Your message was received (demo – nothing is sent).`;
    cForm.reset();
  });
})();