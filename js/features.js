/* ═══════════════════════════════════════════
   GITHUB.JS — GitHub API Integration
   Busca repositórios públicos automaticamente
═══════════════════════════════════════════ */

const GithubProjects = (() => {
  /* ══════════════════════════════════════════
     ★ CONFIGURE AQUI ★
     Quando criar sua conta no GitHub:
     1. Coloque seu username em GITHUB_USERNAME
     2. Projetos aparecem automaticamente!
     
     Para projetos manuais (sem GitHub ainda),
     edite o array MANUAL_PROJECTS abaixo.
  ══════════════════════════════════════════ */

  const GITHUB_USERNAME = ''; // Ex: 'joaovictordev'

  const MANUAL_PROJECTS = [
    // Descomente e edite quando tiver projetos:
    // {
    //   name: 'Meu Projeto',
    //   description: 'Descrição do que o projeto faz.',
    //   html_url: 'https://github.com/usuario/repo',
    //   homepage: '',
    //   language: 'Python',
    //   stargazers_count: 0,
    //   topics: ['python', 'automacao'],
    //   category: 'python',
    //   icon: '🐍',
    // },
  ];

  const LANG_COLORS = {
    JavaScript: '#f7df1e',
    Python:     '#3776ab',
    HTML:       '#e34c26',
    CSS:        '#264de4',
    TypeScript: '#3178c6',
    Shell:      '#89e051',
  };

  const LANG_ICONS = {
    JavaScript: '🟨',
    Python:     '🐍',
    HTML:       '🌐',
    CSS:        '🎨',
    TypeScript: '🔷',
    default:    '📁',
  };

  let allProjects = [];
  let currentFilter = 'todos';

  /* ── Renderiza skeleton de carregamento ── */
  const showSkeleton = (container) => {
    container.innerHTML = Array(3).fill(`
      <div class="project-skeleton">
        <div class="skeleton-line h-32 w-60"></div>
        <div class="skeleton-line w-80" style="margin-top:0.75rem"></div>
        <div class="skeleton-line w-100"></div>
        <div class="skeleton-line w-60"></div>
      </div>
    `).join('');
  };

  /* ── Busca repos do GitHub ── */
  const fetchFromGitHub = async () => {
    const url = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30&type=public`;
    const res = await fetch(url, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });
    if (!res.ok) throw new Error(`GitHub API: ${res.status}`);
    const repos = await res.json();

    // Filtra forks e repos sem descrição
    return repos
      .filter(r => !r.fork && r.name !== GITHUB_USERNAME)
      .map(r => ({
        name:             r.name,
        description:      r.description || 'Sem descrição.',
        html_url:         r.html_url,
        homepage:         r.homepage,
        language:         r.language || 'Outros',
        stargazers_count: r.stargazers_count,
        topics:           r.topics || [],
        category:         categorize(r.language, r.topics),
        icon:             LANG_ICONS[r.language] || LANG_ICONS.default,
      }));
  };

  const categorize = (lang, topics = []) => {
    if (['Python'].includes(lang))                      return 'python';
    if (['HTML', 'CSS', 'JavaScript'].includes(lang))   return 'web';
    if (topics.includes('web') || topics.includes('frontend')) return 'web';
    return 'outros';
  };

  /* ── Cria HTML de um card ── */
  const cardHTML = (p) => {
    const langColor = LANG_COLORS[p.language] || '#888';
    const tagsHtml  = (p.topics || []).slice(0, 3).map(t =>
      `<span class="chip">${t}</span>`
    ).join('');

    const homepage = p.homepage
      ? `<a href="${p.homepage}" target="_blank" class="project-link-btn" title="Demo">↗</a>`
      : '';

    return `
      <article class="project-card reveal" data-cat="${p.category}">
        <div class="project-header">
          <div class="project-icon">${p.icon}</div>
          <div class="project-links">
            <a href="${p.html_url}" target="_blank" rel="noopener" class="project-link-btn" title="GitHub">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
            ${homepage}
          </div>
        </div>

        <div class="project-name">${p.name}</div>
        <div class="project-desc">${p.description}</div>

        <div class="project-footer">
          <div class="project-tags">${tagsHtml}</div>
          <div class="project-meta">
            <span class="project-meta-item" title="${p.language}">
              <span style="width:8px;height:8px;border-radius:50%;background:${langColor};display:inline-block"></span>
              ${p.language}
            </span>
            ${p.stargazers_count > 0 ? `<span class="project-meta-item">⭐ ${p.stargazers_count}</span>` : ''}
          </div>
        </div>
      </article>
    `;
  };

  /* ── Renderiza projetos com filtro ── */
  const render = (container, filter = 'todos') => {
    currentFilter = filter;
    const filtered = filter === 'todos'
      ? allProjects
      : allProjects.filter(p => p.category === filter);

    if (!filtered.length) {
      container.innerHTML = `
        <div class="projects-empty">
          <div class="projects-empty-icon">📭</div>
          <div class="projects-empty-title">Nenhum projeto nessa categoria</div>
          <div class="projects-empty-text">// Em breve: projetos aparecerão aqui conforme forem criados</div>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(cardHTML).join('');

    // Re-ativa reveal nas novas cards
    if (window.RevealManager) {
      container.querySelectorAll('.reveal').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
      });
      setTimeout(() => {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
        }, { threshold: 0.1 });
        container.querySelectorAll('.reveal').forEach(el => observer.observe(el));
      }, 50);
    }
  };

  /* ── Filtros ── */
  const initFilters = (container) => {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render(container, btn.dataset.filter);
      });
    });
  };

  /* ── Atualiza status bar ── */
  const updateStatus = (source, count) => {
    const el = document.getElementById('gh-status-text');
    if (el) el.textContent = `${count} projeto${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''} via ${source}`;
  };

  /* ── Init ── */
  const init = async () => {
    const container = document.getElementById('projects-grid');
    if (!container) return;

    showSkeleton(container);

    try {
      if (GITHUB_USERNAME) {
        // ── Busca real do GitHub ──
        allProjects = await fetchFromGitHub();
        updateStatus('GitHub API', allProjects.length);

        const notice = document.getElementById('gh-config-notice');
        if (notice) notice.style.display = 'none';

        if (allProjects.length === 0) {
          allProjects = MANUAL_PROJECTS;
          updateStatus('lista manual', MANUAL_PROJECTS.length);
        }
      } else {
        // ── Username não configurado: usa projetos manuais ──
        allProjects = MANUAL_PROJECTS;
        updateStatus('lista manual', MANUAL_PROJECTS.length);

        const notice = document.getElementById('gh-config-notice');
        if (notice) notice.style.display = 'flex';

        const statusDot = document.querySelector('.gh-status-dot');
        if (statusDot) statusDot.style.background = '#f78080';
      }

      initFilters(container);
      render(container, 'todos');

    } catch (err) {
      console.warn('GitHub API falhou:', err);
      allProjects = MANUAL_PROJECTS;
      updateStatus('lista manual (GitHub offline)', MANUAL_PROJECTS.length);
      initFilters(container);
      render(container, 'todos');
    }
  };

  return { init };
})();

/* ═══════════════════════════════════════════
   CONTACT.JS — Formspree Integration
═══════════════════════════════════════════ */

const ContactForm = (() => {
  /*
    COMO ATIVAR O FORMULÁRIO:
    1. Acesse https://formspree.io e crie conta grátis
    2. Clique "New Form" → coloque seu e-mail
    3. Copie o Form ID (ex: "xpwzkabc")
    4. Cole aqui em FORMSPREE_ID
    Plano gratuito: 50 msgs/mês — ótimo para portfólio.
  */
  const FORMSPREE_ID = ''; // ← cole seu ID aqui

  const init = () => {
    const form     = document.getElementById('contact-form');
    const feedback = document.getElementById('form-feedback');
    const notice   = document.getElementById('formspree-notice');
    if (!form) return;

    // Avisa se não está configurado
    if (!FORMSPREE_ID && notice) {
      notice.style.display = 'block';
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;

      if (!FORMSPREE_ID) {
        showFeedback(feedback, 'error', '⚠ Configure o Formspree ID em js/contact.js para ativar o formulário.');
        return;
      }

      // Loading state
      btn.textContent = 'Enviando…';
      btn.classList.add('btn-loading');
      if (feedback) feedback.style.display = 'none';

      try {
        const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' },
        });

        if (res.ok) {
          showFeedback(feedback, 'success', '✓ Mensagem enviada com sucesso! Responderei em breve.');
          form.reset();
        } else {
          const data = await res.json();
          throw new Error(data?.errors?.[0]?.message || 'Erro desconhecido');
        }
      } catch (err) {
        showFeedback(feedback, 'error', `✗ Falha ao enviar: ${err.message}. Tente pelo e-mail diretamente.`);
      } finally {
        btn.textContent = originalText;
        btn.classList.remove('btn-loading');
      }
    });
  };

  const showFeedback = (el, type, msg) => {
    if (!el) return;
    el.className = `form-feedback ${type}`;
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 7000);
  };

  return { init };
})();

/* ── Boot por página ── */
document.addEventListener('DOMContentLoaded', () => {
  // Projetos
  if (document.getElementById('projects-grid')) {
    GithubProjects.init();
  }

  // Contato
  if (document.getElementById('contact-form')) {
    ContactForm.init();
  }
});
