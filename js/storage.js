/**
 * CleanInspect - Local Storage & IndexedDB Module
 * js/storage.js
 */

const STORAGE_KEYS = {
  SESSION: 'cleaninspect:session',
  INSPECTIONS: 'cleaninspect:inspections',
  CATEGORIES: 'cleaninspect:categories',
  ISSUES: 'cleaninspect:issues',
  SETTINGS: 'cleaninspect:settings',
  VERSION: 'cleaninspect:version'
};

const CURRENT_STORAGE_VERSION = '1.1.0';

// IndexedDB configuration for Photo Storage
const IDB_NAME = 'CleanInspectDB';
const IDB_VERSION = 1;
const IDB_STORE_PHOTOS = 'photos';

class StorageService {
  constructor() {
    this.db = null;
    this.initIndexedDB();
  }

  /**
   * Initialize IndexedDB for high-capacity photo storage
   */
  async initIndexedDB() {
    if (!('indexedDB' in window)) {
      console.warn('IndexedDB not supported in this browser. Falling back to memory/local.');
      return;
    }

    return new Promise((resolve) => {
      const request = indexedDB.open(IDB_NAME, IDB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(IDB_STORE_PHOTOS)) {
          db.createObjectStore(IDB_STORE_PHOTOS, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        resolve(null);
      };
    });
  }

  /**
   * Save photo into IndexedDB
   */
  async savePhoto(photoId, dataUrl, meta = {}) {
    if (!this.db) {
      await this.initIndexedDB();
    }
    if (!this.db) {
      return photoId;
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction([IDB_STORE_PHOTOS], 'readwrite');
        const store = transaction.objectStore(IDB_STORE_PHOTOS);
        const record = {
          id: photoId,
          dataUrl: dataUrl,
          meta: meta,
          createdAt: new Date().toISOString()
        };
        const request = store.put(record);

        request.onsuccess = () => resolve(photoId);
        request.onerror = (e) => reject(e.target.error);
      } catch (err) {
        console.error('Error saving photo to IndexedDB:', err);
        resolve(photoId);
      }
    });
  }

  /**
   * Retrieve photo from IndexedDB
   */
  async getPhoto(photoId) {
    if (!this.db) {
      await this.initIndexedDB();
    }
    if (!this.db) return null;

    return new Promise((resolve) => {
      try {
        const transaction = this.db.transaction([IDB_STORE_PHOTOS], 'readonly');
        const store = transaction.objectStore(IDB_STORE_PHOTOS);
        const request = store.get(photoId);

        request.onsuccess = () => {
          resolve(request.result ? request.result.dataUrl : null);
        };
        request.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  /**
   * Delete photo from IndexedDB
   */
  async deletePhoto(photoId) {
    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const transaction = this.db.transaction([IDB_STORE_PHOTOS], 'readwrite');
        const store = transaction.objectStore(IDB_STORE_PHOTOS);
        const request = store.delete(photoId);
        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  /* ========================================================================
     Safe localStorage CRUD Helpers
     ======================================================================== */
  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null || item === undefined) return defaultValue;
      return JSON.parse(item);
    } catch (err) {
      console.error(`Error parsing localStorage key "${key}":`, err);
      return defaultValue;
    }
  }

  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      if (err.name === 'QuotaExceededError' || err.code === 22) {
        Utils.showToast('Storage quota exceeded. Some data could not be saved locally.', 'danger');
      }
      console.error(`Error setting localStorage key "${key}":`, err);
      return false;
    }
  }

  removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (err) {
      console.error(`Error removing localStorage key "${key}":`, err);
      return false;
    }
  }

  /* ========================================================================
     Session Management
     ======================================================================== */
  getSession() {
    return this.getItem(STORAGE_KEYS.SESSION, null);
  }

  saveSession(sessionData) {
    return this.setItem(STORAGE_KEYS.SESSION, sessionData);
  }

  clearSession() {
    return this.removeItem(STORAGE_KEYS.SESSION);
  }

  /* ========================================================================
     Inspections Management
     ======================================================================== */
  getInspections() {
    return this.getItem(STORAGE_KEYS.INSPECTIONS, []);
  }

  getInspectionById(id) {
    const list = this.getInspections();
    return list.find(item => item.id === id) || null;
  }

  saveInspection(inspection) {
    const list = this.getInspections();
    const index = list.findIndex(item => item.id === inspection.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...inspection, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({
        ...inspection,
        createdAt: inspection.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    this.setItem(STORAGE_KEYS.INSPECTIONS, list);
    return inspection;
  }

  deleteInspection(id) {
    let list = this.getInspections();
    list = list.filter(item => item.id !== id);
    this.setItem(STORAGE_KEYS.INSPECTIONS, list);
    return true;
  }

  /**
   * Recalculates stats for an inspection based on checklist items
   */
  recalculateInspectionStats(inspection) {
    let total = 0;
    let completed = 0;
    let partial = 0;
    let notCompleted = 0;
    let unassessed = 0;
    let issuesCount = 0;

    if (Array.isArray(inspection.items)) {
      total = inspection.items.length;
      inspection.items.forEach(item => {
        const s = (item.status || 'unassessed').toLowerCase();
        if (s === 'completed') {
          completed++;
        } else if (s === 'partial') {
          partial++;
          issuesCount++;
        } else if (s === 'not_completed') {
          notCompleted++;
          issuesCount++;
        } else {
          unassessed++;
        }
      });
    }

    const completionRate = Utils.calcCompletionRate(completed, total);

    inspection.totalItems = total;
    inspection.completedItems = completed;
    inspection.partialItems = partial;
    inspection.notCompletedItems = notCompleted;
    inspection.unassessedItems = unassessed;
    inspection.completionRate = completionRate;
    inspection.issuesCount = issuesCount;

    return inspection;
  }

  /* ========================================================================
     Categories Management
     ======================================================================== */
  getCategories() {
    return this.getItem(STORAGE_KEYS.CATEGORIES, []);
  }

  saveCategories(categories) {
    return this.setItem(STORAGE_KEYS.CATEGORIES, categories);
  }

  /* ========================================================================
     Issues Management
     ======================================================================== */
  getIssues() {
    return this.getItem(STORAGE_KEYS.ISSUES, []);
  }

  getIssueById(id) {
    const list = this.getIssues();
    return list.find(item => item.id === id) || null;
  }

  saveIssue(issue) {
    const list = this.getIssues();
    const index = list.findIndex(item => item.id === issue.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...issue, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({
        ...issue,
        createdAt: issue.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    this.setItem(STORAGE_KEYS.ISSUES, list);
    return issue;
  }

  deleteIssue(id) {
    let list = this.getIssues();
    list = list.filter(item => item.id !== id);
    this.setItem(STORAGE_KEYS.ISSUES, list);
    return true;
  }

  /* ========================================================================
     Settings
     ======================================================================== */
  getSettings() {
    return this.getItem(STORAGE_KEYS.SETTINGS, {
      theme: 'light',
      companyName: 'CleanInspect Quality Control',
      inspectorName: 'David Wilson',
      inspectorEmail: 'admin@gmail.com',
      autoSave: true
    });
  }

  saveSettings(settings) {
    return this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  /* ========================================================================
     Storage Version & Reset
     ======================================================================== */
  initStorage() {
    const version = this.getItem(STORAGE_KEYS.VERSION);
    const existingInspections = this.getItem(STORAGE_KEYS.INSPECTIONS);
    
    // Seed initial data if not present or version upgrade
    if (!existingInspections || existingInspections.length === 0 || version !== CURRENT_STORAGE_VERSION) {
      this.resetDemoData();
    }
  }

  resetDemoData() {
    if (typeof SeedData !== 'undefined') {
      this.setItem(STORAGE_KEYS.INSPECTIONS, SeedData.getInspections());
      this.setItem(STORAGE_KEYS.CATEGORIES, SeedData.getCategories());
      this.setItem(STORAGE_KEYS.ISSUES, SeedData.getIssues());
      this.setItem(STORAGE_KEYS.SETTINGS, SeedData.getSettings());
      this.setItem(STORAGE_KEYS.VERSION, CURRENT_STORAGE_VERSION);
    }
  }
}

// Global singleton
const Storage = new StorageService();
