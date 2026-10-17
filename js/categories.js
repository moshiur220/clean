/**
 * CleanInspect - Categories Screen (Screen 3)
 * js/categories.js
 */

const Categories = {
  render(container) {
    const categories = Storage.getCategories();
    const inspections = Storage.getInspections();
    
    // Choose active or latest inspection to calculate real-world category progress
    const currentInspection = inspections.find(i => i.status === 'in_progress') || inspections[0];

    // Compute metrics per category
    const categoryStats = {};
    categories.forEach(cat => {
      categoryStats[cat.id] = {
        total: 0,
        completed: 0,
        partial: 0,
        notCompleted: 0,
        unassessed: 0
      };
    });

    if (currentInspection && Array.isArray(currentInspection.items)) {
      currentInspection.items.forEach(item => {
        if (categoryStats[item.categoryId]) {
          categoryStats[item.categoryId].total++;
          const s = (item.status || 'unassessed').toLowerCase();
          if (s === 'completed') categoryStats[item.categoryId].completed++;
          else if (s === 'partial') categoryStats[item.categoryId].partial++;
          else if (s === 'not_completed') categoryStats[item.categoryId].notCompleted++;
          else categoryStats[item.categoryId].unassessed++;
        }
      });
    }

    // Helper for category SVG icon
    function getCategoryIcon(catId) {
      switch (catId) {
        case 'cat-entrance':
          return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"/><path d="M2 20h20"/><circle cx="14" cy="12" r="1"/></svg>`;
        case 'cat-office':
          return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`;
        case 'cat-conference':
          return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
        case 'cat-kitchen':
          return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`;
        case 'cat-toilets':
          return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.7 3 4 3.7 4 4.5V17a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V4.5c0-.8-.7-1.5-1.5-1.5-.4 0-.7.2-1 .5L15 6"/><path d="M9 11h6"/></svg>`;
        case 'cat-corridors':
          return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="8 18 12 22 16 18"/><polyline points="8 6 12 2 16 6"/><line x1="12" y1="2" x2="12" y2="22"/></svg>`;
        case 'cat-storage':
          return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`;
        default: // common
          return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`;
      }
    }

    const t = (k, v) => (typeof I18n !== 'undefined' ? I18n.t(k, v) : k);
    const isSv = typeof I18n !== 'undefined' && I18n.currentLang === 'sv';

    container.innerHTML = `
      <div class="view-header">
        <div class="view-header-row">
          <div class="view-title-group">
            <h1>${t('categories.title')}</h1>
            <div class="view-subtitle">${t('categories.subtitle')}</div>
          </div>
          ${currentInspection ? `
            <div style="font-size: 0.8125rem; background: var(--bg-card); padding: 0.35rem 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); color: var(--text-secondary);">
              ${isSv ? 'Referensanläggning' : 'Benchmarked on'}: <strong>${Utils.escapeHtml(currentInspection.location)}</strong>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Search & Filter Bar -->
      <div class="card" style="margin-bottom: 1.5rem; padding: 0.875rem 1.25rem;">
        <div class="input-wrapper">
          <span class="input-icon-left">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </span>
          <input 
            type="text" 
            id="category-search-input" 
            class="form-input has-icon-left" 
            placeholder="${isSv ? 'Sök kategorier (t.ex. Reception, Toaletter, Kök)...' : 'Search categories (e.g. Reception, Bathrooms, Kitchen)...'}" 
          />
        </div>
      </div>

      <!-- Categories Grid -->
      <div id="categories-grid" class="category-grid">
        <!-- Rendered dynamically -->
      </div>
    `;

    const gridContainer = document.getElementById('categories-grid');
    const searchInput = document.getElementById('category-search-input');

    function renderCategoryCards(filterText = '') {
      const q = filterText.trim().toLowerCase();
      const filtered = categories.filter(c => {
        const catName = t(`categories.categoryNames.${c.id}`) || c.name;
        return catName.toLowerCase().includes(q) || 
               c.name.toLowerCase().includes(q) || 
               c.description.toLowerCase().includes(q);
      });

      if (filtered.length === 0) {
        gridContainer.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;" class="card">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--text-muted); margin: 0 auto 0.75rem;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <h3 style="color: var(--text-main); margin-bottom: 0.25rem;">${isSv ? 'Inga kategorier matchar din sökning' : 'No categories match your search'}</h3>
            <p style="font-size: 0.875rem; color: var(--text-muted);">${isSv ? 'Prova ett annat sökord' : 'Try a different keyword'}</p>
          </div>
        `;
        return;
      }

      gridContainer.innerHTML = filtered.map(cat => {
        const stats = categoryStats[cat.id] || { total: 4, completed: 0 };
        const total = stats.total || 4;
        const completed = stats.completed || 0;
        const rate = Utils.calcCompletionRate(completed, total);
        const localizedName = t(`categories.categoryNames.${cat.id}`);
        const catDisplayName = (localizedName && !localizedName.startsWith('categories.')) ? localizedName : cat.name;

        let statusText = isSv ? 'Godkänd' : 'Compliant';
        let badgeClass = 'badge-completed';
        if (rate === 0) {
          statusText = t('categories.unassessed');
          badgeClass = 'badge-unassessed';
        } else if (rate < 80) {
          statusText = isSv ? 'Kräver åtgärd' : 'Needs Attention';
          badgeClass = 'badge-partial';
        }

        return `
          <div class="card card-hover" style="display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                <div style="width: 44px; height: 44px; border-radius: var(--radius-md); background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center;">
                  ${getCategoryIcon(cat.id)}
                </div>
                <span class="badge ${badgeClass}"><span class="badge-dot"></span>${statusText}</span>
              </div>

              <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.35rem;">${Utils.escapeHtml(catDisplayName)}</h3>
              <p style="font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 1rem;">
                ${Utils.escapeHtml(cat.description)}
              </p>
            </div>

            <div>
              <div style="background: var(--bg-subtle); padding: 0.75rem; border-radius: var(--radius-md); margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.35rem;">
                  <span>${t('checklist.page1Title')} ${t('categories.progress')}</span>
                  <span><strong>${completed}/${total}</strong> ${t('status.completed')} (${rate}%)</span>
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar-fill ${rate >= 80 ? 'success' : (rate > 0 ? 'warning' : '')}" style="width: ${rate}%;"></div>
                </div>
              </div>

              <div style="display: flex; gap: 0.5rem;">
                ${currentInspection ? `
                  <a href="#checklist/${currentInspection.id}?cat=${cat.id}" class="btn btn-outline-primary btn-sm btn-block">
                    ${isSv ? 'Inspektera i aktiv revision' : 'Inspect in Active Audit'} &rarr;
                  </a>
                ` : `
                  <a href="#inspections" class="btn btn-secondary btn-sm btn-block">
                    ${isSv ? 'Välj inspektion' : 'Select Inspection'}
                  </a>
                `}
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    renderCategoryCards();

    searchInput.addEventListener('input', (e) => {
      renderCategoryCards(e.target.value);
    });
  }
};
