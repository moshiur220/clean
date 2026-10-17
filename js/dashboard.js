/**
 * CleanInspect - Dashboard Screen (Screen 2)
 * js/dashboard.js
 */

const Dashboard = {
  render(container) {
    const inspections = Storage.getInspections();
    const user = Auth.getUser();

    // Dynamic stats calculation
    let total = inspections.length;
    let pending = 0;
    let inProgress = 0;
    let completed = 0;

    inspections.forEach(insp => {
      const s = (insp.status || '').toLowerCase();
      if (s === 'completed') completed++;
      else if (s === 'in_progress' || s === 'in-progress') inProgress++;
      else if (s === 'pending' || s === 'scheduled') pending++;
    });

    // Today's date string
    const todayStr = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // In-progress or continue quick target
    const activeInspection = inspections.find(i => i.status === 'in_progress') || inspections.find(i => i.status === 'pending');

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-row">
          <div class="view-title-group">
            <h1>Dashboard</h1>
            <div class="view-subtitle">
              Welcome back, <strong>${Utils.escapeHtml(user.name || 'David Wilson')}</strong> &bull; ${todayStr}
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <a href="#inspections" class="btn btn-outline-primary btn-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg>
              All Inspections
            </a>
            <button id="quick-start-btn" class="btn btn-primary btn-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Start Inspection
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Action Highlight Banner (if in-progress or pending inspection exists) -->
      ${activeInspection ? `
        <div class="card" style="margin-bottom: 1.5rem; background: linear-gradient(135deg, #1E40AF 0%, #2563EB 100%); color: #FFFFFF; border: none;">
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem;">
              <div>
                <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; background: rgba(255,255,255,0.2); padding: 0.2rem 0.6rem; border-radius: var(--radius-full); font-weight: 700;">
                  ${activeInspection.status === 'in_progress' ? 'Inspection In Progress' : 'Next Scheduled Inspection'}
                </span>
                <h2 style="color: #FFFFFF; margin-top: 0.5rem; font-size: 1.35rem;">${Utils.escapeHtml(activeInspection.location)}</h2>
                <p style="color: rgba(255, 255, 255, 0.9); font-size: 0.875rem;">${Utils.escapeHtml(activeInspection.client)} &bull; Ref: ${activeInspection.reference}</p>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 1.75rem; font-weight: 800;">${activeInspection.completionRate || 0}%</div>
                <div style="font-size: 0.75rem; color: rgba(255,255,255,0.8);">Completion Rate</div>
              </div>
            </div>

            <div style="background: rgba(255,255,255,0.2); border-radius: var(--radius-full); height: 8px; overflow: hidden;">
              <div style="background: #10B981; height: 100%; width: ${activeInspection.completionRate || 0}%;"></div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
              <a href="#inspection-detail/${activeInspection.id}" class="btn btn-secondary btn-sm" style="color: var(--text-main);">
                View Details
              </a>
              <a href="#checklist/${activeInspection.id}" class="btn btn-success btn-sm" style="color: #fff;">
                ${activeInspection.status === 'in_progress' ? 'Continue Checklist' : 'Start Inspection'} &rarr;
              </a>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Dynamic Statistics Grid -->
      <div class="stat-grid" style="margin-bottom: 1.75rem;">
        
        <!-- Total -->
        <div class="stat-card">
          <div class="stat-icon primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">${total}</div>
            <div class="stat-label">Total Inspections</div>
          </div>
        </div>

        <!-- Pending -->
        <div class="stat-card">
          <div class="stat-icon warning">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">${pending}</div>
            <div class="stat-label">Pending / Scheduled</div>
          </div>
        </div>

        <!-- In-Progress -->
        <div class="stat-card">
          <div class="stat-icon info">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">${inProgress}</div>
            <div class="stat-label">In-Progress</div>
          </div>
        </div>

        <!-- Completed -->
        <div class="stat-card">
          <div class="stat-icon success">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">${completed}</div>
            <div class="stat-label">Completed & Verified</div>
          </div>
        </div>

      </div>

      <!-- Quick Action Buttons Row -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; margin-bottom: 2rem;">
        <a href="#categories" class="card card-hover" style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem; text-decoration: none;">
          <div style="background: var(--primary-light); color: var(--primary); padding: 0.6rem; border-radius: var(--radius-md);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          </div>
          <div>
            <div style="font-weight: 700; color: var(--text-main); font-size: 0.9375rem;">Browse Categories</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">8 Cleaning Standards</div>
          </div>
        </a>

        <a href="#issues" class="card card-hover" style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem; text-decoration: none;">
          <div style="background: var(--danger-light); color: var(--danger); padding: 0.6rem; border-radius: var(--radius-md);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div>
            <div style="font-weight: 700; color: var(--text-main); font-size: 0.9375rem;">Quality Issues</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${Storage.getIssues().length} Open Findings</div>
          </div>
        </a>

        <a href="#reports" class="card card-hover" style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem; text-decoration: none;">
          <div style="background: var(--info-light); color: var(--info); padding: 0.6rem; border-radius: var(--radius-md);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <div>
            <div style="font-weight: 700; color: var(--text-main); font-size: 0.9375rem;">Inspection Reports</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">PDF &amp; Audit Logs</div>
          </div>
        </a>
      </div>

      <!-- Assigned & Recent Inspections List -->
      <div style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <div>
            <h2 style="font-size: 1.15rem; font-weight: 700;">Assigned Inspections</h2>
            <p style="font-size: 0.8125rem; color: var(--text-muted);">Scheduled locations and assigned checklists</p>
          </div>
          <a href="#inspections" style="font-size: 0.875rem; font-weight: 600;">View All &rarr;</a>
        </div>

        <div class="cards-mobile">
          ${inspections.map(insp => `
            <div class="card card-hover" style="padding: 1.15rem;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <div>
                  <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted);">${insp.reference}</span>
                  <h3 style="font-size: 1.05rem; margin-top: 0.15rem;">${Utils.escapeHtml(insp.location)}</h3>
                  <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-top: 0.15rem;">${Utils.escapeHtml(insp.client)}</div>
                </div>
                <div>${Utils.getStatusBadge(insp.status)}</div>
              </div>

              <div style="font-size: 0.8125rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.4rem; margin: 0.5rem 0;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>${Utils.formatDateTime(insp.scheduledDate)}</span>
              </div>

              <div style="margin: 0.75rem 0;">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.35rem;">
                  <span>Audit Progress</span>
                  <span>${insp.completionRate || 0}% (${insp.completedItems || 0}/${insp.totalItems || 0} passed)</span>
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar-fill ${insp.completionRate >= 80 ? 'success' : (insp.completionRate > 0 ? 'warning' : '')}" style="width: ${insp.completionRate || 0}%;"></div>
                </div>
              </div>

              <div class="card-footer" style="margin-top: 0.75rem; padding-top: 0.75rem;">
                <a href="#inspection-detail/${insp.id}" class="btn btn-secondary btn-sm">Details</a>
                ${insp.status === 'completed' 
                  ? `<a href="#report-detail/${insp.id}" class="btn btn-primary btn-sm">View Report</a>`
                  : `<a href="#checklist/${insp.id}" class="btn btn-success btn-sm">${insp.status === 'in_progress' ? 'Continue' : 'Start'} Inspection</a>`
                }
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Quick Start button handler
    const quickStartBtn = document.getElementById('quick-start-btn');
    if (quickStartBtn) {
      quickStartBtn.addEventListener('click', () => {
        if (activeInspection) {
          window.location.hash = `#checklist/${activeInspection.id}`;
        } else if (inspections.length > 0) {
          window.location.hash = `#checklist/${inspections[0].id}`;
        } else {
          window.location.hash = '#inspections';
        }
      });
    }
  }
};
