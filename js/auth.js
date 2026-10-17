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
      message: 'Invalid credentials. Please use admin@gmail.com / 12345.'
    };
  },

  /**
   * Sign out
   */
  logout() {
    Storage.clearSession();
    Utils.showToast('You have been signed out.', 'info');
    window.location.hash = '#login';
  },

  /**
   * Render the Login Screen (Screen 1)
   */
  renderLogin(container) {
    container.innerHTML = `
      <div style="min-height: 85vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem 1rem;">
        <div class="card" style="width: 100%; max-width: 440px; padding: 2rem 1.75rem; box-shadow: var(--shadow-lg);">
          
          <!-- Logo & Brand Header -->
          <div style="text-align: center; margin-bottom: 2rem;">
            <div style="display: inline-flex; justify-content: center; margin-bottom: 1rem;">
              <img src="assets/logo.svg" alt="CleanInspect Logo" style="height: 52px; width: auto;" />
            </div>
            <h1 style="font-size: 1.5rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.35rem;">Welcome back</h1>
            <p style="font-size: 0.875rem; color: var(--text-muted);">Sign in to access your cleaning quality inspections</p>
          </div>

          <!-- Alert for Error Feedback -->
          <div id="login-error-alert" class="alert alert-danger hidden" style="margin-bottom: 1.25rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span id="login-error-message">Invalid credentials.</span>
          </div>

          <!-- Login Form -->
          <form id="login-form" novalidate>
            <!-- Email Field -->
            <div class="form-group">
              <label class="form-label" for="login-email">Email Address <span class="required">*</span></label>
              <div class="input-wrapper">
                <span class="input-icon-left">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </span>
                <input 
                  type="email" 
                  id="login-email" 
                  class="form-input has-icon-left" 
                  placeholder="name@company.com" 
                  value="admin@gmail.com" 
                  required 
                  autocomplete="email"
                />
              </div>
            </div>

            <!-- Password Field -->
            <div class="form-group" style="margin-top: 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <label class="form-label" for="login-password">Password <span class="required">*</span></label>
              </div>
              <div class="input-wrapper">
                <span class="input-icon-left">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
                />
                <button 
                  type="button" 
                  id="toggle-password-btn" 
                  class="input-icon-right interactive" 
                  aria-label="Toggle password visibility"
                  title="Show/Hide Password"
                >
                  <svg id="eye-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Sign In Button -->
            <button type="submit" id="login-submit-btn" class="btn btn-primary btn-block" style="margin-top: 1.5rem; height: 48px; font-size: 1rem;">
              <span>Sign In</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </button>
          </form>

          <!-- Demo Credentials Helper Card -->
          <div style="margin-top: 1.75rem; padding: 1rem; background: var(--bg-subtle); border-radius: var(--radius-md); border: 1px dashed var(--border-color); font-size: 0.8125rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
              <span style="font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 0.35rem;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" color="var(--primary)"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                Demo Credentials Hint
              </span>
              <button type="button" id="fill-demo-btn" class="btn btn-sm btn-outline-primary" style="padding: 0.2rem 0.6rem; font-size: 0.75rem; min-height: 28px;">
                Auto-fill
              </button>
            </div>
            <div style="color: var(--text-secondary); line-height: 1.4;">
              Email: <strong style="color: var(--text-main);">admin@gmail.com</strong><br />
              Password: <strong style="color: var(--text-main);">12345</strong>
            </div>
            <p style="margin-top: 0.4rem; font-size: 0.72rem; color: var(--text-light);">
              *Public demo credentials only. Runs locally in the browser with localStorage.
            </p>
          </div>

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
      Utils.showToast('Demo credentials populated!', 'info', 2000);
    });

    // Form submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      errorAlert.classList.add('hidden');

      const result = Auth.login(emailInput.value, passwordInput.value);
      if (result.success) {
        Utils.showToast('Welcome back, David Wilson!', 'success');
        window.location.hash = '#dashboard';
      } else {
        errorMessage.textContent = result.message;
        errorAlert.classList.remove('hidden');
      }
    });
  }
};
