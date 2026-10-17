/**
 * CleanInspect - Main Application Controller & Profile/Settings (Screen 17)
 * js/app.js
 */

const App = {
  init() {
    // 1. Initialize i18n
    if (typeof I18n !== 'undefined' && I18n.init) {
      I18n.init();
    }

    // 2. Initialize local storage and seed data if fresh
    Storage.initStorage();

    // 3. Setup global DOM listeners
    this.bindGlobalListeners();

    // 4. Initialize Router
    Router.init();
  },

  bindGlobalListeners() {
    // Logout buttons in sidebar or header
    document.querySelectorAll('.logout-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.logout();
      });
    });

    // Escape key closes modals and lightbox
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        Utils.closeLightbox();
        document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
      }
    });
  },

  /**
   * Screen 17 — Profile & Settings
   */
  renderProfile(container) {
    const user = Auth.getUser();
    const settings = Storage.getSettings();
    const inspections = Storage.getInspections();
    const issues = Storage.getIssues();
    const categories = Storage.getCategories();
    const t = (k, v) => (typeof I18n !== 'undefined' ? I18n.t(k, v) : k);
    const isSv = typeof I18n !== 'undefined' && I18n.currentLang === 'sv';

    // Estimate localStorage usage
    let approxBytes = 0;
    try {
      for (let x in localStorage) {
        if (localStorage.hasOwnProperty(x)) {
          approxBytes += (localStorage[x].length + x.length) * 2;
        }
      }
    } catch {
      approxBytes = 10240;
    }
    const kbUsed = (approxBytes / 1024).toFixed(1);

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-row">
          <div class="view-title-group">
            <h1>${t('profile.title')}</h1>
            <div class="view-subtitle">${t('profile.subtitle')}</div>
          </div>
          <button id="profile-logout-top-btn" class="btn btn-outline-danger btn-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            ${t('profile.signOut')}
          </button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        
        <!-- User Identity Card -->
        <div class="card" style="padding: 1.5rem;">
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem;">
            <div class="user-avatar" style="width: 56px; height: 56px; font-size: 1.25rem;">
              DW
            </div>
            <div>
              <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.15rem;">
                ${Utils.escapeHtml(user.name || 'David Wilson')}
              </h2>
              <div style="font-size: 0.8125rem; color: var(--primary); font-weight: 600;">${isSv ? 'Ledande kvalitetsinspektör' : (user.role || 'Lead Quality Inspector')}</div>
              <div style="font-size: 0.8125rem; color: var(--text-muted);">${Utils.escapeHtml(user.email || 'admin@gmail.com')}</div>
            </div>
          </div>

          <div style="border-top: 1px solid var(--border-color); padding-top: 1rem; font-size: 0.875rem; display: flex; flex-direction: column; gap: 0.65rem;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted);">${t('profile.company')}:</span>
              <strong style="color: var(--text-main);">${Utils.escapeHtml(user.company || 'CleanInspect Quality Control')}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted);">${t('profile.role')}:</span>
              <span class="badge badge-completed">${isSv ? 'Demoadministratör' : 'Demo Administrator'}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted);">${isSv ? 'Sessionstyp' : 'Session Type'}:</span>
              <span>${isSv ? 'Lokal webbläsarsession' : 'Local Browser Token'}</span>
            </div>
          </div>

          <div style="margin-top: 1.5rem;">
            <button id="profile-logout-btn" class="btn btn-outline-danger btn-block">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span>${t('profile.signOut')} (${Utils.escapeHtml(user.name || 'David Wilson')})</span>
            </button>
          </div>
        </div>

        <!-- Application Preferences Card -->
        <div class="card" style="padding: 1.5rem;">
          <h2 style="font-size: 1.15rem; margin-bottom: 1.25rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
            ${t('profile.appSettings')}
          </h2>

          <div style="display: flex; flex-direction: column; gap: 1.25rem;">
            <!-- Language Switcher Section -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
              <div>
                <strong style="font-size: 0.9375rem; color: var(--text-main); display: block;">${t('profile.language')} / Language</strong>
                <span style="font-size: 0.75rem; color: var(--text-muted);">${isSv ? 'Välj systemspråk (standard: Svenska)' : 'Choose system language (default: Swedish)'}</span>
              </div>
              <div style="display: flex; gap: 0.35rem;">
                <button type="button" class="btn btn-sm ${isSv ? 'btn-primary' : 'btn-secondary'}" onclick="I18n.setLanguage('sv')" style="font-size: 0.75rem; padding: 0.35rem 0.65rem;">
                  🇸🇪 Svenska
                </button>
                <button type="button" class="btn btn-sm ${!isSv ? 'btn-primary' : 'btn-secondary'}" onclick="I18n.setLanguage('en')" style="font-size: 0.75rem; padding: 0.35rem 0.65rem;">
                  🇬🇧 English
                </button>
              </div>
            </div>

            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
              <div>
                <strong style="font-size: 0.9375rem; color: var(--text-main); display: block;">${isSv ? 'Automatisk bakgrundssparande' : 'Automatic Background Save'}</strong>
                <span style="font-size: 0.75rem; color: var(--text-muted);">${isSv ? 'Spara status och kommentarer direkt vid inmatning' : 'Persist checklist status and comments immediately upon input'}</span>
              </div>
              <input type="checkbox" id="pref-autosave" ${settings.autoSave ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--primary);" />
            </label>

            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
              <div>
                <strong style="font-size: 0.9375rem; color: var(--text-main); display: block;">${isSv ? 'Klientbildkomprimering' : 'Client Image Compression'}</strong>
                <span style="font-size: 0.75rem; color: var(--text-muted);">${isSv ? 'Komprimera foton via Canvas för att spara lagringsutrymme' : 'Compress captured camera photos via Canvas to maximize storage quota'}</span>
              </div>
              <input type="checkbox" id="pref-compression" checked style="width: 20px; height: 20px; accent-color: var(--primary);" />
            </label>

            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
              <div>
                <strong style="font-size: 0.9375rem; color: var(--text-main); display: block;">${isSv ? 'Adaptiv vy (Mobil / Desktop)' : 'Desktop Table View Mode'}</strong>
                <span style="font-size: 0.75rem; color: var(--text-muted);">${isSv ? 'Visar anpassat mobilgränssnitt eller skrivbordstabeller automatiskt' : 'Automatically show rich tabular view on desktop and stacked cards on mobile'}</span>
              </div>
              <input type="checkbox" checked disabled style="width: 20px; height: 20px; accent-color: var(--primary);" />
            </label>
          </div>

          <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
            <button id="save-preferences-btn" class="btn btn-secondary btn-sm">
              ${t('common.save')} ${t('profile.appSettings')}
            </button>
          </div>
        </div>

      </div>

      <!-- Local Data Management & Reset -->
      <div class="card" style="padding: 1.5rem; margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;">
          <div>
            <h2 style="font-size: 1.15rem; font-weight: 700;">${isSv ? 'Lokal databas & Lagringshantering' : 'Local Browser Storage Management'}</h2>
            <p style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 0.15rem;">
              ${isSv ? 'All CleanInspect-data sparas lokalt i webbläsaren via localStorage och IndexedDB.' : 'All CleanInspect data lives entirely in your browser using localStorage and IndexedDB.'}
            </p>
          </div>
          <button id="reset-data-btn" class="btn btn-danger btn-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            ${isSv ? 'Återställ demodata' : 'Reset Demo Data'}
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; text-align: center;">
          <div style="background: var(--bg-subtle); padding: 1rem; border-radius: var(--radius-md);">
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary);">${inspections.length}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">${t('inspections.title')}</div>
          </div>
          <div style="background: var(--bg-subtle); padding: 1rem; border-radius: var(--radius-md);">
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary);">${categories.length}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">${t('categories.title')}</div>
          </div>
          <div style="background: var(--bg-subtle); padding: 1rem; border-radius: var(--radius-md);">
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--danger);">${issues.length}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">${t('issues.activeIssues')}</div>
          </div>
          <div style="background: var(--bg-subtle); padding: 1rem; border-radius: var(--radius-md);">
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-main);">${kbUsed} KB</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">${isSv ? 'Lagring använd' : 'Storage Utilized'}</div>
          </div>
        </div>

        <div style="margin-top: 1.25rem; font-size: 0.75rem; color: var(--text-light); line-height: 1.5;">
          ${isSv ? '*Foton och högupplösta bilagor sparas i IndexedDB (CleanInspectDB) för att kringgå webbläsarkvoter.' : '*Photos and high-resolution audit attachments are offloaded to IndexedDB (<span style="font-family:monospace;">CleanInspectDB</span>) to bypass browser storage quotas.'}
        </div>
      </div>
    `;

    // Logout handlers
    const logoutBtn = document.getElementById('profile-logout-btn');
    const logoutTopBtn = document.getElementById('profile-logout-top-btn');
    [logoutBtn, logoutTopBtn].forEach(btn => {
      if (btn) btn.addEventListener('click', () => Auth.logout());
    });

    // Save preferences
    const savePrefBtn = document.getElementById('save-preferences-btn');
    if (savePrefBtn) {
      savePrefBtn.addEventListener('click', () => {
        const autoSave = document.getElementById('pref-autosave').checked;
        settings.autoSave = autoSave;
        Storage.saveSettings(settings);
        Utils.showToast(isSv ? 'Inställningar sparade!' : 'Preferences updated!', 'success');
      });
    }

    // Reset Demo Data confirmation modal
    const resetBtn = document.getElementById('reset-data-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        App.showResetConfirmationModal(() => {
          App.renderProfile(container);
        });
      });
    }
  },

  /**
   * Confirmation dialog for Reset Demo Data
   */
  showResetConfirmationModal(onReset) {
    const isSv = typeof I18n !== 'undefined' && I18n.currentLang === 'sv';
    let modal = document.getElementById('reset-confirm-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'reset-confirm-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-content" style="max-width: 440px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--danger);">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <h3 class="modal-title" style="color: var(--danger);">${isSv ? 'Återställ demodata?' : 'Reset Demo Data?'}</h3>
          </div>
          <button class="btn btn-icon btn-ghost" onclick="document.getElementById('reset-confirm-modal').classList.remove('active')">&times;</button>
        </div>

        <div class="modal-body" style="padding: 1.25rem;">
          <p style="font-size: 0.9375rem; color: var(--text-main); line-height: 1.5;">
            ${isSv ? 'Är du säker på att du vill återställa ursprungliga demodata?' : 'Are you sure you want to restore the original sample dataset?'}
          </p>
          <p style="font-size: 0.8125rem; color: var(--text-muted); line-height: 1.4; margin-top: 0.5rem;">
            ${isSv ? 'Denna åtgärd återställer alla checklistor, egna observationer, nya foton och ärendeändringar tillbaka till standardläget.' : 'This action will reset all inspection checklists, custom observations, new photos, and issue lifecycle updates back to default demo state.'}
          </p>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="document.getElementById('reset-confirm-modal').classList.remove('active')">${isSv ? 'Avbryt' : 'Cancel'}</button>
          <button type="button" id="confirm-reset-action-btn" class="btn btn-danger">${isSv ? 'Ja, återställ all data' : 'Yes, Reset All Data'}</button>
        </div>
      </div>
    `;

    modal.classList.add('active');

    const confirmBtn = document.getElementById('confirm-reset-action-btn');
    confirmBtn.addEventListener('click', () => {
      Storage.resetDemoData();
      modal.classList.remove('active');
      Utils.showToast(isSv ? 'Demodata återställd!' : 'Demo data restored to initial state!', 'success');
      if (onReset) onReset();
    });
  }
};

// Auto boot on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
