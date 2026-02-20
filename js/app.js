/* ═══════════════════════════════════════════
   APP.JS — Shared Logic
   Theme · Nav · Reveal · Canvas · Transitions
═══════════════════════════════════════════ */

/* ── TEMA ── */
const ThemeManager = (() => {
  const STORAGE_KEY = 'jv-theme';
  const body = document.body;
  const btn  = document.getElementById('btn-theme');

  const apply = (theme) => {
    body.classList.toggle('light', theme === 'light');
    if (btn) btn.textContent = theme === 'light' ? '🌙' : '☀️';
    localStorage.setItem(STORAGE_KEY, theme);
  };

  const toggle = () => apply(body.classList.contains('light') ? 'dark' : 'light');

  const init = () => {
    const saved  = localStorage.getItem(STORAGE_KEY);
    const system = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    apply(saved || system);
    if (btn) btn.addEventListener('click', toggle);
  };

  return { init };
})();

/* ── NAVBAR ── */
const NavManager = (() => {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('nav-burger');
  const drawer = document.getElementById('nav-drawer');

  const setScrolled = () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 20);
  };

  const setActive = () => {
    const path = location.pathname.replace(/\/$/, '') || '/index';
    document.querySelectorAll('.nav-link').forEach(a => {
      const href = a.getAttribute('href') || '';
      const match = href.includes('sobre')   && path.includes('sobre')   ||
                    href.includes('projetos') && path.includes('projetos')||
                    href.includes('contato')  && path.includes('contato') ||
                    (href === 'index.html' || href === './' || href === '/') && (path === '/index' || path === '' || path.endsWith('/'));
      a.classList.toggle('active', match);
    });
  };

  const init = () => {
    setScrolled();
    setActive();
    window.addEventListener('scroll', setScrolled, { passive: true });

    if (burger && drawer) {
      burger.addEventListener('click', () => {
        burger.classList.toggle('open');
        drawer.classList.toggle('open');
      });
      // Fecha ao clicar em link
      drawer.querySelectorAll('a').forEach(a =>
        a.addEventListener('click', () => {
          burger.classList.remove('open');
          drawer.classList.remove('open');
        })
      );
    }
  };

  return { init };
})();

/* ── SCROLL REVEAL ── */
const RevealManager = (() => {
  let observer;

  const init = () => {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
      return;
    }

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    // Adiciona índice para stagger
    document.querySelectorAll('.stagger > .reveal').forEach((el, i) => {
      el.style.transitionDelay = `${i * 60}ms`;
    });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  };

  return { init };
})();

/* ── CANVAS BACKGROUND (hero) ── */
const CanvasBackground = (() => {
  let canvas, ctx, particles = [], raf;

  const config = {
    count:    50,
    speed:    0.25,
    maxDist:  120,
    radius:   1.5,
  };

  const getColor = () =>
    document.body.classList.contains('light') ? '0,168,112' : '57,255,176';

  const resize = () => {
    if (!canvas) return;
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };

  const createParticles = () => {
    particles = [];
    for (let i = 0; i < config.count; i++) {
      particles.push({
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * config.speed,
        vy: (Math.random() - 0.5) * config.speed,
        r:  Math.random() * config.radius + 0.5,
      });
    }
  };

  const draw = () => {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const c = getColor();

    // Atualiza e desenha partículas
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c}, 0.4)`;
      ctx.fill();
    });

    // Linhas entre partículas próximas
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < config.maxDist) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${c}, ${0.12 * (1 - dist / config.maxDist)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    raf = requestAnimationFrame(draw);
  };

  const init = (id) => {
    canvas = document.getElementById(id);
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    createParticles();
    draw();
    window.addEventListener('resize', () => {
      resize();
      createParticles();
    }, { passive: true });
  };

  const destroy = () => { if (raf) cancelAnimationFrame(raf); };

  return { init, destroy };
})();

/* ── TYPEWRITER (hero roles) ── */
const Typewriter = (() => {
  const roles = [
    'Estudante de Engenharia de Software',
    'Entusiasta de Desenvolvimento Web',
    'Aprendiz de Python',
    'Futuro Desenvolvedor Full-Stack',
  ];

  let el, i = 0, charI = 0, deleting = false, timeout;

  const type = () => {
    const current = roles[i];
    if (!deleting) {
      charI++;
      el.textContent = current.slice(0, charI);
      if (charI === current.length) {
        deleting = true;
        timeout = setTimeout(type, 2200);
        return;
      }
    } else {
      charI--;
      el.textContent = current.slice(0, charI);
      if (charI === 0) {
        deleting = false;
        i = (i + 1) % roles.length;
        timeout = setTimeout(type, 400);
        return;
      }
    }
    timeout = setTimeout(type, deleting ? 45 : 60);
  };

  const init = (elementId) => {
    el = document.getElementById(elementId);
    if (!el) return;
    timeout = setTimeout(type, 800);
  };

  return { init };
})();

/* ── PAGE TRANSITION ── */
const PageTransition = (() => {
  const overlay = document.querySelector('.page-transition');

  const navigateTo = (url) => {
    if (!overlay) { location.href = url; return; }
    overlay.classList.add('in');
    setTimeout(() => { location.href = url; }, 380);
  };

  const init = () => {
    // Intercept internal links
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') ||
          href.startsWith('mailto') || href.startsWith('tel') ||
          a.target === '_blank') return;

      a.addEventListener('click', e => {
        e.preventDefault();
        navigateTo(href);
      });
    });

    // Fade in on load
    if (overlay) {
      overlay.classList.add('out');
      setTimeout(() => overlay.classList.remove('out'), 50);
    }
  };

  return { init };
})();

/* ── BOOT ── */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  NavManager.init();
  RevealManager.init();
  PageTransition.init();
  CanvasBackground.init('hero-canvas');
  Typewriter.init('hero-role-text');
});

window.addEventListener('beforeunload', () => {
  CanvasBackground.destroy();
});

