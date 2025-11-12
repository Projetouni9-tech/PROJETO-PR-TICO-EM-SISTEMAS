/* ONG Viva — SPA + localStorage cadastro (Home / Projects / Cadastro) */
(function () {
  // --- Templates ---
  const Templates = {
    home() {
      return `
        <section class="section">
          <div class="container">
            <div class="surface-card hero">
              <div class="hero__content">
                <span class="badge">+3 milhões de pessoas engajadas</span>
                <h1 class="hero__title">Transformando impacto social em presença digital</h1>
                <p>A ONG Viva conecta pessoas e natureza através de projetos locais, educação ambiental e mutirões de plantio.</p>
                <div class="form-actions">
                  <a class="button" href="#projects" data-route="projects">Conhecer projetos</a>
                  <a class="button button--outline" href="#cadastro" data-route="cadastro">Quero participar</a>
                </div>
              </div>
              <div class="hero__media">
                <img src="img/hero.jpeg" alt="Voluntários e natureza" />
              </div>
            </div>

            <div style="height:1rem"></div>

            <div class="grid grid-3">
              <div class="surface-card">
                <h3>Nossa missão</h3>
                <p>Promover a preservação ambiental e inclusão comunitária por meio de ações práticas e educação.</p>
              </div>
              <div class="surface-card">
                <h3>Transparência</h3>
                <p>Relatórios públicos e prestação de contas regular para doadores e parceiros.</p>
              </div>
              <div class="surface-card">
                <h3>Voluntariado</h3>
                <p>Trilhas de capacitação e reconhecimento por participação em campo.</p>
              </div>
            </div>
          </div>
        </section>
      `;
    },

    projects() {
      return `
        <section class="section">
          <div class="container">
            <h2>Projetos Ativos</h2>
            <div class="surface-card">
              <div class="project">
                <img src="img/recicla.jpeg" alt="Recicla Bairro" />
                <div>
                  <h3>Recicla Bairro</h3>
                  <p>Campanha de coleta seletiva e oficinas de reciclagem nas comunidades locais.</p>
                </div>
              </div>

              <div class="project">
                <img src="img/verdeescolas.jpeg" alt="Verde nas Escolas" />
                <div>
                  <h3>Verde nas Escolas</h3>
                  <p>Atividades educativas sobre sustentabilidade e hortas escolares.</p>
                </div>
              </div>

              <div class="project">
                <img src="img/plante-vida.jpeg" alt="Plante Vida" />
                <div>
                  <h3>Plante Vida</h3>
                  <p>Mutirões de plantio em áreas urbanas e recuperação de margens de rios.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      `;
    },

    cadastro() {
      return `
        <section class="section">
          <div class="container">
            <h2>Cadastre-se como voluntário</h2>
            <div class="surface-card">
              <form id="formCadastro" novalidate>
                <label>Nome completo
                  <input type="text" id="nome" required placeholder="Seu nome completo">
                </label>

                <label>Email
                  <input type="email" id="email" required placeholder="seu@email.com">
                </label>

                <label>Área de interesse
                  <select id="area" required>
                    <option value="">Selecione</option>
                    <option value="reciclagem">Reciclagem</option>
                    <option value="educacao">Educação Ambiental</option>
                    <option value="reflorestamento">Reflorestamento</option>
                    <option value="logistica">Logística / Apoio</option>
                  </select>
                </label>

                <label>Mensagem
                  <textarea id="mensagem" rows="4" placeholder="Como você gostaria de ajudar? (opcional)"></textarea>
                </label>

                <div class="form-actions">
                  <button class="button" type="submit">Enviar cadastro</button>
                  <button class="button button--outline" type="button" id="limparBtn">Limpar cadastros</button>
                </div>
              </form>

              <div id="listaCadastros" style="margin-top:1rem"></div>
            </div>
          </div>
        </section>
      `;
    }
  };

  window.Templates = Templates;

  // --- SPA routing & render ---
  const routes = {
    home: Templates.home,
    projects: Templates.projects,
    cadastro: Templates.cadastro
  };

  const viewRoot = document.getElementById('view-root');
  if (!viewRoot) return;

  function updateNav(route) {
    document.querySelectorAll('[data-route]').forEach(link => {
      if (link.dataset.route === route) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function render(route) {
    const template = (routes[route] || routes.home)();
    viewRoot.innerHTML = template;
    updateNav(route);
    // init behaviors for current view
    if (route === 'cadastro') initCadastro();
  }

  // navigation by hash
  function navigate(route) {
    if (!routes[route]) route = 'home';
    location.hash = route;
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-route]');
    if (!link) return;
    e.preventDefault();
    navigate(link.dataset.route);
  });

  window.addEventListener('hashchange', () => {
    const route = location.hash.replace('#', '') || 'home';
    render(route);
  });

  // mobile menu toggle (simple)
  const mobileBtn = document.getElementById('mobileMenuBtn');
  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      const expanded = mobileBtn.getAttribute('aria-expanded') === 'true';
      mobileBtn.setAttribute('aria-expanded', String(!expanded));
      const nav = document.querySelector('.main-nav');
      if (nav) nav.style.display = expanded ? 'none' : 'block';
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 700) {
        document.querySelector('.main-nav').style.display = 'block';
        mobileBtn.setAttribute('aria-expanded', 'false');
      } else {
        document.querySelector('.main-nav').style.display = 'none';
      }
    });
  }

  // initial render
  render(location.hash.replace('#', '') || (window.__INITIAL_ROUTE__ || 'home'));

  // --- Cadastro logic: localStorage CRUD ---
  function initCadastro() {
    const form = document.getElementById('formCadastro');
    const listaEl = document.getElementById('listaCadastros');
    const limparBtn = document.getElementById('limparBtn');
    if (!form || !listaEl) return;

    const KEY = 'ongviva_cadastros_v1';
    let items = JSON.parse(localStorage.getItem(KEY) || '[]');

    function renderList() {
      listaEl.innerHTML = '';
      if (!items.length) {
        listaEl.innerHTML = `<p class="muted">Nenhum voluntário cadastrado ainda.</p>`;
        return;
      }
      items.forEach((it, idx) => {
        const node = document.createElement('div');
        node.className = 'cadastro-item';
        node.innerHTML = `
          <div>
            <strong>${escapeHtml(it.nome)}</strong><br/>
            <small>${it.email} • ${it.area || '—'}</small><br/>
            <small>${it.date ? new Date(it.date).toLocaleString() : ''}</small>
          </div>
          <div style="display:flex;gap:.5rem;align-items:center">
            <button data-edit="${idx}" class="button button--outline" title="Editar">Editar</button>
            <button data-del="${idx}" class="button" style="background:#c23;color:#fff">Excluir</button>
          </div>
        `;
        listaEl.appendChild(node);
      });

      // attach listeners
      listaEl.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
        const idx = Number(b.getAttribute('data-del'));
        if (!confirm('Remover este cadastro?')) return;
        items.splice(idx, 1);
        localStorage.setItem(KEY, JSON.stringify(items));
        renderList();
        showToast('Cadastro removido.');
      }));

      listaEl.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => {
        const idx = Number(b.getAttribute('data-edit'));
        const it = items[idx];
        if (!it) return;
        // populate form for editing (simple approach: remove and populate)
        document.getElementById('nome').value = it.nome;
        document.getElementById('email').value = it.email;
        document.getElementById('area').value = it.area || '';
        document.getElementById('mensagem').value = it.mensagem || '';
        // remove original entry (user will resubmit)
        items.splice(idx, 1);
        localStorage.setItem(KEY, JSON.stringify(items));
        renderList();
        showToast('Edite os campos e envie para atualizar.');
      }));
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = document.getElementById('nome').value.trim();
      const email = document.getElementById('email').value.trim();
      const area = document.getElementById('area').value;
      const mensagem = document.getElementById('mensagem').value.trim();

      if (!nome || !validateEmail(email)) {
        return showToast('Por favor insira nome e um e-mail válido.', true);
      }

      items.push({ nome, email, area, mensagem, date: new Date().toISOString() });
      localStorage.setItem(KEY, JSON.stringify(items));
      form.reset();
      renderList();
      showToast('Cadastro realizado com sucesso!');
    });

    limparBtn.addEventListener('click', () => {
      if (!confirm('Limpar todos os cadastros? Essa ação não pode ser desfeita.')) return;
      items = [];
      localStorage.setItem(KEY, JSON.stringify(items));
      renderList();
      showToast('Todos os cadastros foram removidos.');
    });

    renderList();
  }

  // --- small helpers ---
  function showToast(message, isError=false) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = message;
    t.style.background = isError ? '#c23' : 'var(--primary)';
    t.hidden = false;
    t.style.opacity = '1';
    clearTimeout(window.__toastTimeout);
    window.__toastTimeout = setTimeout(()=>{ t.style.opacity='0'; setTimeout(()=> t.hidden=true, 400) }, 3500);
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // simple escaping for text inserted in innerHTML via script
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

})();
