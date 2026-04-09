import { signIn, supabase } from '../js/supabase.js';
import { t, langToggleBtn, bindLangToggle } from '../js/i18n.js';

export function renderLogin(container, navigate) {
  const hash = new URLSearchParams(window.location.hash.replace('#', ''));
  const query = new URLSearchParams(window.location.search);

  // Hash-based error (e.g. expired link)
  if (hash.get('error')) {
    showSignIn(container, navigate, 'The reset link has expired. Please request a new one.');
    return;
  }

  // PKCE flow: code in query param
  const code = query.get('code');
  if (code) {
    window.history.replaceState({}, '', '/login');
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        showSignIn(container, navigate, 'The reset link has expired. Please request a new one.');
      } else {
        showNewPassword(container, navigate);
      }
    });
    return;
  }

  // Implicit flow: access_token in hash
  const accessToken = hash.get('access_token');
  const type = hash.get('type');
  if (type === 'recovery' && accessToken) {
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: hash.get('refresh_token') || '',
    }).then(() => {
      window.history.replaceState({}, '', '/login');
      showNewPassword(container, navigate);
    });
    return;
  }

  showSignIn(container, navigate);
}

function showNewPassword(container, navigate) {
  container.innerHTML = `
    <div class="login-wrap">
      <div class="login-card">
        <div style="display:flex;justify-content:flex-end;margin-bottom:8px;">${langToggleBtn()}</div>
        <div class="login-logo">
          <img src="/assets/icon.png" alt="Kitchen Memories">
          <span class="login-logo-text">Kitchen Memories</span>
        </div>
        <h2>${t('resetPassword')}</h2>
        <p>Enter your new password</p>
        <form id="newpw-form">
          <div class="form-group">
            <label for="password">${t('password')}</label>
            <input type="password" id="password" placeholder="••••••••" required minlength="6">
          </div>
          <div class="form-group">
            <label for="password2">Confirm password</label>
            <input type="password" id="password2" placeholder="••••••••" required minlength="6">
          </div>
          <button type="submit" class="btn-primary" id="newpw-btn">Save new password</button>
          <p id="newpw-msg" style="display:none;text-align:center;margin-top:12px;font-size:0.85rem;"></p>
        </form>
      </div>
    </div>
  `;

  bindLangToggle(() => showNewPassword(container, navigate));

  const form = document.getElementById('newpw-form');
  const btn = document.getElementById('newpw-btn');
  const msgEl = document.getElementById('newpw-msg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pw1 = document.getElementById('password').value;
    const pw2 = document.getElementById('password2').value;

    if (pw1 !== pw2) {
      msgEl.textContent = 'Passwords do not match.';
      msgEl.style.color = 'var(--color-terracotta)';
      msgEl.style.display = 'block';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Saving…';

    const { error } = await supabase.auth.updateUser({ password: pw1 });
    if (error) {
      msgEl.textContent = error.message;
      msgEl.style.color = 'var(--color-terracotta)';
      msgEl.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Save new password';
    } else {
      navigate('/cookbook');
    }
  });
}

function showSignIn(container, navigate, errorMessage = null) {
  container.innerHTML = `
    <div class="login-wrap">
      <div class="login-card">
        <div style="display:flex;justify-content:flex-end;margin-bottom:8px;">${langToggleBtn()}</div>
        <div class="login-logo">
          <img src="/assets/icon.png" alt="Kitchen Memories">
          <span class="login-logo-text">Kitchen Memories</span>
        </div>
        <h2>${t('welcomeBack')}</h2>
        <p>${t('signInDesc')}</p>
        <form id="login-form">
          <div class="form-group">
            <label for="email">${t('email')}</label>
            <input type="email" id="email" placeholder="you@example.com" required autocomplete="email">
          </div>
          <div class="form-group">
            <label for="password">${t('password')}</label>
            <input type="password" id="password" placeholder="••••••••" required autocomplete="current-password">
          </div>
          <button type="submit" class="btn-primary" id="login-btn">${t('signIn')}</button>
          <p class="error-msg" id="login-error" style="${errorMessage ? '' : 'display:none;'}">${errorMessage || ''}</p>
        </form>
        <p style="text-align:center;margin-top:16px;font-size:0.85rem;">
          <a href="#" id="forgot-link" style="color:var(--color-terracotta);text-decoration:none;">${t('forgotPassword')}</a>
        </p>
      </div>
    </div>
  `;

  bindLangToggle(() => showSignIn(container, navigate));

  const form = document.getElementById('login-form');
  const btn = document.getElementById('login-btn');
  const errorEl = document.getElementById('login-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = t('signingIn');
    errorEl.style.display = 'none';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const { error } = await signIn(email, password);
    if (error) {
      errorEl.textContent = error.message;
      errorEl.style.display = 'block';
      btn.disabled = false;
      btn.textContent = t('signIn');
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
        <div style="display:flex;justify-content:flex-end;margin-bottom:8px;">${langToggleBtn()}</div>
        <div class="login-logo">
          <img src="/assets/icon.png" alt="Kitchen Memories">
          <span class="login-logo-text">Kitchen Memories</span>
        </div>
        <h2>${t('resetPassword')}</h2>
        <p>${t('resetDesc')}</p>
        <form id="reset-form">
          <div class="form-group">
            <label for="email">${t('email')}</label>
            <input type="email" id="email" placeholder="you@example.com" required autocomplete="email">
          </div>
          <button type="submit" class="btn-primary" id="reset-btn">${t('sendResetLink')}</button>
          <p id="reset-msg" style="display:none;text-align:center;margin-top:12px;font-size:0.85rem;"></p>
        </form>
        <p style="text-align:center;margin-top:16px;font-size:0.85rem;">
          <a href="#" id="back-link" style="color:var(--color-terracotta);text-decoration:none;">${t('backToSignIn')}</a>
        </p>
      </div>
    </div>
  `;

  bindLangToggle(() => showForgotPassword(container, navigate));

  const form = document.getElementById('reset-form');
  const btn = document.getElementById('reset-btn');
  const msgEl = document.getElementById('reset-msg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = t('sending');
    msgEl.style.display = 'none';

    const email = document.getElementById('email').value.trim();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://kitchenmemories.app/login',
    });

    if (error) {
      msgEl.textContent = error.message;
      msgEl.style.color = 'var(--color-terracotta)';
    } else {
      msgEl.textContent = t('resetSuccess');
      msgEl.style.color = 'var(--color-sage)';
    }
    msgEl.style.display = 'block';
    btn.disabled = false;
    btn.textContent = t('sendResetLink');
  });

  document.getElementById('back-link').addEventListener('click', (e) => {
    e.preventDefault();
    showSignIn(container, navigate);
  });
}
