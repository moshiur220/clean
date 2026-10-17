/**
 * CleanInspect - Utilities & Helper Functions
 * js/utils.js
 */

const Utils = {
  /**
   * Format a date string to a human-readable format e.g. "Oct 17, 2026"
   */
  formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const locale = (typeof I18n !== 'undefined' && I18n.currentLang === 'sv') ? 'sv-SE' : 'en-US';
      return date.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  },

  /**
   * Format date and time e.g. "Oct 17, 2026 at 09:30 AM"
   */
  formatDateTime(dateStr) {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const locale = (typeof I18n !== 'undefined' && I18n.currentLang === 'sv') ? 'sv-SE' : 'en-US';
      return date.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  },

  /**
   * Format time only e.g. "09:30 AM"
   */
  formatTime(dateStr) {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const locale = (typeof I18n !== 'undefined' && I18n.currentLang === 'sv') ? 'sv-SE' : 'en-US';
      return date.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  },

  /**
   * Calculate completion percentage: completed / total * 100
   * Partial and failed items do NOT count as completed per data integrity rules.
   */
  calcCompletionRate(completed, total) {
    if (!total || total <= 0) return 0;
    const rate = (completed / total) * 100;
    return Math.round(rate * 10) / 10; // Round to 1 decimal
  },

  /**
   * Generate status badge HTML
   */
  getStatusBadge(status) {
    const s = (status || '').toLowerCase().replace(/[\s-]/g, '_');
    const t = (k, fallback) => (typeof I18n !== 'undefined' ? I18n.t(k) : fallback);
    switch (s) {
      case 'completed':
      case 'resolved':
      case 'verified':
      case 'verified_closed':
      case 'verified/closed':
        return `<span class="badge badge-completed"><span class="badge-dot"></span>${t('status.completed', 'Completed')}</span>`;
      case 'partial':
        return `<span class="badge badge-partial"><span class="badge-dot"></span>${t('status.partial', 'Partial')}</span>`;
      case 'in_progress':
      case 'in-progress':
        return `<span class="badge badge-partial"><span class="badge-dot"></span>${t('status.in_progress', 'In Progress')}</span>`;
      case 'not_completed':
        return `<span class="badge badge-not-completed"><span class="badge-dot"></span>${t('status.not_completed', 'Not Completed')}</span>`;
      case 'reported':
        return `<span class="badge badge-reported"><span class="badge-dot"></span>${t('status.reported', 'Reported')}</span>`;
      case 'under_review':
        return `<span class="badge badge-under-review"><span class="badge-dot"></span>${t('status.under_review', 'Under Review')}</span>`;
      case 'assigned':
        return `<span class="badge badge-assigned"><span class="badge-dot"></span>${t('status.assigned', 'Assigned')}</span>`;
      case 'pending':
      case 'scheduled':
        return `<span class="badge badge-pending"><span class="badge-dot"></span>${t('status.pending', 'Pending')}</span>`;
      default:
        return `<span class="badge badge-unassessed"><span class="badge-dot"></span>${t('status.unassessed', 'Unassessed')}</span>`;
    }
  },

  /**
   * Generate priority badge HTML
   */
  getPriorityBadge(priority) {
    const p = (priority || 'medium').toLowerCase();
    const isSv = typeof I18n !== 'undefined' && I18n.currentLang === 'sv';
    switch (p) {
      case 'high':
        return `<span class="badge badge-high"><span class="badge-dot"></span>${isSv ? 'Hög prioritet' : 'High Priority'}</span>`;
      case 'medium':
        return `<span class="badge badge-medium"><span class="badge-dot"></span>${isSv ? 'Medel prioritet' : 'Medium Priority'}</span>`;
      case 'low':
        return `<span class="badge badge-low"><span class="badge-dot"></span>${isSv ? 'Låg prioritet' : 'Low Priority'}</span>`;
      default:
        return `<span class="badge badge-medium"><span class="badge-dot"></span>${priority}</span>`;
    }
  },

  /**
   * Unique ID Generator with prefix
   */
  generateId(prefix = 'id') {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
  },

  /**
   * Display a floating Toast notification
   */
  showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>`;
    } else if (type === 'danger') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    } else if (type === 'warning') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    } else {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `
      <div style="display:flex; align-items:center; gap:0.5rem;">
        ${iconSvg}
        <span>${Utils.escapeHtml(message)}</span>
      </div>
      <button style="background:none; border:none; color:#fff; cursor:pointer; opacity:0.8; font-size:16px; padding:2px;" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  },

  /**
   * Compress image client-side to keep performance snappy and storage footprint small
   */
  compressImage(file, maxDimension = 1000, quality = 0.75) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Open Lightbox Photo Viewer
   */
  openLightbox(imgSrc, caption = '') {
    let modal = document.getElementById('lightbox-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'lightbox-modal';
      modal.className = 'lightbox-modal';
      modal.innerHTML = `
        <button class="lightbox-close" onclick="Utils.closeLightbox()">&times;</button>
        <img class="lightbox-img" src="" alt="Enlarged photo preview" />
        <div class="lightbox-caption"></div>
      `;
      modal.addEventListener('click', (e) => {
        if (e.target === modal) Utils.closeLightbox();
      });
      document.body.appendChild(modal);
    }

    const img = modal.querySelector('.lightbox-img');
    const captionEl = modal.querySelector('.lightbox-caption');
    img.src = imgSrc;
    captionEl.textContent = caption;
    modal.classList.add('active');
  },

  /**
   * Close Lightbox Photo Viewer
   */
  closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  },

  /**
   * Share report using Web Share API or copy to clipboard fallback
   */
  async shareReport(title, text, url) {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        Utils.showToast('Report shared successfully!', 'success');
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      }
    }

    // Fallback: copy link to clipboard
    try {
      await navigator.clipboard.writeText(url || window.location.href);
      Utils.showToast('Report link copied to clipboard!', 'info');
    } catch {
      Utils.showToast('Unable to share. Please copy the browser address bar.', 'warning');
    }
  }
};
