/**
 * CleanInspect - Demo Authentication Module
 * js/auth.js
 */

const Auth = {
  DEMO_EMAIL: 'admin@gmail.com',
  DEMO_PASS: '12345',
  DEMO_USER: {
    name: 'David Wilson',
    email: 'admin@gmail.com',
    role: 'Lead Inspector & QA Admin',
    company: 'CleanInspect Quality Control'
  },

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated() {
    const session = Storage.getSession();
    return !!(session && session.email);
  },

  /**
   * Get current user details
   */
  getUser() {
    const session = Storage.getSession();
    return session ? session.user : this.DEMO_USER;
  },

  /**
   * Attempt demo login
   */
  login(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanEmail || !cleanPass) {
      return {
        success: false,
        message: 'Please provide both an email and a password.'
      };
    }

    if (cleanEmail === this.DEMO_EMAIL && cleanPass === this.DEMO_PASS) {
      const session = {
        email: cleanEmail,
        user: this.DEMO_USER,
        token: 'demo-token-' + Date.now(),
        loggedInAt: new Date().toISOString()
      };
      Storage.saveSession(session);
      return { success: true };
    }

    return {
      success: false,
      message: I18n.t('auth.invalidCreds')
    };
  },

  /**
   * Sign out
   */
  logout() {
    Storage.clearSession();
    Utils.showToast(I18n.t('auth.signedOut'), 'info');
    window.location.hash = '#login';
  },

  /**
   * Render the Login Screen (Screen 1)
   */
  renderLogin(container) {
    const t = (k) => I18n.t(k);
    container.innerHTML = `
      <div style="
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background: linear-gradient(160deg, #0F172A 0%, #1E293B 40%, #0EA5E9 130%);
        position: relative;
        overflow: hidden;
      ">

        <!-- Background decorative circles -->
        <div style="position: absolute; top: -80px; right: -60px; width: 280px; height: 280px; border-radius: 50%; background: rgba(59,130,246,0.12); pointer-events: none;"></div>
        <div style="position: absolute; bottom: 30%; left: -80px; width: 220px; height: 220px; border-radius: 50%; background: rgba(99,102,241,0.1); pointer-events: none;"></div>
        <div style="position: absolute; bottom: -60px; right: 10%; width: 180px; height: 180px; border-radius: 50%; background: rgba(16,185,129,0.08); pointer-events: none;"></div>

        <!-- Top brand section -->
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem 1.25rem 1rem; position: relative; z-index: 1;">

          <!-- Logo & Brand -->
          <div style="text-align: center; margin-bottom: 2.5rem; animation: fadeInUp 0.5s cubic-bezier(0.22,1,0.36,1) both;">
            <div style="
              width: 72px; height: 72px;
              border-radius: 20px;
              background: linear-gradient(135deg, #3B82F6, #6366F1);
              display: inline-flex; align-items: center; justify-content: center;
              margin-bottom: 1.25rem;
              box-shadow: 0 12px 32px rgba(59,130,246,0.45);
            ">
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/>
              </svg>
            </div>
            <h1 style="font-size: 1.875rem; font-weight: 900; color: #fff; letter-spacing: -0.03em; margin-bottom: 0.375rem; font-family: 'Plus Jakarta Sans', sans-serif;">${t('appName')}</h1>
            <p style="font-size: 0.875rem; color: rgba(255,255,255,0.55); font-weight: 500; letter-spacing: 0.02em; text-transform: uppercase;">${t('appTagline')}</p>
          </div>

          <!-- Login Card -->
          <div style="
            width: 100%;
            max-width: 400px;
            background: rgba(255, 255, 255, 0.97);
            border-radius: 24px;
            padding: 2rem 1.75rem;
            box-shadow: 0 24px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1);
            animation: fadeInUp 0.5s 0.1s cubic-bezier(0.22,1,0.36,1) both;
          ">

            <div style="margin-bottom: 1.625rem;">
              <h2 style="font-size: 1.375rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.25rem; letter-spacing: -0.025em;">${t('auth.welcomeBack')}</h2>
              <p style="font-size: 0.8375rem; color: var(--text-muted); font-weight: 500;">${t('auth.signInSubtitle')}</p>
            </div>

            <!-- Error Alert -->
            <div id="login-error-alert" class="alert alert-danger hidden" style="margin-bottom: 1.125rem; border-radius: var(--radius-md);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span id="login-error-message">Invalid credentials.</span>
            </div>

            <!-- Login Form -->
            <form id="login-form" novalidate>
              <!-- Email Field -->
              <div class="form-group" style="margin-bottom: 1rem;">
                <label class="form-label" for="login-email" style="color: var(--text-secondary); margin-bottom: 0.35rem; display: block;">${t('auth.email')}</label>
                <div class="input-wrapper">
                  <span class="input-icon-left" style="color: var(--text-muted);">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </span>
                  <input
                    type="email"
                    id="login-email"
                    class="form-input has-icon-left"
                    placeholder="admin@gmail.com"
                    value="admin@gmail.com"
                    required
                    autocomplete="email"
                    style="background: #F8FAFC; font-size: 0.9375rem;"
                  />
                </div>
              </div>

              <!-- Password Field -->
              <div class="form-group" style="margin-bottom: 1.5rem;">
                <label class="form-label" for="login-password" style="color: var(--text-secondary); margin-bottom: 0.35rem; display: block;">${t('auth.password')}</label>
                <div class="input-wrapper">
                  <span class="input-icon-left" style="color: var(--text-muted);">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    type="password"
                    id="login-password"
                    class="form-input has-icon-left has-icon-right"
                    placeholder="Enter your password"
                    value="12345"
                    required
                    autocomplete="current-password"
                    style="background: #F8FAFC; font-size: 0.9375rem;"
                  />
                  <button
                    type="button"
                    id="toggle-password-btn"
                    class="input-icon-right interactive"
                    aria-label="Toggle password visibility"
                    title="Show/Hide Password"
                    style="color: var(--text-muted);"
                  >
                    <svg id="eye-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Sign In Button -->
              <button type="submit" id="login-submit-btn" class="btn btn-primary btn-block" style="height: 50px; font-size: 1rem; border-radius: 14px; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; letter-spacing: -0.01em;">
                <span>${t('auth.signIn')}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </button>
            </form>

            <!-- Demo Credentials Info -->
            <div style="margin-top: 1.25rem; padding: 0.875rem 1rem; background: linear-gradient(135deg, rgba(59,130,246,0.07), rgba(99,102,241,0.07)); border-radius: var(--radius-md); border: 1px solid rgba(59,130,246,0.15);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
                <span style="font-size: 0.75rem; font-weight: 800; color: var(--primary); display: flex; align-items: center; gap: 0.3rem; text-transform: uppercase; letter-spacing: 0.04em;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  ${t('auth.demoCreds')}
                </span>
                <button type="button" id="fill-demo-btn" style="background: var(--primary); color: #fff; border: none; padding: 0.2rem 0.6rem; border-radius: var(--radius-full); font-size: 0.7rem; font-weight: 700; cursor: pointer; font-family: inherit;">
                  ${t('auth.autoFill')}
                </button>
              </div>
              <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5; margin: 0;">
                <code style="font-size: 0.78rem; background: rgba(59,130,246,0.1); padding: 0.1rem 0.35rem; border-radius: 4px; color: var(--primary);">admin@gmail.com</code> /
                <code style="font-size: 0.78rem; background: rgba(59,130,246,0.1); padding: 0.1rem 0.35rem; border-radius: 4px; color: var(--primary);">12345</code>
              </p>
            </div>

          </div>

          <!-- Footer note -->
          <p style="margin-top: 1.5rem; text-align: center; font-size: 0.75rem; color: rgba(255,255,255,0.3); font-weight: 500;">
            ${t('auth.footerNote')}
          </p>
        </div>
      </div>
    `;


    // Bind login form events
    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const togglePassBtn = document.getElementById('toggle-password-btn');
    const eyeIcon = document.getElementById('eye-icon');
    const errorAlert = document.getElementById('login-error-alert');
    const errorMessage = document.getElementById('login-error-message');
    const fillDemoBtn = document.getElementById('fill-demo-btn');

    // Toggle password visibility
    togglePassBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      eyeIcon.innerHTML = isPassword 
        ? `<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>`
        : `<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>`;
    });

    // Auto fill demo button
    fillDemoBtn.addEventListener('click', () => {
      emailInput.value = Auth.DEMO_EMAIL;
      passwordInput.value = Auth.DEMO_PASS;
      errorAlert.classList.add('hidden');
      Utils.showToast(I18n.t('auth.demoPopulated'), 'info', 2000);
    });

    // Form submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      errorAlert.classList.add('hidden');

      const result = Auth.login(emailInput.value, passwordInput.value);
      if (result.success) {
        Utils.showToast(I18n.t('auth.welcomeToast'), 'success');
        window.location.hash = '#dashboard';
      } else {
        errorMessage.textContent = result.message;
        errorAlert.classList.remove('hidden');
      }
    });
  }
};
