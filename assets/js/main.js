/* =========================================================
   Ibrohim Sirojiddinov — portfolio interactions
   Vanilla JS, no dependencies. Every feature is optional:
   if one fails, the rest of the page keeps working.
   ========================================================= */
(() => {
  'use strict';

  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canObserve = 'IntersectionObserver' in window;

  const safe = (name, fn) => {
    try { fn(); } catch (err) { console.warn(`[site] ${name} disabled:`, err); }
  };

  /* Run `fn(el)` once when `el` scrolls into view (immediately without IntersectionObserver). */
  const onVisible = (elements, fn, options = { threshold: 0.35 }) => {
    if (!elements.length) return;
    if (!canObserve) { elements.forEach(fn); return; }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        fn(entry.target);
      });
    }, options);
    elements.forEach((el) => observer.observe(el));
  };

  /* ---------- Toast ---------- */
  let toastTimer;
  const toast = (message) => {
    const box = $('[data-toast]');
    if (!box) return;
    $('[data-toast-text]', box).textContent = message;
    box.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => box.classList.remove('is-visible'), 2400);
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      area.remove();
      return ok;
    }
  };

  /* ---------- Footer year ---------- */
  safe('year', () => {
    $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
  });

  /* ---------- Header shadow + back-to-top + reading progress ---------- */
  safe('scroll', () => {
    const header = $('[data-header]');
    const toTop = $('[data-to-top]');
    const progress = $('[data-read-progress]');
    const article = $('[data-article]');
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      header?.classList.toggle('is-scrolled', y > 10);
      toTop?.classList.toggle('is-visible', y > 300);
      if (progress && article) {
        const rect = article.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const done = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1;
        progress.style.transform = `scaleX(${done})`;
      }
    };

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', update);
    update();

    toTop?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Mobile menu ---------- */
  safe('menu', () => {
    const toggle = $('[data-menu-toggle]');
    const menu = $('[data-menu]');
    if (!toggle || !menu) return;

    const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
    const setOpen = (open, { focusToggle = false } = {}) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.classList.toggle('is-open', open);
      menu.inert = !open;
      if (focusToggle) toggle.focus();
    };

    setOpen(false);
    toggle.addEventListener('click', () => setOpen(!isOpen()));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) setOpen(false, { focusToggle: true });
    });
    document.addEventListener('click', (e) => {
      if (isOpen() && !e.target.closest('[data-menu]') && !e.target.closest('[data-menu-toggle]')) setOpen(false);
    });
    window.matchMedia('(min-width: 1024px)').addEventListener?.('change', (e) => {
      if (e.matches) setOpen(false);
    });
  });

  /* ---------- Reveal on scroll ---------- */
  safe('reveal', () => {
    const items = $$('[data-animate]');
    if (reduceMotion || !canObserve) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    onVisible(items, (el) => el.classList.add('is-visible'), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  });

  /* ---------- Hero: typed terminal values ---------- */
  safe('typing', () => {
    const fields = $$('[data-type]');
    if (!fields.length) return;
    const texts = fields.map((el) => el.getAttribute('data-type') || '');
    if (reduceMotion) {
      fields.forEach((el, i) => { el.textContent = texts[i]; });
      return;
    }
    fields.forEach((el) => { el.textContent = ''; });

    let index = 0;
    const typeNext = () => {
      if (index >= fields.length) return;
      const el = fields[index];
      const text = texts[index];
      let n = 0;
      el.classList.add('is-typing');
      const tick = () => {
        n += 1;
        el.textContent = text.slice(0, n);
        if (n < text.length) {
          setTimeout(tick, 28 + Math.random() * 34);
          return;
        }
        el.classList.remove('is-typing');
        index += 1;
        setTimeout(typeNext, 140);
      };
      tick();
    };

    onVisible([fields[0].closest('[data-typing-root]') || fields[0]], () => setTimeout(typeNext, 500), { threshold: 0.2 });
  });

  /* ---------- Hero: rotating role ---------- */
  safe('rotator', () => {
    const el = $('[data-rotate]');
    if (!el || reduceMotion) return;
    let words = [];
    try { words = JSON.parse(el.getAttribute('data-rotate')); } catch { words = []; }
    if (words.length < 2) return;

    let index = 0;
    let chars = words[0].length;
    let deleting = true;
    const tick = () => {
      const word = words[index];
      if (deleting) {
        chars -= 1;
        el.textContent = word.slice(0, chars);
        if (chars > 0) return setTimeout(tick, 30);
        deleting = false;
        index = (index + 1) % words.length;
        return setTimeout(tick, 320);
      }
      chars += 1;
      el.textContent = words[index].slice(0, chars);
      if (chars < words[index].length) return setTimeout(tick, 55 + Math.random() * 45);
      deleting = true;
      return setTimeout(tick, 2300);
    };
    setTimeout(tick, 2600);
  });

  /* ---------- Home: live API log ---------- */
  safe('log', () => {
    const box = $('[data-log]');
    if (!box) return;
    const list = $('.log-lines', box);
    const source = $('template[data-log-source]', box);
    if (!list || !source) return;

    const pool = $$('.log-line', source.content);
    if (!pool.length || reduceMotion) return;

    const maxLines = 11;
    let cursor = 0;
    let timer = 0;
    let visible = false;

    const stamp = () => {
      const d = new Date();
      const p = (v, n = 2) => String(v).padStart(n, '0');
      return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${p(d.getMilliseconds(), 3)}`;
    };

    const push = () => {
      const line = pool[cursor % pool.length].cloneNode(true);
      cursor += 1;
      const time = $('.lt', line);
      if (time) {
        const [hms, ms] = stamp().split('.');
        time.innerHTML = '';
        time.append(`[${hms}`);
        const msEl = document.createElement('span');
        msEl.className = 'lt-ms';
        msEl.textContent = `.${ms}`;
        time.append(msEl, ']');
      }
      line.classList.add('is-new');
      list.appendChild(line);
      while (list.children.length > maxLines) list.firstElementChild.remove();
    };

    const schedule = () => {
      clearTimeout(timer);
      if (!visible || document.hidden) return;
      timer = setTimeout(() => { push(); schedule(); }, 1300 + Math.random() * 1300);
    };

    if (canObserve) {
      new IntersectionObserver((entries) => {
        visible = entries.some((e) => e.isIntersecting);
        schedule();
      }, { threshold: 0.1 }).observe(box);
    } else {
      visible = true;
      schedule();
    }
    document.addEventListener('visibilitychange', schedule);
  });

  /* ---------- Skill bars ---------- */
  safe('bars', () => {
    const bars = $$('[data-progress]');
    const fill = (bar) => {
      const target = Number(bar.getAttribute('data-progress')) || 0;
      const label = $('[data-progress-value]', bar);
      bar.classList.add('is-filled');
      if (!label || reduceMotion) return;
      const start = performance.now();
      const frame = (now) => {
        const t = Math.min(1, (now - start) / 1500);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        label.textContent = `${Math.round(target * eased)}%`;
        if (t < 1) requestAnimationFrame(frame);
      };
      label.textContent = '0%';
      requestAnimationFrame(frame);
    };
    if (reduceMotion) { bars.forEach((bar) => bar.classList.add('is-filled')); return; }
    onVisible(bars, fill, { threshold: 0.6 });
  });

  /* ---------- Count-up numbers ---------- */
  safe('counters', () => {
    const counters = $$('[data-count]');
    if (reduceMotion || !counters.length) return;
    const format = (el, value) => `${el.dataset.prefix || ''}${value}${el.dataset.suffix || ''}`;
    onVisible(counters, (el) => {
      const target = Number(el.dataset.count) || 0;
      const start = performance.now();
      const frame = (now) => {
        const t = Math.min(1, (now - start) / 1400);
        el.textContent = format(el, Math.round(target * (1 - Math.pow(1 - t, 3))));
        if (t < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    }, { threshold: 0.6 });
  });

  /* ---------- Local time in Tashkent ---------- */
  safe('clock', () => {
    const els = $$('[data-local-time]');
    if (!els.length) return;
    const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent' });
    const tick = () => { const t = fmt.format(new Date()); els.forEach((el) => { el.textContent = t; }); };
    tick();
    setInterval(tick, 30000);
  });

  /* ---------- Copy buttons ---------- */
  safe('copy', () => {
    document.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-copy]');
      if (!btn) return;
      const ok = await copyText(btn.getAttribute('data-copy'));
      toast(ok ? (btn.getAttribute('data-copy-label') || 'Copied to clipboard') : 'Copy failed: please copy it manually');
    });
  });

  /* ---------- Code blocks: copy button ---------- */
  safe('code-copy', () => {
    $$('.code-block').forEach((block) => {
      const pre = $('pre', block);
      if (!pre) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'code-copy';
      btn.textContent = 'copy';
      btn.setAttribute('aria-label', 'Copy code to clipboard');
      btn.addEventListener('click', async () => {
        const ok = await copyText(pre.innerText.replace(/\n$/, ''));
        btn.textContent = ok ? 'copied' : 'failed';
        btn.classList.toggle('is-done', ok);
        setTimeout(() => { btn.textContent = 'copy'; btn.classList.remove('is-done'); }, 1800);
      });
      block.appendChild(btn);
    });
  });

  /* ---------- Blog: category filter ---------- */
  safe('filter', () => {
    const buttons = $$('[data-filter]');
    const posts = $$('[data-category]');
    const status = $('[data-filter-status]');
    if (!buttons.length || !posts.length) return;

    const apply = (category, { updateHash = true } = {}) => {
      const known = buttons.some((b) => b.dataset.filter === category);
      const active = known ? category : 'all';
      let shown = 0;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === active)));
      posts.forEach((post) => {
        const match = active === 'all' || post.dataset.category === active;
        post.hidden = !match;
        if (match) shown += 1;
      });
      if (status) {
        const label = buttons.find((b) => b.dataset.filter === active)?.dataset.label || 'All posts';
        status.textContent = active === 'all'
          ? `Showing all ${shown} posts`
          : `Showing ${shown} ${shown === 1 ? 'post' : 'posts'} in “${label}”`;
      }
      if (updateHash) {
        const url = active === 'all' ? window.location.pathname : `#${active}`;
        history.replaceState(null, '', url);
      }
    };

    buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.filter)));
    const fromHash = () => apply(window.location.hash.slice(1) || 'all', { updateHash: false });
    if (window.location.hash.length > 1) fromHash();
    window.addEventListener('hashchange', fromHash);
  });

  /* ---------- Contact form: opens the visitor's mail app with the message filled in ---------- */
  safe('contact', () => {
    $$('form[data-mailto]').forEach((form) => {
      const to = form.getAttribute('data-mailto');
      const status = $('[data-form-status]', form);
      const gmail = $('[data-gmail]', form);
      const mailLink = $('[data-mailto-link]', form);
      const copyBtn = $('[data-copy-message]', form);
      const submit = $('[type="submit"]', form);
      const submitLabel = submit ? $('[data-submit-label]', submit) : null;
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

      const fieldError = (input, message) => {
        const error = input.closest('.field')?.querySelector('.field-error');
        input.setAttribute('aria-invalid', message ? 'true' : 'false');
        if (error) {
          error.textContent = message || '';
          error.hidden = !message;
        }
      };

      const validate = () => {
        const { name, email, message } = form.elements;
        const problems = [];
        const check = (input, ok, message) => {
          if (!input) return;
          fieldError(input, ok ? '' : message);
          if (!ok) problems.push(input);
        };
        check(name, name && name.value.trim().length >= 2, 'Please enter your name.');
        if (email && !email.value.trim()) check(email, false, 'Please enter your email so I can reply.');
        else check(email, email && emailPattern.test(email.value.trim()), 'This email address does not look right.');
        check(message, message && message.value.trim().length >= 10, 'Please write a message (at least 10 characters).');
        if (problems.length) problems[0].focus();
        return problems.length === 0;
      };

      form.addEventListener('input', (e) => {
        if (e.target.getAttribute('aria-invalid') === 'true') fieldError(e.target, '');
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validate()) return;

        const value = (field) => (form.elements[field] ? form.elements[field].value.trim() : '');
        const name = value('name');
        const email = value('email');
        const topic = value('subject') || 'Hello';
        const message = value('message').replace(/\r?\n/g, '\r\n');
        const site = window.location.host || 'portfolio';

        const subject = `${topic} — from ${name}`;
        const body = [
          'Hi Ibrohim,',
          '',
          message,
          '',
          '—',
          name,
          email,
          `(sent via the contact form on ${site})`,
        ].join('\r\n');

        const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        if (mailLink) mailLink.href = mailto;
        if (gmail) {
          gmail.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }
        if (copyBtn) {
          copyBtn.setAttribute('data-copy', `To: ${to}\nSubject: ${subject}\n\n${body.replace(/\r\n/g, '\n')}`);
        }
        if (status) status.hidden = false;
        if (submitLabel) {
          submitLabel.textContent = 'Opening your mail app…';
          setTimeout(() => { submitLabel.textContent = submitLabel.getAttribute('data-submit-label') || 'Send Message'; }, 2500);
        }

        window.location.href = mailto;
      });
    });
  });

  /* ---------- 404: show the requested path ---------- */
  safe('404', () => {
    $$('[data-path]').forEach((el) => { el.textContent = window.location.pathname || '/'; });
  });
})();
