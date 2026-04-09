import { fetchRecipe } from '../js/supabase.js';
import { t } from '../js/i18n.js';

export async function renderCooking(container, navigate, id) {
  container.innerHTML = `<div class="cooking-page"><div class="spinner" style="border-color:rgba(255,255,255,0.2);border-top-color:#E8926F;"></div></div>`;

  let recipe;
  try {
    recipe = await fetchRecipe(id);
  } catch {
    navigate(`/cookbook/${id}`);
    return;
  }

  const steps = recipe.recipe_instructions || [];
  const stepImages = recipe.step_images || [];

  if (!steps.length) {
    navigate(`/cookbook/${id}`);
    return;
  }

  let wakeLock = null;
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
    }
  } catch {}

  let current = 0;

  function render() {
    const isLast = current === steps.length - 1;
    const progress = ((current + 1) / steps.length) * 100;
    const stepImg = stepImages[current];

    container.innerHTML = `
      <div class="cooking-page">
        <div class="cooking-nav">
          <button class="cooking-btn-exit" id="exit-btn">${t('exit')}</button>
          <div class="cooking-nav-title">${escHtml(recipe.name)}</div>
          <div style="width:80px;"></div>
        </div>

        <div class="cooking-progress">
          <div class="cooking-progress-bar" style="width:${progress}%"></div>
        </div>

        <div class="cooking-main">
          <div class="cooking-step-count">${t('stepOf', current + 1, steps.length)}</div>
          ${stepImg ? `<img class="cooking-step-img" src="${stepImg}" alt="${t('stepOf', current + 1, steps.length)}">` : ''}
          <div class="cooking-step-text">${escHtml(String(steps[current]))}</div>
        </div>

        <div class="cooking-controls">
          <button class="cooking-nav-btn" id="prev-btn" ${current === 0 ? 'disabled' : ''}>←</button>
          <button class="cooking-nav-btn primary" id="next-btn">${isLast ? '✓' : '→'}</button>
        </div>
      </div>
    `;

    document.getElementById('exit-btn').addEventListener('click', () => {
      releaseLock();
      navigate(`/cookbook/${id}`);
    });

    document.getElementById('prev-btn')?.addEventListener('click', () => {
      if (current > 0) { current--; render(); }
    });

    document.getElementById('next-btn').addEventListener('click', () => {
      if (isLast) { showDone(); } else { current++; render(); }
    });

    let touchStartX = 0;
    const main = container.querySelector('.cooking-main');
    main.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    main.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 60) {
        if (dx < 0 && !isLast) { current++; render(); }
        if (dx > 0 && current > 0) { current--; render(); }
      }
    }, { passive: true });
  }

  function showDone() {
    releaseLock();
    container.innerHTML = `
      <div class="cooking-page" style="align-items:center;justify-content:center;">
        <div class="cooking-done">
          <div style="font-size:64px;margin-bottom:16px;">🍽️</div>
          <h2>${t('enjoyMeal')}</h2>
          <p>${escHtml(recipe.name)}</p>
          <button class="cooking-btn-exit" id="back-btn" style="margin-top:8px;padding:12px 28px;font-size:0.95rem;">
            ${t('backToRecipe')}
          </button>
        </div>
      </div>
    `;
    document.getElementById('back-btn').addEventListener('click', () => navigate(`/cookbook/${id}`));
  }

  function releaseLock() {
    try { wakeLock?.release(); } catch {}
  }

  render();
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
