import { fetchRecipes, signOut, formatTime } from '../js/supabase.js';
import { t, langToggleBtn, bindLangToggle } from '../js/i18n.js';

export async function renderCookbook(container, navigate, session) {
  function buildPage() {
    container.innerHTML = nav(session) + `
      <div class="page">
        <div class="page-header">
          <h1>${t('myRecipes')}</h1>
          <p>${t('myRecipesDesc')}</p>
        </div>
        <div class="search-bar">
          <input class="search-input" id="search" placeholder="${t('search')}" type="search">
          <select class="filter-select" id="category-filter">
            <option value="">${t('allCategories')}</option>
          </select>
        </div>
        <div id="recipes-container"><div class="spinner"></div></div>
      </div>
    `;

    bindNav(navigate, () => buildPage());
    loadRecipes();
  }

  async function loadRecipes() {
    let allRecipes = [];
    try {
      allRecipes = await fetchRecipes();
    } catch (err) {
      document.getElementById('recipes-container').innerHTML =
        `<div class="empty-state"><p>Failed to load recipes: ${err.message}</p></div>`;
      return;
    }

    const categories = [...new Set(allRecipes.map(r => r.recipe_category).filter(Boolean))].sort();
    const select = document.getElementById('category-filter');
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      select.appendChild(opt);
    });

    function renderGrid(recipes) {
      const el = document.getElementById('recipes-container');
      if (!recipes.length) {
        el.innerHTML = `<div class="empty-state"><p>${t('noRecipes')}</p></div>`;
        return;
      }
      el.innerHTML = `<div class="recipes-grid">${recipes.map(recipeCard).join('')}</div>`;
      el.querySelectorAll('[data-link]').forEach(a => {
        a.addEventListener('click', (e) => { e.preventDefault(); navigate(a.getAttribute('href')); });
      });
    }

    function filtered() {
      const q = document.getElementById('search').value.toLowerCase();
      const cat = document.getElementById('category-filter').value;
      return allRecipes.filter(r => {
        const matchQ = !q || r.name.toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q);
        const matchCat = !cat || r.recipe_category === cat;
        return matchQ && matchCat;
      });
    }

    renderGrid(allRecipes);
    document.getElementById('search').addEventListener('input', () => renderGrid(filtered()));
    document.getElementById('category-filter').addEventListener('change', () => renderGrid(filtered()));
  }

  buildPage();
}

function recipeCard(r) {
  const img = r.image_url
    ? `<img class="recipe-card-img" src="${r.image_url}" alt="${escHtml(r.name)}" loading="lazy">`
    : `<div class="recipe-card-img-placeholder">🍽️</div>`;
  const tag = r.recipe_category ? `<span class="recipe-card-tag">${escHtml(r.recipe_category)}</span>` : '';
  const fav = r.is_favourite ? `<span class="fav-icon">♥</span>` : '';
  const time = formatTime(r.prep_time || r.cook_time);
  const meta = [fav, r.servings ? `${r.servings} ${t('servings')}` : '', time ? `⏱ ${time}` : '']
    .filter(Boolean).join(' · ');

  return `
    <a class="recipe-card" href="/cookbook/${r.id}" data-link>
      ${img}
      <div class="recipe-card-body">
        ${tag}
        <div class="recipe-card-title">${escHtml(r.name)}</div>
        ${meta ? `<div class="recipe-card-meta">${meta}</div>` : ''}
      </div>
    </a>
  `;
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

function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
