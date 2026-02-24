import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, AbstractControl, ValidationErrors } from '@angular/forms';
import { IonicModule, ToastController, IonContent, GestureController } from '@ionic/angular';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatMenuModule } from '@angular/material/menu';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';
import { ReportService } from '../services/report.service';
import { DelayEntry, NarrativeNote } from '../models/report.model';

type ReportTimeControl =
  | 'showtimeZ1'
  | 'blockTimeZ1'
  | 'endTimeZ1'
  | 'showtimeZ2'
  | 'blockTimeZ2'
  | 'endTimeZ2'
  | 'wheelsUpTimeL'
  | 'wheelsDownTimeL'
  | 'wheelsUpTime'
  | 'wheelsDownTime'
  | 'doorsCloseTime'
  | 'doorsOpenTime'
  | 'delayTimeL';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSelectModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatMenuModule
  ]
})
export class HomePage implements OnInit, OnDestroy {
  reportForm!: FormGroup;

  // Keyboard state
  isKeyboardVisible = false;
  keyboardHeight = 0;

  // RN dropdown list with dummy data
  rnList: string[] = [
    'Sarah Johnson, RN',
    'Michael Chen, RN',
    'Emily Rodriguez, RN',
    'James Williams, RN',
    'Maria Garcia, RN',
    'David Brown, RN',
    'Jennifer Martinez, RN',
    'Robert Taylor, RN',
    'Lisa Anderson, RN',
    'Christopher Lee, RN'
  ];

  wheelsSiteOptions: string[] = ['IWA', 'ELP', 'ALX', 'HRL'];
  transferOfCareSites: string[] = ['IWA', 'ELP', 'ALX', 'HRL'];
  delayOptions: string[] = [
    'Flight Crew',
    'Mechanical',
    'Ground delay R/t ICE',
    'Weather delay',
    'GEO delay',
    'PAX Emergency delay',
    'Vighter Flight delay'
  ];

  // PAX tags array (PAX#1 to PAX#50) for slash command
  paxTags: string[] = Array.from({ length: 50 }, (_, i) => `PAX#${i + 1}`);

  // Generic drug list for /DRUG command
  genericDrugs: string[] = [
    'Acetaminophen',
    'Albuterol',
    'Amiodarone',
    'Aspirin',
    'Atropine',
    'Dextrose 50%',
    'Diphenhydramine',
    'Epinephrine',
    'Fentanyl',
    'Furosemide',
    'Glucagon',
    'Heparin',
    'Hydrocortisone',
    'Ibuprofen',
    'Ketamine',
    'Lidocaine',
    'Lorazepam',
    'Magnesium Sulfate',
    'Methylprednisolone',
    'Midazolam',
    'Morphine',
    'Naloxone',
    'Nitroglycerin',
    'Norepinephrine',
    'Ondansetron',
    'Oxygen',
    'Potassium Chloride',
    'Prednisone',
    'Propofol',
    'Rocuronium',
    'Sodium Bicarbonate',
    'Succinylcholine',
    'Vasopressin'
  ];

  // Slash command state
  showSlashMenu: boolean[] = [];
  slashCommandFilter: string = '';
  filteredPaxTags: string[] = [];
  filteredDrugs: string[] = [];
  activeNoteIndex: number | null = null;
  slashCommandPosition: { top: number; left: number } = { top: 0, left: 0 };
  activeMenuType: 'pax' | 'drug' | null = null;

  // Available slash commands
  slashCommands = [
    { command: '/PAX', description: 'Insert passenger reference (PAX#1-50)' },
    { command: '/DRUG', description: 'Insert generic drug name' },
    { command: '/WU', description: 'Insert Wheels Up with timestamp' },
    { command: '/WD', description: 'Insert Wheels Down with timestamp' }
  ];
  showCommandList: boolean[] = [];
  filteredCommands: typeof this.slashCommands = [];

  @ViewChildren('noteTextarea') noteTextareas!: QueryList<ElementRef>;
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;

  // Touch interaction state
  private touchStartY: number = 0;
  private touchStartTime: number = 0;
  private isTouchScrolling: boolean = false;
  private scrollVelocity: number = 0;

  private fb = inject(FormBuilder);
  private reportService = inject(ReportService);
  private toastCtrl = inject(ToastController);
  private gestureCtrl = inject(GestureController);

  ngOnInit() {
    this.initForm();
    this.loadLatestDraft();
    this.setupKeyboardListeners();
    this.enableTouchScrolling();
  }

  ngOnDestroy() {
    this.removeKeyboardListeners();
  }

  async setupKeyboardListeners() {
    // Only set up listeners on native platforms
    if (Capacitor.isNativePlatform()) {
      // Configure keyboard behavior
      await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
      await Keyboard.setScroll({ isDisabled: false });

      // Listen for keyboard show
      Keyboard.addListener('keyboardWillShow', (info) => {
        this.isKeyboardVisible = true;
        this.keyboardHeight = info.keyboardHeight;
        document.body.classList.add('keyboard-visible');
        document.documentElement.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
      });

      // Listen for keyboard hide
      Keyboard.addListener('keyboardWillHide', () => {
        this.isKeyboardVisible = false;
        this.keyboardHeight = 0;
        document.body.classList.remove('keyboard-visible');
        document.documentElement.style.setProperty('--keyboard-height', '0px');
      });
    }
  }

  async removeKeyboardListeners() {
    if (Capacitor.isNativePlatform()) {
      await Keyboard.removeAllListeners();
    }
  }

  initForm() {
    this.reportForm = this.fb.group({
      id: [null],
      date: [new Date().toISOString(), Validators.required],
      site: ['', Validators.required],
      iceFlightRN: ['', Validators.required],
      secondICEFlightRN: [''],
      tailNumber: ['', Validators.required],
      missionNumber: ['', Validators.required],
      siteStops: [''],
      foicTitle: [''],
      asoLead: [''],
      preflightMEBCheck: [false],
      preflightMEKO2AED: [false],
      safetyBriefingCompleted: [false],
      seatBeltsSecured: [false],
      narcRecordStatus: [''],
      medicationRecordStatus: [''],

      // Logistics
      showtimeZ1: ['', [this.timeHHMMValidator]],
      blockTimeZ1: ['', [this.timeHHMMValidator]],
      endTimeZ1: ['', [this.timeHHMMValidator]],

      wheelsUpSite: [''],
      wheelsUpTimeL: ['', [this.timeHHMMValidator]],
      wheelsUpTime: ['', [this.timeHHMMValidator]],
      wheelsDownSite: [''],
      wheelsDownTimeL: ['', [this.timeHHMMValidator]],
      wheelsDownTime: ['', [this.timeHHMMValidator]],
      doorsCloseTime: ['', [this.timeHHMMValidator]],
      doorsOpenTime: ['', [this.timeHHMMValidator]],

      reportStatus: ['Open'],

      showtimeZ2: ['', [this.timeHHMMValidator]], // RON
      blockTimeZ2: ['', [this.timeHHMMValidator]], // RON
      endTimeZ2: ['', [this.timeHHMMValidator]], // RON
      ronUsed: [false],

      // Narrative
      notes: this.fb.array([])
      ,
      // Transfer of Care
      transferOfCareSite: [''],
      receivedCare: [false],


      // Cleared Medical with FOIC
      clearedMedicalWithFoic: [false],
      paxTotal: [null],
      paxFemales: [null],
      paxFemaleNotPregnantConfirmed: [null],
      paxMale: [null],
      paxMinors: [null],
      paxWithMedications: [null],
      paxNeeding72HrAssessment: [null],

      // Operational
      allPaxSafelyOnboarded: [false],
      allPaxGivenFoodWaterLavBreaks: [false],

      // Delay
      delayReasons: [''],
      delayEntries: this.fb.array([]),
      delayTimeL: ['', [this.timeHHMMValidator]],

      // Special Circumstances
      specialCircumstancePaxWrapped: [false],
      specialCircumstanceMedicalComplaintAssessed: [false],
      specialCircumstanceMedicalControlContacted: [false],
      specialCircumstanceSiteSupervisorAdvised: [false],
      specialCircumstanceMedicalEmergencyOnboardEms: [false],
      specialCircumstanceViolentIncident: [false]
    });

  }

  async loadLatestDraft() {
    const report = await this.reportService.getLatestReport();
    if (report) {
      const normalizedDelay = Array.isArray((report as unknown as { delayReasons?: string[] }).delayReasons)
        ? ((report as unknown as { delayReasons?: string[] }).delayReasons || [])[0] || ''
        : (report.delayReasons || '');
      this.reportForm.patchValue({
        ...report,
        delayReasons: normalizedDelay
      });
      this.reportService.setNarcRecordStatus(report.narcRecordStatus || '');
      this.reportService.setMedicationRecordStatus(report.medicationRecordStatus || '');
      // Clear notes array and rebuild
      while (this.notes.length !== 0) {
        this.notes.removeAt(0);
      }
      report.notes.forEach((note: NarrativeNote) => {
        this.notes.push(this.buildNoteGroup(note));
      });
      while (this.delayEntries.length !== 0) {
        this.delayEntries.removeAt(0);
      }
      (report.delayEntries || []).forEach((entry: DelayEntry) => {
        this.delayEntries.push(this.fb.group({
          timeL: [entry.timeL, [this.timeHHMMValidator]],
          reasons: [entry.reasons || []]
        }));
      });
    } else {
      this.addNote();
    }
  }

  get notes() {
    return this.reportForm.get('notes') as FormArray;
  }

  get delayEntries() {
    return this.reportForm.get('delayEntries') as FormArray;
  }



  addNote() {
    this.notes.push(this.buildNoteGroup());
  }

  addDelayEntry() {
    const reason = (this.reportForm.get('delayReasons')?.value || '').toString().trim();
    if (!reason) return;
    const timeControl = this.reportForm.get('delayTimeL');
    if (!timeControl || !timeControl.value) {
      timeControl?.setValue(this.getCurrentTimestamp());
    }
    const timeL = (this.reportForm.get('delayTimeL')?.value || '').toString().trim();
    this.delayEntries.push(this.fb.group({
      timeL: [timeL, [this.timeHHMMValidator]],
      reasons: [[reason]]
    }));
    this.reportForm.get('delayReasons')?.setValue('');
    this.reportForm.get('delayTimeL')?.setValue('');
  }

  removeDelayEntry(index: number) {
    this.delayEntries.removeAt(index);
  }

  buildNoteGroup(note?: NarrativeNote) {
    const timeL = note?.timeL || this.getCurrentTimestamp();
    return this.fb.group({
      timeL: [timeL, [this.timeHHMMValidator]],
      rn: [note?.rn || ''],
      note: [note?.note || '']
    });
  }

  timeHHMMValidator(control: AbstractControl): ValidationErrors | null {
    const value = (control.value || '').toString().trim();
    if (!value) return null;
    const isValid = /^([01]\d|2[0-3])[0-5]\d$/.test(value) || /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
    return isValid ? null : { invalidTime: true };
  }

  stampTime(controlName: ReportTimeControl) {
    const control = this.reportForm.get(controlName);
    if (!control) return;
    control.setValue(this.getCurrentTimestamp());
  }

  handleTimeBlur(controlName: ReportTimeControl) {
    const control = this.reportForm.get(controlName);
    if (!control) return;
    const rawValue = (control.value || '').toString().trim();
    if (!rawValue) {
      control.setValue(this.getCurrentTimestamp());
      return;
    }
    const normalized = this.normalizeTimeValue(rawValue);
    if (normalized !== rawValue) {
      control.setValue(normalized);
    }
  }

  normalizeTimeValue(value: string): string {
    if (/^\d{4}$/.test(value)) {
      return value;
    }
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
    if (match) {
      return `${match[1]}${match[2]}`;
    }
    return value;
  }

  openTimePicker(input: HTMLInputElement) {
    if (typeof input.showPicker === 'function') {
      input.showPicker();
    } else {
      input.focus();
    }
  }

  applyTimePicker(event: Event, controlName: ReportTimeControl) {
    const input = event.target as HTMLInputElement;
    const rawValue = (input.value || '').toString().trim();
    if (!rawValue) return;
    const normalized = this.normalizeTimeValue(rawValue);
    const control = this.reportForm.get(controlName);
    if (!control) return;
    control.setValue(normalized);
    control.markAsTouched();
  }


  stampNoteTime(noteIndex: number) {
    const control = this.notes.at(noteIndex).get('timeL');
    if (!control) return;
    control.setValue(this.getCurrentTimestamp());
  }

  handleNoteTimeBlur(noteIndex: number) {
    const control = this.notes.at(noteIndex).get('timeL');
    if (!control) return;
    const rawValue = (control.value || '').toString().trim();
    if (!rawValue) {
      control.setValue(this.getCurrentTimestamp());
      return;
    }
    const normalized = this.normalizeTimeValue(rawValue);
    if (normalized !== rawValue) {
      control.setValue(normalized);
    }
  }

  applyNoteTimePicker(event: Event, noteIndex: number) {
    const input = event.target as HTMLInputElement;
    const rawValue = (input.value || '').toString().trim();
    if (!rawValue) return;
    const normalized = this.normalizeTimeValue(rawValue);
    const control = this.notes.at(noteIndex).get('timeL');
    if (!control) return;
    control.setValue(normalized);
    control.markAsTouched();
  }


  removeNote(index: number) {
    this.notes.removeAt(index);
    // Also remove the corresponding slash menu state
    this.showSlashMenu.splice(index, 1);
    this.showCommandList.splice(index, 1);
  }

  // Slash command handling
  onNoteInput(event: Event, noteIndex: number) {
    const textarea = event.target as HTMLTextAreaElement;
    const value = textarea.value;
    const cursorPosition = textarea.selectionStart;

    // Find the last "/" before cursor
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');

    if (lastSlashIndex !== -1) {
      const textAfterSlash = textBeforeCursor.substring(lastSlashIndex);
      const upperTextAfterSlash = textAfterSlash.toUpperCase();

      // Check if we're typing a command (no space after the slash yet, unless filtering)
      if (!textAfterSlash.includes(' ') || upperTextAfterSlash.startsWith('/PAX#') || upperTextAfterSlash.startsWith('/DRUG ')) {
        this.activeNoteIndex = noteIndex;

        // Check if typing /PAX# for direct PAX selection with filter
        if (upperTextAfterSlash.startsWith('/PAX#')) {
          const paxFilter = textAfterSlash.substring(1); // Remove the leading /
          this.filteredPaxTags = this.paxTags.filter(pax =>
            pax.toUpperCase().startsWith(paxFilter.toUpperCase())
          );
          this.activeMenuType = 'pax';
          this.showSlashMenu[noteIndex] = this.filteredPaxTags.length > 0;
          this.showCommandList[noteIndex] = false;
        }
        // Check if typing /P, /PA, or /PAX to show PAX list (shortcut: just /P shows PAX)
        else if (upperTextAfterSlash.startsWith('/P') && '/PAX'.startsWith(upperTextAfterSlash)) {
          this.filteredPaxTags = this.paxTags;
          this.activeMenuType = 'pax';
          this.showSlashMenu[noteIndex] = true;
          this.showCommandList[noteIndex] = false;
        }
        // Check if typing /D, /DR, /DRU, or /DRUG to show drug list (shortcut: just /D shows drugs)
        else if (upperTextAfterSlash.startsWith('/D') && '/DRUG'.startsWith(upperTextAfterSlash)) {
          this.filteredDrugs = this.genericDrugs;
          this.activeMenuType = 'drug';
          this.showSlashMenu[noteIndex] = true;
          this.showCommandList[noteIndex] = false;
        }
        // Check if typing /DRUG with filter text after
        else if (upperTextAfterSlash.startsWith('/DRUG')) {
          // Filter drugs if user types more after /DRUG
          if (textAfterSlash.length > 5) {
            const drugFilter = textAfterSlash.substring(5).trim(); // Get text after "/DRUG"
            this.filteredDrugs = this.genericDrugs.filter(drug =>
              drug.toUpperCase().includes(drugFilter.toUpperCase())
            );
          } else {
            this.filteredDrugs = this.genericDrugs;
          }
          this.activeMenuType = 'drug';
          this.showSlashMenu[noteIndex] = this.filteredDrugs.length > 0;
          this.showCommandList[noteIndex] = false;
        }
        // Check if typing /W, /WU, or /WD - show command list filtered to wheels commands
        else if (upperTextAfterSlash.startsWith('/W')) {
          const filter = textAfterSlash.substring(1).toUpperCase();
          this.filteredCommands = this.slashCommands.filter(cmd =>
            cmd.command.toUpperCase().startsWith('/' + filter)
          );
          this.showCommandList[noteIndex] = this.filteredCommands.length > 0;
          this.showSlashMenu[noteIndex] = false;
          this.activeMenuType = null;
        }
        // Check if just typed / to show command list
        else if (textAfterSlash === '/') {
          this.filteredCommands = this.slashCommands;
          this.showCommandList[noteIndex] = true;
          this.showSlashMenu[noteIndex] = false;
          this.activeMenuType = null;
        }
        // Filter commands based on what's typed after /
        else {
          const filter = textAfterSlash.substring(1).toUpperCase();
          this.filteredCommands = this.slashCommands.filter(cmd =>
            cmd.command.toUpperCase().includes(filter)
          );
          this.showCommandList[noteIndex] = this.filteredCommands.length > 0;
          this.showSlashMenu[noteIndex] = false;
          this.activeMenuType = null;
        }
      } else {
        this.closeSlashMenus(noteIndex);
      }
    } else {
      this.closeSlashMenus(noteIndex);
    }
  }

  closeSlashMenus(noteIndex: number) {
    this.showSlashMenu[noteIndex] = false;
    this.showCommandList[noteIndex] = false;
  }

  selectCommand(command: string, noteIndex: number) {
    const noteControl = this.notes.at(noteIndex).get('note');
    if (!noteControl) return;

    const value = noteControl.value || '';
    const lastSlashIndex = value.lastIndexOf('/');

    if (command === '/PAX') {
      this.filteredPaxTags = this.paxTags;
      this.activeMenuType = 'pax';
      this.showSlashMenu[noteIndex] = true;
      this.showCommandList[noteIndex] = false;

      // Update the textarea to show /PAX
      if (lastSlashIndex !== -1) {
        const newValue = value.substring(0, lastSlashIndex) + '/PAX';
        noteControl.setValue(newValue);
      }
    } else if (command === '/DRUG') {
      this.filteredDrugs = this.genericDrugs;
      this.activeMenuType = 'drug';
      this.showSlashMenu[noteIndex] = true;
      this.showCommandList[noteIndex] = false;

      // Update the textarea to show /DRUG
      if (lastSlashIndex !== -1) {
        const newValue = value.substring(0, lastSlashIndex) + '/DRUG';
        noteControl.setValue(newValue);
      }
    } else if (command === '/WU') {
      // Insert "Wheels Up" with current timestamp
      const timestamp = this.getCurrentTimestamp();
      if (lastSlashIndex !== -1) {
        const newValue = value.substring(0, lastSlashIndex) + `Wheels Up @ ${timestamp} `;
        noteControl.setValue(newValue);
      }
      this.closeSlashMenus(noteIndex);
    } else if (command === '/WD') {
      // Insert "Wheels Down" with current timestamp
      const timestamp = this.getCurrentTimestamp();
      if (lastSlashIndex !== -1) {
        const newValue = value.substring(0, lastSlashIndex) + `Wheels Down @ ${timestamp} `;
        noteControl.setValue(newValue);
      }
      this.closeSlashMenus(noteIndex);
    }
  }

  // Helper to get current timestamp in HHMM format
  getCurrentTimestamp(): string {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');
  }

  selectDrug(drug: string, noteIndex: number) {
    const noteControl = this.notes.at(noteIndex).get('note');
    if (noteControl) {
      const value = noteControl.value || '';
      // Find and replace the /DRUG... command with the selected drug
      const lastSlashIndex = value.lastIndexOf('/');
      if (lastSlashIndex !== -1) {
        const newValue = value.substring(0, lastSlashIndex) + drug + ' ';
        noteControl.setValue(newValue);
      }
    }
    this.closeSlashMenus(noteIndex);
  }

  selectPaxTag(paxTag: string, noteIndex: number) {
    const noteControl = this.notes.at(noteIndex).get('note');
    if (noteControl) {
      const value = noteControl.value || '';
      // Find and replace the /PAX... command with the selected PAX tag
      const lastSlashIndex = value.lastIndexOf('/');
      if (lastSlashIndex !== -1) {
        const newValue = value.substring(0, lastSlashIndex) + paxTag + ' ';
        noteControl.setValue(newValue);
      }
    }
    this.closeSlashMenus(noteIndex);
  }

  onNoteFocus(noteIndex: number) {
    this.activeNoteIndex = noteIndex;
  }

  onNoteBlur(noteIndex: number) {
    // Delay closing to allow click on menu items
    setTimeout(() => {
      this.closeSlashMenus(noteIndex);
    }, 200);
  }

  onNarcRecordChange(checked: boolean, status: 'N/A' | 'Administered') {
    const control = this.reportForm.get('narcRecordStatus');
    if (!control) return;
    if (checked) {
      control.setValue(status);
    } else if (control.value === status) {
      control.setValue('');
    }
    this.reportService.setNarcRecordStatus(control.value || '');
  }

  onMedicationRecordChange(checked: boolean, status: 'N/A' | 'Administered') {
    const control = this.reportForm.get('medicationRecordStatus');
    if (!control) return;
    if (checked) {
      control.setValue(status);
    } else if (control.value === status) {
      control.setValue('');
    }
    this.reportService.setMedicationRecordStatus(control.value || '');
  }

  async onSubmit() {
    if (this.reportForm.valid) {
      const existingReport = await this.reportService.getLatestReport();
      const reportPayload = {
        ...(existingReport || {}),
        ...this.reportForm.value,
        narcotics: existingReport?.narcotics || [],
        paxMedicated: existingReport?.paxMedicated || []
      };
      await this.reportService.saveReport(reportPayload);
      const toast = await this.toastCtrl.create({
        message: 'Report draft saved successfully!',
        duration: 2000,
        color: 'success'
      });
      toast.present();
    } else {
      const toast = await this.toastCtrl.create({
        message: 'Please fill in all required fields.',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
    }
  }

  // Touch and scroll event handlers
  enableTouchScrolling() {
    // Enable smooth touch scrolling for the entire content
    if (this.content) {
      // Set scroll events to track momentum
      this.content.scrollEvents = true;
    }
  }

  onScroll(event: any) {
    // Track scroll events for momentum and smooth scrolling
    const currentTime = Date.now();
    const scrollTop = event.detail.scrollTop;
    
    // Calculate scroll velocity for momentum
    if (this.touchStartTime) {
      const timeDiff = currentTime - this.touchStartTime;
      if (timeDiff > 0) {
        this.scrollVelocity = (scrollTop - this.touchStartY) / timeDiff;
      }
    }
    
    this.touchStartY = scrollTop;
    this.touchStartTime = currentTime;
  }

  // Touch event handlers for dropdown menus
  onMenuTouchStart(event: TouchEvent) {
    this.isTouchScrolling = false;
    this.touchStartY = event.touches[0].clientY;
    this.touchStartTime = Date.now();
  }

  onMenuTouchEnd(event: TouchEvent) {
    const touchEndY = event.changedTouches[0].clientY;
    const touchDuration = Date.now() - this.touchStartTime;
    const touchDistance = Math.abs(touchEndY - this.touchStartY);

    // Determine if this was a scroll gesture (moved more than 10px) or a tap
    if (touchDistance > 10 || touchDuration > 300) {
      this.isTouchScrolling = true;
    }
  }

  onTouchSelectCommand(event: TouchEvent, command: string, noteIndex: number) {
    event.preventDefault();
    if (!this.isTouchScrolling) {
      this.selectCommand(command, noteIndex);
    }
  }

  onTouchSelectPaxTag(event: TouchEvent, paxTag: string, noteIndex: number) {
    event.preventDefault();
    if (!this.isTouchScrolling) {
      this.selectPaxTag(paxTag, noteIndex);
    }
  }

  onTouchSelectDrug(event: TouchEvent, drug: string, noteIndex: number) {
    event.preventDefault();
    if (!this.isTouchScrolling) {
      this.selectDrug(drug, noteIndex);
    }
  }

  // Scroll to a specific element (useful for keyboard interactions)
  async scrollToElement(element: HTMLElement) {
    if (this.content) {
      const yOffset = element.offsetTop - 100; // 100px offset for better visibility
      await this.content.scrollToPoint(0, yOffset, 300); // 300ms smooth animation
    }
  }

  // Scroll to top helper
  async scrollToTop() {
    if (this.content) {
      await this.content.scrollToTop(300);
    }
  }

  // Scroll to bottom helper
  async scrollToBottom() {
    if (this.content) {
      await this.content.scrollToBottom(300);
    }
  }
}
