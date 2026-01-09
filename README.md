# Vighter Flight Nursing Report App

A tablet-optimized mobile application designed for **Vighter** to digitize the flight nursing report process. Built with modern web technologies, this app provides a touch-friendly interface for nurses to document missions, flight logistics, and clinical narratives in environments with intermittent connectivity.

## 🚀 Technical Stack

- **Framework:** [Angular](https://angular.dev/) (Standalone Components)
- **Mobile Engine:** [Ionic Framework](https://ionicframework.com/) (Capacitor)
- **UI Components:** [Angular Material 3](https://material.angular.io/)
- **PDF Generation:** [pdfmake](http://pdfmake.org/)
- **Digital Signatures:** [signature_pad](https://github.com/szimek/signature_pad)
- **Data Persistence:** Offline-ready service layer (Structured for SQLite integration)

## ✨ Key Features

- **Mission & Crew Documentation:** Capture essential flight details, crew information, and site stops.
- **Flight Logistics:** Integrated logic for standard and RON (Remain Over Night) flight times in Zulu time.
- **Safety Protocols:** Pre-flight checklists (MEB, MEK, O2, AED) and safety briefing confirmations.
- **Clinical Narrative Log:** Dynamic log with automatic local timestamping for clinical observations.
- **Dual Signature Support:** Digital signature pads for both 1st and 2nd ICE Flight RNs.
- **Instant PDF Export:** Generate professional, branded PDF reports directly from the tablet.
- **Tablet-First UI:** A clean, high-contrast Material 3 interface optimized for touch interaction and field use.

## 🛠️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Ionic CLI](https://ionicframework.com/docs/cli) (`npm install -g @ionic/cli`)

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/jorosco55/condor-nursing-report.git
   cd condor-nursing-report
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Run the application in development mode:
   ```bash
   ionic serve
   ```

## 📱 Tablet Optimization

- **Orientation Support:** Designed for landscape tablet use with a full keyboard layout.
- **Responsive Layout:** Adaptive "paper-on-desk" UI for maximum field readability.
- **Touch Targets:** Large, accessible inputs and buttons for clinical environments.

## 📄 Development Status

The application is currently in its initial build-out phase, utilizing a modern **Standalone Component** architecture for optimal performance and maintainability. The persistence layer is ready for full SQLite integration to support mission-critical offline clinical data.

---
*Developed by ShadowOwl and Friday.*
