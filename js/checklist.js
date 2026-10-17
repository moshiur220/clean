/**
 * CleanInspect - Checklist Workflows (Screens 6, 7, 8)
 * js/checklist.js
 */

const Checklist = {
  activeInspectionId: null,
  activeCategoryId: 'all',
  editingItemId: null,

  /**
   * Helper to ensure an inspection is in_progress once edited
   */
  ensureInProgress(insp) {
    if (insp.status === 'pending') {
      insp.status = 'in_progress';
      Storage.saveInspection(insp);
    }
  },

  /**
   * Screen 6 — Start Inspection: Checklist Page 1
   */
  renderPage1(container, inspectionId, categoryFilter = null) {
    this.activeInspectionId = inspectionId;
    const insp = Storage.getInspectionById(inspectionId);

    if (!insp) {
      container.innerHTML = `<div class="card" style="padding:2rem;text-align:center;"><h3>Inspection not found</h3><a href="#inspections" class="btn btn-primary" style="margin-top:1rem;">Back</a></div>`;
      return;
    }

    this.ensureInProgress(insp);
    Storage.recalculateInspectionStats(insp);

    if (categoryFilter) {
      this.activeCategoryId = categoryFilter;
    }

    const categories = Storage.getCategories();
    const items = insp.items || [];

    // Filter items by active category if not 'all'
    const filteredItems = this.activeCategoryId === 'all'
      ? items
      : items.filter(it => it.categoryId === this.activeCategoryId);

    // Calculate progress
    const assessedCount = items.filter(it => it.status && it.status !== 'unassessed').length;
    const progressPercent = Math.round((assessedCount / (items.length || 1)) * 100);
    const t = (k, v) => (typeof I18n !== 'undefined' ? I18n.t(k, v) : k);
    const isSv = typeof I18n !== 'undefined' && I18n.currentLang === 'sv';

    container.innerHTML = `
      <!-- Top Step Header -->
      <div class="view-header" style="margin-bottom: 0.75rem;">
        <div class="view-header-row">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <a href="#inspection-detail/${insp.id}" class="btn btn-icon btn-secondary" title="${t('common.back')}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
            </a>
            <div class="view-title-group">
              <h1>${Utils.escapeHtml(insp.location)}</h1>
              <div class="view-subtitle">${Utils.escapeHtml(insp.client)} &bull; ${t('inspections.reference')}: ${insp.reference}</div>
            </div>
          </div>
          <div>
            <span class="badge badge-partial" style="font-size: 0.8125rem; padding: 0.35rem 0.75rem;">${isSv ? 'Sida 1 av 2: Bedömning' : 'Page 1 of 2: Assessment'}</span>
          </div>
        </div>
      </div>

      <!-- Stepper Indicator -->
      <div class="step-tracker">
        <div class="step-node active">
          <div class="step-circle">1</div>
          <span class="step-title">${t('checklist.stepChecklist')}</span>
        </div>
        <div class="step-node">
          <div class="step-circle">2</div>
          <span class="step-title">${t('checklist.stepIssues')}</span>
        </div>
        <div class="step-node">
          <div class="step-circle">3</div>
          <span class="step-title">${t('checklist.stepSummary')}</span>
        </div>
        <div class="step-node">
          <div class="step-circle">4</div>
          <span class="step-title">${t('checklist.stepReview')}</span>
        </div>
      </div>

      <!-- Assessment Overall Progress Bar Card -->
      <div class="card" style="margin-bottom: 1.25rem; padding: 1rem 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.4rem;">
          <span style="color: var(--text-main);">${isSv ? 'Totalt bedömt' : 'Overall Assessed'}: <strong>${assessedCount} ${isSv ? 'av' : 'of'} ${items.length}</strong> ${isSv ? 'uppgifter' : 'tasks'} (${progressPercent}%)</span>
          <span style="color: ${insp.completionRate >= 80 ? 'var(--success)' : 'var(--text-secondary)'};">${t('summary.passed')}: <strong>${insp.completedItems || 0}</strong></span>
        </div>
        <div class="progress-bar-container" style="height: 10px;">
          <div class="progress-bar-fill" style="width: ${progressPercent}%; background: var(--primary);"></div>
        </div>
      </div>

      <!-- Category Filter Tabs (Horizontally scrollable on mobile) -->
      <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem; margin-bottom: 1.25rem; -webkit-overflow-scrolling: touch;">
        <button class="btn btn-sm ${this.activeCategoryId === 'all' ? 'btn-primary' : 'btn-secondary'} cat-tab-btn" data-cat="all" style="white-space: nowrap;">
          ${isSv ? 'Alla kategorier' : 'All Categories'} (${items.length})
        </button>
        ${categories.map(cat => {
          const count = items.filter(it => it.categoryId === cat.id).length;
          const isActive = this.activeCategoryId === cat.id;
          const localizedName = t(`categories.categoryNames.${cat.id}`);
          const catDisplayName = (localizedName && !localizedName.startsWith('categories.')) ? localizedName : cat.name;
          return `
            <button class="btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'} cat-tab-btn" data-cat="${cat.id}" style="white-space: nowrap;">
              ${Utils.escapeHtml(catDisplayName)} (${count})
            </button>
          `;
        }).join('')}
      </div>

      <!-- Checklist Items List -->
      <div id="checklist-items-container" style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem;">
        ${filteredItems.map(item => this.renderChecklistItemCard(item, insp.id)).join('')}
      </div>

      <!-- Bottom Navigation / Action Bar -->
      <div class="action-bar-sticky">
        <button id="save-progress-btn" class="btn btn-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          <span class="btn-label-desktop">${t('checklist.saveProgress')}</span>
          <span class="btn-label-mobile">${t('checklist.save')}</span>
        </button>
        <button id="next-page-btn" class="btn btn-primary">
          <span>${t('checklist.nextIssues')}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </div>
    `;

    this.bindPage1Events(container, insp);
  },

  /**
   * Render single checklist item card
   */
  renderChecklistItemCard(item, inspId) {
    const status = (item.status || 'unassessed').toLowerCase();
    const hasComment = !!(item.comment && item.comment.trim());
    const photoCount = Array.isArray(item.photos) ? item.photos.length : 0;
    const t = (k, v) => (typeof I18n !== 'undefined' ? I18n.t(k, v) : k);
    const isSv = typeof I18n !== 'undefined' && I18n.currentLang === 'sv';
    const localizedCat = t(`categories.categoryNames.${item.categoryId}`);
    const catDisplayName = (localizedCat && !localizedCat.startsWith('categories.')) ? localizedCat : item.categoryName;

    return `
      <div class="checklist-item-card is-${status}" id="card-${item.id}" data-item-id="${item.id}">
        <!-- Category & Item Header -->
        <div class="checklist-item-header">
          <div style="flex: 1;">
            <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--primary); margin-bottom: 0.25rem;">
              ${Utils.escapeHtml(catDisplayName)}
            </div>
            <div class="checklist-task-title">${Utils.escapeHtml(item.task)}</div>
          </div>
          <button class="btn btn-ghost btn-sm btn-item-detail" data-item-id="${item.id}" title="${isSv ? 'Redigera observation' : 'Deep Edit Item'}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </div>

        <!-- 3-Choice Status Buttons: Completed / Partial / Not Completed -->
        <div class="status-btn-group">
          <!-- Completed -->
          <button type="button" class="status-btn btn-completed ${status === 'completed' ? 'active' : ''}" data-item-id="${item.id}" data-status="completed">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>
            <span>${t('checklist.statusCompleted')}</span>
          </button>

          <!-- Partially Completed -->
          <button type="button" class="status-btn btn-partial ${status === 'partial' ? 'active' : ''}" data-item-id="${item.id}" data-status="partial">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>${t('checklist.statusPartial')}</span>
          </button>

          <!-- Not Completed -->
          <button type="button" class="status-btn btn-not-completed ${status === 'not_completed' ? 'active' : ''}" data-item-id="${item.id}" data-status="not_completed">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <span>${t('checklist.statusNotCompleted')}</span>
          </button>
        </div>

        <!-- Inline Comment Display or Add Comment Trigger -->
        ${hasComment ? `
          <div class="checklist-comment-box">
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.25rem;">
              <span>${isSv ? 'Inspektörens observation' : 'Inspector Observation'}</span>
              <button class="btn btn-ghost btn-sm edit-comment-btn" data-item-id="${item.id}" style="padding: 0 0.35rem; min-height: 20px; font-size: 0.72rem;">${t('common.edit')}</button>
            </div>
            <p style="font-size: 0.8125rem; color: var(--text-main); line-height: 1.4;">${Utils.escapeHtml(item.comment)}</p>
          </div>
        ` : ''}

        <!-- Inline Photo Thumbnail Grid -->
        ${photoCount > 0 ? `
          <div class="photo-thumbnails-grid">
            ${item.photos.map((src, photoIdx) => `
              <div class="photo-thumb-wrap" onclick="Utils.openLightbox('${src}', '${Utils.escapeHtml(item.task)}')">
                <img src="${src}" alt="Inspection Evidence" />
                <button type="button" class="photo-remove-btn" title="Remove Photo" onclick="event.stopPropagation(); Checklist.removePhoto('${inspId}', '${item.id}', ${photoIdx})">&times;</button>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Card Bottom Micro-Actions -->
        <div class="checklist-item-actions">
          <button type="button" class="btn btn-ghost btn-sm add-inline-comment-btn" data-item-id="${item.id}" style="font-size: 0.75rem; min-height: 32px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            ${hasComment ? (isSv ? 'Uppdatera kommentar' : 'Update Comment') : t('checklist.addComment')}
          </button>

          <label class="btn btn-ghost btn-sm" style="font-size: 0.75rem; min-height: 32px; cursor: pointer; margin: 0;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            <span>${photoCount > 0 ? `${isSv ? 'Foton' : 'Photos'} (${photoCount})` : t('checklist.addPhoto')}</span>
            <input type="file" accept="image/*" class="sr-only inline-photo-input" data-item-id="${item.id}" />
          </label>
        </div>
      </div>
    `;
  },

  /**
   * Bind events for Screen 6 Checklist Page 1
   */
  bindPage1Events(container, insp) {
    // Status button click handlers
    container.querySelectorAll('.status-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = btn.getAttribute('data-item-id');
        const newStatus = btn.getAttribute('data-status');
        this.updateItemStatus(insp.id, itemId, newStatus);
      });
    });

    // Category filter tabs
    container.querySelectorAll('.cat-tab-btn').forEach(tab => {
      tab.addEventListener('click', () => {
        const cat = tab.getAttribute('data-cat');
        this.renderPage1(container, insp.id, cat);
      });
    });

    // Item detail modal opener
    container.querySelectorAll('.btn-item-detail').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.getAttribute('data-item-id');
        this.openItemDetailModal(insp.id, itemId);
      });
    });

    // Inline Add / Edit comment triggers
    container.querySelectorAll('.add-inline-comment-btn, .edit-comment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.getAttribute('data-item-id');
        this.promptComment(insp.id, itemId);
      });
    });

    // Inline Photo input
    container.querySelectorAll('.inline-photo-input').forEach(input => {
      input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const itemId = input.getAttribute('data-item-id');
        await this.handlePhotoUpload(insp.id, itemId, file);
      });
    });

    // Save Progress button
    const saveBtn = document.getElementById('save-progress-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        Storage.recalculateInspectionStats(insp);
        Storage.saveInspection(insp);
        Utils.showToast('Inspection progress saved locally!', 'success');
      });
    }

    // Next page button -> Screen 7 (Issues & Evidence)
    const nextBtn = document.getElementById('next-page-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        Storage.recalculateInspectionStats(insp);
        Storage.saveInspection(insp);
        window.location.hash = `#checklist-issues/${insp.id}`;
      });
    }
  },

  /**
   * Update item status directly and re-render card
   */
  updateItemStatus(inspId, itemId, newStatus) {
    const insp = Storage.getInspectionById(inspId);
    if (!insp) return;

    const item = (insp.items || []).find(it => it.id === itemId);
    if (!item) return;

    item.status = newStatus;
    Storage.recalculateInspectionStats(insp);
    Storage.saveInspection(insp);

    // Update active state in UI
    const card = document.getElementById(`card-${itemId}`);
    if (card) {
      card.className = `checklist-item-card is-${newStatus}`;
      card.querySelectorAll('.status-btn').forEach(btn => {
        if (btn.getAttribute('data-status') === newStatus) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }
  },

  /**
   * Prompt for comment dialog
   */
  promptComment(inspId, itemId) {
    this.openItemDetailModal(inspId, itemId);
  },

  /**
   * Handle photo upload, compression and persistence
   */
  async handlePhotoUpload(inspId, itemId, file) {
    try {
      Utils.showToast('Processing photo...', 'info', 1500);
      const compressedDataUrl = await Utils.compressImage(file, 900, 0.7);

      const insp = Storage.getInspectionById(inspId);
      if (!insp) return;

      const item = (insp.items || []).find(it => it.id === itemId);
      if (!item) return;

      if (!Array.isArray(item.photos)) item.photos = [];

      // Save photo in IndexedDB and keep dataUrl in item
      const photoId = Utils.generateId('photo');
      await Storage.savePhoto(photoId, compressedDataUrl);
      item.photos.push(compressedDataUrl);

      Storage.saveInspection(insp);
      Utils.showToast('Photo added to evidence!', 'success');

      // Refresh page or modal
      const currentHash = window.location.hash;
      if (currentHash.includes('checklist-issues')) {
        this.renderPage2(document.getElementById('main-content'), inspId);
      } else {
        this.renderPage1(document.getElementById('main-content'), inspId, this.activeCategoryId);
      }
    } catch (err) {
      console.error(err);
      Utils.showToast('Could not process image.', 'danger');
    }
  },

  /**
   * Remove photo from item
   */
  removePhoto(inspId, itemId, photoIndex) {
    const insp = Storage.getInspectionById(inspId);
    if (!insp) return;

    const item = (insp.items || []).find(it => it.id === itemId);
    if (!item || !Array.isArray(item.photos)) return;

    item.photos.splice(photoIndex, 1);
    Storage.saveInspection(insp);
    Utils.showToast('Photo removed.', 'info');

    const currentHash = window.location.hash;
    if (currentHash.includes('checklist-issues')) {
      this.renderPage2(document.getElementById('main-content'), inspId);
    } else {
      this.renderPage1(document.getElementById('main-content'), inspId, this.activeCategoryId);
    }
  },

  /**
   * Screen 7 — Start Inspection: Checklist Page 2 (Issues & Evidence)
   */
  renderPage2(container, inspectionId) {
    this.activeInspectionId = inspectionId;
    const insp = Storage.getInspectionById(inspectionId);

    if (!insp) {
      container.innerHTML = `<div class="card" style="padding:2rem;text-align:center;"><h3>Inspection not found</h3><a href="#inspections" class="btn btn-primary" style="margin-top:1rem;">Back</a></div>`;
      return;
    }

    Storage.recalculateInspectionStats(insp);
    const items = insp.items || [];

    // Separate issues (partial & not_completed) and unassessed items
    const issueItems = items.filter(it => it.status === 'partial' || it.status === 'not_completed');
    const unassessedItems = items.filter(it => !it.status || it.status === 'unassessed');
    const completedItems = items.filter(it => it.status === 'completed');

    container.innerHTML = `
      <!-- Top Step Header -->
      <div class="view-header" style="margin-bottom: 0.75rem;">
        <div class="view-header-row">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <a href="#checklist/${insp.id}" class="btn btn-icon btn-secondary" title="Back to Checklist">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
    const t = (k, v) => (typeof I18n !== 'undefined' ? I18n.t(k, v) : k);
    const isSv = typeof I18n !== 'undefined' && I18n.currentLang === 'sv';

    container.innerHTML = `
      <!-- Top Step Header -->
      <div class="view-header" style="margin-bottom: 0.75rem;">
        <div class="view-header-row">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <a href="#checklist/${insp.id}" class="btn btn-icon btn-secondary" title="${t('common.back')}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
            </a>
            <div class="view-title-group">
              <h1>${t('checklist.page2Title')}</h1>
              <div class="view-subtitle">${Utils.escapeHtml(insp.location)} &bull; ${t('common.documentCorrectiveFindings')}</div>
            </div>
          </div>
          <div>
            <span class="badge badge-partial" style="font-size: 0.8125rem; padding: 0.35rem 0.75rem;">${isSv ? 'Sida 2 av 2: Problem' : 'Page 2 of 2: Issues'}</span>
          </div>
        </div>
      </div>

      <!-- Stepper Indicator -->
      <div class="step-tracker">
        <div class="step-node completed">
          <div class="step-circle">&#10003;</div>
          <span class="step-title">${t('checklist.stepChecklist')}</span>
        </div>
        <div class="step-node active">
          <div class="step-circle">2</div>
          <span class="step-title">${t('checklist.stepIssues')}</span>
        </div>
        <div class="step-node">
          <div class="step-circle">3</div>
          <span class="step-title">${t('checklist.stepSummary')}</span>
        </div>
        <div class="step-node">
          <div class="step-circle">4</div>
          <span class="step-title">${t('checklist.stepReview')}</span>
        </div>
      </div>

      <!-- Unassessed items warning if any exist -->
      ${unassessedItems.length > 0 ? `
        <div class="alert alert-warning" style="margin-bottom: 1.25rem;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div>
            <strong>${isSv ? `Obs: ${unassessedItems.length} checklisteobjekt är fortfarande ej bedömda.` : `Notice: ${unassessedItems.length} checklist items remain unassessed.`}</strong>
            <div style="font-size: 0.8125rem; margin-top: 0.2rem;">
              ${isSv ? 'Du kan gå vidare, men ej bedömda objekt räknas mot den slutliga efterlevnadsgraden.' : 'You can still proceed, but unassessed items will count against the final compliance score.'}
              <a href="#checklist/${insp.id}" style="text-decoration: underline; font-weight: 600; margin-left: 0.35rem;">${isSv ? 'Återgå för att slutföra' : 'Return to complete them'}</a>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- High Priority Deficiencies Section -->
      <div style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--danger); display: flex; align-items: center; gap: 0.5rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            ${isSv ? 'Identifierade brister & problem' : 'Identified Deficiencies & Issues'} (${issueItems.length})
          </h2>
          <span style="font-size: 0.75rem; color: var(--text-muted);">${isSv ? 'Visas först för snabb dokumentation' : 'Shown first for fast documentation'}</span>
        </div>

        ${issueItems.length === 0 ? `
          <div class="card" style="text-align: center; padding: 2rem 1rem; background: var(--success-light); border-color: var(--success-border);">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2" style="margin: 0 auto 0.5rem;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <h3 style="color: var(--success); font-size: 1.05rem;">${t('checklist.noIssues')}</h3>
            <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-top: 0.25rem;">${t('checklist.noIssuesDesc')}</p>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 1.25rem;">
            ${issueItems.map(item => this.renderEvidenceCard(item, insp.id)).join('')}
          </div>
        `}
      </div>

      <!-- Optional Completed Tasks with Evidence Collapsible -->
      <div class="card" style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3 style="font-size: 1rem; font-weight: 700;">${t('checklist.completedItems')} (${completedItems.length})</h3>
            <p style="font-size: 0.75rem; color: var(--text-muted);">${isSv ? 'Lägg till foton eller anteckningar som bevis på godkänd städning' : 'Optionally attach comments or photos to passed items as proof of cleanliness'}</p>
          </div>
          <button id="toggle-completed-evidence-btn" class="btn btn-secondary btn-sm">${t('checklist.showHide')}</button>
        </div>

        <div id="completed-evidence-list" class="hidden" style="margin-top: 1rem; display: flex; flex-direction: column; gap: 1rem;">
          ${completedItems.map(item => this.renderEvidenceCard(item, insp.id)).join('')}
        </div>
      </div>

      <!-- Action Bar Sticky -->
      <div class="action-bar-sticky">
        <a href="#checklist/${insp.id}" class="btn btn-secondary">
          <span class="btn-label-desktop">${t('checklist.backToChecklist')}</span>
          <span class="btn-label-mobile">${t('checklist.backChecklist')}</span>
        </a>
        <button id="save-evidence-btn" class="btn btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          <span class="btn-label-desktop">${t('checklist.saveProgress')}</span>
          <span class="btn-label-mobile">${t('checklist.save')}</span>
        </button>
        <button id="continue-summary-btn" class="btn btn-primary">
          <span class="btn-label-desktop">${t('checklist.continueToSummary')}</span>
          <span class="btn-label-mobile">${t('checklist.summary')}</span>
        </button>
      </div>
    `;

    this.bindPage2Events(container, insp);
  },

  /**
   * Render single evidence item card for Screen 7
   */
  renderEvidenceCard(item, inspId) {
    const status = (item.status || 'unassessed').toLowerCase();
    const photos = Array.isArray(item.photos) ? item.photos : [];
    const t = (k, v) => (typeof I18n !== 'undefined' ? I18n.t(k, v) : k);
    const localizedCat = t(`categories.categoryNames.${item.categoryId}`);
    const catDisplayName = (localizedCat && !localizedCat.startsWith('categories.')) ? localizedCat : item.categoryName;

    return `
      <div class="card" style="border-left: 4px solid ${status === 'not_completed' ? 'var(--danger)' : (status === 'partial' ? 'var(--warning)' : 'var(--success)')}; padding: 1.25rem;" id="evidence-card-${item.id}">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">${Utils.escapeHtml(catDisplayName)}</span>
            <h4 style="font-size: 1rem; font-weight: 700; color: var(--text-main); margin-top: 0.15rem;">${Utils.escapeHtml(item.task)}</h4>
          </div>
          <div>${Utils.getStatusBadge(item.status)}</div>
        </div>

        <!-- Comment Textarea -->
        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label" style="font-size: 0.8125rem;">${t('checklist.deficiencyLabel')}</label>
          <textarea 
            class="form-textarea evidence-comment-input" 
            data-item-id="${item.id}" 
            rows="2" 
            placeholder="${t('checklist.deficiencyPlaceholder')}"
          >${Utils.escapeHtml(item.comment || '')}</textarea>
        </div>

        <!-- Photos Section -->
        <div>
          <label class="form-label" style="font-size: 0.8125rem; display: flex; justify-content: space-between; align-items: center;">
            <span>${t('checklist.photoEvidence')} (${photos.length})</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${t('checklist.indexedDB')}</span>
          </label>

          <!-- Thumbnails -->
          <div class="photo-thumbnails-grid" style="margin-bottom: 0.75rem;">
            ${photos.map((src, pIdx) => `
              <div class="photo-thumb-wrap" onclick="Utils.openLightbox('${src}', '${Utils.escapeHtml(item.task)}')">
                <img src="${src}" alt="Evidence Thumbnail" />
                <button type="button" class="photo-remove-btn" title="Remove Photo" onclick="event.stopPropagation(); Checklist.removePhoto('${inspId}', '${item.id}', ${pIdx})">&times;</button>
              </div>
            `).join('')}
          </div>

          <!-- Camera & Upload Actions -->
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            <!-- Take photo with camera capture hint -->
            <label class="btn btn-secondary btn-sm" style="cursor: pointer; margin: 0;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              <span>${t('checklist.takePhoto')}</span>
              <input type="file" accept="image/*" capture="environment" class="sr-only evidence-photo-upload" data-item-id="${item.id}" />
            </label>

            <!-- Upload file from library -->
            <label class="btn btn-secondary btn-sm" style="cursor: pointer; margin: 0;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span>${t('checklist.uploadPhoto')}</span>
              <input type="file" accept="image/*" class="sr-only evidence-photo-upload" data-item-id="${item.id}" />
            </label>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Bind Page 2 events
   */
  bindPage2Events(container, insp) {
    // Comment inputs auto-save on blur/change
    container.querySelectorAll('.evidence-comment-input').forEach(textarea => {
      textarea.addEventListener('input', () => {
        const itemId = textarea.getAttribute('data-item-id');
        const item = (insp.items || []).find(it => it.id === itemId);
        if (item) {
          item.comment = textarea.value;
          Storage.saveInspection(insp);
        }
      });
    });

    // Photo uploads
    container.querySelectorAll('.evidence-photo-upload').forEach(input => {
      input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const itemId = input.getAttribute('data-item-id');
        await this.handlePhotoUpload(insp.id, itemId, file);
      });
    });

    // Toggle completed evidence section
    const toggleBtn = document.getElementById('toggle-completed-evidence-btn');
    const completedList = document.getElementById('completed-evidence-list');
    if (toggleBtn && completedList) {
      toggleBtn.addEventListener('click', () => {
        completedList.classList.toggle('hidden');
      });
    }

    // Save evidence progress
    const saveBtn = document.getElementById('save-evidence-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        Storage.recalculateInspectionStats(insp);
        Storage.saveInspection(insp);
        Utils.showToast('Evidence and observations saved!', 'success');
      });
    }

    // Continue to Summary (Screen 9)
    const contBtn = document.getElementById('continue-summary-btn');
    if (contBtn) {
      contBtn.addEventListener('click', () => {
        Storage.recalculateInspectionStats(insp);
        Storage.saveInspection(insp);
        window.location.hash = `#summary/${insp.id}`;
      });
    }
  },

  /**
   * Screen 8 — Reusable Checklist Item Detail Modal
   */
  openItemDetailModal(inspId, itemId) {
    const insp = Storage.getInspectionById(inspId);
    if (!insp) return;

    const item = (insp.items || []).find(it => it.id === itemId);
    if (!item) return;

    this.editingItemId = itemId;

    let modal = document.getElementById('checklist-item-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'checklist-item-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    const status = (item.status || 'unassessed').toLowerCase();
    const photos = Array.isArray(item.photos) ? item.photos : [];

    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <div>
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--primary); text-transform: uppercase;">
              ${Utils.escapeHtml(item.categoryName)}
            </span>
            <h3 class="modal-title" style="margin-top: 0.15rem; font-size: 1.1rem;">Checklist Item Detail</h3>
          </div>
          <button class="btn btn-icon btn-ghost" onclick="document.getElementById('checklist-item-modal').classList.remove('active')">&times;</button>
        </div>

        <div class="modal-body">
          <p style="font-weight: 600; color: var(--text-main); line-height: 1.4;">${Utils.escapeHtml(item.task)}</p>

          <!-- Status Selector -->
          <div class="form-group">
            <label class="form-label">Compliance Status</label>
            <div class="status-btn-group" id="modal-status-group">
              <button type="button" class="status-btn btn-completed ${status === 'completed' ? 'active' : ''}" data-val="completed">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Completed</span>
              </button>
              <button type="button" class="status-btn btn-partial ${status === 'partial' ? 'active' : ''}" data-val="partial">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>Partial</span>
              </button>
              <button type="button" class="status-btn btn-not-completed ${status === 'not_completed' ? 'active' : ''}" data-val="not_completed">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                <span>Not Completed</span>
              </button>
            </div>
          </div>

          <!-- Comment Field -->
          <div class="form-group">
            <label class="form-label" for="modal-item-comment">Inspector Notes / Deficiency Details</label>
            <textarea id="modal-item-comment" class="form-textarea" rows="3" placeholder="Enter findings or required remediation...">${Utils.escapeHtml(item.comment || '')}</textarea>
          </div>

          <!-- Photo Gallery -->
          <div class="form-group">
            <label class="form-label" style="display: flex; justify-content: space-between;">
              <span>Attached Photos (${photos.length})</span>
            </label>

            <div class="photo-thumbnails-grid" id="modal-photos-grid">
              ${photos.map((src, idx) => `
                <div class="photo-thumb-wrap" onclick="Utils.openLightbox('${src}', '${Utils.escapeHtml(item.task)}')">
                  <img src="${src}" alt="Photo Evidence" />
                  <button type="button" class="photo-remove-btn" title="Remove" onclick="event.stopPropagation(); Checklist.removeModalPhoto(${idx})">&times;</button>
                </div>
              `).join('')}
            </div>

            <div style="margin-top: 0.75rem;">
              <label class="btn btn-secondary btn-sm" style="cursor: pointer; display: inline-flex;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                <span>Add / Upload Photo</span>
                <input type="file" accept="image/*" class="sr-only" id="modal-photo-file-input" />
              </label>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="document.getElementById('checklist-item-modal').classList.remove('active')">Cancel</button>
          <button type="button" class="btn btn-primary" id="modal-save-item-btn">Save Changes</button>
        </div>
      </div>
    `;

    modal.classList.add('active');

    // Status toggle in modal
    let selectedStatus = item.status || 'unassessed';
    const statusBtns = modal.querySelectorAll('#modal-status-group .status-btn');
    statusBtns.forEach(b => {
      b.addEventListener('click', () => {
        statusBtns.forEach(btn => btn.classList.remove('active'));
        b.classList.add('active');
        selectedStatus = b.getAttribute('data-val');
      });
    });

    // File input inside modal
    const fileInput = document.getElementById('modal-photo-file-input');
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      await this.handlePhotoUpload(inspId, itemId, file);
      this.openItemDetailModal(inspId, itemId);
    });

    // Save Changes button in modal
    const saveBtn = document.getElementById('modal-save-item-btn');
    saveBtn.addEventListener('click', () => {
      const commentVal = document.getElementById('modal-item-comment').value.trim();
      item.status = selectedStatus;
      item.comment = commentVal;

      Storage.recalculateInspectionStats(insp);
      Storage.saveInspection(insp);

      modal.classList.remove('active');
      Utils.showToast('Item updated successfully!', 'success');

      // Refresh view
      const hash = window.location.hash;
      if (hash.includes('checklist-issues')) {
        this.renderPage2(document.getElementById('main-content'), inspId);
      } else if (hash.includes('checklist')) {
        this.renderPage1(document.getElementById('main-content'), inspId, this.activeCategoryId);
      }
    });
  },

  removeModalPhoto(photoIndex) {
    if (this.activeInspectionId && this.editingItemId) {
      this.removePhoto(this.activeInspectionId, this.editingItemId, photoIndex);
      this.openItemDetailModal(this.activeInspectionId, this.editingItemId);
    }
  }
};
