(() => {
  const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/Y2XJKA39WQ';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // header + burger
  const header = $('#header');
  const burger = $('#burger'), nav = $('#nav');
  burger?.addEventListener('click', () => {
    const o = burger.classList.toggle('is-open');
    nav.classList.toggle('is-open', o);
    burger.setAttribute('aria-expanded', o);
  });
  $$('a', nav).forEach(a => a.addEventListener('click', () => { burger.classList.remove('is-open'); nav.classList.remove('is-open'); }));

  // split headline by words
  const h1 = $('.split');
  if (h1) {
    const words = h1.textContent.trim().split(/\s+/);
    h1.setAttribute('aria-label', h1.textContent.trim());
    h1.innerHTML = words.map((w, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`).join(' ');
    requestAnimationFrame(() => setTimeout(() => { h1.classList.add('go'); $$('.rise').forEach(e => e.classList.add('go')); }, 80));
  }

  // stagger reveal delays inside groups
  $$('.about__cols,.about__pics,.band__in,.proof__board').forEach(g => $$('.reveal', g).forEach((e, i) => e.style.setProperty('--d', i * 80 + 'ms')));

  // counters
  const count = el => {
    const t = +el.dataset.n; if (reduce) return;
    const s = performance.now();
    const tick = n => { const p = Math.min(1, (n - s) / 1100); el.textContent = Math.round(t * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
    el.textContent = '0'; requestAnimationFrame(tick);
  };
  const counted = new WeakSet();

  // scroll loop: header, reveal, hero screw
  const heroScrew = $('#heroScrew');
  const reveals = $$('.reveal');
  let ticking = false;
  const frame = () => {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    header.classList.toggle('scrolled', y > 8);
    if (heroScrew && !reduce) {
      const p = Math.min(1, y / (vh * 1.1));
      heroScrew.style.transform = `rotate(${(p * 270).toFixed(1)}deg)`;
    }
    reveals.forEach(el => {
      if (el.classList.contains('is-in')) return;
      if (el.getBoundingClientRect().top < vh * 0.94) {
        el.classList.add('is-in');
        $$('[data-n]', el).forEach(c => { if (!counted.has(c)) { counted.add(c); count(c); } });
      }
    });
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  frame();
  setTimeout(frame, 400);

  // index with preview
  const rows = $$('.row'), prev = $('#prevText'), rowsWrap = $('#rows');
  const setRow = r => {
    rows.forEach(x => { const on = x === r; x.classList.toggle('is-on', on); x.setAttribute('aria-expanded', on); });
    rowsWrap.classList.add('has-on');
    const txt = $('.row__x', r).textContent;
    if (prev.textContent === txt) return;
    prev.classList.add('off');
    setTimeout(() => { prev.textContent = txt; prev.classList.remove('off'); }, 240);
  };
  rows.forEach(r => {
    r.addEventListener('mouseenter', () => matchMedia('(hover:hover)').matches && setRow(r));
    r.addEventListener('focus', () => setRow(r));
    r.addEventListener('click', () => setRow(r));
  });

  // calculator
  const rev = $('#rev'), turn = $('#turn'), cs = $('#calcScrew');
  const fmt = n => Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' ');
  const turnWord = d => d === 0 ? 'не тронут' : d === 270 ? '¾ оборота' : d + '°';
  const calc = () => {
    const base = parseInt((rev.value || '0').replace(/\D/g, ''), 10) || 0;
    const d = +turn.value;
    const pct = d / 270 * 47;
    const extra = base * pct / 100;
    $('#turnOut').textContent = turnWord(d);
    $('#pct').textContent = '+' + (Math.round(pct * 10) / 10).toString().replace('.', ',') + '%';
    $('#extra').textContent = fmt(extra) + ' ₽';
    $('#year').textContent = fmt(extra * 12) + ' ₽';
    $('#pay').textContent = extra > 0 ? 'Курс за 250 000 ₽ окупается примерно за ' + Math.max(1, Math.ceil(250000 / extra)) + ' мес.' : '';
    cs.style.transform = `rotate(${d}deg)`;
  };
  rev.addEventListener('input', () => {
    const v = rev.value.replace(/\D/g, '').slice(0, 10);
    rev.value = v ? fmt(+v) : '';
    calc();
  });
  turn.addEventListener('input', calc);
  calc();

  // accordion
  const stages = $$('.stage');
  stages.forEach(s => s.addEventListener('click', () => stages.forEach(x => { const on = x === s; x.classList.toggle('is-open', on); x.setAttribute('aria-expanded', on); })));

  // faq
  const cards = $$('.card');
  cards.forEach(c => $('.card__h', c).addEventListener('click', () => cards.forEach(x => { const on = x === c; x.classList.toggle('is-open', on); $('.card__h', x).setAttribute('aria-expanded', on); })));

  // plan buttons -> form
  $$('[data-plan]').forEach(b => b.addEventListener('click', () => { $('#planField').value = b.dataset.plan; }));

  // phone mask
  $$('input[type="tel"]').forEach(input => input.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.startsWith('8')) v = '7' + v.slice(1);
    if (v && !v.startsWith('7')) v = '7' + v;
    v = v.slice(0, 11);
    let out = v ? '+7' : '';
    if (v.length > 1) out += ' (' + v.slice(1, 4);
    if (v.length >= 4) out += ') ' + v.slice(4, 7);
    if (v.length >= 7) out += '-' + v.slice(7, 9);
    if (v.length >= 9) out += '-' + v.slice(9, 11);
    e.target.value = out;
  }));

  // form
  const form = $('#leadForm'), msg = $('#formMsg');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]'), orig = btn.textContent;
    const payload = {}; new FormData(form).forEach((v, k) => { payload[k] = v; });
    if (payload._gotcha) return;
    if (!payload.name || (!payload.phone && !payload.contact)) { msg.textContent = 'Укажите имя и телефон или Telegram.'; return; }
    payload.calc = `выручка ${rev.value} ₽, поворот ${turnWord(+turn.value)}`;
    btn.disabled = true; btn.textContent = 'Отправляем...';
    try {
      const r = await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      msg.textContent = 'Заявка отправлена. Санчо свяжется с вами.'; form.reset();
    } catch (err) { console.error(err); msg.textContent = 'Не отправилось. Напишите в Telegram: @master_prodag_b_to_c'; }
    finally { setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 2500); }
  });
})();
