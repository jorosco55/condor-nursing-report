# Architecture Rulebook

## Application Purpose

This application is designed strictly for **talent interfaces** - internal tools for flight nurses and support staff to complete digital nursing reports. The application is distributed as a **web-based Progressive Web App (PWA)**, allowing deployment without Apple App Store or Google Play Store review constraints.

## Distribution Model

- **Primary Delivery:** Web-based deployment (accessible via browser)
- **Distribution Channel:** Direct URL access (bypasses App Store review)
- **Rationale:** Eliminates platform review delays, enables rapid iteration

## Data Architecture

### Phase 1: Online-First (Current)
- Full read/write functionality when online
- Data persisted to backend API in real-time
- localStorage for draft/session persistence only

### Phase 2: Offline Read-Only (Planned - Future)
- Read-only access to previously synced data
- Offline capability for field use with intermittent connectivity
- Queue-based sync for offline changes (when reconnected)

## Technical Stack

- **Framework:** Ionic 8.x + Angular 20.x
- **Mobile Engine:** Capacitor 8.x
- **UI:** Angular Material 3
- **PDF Generation:** pdfmake 0.3.x
- **Signatures:** signature_pad 5.x

## API Integration

The application is architected to communicate with a backend API for data persistence. Configuration for backend endpoints should be stored in environment files.
