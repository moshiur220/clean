/**
 * CleanInspect - Inspections List (Screen 4) & Inspection Details (Screen 5)
 * js/inspections.js
 */

const Inspections = {
  /**
   * Screen 4 — Inspection List
   */
  renderList(container) {
    const allInspections = Storage.getInspections();

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-row">
          <div class="view-title-group">
            <h1>Inspections</h1>
            <div class="view-subtitle">Quality control assessments across commercial facilities</div>
          </div>
          <button id="create-inspection-btn" class="btn btn-primary btn-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Schedule New Inspection
          </button>
        </div>
      </div>

      <!-- Search & Filters Toolbar -->
      <div class="card" style="margin-bottom: 1.5rem; padding: 1rem 1.25rem;">
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <div class="input-wrapper">
            <span class="input-icon-left">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </span>
            <input 
              type="text" 
              id="inspection-search" 
              class="form-input has-icon-left" 
              placeholder="Search by client, location, or reference (e.g. Westfield, Sunrise, INS-2026)..." 
            />
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; justify-content: space-between;">
            <!-- Status Tabs / Buttons -->
            <div style="display: flex; flex-wrap: wrap; gap: 0.35rem;" id="status-filter-pills">
              <button class="btn btn-sm btn-primary active" data-status="all">All (${allInspections.length})</button>
              <button class="btn btn-sm btn-secondary" data-status="pending">Pending</button>
              <button class="btn btn-sm btn-secondary" data-status="in_progress">In Progress</button>
              <button class="btn btn-sm btn-secondary" data-status="completed">Completed</button>
            </div>

            <!-- Date Sorter / Filter -->
            <div style="display: flex; align-items: center; gap: 0.5rem; min-width: 160px;">
              <select id="inspection-sort" class="form-select" style="min-height: 36px; padding: 0.35rem 0.75rem; font-size: 0.8125rem;">
                <option value="newest">Scheduled: Newest First</option>
                <option value="oldest">Scheduled: Oldest First</option>
                <option value="score_desc">Completion Score: High to Low</option>
                <option value="score_asc">Completion Score: Low to High</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Container for Mobile Cards & Desktop Table -->
      <div id="inspections-view-container">
        <!-- Injected dynamically -->
      </div>
    `;

    const searchInput = document.getElementById('inspection-search');
    const sortSelect = document.getElementById('inspection-sort');
    const statusPills = document.querySelectorAll('#status-filter-pills button');
    const viewContainer = document.getElementById('inspections-view-container');
    const createBtn = document.getElementById('create-inspection-btn');

    let currentFilter = 'all';

    function renderListItems() {
      const q = searchInput.value.trim().toLowerCase();
      let filtered = allInspections.filter(i => {
        const matchesQuery = 
          i.location.toLowerCase().includes(q) ||
          i.client.toLowerCase().includes(q) ||
          i.reference.toLowerCase().includes(q) ||
          (i.inspector && i.inspector.toLowerCase().includes(q));

        let matchesStatus = true;
        if (currentFilter === 'pending') {
          matchesStatus = i.status === 'pending' || i.status === 'scheduled';
        } else if (currentFilter === 'in_progress') {
          matchesStatus = i.status === 'in_progress';
        } else if (currentFilter === 'completed') {
          matchesStatus = i.status === 'completed';
        }

        return matchesQuery && matchesStatus;
      });

      // Sort
      const sortVal = sortSelect.value;
      filtered.sort((a, b) => {
        if (sortVal === 'newest') return new Date(b.scheduledDate) - new Date(a.scheduledDate);
        if (sortVal === 'oldest') return new Date(a.scheduledDate) - new Date(b.scheduledDate);
        if (sortVal === 'score_desc') return (b.completionRate || 0) - (a.completionRate || 0);
        if (sortVal === 'score_asc') return (a.completionRate || 0) - (b.completionRate || 0);
        return 0;
      });

      if (filtered.length === 0) {
        viewContainer.innerHTML = `
          <div class="card" style="text-align: center; padding: 3rem 1.5rem;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--text-muted); margin: 0 auto 0.75rem;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <h3 style="font-size: 1.15rem; color: var(--text-main); margin-bottom: 0.25rem;">No inspections found</h3>
            <p style="font-size: 0.875rem; color: var(--text-muted);">Try adjusting your search query or status filter.</p>
          </div>
        `;
        return;
      }

      // Render Mobile Cards View
      const mobileCardsHtml = `
        <div class="cards-mobile">
          ${filtered.map(insp => `
            <div class="card card-hover" style="padding: 1.15rem;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <div>
                  <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted);">${insp.reference}</span>
                  <h3 style="font-size: 1.1rem; margin-top: 0.15rem;">${Utils.escapeHtml(insp.location)}</h3>
                  <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-top: 0.1rem;">${Utils.escapeHtml(insp.client)}</div>
                </div>
                <div>${Utils.getStatusBadge(insp.status)}</div>
              </div>

              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; font-size: 0.75rem; color: var(--text-muted); margin: 0.5rem 0;">
                <div style="display: flex; align-items: center; gap: 0.35rem;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span>${Utils.escapeHtml(insp.inspector || 'David Wilson')}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.35rem;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span>${Utils.formatDate(insp.scheduledDate)}</span>
                </div>
              </div>

              <div style="margin: 0.75rem 0;">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.35rem;">
                  <span>Audit Completion</span>
                  <span><strong>${insp.completionRate || 0}%</strong> (${insp.completedItems || 0}/${insp.totalItems || 0})</span>
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar-fill ${insp.completionRate >= 80 ? 'success' : (insp.completionRate > 0 ? 'warning' : '')}" style="width: ${insp.completionRate || 0}%;"></div>
                </div>
              </div>

              <div class="card-footer" style="padding-top: 0.75rem; margin-top: 0.75rem; gap: 0.5rem;">
                <a href="#inspection-detail/${insp.id}" class="btn btn-secondary btn-sm" style="flex: 1;">Details</a>
                ${insp.status === 'completed'
                  ? `<a href="#report-detail/${insp.id}" class="btn btn-primary btn-sm" style="flex: 1.2;">View Report</a>`
                  : `<a href="#checklist/${insp.id}" class="btn btn-success btn-sm" style="flex: 1.2;">${insp.status === 'in_progress' ? 'Continue' : 'Start'}</a>`
                }
              </div>
            </div>
          `).join('')}
        </div>
      `;

      // Render Desktop Table View
      const desktopTableHtml = `
        <table class="table-desktop">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Location & Client</th>
              <th>Inspector</th>
              <th>Scheduled</th>
              <th>Progress</th>
              <th>Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(insp => `
              <tr>
                <td>
                  <strong style="font-size: 0.875rem; color: var(--primary);">${insp.reference}</strong>
                </td>
                <td>
                  <div style="font-weight: 700; color: var(--text-main);">${Utils.escapeHtml(insp.location)}</div>
                  <div style="font-size: 0.8125rem; color: var(--text-muted);">${Utils.escapeHtml(insp.client)}</div>
                </td>
                <td>
                  <div style="font-size: 0.875rem;">${Utils.escapeHtml(insp.inspector || 'David Wilson')}</div>
                </td>
                <td>
                  <div style="font-size: 0.8125rem; color: var(--text-main);">${Utils.formatDate(insp.scheduledDate)}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">${Utils.formatTime(insp.scheduledDate)}</div>
                </td>
                <td style="min-width: 140px;">
                  <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.25rem;">
                    <span>${insp.completionRate || 0}%</span>
                    <span style="color: var(--text-muted);">${insp.completedItems || 0}/${insp.totalItems || 0}</span>
                  </div>
                  <div class="progress-bar-container">
                    <div class="progress-bar-fill ${insp.completionRate >= 80 ? 'success' : (insp.completionRate > 0 ? 'warning' : '')}" style="width: ${insp.completionRate || 0}%;"></div>
                  </div>
                </td>
                <td>
                  ${Utils.getStatusBadge(insp.status)}
                </td>
                <td style="text-align: right;">
                  <div style="display: inline-flex; gap: 0.5rem;">
                    <a href="#inspection-detail/${insp.id}" class="btn btn-secondary btn-sm" title="View Inspection Details">
                      Details
                    </a>
                    ${insp.status === 'completed'
                      ? `<a href="#report-detail/${insp.id}" class="btn btn-primary btn-sm" title="View Full Inspection Report">Report</a>`
                      : `<a href="#checklist/${insp.id}" class="btn btn-success btn-sm" title="Open Inspection Checklist">${insp.status === 'in_progress' ? 'Continue' : 'Start'}</a>`
                    }
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      viewContainer.innerHTML = mobileCardsHtml + desktopTableHtml;
    }

    renderListItems();

    // Event listeners
    searchInput.addEventListener('input', renderListItems);
    sortSelect.addEventListener('change', renderListItems);

    statusPills.forEach(pill => {
      pill.addEventListener('click', () => {
        statusPills.forEach(p => {
          p.classList.remove('active', 'btn-primary');
          p.classList.add('btn-secondary');
        });
        pill.classList.remove('btn-secondary');
        pill.classList.add('active', 'btn-primary');
        currentFilter = pill.getAttribute('data-status');
        renderListItems();
      });
    });

    // Create New Inspection Modal Trigger
    createBtn.addEventListener('click', () => {
      Inspections.showCreateModal(() => {
        renderListItems();
      });
    });
  },

  /**
   * Modal to schedule a new inspection
   */
  showCreateModal(onCreated) {
    let modal = document.getElementById('new-inspection-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'new-inspection-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    const nextId = `INS-2026-${String(Storage.getInspections().length + 1).padStart(3, '0')}`;

    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Schedule New Inspection</h3>
          <button class="btn btn-icon btn-ghost" onclick="document.getElementById('new-inspection-modal').classList.remove('active')">&times;</button>
        </div>
        <form id="new-inspection-form">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Reference ID</label>
              <input type="text" class="form-input" id="new-insp-ref" value="${nextId}" readonly style="background: var(--bg-subtle);" />
            </div>

            <div class="form-group">
              <label class="form-label" for="new-insp-location">Location / Facility Name <span class="required">*</span></label>
              <input type="text" class="form-input" id="new-insp-location" placeholder="e.g. Metro Tech Plaza" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="new-insp-client">Client Organization <span class="required">*</span></label>
              <input type="text" class="form-input" id="new-insp-client" placeholder="e.g. Apex Property Holdings" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="new-insp-address">Physical Address</label>
              <input type="text" class="form-input" id="new-insp-address" placeholder="e.g. 500 Enterprise Way, Suite 200" />
            </div>

            <div class="form-group">
              <label class="form-label" for="new-insp-date">Scheduled Date &amp; Time <span class="required">*</span></label>
              <input type="datetime-local" class="form-input" id="new-insp-date" value="${new Date().toISOString().slice(0, 16)}" required />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('new-inspection-modal').classList.remove('active')">Cancel</button>
            <button type="submit" class="btn btn-primary">Schedule Inspection</button>
          </div>
        </form>
      </div>
    `;

    modal.classList.add('active');

    const form = document.getElementById('new-inspection-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const location = document.getElementById('new-insp-location').value.trim();
      const client = document.getElementById('new-insp-client').value.trim();
      const address = document.getElementById('new-insp-address').value.trim() || 'Commercial Building';
      const scheduledDate = document.getElementById('new-insp-date').value || new Date().toISOString();

      if (!location || !client) {
        Utils.showToast('Please fill in required fields.', 'warning');
        return;
      }

      // Generate standard items for this new inspection
      const templateItems = SeedData.generateChecklistItems().map(item => ({
        ...item,
        status: 'unassessed',
        comment: '',
        photos: []
      }));

      const newInsp = {
        id: nextId,
        reference: nextId,
        reportId: `REP-${nextId.replace('INS-', '')}`,
        location,
        client,
        address,
        scheduledDate: new Date(scheduledDate).toISOString(),
        inspector: Auth.getUser().name || 'David Wilson',
        status: 'pending',
        categoriesIncluded: ['Entrance & Reception', 'Office Rooms', 'Conference Room', 'Kitchen & Pantry', 'Toilets & Bathrooms', 'Corridors & Staircases', 'Storage Room', 'Common Areas'],
        items: templateItems,
        generalObservations: '',
        areasRequiringAttention: '',
        recommendedActions: '',
        signOff: {
          inspectorName: Auth.getUser().name || 'David Wilson',
          supervisorReviewed: false
        }
      };

      Storage.recalculateInspectionStats(newInsp);
      Storage.saveInspection(newInsp);

      modal.classList.remove('active');
      Utils.showToast(`Inspection ${nextId} created successfully!`, 'success');
      if (onCreated) onCreated();
      window.location.hash = `#inspection-detail/${newInsp.id}`;
    });
  },

  /**
   * Screen 5 — Inspection Details
   */
  renderDetails(container, inspectionId) {
    const insp = Storage.getInspectionById(inspectionId);
    if (!insp) {
      container.innerHTML = `
        <div class="card" style="text-align: center; padding: 3rem 1rem;">
          <h2>Inspection Not Found</h2>
          <p style="margin: 0.5rem 0 1.5rem;">The inspection reference "${inspectionId}" could not be located.</p>
          <a href="#inspections" class="btn btn-primary">Return to Inspections List</a>
        </div>
      `;
      return;
    }

    // Refresh stats
    Storage.recalculateInspectionStats(insp);

    // Group items by category for detailed breakdown preview
    const categoriesMap = {};
    if (Array.isArray(insp.items)) {
      insp.items.forEach(it => {
        if (!categoriesMap[it.categoryName]) {
          categoriesMap[it.categoryName] = { total: 0, completed: 0, partial: 0, notCompleted: 0, unassessed: 0 };
        }
        categoriesMap[it.categoryName].total++;
        const s = (it.status || 'unassessed').toLowerCase();
        if (s === 'completed') categoriesMap[it.categoryName].completed++;
        else if (s === 'partial') categoriesMap[it.categoryName].partial++;
        else if (s === 'not_completed') categoriesMap[it.categoryName].notCompleted++;
        else categoriesMap[it.categoryName].unassessed++;
      });
    }

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-row">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <a href="#inspections" class="btn btn-icon btn-secondary" title="Back to Inspections">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
            </a>
            <div class="view-title-group">
              <h1>${Utils.escapeHtml(insp.location)}</h1>
              <div class="view-subtitle">Inspection Ref: <strong>${insp.reference}</strong> &bull; Client: ${Utils.escapeHtml(insp.client)}</div>
            </div>
          </div>
          <div>${Utils.getStatusBadge(insp.status)}</div>
        </div>
      </div>

      <!-- Action Banner -->
      <div class="card" style="margin-bottom: 1.5rem; background: var(--bg-card); border-left: 4px solid var(--primary);">
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem;">
          <div>
            <div style="font-size: 0.8125rem; color: var(--text-muted);">Current Inspection Status</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin-top: 0.2rem;">
              ${insp.status === 'completed' ? 'Inspection Completed & Verified' : (insp.status === 'in_progress' ? 'Checklist in Progress' : 'Ready to Start Audit')}
            </div>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            ${insp.status === 'completed' ? `
              <a href="#report-detail/${insp.id}" class="btn btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                View Report
              </a>
              <a href="#checklist/${insp.id}" class="btn btn-secondary">
                Review Checklist
              </a>
            ` : `
              <a href="#checklist/${insp.id}" class="btn btn-success">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                ${insp.status === 'in_progress' ? 'Continue Inspection' : 'Start Inspection'}
              </a>
              <a href="#summary/${insp.id}" class="btn btn-secondary">
                View Summary
              </a>
            `}
          </div>
        </div>
      </div>

      <!-- Facility & Inspection Details Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
        
        <!-- Metadata Info -->
        <div class="card">
          <h2 style="font-size: 1.1rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
            Audit Specifications
          </h2>
          <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.875rem;">
            <div>
              <span style="color: var(--text-muted); font-size: 0.8125rem; display: block;">Client Organization</span>
              <strong style="color: var(--text-main); font-size: 0.95rem;">${Utils.escapeHtml(insp.client)}</strong>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 0.8125rem; display: block;">Facility Address</span>
              <span style="color: var(--text-main);">${Utils.escapeHtml(insp.address || 'Commercial Facility')}</span>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 0.8125rem; display: block;">Assigned Inspector</span>
              <span style="color: var(--text-main); font-weight: 600;">${Utils.escapeHtml(insp.inspector || 'David Wilson')}</span>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 0.8125rem; display: block;">Scheduled Date & Time</span>
              <span style="color: var(--text-main);">${Utils.formatDateTime(insp.scheduledDate)}</span>
            </div>
            ${insp.completedDate ? `
              <div>
                <span style="color: var(--text-muted); font-size: 0.8125rem; display: block;">Submission Timestamp</span>
                <span style="color: var(--success); font-weight: 600;">${Utils.formatDateTime(insp.completedDate)}</span>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Progress Metrics -->
        <div class="card">
          <h2 style="font-size: 1.1rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
            Checklist Scorecard
          </h2>
          
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
            <div>
              <div style="font-size: 2.25rem; font-weight: 800; color: var(--text-main);">${insp.completionRate || 0}%</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Cleanliness Compliance Rate</div>
            </div>
            <div style="text-align: right; font-size: 0.8125rem; color: var(--text-secondary);">
              <div>Total items: <strong>${insp.totalItems || 0}</strong></div>
              <div>Reported issues: <strong style="color: var(--danger);">${insp.issuesCount || 0}</strong></div>
            </div>
          </div>

          <div class="progress-bar-container" style="height: 10px; margin-bottom: 1.25rem;">
            <div class="progress-bar-fill ${insp.completionRate >= 80 ? 'success' : (insp.completionRate > 0 ? 'warning' : '')}" style="width: ${insp.completionRate || 0}%;"></div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; text-align: center; font-size: 0.75rem;">
            <div style="background: var(--success-light); padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--success-border);">
              <div style="font-weight: 800; font-size: 1.1rem; color: var(--success);">${insp.completedItems || 0}</div>
              <div style="color: var(--success);">Passed</div>
            </div>
            <div style="background: var(--warning-light); padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--warning-border);">
              <div style="font-weight: 800; font-size: 1.1rem; color: var(--warning);">${insp.partialItems || 0}</div>
              <div style="color: var(--warning);">Partial</div>
            </div>
            <div style="background: var(--danger-light); padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--danger-border);">
              <div style="font-weight: 800; font-size: 1.1rem; color: var(--danger);">${insp.notCompletedItems || 0}</div>
              <div style="color: var(--danger);">Failed</div>
            </div>
            <div style="background: var(--bg-subtle); padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
              <div style="font-weight: 800; font-size: 1.1rem; color: var(--text-secondary);">${insp.unassessedItems || 0}</div>
              <div style="color: var(--text-secondary);">Pending</div>
            </div>
          </div>
        </div>

      </div>

      <!-- Categories Scope Overview -->
      <div class="card" style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.1rem; margin-bottom: 1rem;">Included Categories &amp; Progress</h2>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${Object.keys(categoriesMap).map(catName => {
            const data = categoriesMap[catName];
            const rate = Utils.calcCompletionRate(data.completed, data.total);
            return `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: var(--bg-subtle); border-radius: var(--radius-md);">
                <div style="flex: 1; min-width: 0;">
                  <div style="font-weight: 600; font-size: 0.9375rem; color: var(--text-main);">${Utils.escapeHtml(catName)}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">
                    ${data.completed}/${data.total} passed &bull; ${data.partial} partial &bull; ${data.notCompleted} failed &bull; ${data.unassessed} unassessed
                  </div>
                </div>
                <div style="text-align: right; width: 120px;">
                  <div style="font-size: 0.8125rem; font-weight: 700; margin-bottom: 0.25rem;">${rate}%</div>
                  <div class="progress-bar-container" style="height: 6px;">
                    <div class="progress-bar-fill ${rate >= 80 ? 'success' : (rate > 0 ? 'warning' : '')}" style="width: ${rate}%;"></div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }
};
