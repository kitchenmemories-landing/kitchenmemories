import { supabase } from '../js/supabase.js';
import { renderNewPassword } from './login.js';

export async function renderAuthCallback(container, navigate) {
  container.innerHTML = `<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;"><div class="spinner"></div></div>`;

  const code = new URLSearchParams(window.location.search).get('code');

  if (!code) {
    navigate('/login');
    return;
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  window.history.replaceState({}, '', '/auth/callback');

  if (error) {
    navigate('/login');
    return;
  }

  // Show new password form directly
  renderNewPassword(container, navigate);
}
