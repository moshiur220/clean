/**
 * CleanInspect - Client-Side Hash Router
 * js/router.js
 */

const Router = {
  routes: {},

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    // Initial route handling
    this.handleRoute();
  },

  handleRoute() {
    let hash = window.location.hash || '#dashboard';
    
    // Auth route guard
    const isAuth = Auth.isAuthenticated();

    if (!isAuth) {
      if (hash !== '#login') {
        window.location.hash = '#login';
        return;
      }
    } else {
      if (hash === '#login' || hash === '' || hash === '#') {
        window.location.hash = '#dashboard';
        return;
      }
    }

    // Scroll to top upon route change
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Determine target screen and params
    const container = document.getElementById('main-content');
    if (!container) return;

    // Toggle navigation bars visibility (hide nav completely on login screen)
    const sidebar = document.querySelector('.app-sidebar');
    const mobileHeader = document.querySelector('.mobile-header');
    const bottomNav = document.querySelector('.mobile-bottom-nav');

    if (hash === '#login') {
      if (sidebar) sidebar.style.display = 'none';
      if (mobileHeader) mobileHeader.style.display = 'none';
      if (bottomNav) bottomNav.style.display = 'none';
      if (container.parentElement) container.parentElement.style.marginLeft = '0';
      Auth.renderLogin(container);
      return;
    } else {
      if (sidebar) sidebar.style.display = '';
      if (mobileHeader) mobileHeader.style.display = '';
      if (bottomNav) bottomNav.style.display = '';
      if (container.parentElement) container.parentElement.style.marginLeft = '';
    }

    // Route dispatch
    if (hash.startsWith('#inspection-detail/')) {
      const id = hash.replace('#inspection-detail/', '');
      Inspections.renderDetails(container, id);
      this.updateActiveNav('inspections');
    } else if (hash.startsWith('#checklist-issues/')) {
      const id = hash.replace('#checklist-issues/', '');
      Checklist.renderPage2(container, id);
      this.updateActiveNav('inspections');
    } else if (hash.startsWith('#checklist/')) {
      const parts = hash.replace('#checklist/', '').split('?');
      const id = parts[0];
      const params = new URLSearchParams(parts[1] || '');
      const cat = params.get('cat');
      Checklist.renderPage1(container, id, cat);
      this.updateActiveNav('inspections');
    } else if (hash.startsWith('#summary/')) {
      const id = hash.replace('#summary/', '');
      Summary.renderSummary(container, id);
      this.updateActiveNav('inspections');
    } else if (hash.startsWith('#review/')) {
      const id = hash.replace('#review/', '');
      Summary.renderReview(container, id);
      this.updateActiveNav('inspections');
    } else if (hash.startsWith('#completed/')) {
      const id = hash.replace('#completed/', '');
      Summary.renderCompleted(container, id);
      this.updateActiveNav('inspections');
    } else if (hash.startsWith('#report-detail/')) {
      const id = hash.replace('#report-detail/', '');
      Reports.renderDetail(container, id);
      this.updateActiveNav('reports');
    } else if (hash.startsWith('#issue-detail/')) {
      const id = hash.replace('#issue-detail/', '');
      Issues.renderDetail(container, id);
      this.updateActiveNav('issues');
    } else if (hash === '#dashboard') {
      Dashboard.render(container);
      this.updateActiveNav('dashboard');
    } else if (hash === '#categories') {
      Categories.render(container);
      this.updateActiveNav('categories');
    } else if (hash === '#inspections') {
      Inspections.renderList(container);
      this.updateActiveNav('inspections');
    } else if (hash === '#reports') {
      Reports.renderList(container);
      this.updateActiveNav('reports');
    } else if (hash === '#issues') {
      Issues.renderList(container);
      this.updateActiveNav('issues');
    } else if (hash === '#profile') {
      App.renderProfile(container);
      this.updateActiveNav('profile');
    } else {
      Dashboard.render(container);
      this.updateActiveNav('dashboard');
    }
  },

  /**
   * Update active class on both desktop sidebar and mobile bottom nav
   */
  updateActiveNav(activeKey) {
    // Desktop sidebar
    document.querySelectorAll('.app-sidebar .nav-link').forEach(link => {
      const key = link.getAttribute('data-nav');
      if (key === activeKey) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Mobile bottom bar
    document.querySelectorAll('.mobile-bottom-nav .bottom-nav-item').forEach(link => {
      const key = link.getAttribute('data-nav');
      if (key === activeKey) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
};
