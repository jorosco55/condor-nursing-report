# CLAUDE.md - AI Assistant Guide for Vighter Flight Nursing Report App

> **Last Updated:** 2026-01-09
> **Project:** Vighter Flight Nursing Report App
> **Type:** Ionic/Angular Mobile Application (Tablet-Optimized)

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technical Architecture](#technical-architecture)
3. [Directory Structure](#directory-structure)
4. [Key Files Reference](#key-files-reference)
5. [Coding Conventions](#coding-conventions)
6. [Development Workflows](#development-workflows)
7. [Data Models & Flow](#data-models--flow)
8. [Common Development Tasks](#common-development-tasks)
9. [Testing Strategy](#testing-strategy)
10. [Deployment & Build](#deployment--build)

---

## Project Overview

### Purpose
A tablet-optimized mobile application for **Vighter** to digitize the flight nursing report process. This app allows flight nurses to document missions, flight logistics, and clinical narratives in environments with intermittent connectivity.

### Target Platform
- **Primary Device:** Tablets (landscape orientation)
- **Primary Use Case:** Field/clinical environments with offline capability
- **Output:** Professional PDF reports with digital signatures

### Key Features
- Mission & crew documentation
- Flight logistics (including RON - Remain Over Night)
- Safety protocol checklists (MEB, MEK, O2, AED)
- Clinical narrative log with automatic timestamping
- Dual digital signature support
- Offline-first data persistence
- PDF export with branding

---

## Technical Architecture

### Core Stack
```
Framework:     Angular 20.x (Standalone Components)
Mobile Engine: Ionic Framework 8.x + Capacitor 8.x
UI Library:    Angular Material 3 (Material Design)
PDF Export:    pdfmake 0.3.x
Signatures:    signature_pad 5.x
State:         Reactive Forms (FormBuilder, FormArray)
Storage:       localStorage (ready for SQLite migration)
Language:      TypeScript 5.9.x
Build Tool:    Angular CLI
```

### Architecture Pattern
- **Standalone Component Architecture:** Modern Angular pattern (no NgModules in components)
- **Service-based Data Layer:** Centralized ReportService for data operations
- **Reactive Forms:** Complex form handling with dynamic FormArray for narrative notes
- **Tab-based Navigation:** Ionic tabs for multi-page workflow

### Module Architecture
```
app.module.ts (Root Module)
  ├── Standalone Pages (no modules)
  │   ├── HomePage (form input)
  │   ├── ExportPage (signatures & PDF)
  │   └── TabsPage (navigation)
  ├── Services (providedIn: 'root')
  │   └── ReportService
  └── Models
      └── NursingReport & NarrativeNote
```

---

## Directory Structure

```
condor-nursing-report/
├── src/
│   ├── app/
│   │   ├── home/                    # Main data entry page
│   │   │   ├── home.page.ts         # Reactive form logic
│   │   │   ├── home.page.html       # Form template (Material components)
│   │   │   └── home.page.scss       # Page-specific styles
│   │   ├── export/                  # Signature & PDF export page
│   │   │   ├── export.page.ts       # Signature pad & PDF generation
│   │   │   ├── export.page.html     # Canvas elements for signatures
│   │   │   └── export.page.scss     # Signature canvas styling
│   │   ├── tabs/                    # Tab navigation container
│   │   │   ├── tabs.page.ts         # Tab routing logic
│   │   │   ├── tabs.routes.ts       # Tab route configuration
│   │   │   └── tabs.page.html       # Ionic tab bar
│   │   ├── models/
│   │   │   └── report.model.ts      # NursingReport & NarrativeNote interfaces
│   │   ├── services/
│   │   │   └── report.service.ts    # Data persistence (localStorage)
│   │   ├── app.component.ts         # Root component (minimal)
│   │   ├── app.module.ts            # Root module
│   │   └── app-routing.module.ts    # Root routing config
│   ├── assets/
│   │   └── icon/                    # App icons
│   ├── theme/
│   │   └── variables.scss           # Ionic theme customization
│   ├── environments/
│   │   ├── environment.ts           # Dev environment config
│   │   └── environment.prod.ts      # Production config
│   ├── global.scss                  # Global styles
│   ├── index.html                   # Main HTML entry
│   └── main.ts                      # Angular bootstrap
├── capacitor.config.ts              # Capacitor configuration
├── angular.json                     # Angular CLI configuration
├── ionic.config.json                # Ionic CLI configuration
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript configuration
├── .eslintrc.json                   # ESLint rules
└── karma.conf.js                    # Karma test runner config
```

---

## Key Files Reference

### Critical Application Files

#### `src/app/models/report.model.ts`
**Purpose:** TypeScript interfaces for data structure
**Key Concepts:**
- `NursingReport`: Main report structure with mission data, logistics, narratives, signatures
- `NarrativeNote`: Individual timestamped clinical log entries
- All fields use specific types (string, boolean, string[] for notes)
- Signatures stored as Base64 strings
- Optional fields marked with `?` (id, signatures, dates)

#### `src/app/services/report.service.ts`
**Purpose:** Data persistence layer
**Current Implementation:** localStorage (JSON serialization)
**Future Migration:** Ready for SQLite via `@capacitor-community/sqlite`
**Key Methods:**
- `saveReport(report)`: Create or update report
- `getAllReports()`: Retrieve all stored reports
- `getLatestReport()`: Get most recent report (for draft loading)

**Important:** Uses `Date.now()` for auto-generated IDs

#### `src/app/home/home.page.ts`
**Purpose:** Main form for report data entry
**Architecture:**
- Reactive Forms with `FormBuilder`
- Dynamic `FormArray` for narrative notes
- Auto-timestamping for new notes (local time in HHMM format)
- Validators on required fields (date, site, nurses, tail#, mission#)
- Toast notifications for user feedback
- Loads latest draft on init

**Form Structure:**
```typescript
reportForm = {
  mission_fields: { ... },
  logistics_fields: { ... },
  safety_checklists: { ... },
  notes: FormArray [
    { timeL: string, note: string }
  ]
}
```

#### `src/app/export/export.page.ts`
**Purpose:** Digital signatures and PDF generation
**Key Dependencies:**
- `signature_pad`: Canvas-based signature capture
- `pdfmake`: Client-side PDF generation

**Canvas Management:**
- Two canvases for dual RN signatures
- Responsive canvas sizing with devicePixelRatio scaling
- Signatures saved as Base64 data URLs
- Integrated into report before PDF generation

**PDF Generation:**
- Company branding (header, contact info)
- Tabular mission data
- Narrative log table
- Embedded signature images with timestamps
- Auto-download with filename: `Nursing_Report_{missionNumber}.pdf`

---

## Coding Conventions

### TypeScript & Angular Standards

#### Strict TypeScript
```typescript
// tsconfig.json enforces:
"strict": true,
"noImplicitReturns": true,
"noFallthroughCasesInSwitch": true,
"noImplicitOverride": true
```

#### Component Naming
- Pages use `Page` suffix: `HomePage`, `ExportPage`
- Components use `Component` suffix (if created)
- Selectors use `app-` prefix: `<app-home>`, `<app-export>`

#### Standalone Components
```typescript
@Component({
  selector: 'app-example',
  standalone: true,  // No NgModule wrapper
  imports: [
    CommonModule,
    IonicModule,
    MatFormFieldModule,
    // Import all dependencies directly
  ]
})
```

#### Service Pattern
```typescript
@Injectable({
  providedIn: 'root'  // Singleton across app
})
export class ExampleService {
  // All services use async/await for consistency
  async saveData(data: any): Promise<void> { ... }
}
```

### ESLint Rules
- Component class suffix must be `Page` or `Component`
- Component selectors must be kebab-case
- Directive selectors must be camelCase
- Prefer standalone components (rule disabled for gradual migration)

### File Organization
- One component per file
- Co-locate templates/styles with component
- Models in `models/` directory
- Services in `services/` directory
- Shared utilities would go in `utils/` (create if needed)

### Import Order (Recommended)
```typescript
// 1. Angular core
import { Component, OnInit } from '@angular/core';
// 2. Angular modules
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// 3. Ionic
import { IonicModule } from '@ionic/angular';
// 4. Material
import { MatButtonModule } from '@angular/material/button';
// 5. Third-party
import SignaturePad from 'signature_pad';
// 6. Local services/models
import { ReportService } from '../services/report.service';
```

---

## Development Workflows

### Setup & Installation
```bash
# Prerequisites: Node.js LTS, Ionic CLI
npm install -g @ionic/cli

# Installation (requires legacy peer deps for Ionic 8)
npm install --legacy-peer-deps

# Development server (hot reload)
ionic serve
# OR
npm start

# Run on specific platform
ionic capacitor run android
ionic capacitor run ios
```

### Build Process
```bash
# Development build
npm run build
# or
ng build --configuration development

# Production build (minified, optimized)
npm run build --configuration production

# Output directory: www/
```

### Linting & Code Quality
```bash
# Run ESLint
npm run lint

# Auto-fix linting issues (use with caution)
ng lint --fix
```

### Testing
```bash
# Run unit tests (Karma + Jasmine)
npm test

# Run tests with coverage
ng test --code-coverage

# Run tests in CI mode (no watch)
ng test --watch=false
```

### Adding New Features

#### Creating a New Page
```bash
# Ionic generates standalone components by default
ionic generate page pages/my-new-page

# This creates:
# - src/app/pages/my-new-page/my-new-page.page.ts
# - src/app/pages/my-new-page/my-new-page.page.html
# - src/app/pages/my-new-page/my-new-page.page.scss
# - src/app/pages/my-new-page/my-new-page.page.spec.ts
```

#### Creating a Service
```bash
ionic generate service services/my-service

# Always use providedIn: 'root' for singleton services
```

#### Creating a Component
```bash
ionic generate component components/my-component
```

### Git Workflow
- **Development Branch Pattern:** `claude/claude-md-mk7avs2e9831l820-2st1j`
- **Commit Messages:** Descriptive, present tense ("Add feature" not "Added feature")
- **Push Command:** `git push -u origin <branch-name>`
- **Branch Naming:** Must start with `claude/` for CI/CD

---

## Data Models & Flow

### NursingReport Interface
```typescript
interface NursingReport {
  // Identity
  id?: number;                    // Auto-generated timestamp
  date: string;                   // ISO date string

  // Mission Info (required)
  site: string;
  iceFlightRN: string;
  secondICEFlightRN: string;      // Optional
  tailNumber: string;
  missionNumber: string;
  siteStops: string;

  // Personnel
  foicTitle: string;
  asoLead: string;

  // Safety Checklists
  preflightMEBCheck: boolean;
  preflightMEKO2AED: boolean;
  safetyBriefingCompleted: boolean;
  seatBeltsSecured: boolean;

  // Logistics (Zulu time)
  showtimeZ1: string;
  blockTimeZ1: string;
  endTimeZ1: string;

  // RON (Remain Over Night) flights
  showtimeZ2: string;
  blockTimeZ2: string;
  endTimeZ2: string;
  ronUsed: boolean;

  // Clinical
  narcRecord: string;
  notes: NarrativeNote[];

  // Signatures (Base64 images)
  rnSignature?: string;
  dateSigned?: string;            // ISO date string
  secondRnSignature?: string;
  secondDateSigned?: string;
}
```

### Data Flow

```
User Input (HomePage)
  ↓
FormBuilder → Reactive Form
  ↓
Validation (Validators.required)
  ↓
ReportService.saveReport()
  ↓
localStorage (JSON.stringify)
  ↓
[Future: SQLite migration]

Retrieval Flow:
localStorage.getItem()
  ↓
JSON.parse()
  ↓
ReportService.getLatestReport()
  ↓
Form patchValue() / PDF generation
```

### Timestamp Handling
- **Form Date:** ISO string from datepicker
- **Narrative Notes:** Local time in HHMM format (e.g., "1430")
- **Signatures:** ISO string on signature save
- **PDF Display:** `toLocaleDateString()` / `toLocaleString()`

---

## Common Development Tasks

### Task 1: Adding a New Form Field

**Steps:**
1. Update `src/app/models/report.model.ts`
   ```typescript
   export interface NursingReport {
     // ... existing fields
     myNewField: string;  // Add here
   }
   ```

2. Update `src/app/home/home.page.ts` → `initForm()`
   ```typescript
   this.reportForm = this.fb.group({
     // ... existing fields
     myNewField: ['', Validators.required],  // Add with validators
   });
   ```

3. Update `src/app/home/home.page.html`
   ```html
   <mat-form-field appearance="outline">
     <mat-label>My New Field</mat-label>
     <input matInput formControlName="myNewField">
   </mat-form-field>
   ```

4. Update PDF in `src/app/export/export.page.ts` → `generatePDF()`
   ```typescript
   [{ text: 'My New Field:', bold: true }, report.myNewField || 'N/A']
   ```

### Task 2: Migrating to SQLite

**Current State:** localStorage
**Target:** `@capacitor-community/sqlite` (already in package.json)

**Migration Steps:**
1. Create database schema matching `NursingReport` interface
2. Update `ReportService` methods to use SQLite queries
3. Add database initialization in `app.component.ts`
4. Implement migration script for existing localStorage data
5. Test on physical devices (SQLite requires native environment)

**Reference Files:**
- `src/app/services/report.service.ts` (update all methods)
- Package: `@capacitor-community/sqlite@^7.0.3`

### Task 3: Customizing PDF Layout

**File:** `src/app/export/export.page.ts` → `generatePDF()`

**Key Concepts:**
- pdfMake uses document definition objects
- Tables use `widths` array for column sizing
- Styles defined in `styles` object
- Images must be Base64 data URLs

**Example:**
```typescript
const docDefinition = {
  content: [
    { text: 'Header', style: 'header' },
    { table: { widths: ['*', '*'], body: [...] } }
  ],
  styles: {
    header: { fontSize: 18, bold: true }
  }
};
```

### Task 4: Adding Offline Sync

**Recommended Approach:**
1. Implement queue system for pending uploads
2. Use Capacitor Network plugin to detect connectivity
3. Add sync service with retry logic
4. Store sync state in SQLite
5. Add visual indicators for sync status

**New Files Needed:**
- `src/app/services/sync.service.ts`
- `src/app/services/network.service.ts`
- Update UI with sync status badges

### Task 5: Adding Validation Rules

**File:** `src/app/home/home.page.ts`

**Built-in Validators:**
```typescript
import { Validators } from '@angular/forms';

// Examples:
tailNumber: ['', [
  Validators.required,
  Validators.pattern(/^[A-Z0-9]+$/),  // Alphanumeric
  Validators.minLength(4)
]]
```

**Custom Validators:**
```typescript
function zuluTimeValidator(control: AbstractControl) {
  const value = control.value;
  if (!value) return null;
  const isValid = /^([01]\d|2[0-3])[0-5]\d$/.test(value);
  return isValid ? null : { invalidZuluTime: true };
}

// Use in form:
showtimeZ1: ['', [Validators.required, zuluTimeValidator]]
```

### Task 6: Customizing Material Theme

**File:** `src/theme/variables.scss`

**Current Theme:** Material 3 (based on imports in components)

**Customization:**
```scss
// Override Ionic CSS variables
:root {
  --ion-color-primary: #3f51b5;  // Custom brand color
  --ion-color-secondary: #ff4081;
}

// Or use Angular Material theming
@use '@angular/material' as mat;

$custom-theme: mat.define-theme((
  color: (
    theme-type: light,
    primary: mat.$azure-palette,
  ),
));
```

---

## Testing Strategy

### Unit Tests

**Framework:** Jasmine + Karma
**Location:** `*.spec.ts` files co-located with components

**Running Tests:**
```bash
npm test                    # Watch mode
ng test --watch=false       # Single run
ng test --code-coverage     # With coverage report
```

**Test Structure:**
```typescript
describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage]  // Standalone component
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.reportForm.get('date')?.value).toBeTruthy();
  });
});
```

### E2E Tests (Future)
- **Recommended:** Cypress or Playwright
- **Not Currently Configured**

### Testing Checklist for New Features
- [ ] Unit tests for new components/services
- [ ] Form validation tests
- [ ] Service method tests (mocked localStorage)
- [ ] Test on actual tablet devices
- [ ] Test offline functionality
- [ ] Test PDF generation with various data
- [ ] Test signature capture on touch devices

---

## Deployment & Build

### Build Configurations

**Development:**
```bash
ng build --configuration development
# Output: www/ (unminified, with source maps)
```

**Production:**
```bash
ng build --configuration production
# Output: www/ (minified, optimized, tree-shaken)
# File replacement: environment.ts → environment.prod.ts
```

### Bundle Size Limits
```json
{
  "maximumWarning": "2mb",
  "maximumError": "5mb"
}
```

### Capacitor Build (Native)

**iOS:**
```bash
ionic capacitor build ios
# Opens Xcode for signing and deployment
```

**Android:**
```bash
ionic capacitor build android
# Opens Android Studio for signing and deployment
```

**Sync Web Assets:**
```bash
ionic capacitor sync
# Copies www/ to native projects
```

### Environment Configuration

**Development (`environment.ts`):**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'  // Example
};
```

**Production (`environment.prod.ts`):**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.vighter.com'  // Example
};
```

### Pre-Deployment Checklist
- [ ] Run `npm run lint` - No errors
- [ ] Run `npm test` - All tests pass
- [ ] Test on physical tablet device
- [ ] Verify PDF generation works
- [ ] Verify signatures capture correctly
- [ ] Test offline persistence
- [ ] Check bundle size (< 5MB)
- [ ] Verify all environment variables set
- [ ] Update version in `package.json`
- [ ] Tag release in Git

---

## AI Assistant Guidelines

### When Working on This Codebase

#### Always Do:
1. **Read before editing:** Use Read tool on files before making changes
2. **Maintain standalone architecture:** Don't add NgModules to components
3. **Use async/await:** Match existing service patterns
4. **Test locally:** Run `ionic serve` to verify changes
5. **Follow TypeScript strict mode:** No implicit any, proper typing
6. **Use Material components:** Keep UI consistent with existing design
7. **Validate forms:** Add proper validators to new form fields
8. **Update all layers:** Model → Service → Component → Template → PDF
9. **Consider offline-first:** Remember data might be stale/unsynced
10. **Respect tablet UX:** Large touch targets, landscape layout

#### Never Do:
1. **Don't break strict typing:** Avoid `any` types
2. **Don't add NgModules to pages:** They're standalone components
3. **Don't forget legacy-peer-deps:** Required for npm install
4. **Don't skip form validation:** All inputs should validate
5. **Don't ignore existing patterns:** Match code style in the file
6. **Don't remove TODO comments:** Unless implementing the feature
7. **Don't commit node_modules:** Already in .gitignore
8. **Don't hardcode data:** Use service layer for all persistence
9. **Don't break PDF generation:** Test after any model changes
10. **Don't forget signatures:** They're critical for legal compliance

### Code Reading Strategy
1. Start with `README.md` for context
2. Review `src/app/models/report.model.ts` for data structure
3. Examine `src/app/services/report.service.ts` for business logic
4. Study component `.ts` files before templates
5. Check `package.json` for available dependencies

### Making Changes Safely
1. Read the file first with Read tool
2. Understand the current implementation
3. Make minimal, focused changes
4. Use Edit tool for surgical modifications
5. Verify TypeScript compiles: `ng build`
6. Test in browser: `ionic serve`
7. Run linter: `npm run lint`

### Common Pitfalls to Avoid
- **Forgetting to import Material modules** in standalone components
- **Mismatching form control names** between .ts and .html
- **Breaking reactive form structure** when adding dynamic fields
- **Not handling null/undefined** in PDF generation
- **Canvas sizing issues** for signatures on different devices
- **Timezone confusion** between Zulu (Z1/Z2) and Local (L) times

---

## Quick Reference

### Key Commands
```bash
# Development
ionic serve                    # Start dev server
npm start                      # Alternative start
npm run build                  # Build for production
npm test                       # Run tests
npm run lint                   # Run linter

# Capacitor
ionic capacitor sync           # Sync web assets to native
ionic capacitor run android    # Run on Android
ionic capacitor run ios        # Run on iOS
ionic capacitor build android  # Build Android APK

# Utility
ionic info                     # Show environment info
ng version                     # Show Angular version
npm outdated                   # Check for updates
```

### File Path Patterns
```
New Page:       src/app/[name]/[name].page.ts
New Service:    src/app/services/[name].service.ts
New Model:      src/app/models/[name].model.ts
New Component:  src/app/components/[name]/[name].component.ts
Assets:         src/assets/[subfolder]/[file]
Styles:         src/theme/variables.scss (global)
Config:         angular.json, ionic.config.json, capacitor.config.ts
```

### Import Aliases
No path aliases configured. Use relative imports:
```typescript
import { ReportService } from '../services/report.service';
import { NursingReport } from '../models/report.model';
```

### Environment Access
```typescript
import { environment } from '../environments/environment';

if (environment.production) {
  // Production-only logic
}
```

---

## Troubleshooting

### Common Issues

**Issue:** `npm install` fails
**Solution:** Use `npm install --legacy-peer-deps`

**Issue:** Ionic CLI not found
**Solution:** `npm install -g @ionic/cli`

**Issue:** Signature canvas not displaying
**Solution:** Check `ngAfterViewInit` lifecycle, canvas ref with `{ static: false }`

**Issue:** PDF not downloading
**Solution:** Verify `pdfmake.vfs` initialized before `createPdf()`

**Issue:** Form values not saving
**Solution:** Check `formControlName` matches form group keys exactly

**Issue:** TypeScript errors on strict mode
**Solution:** Add proper types, avoid `any`, handle null/undefined

**Issue:** Material components not rendering
**Solution:** Import module in component's `imports` array (standalone)

---

## Future Enhancements (Known TODOs)

Based on README and code analysis:

1. **SQLite Migration:** Move from localStorage to proper database
   - Package already installed: `@capacitor-community/sqlite@^7.0.3`
   - Update `ReportService` to use SQL queries
   - Add database schema versioning

2. **Offline Sync:** Two-way sync with backend server
   - Requires API endpoints
   - Queue system for pending uploads
   - Conflict resolution strategy

3. **Enhanced Validation:** More robust field validation
   - Zulu time format validators
   - Mission number format validation
   - Tail number verification

4. **Additional Exports:** Beyond PDF
   - CSV export for analytics
   - JSON export for data transfer
   - Email integration

5. **Advanced Features:**
   - Photo attachments via Camera API
   - Voice-to-text for narratives
   - Multi-language support
   - Template system for common missions

---

## Contact & Support

**Developers:** ShadowOwl and Friday
**GitHub:** https://github.com/jorosco55/condor-nursing-report
**Ionic Docs:** https://ionicframework.com/docs
**Angular Docs:** https://angular.dev
**Material Docs:** https://material.angular.io

---

*This document is maintained for AI assistants working on the Vighter Flight Nursing Report App. Keep it updated when making architectural changes.*
