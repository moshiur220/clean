/**
 * CleanInspect - Modern & User-Friendly Dashboard (Screen 2)
 * js/dashboard.js
 */

const Dashboard = {
  /**
   * Helper to get high-quality facility image
   */
  getFacilityImage(location = '') {
    const loc = location.toLowerCase();
    if (loc.includes('westfield') || loc.includes('mall')) {
      return 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=400&q=80';
    } else if (loc.includes('sunrise') || loc.includes('office')) {
      return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80';
    } else if (loc.includes('hotel') || loc.includes('riverside')) {
      return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80';
    } else if (loc.includes('grandview') || loc.includes('suite')) {
      return 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80';
    }
    return 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=400&q=80';
  },

  render(container) {
    const inspections = Storage.getInspections();
    const issues = Storage.getIssues();
    const user = Auth.getUser();

    // Dynamic stats calculation
    let total = inspections.length;
    let pending = 0;
    let inProgress = 0;
    let completed = 0;
    let totalScoreSum = 0;
    let completedCountWithScore = 0;

    inspections.forEach(insp => {
      Storage.recalculateInspectionStats(insp);
      const s = (insp.status || '').toLowerCase();
      if (s === 'completed') {
        completed++;
        if (typeof insp.completionRate === 'number') {
          totalScoreSum += insp.completionRate;
          completedCountWithScore++;
        }
      } else if (s === 'in_progress' || s === 'in-progress') {
        inProgress++;
      } else if (s === 'pending' || s === 'scheduled') {
        pending++;
      }
    });

    const avgCompliance = completedCountWithScore > 0 
      ? Math.round((totalScoreSum / completedCountWithScore) * 10) / 10 
      : 92.5;

    // Time-aware greeting
    const hour = new Date().getHours();
    let greetingPrefix = 'Good morning';
    if (hour >= 12 && hour < 17) greetingPrefix = 'Good afternoon';
    else if (hour >= 17) greetingPrefix = 'Good evening';

    const todayStr = new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // Active in-progress inspection or next upcoming
    const activeInspection = inspections.find(i => i.status === 'in_progress') || inspections.find(i => i.status === 'pending');

    // Recent open issues (up to 3)
    const recentIssues = issues.filter(i => i.status !== 'resolved' && i.status !== 'verified').slice(0, 3);

    container.innerHTML = `
      <!-- ================================================================
           HERO WELCOME & EXECUTIVE QA BANNER
           ================================================================ -->
      <div class="dash-hero-banner">
        <div class="dash-hero-top">
          <div>
            <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #93C5FD; font-weight: 700; margin-bottom: 0.35rem;">
              Quality Assurance Workspace
            </div>
            <h1 class="dash-hero-greeting">
              ${greetingPrefix}, ${Utils.escapeHtml(user.name ? user.name.split(' ')[0] : 'David')}!
            </h1>
            <div class="dash-hero-meta">
              <span>${Utils.escapeHtml(user.role || 'Lead Quality Inspector')}</span>
              <span>&bull;</span>
              <span>${todayStr}</span>
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <a href="#inspections" class="btn btn-secondary btn-sm" style="background: rgba(255, 255, 255, 0.15); color: #FFFFFF; border-color: rgba(255, 255, 255, 0.25); backdrop-filter: blur(6px);">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg>
              <span>View All</span>
            </a>
            <button id="hero-quick-start-btn" class="btn btn-success btn-sm" style="color: #ffffff; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.4);">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              <span>Start Audit</span>
            </button>
          </div>
        </div>

        <!-- Quick Snapshot Metric Chips -->
        <div class="dash-hero-chips">
          <div class="dash-hero-chip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FDE047" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span><strong>${avgCompliance}%</strong> Avg Compliance</span>
          </div>

          <div class="dash-hero-chip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
            <span><strong>${total}</strong> Managed Facilities</span>
          </div>

          <div class="dash-hero-chip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F87171" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span><strong>${recentIssues.length}</strong> Open Findings</span>
          </div>
        </div>
      </div>

      <!-- ================================================================
           ACTIVE AUDIT IN-PROGRESS SPOTLIGHT
           ================================================================ -->
      ${activeInspection ? `
        <div class="dash-spotlight-card">
          <div class="dash-spotlight-top">
            <div style="display: flex; align-items: center; gap: 0.85rem;">
              <img src="${this.getFacilityImage(activeInspection.location)}" alt="${Utils.escapeHtml(activeInspection.location)}" style="width: 54px; height: 54px; border-radius: var(--radius-md); object-fit: cover; border: 1.5px solid rgba(255,255,255,0.4); flex-shrink: 0;" />
              <div>
                <div class="dash-spotlight-pulse">
                  <span class="dash-spotlight-pulse-dot"></span>
                  <span>${activeInspection.status === 'in_progress' ? 'Active Inspection In Progress' : 'Next Scheduled Inspection'}</span>
                </div>
                <h2 style="color: #FFFFFF; font-size: 1.25rem; font-weight: 800; margin-top: 0.35rem; line-height: 1.3;">
                  ${Utils.escapeHtml(activeInspection.location)}
                </h2>
                <div style="font-size: 0.8125rem; color: rgba(255, 255, 255, 0.85);">
                  ${Utils.escapeHtml(activeInspection.client)} &bull; Ref: <strong>${activeInspection.reference}</strong>
                </div>
              </div>
            </div>

            <div style="text-align: right;">
              <div style="font-size: 1.85rem; font-weight: 900; line-height: 1;">${activeInspection.completionRate || 0}%</div>
              <div style="font-size: 0.72rem; color: rgba(255,255,255,0.8); text-transform: uppercase; font-weight: 600; margin-top: 0.2rem;">Compliance Rate</div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div style="margin: 1rem 0 1.25rem 0;">
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: rgba(255,255,255,0.9); font-weight: 600; margin-bottom: 0.35rem;">
              <span>Checklist Progress</span>
              <span>${activeInspection.completedItems || 0} of ${activeInspection.totalItems || 0} Standards Passed</span>
            </div>
            <div style="background: rgba(255,255,255,0.2); border-radius: var(--radius-full); height: 9px; overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);">
              <div style="background: #10B981; height: 100%; width: ${activeInspection.completionRate || 0}%; transition: width 0.4s ease; box-shadow: 0 0 10px #10B981;"></div>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; align-items: center; gap: 0.65rem; flex-wrap: wrap;">
            <a href="#inspection-detail/${activeInspection.id}" class="btn btn-sm btn-secondary" style="background: rgba(255,255,255,0.2); color: #fff; border-color: rgba(255,255,255,0.3);">
              View Facility Details
            </a>
            <a href="#checklist/${activeInspection.id}" class="btn btn-sm btn-success" style="background: #10B981; color: #fff; font-weight: 700; border: none; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);">
              ${activeInspection.status === 'in_progress' ? 'Continue Checklist' : 'Start Checklist'} &rarr;
            </a>
          </div>
        </div>
      ` : ''}

      <!-- ================================================================
           DYNAMIC 4-STAT INTERACTIVE METRIC CARDS
           ================================================================ -->
      <div class="dash-stat-grid">
        
        <!-- Total -->
        <a href="#inspections" class="dash-stat-card">
          <div>
            <div class="dash-stat-top">
              <div class="dash-stat-icon-wrap" style="background: var(--primary-light); color: var(--primary);">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                </svg>
              </div>
              <span class="dash-stat-pill" style="background: var(--bg-subtle); color: var(--text-muted);">All</span>
            </div>
            <div class="dash-stat-num">${total}</div>
            <div class="dash-stat-title">Total Inspections</div>
          </div>
          <div style="font-size: 0.72rem; color: var(--primary); font-weight: 600; margin-top: 0.75rem;">
            View full log &rarr;
          </div>
        </a>

        <!-- In-Progress -->
        <a href="#inspections" class="dash-stat-card">
          <div>
            <div class="dash-stat-top">
              <div class="dash-stat-icon-wrap" style="background: var(--info-light); color: var(--info);">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <span class="dash-stat-pill" style="background: var(--info-light); color: var(--info);">Live</span>
            </div>
            <div class="dash-stat-num" style="color: var(--info);">${inProgress}</div>
            <div class="dash-stat-title">In-Progress</div>
          </div>
          <div style="font-size: 0.72rem; color: var(--info); font-weight: 600; margin-top: 0.75rem;">
            Active field audits &rarr;
          </div>
        </a>

        <!-- Pending / Scheduled -->
        <a href="#inspections" class="dash-stat-card">
          <div>
            <div class="dash-stat-top">
              <div class="dash-stat-icon-wrap" style="background: var(--warning-light); color: var(--warning);">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <span class="dash-stat-pill" style="background: var(--warning-light); color: var(--warning);">Queued</span>
            </div>
            <div class="dash-stat-num" style="color: var(--warning);">${pending}</div>
            <div class="dash-stat-title">Pending / Scheduled</div>
          </div>
          <div style="font-size: 0.72rem; color: var(--warning); font-weight: 600; margin-top: 0.75rem;">
            Awaiting start &rarr;
          </div>
        </a>

        <!-- Completed & Verified -->
        <a href="#reports" class="dash-stat-card">
          <div>
            <div class="dash-stat-top">
              <div class="dash-stat-icon-wrap" style="background: var(--success-light); color: var(--success);">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <span class="dash-stat-pill" style="background: var(--success-light); color: var(--success);">Passed</span>
            </div>
            <div class="dash-stat-num" style="color: var(--success);">${completed}</div>
            <div class="dash-stat-title">Completed Audits</div>
          </div>
          <div style="font-size: 0.72rem; color: var(--success); font-weight: 600; margin-top: 0.75rem;">
            Audit reports ready &rarr;
          </div>
        </a>

      </div>

      <!-- ================================================================
           QUICK ACCESS HUB (3 Actionable Cards)
           ================================================================ -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.85rem; margin-bottom: 2rem;">
        <a href="#categories" class="card card-hover" style="display: flex; align-items: center; gap: 0.85rem; padding: 1.15rem; text-decoration: none;">
          <div style="background: var(--primary-light); color: var(--primary); padding: 0.75rem; border-radius: var(--radius-md); flex-shrink: 0;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          </div>
          <div>
            <div style="font-weight: 700; color: var(--text-main); font-size: 0.95rem;">Cleaning Categories</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem;">8 Facility Quality Standards</div>
          </div>
        </a>

        <a href="#issues" class="card card-hover" style="display: flex; align-items: center; gap: 0.85rem; padding: 1.15rem; text-decoration: none;">
          <div style="background: var(--danger-light); color: var(--danger); padding: 0.75rem; border-radius: var(--radius-md); flex-shrink: 0;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div>
            <div style="font-weight: 700; color: var(--text-main); font-size: 0.95rem;">Quality Findings</div>
            <div style="font-size: 0.75rem; color: var(--danger); font-weight: 600; margin-top: 0.15rem;">
              ${issues.length} Issues Tracked (${recentIssues.length} Active)
            </div>
          </div>
        </a>

        <a href="#reports" class="card card-hover" style="display: flex; align-items: center; gap: 0.85rem; padding: 1.15rem; text-decoration: none;">
          <div style="background: var(--info-light); color: var(--info); padding: 0.75rem; border-radius: var(--radius-md); flex-shrink: 0;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <div>
            <div style="font-weight: 700; color: var(--text-main); font-size: 0.95rem;">Inspection Reports</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem;">A4 PDF Export &amp; Print Logs</div>
          </div>
        </a>
      </div>

      <!-- ================================================================
           ASSIGNED & RECENT INSPECTIONS SECTION
           ================================================================ -->
      <div style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <h2 style="font-size: 1.2rem; font-weight: 800; color: var(--text-main);">Assigned Facilities &amp; Schedules</h2>
            <p style="font-size: 0.8125rem; color: var(--text-muted);">Upcoming, active, and completed commercial inspections</p>
          </div>
          <a href="#inspections" class="btn btn-secondary btn-sm" style="font-weight: 600;">
            <span>View All (${inspections.length})</span> &rarr;
          </a>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1rem;">
          ${inspections.map(insp => {
            const facilityImg = this.getFacilityImage(insp.location);
            return `
              <div class="dash-facility-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem;">
                  <div class="dash-facility-header">
                    <img src="${facilityImg}" alt="${Utils.escapeHtml(insp.location)}" class="dash-facility-avatar" loading="lazy" />
                    <div>
                      <div style="font-size: 0.72rem; font-weight: 700; color: var(--primary);">${insp.reference}</div>
                      <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main); margin-top: 0.1rem; line-height: 1.3;">
                        ${Utils.escapeHtml(insp.location)}
                      </h3>
                      <div style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 0.1rem;">${Utils.escapeHtml(insp.client)}</div>
                    </div>
                  </div>
                  <div>${Utils.getStatusBadge(insp.status)}</div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-muted); background: var(--bg-subtle); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); margin-top: 0.25rem;">
                  <div style="display: flex; align-items: center; gap: 0.35rem;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span>${Utils.formatDateTime(insp.scheduledDate)}</span>
                  </div>
                  <span>Auditor: <strong>${Utils.escapeHtml(insp.inspector || 'David Wilson')}</strong></span>
                </div>

                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.35rem;">
                    <span>Compliance Score</span>
                    <span style="color: ${insp.completionRate >= 80 ? 'var(--success)' : (insp.completionRate > 0 ? 'var(--warning)' : 'var(--text-muted)')};">
                      ${insp.completionRate || 0}% (${insp.completedItems || 0}/${insp.totalItems || 0} passed)
                    </span>
                  </div>
                  <div class="progress-bar-container" style="height: 7px;">
                    <div class="progress-bar-fill ${insp.completionRate >= 80 ? 'success' : (insp.completionRate > 0 ? 'warning' : '')}" style="width: ${insp.completionRate || 0}%;"></div>
                  </div>
                </div>

                <div style="display: flex; justify-content: flex-end; align-items: center; gap: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 0.75rem; margin-top: 0.25rem;">
                  <a href="#inspection-detail/${insp.id}" class="btn btn-secondary btn-sm" style="flex: 1;">
                    Details
                  </a>
                  ${insp.status === 'completed'
                    ? `<a href="#report-detail/${insp.id}" class="btn btn-primary btn-sm" style="flex: 1.4;">View Report</a>`
                    : `<a href="#checklist/${insp.id}" class="btn btn-success btn-sm" style="flex: 1.4;">${insp.status === 'in_progress' ? 'Continue' : 'Start'} Audit</a>`
                  }
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- ================================================================
           RECENT QUALITY FINDINGS HIGHLIGHT WIDGET
           ================================================================ -->
      ${recentIssues.length > 0 ? `
        <div class="card" style="margin-bottom: 2rem; border-left: 4px solid var(--danger);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="width: 28px; height: 28px; border-radius: var(--radius-md); background: var(--danger-light); color: var(--danger); display: inline-flex; align-items: center; justify-content: center;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </span>
              <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main);">
                Urgent Quality Findings Requiring Attention
              </h3>
            </div>
            <a href="#issues" style="font-size: 0.8125rem; font-weight: 600; color: var(--danger);">View All Issues &rarr;</a>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.65rem;">
            ${recentIssues.map(iss => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: var(--bg-subtle); border-radius: var(--radius-md); gap: 0.75rem; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 200px;">
                  <div style="font-weight: 700; font-size: 0.875rem; color: var(--text-main);">${Utils.escapeHtml(iss.title)}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem;">
                    ${Utils.escapeHtml(iss.location)} &bull; <strong>${Utils.escapeHtml(iss.category)}</strong>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  ${Utils.getPriorityBadge(iss.priority)}
                  <a href="#issue-detail/${iss.id}" class="btn btn-secondary btn-sm" style="padding: 0.3rem 0.75rem; font-size: 0.75rem; min-height: 30px;">
                    Resolve &rarr;
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;

    // Quick Start button handler in hero banner
    const quickStartBtn = document.getElementById('hero-quick-start-btn');
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
