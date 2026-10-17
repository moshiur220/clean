# CleanInspect — Cleaning Inspection & Quality Control

> A mobile-first, enterprise-grade Quality Assurance & Cleaning Inspection web application designed for commercial cleaning contractors, facility managers, and QA auditors.

![CleanInspect Logo](assets/logo.svg)

---

## 📋 Overview

**CleanInspect** enables inspectors to audit offices, hotels, restaurants, and commercial facilities directly from mobile devices or desktop workstations. It provides an end-to-end audit workflow from scheduling to checklist execution, photo evidence capture, compliance scoring, and formal A4 PDF report generation.

All data, photos, and inspection state are stored and processed entirely in the browser using **HTML5**, **CSS3**, **Vanilla ES6+ JavaScript**, **localStorage**, and **IndexedDB**. **No backend server, API, or build step is required.**

---

## 🚀 Quick Start / How to Run

Because CleanInspect is built purely as a static web application:

### Option 1: Direct File Opening
Double-click `index.html` or open it directly in any modern web browser (Chrome, Safari, Firefox, Edge).

### Option 2: Local HTTP Server (Recommended)
Using Python:
```bash
python3 -m http.server 8080
```
Then navigate to: `http://localhost:8080`

Using Node `npx`:
```bash
npx serve .
```

---

## 🔑 Demo Login Credentials

The application includes pre-configured demo credentials:

- **Email**: `admin@gmail.com`
- **Password**: `12345`
- **Role**: David Wilson (Lead Quality Inspector & QA Administrator)

*(A convenient **"Auto-fill"** button is also available directly on the login card).*

---

## 📱 Implemented Screens (All 17 Screens)

| # | Screen | Description |
|---|---|---|
| **1** | **Login** | Secure demo login with show/hide password toggle, input validation, auto-fill hint, and session persistence. |
| **2** | **Dashboard** | Dynamic metrics (Total, Pending, In-Progress, Completed), active audit quick-continue card, and assigned inspection lists. |
| **3** | **Categories** | 8 standard commercial cleaning facility categories with progress bars, live search, and quick audit triggers. |
| **4** | **Inspection List** | Search by client/location/ref, filter by status (All, Pending, In Progress, Completed), sort by date/score, desktop table and mobile card views. Plus "Schedule New Inspection" dialog. |
| **5** | **Inspection Details** | Complete audit specifications, client address, completion rate scorecard, category scope overview, and status actions. |
| **6** | **Checklist Page 1** | Inspection execution with category filter tabs, progress bar, 3-status buttons (*Completed [Green]*, *Partially Completed [Amber]*, *Not Completed [Red]*), inline comments, and photo attachment. |
| **7** | **Checklist Page 2 (Issues & Evidence)** | Dedicated non-compliance & photo evidence documentation page. Surfaces Partial and Failed items first, supports camera capture hints (`accept="image/*" capture="environment"`), image compression, and thumbnail galleries. |
| **8** | **Checklist Item Detail** | Reusable deep-editing modal dialog for any task: compliance status, observations, photo upload/removal, and persistence. |
| **9** | **Summary** | Overall compliance rate, category breakdown bars, list of reported deficiencies, and warning banner for unassessed items. |
| **10** | **Review & Submit** | Final verification screen, observation and corrective action editor, inspector attestation declaration, and submission confirmation. |
| **11** | **Inspection Completed** | Celebration milestone card with submission timestamp, compliance score, deficiency count, and quick report/PDF links. |
| **12** | **Reports List** | Search and filter formal reports across facilities, view, print, or download PDF. |
| **13** | **Detailed Inspection Report** | **Highest-priority screen**: Full scrollable inspection audit document featuring Header, Overview (Section A), Category Matrix (Section B) with expand/collapse accordions, Full Checklist Detail (Section C), Non-Compliances & Evidence (Section D), Remediation Plan (Section E), and Attestation Sign-off (Section F). Includes filters, lightbox photo zooming, print, and share. |
| **14** | **PDF Preview & Export** | High-resolution A4 PDF generation via `html2pdf.js` / `jsPDF` + `html2canvas` preserving all photos, badges, and headers, with print stylesheet fallback. |
| **15** | **Issues List** | Cross-facility deficiency tracker with search, priority filters (High, Medium, Low), and lifecycle status filter. |
| **16** | **Issue Details** | 6-stage lifecycle stepper (`Reported` → `Under Review` → `Assigned` → `In Progress` → `Resolved` → `Verified/Closed`), priority updater, and resolution dispatch notes editor. |
| **17** | **Profile & Settings** | Inspector profile, auto-save toggle, storage metrics monitor, Reset Demo Data with confirmation modal, and sign out. |

---

## 💾 Local Data Storage & Integrity Rules

1. **Storage Keys**:
   - `cleaninspect:session` — Active user demo session
   - `cleaninspect:inspections` — Inspections array with checklist items, comments, and photo references
   - `cleaninspect:categories` — 8 facility cleaning standard definitions
   - `cleaninspect:issues` — Cross-facility issue tracking records
   - `cleaninspect:settings` — User preferences
   - `cleaninspect:version` — Storage schema versioning
2. **IndexedDB (`CleanInspectDB`)**:
   - High-resolution photo blobs and Data URLs are stored in IndexedDB object store `photos` to prevent exceeding localStorage size limits.
3. **Data Integrity & Compliance Formula**:
   $$\text{Compliance Rate (\%)} = \frac{\text{Completed Items}}{\text{Total Items}} \times 100$$
   - Partial and Failed items do **not** count as completed.
   - Unassessed items are never omitted and count against the final compliance percentage.
   - Inspections are never marked "Passed" automatically based only on percentage.

---

## ⚠️ Limitations & Notes

- **Static Prototype**: CleanInspect operates entirely on the client side. Data is stored in your current browser's `localStorage` and `IndexedDB`. Clearing browser site data will reset the application.
- **Demo Authentication**: The login mechanism is a static demonstration and is not connected to a remote OAuth or backend identity provider.
- **Camera Support**: Camera capture depends on device hardware and browser capabilities (`capture="environment"` hint).
