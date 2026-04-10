import { getSession, supabase } from './supabase.js';
import { renderLogin, renderNewPassword } from '../pages/login.js';
import { renderCookbook } from '../pages/cookbook.js';
import { renderDetail } from '../pages/detail.js';
import { renderCooking } from '../pages/cooking.js';

const app = document.getElementById('app');

export async function navigate(path) {
  window.history.pushState({}, '', path);
  await render(path);
}

async function render(path) {
  const session = await getSession();

  if (!session && path !== '/login') {
    return render('/login');
  }
  if (session && path === '/login') {
    return render('/cookbook');
  }

  app.innerHTML = '';

  const cookingMatch = path.match(/^\/cookbook\/([^/]+)\/cook$/);
  const detailMatch  = path.match(/^\/cookbook\/([^/]+)$/);

  if (path === '/login') {
    renderLogin(app, navigate);
  } else if (path === '/cookbook') {
    renderCookbook(app, navigate, session);
  } else if (cookingMatch) {
    renderCooking(app, navigate, cookingMatch[1]);
  } else if (detailMatch) {
    renderDetail(app, navigate, detailMatch[1]);
  } else {
    navigate('/cookbook');
  }
}

window.addEventListener('popstate', () => render(window.location.pathname));

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-link]');
  if (a) {
    e.preventDefault();
    navigate(a.getAttribute('href'));
  }
});

// If there's a ?code= in the URL, Supabase will auto-exchange it.
// Wait for the auth event instead of rendering immediately.
const hasCode = new URLSearchParams(window.location.search).get('code');

if (hasCode) {
  // Show spinner while Supabase processes the code
  app.innerHTML = `<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;"><div class="spinner"></div></div>`;

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
    subscription.unsubscribe();
    window.history.replaceState({}, '', '/login');
    if (event === 'PASSWORD_RECOVERY') {
      app.innerHTML = '';
      renderNewPassword(app, navigate);
    } else {
      render('/cookbook');
    }
  });
} else {
  render(window.location.pathname || '/login');
}
