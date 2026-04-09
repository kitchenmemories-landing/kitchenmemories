import { getSession } from './supabase.js';
import { renderLogin } from '../pages/login.js';
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

// Handle Cloudflare Pages redirect via ?r= param
const redirectPath = new URLSearchParams(window.location.search).get('r');
if (redirectPath) {
  window.history.replaceState({}, '', redirectPath);
}

render(window.location.pathname || '/login');
