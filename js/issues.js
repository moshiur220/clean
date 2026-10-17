/**
 * CleanInspect - Issues List (Screen 15) & Issue Details (Screen 16)
 * js/issues.js
 */

const Issues = {
  LIFECYCLE_STEPS: [
    { key: 'reported', label: 'Reported' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'resolved', label: 'Resolved' },
    { key: 'verified', label: 'Verified / Closed' }
  ],

  /**
   * Screen 15 — Issues List
   */
  renderList(container) {
    const allIssues = Storage.getIssues();

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-row">
          <div class="view-title-group">
            <h1>Quality Deficiencies &amp; Issues</h1>
            <div class="view-subtitle">Cross-facility issue tracking, priority triage, and resolution lifecycle</div>
          </div>
          <div style="font-size: 0.8125rem; color: var(--danger); background: var(--danger-light); padding: 0.35rem 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--danger-border); font-weight: 700;">
            ${allIssues.filter(i => i.status !== 'resolved' && i.status !== 'verified').length} Active Issues
          </div>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="card" style="margin-bottom: 1.5rem; padding: 1rem 1.25rem;">
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <div class="input-wrapper">
            <span class="input-icon-left">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </span>
            <input 
              type="text" 
              id="issues-search" 
              class="form-input has-icon-left" 
              placeholder="Search issues by title, location, category, or reference..." 
            />
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; justify-content: space-between;">
            <!-- Priority Filter -->
            <div style="display: flex; align-items: center; gap: 0.35rem;" id="issue-priority-pills">
              <button class="btn btn-sm btn-primary active" data-priority="all">All Priorities</button>
              <button class="btn btn-sm btn-secondary" data-priority="high">High</button>
              <button class="btn btn-sm btn-secondary" data-priority="medium">Medium</button>
              <button class="btn btn-sm btn-secondary" data-priority="low">Low</button>
            </div>

            <!-- Status Filter -->
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <select id="issue-status-filter" class="form-select" style="min-height: 36px; padding: 0.35rem 0.65rem; font-size: 0.8125rem;">
                <option value="all">All Statuses</option>
                <option value="reported">Reported</option>
                <option value="under_review">Under Review</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="verified">Verified / Closed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Issues Container -->
      <div id="issues-list-container">
        <!-- Dynamically rendered -->
      </div>
    `;

    const searchInput = document.getElementById('issues-search');
    const priorityPills = document.querySelectorAll('#issue-priority-pills button');
    const statusSelect = document.getElementById('issue-status-filter');
    const listContainer = document.getElementById('issues-list-container');

    let currentPriority = 'all';

    function renderIssues() {
      const q = searchInput.value.trim().toLowerCase();
      const statusVal = statusSelect.value;

      const filtered = allIssues.filter(iss => {
        const matchesQuery = 
          iss.title.toLowerCase().includes(q) ||
          iss.location.toLowerCase().includes(q) ||
          iss.category.toLowerCase().includes(q) ||
          iss.checklistItem.toLowerCase().includes(q) ||
          (iss.inspectionRef && iss.inspectionRef.toLowerCase().includes(q));

        let matchesPriority = true;
        if (currentPriority !== 'all') {
          matchesPriority = (iss.priority || 'medium').toLowerCase() === currentPriority;
        }

        let matchesStatus = true;
        if (statusVal !== 'all') {
          matchesStatus = (iss.status || '').toLowerCase() === statusVal;
        }

        return matchesQuery && matchesPriority && matchesStatus;
      });

      if (filtered.length === 0) {
        listContainer.innerHTML = `
          <div class="card" style="text-align: center; padding: 3rem 1rem;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--text-muted); margin: 0 auto 0.75rem;"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
            <h3 style="font-size: 1.15rem; color: var(--text-main); margin-bottom: 0.25rem;">No quality issues found</h3>
            <p style="font-size: 0.875rem; color: var(--text-muted);">All parameters comply with current filter criteria.</p>
          </div>
        `;
        return;
      }

      listContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${filtered.map(iss => {
            const photos = Array.isArray(iss.photos) ? iss.photos : [];
            return `
              <div class="card card-hover" style="padding: 1.15rem; border-left: 4px solid ${(iss.priority === 'high' ? 'var(--danger)' : (iss.priority === 'low' ? 'var(--text-light)' : 'var(--warning)'))};">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;">
                  <div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">
                      <span>${iss.id}</span>
                      <span>&bull;</span>
                      <span style="color: var(--primary);">${Utils.escapeHtml(iss.location)}</span>
                      <span>&bull;</span>
                      <span>Ref: ${iss.inspectionRef}</span>
                    </div>
                    <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main); margin-top: 0.2rem;">
                      <a href="#issue-detail/${iss.id}" style="color: inherit;">${Utils.escapeHtml(iss.title)}</a>
                    </h3>
                  </div>

                  <div style="display: flex; align-items: center; gap: 0.35rem;">
                    ${Utils.getPriorityBadge(iss.priority)}
                    ${Utils.getStatusBadge(iss.status)}
                  </div>
                </div>

                <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                  <strong>Standard:</strong> ${Utils.escapeHtml(iss.category)} &bull; ${Utils.escapeHtml(iss.checklistItem)}
                </div>

                ${iss.comment ? `
                  <div style="font-size: 0.8125rem; color: var(--text-main); background: var(--bg-subtle); padding: 0.6rem 0.85rem; border-radius: var(--radius-md); margin-bottom: 0.75rem;">
                    <strong>Observation:</strong> ${Utils.escapeHtml(iss.comment)}
                  </div>
                ` : ''}

                <!-- Photo thumbnails -->
                ${photos.length > 0 ? `
                  <div class="photo-thumbnails-grid" style="margin-bottom: 0.75rem;">
                    ${photos.map(src => `
                      <div class="photo-thumb-wrap" onclick="Utils.openLightbox('${src}', '${Utils.escapeHtml(iss.title)}')">
                        <img src="${src}" alt="Issue Evidence" />
                      </div>
                    `).join('')}
                  </div>
                ` : ''}

                <div class="card-footer" style="padding-top: 0.75rem; margin-top: 0.75rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                  <span style="font-size: 0.75rem; color: var(--text-muted);">
                    Reported: ${Utils.formatDate(iss.reportedDate)}
                  </span>
                  <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <a href="#inspection-detail/${iss.inspectionId}" class="btn btn-ghost btn-sm" style="font-size: 0.75rem;">
                      Audit Log
                    </a>
                    <a href="#issue-detail/${iss.id}" class="btn btn-outline-primary btn-sm">
                      Manage &amp; Resolve &rarr;
                    </a>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    renderIssues();

    searchInput.addEventListener('input', renderIssues);
    statusSelect.addEventListener('change', renderIssues);

    priorityPills.forEach(pill => {
      pill.addEventListener('click', () => {
        priorityPills.forEach(p => {
          p.classList.remove('active', 'btn-primary');
          p.classList.add('btn-secondary');
        });
        pill.classList.remove('btn-secondary');
        pill.classList.add('active', 'btn-primary');
        currentPriority = pill.getAttribute('data-priority');
        renderIssues();
      });
    });
  },

  /**
   * Screen 16 — Issue Details
   */
  renderDetail(container, issueId) {
    const issue = Storage.getIssueById(issueId);
    if (!issue) {
      container.innerHTML = `
        <div class="card" style="text-align: center; padding: 3rem 1rem;">
          <h2>Issue Not Found</h2>
          <p style="margin: 0.5rem 0 1.5rem;">Issue reference "${issueId}" could not be located.</p>
          <a href="#issues" class="btn btn-primary">Return to Issues</a>
        </div>
      `;
      return;
    }

    const currentStatus = (issue.status || 'reported').toLowerCase().replace(/[\s-]/g, '_');
    const currentStepIndex = this.LIFECYCLE_STEPS.findIndex(s => s.key === currentStatus);
    const photos = Array.isArray(issue.photos) ? issue.photos : [];

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-row">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <a href="#issues" class="btn btn-icon btn-secondary" title="Back to Issues">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
            </a>
            <div class="view-title-group">
              <h1>${Utils.escapeHtml(issue.title)}</h1>
              <div class="view-subtitle">Issue ID: <strong>${issue.id}</strong> &bull; ${Utils.escapeHtml(issue.location)}</div>
            </div>
          </div>
          <div style="display: flex; gap: 0.35rem; align-items: center;">
            ${Utils.getPriorityBadge(issue.priority)}
            ${Utils.getStatusBadge(issue.status)}
          </div>
        </div>
      </div>

      <!-- Lifecycle Progress Stepper -->
      <div class="card" style="margin-bottom: 1.5rem; padding: 1.25rem;">
        <h3 style="font-size: 0.875rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 1rem;">
          Resolution Lifecycle Tracking
        </h3>
        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.35rem; text-align: center;">
          ${this.LIFECYCLE_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            let stepBg = 'var(--bg-muted)';
            let textColor = 'var(--text-muted)';
            let circleText = idx + 1;

            if (isCompleted) {
              stepBg = 'var(--success)';
              textColor = 'var(--success)';
              circleText = '&#10003;';
            } else if (isCurrent) {
              stepBg = 'var(--primary)';
              textColor = 'var(--primary)';
            }

            return `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 0.25rem;">
                <div style="width: 28px; height: 28px; border-radius: var(--radius-full); background: ${stepBg}; color: #fff; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; justify-content: center;">
                  ${circleText}
                </div>
                <span style="font-size: 0.6875rem; font-weight: 600; color: ${textColor}; line-height: 1.2;">
                  ${step.label}
                </span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Information & Evidence Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
        
        <!-- Metadata -->
        <div class="card">
          <h2 style="font-size: 1.1rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
            Issue Specifications
          </h2>
          <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.875rem;">
            <div>
              <span style="color: var(--text-muted); font-size: 0.8125rem; display: block;">Facility Location</span>
              <strong style="color: var(--text-main);">${Utils.escapeHtml(issue.location)}</strong>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 0.8125rem; display: block;">Audit Reference</span>
              <a href="#inspection-detail/${issue.inspectionId}" style="font-weight: 600;">
                ${issue.inspectionRef} (View Audit) &rarr;
              </a>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 0.8125rem; display: block;">Cleaning Category &amp; Task</span>
              <span style="color: var(--text-main); font-weight: 600;">${Utils.escapeHtml(issue.category)}</span>
              <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-top: 0.15rem;">${Utils.escapeHtml(issue.checklistItem)}</div>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 0.8125rem; display: block;">Reported Timestamp</span>
              <span style="color: var(--text-main);">${Utils.formatDateTime(issue.reportedDate)}</span>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 0.8125rem; display: block;">Inspector Observation</span>
              <p style="background: var(--bg-subtle); padding: 0.6rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-top: 0.25rem; color: var(--text-main); line-height: 1.4;">
                ${Utils.escapeHtml(issue.comment || 'Deficiency recorded during inspection.')}
              </p>
            </div>
          </div>
        </div>

        <!-- Evidence Gallery -->
        <div class="card">
          <h2 style="font-size: 1.1rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
            Photo Evidence (${photos.length})
          </h2>

          ${photos.length === 0 ? `
            <div style="text-align: center; padding: 2rem 1rem; color: var(--text-muted); font-size: 0.875rem;">
              No photos attached to this deficiency record.
            </div>
          ` : `
            <div class="photo-thumbnails-grid">
              ${photos.map(src => `
                <div class="photo-thumb-wrap" style="width: 100px; height: 100px;" onclick="Utils.openLightbox('${src}', '${Utils.escapeHtml(issue.title)}')">
                  <img src="${src}" alt="Issue Photo" />
                </div>
              `).join('')}
            </div>
          `}
        </div>

      </div>

      <!-- Action & Lifecycle Status Editor -->
      <div class="card" style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.15rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
          Update Status &amp; Corrective Notes
        </h2>

        <form id="update-issue-form">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
            <div class="form-group">
              <label class="form-label" for="edit-issue-status">Lifecycle Status</label>
              <select id="edit-issue-status" class="form-select">
                <option value="reported" ${currentStatus === 'reported' ? 'selected' : ''}>Reported</option>
                <option value="under_review" ${currentStatus === 'under_review' ? 'selected' : ''}>Under Review</option>
                <option value="assigned" ${currentStatus === 'assigned' ? 'selected' : ''}>Assigned to Crew</option>
                <option value="in_progress" ${currentStatus === 'in_progress' ? 'selected' : ''}>In Progress</option>
                <option value="resolved" ${currentStatus === 'resolved' ? 'selected' : ''}>Resolved</option>
                <option value="verified" ${currentStatus === 'verified' ? 'selected' : ''}>Verified &amp; Closed</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="edit-issue-priority">Priority Level</label>
              <select id="edit-issue-priority" class="form-select">
                <option value="high" ${issue.priority === 'high' ? 'selected' : ''}>High Priority (Immediate)</option>
                <option value="medium" ${issue.priority === 'medium' ? 'selected' : ''}>Medium Priority (Standard)</option>
                <option value="low" ${issue.priority === 'low' ? 'selected' : ''}>Low Priority (Minor)</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="edit-issue-notes">Resolution Notes / Dispatch Log</label>
            <textarea id="edit-issue-notes" class="form-textarea" rows="3" placeholder="Enter remediation updates, assigned cleaner name, or completion notes...">${Utils.escapeHtml(issue.resolutionNotes || '')}</textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem;">
            <a href="#issues" class="btn btn-secondary">Cancel</a>
            <button type="submit" class="btn btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    `;

    const form = document.getElementById('update-issue-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = document.getElementById('edit-issue-status').value;
      const priority = document.getElementById('edit-issue-priority').value;
      const notes = document.getElementById('edit-issue-notes').value.trim();

      issue.status = status;
      issue.priority = priority;
      issue.resolutionNotes = notes;
      issue.updatedAt = new Date().toISOString();

      Storage.saveIssue(issue);
      Utils.showToast(`Issue ${issue.id} updated!`, 'success');
      Issues.renderDetail(container, issueId);
    });
  }
};
