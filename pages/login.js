import { signIn } from '../js/supabase.js';

export function renderLogin(container, navigate) {
  container.innerHTML = `
    <div class="login-wrap">
      <div class="login-card">
        <div class="login-logo">
          <img src="/assets/icon.png" alt="Kitchen Memories">
          <span class="login-logo-text">Kitchen Memories</span>
        </div>
        <h2>Welcome back</h2>
        <p>Sign in to access your recipes</p>
        <form id="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" placeholder="you@example.com" required autocomplete="email">
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" placeholder="••••••••" required autocomplete="current-password">
          </div>
          <button type="submit" class="btn-primary" id="login-btn">Sign in</button>
          <p class="error-msg" id="login-error" style="display:none;"></p>
        </form>
      </div>
    </div>
  `;

  const form = document.getElementById('login-form');
  const btn = document.getElementById('login-btn');
  const errorEl = document.getElementById('login-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = 'Signing in…';
    errorEl.style.display = 'none';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const { error } = await signIn(email, password);
    if (error) {
      errorEl.textContent = error.message;
      errorEl.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Sign in';
    } else {
      navigate('/recipes');
    }
  });
}
