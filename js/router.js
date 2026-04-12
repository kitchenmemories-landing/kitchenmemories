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

// If there's a ?code= in the URL, handle it manually (detectSessionInUrl is false).
// Set up the listener FIRST, then exchange — guarantees we catch PASSWORD_RECOVERY.
const hasCode = new URLSearchParams(window.location.search).get('code');

if (hasCode) {
  app.innerHTML = `<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;"><div class="spinner"></div></div>`;

  // Collect events instead of one-shot handler.
  // Supabase fires SIGNED_IN before PASSWORD_RECOVERY — a one-shot handler
  // on SIGNED_IN would miss the recovery event entirely.
  let isRecovery = false;
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      isRecovery = true;
    }
  });

  // Exchange the code — events fire synchronously before the promise resolves,
  // so isRecovery is already set by the time .then() runs.
  supabase.auth.exchangeCodeForSession(hasCode).then(({ error }) => {
    subscription.unsubscribe();

    if (error) {
      render('/login');
      return;
    }

    window.history.replaceState({}, '', isRecovery ? '/login' : '/cookbook');
    if (isRecovery) {
      renderNewPassword(app, navigate);
    } else {
      render('/cookbook');
    }
  });
} else {
  render(window.location.pathname || '/login');
}
