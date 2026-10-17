/**
 * CleanInspect - Reports List (Screen 12) & Detailed Inspection Report (Screen 13)
 * js/reports.js
 */

const Reports = {
  /**
   * Screen 12 — Reports List
   */
  renderList(container) {
    const allInspections = Storage.getInspections();
    // Reports are available for all inspections, especially completed or in-progress
    const reportsList = allInspections.map(insp => {
      Storage.recalculateInspectionStats(insp);
      return {
        ...insp,
        reportId: insp.reportId || `REP-${insp.reference.replace('INS-', '')}`
      };
    });

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-row">
          <div class="view-title-group">
            <h1>${I18n.t('reports.title')}</h1>
            <div class="view-subtitle">${I18n.t('reports.subtitle')}</div>
          </div>
          <div style="font-size: 0.8125rem; color: var(--text-muted); background: var(--bg-card); padding: 0.35rem 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            ${I18n.t('reports.totalReportsCount', { count: reportsList.length })}
          </div>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="card" style="margin-bottom: 1.5rem; padding: 1rem 1.25rem;">
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <div class="input-wrapper">
            <span class="input-icon-left">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </span>
            <input 
              type="text" 
              id="report-search" 
              class="form-input has-icon-left" 
              placeholder="${I18n.t('reports.searchPlaceholder')}" 
            />
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; justify-content: space-between;">
            <div style="display: flex; gap: 0.35rem;" id="report-status-pills">
              <button class="btn btn-sm btn-primary active" data-filter="all">${I18n.t('reports.all')} (${reportsList.length})</button>
              <button class="btn btn-sm btn-secondary" data-filter="completed">${I18n.t('reports.completedAudits')}</button>
              <button class="btn btn-sm btn-secondary" data-filter="in_progress">${I18n.t('reports.draftInProgress')}</button>
            </div>

            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <select id="report-sort" class="form-select" style="min-height: 36px; padding: 0.35rem 0.75rem; font-size: 0.8125rem;">
                <option value="newest">${I18n.t('reports.newestFirst')}</option>
                <option value="oldest">${I18n.t('reports.oldestFirst')}</option>
                <option value="score">${I18n.t('reports.complianceScoreSort')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Reports List Container -->
      <div id="reports-view-container">
        <!-- Rendered dynamically -->
      </div>
    `;

    const searchInput = document.getElementById('report-search');
    const sortSelect = document.getElementById('report-sort');
    const statusPills = document.querySelectorAll('#report-status-pills button');
    const viewContainer = document.getElementById('reports-view-container');

    let currentStatusFilter = 'all';

    function renderReportItems() {
      const q = searchInput.value.trim().toLowerCase();
      let filtered = reportsList.filter(rep => {
        const matchesQuery = 
          rep.reportId.toLowerCase().includes(q) ||
          rep.reference.toLowerCase().includes(q) ||
          rep.location.toLowerCase().includes(q) ||
          rep.client.toLowerCase().includes(q) ||
          (rep.inspector && rep.inspector.toLowerCase().includes(q));

        let matchesStatus = true;
        if (currentStatusFilter === 'completed') matchesStatus = rep.status === 'completed';
        else if (currentStatusFilter === 'in_progress') matchesStatus = rep.status !== 'completed';

        return matchesQuery && matchesStatus;
      });

      // Sort
      const sortVal = sortSelect.value;
      filtered.sort((a, b) => {
        if (sortVal === 'newest') return new Date(b.scheduledDate) - new Date(a.scheduledDate);
        if (sortVal === 'oldest') return new Date(a.scheduledDate) - new Date(b.scheduledDate);
        if (sortVal === 'score') return (b.completionRate || 0) - (a.completionRate || 0);
        return 0;
      });

      if (filtered.length === 0) {
        viewContainer.innerHTML = `
          <div class="card" style="text-align: center; padding: 3rem 1.5rem;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--text-muted); margin: 0 auto 0.75rem;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <h3 style="font-size: 1.15rem; color: var(--text-main); margin-bottom: 0.25rem;">${I18n.t('reports.noReportsFound')}</h3>
            <p style="font-size: 0.875rem; color: var(--text-muted);">${I18n.t('reports.noReportsFoundDesc')}</p>
          </div>
        `;
        return;
      }

      // Mobile Cards
      const mobileHtml = `
        <div class="cards-mobile">
          ${filtered.map(r => `
            <div class="card card-hover" style="padding: 1.15rem;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <div>
                  <span style="font-size: 0.75rem; font-weight: 700; color: var(--primary);">${r.reportId}</span>
                  <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 0.35rem;">(${r.reference})</span>
                  <h3 style="font-size: 1.1rem; margin-top: 0.15rem;">${Utils.escapeHtml(r.location)}</h3>
                  <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-top: 0.1rem;">${Utils.escapeHtml(r.client)}</div>
                </div>
                <div>${Utils.getStatusBadge(r.status)}</div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-muted); margin: 0.5rem 0;">
                <span>${I18n.t('reports.auditor')}: <strong>${Utils.escapeHtml(r.inspector || 'David Wilson')}</strong></span>
                <span>${I18n.t('reports.date')}: ${Utils.formatDate(r.completedDate || r.scheduledDate)}</span>
              </div>

              <div style="background: var(--bg-subtle); padding: 0.65rem 0.85rem; border-radius: var(--radius-md); margin: 0.75rem 0;">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.25rem;">
                  <span>${I18n.t('reports.auditComplianceScore')}</span>
                  <span style="color: ${r.completionRate >= 80 ? 'var(--success)' : 'var(--text-main)'};">${r.completionRate || 0}% (${r.completedItems || 0}/${r.totalItems || 0})</span>
                </div>
                <div class="progress-bar-container" style="height: 6px;">
                  <div class="progress-bar-fill ${r.completionRate >= 80 ? 'success' : (r.completionRate > 0 ? 'warning' : '')}" style="width: ${r.completionRate || 0}%;"></div>
                </div>
              </div>

              <div class="card-footer" style="padding-top: 0.75rem; margin-top: 0.75rem; gap: 0.5rem; flex-wrap: wrap;">
                <a href="#report-detail/${r.id}" class="btn btn-primary btn-sm" style="flex: 1.3;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  ${I18n.t('reports.viewReport')}
                </a>
                <button class="btn btn-secondary btn-sm print-report-btn" data-id="${r.id}" title="${I18n.t('reports.printDocument')}">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                </button>
                <button class="btn btn-secondary btn-sm download-pdf-btn" data-id="${r.id}" title="${I18n.t('reports.downloadPdf')}">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      // Desktop Table
      const desktopHtml = `
        <table class="table-desktop">
          <thead>
            <tr>
              <th>${I18n.t('reports.reportRef')}</th>
              <th>${I18n.t('reports.locationClient')}</th>
              <th>${I18n.t('reports.auditor')}</th>
              <th>${I18n.t('reports.auditDate')}</th>
              <th>${I18n.t('reports.score')}</th>
              <th>${I18n.t('reports.status')}</th>
              <th style="text-align: right;">${I18n.t('reports.actions')}</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(r => `
              <tr>
                <td>
                  <strong style="color: var(--primary); font-size: 0.875rem;">${r.reportId}</strong>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">${r.reference}</div>
                </td>
                <td>
                  <div style="font-weight: 700; color: var(--text-main);">${Utils.escapeHtml(r.location)}</div>
                  <div style="font-size: 0.8125rem; color: var(--text-muted);">${Utils.escapeHtml(r.client)}</div>
                </td>
                <td>
                  <div style="font-size: 0.875rem;">${Utils.escapeHtml(r.inspector || 'David Wilson')}</div>
                </td>
                <td>
                  <div style="font-size: 0.8125rem;">${Utils.formatDate(r.completedDate || r.scheduledDate)}</div>
                </td>
                <td>
                  <span style="font-weight: 700; color: ${r.completionRate >= 80 ? 'var(--success)' : 'var(--text-main)'}; font-size: 0.9375rem;">
                    ${r.completionRate || 0}%
                  </span>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">${r.completedItems || 0}/${r.totalItems || 0} ${I18n.t('reports.passedItems')}</div>
                </td>
                <td>${Utils.getStatusBadge(r.status)}</td>
                <td style="text-align: right;">
                  <div style="display: inline-flex; gap: 0.4rem;">
                    <a href="#report-detail/${r.id}" class="btn btn-primary btn-sm" title="${I18n.t('reports.viewReport')}">
                      ${I18n.t('reports.view')}
                    </a>
                    <button class="btn btn-secondary btn-sm print-report-btn" data-id="${r.id}" title="${I18n.t('reports.printDocument')}">
                      ${I18n.t('reports.print')}
                    </button>
                    <button class="btn btn-secondary btn-sm download-pdf-btn" data-id="${r.id}" title="${I18n.t('reports.downloadPdf')}">
                      ${I18n.t('reports.pdf')}
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      viewContainer.innerHTML = mobileHtml + desktopHtml;

      // Bind print and PDF buttons
      viewContainer.querySelectorAll('.print-report-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          window.location.hash = `#report-detail/${id}`;
          setTimeout(() => window.print(), 400);
        });
      });

      viewContainer.querySelectorAll('.download-pdf-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          PDFExport.generatePDF(id);
        });
      });
    }

    renderReportItems();

    searchInput.addEventListener('input', renderReportItems);
    sortSelect.addEventListener('change', renderReportItems);

    statusPills.forEach(pill => {
      pill.addEventListener('click', () => {
        statusPills.forEach(p => {
          p.classList.remove('active', 'btn-primary');
          p.classList.add('btn-secondary');
        });
        pill.classList.remove('btn-secondary');
        pill.classList.add('active', 'btn-primary');
        currentStatusFilter = pill.getAttribute('data-filter');
        renderReportItems();
      });
    });
  },

  /**
   * Screen 13 — Detailed Inspection Report (HIGHEST PRIORITY SCREEN)
   */
  renderDetail(container, inspectionId) {
    const insp = Storage.getInspectionById(inspectionId);
    if (!insp) {
      container.innerHTML = `<div class="card" style="padding:2rem;text-align:center;"><h3>${I18n.t('reports.reportNotFound')}</h3><a href="#reports" class="btn btn-primary" style="margin-top:1rem;">${I18n.t('reports.backToReports')}</a></div>`;
      return;
    }

    Storage.recalculateInspectionStats(insp);
    const reportId = insp.reportId || `REP-${insp.reference.replace('INS-', '')}`;
    const generatedDateStr = Utils.formatDateTime(new Date().toISOString());

    const items = insp.items || [];
    const issues = items.filter(it => it.status === 'partial' || it.status === 'not_completed');

    // Category breakdown
    const categoriesMap = {};
    items.forEach(it => {
      const catKey = it.categoryId || it.categoryName;
      if (!categoriesMap[catKey]) {
        categoriesMap[catKey] = {
          id: it.categoryId,
          name: I18n.t('categories.categoryNames.' + it.categoryId) !== `categories.categoryNames.${it.categoryId}`
            ? I18n.t('categories.categoryNames.' + it.categoryId)
            : it.categoryName,
          total: 0,
          completed: 0,
          partial: 0,
          notCompleted: 0,
          unassessed: 0,
          items: []
        };
      }
      categoriesMap[catKey].total++;
      categoriesMap[catKey].items.push(it);

      const s = (it.status || 'unassessed').toLowerCase();
      if (s === 'completed') categoriesMap[catKey].completed++;
      else if (s === 'partial') categoriesMap[catKey].partial++;
      else if (s === 'not_completed') categoriesMap[catKey].notCompleted++;
      else categoriesMap[catKey].unassessed++;
    });

    container.innerHTML = `
      <!-- Sticky Action & Report Controls Toolbar -->
      <div class="card report-controls-bar no-print" style="margin-bottom: 1.5rem; padding: 0.875rem 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <a href="#reports" class="btn btn-secondary btn-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
              <span>${I18n.t('reports.back')}</span>
            </a>
            <span style="font-weight: 700; font-size: 0.9375rem; color: var(--text-main);">
              ${I18n.t('reports.reportViewer')}: ${reportId}
            </span>
          </div>

          <!-- Document Controls -->
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <button id="toggle-all-sections-btn" class="btn btn-secondary btn-sm" title="${I18n.t('reports.collapseAll')} / ${I18n.t('reports.expandAll')}">
              <span id="expand-btn-text">${I18n.t('reports.collapseAll')}</span>
            </button>

            <!-- Filter checklist items -->
            <select id="report-item-filter" class="form-select" style="min-height: 36px; padding: 0.35rem 0.65rem; font-size: 0.8125rem; width: auto;">
              <option value="all">${I18n.t('reports.showAllTasks')}</option>
              <option value="issues_only">${I18n.t('reports.deficienciesOnly')} (${issues.length})</option>
              <option value="passed_only">${I18n.t('reports.passedOnly')} (${insp.completedItems || 0})</option>
            </select>

            <button id="print-report-action-btn" class="btn btn-secondary btn-sm" title="${I18n.t('reports.printDocument')}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              <span>${I18n.t('reports.print')}</span>
            </button>

            <button id="download-pdf-action-btn" class="btn btn-primary btn-sm" title="${I18n.t('reports.downloadPdf')}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>${I18n.t('reports.downloadPdf')}</span>
            </button>

            <button id="share-report-action-btn" class="btn btn-secondary btn-sm" title="${I18n.t('reports.share')}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              <span>${I18n.t('reports.share')}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Jump Navigation Pills -->
      <div class="report-quick-nav no-print">
        <a href="#sec-overview" class="report-quick-pill" onclick="event.preventDefault(); document.getElementById('sec-overview').scrollIntoView({behavior: 'smooth'});">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          <span>${I18n.t('reports.navOverview')}</span>
        </a>
        <a href="#sec-categories" class="report-quick-pill" onclick="event.preventDefault(); document.getElementById('sec-categories').scrollIntoView({behavior: 'smooth'});">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h7"/></svg>
          <span>${I18n.t('reports.navCategories')} (${Object.keys(categoriesMap).length})</span>
        </a>
        <a href="#sec-checklist" class="report-quick-pill active" onclick="event.preventDefault(); document.getElementById('sec-checklist').scrollIntoView({behavior: 'smooth'});">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
          <span>${I18n.t('reports.navChecklist')} (${items.length})</span>
        </a>
        <a href="#sec-issues" class="report-quick-pill" onclick="event.preventDefault(); document.getElementById('sec-issues').scrollIntoView({behavior: 'smooth'});">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>${I18n.t('reports.navDeficiencies')} (${issues.length})</span>
        </a>
        <a href="#sec-signoff" class="report-quick-pill" onclick="event.preventDefault(); document.getElementById('sec-signoff').scrollIntoView({behavior: 'smooth'});">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span>${I18n.t('reports.navSignoff')}</span>
        </a>
      </div>

      <!-- Preview Container: Realistic A4 Document Layout on Desktop -->
      <div class="report-preview-container">
        <div class="report-sheet" id="printable-report-document">
          
          <!-- ================================================================
               REPORT HEADER
               ================================================================ -->
          <div class="report-section" style="border-bottom: 2px solid var(--primary); padding-bottom: 1.5rem; margin-bottom: 1.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
              <div>
                <img src="assets/logo.svg" alt="CleanInspect" style="height: 44px; margin-bottom: 0.5rem;" />
                <h1 style="font-size: 1.6rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.02em;">
                  ${I18n.t('reports.docTitle')}
                </h1>
                <div style="font-size: 0.8125rem; color: var(--text-muted);">
                  ${I18n.t('reports.docSubtitle')}
                </div>
              </div>

              <div style="text-align: right;">
                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">${I18n.t('reports.reportRef')}</div>
                <div style="font-size: 1.25rem; font-weight: 800; color: var(--primary);">${reportId}</div>
                <div style="margin-top: 0.25rem;">${Utils.getStatusBadge(insp.status)}</div>
              </div>
            </div>

            <!-- Client & Facility Specifications Metadata Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1.25rem; padding: 1rem; background: var(--bg-subtle); border-radius: var(--radius-md); font-size: 0.8125rem;">
              <div>
                <span style="color: var(--text-muted); display: block; font-size: 0.75rem;">${I18n.t('reports.clientOrg')}</span>
                <strong style="font-size: 0.9375rem; color: var(--text-main);">${Utils.escapeHtml(insp.client)}</strong>
              </div>
              <div>
                <span style="color: var(--text-muted); display: block; font-size: 0.75rem;">${I18n.t('reports.facilityLoc')}</span>
                <strong style="color: var(--text-main);">${Utils.escapeHtml(insp.location)}</strong>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">${Utils.escapeHtml(insp.address || '')}</div>
              </div>
              <div>
                <span style="color: var(--text-muted); display: block; font-size: 0.75rem;">${I18n.t('reports.auditDateTime')}</span>
                <span style="color: var(--text-main); font-weight: 600;">${Utils.formatDateTime(insp.completedDate || insp.scheduledDate)}</span>
              </div>
              <div>
                <span style="color: var(--text-muted); display: block; font-size: 0.75rem;">${I18n.t('reports.certifiedInspector')}</span>
                <strong style="color: var(--text-main); font-size: 0.9375rem;">${Utils.escapeHtml(insp.inspector || 'David Wilson')}</strong>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">${I18n.t('reports.qaCertified')}</div>
              </div>
            </div>
          </div>

          <!-- ================================================================
               SECTION A — INSPECTION OVERVIEW
               ================================================================ -->
          <div class="report-section" id="sec-overview" style="margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1rem;">
              <h2 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
                <span style="background: var(--primary); color: #fff; width: 24px; height: 24px; border-radius: var(--radius-sm); display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem;">A</span>
                ${I18n.t('reports.secA')}
              </h2>
              <span style="font-size: 0.8125rem; color: var(--text-muted);">${I18n.t('reports.generated')}: ${generatedDateStr}</span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem; margin-bottom: 1.25rem;">
              <div style="background: #fff; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.75rem; text-align: center;">
                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">${I18n.t('reports.totalTasks')}</div>
                <div style="font-size: 1.6rem; font-weight: 800; color: var(--text-main);">${insp.totalItems}</div>
              </div>
              <div style="background: var(--success-light); border: 1px solid var(--success-border); border-radius: var(--radius-md); padding: 0.75rem; text-align: center;">
                <div style="font-size: 0.75rem; color: var(--success); font-weight: 600;">${I18n.t('reports.completedBadge')}</div>
                <div style="font-size: 1.6rem; font-weight: 800; color: var(--success);">${insp.completedItems}</div>
              </div>
              <div style="background: var(--warning-light); border: 1px solid var(--warning-border); border-radius: var(--radius-md); padding: 0.75rem; text-align: center;">
                <div style="font-size: 0.75rem; color: var(--warning); font-weight: 600;">${I18n.t('reports.partialBadge')}</div>
                <div style="font-size: 1.6rem; font-weight: 800; color: var(--warning);">${insp.partialItems}</div>
              </div>
              <div style="background: var(--danger-light); border: 1px solid var(--danger-border); border-radius: var(--radius-md); padding: 0.75rem; text-align: center;">
                <div style="font-size: 0.75rem; color: var(--danger); font-weight: 600;">${I18n.t('reports.failedBadge')}</div>
                <div style="font-size: 1.6rem; font-weight: 800; color: var(--danger);">${insp.notCompletedItems}</div>
              </div>
              <div style="background: var(--bg-subtle); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.75rem; text-align: center;">
                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">${I18n.t('reports.unassessedBadge')}</div>
                <div style="font-size: 1.6rem; font-weight: 800; color: var(--text-secondary);">${insp.unassessedItems}</div>
              </div>
              <div style="background: var(--primary-light); border: 1px solid var(--primary-border); border-radius: var(--radius-md); padding: 0.75rem; text-align: center;">
                <div style="font-size: 0.75rem; color: var(--primary); font-weight: 700;">${I18n.t('reports.overallScoreBadge')}</div>
                <div style="font-size: 1.6rem; font-weight: 900; color: var(--primary);">${insp.completionRate}%</div>
              </div>
            </div>

            <div style="background: var(--bg-subtle); border-radius: var(--radius-md); padding: 1rem; border: 1px solid var(--border-color);">
              <div style="display: flex; justify-content: space-between; font-size: 0.8125rem; font-weight: 700; margin-bottom: 0.35rem;">
                <span>${I18n.t('reports.benchmarkProgress')}</span>
                <span style="color: ${insp.completionRate >= 80 ? 'var(--success)' : 'var(--warning)'};">${insp.completionRate}% ${I18n.t('reports.compliance')}</span>
              </div>
              <div class="progress-bar-container" style="height: 10px;">
                <div class="progress-bar-fill ${insp.completionRate >= 80 ? 'success' : (insp.completionRate > 0 ? 'warning' : '')}" style="width: ${insp.completionRate}%;"></div>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-top: 0.35rem;">
                <span>${I18n.t('reports.unacceptable')}</span>
                <span>${I18n.t('reports.passThreshold')}</span>
                <span>${I18n.t('reports.impeccable')}</span>
              </div>
            </div>
          </div>

          <!-- ================================================================
               SECTION B — CATEGORY RESULTS
               ================================================================ -->
          <div class="report-section" id="sec-categories" style="margin-bottom: 2rem;">
            <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1rem;">
              <h2 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
                <span style="background: var(--primary); color: #fff; width: 24px; height: 24px; border-radius: var(--radius-sm); display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem;">B</span>
                ${I18n.t('reports.secB')}
              </h2>
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.75rem;" id="category-accordion-list">
              ${Object.keys(categoriesMap).map((catKey, cIdx) => {
                const catData = categoriesMap[catKey];
                const catRate = Utils.calcCompletionRate(catData.completed, catData.total);
                return `
                  <div class="card category-result-row" style="padding: 0.875rem 1.15rem;">
                    <div class="category-toggle-header" data-cat-idx="${cIdx}" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                      <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                          <h3 style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">${Utils.escapeHtml(catData.name)}</h3>
                          <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 500;">(${catData.total} ${I18n.t('common.items')})</span>
                        </div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.15rem;">
                          <strong style="color: var(--success);">${catData.completed}</strong> ${I18n.t('reports.passedLabel')} &bull; 
                          <strong style="color: var(--warning);">${catData.partial}</strong> ${I18n.t('reports.partialLabel')} &bull; 
                          <strong style="color: var(--danger);">${catData.notCompleted}</strong> ${I18n.t('reports.failedLabel')} &bull; 
                          <strong style="color: var(--text-muted);">${catData.unassessed}</strong> ${I18n.t('reports.unassessedLabel')}
                        </div>
                      </div>

                      <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="text-align: right; width: 90px;">
                          <div style="font-size: 0.875rem; font-weight: 800; color: ${catRate >= 80 ? 'var(--success)' : 'var(--text-main)'};">${catRate}%</div>
                          <div class="progress-bar-container" style="height: 5px; margin-top: 2px;">
                            <div class="progress-bar-fill ${catRate >= 80 ? 'success' : (catRate > 0 ? 'warning' : '')}" style="width: ${catRate}%;"></div>
                          </div>
                        </div>
                        <svg class="chevron-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transition: transform 0.2s;"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </div>

                    <!-- Expandable items list inside category -->
                    <div class="category-items-body" id="cat-body-${cIdx}" style="margin-top: 0.85rem; padding-top: 0.85rem; border-top: 1px dashed var(--border-color); display: flex; flex-direction: column; gap: 0.65rem;">
                      ${catData.items.map(it => `
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; font-size: 0.8125rem;">
                          <div style="flex: 1;">
                            <div style="font-weight: 600; color: var(--text-main);">${Utils.escapeHtml(it.task)}</div>
                            ${it.comment ? `<div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.15rem; font-style: italic;">${I18n.t('reports.inspectorObservation')}: ${Utils.escapeHtml(it.comment)}</div>` : ''}
                          </div>
                          <div>${Utils.getStatusBadge(it.status)}</div>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- ================================================================
               SECTION C — FULL CHECKLIST
               ================================================================ -->
          <div class="report-section" id="sec-checklist" style="margin-bottom: 2rem;">
            <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
              <h2 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
                <span style="background: var(--primary); color: #fff; width: 24px; height: 24px; border-radius: var(--radius-sm); display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem;">C</span>
                ${I18n.t('reports.secC')}
              </h2>
              <span style="font-size: 0.8125rem; color: var(--text-muted); font-weight: 500;">
                ${items.length} ${I18n.t('reports.evaluatedStandards')}
              </span>
            </div>

            <!-- Quick Filter Chips for Checklist Tasks -->
            <div style="display: flex; gap: 0.35rem; flex-wrap: wrap; margin-bottom: 1rem;" class="no-print">
              <button class="btn btn-sm btn-primary active task-filter-chip" data-filter="all">${I18n.t('reports.filterAll')} (${items.length})</button>
              <button class="btn btn-sm btn-secondary task-filter-chip" data-filter="issues_only">${I18n.t('reports.filterDeficiencies')} (${issues.length})</button>
              <button class="btn btn-sm btn-secondary task-filter-chip" data-filter="photos_only">${I18n.t('reports.filterWithPhotos')} (${items.filter(it => it.photos && it.photos.length > 0).length})</button>
              <button class="btn btn-sm btn-secondary task-filter-chip" data-filter="passed_only">${I18n.t('reports.filterPassed')} (${insp.completedItems || 0})</button>
            </div>

            <div id="full-checklist-report-container" style="display: flex; flex-direction: column; gap: 0.85rem;">
              ${items.map(it => {
                const s = (it.status || 'unassessed').toLowerCase();
                const photos = Array.isArray(it.photos) ? it.photos : [];
                const hasPhotos = photos.length > 0;
                const isDeficient = s === 'partial' || s === 'not_completed';
                const catDisplayName = I18n.t('categories.categoryNames.' + it.categoryId) !== `categories.categoryNames.${it.categoryId}`
                  ? I18n.t('categories.categoryNames.' + it.categoryId)
                  : it.categoryName;

                return `
                  <div class="report-task-card is-${s}" data-status="${s}" data-has-photos="${hasPhotos}">
                    <!-- Card Header Row -->
                    <div class="report-task-header">
                      <span class="report-cat-badge">
                        ${Utils.escapeHtml(catDisplayName)}
                      </span>
                      <div>${Utils.getStatusBadge(it.status)}</div>
                    </div>

                    <!-- Task Name -->
                    <div class="report-task-title">
                      ${Utils.escapeHtml(it.task)}
                    </div>

                    <!-- Inspector Observation Callout -->
                    ${it.comment ? `
                      <div class="report-observation-callout ${s === 'partial' ? 'is-warning' : (s === 'not_completed' ? 'is-danger' : '')}">
                        <div class="report-observation-label">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                          <span>${I18n.t('reports.inspectorObservation')}</span>
                        </div>
                        <p class="report-observation-text">${Utils.escapeHtml(it.comment)}</p>
                      </div>
                    ` : ''}

                    <!-- User-Friendly Photo Evidence Gallery -->
                    ${hasPhotos ? `
                      <div style="margin-top: 0.75rem;">
                        <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.35rem;">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                          <span>${I18n.t('reports.photoEvidence')} (${photos.length})</span>
                        </div>
                        <div class="report-photo-gallery">
                          ${photos.map((src, pIdx) => `
                            <div class="report-photo-card" onclick="Utils.openLightbox('${src}', '${Utils.escapeHtml(it.task)}')">
                              <div class="report-photo-media">
                                <img src="${src}" alt="Checklist Photo Evidence" loading="lazy" />
                                <div class="report-photo-overlay">
                                  <span>${I18n.t('reports.tapToEnlarge')}</span>
                                </div>
                              </div>
                              <div class="report-photo-caption">
                                <span class="report-photo-badge">${I18n.t('reports.evidenceNum')}${pIdx + 1}</span>
                                <span class="report-photo-tag">${I18n.t('reports.verifiedPhoto')}</span>
                              </div>
                            </div>
                          `).join('')}
                        </div>
                      </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- ================================================================
               SECTION D — ISSUES & FINDINGS
               ================================================================ -->
          <div class="report-section" id="sec-issues" style="margin-bottom: 2rem;">
            <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1rem;">
              <h2 style="font-size: 1.15rem; font-weight: 800; color: var(--danger); display: flex; align-items: center; gap: 0.5rem;">
                <span style="background: var(--danger); color: #fff; width: 24px; height: 24px; border-radius: var(--radius-sm); display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem;">D</span>
                ${I18n.t('reports.secD')} (${issues.length})
              </h2>
            </div>

            ${issues.length === 0 ? `
              <div class="card" style="padding: 1.5rem; text-align: center; background: var(--success-light); border-color: var(--success-border);">
                <strong style="color: var(--success);">${I18n.t('reports.zeroNonCompliances')}</strong>
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${issues.map((iss, idx) => {
                  const photos = Array.isArray(iss.photos) ? iss.photos : [];
                  const priority = iss.status === 'not_completed' ? 'High' : 'Medium';
                  const catDisplayName = I18n.t('categories.categoryNames.' + iss.categoryId) !== `categories.categoryNames.${iss.categoryId}`
                    ? I18n.t('categories.categoryNames.' + iss.categoryId)
                    : iss.categoryName;
                  return `
                    <div class="card report-issue-card" style="padding: 1.25rem; border: 1.5px solid var(--danger-border); background: #fff; border-radius: var(--radius-lg);">
                      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <div>
                          <span style="font-size: 0.75rem; font-weight: 800; color: var(--danger);">${I18n.t('reports.findingNum')}${idx + 1} &bull; ${Utils.escapeHtml(catDisplayName)}</span>
                          <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main); margin-top: 0.15rem;">
                            ${Utils.escapeHtml(iss.task)}
                          </h3>
                        </div>
                        <div style="display: flex; gap: 0.35rem; align-items: center;">
                          ${Utils.getPriorityBadge(priority)}
                          ${Utils.getStatusBadge(iss.status)}
                        </div>
                      </div>

                      <div style="background: var(--danger-light); border-left: 3.5px solid var(--danger); padding: 0.75rem 1rem; border-radius: var(--radius-sm); font-size: 0.875rem; color: #7F1D1D; margin: 0.75rem 0;">
                        <strong style="display: block; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 0.25rem;">${I18n.t('reports.deficiencyObsLabel')}</strong>
                        ${Utils.escapeHtml(iss.comment || 'Deficiency identified during inspection audit. Remediation required.')}
                      </div>

                      ${photos.length > 0 ? `
                        <div>
                          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.35rem; text-transform: uppercase;">
                            ${I18n.t('reports.attachedEvidencePhotos')} (${photos.length})
                          </div>
                          <div class="report-photo-gallery">
                            ${photos.map((src, pIdx) => `
                              <div class="report-photo-card" onclick="Utils.openLightbox('${src}', '${Utils.escapeHtml(iss.task)}')">
                                <div class="report-photo-media">
                                  <img src="${src}" alt="Issue Evidence" loading="lazy" />
                                  <div class="report-photo-overlay">
                                    <span>${I18n.t('reports.tapToEnlarge')}</span>
                                  </div>
                                </div>
                                <div class="report-photo-caption">
                                  <span class="report-photo-badge">${I18n.t('reports.evidenceNum')}${pIdx + 1}</span>
                                  <span class="report-photo-tag">${I18n.t('reports.verifiedPhoto')}</span>
                                </div>
                              </div>
                            `).join('')}
                          </div>
                        </div>
                      ` : `
                        <div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">${I18n.t('reports.noPhotosAttached')}</div>
                      `}
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>

          <!-- ================================================================
               SECTION E — GENERAL COMMENTS & RECOMMENDATIONS
               ================================================================ -->
          <div class="report-section" id="sec-comments" style="margin-bottom: 2rem;">
            <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1rem;">
              <h2 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
                <span style="background: var(--primary); color: #fff; width: 24px; height: 24px; border-radius: var(--radius-sm); display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem;">E</span>
                ${I18n.t('reports.secE')}
              </h2>
            </div>

            <div style="display: flex; flex-direction: column; gap: 1rem;">
              <div class="card" style="padding: 1rem;">
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.25rem;">
                  ${I18n.t('reports.overallObsTitle')}
                </div>
                <p style="font-size: 0.875rem; color: var(--text-main); line-height: 1.5;">
                  ${Utils.escapeHtml(insp.generalObservations || 'The facility exhibits good baseline sanitation standards with consistent trash clearance and polished floor surfaces. Janitorial logs were verified.')}
                </p>
              </div>

              <div class="card" style="padding: 1rem;">
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--warning); text-transform: uppercase; margin-bottom: 0.25rem;">
                  ${I18n.t('reports.priorityAreasTitle')}
                </div>
                <p style="font-size: 0.875rem; color: var(--text-main); line-height: 1.5;">
                  ${Utils.escapeHtml(insp.areasRequiringAttention || (issues.length > 0 ? 'Remediate identified deficiencies listed in Section D, focusing on restocking washroom consumables and deep cleaning kitchen surfaces.' : 'No major hygiene concerns identified during this inspection cycle.'))}
                </p>
              </div>

              <div class="card" style="padding: 1rem;">
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--primary); text-transform: uppercase; margin-bottom: 0.25rem;">
                  ${I18n.t('reports.remedActionsTitle')}
                </div>
                <p style="font-size: 0.875rem; color: var(--text-main); line-height: 1.5;">
                  ${Utils.escapeHtml(insp.recommendedActions || 'Schedule follow-up porter inspection within 24 hours to confirm remediation of any flagged tasks. Maintain daily sign-off logs on restroom doors.')}
                </p>
              </div>
            </div>
          </div>

          <!-- ================================================================
               SECTION F — SIGN-OFF & ATTESTATION
               ================================================================ -->
          <div class="report-section sign-off-block" style="border-top: 2px solid var(--border-color); padding-top: 1.5rem; margin-top: 2.5rem;">
            <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1rem;">
              <h2 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
                <span style="background: var(--primary); color: #fff; width: 24px; height: 24px; border-radius: var(--radius-sm); display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem;">F</span>
                ${I18n.t('reports.secF')}
              </h2>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; margin-top: 1rem;">
              <!-- Inspector Attestation -->
              <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; background: var(--bg-subtle);">
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">
                  ${I18n.t('reports.certifiedAttestation')}
                </div>
                <div style="font-size: 1.1rem; font-weight: 800; color: var(--text-main);">
                  ${Utils.escapeHtml(insp.inspector || 'David Wilson')}
                </div>
                <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 1rem;">
                  ${I18n.t('reports.leadInspector')}
                </div>

                <!-- Signature Simulation (Authentic handwriting style SVG) -->
                <div style="height: 48px; border-bottom: 1px dashed var(--text-muted); display: flex; align-items: center; padding-left: 0.5rem; margin-bottom: 0.5rem;">
                  <svg width="180" height="40" viewBox="0 0 180 40">
                    <path d="M10,25 C30,10 40,35 60,18 C75,5 85,32 110,20 C125,12 140,28 165,15" fill="none" stroke="#1D4ED8" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; justify-content: space-between;">
                  <span>${I18n.t('reports.verifiedSignature')}</span>
                  <span>${Utils.formatDate(insp.completedDate || insp.scheduledDate)}</span>
                </div>
              </div>

              <!-- Supervisor Review -->
              <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; background: var(--bg-subtle);">
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">
                  ${I18n.t('reports.supervisorStatus')}
                </div>
                ${insp.signOff && insp.signOff.supervisorReviewed ? `
                  <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <span class="badge badge-completed"><span class="badge-dot"></span>${I18n.t('reports.supervisorApproved')}</span>
                  </div>
                  <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">
                    ${Utils.escapeHtml(insp.signOff.supervisorName || 'Sarah Jenkins (Operations Director)')}
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">
                    ${I18n.t('reports.reviewedOn')} ${Utils.formatDate(insp.signOff.reviewDate || insp.completedDate)}
                  </div>
                ` : `
                  <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <span class="badge badge-unassessed"><span class="badge-dot"></span>${I18n.t('reports.pendingSupervisor')}</span>
                  </div>
                  <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-top: 0.25rem;">
                    ${I18n.t('reports.pendingSupervisorDesc')}
                  </p>
                `}
              </div>
            </div>

            <!-- Audit Trail Footer -->
            <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--border-color); text-align: center; font-size: 0.72rem; color: var(--text-light);">
              ${I18n.t('reports.footerAuditTrail', { reportId, ref: insp.reference })}
            </div>

          </div>

        </div>
      </div>
    `;

    // Interactive Category Accordions
    container.querySelectorAll('.category-toggle-header').forEach(header => {
      header.addEventListener('click', () => {
        const idx = header.getAttribute('data-cat-idx');
        const body = document.getElementById(`cat-body-${idx}`);
        const chevron = header.querySelector('.chevron-icon');
        if (body) {
          const isHidden = body.classList.toggle('hidden');
          if (chevron) {
            chevron.style.transform = isHidden ? 'rotate(-90deg)' : 'rotate(0deg)';
          }
        }
      });
    });

    // Expand / Collapse All
    let allExpanded = true;
    const toggleAllBtn = document.getElementById('toggle-all-sections-btn');
    const expandBtnText = document.getElementById('expand-btn-text');
    if (toggleAllBtn) {
      toggleAllBtn.addEventListener('click', () => {
        allExpanded = !allExpanded;
        container.querySelectorAll('.category-items-body').forEach(b => {
          if (allExpanded) {
            b.classList.remove('hidden');
          } else {
            b.classList.add('hidden');
          }
        });
        container.querySelectorAll('.chevron-icon').forEach(ch => {
          ch.style.transform = allExpanded ? 'rotate(0deg)' : 'rotate(-90deg)';
        });
        expandBtnText.textContent = allExpanded ? I18n.t('reports.collapseAll') : I18n.t('reports.expandAll');
      });
    }

    // Helper to filter tasks in Section C
    function applyTaskFilter(filterVal) {
      container.querySelectorAll('.report-task-card').forEach(card => {
        const s = card.getAttribute('data-status');
        const hasPhotos = card.getAttribute('data-has-photos') === 'true';
        if (filterVal === 'all') {
          card.style.display = '';
        } else if (filterVal === 'issues_only') {
          card.style.display = (s === 'partial' || s === 'not_completed') ? '' : 'none';
        } else if (filterVal === 'photos_only') {
          card.style.display = hasPhotos ? '' : 'none';
        } else if (filterVal === 'passed_only') {
          card.style.display = (s === 'completed') ? '' : 'none';
        }
      });
    }

    // Quick Filter Chips in Section C
    const chips = container.querySelectorAll('.task-filter-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => {
          c.classList.remove('active', 'btn-primary');
          c.classList.add('btn-secondary');
        });
        chip.classList.remove('btn-secondary');
        chip.classList.add('active', 'btn-primary');
        const f = chip.getAttribute('data-filter');
        applyTaskFilter(f);
        const filterSelect = document.getElementById('report-item-filter');
        if (filterSelect) filterSelect.value = f;
      });
    });

    // Filter checklist items dropdown
    const filterSelect = document.getElementById('report-item-filter');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        applyTaskFilter(val);
        chips.forEach(c => {
          if (c.getAttribute('data-filter') === val) {
            c.classList.remove('btn-secondary');
            c.classList.add('active', 'btn-primary');
          } else {
            c.classList.remove('active', 'btn-primary');
            c.classList.add('btn-secondary');
          }
        });
      });
    }

    // Print Action
    const printBtn = document.getElementById('print-report-action-btn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        // Expand all before printing
        container.querySelectorAll('.category-items-body').forEach(b => b.classList.remove('hidden'));
        window.print();
      });
    }

    // PDF Download
    const downloadPdfBtn = document.getElementById('download-pdf-action-btn');
    if (downloadPdfBtn) {
      downloadPdfBtn.addEventListener('click', () => {
        PDFExport.generatePDF(insp.id);
      });
    }

    // Share Action
    const shareBtn = document.getElementById('share-report-action-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        Utils.shareReport(
          `CleanInspect Report - ${insp.location}`,
          `Inspection Report for ${insp.location} (${reportId}). Final Score: ${insp.completionRate}%.`,
          window.location.href
        );
      });
    }
  }
};
