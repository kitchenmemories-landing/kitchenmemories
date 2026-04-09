import { signIn, supabase } from '../js/supabase.js';

export function renderLogin(container, navigate) {
  showSignIn(container, navigate);
}

function showSignIn(container, navigate) {
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
        <p style="text-align:center;margin-top:16px;font-size:0.85rem;">
          <a href="#" id="forgot-link" style="color:var(--color-terracotta);text-decoration:none;">Forgot password?</a>
        </p>
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
      navigate('/cookbook');
    }
  });

  document.getElementById('forgot-link').addEventListener('click', (e) => {
    e.preventDefault();
    showForgotPassword(container, navigate);
  });
}

function showForgotPassword(container, navigate) {
  container.innerHTML = `
    <div class="login-wrap">
      <div class="login-card">
        <div class="login-logo">
          <img src="/assets/icon.png" alt="Kitchen Memories">
          <span class="login-logo-text">Kitchen Memories</span>
        </div>
        <h2>Reset password</h2>
        <p>Enter your email and we'll send you a reset link</p>
        <form id="reset-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" placeholder="you@example.com" required autocomplete="email">
          </div>
          <button type="submit" class="btn-primary" id="reset-btn">Send reset link</button>
          <p id="reset-msg" style="display:none;text-align:center;margin-top:12px;font-size:0.85rem;"></p>
        </form>
        <p style="text-align:center;margin-top:16px;font-size:0.85rem;">
          <a href="#" id="back-link" style="color:var(--color-terracotta);text-decoration:none;">← Back to sign in</a>
        </p>
      </div>
    </div>
  `;

  const form = document.getElementById('reset-form');
  const btn = document.getElementById('reset-btn');
  const msgEl = document.getElementById('reset-msg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = 'Sending…';
    msgEl.style.display = 'none';

    const email = document.getElementById('email').value.trim();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://kitchenmemories.app/login',
    });

    if (error) {
      msgEl.textContent = error.message;
      msgEl.style.color = 'var(--color-terracotta)';
    } else {
      msgEl.textContent = '✓ Check your email for the reset link!';
      msgEl.style.color = 'var(--color-sage)';
    }
    msgEl.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Send reset link';
  });

  document.getElementById('back-link').addEventListener('click', (e) => {
    e.preventDefault();
    showSignIn(container, navigate);
  });
}
