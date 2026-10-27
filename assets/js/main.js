/* =========================================================
   Ibrohim Sirojiddinov — CV website interactions
   Vanilla JS, no dependencies. Every feature is optional:
   if one fails, the rest of the page keeps working.
   ========================================================= */
(() => {
  'use strict';

  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const canObserve = 'IntersectionObserver' in window;

  const safe = (name, fn) => {
    try { fn(); } catch (err) { console.warn(`[cv] ${name} disabled:`, err); }
  };

  /* ---------- Theme ---------- */
  safe('theme', () => {
    const toggle = $('[data-theme-toggle]');
    const metas = $$('meta[name="theme-color"]');
    let animTimer;

    const stored = () => {
      try { return localStorage.getItem('theme'); } catch { return null; }
    };

    const apply = (theme, { persist = false, animate = false } = {}) => {
      if (animate) {
        root.classList.add('theme-anim');
        clearTimeout(animTimer);
        animTimer = setTimeout(() => root.classList.remove('theme-anim'), 500);
      }
      root.setAttribute('data-theme', theme);
      if (persist) {
        try { localStorage.setItem('theme', theme); } catch { /* storage unavailable */ }
      }
      const bg = getComputedStyle(root).getPropertyValue('--bg').trim();
      metas.forEach((meta) => meta.setAttribute('content', bg));
      toggle?.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      window.dispatchEvent(new Event('themechange'));
    };

    apply(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

    toggle?.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next, { persist: true, animate: true });
    });

    window.matchMedia('(prefers-color-scheme: light)').addEventListener?.('change', (e) => {
      if (!stored()) apply(e.matches ? 'light' : 'dark', { animate: true });
    });
  });

  /* ---------- Header state, progress bar, back-to-top, scrollspy ---------- */
  safe('scroll', () => {
    const header = $('[data-header]');
    const bar = $('.progress-bar');
    const toTop = $('[data-to-top]');
    const links = $$('.nav-link');
    const indicator = $('.nav-indicator');
    const sections = links.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean);
    let activeId = null;
    let ticking = false;

    const moveIndicator = () => {
      if (!indicator) return;
      const active = links.find((a) => a.classList.contains('is-active'));
      if (!active || active.offsetParent === null) {
        indicator.classList.remove('is-visible');
        return;
      }
      indicator.style.setProperty('--x', `${active.offsetLeft}px`);
      indicator.style.setProperty('--w', `${active.offsetWidth}px`);
      indicator.classList.add('is-visible');
    };

    const setActive = (id) => {
      if (id === activeId) return;
      activeId = id;
      links.forEach((a) => {
        const on = a.hash === `#${id}`;
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
      moveIndicator();
    };

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      header?.classList.toggle('is-scrolled', y > 8);
      toTop?.classList.toggle('is-visible', y > window.innerHeight * 0.9);

      let current = null;
      const probe = window.innerHeight * 0.38;
      sections.forEach((s) => { if (s.getBoundingClientRect().top <= probe) current = s; });
      if (sections.length && max - y < 2) current = sections[sections.length - 1];
      setActive(current ? current.id : null);
    };

    const request = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', () => { request(); moveIndicator(); });
    document.fonts?.ready.then(moveIndicator);
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
    const background = [$('main'), $('footer')].filter(Boolean);
    const isOpen = () => root.classList.contains('menu-open');

    const setMenu = (open, { restoreFocus = false } = {}) => {
      root.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.inert = !open;
      background.forEach((el) => { el.inert = open; });
      if (open) menu.querySelector('a')?.focus({ preventScroll: true });
      else if (restoreFocus) toggle.focus({ preventScroll: true });
    };

    toggle.addEventListener('click', () => setMenu(!isOpen()));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) setMenu(false, { restoreFocus: true });
    });
    window.matchMedia('(min-width: 921px)').addEventListener?.('change', (e) => {
      if (e.matches && isOpen()) setMenu(false);
    });
  });

  /* ---------- Reveal on scroll ---------- */
  safe('reveal', () => {
    $$('[data-stagger]').forEach((group) => {
      $$(':scope > .reveal, :scope > * > .reveal', group).forEach((el, i) => {
        el.style.setProperty('--d', `${i * 90}ms`);
      });
    });

    const items = $$('.reveal');
    if (reduceMotion || !canObserve) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    root.classList.add('js-ready');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach((el) => observer.observe(el));
  });

  /* ---------- Animated counters ---------- */
  safe('counters', () => {
    const counters = $$('[data-count]');
    if (reduceMotion || !canObserve || !counters.length) return;

    const format = (el, value) => `${el.dataset.prefix || ''}${value}${el.dataset.suffix || ''}`;
    const run = (el) => {
      const target = Number(el.dataset.count);
      const start = performance.now();
      const duration = 1500;
      const frame = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = format(el, Math.round(target * eased));
        if (t < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    counters.forEach((el) => {
      el.textContent = format(el, 0);
      observer.observe(el);
    });
  });

  /* ---------- Rotating "I build …" phrases ---------- */
  safe('typed', () => {
    const el = $('[data-typed]');
    if (!el || reduceMotion) return;
    let words = [];
    try { words = JSON.parse(el.dataset.typed); } catch { words = []; }
    if (words.length < 2) return;

    let index = 0;
    let chars = words[0].length;
    let deleting = true;

    const tick = () => {
      const word = words[index];
      if (deleting) {
        chars -= 1;
        el.textContent = word.slice(0, chars);
        if (chars > 0) return setTimeout(tick, 32);
        deleting = false;
        index = (index + 1) % words.length;
        return setTimeout(tick, 380);
      }
      chars += 1;
      el.textContent = word.slice(0, chars);
      if (chars < word.length) return setTimeout(tick, 60 + Math.random() * 50);
      deleting = true;
      return setTimeout(tick, 2200);
    };

    setTimeout(tick, 3200);
  });

  /* ---------- Terminal typing ---------- */
  safe('terminal', () => {
    const terminal = $('[data-terminal]');
    if (!terminal || reduceMotion || !canObserve) return;
    const lines = $$('.t-line', terminal);
    const cmd = $('.t-cmd', terminal);
    if (!cmd || lines.length < 2) return;

    const fullCmd = cmd.textContent;
    const caret = document.createElement('span');
    caret.className = 't-caret';
    cmd.textContent = '';
    cmd.after(caret);
    terminal.classList.add('is-animating');
    lines[0].classList.add('is-shown');

    const revealLine = (k) => {
      if (k >= lines.length) {
        terminal.classList.remove('is-animating');
        return;
      }
      lines[k].classList.add('is-shown');
      setTimeout(() => revealLine(k + 1), k < 4 ? 150 : 70);
    };

    let typedChars = 0;
    const typeCmd = () => {
      typedChars += 1;
      cmd.textContent = fullCmd.slice(0, typedChars);
      if (typedChars < fullCmd.length) {
        setTimeout(typeCmd, 38 + Math.random() * 48);
        return;
      }
      setTimeout(() => {
        caret.remove();
        revealLine(1);
      }, 420);
    };

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      observer.disconnect();
      setTimeout(typeCmd, 900);
    }, { threshold: 0.35 });
    observer.observe(terminal);
  });

  /* ---------- Hero network background ---------- */
  safe('network', () => {
    const canvas = $('[data-network]');
    const hero = canvas?.closest('.hero');
    const ctx = canvas?.getContext?.('2d');
    if (!canvas || !hero || !ctx) return;

    let width = 0;
    let height = 0;
    let nodes = [];
    let packets = [];
    let rafId = 0;
    let running = false;
    let inView = true;
    const pointer = { x: 0, y: 0, active: false };

    const readPalette = () => {
      const cs = getComputedStyle(root);
      return {
        rgb: cs.getPropertyValue('--net-rgb').trim() || '52, 211, 153',
        packet: cs.getPropertyValue('--net-packet').trim() || '#67e8f9',
        line: parseFloat(cs.getPropertyValue('--net-line-alpha')) || 0.16,
        node: parseFloat(cs.getPropertyValue('--net-node-alpha')) || 0.55,
      };
    };
    let palette = readPalette();

    const makeNode = () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.12 + Math.random() * 0.22;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 1 + Math.random() * 1.5,
      };
    };

    const spawnPacket = (maxDist2) => {
      for (let tries = 0; tries < 12; tries += 1) {
        const a = nodes[(Math.random() * nodes.length) | 0];
        const b = nodes[(Math.random() * nodes.length) | 0];
        if (a === b) continue;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        if (dx * dx + dy * dy < maxDist2 * 0.7) {
          packets.push({ a, b, t: 0, speed: 0.008 + Math.random() * 0.012 });
          return;
        }
      }
    };

    const draw = (animate) => {
      ctx.clearRect(0, 0, width, height);
      const linkDist = Math.max(96, Math.min(150, width / 9));
      const linkDist2 = linkDist * linkDist;
      const reach2 = (linkDist * 1.3) ** 2;
      const { rgb, line, node } = palette;

      if (animate) {
        nodes.forEach((n) => {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > width) { n.vx *= -1; n.x = Math.max(0, Math.min(width, n.x)); }
          if (n.y < 0 || n.y > height) { n.vy *= -1; n.y = Math.max(0, Math.min(height, n.y)); }
        });
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > linkDist2) continue;
          ctx.strokeStyle = `rgba(${rgb}, ${((1 - d2 / linkDist2) * line).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        if (pointer.active) {
          const dx = a.x - pointer.x;
          const dy = a.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < reach2) {
            ctx.strokeStyle = `rgba(${rgb}, ${((1 - d2 / reach2) * line * 2.6).toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
          }
        }
      }

      ctx.fillStyle = `rgba(${rgb}, ${node})`;
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      });

      if (!animate) return;
      if (packets.length < 5 && Math.random() < 0.05) spawnPacket(linkDist2);
      ctx.fillStyle = palette.packet;
      ctx.shadowColor = palette.packet;
      ctx.shadowBlur = 10;
      packets = packets.filter((p) => {
        p.t += p.speed;
        const dx = p.a.x - p.b.x;
        const dy = p.a.y - p.b.y;
        if (p.t >= 1 || dx * dx + dy * dy > linkDist2) return false;
        ctx.beginPath();
        ctx.arc(p.a.x + (p.b.x - p.a.x) * p.t, p.a.y + (p.b.y - p.a.y) * p.t, 2, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });
      ctx.shadowBlur = 0;
    };

    const loop = () => {
      draw(true);
      rafId = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduceMotion) return;
      running = true;
      rafId = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(rafId);
    };
    const sync = () => (inView && !document.hidden ? start() : stop());

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.round(Math.min(86, Math.max(24, (width * height) / 16000)));
      while (nodes.length < target) nodes.push(makeNode());
      nodes.length = target;
      nodes.forEach((n) => {
        n.x = Math.min(n.x, width);
        n.y = Math.min(n.y, height);
      });
      packets = [];
      if (!running) draw(false);
    };

    resize();
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener('resize', resize);

    if (canObserve) {
      new IntersectionObserver((entries) => {
        inView = entries[0].isIntersecting;
        sync();
      }).observe(hero);
    }
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('themechange', () => {
      palette = readPalette();
      if (!running) draw(false);
    });

    if (finePointer) {
      hero.addEventListener('pointermove', (e) => {
        const rect = canvas.getBoundingClientRect();
        pointer.x = e.clientX - rect.left;
        pointer.y = e.clientY - rect.top;
        pointer.active = true;
      });
      hero.addEventListener('pointerleave', () => { pointer.active = false; });
    }

    sync();
  });

  /* ---------- Card spotlight ---------- */
  safe('spotlight', () => {
    if (!finePointer) return;
    $$('[data-spotlight]').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  });

  /* ---------- Skills marquee ---------- */
  safe('marquee', () => {
    if (reduceMotion) return;
    $$('[data-marquee]').forEach((marquee) => {
      const track = $('.marquee-track', marquee);
      if (!track) return;
      track.insertAdjacentHTML('beforeend', track.innerHTML);
      marquee.classList.add('is-ready');
    });
  });

  /* ---------- Copy to clipboard + toast ---------- */
  safe('copy', () => {
    const toast = $('[data-toast]');
    const toastText = $('[data-toast-text]');
    let toastTimer;

    const showToast = (message) => {
      if (!toast || !toastText) return;
      toastText.textContent = message;
      toast.classList.add('is-visible');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
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

    $$('[data-copy]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const value = btn.dataset.copy;
        const ok = await copyText(value);
        showToast(ok ? `Copied: ${value}` : 'Could not copy — please copy it manually');
        if (!ok) return;
        const use = $('use', btn);
        btn.classList.add('is-copied');
        use?.setAttribute('href', '#i-check');
        setTimeout(() => {
          btn.classList.remove('is-copied');
          use?.setAttribute('href', '#i-copy');
        }, 1600);
      });
    });
  });

  /* ---------- Live details: job duration, Tashkent time, year ---------- */
  safe('details', () => {
    $$('[data-since]').forEach((el) => {
      const [year, month] = el.dataset.since.split('-').map(Number);
      const now = new Date();
      const months = Math.max(1, (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month) + 1);
      const yrs = Math.floor(months / 12);
      const mos = months % 12;
      el.textContent = [
        yrs ? `${yrs} yr${yrs > 1 ? 's' : ''}` : '',
        mos ? `${mos} mo${mos > 1 ? 's' : ''}` : '',
      ].filter(Boolean).join(' ');
    });

    const clocks = $$('[data-local-time]');
    if (clocks.length) {
      const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent' });
      const tick = () => {
        const time = fmt.format(new Date());
        clocks.forEach((el) => { el.textContent = time; });
      };
      tick();
      setInterval(tick, 30000);
    }

    $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
  });
})();
