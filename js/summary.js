/**
 * CleanInspect - Summary (Screen 9), Review & Submit (Screen 10), Inspection Completed (Screen 11)
 * js/summary.js
 */

const Summary = {
  /**
   * Screen 9 — Summary
   */
  renderSummary(container, inspectionId) {
    const insp = Storage.getInspectionById(inspectionId);
    if (!insp) {
      container.innerHTML = `<div class="card" style="padding:2rem;text-align:center;"><h3>Inspection not found</h3><a href="#inspections" class="btn btn-primary" style="margin-top:1rem;">Back</a></div>`;
      return;
    }

    Storage.recalculateInspectionStats(insp);
    const items = insp.items || [];
    const issues = items.filter(it => it.status === 'partial' || it.status === 'not_completed');
    const unassessed = items.filter(it => !it.status || it.status === 'unassessed');

    // Category progress calculation
    const catMap = {};
    items.forEach(it => {
      if (!catMap[it.categoryName]) {
        catMap[it.categoryName] = { total: 0, completed: 0, partial: 0, notCompleted: 0, unassessed: 0 };
      }
      catMap[it.categoryName].total++;
      const s = (it.status || 'unassessed').toLowerCase();
      if (s === 'completed') catMap[it.categoryName].completed++;
      else if (s === 'partial') catMap[it.categoryName].partial++;
      else if (s === 'not_completed') catMap[it.categoryName].notCompleted++;
      else catMap[it.categoryName].unassessed++;
    });

    container.innerHTML = `
      <!-- Top Step Header -->
      <div class="view-header" style="margin-bottom: 0.75rem;">
        <div class="view-header-row">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <a href="#checklist-issues/${insp.id}" class="btn btn-icon btn-secondary" title="Back to Issues">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
            </a>
            <div class="view-title-group">
              <h1>Inspection Summary</h1>
              <div class="view-subtitle">${Utils.escapeHtml(insp.location)} &bull; Quality Audit Performance</div>
            </div>
          </div>
          <div>${Utils.getStatusBadge(insp.status)}</div>
        </div>
      </div>

      <!-- Stepper Indicator -->
      <div class="step-tracker">
        <div class="step-node completed">
          <div class="step-circle">&#10003;</div>
          <span class="step-title">Checklist</span>
        </div>
        <div class="step-node completed">
          <div class="step-circle">&#10003;</div>
          <span class="step-title">Issues & Evidence</span>
        </div>
        <div class="step-node active">
          <div class="step-circle">3</div>
          <span class="step-title">Summary</span>
        </div>
        <div class="step-node">
          <div class="step-circle">4</div>
          <span class="step-title">Review & Submit</span>
        </div>
      </div>

      <!-- Unassessed Warning -->
      ${unassessed.length > 0 ? `
        <div class="alert alert-warning" style="margin-bottom: 1.25rem;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div>
            <strong>Warning: ${unassessed.length} task(s) remain unassessed.</strong>
            <p style="font-size: 0.8125rem; margin-top: 0.2rem;">
              Per quality standards, unassessed tasks reduce your overall completion score. 
              <a href="#checklist/${insp.id}" style="text-decoration: underline; font-weight: 600;">Return to checklist</a> to complete all evaluations.
            </p>
          </div>
        </div>
      ` : ''}

      <!-- Scorecard & Overview Card -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
          <div>
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Facility &amp; Auditor</span>
            <h2 style="font-size: 1.35rem; margin-top: 0.2rem;">${Utils.escapeHtml(insp.location)}</h2>
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.15rem;">
              Client: <strong>${Utils.escapeHtml(insp.client)}</strong> &bull; Auditor: <strong>${Utils.escapeHtml(insp.inspector || 'David Wilson')}</strong>
            </div>
            <div style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 0.15rem;">
              Inspection Ref: ${insp.reference} &bull; Scheduled: ${Utils.formatDateTime(insp.scheduledDate)}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 2.75rem; font-weight: 900; line-height: 1; color: ${insp.completionRate >= 80 ? 'var(--success)' : 'var(--warning)'};">
              ${insp.completionRate}%
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; margin-top: 0.25rem;">Compliance Score</div>
            <div style="font-size: 0.75rem; color: var(--text-light);">(Completed / Total &times; 100)</div>
          </div>
        </div>

        <!-- 4-Stat breakdown metric cards -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-top: 1.25rem; text-align: center;">
          <div style="background: var(--bg-subtle); padding: 0.75rem; border-radius: var(--radius-md);">
            <div style="font-size: 1.25rem; font-weight: 800; color: var(--text-main);">${insp.totalItems}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Total Items</div>
          </div>
          <div style="background: var(--success-light); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--success-border);">
            <div style="font-size: 1.25rem; font-weight: 800; color: var(--success);">${insp.completedItems}</div>
            <div style="font-size: 0.75rem; color: var(--success);">Passed (${Utils.calcCompletionRate(insp.completedItems, insp.totalItems)}%)</div>
          </div>
          <div style="background: var(--warning-light); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--warning-border);">
            <div style="font-size: 1.25rem; font-weight: 800; color: var(--warning);">${insp.partialItems}</div>
            <div style="font-size: 0.75rem; color: var(--warning);">Partial</div>
          </div>
          <div style="background: var(--danger-light); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--danger-border);">
            <div style="font-size: 1.25rem; font-weight: 800; color: var(--danger);">${insp.notCompletedItems}</div>
            <div style="font-size: 0.75rem; color: var(--danger);">Failed</div>
          </div>
        </div>
      </div>

      <!-- Category Progress Breakdown -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.1rem; margin-bottom: 1rem;">Category Performance Breakdown</h3>
        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
          ${Object.keys(catMap).map(catName => {
            const d = catMap[catName];
            const rate = Utils.calcCompletionRate(d.completed, d.total);
            return `
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; margin-bottom: 0.35rem;">
                  <strong style="color: var(--text-main);">${Utils.escapeHtml(catName)}</strong>
                  <span style="font-weight: 700; color: ${rate >= 80 ? 'var(--success)' : (rate > 0 ? 'var(--warning)' : 'var(--text-muted)')};">
                    ${rate}% (${d.completed}/${d.total})
                  </span>
                </div>
                <div class="progress-bar-container" style="height: 8px;">
                  <div class="progress-bar-fill ${rate >= 80 ? 'success' : (rate > 0 ? 'warning' : '')}" style="width: ${rate}%;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Reported Issues List with Thumbnails -->
      <div class="card" style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3 style="font-size: 1.1rem; color: var(--danger); display: flex; align-items: center; gap: 0.5rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Identified Quality Findings (${issues.length})
          </h3>
          <span style="font-size: 0.75rem; color: var(--text-muted);">${issues.length} action items</span>
        </div>

        ${issues.length === 0 ? `
          <div style="text-align: center; padding: 1.5rem; color: var(--success); font-weight: 600;">
            No quality defects or issues recorded for this inspection.
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${issues.map(iss => `
              <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.875rem; background: var(--bg-subtle);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.35rem;">
                  <div style="font-weight: 700; font-size: 0.9375rem; color: var(--text-main);">${Utils.escapeHtml(iss.task)}</div>
                  <div>${Utils.getStatusBadge(iss.status)}</div>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">
                  Category: ${Utils.escapeHtml(iss.categoryName)}
                </div>
                ${iss.comment ? `
                  <div style="font-size: 0.8125rem; color: var(--text-secondary); background: #fff; padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-bottom: 0.5rem;">
                    <strong>Observation:</strong> ${Utils.escapeHtml(iss.comment)}
                  </div>
                ` : ''}
                ${Array.isArray(iss.photos) && iss.photos.length > 0 ? `
                  <div class="photo-thumbnails-grid">
                    ${iss.photos.map(src => `
                      <div class="photo-thumb-wrap" onclick="Utils.openLightbox('${src}', '${Utils.escapeHtml(iss.task)}')">
                        <img src="${src}" alt="Issue Photo" />
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Action Bar Sticky -->
      <div class="action-bar-sticky">
        <a href="#checklist/${insp.id}" class="btn btn-secondary">
          <span class="btn-label-desktop">&larr; Back to Checklist</span>
          <span class="btn-label-mobile">&larr; Checklist</span>
        </a>
        <a href="#review/${insp.id}" class="btn btn-primary">
          <span>Review &amp; Submit</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </a>
      </div>
    `;
  },

  /**
   * Screen 10 — Review & Submit
   */
  renderReview(container, inspectionId) {
    const insp = Storage.getInspectionById(inspectionId);
    if (!insp) {
      container.innerHTML = `<div class="card" style="padding:2rem;text-align:center;"><h3>Inspection not found</h3><a href="#inspections" class="btn btn-primary" style="margin-top:1rem;">Back</a></div>`;
      return;
    }

    Storage.recalculateInspectionStats(insp);
    const items = insp.items || [];
    const unassessed = items.filter(it => !it.status || it.status === 'unassessed');
    const issues = items.filter(it => it.status === 'partial' || it.status === 'not_completed');

    container.innerHTML = `
      <!-- Top Step Header -->
      <div class="view-header" style="margin-bottom: 0.75rem;">
        <div class="view-header-row">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <a href="#summary/${insp.id}" class="btn btn-icon btn-secondary" title="Back to Summary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
            </a>
            <div class="view-title-group">
              <h1>Review &amp; Submit Inspection</h1>
              <div class="view-subtitle">Final verification before finalizing quality audit record</div>
            </div>
          </div>
          <div><span class="badge badge-partial">Step 4 of 4: Submission</span></div>
        </div>
      </div>

      <!-- Stepper Indicator -->
      <div class="step-tracker">
        <div class="step-node completed">
          <div class="step-circle">&#10003;</div>
          <span class="step-title">Checklist</span>
        </div>
        <div class="step-node completed">
          <div class="step-circle">&#10003;</div>
          <span class="step-title">Issues & Evidence</span>
        </div>
        <div class="step-node completed">
          <div class="step-circle">&#10003;</div>
          <span class="step-title">Summary</span>
        </div>
        <div class="step-node active">
          <div class="step-circle">4</div>
          <span class="step-title">Review & Submit</span>
        </div>
      </div>

      <!-- Review Information Card -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <h2 style="font-size: 1.15rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
          Audit Verification Overview
        </h2>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; font-size: 0.875rem; margin-bottom: 1.25rem;">
          <div>
            <span style="color: var(--text-muted); display: block; font-size: 0.8125rem;">Facility Location</span>
            <strong style="font-size: 1rem; color: var(--text-main);">${Utils.escapeHtml(insp.location)}</strong>
          </div>
          <div>
            <span style="color: var(--text-muted); display: block; font-size: 0.8125rem;">Client Organization</span>
            <strong>${Utils.escapeHtml(insp.client)}</strong>
          </div>
          <div>
            <span style="color: var(--text-muted); display: block; font-size: 0.8125rem;">Inspection Reference</span>
            <strong>${insp.reference}</strong>
          </div>
          <div>
            <span style="color: var(--text-muted); display: block; font-size: 0.8125rem;">Inspector</span>
            <strong>${Utils.escapeHtml(insp.inspector || 'David Wilson')}</strong>
          </div>
          <div>
            <span style="color: var(--text-muted); display: block; font-size: 0.8125rem;">Final Compliance Score</span>
            <strong style="color: ${insp.completionRate >= 80 ? 'var(--success)' : 'var(--warning)'}; font-size: 1.1rem;">
              ${insp.completionRate}%
            </strong>
          </div>
          <div>
            <span style="color: var(--text-muted); display: block; font-size: 0.8125rem;">Reported Deficiencies</span>
            <strong style="color: var(--danger); font-size: 1.1rem;">${issues.length}</strong>
          </div>
        </div>

        ${unassessed.length > 0 ? `
          <div class="alert alert-warning" style="margin-top: 1rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              <strong>${unassessed.length} item(s) are unassessed.</strong>
              Submitting now will finalize these as unassessed in the official audit report.
            </div>
          </div>
        ` : `
          <div class="alert alert-success" style="margin-top: 1rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <div>
              <strong>Checklist Complete!</strong> All 32 inspection items have been evaluated.
            </div>
          </div>
        `}
      </div>

      <!-- General Observations & Recommendations Editor -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.1rem; margin-bottom: 0.75rem;">Inspector Observations &amp; Recommendations</h3>
        
        <div class="form-group">
          <label class="form-label" for="review-observations">Overall Observations</label>
          <textarea id="review-observations" class="form-textarea" rows="2" placeholder="Summary of cleanliness, facility condition, hygiene standards...">${Utils.escapeHtml(insp.generalObservations || '')}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label" for="review-attention">Areas Requiring Attention</label>
          <textarea id="review-attention" class="form-textarea" rows="2" placeholder="Specific rooms, surfaces, or fixtures needing remediation...">${Utils.escapeHtml(insp.areasRequiringAttention || '')}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label" for="review-actions">Recommended Corrective Actions</label>
          <textarea id="review-actions" class="form-textarea" rows="2" placeholder="Immediate porter dispatch, deep cleaning schedule...">${Utils.escapeHtml(insp.recommendedActions || '')}</textarea>
        </div>
      </div>

      <!-- Inspector Attestation / Sign-off -->
      <div class="card" style="margin-bottom: 2rem;">
        <h3 style="font-size: 1.1rem; margin-bottom: 0.75rem;">Inspector Declaration</h3>
        <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 1rem;">
          I, <strong>${Utils.escapeHtml(insp.inspector || 'David Wilson')}</strong>, certify that this inspection was conducted in compliance with CleanInspect Quality Assurance Guidelines. All observations and photo evidence recorded represent the actual conditions observed on site.
        </p>

        <label style="display: flex; align-items: center; gap: 0.65rem; font-size: 0.9375rem; font-weight: 600; cursor: pointer;">
          <input type="checkbox" id="declaration-checkbox" checked style="width: 18px; height: 18px; accent-color: var(--primary);" />
          <span>I confirm the accuracy of this cleaning inspection</span>
        </label>
      </div>

      <!-- Action Bar Sticky -->
      <div class="action-bar-sticky">
        <a href="#summary/${insp.id}" class="btn btn-secondary">
          <span class="btn-label-desktop">Edit Inspection</span>
          <span class="btn-label-mobile">Edit</span>
        </a>
        <button id="confirm-submit-btn" class="btn btn-success">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span class="btn-label-desktop">Confirm Submission</span>
          <span class="btn-label-mobile">Submit</span>
        </button>
      </div>
    `;

    // Confirm submission handler
    const confirmBtn = document.getElementById('confirm-submit-btn');
    confirmBtn.addEventListener('click', () => {
      const checkbox = document.getElementById('declaration-checkbox');
      if (checkbox && !checkbox.checked) {
        Utils.showToast('Please confirm the inspector declaration checkbox.', 'warning');
        return;
      }

      // Save observations
      insp.generalObservations = document.getElementById('review-observations').value.trim();
      insp.areasRequiringAttention = document.getElementById('review-attention').value.trim();
      insp.recommendedActions = document.getElementById('review-actions').value.trim();

      // Finalize inspection
      insp.status = 'completed';
      insp.completedDate = new Date().toISOString();
      insp.signOff = {
        inspectorName: insp.inspector || 'David Wilson',
        submittedAt: insp.completedDate,
        supervisorReviewed: false
      };

      Storage.recalculateInspectionStats(insp);
      Storage.saveInspection(insp);

      // Sync issues into Issues store
      const issuesToSync = (insp.items || []).filter(it => it.status === 'partial' || it.status === 'not_completed');
      issuesToSync.forEach((it, idx) => {
        const issueId = `ISSUE-${insp.reference}-${idx + 1}`;
        const existing = Storage.getIssueById(issueId);
        if (!existing) {
          Storage.saveIssue({
            id: issueId,
            title: `${it.categoryName}: ${it.task.slice(0, 45)}...`,
            inspectionId: insp.id,
            inspectionRef: insp.reference,
            location: insp.location,
            category: it.categoryName,
            checklistItem: it.task,
            priority: it.status === 'not_completed' ? 'high' : 'medium',
            status: 'reported',
            reportedDate: insp.completedDate,
            comment: it.comment || 'Deficiency identified during inspection audit.',
            photos: it.photos || [],
            resolutionNotes: ''
          });
        }
      });

      Utils.showToast('Inspection submitted and completed locally!', 'success');
      window.location.hash = `#completed/${insp.id}`;
    });
  },

  /**
   * Screen 11 — Inspection Completed
   */
  renderCompleted(container, inspectionId) {
    const insp = Storage.getInspectionById(inspectionId);
    if (!insp) {
      container.innerHTML = `<div class="card" style="padding:2rem;text-align:center;"><h3>Inspection not found</h3><a href="#inspections" class="btn btn-primary" style="margin-top:1rem;">Back</a></div>`;
      return;
    }

    Storage.recalculateInspectionStats(insp);

    container.innerHTML = `
      <div style="min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem 1rem;">
        <div class="card" style="width: 100%; max-width: 520px; text-align: center; padding: 2.5rem 1.75rem; box-shadow: var(--shadow-xl);">
          
          <!-- Animated / High-impact Success Icon -->
          <div style="width: 76px; height: 76px; border-radius: var(--radius-full); background: var(--success-light); color: var(--success); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 1.25rem; border: 3px solid var(--success-border); box-shadow: 0 4px 14px rgba(22, 163, 74, 0.2);">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>

          <h1 style="font-size: 1.6rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.35rem;">
            Inspection Completed!
          </h1>
          <p style="font-size: 0.9375rem; color: var(--text-muted); margin-bottom: 1.5rem;">
            Your quality inspection records and evidence photos have been preserved locally.
          </p>

          <!-- Completed Metadata Card -->
          <div style="background: var(--bg-subtle); border-radius: var(--radius-lg); padding: 1.25rem; text-align: left; margin-bottom: 1.75rem; border: 1px solid var(--border-color);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.6rem; font-size: 0.875rem;">
              <span style="color: var(--text-muted);">Inspection Reference:</span>
              <strong style="color: var(--primary);">${insp.reference}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.6rem; font-size: 0.875rem;">
              <span style="color: var(--text-muted);">Location:</span>
              <strong style="color: var(--text-main);">${Utils.escapeHtml(insp.location)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.6rem; font-size: 0.875rem;">
              <span style="color: var(--text-muted);">Submission Time:</span>
              <span style="font-weight: 600; color: var(--text-main);">${Utils.formatDateTime(insp.completedDate || new Date().toISOString())}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.6rem; font-size: 0.875rem;">
              <span style="color: var(--text-muted);">Final Compliance Rate:</span>
              <strong style="color: ${insp.completionRate >= 80 ? 'var(--success)' : 'var(--warning)'}; font-size: 1rem;">${insp.completionRate}%</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
              <span style="color: var(--text-muted);">Reported Deficiencies:</span>
              <strong style="color: var(--danger);">${insp.issuesCount || 0} issues</strong>
            </div>
          </div>

          <!-- Actions -->
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <a href="#report-detail/${insp.id}" class="btn btn-primary btn-block" style="height: 48px; font-size: 1rem;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              <span>View Full Inspection Report</span>
            </a>

            <button id="completed-download-pdf-btn" class="btn btn-secondary btn-block">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Download PDF Audit File</span>
            </button>

            <a href="#dashboard" class="btn btn-ghost btn-block" style="color: var(--text-secondary); margin-top: 0.25rem;">
              Return to Dashboard
            </a>
          </div>

          <p style="font-size: 0.72rem; color: var(--text-light); margin-top: 1.5rem;">
            *Local static demo prototype. Inspection data stored securely in browser storage.
          </p>

        </div>
      </div>
    `;

    // Download PDF handler
    const pdfBtn = document.getElementById('completed-download-pdf-btn');
    if (pdfBtn) {
      pdfBtn.addEventListener('click', () => {
        PDFExport.generatePDF(insp.id);
      });
    }
  }
};
