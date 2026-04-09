import { fetchRecipe, signOut, formatTime, getSession } from '../js/supabase.js';
import { t, langToggleBtn, bindLangToggle } from '../js/i18n.js';

export async function renderDetail(container, navigate, id) {
  const session = await getSession();

  function buildNav() {
    return nav(session);
  }

  container.innerHTML = buildNav() + `<div class="page"><div class="spinner"></div></div>`;
  bindNav(navigate, () => {
    container.querySelector('nav').outerHTML = buildNav();
    bindNav(navigate, () => {});
    render();
  });

  let recipe;
  try {
    recipe = await fetchRecipe(id);
  } catch (err) {
    document.querySelector('.page').innerHTML =
      `<a class="back-link" href="/cookbook" data-link>${t('backToRecipes')}</a>
       <div class="empty-state"><p>Recipe not found.</p></div>`;
    bindLinks(navigate);
    return;
  }

  const baseServings = recipe.servings || 4;
  let currentServings = baseServings;

  function render() {
    const ratio = currentServings / baseServings;
    const ingredients = (recipe.recipe_ingredient || []);
    const steps = (recipe.recipe_instructions || []);
    const totalTime = [recipe.prep_time, recipe.cook_time, recipe.rest_time]
      .filter(Boolean)
      .reduce((sum, v) => sum + parseInt(v || 0), 0);

    document.querySelector('.page').innerHTML = `
      <a class="back-link" href="/cookbook" data-link>${t('backToRecipes')}</a>

      ${recipe.image_url ? `<img class="detail-hero" src="${recipe.image_url}" alt="${escHtml(recipe.name)}">` : ''}

      <div class="detail-header">
        ${recipe.recipe_category ? `<div class="detail-tag">${escHtml(recipe.recipe_category)}</div>` : ''}
        <h1 class="detail-title">${escHtml(recipe.name)}</h1>
        ${recipe.description ? `<p class="detail-description">${escHtml(recipe.description)}</p>` : ''}
      </div>

      <div class="detail-meta">
        ${recipe.prep_time ? `<div class="detail-meta-item"><span class="detail-meta-label">${t('prep')}</span><span class="detail-meta-value">${formatTime(recipe.prep_time)}</span></div>` : ''}
        ${recipe.cook_time ? `<div class="detail-meta-item"><span class="detail-meta-label">${t('cook')}</span><span class="detail-meta-value">${formatTime(recipe.cook_time)}</span></div>` : ''}
        ${recipe.rest_time ? `<div class="detail-meta-item"><span class="detail-meta-label">${t('rest')}</span><span class="detail-meta-value">${formatTime(recipe.rest_time)}</span></div>` : ''}
        ${totalTime > 0 ? `<div class="detail-meta-item"><span class="detail-meta-label">${t('total')}</span><span class="detail-meta-value">${formatTime(String(totalTime))}</span></div>` : ''}
        <div class="detail-meta-item"><span class="detail-meta-label">${t('servings')}</span><span class="detail-meta-value">${baseServings}</span></div>
      </div>

      ${steps.length ? `
        <a class="btn-cook" href="/cookbook/${id}/cook" data-link>${t('startCooking')}</a>
      ` : ''}

      <div class="detail-layout">
        <div>
          <h2 class="detail-section-title">${t('ingredients')}</h2>
          <div class="servings-control">
            <button class="servings-btn" id="servings-minus">−</button>
            <span class="servings-count" id="servings-count">${currentServings}</span>
            <span class="servings-label">${t('servings')}</span>
            <button class="servings-btn" id="servings-plus">+</button>
          </div>
          <ul class="ingredient-list">
            ${ingredients.map(ing => {
              const amount = typeof ing.amount === 'number'
                ? formatAmount(ing.amount * ratio)
                : (ing.amount || '');
              const unit = ing.unit || '';
              return `<li class="ingredient-item">
                <span class="ingredient-amount">${amount}${unit ? ' ' + escHtml(unit) : ''}</span>
                <span class="ingredient-name">${escHtml(ing.name || String(ing))}</span>
              </li>`;
            }).join('')}
          </ul>
        </div>
        <div>
          <h2 class="detail-section-title">${t('instructions')}</h2>
          <ol class="steps-list">
            ${steps.map((step, i) => `
              <li class="step-item">
                <div class="step-number">${i + 1}</div>
                <div class="step-text">${escHtml(String(step))}</div>
              </li>
            `).join('')}
          </ol>
        </div>
      </div>
    `;

    bindLinks(navigate);
    document.getElementById('servings-minus')?.addEventListener('click', () => {
      if (currentServings > 1) { currentServings--; render(); }
    });
    document.getElementById('servings-plus')?.addEventListener('click', () => {
      currentServings++;
      render();
    });
  }

  render();
}

function nav(session) {
  const email = session?.user?.email || '';
  return `
    <nav class="nav">
      <div class="nav-inner">
        <a href="/" class="nav-logo">
          <img src="/assets/icon.png" alt="Kitchen Memories">
          <span class="nav-logo-text">Kitchen Memories</span>
        </a>
        <div class="nav-actions">
          <span class="nav-user">${escHtml(email)}</span>
          ${langToggleBtn()}
          <button class="btn-ghost" id="sign-out-btn">${t('signOut')}</button>
        </div>
      </div>
    </nav>
  `;
}

function bindNav(navigate, onLangToggle) {
  document.getElementById('sign-out-btn')?.addEventListener('click', async () => {
    await signOut();
    navigate('/login');
  });
  bindLangToggle(onLangToggle);
}

function bindLinks(navigate) {
  document.querySelectorAll('[data-link]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(a.getAttribute('href'));
    });
  });
}

function formatAmount(n) {
  if (n === Math.floor(n)) return String(Math.floor(n));
  const fractions = [[1/4,'¼'],[1/3,'⅓'],[1/2,'½'],[2/3,'⅔'],[3/4,'¾']];
  const whole = Math.floor(n);
  const frac = n - whole;
  for (const [val, sym] of fractions) {
    if (Math.abs(frac - val) < 0.08) return whole > 0 ? `${whole}${sym}` : sym;
  }
  return n.toFixed(1);
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
