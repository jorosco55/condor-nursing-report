import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, AbstractControl, ValidationErrors } from '@angular/forms';
import { IonicModule, ToastController, IonContent } from '@ionic/angular';
import { TuiButton, TuiDataListDirective, TuiTextfieldComponent, TuiTextfieldDirective, TuiCalendar } from '@taiga-ui/core';
import { TuiCheckbox, TuiDataListWrapperComponent, TuiNativeSelect, TuiSelectDirective, TuiTextarea, TuiInputDate } from '@taiga-ui/kit';
import { TuiDay } from '@taiga-ui/cdk';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';
import { ReportService } from '../services/report.service';
import { DelayEntry, DoorEvent, NarrativeNote, NursingReport, WheelsEvent } from '../models/report.model';

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
  | 'delayTimeL';

type PreflightControl =
  | 'preflightMEBCheck'
  | 'preflightMEKO2AED'
  | 'safetyBriefingCompleted'
  | 'seatBeltsSecured';

type PreflightTimeControl =
  | 'preflightMEBCheckTime'
  | 'preflightMEKO2AEDTime'
  | 'safetyBriefingCompletedTime'
  | 'seatBeltsSecuredTime';

type PaxCountControl =
  | 'paxTotal'
  | 'paxFemales'
  | 'paxFemaleNotPregnantConfirmed'
  | 'paxMale'
  | 'paxMinors'
  | 'paxWithMedications'
  | 'paxNeeding72HrAssessment';

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
    TuiTextfieldComponent,
    TuiTextfieldDirective,
    TuiSelectDirective,
    TuiDataListDirective,
    TuiDataListWrapperComponent,
    TuiNativeSelect,
    TuiTextarea,
    TuiCheckbox,
    TuiButton,
    TuiInputDate,
    TuiCalendar
  ]
})
export class HomePage implements OnInit, OnDestroy {
  reportForm!: FormGroup;

  narcRecordNaChecked = false;
  narcRecordAdminChecked = false;
  medRecordNaChecked = false;
  medRecordAdminChecked = false;

  // Keyboard state
  isKeyboardVisible = false;
  keyboardHeight = 0;

  // RN dropdown list with dummy data
  rnList: string[] = [];

  visibleFlightRns = 2;
  readonly maxFlightRns = 5;

  wheelsSiteOptions: string[] = ['IWA', 'ELP', 'ALX', 'HRL'];
  transferOfCareSites: string[] = ['IWA', 'ELP', 'ALX', 'HRL'];
  siteStopsOptions: string[] = ['IWA', 'ELP', 'ALX', 'HRL'];
  delayOptions: string[] = [
    'Flight Crew',
    'Mechanical',
    'Ground delay R/t ICE',
    'Weather delay',
    'GEO delay',
    'PAX Emergency delay',
    'Vighter Flight delay',
    'Fueling delay',
    'Gate hold',
    'Air traffic control hold',
    'Crew change',
    'Medical review'
  ];

  @ViewChild(IonContent, { static: false }) content!: IonContent;

  // Touch interaction state
  private touchStartY: number = 0;
  private touchStartTime: number = 0;
  private scrollVelocity: number = 0;

  // Calendar state
  hoveredItem: TuiDay | null = null;

  private fb = inject(FormBuilder);
  private reportService = inject(ReportService);
  private toastCtrl = inject(ToastController);

  onHoveredItemChange(day: TuiDay | null): void {
    this.hoveredItem = day;
  }

  ngOnInit() {
    this.rnList = this.reportService.rnList;
    this.initForm();
    this.bindPreflightChecks();
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
      date: [TuiDay.fromLocalNativeDate(new Date()), Validators.required],
      site: ['', Validators.required],
      iceFlightRN: ['', Validators.required],
      secondICEFlightRN: [''],
      thirdICEFlightRN: [''],
      fourthICEFlightRN: [''],
      fifthICEFlightRN: [''],
      tailNumber: ['', Validators.required],
      missionNumber: ['', Validators.required],
      siteStops: [''],
      foicTitle: [''],
      asoLead: [''],
      preflightMEBCheck: [false],
      preflightMEBCheckTime: [''],
      preflightMEKO2AED: [false],
      preflightMEKO2AEDTime: [''],
      safetyBriefingCompleted: [false],
      safetyBriefingCompletedTime: [''],
      seatBeltsSecured: [false],
      seatBeltsSecuredTime: [''],
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
      wheelsUpEvents: this.fb.array([]),
      wheelsDownEvents: this.fb.array([]),
      doorEvents: this.fb.array([]),

      reportStatus: ['Open'],

      showtimeZ2: ['', [this.timeHHMMValidator]], // RON
      blockTimeZ2: ['', [this.timeHHMMValidator]], // RON
      endTimeZ2: ['', [this.timeHHMMValidator]], // RON
      ronUsed: [false],
      ronStartDate: [''],
      ronEndDate: [''],

      // Narrative
      notes: this.fb.array([])
      ,
      // Transfer of Care
      transferOfCareSite: [''],
      receivedCare: [false],
      transferOfCareComment: [''],


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
      const reportDate = report.date ? new Date(report.date) : new Date();
      this.reportForm.patchValue({
        ...report,
        date: Number.isNaN(reportDate.getTime()) ? null : TuiDay.fromLocalNativeDate(reportDate),
        ronStartDate: this.formatDateInput(report.ronStartDate),
        ronEndDate: this.formatDateInput(report.ronEndDate),
        delayReasons: normalizedDelay
      }, { emitEvent: false });
      this.syncVisibleFlightRns(report);
      this.reportService.setNarcRecordStatus(report.narcRecordStatus || '');
      this.reportService.setMedicationRecordStatus(report.medicationRecordStatus || '');
      this.syncStatusCheckboxes(report.narcRecordStatus || '', report.medicationRecordStatus || '');
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
      while (this.doorEvents.length !== 0) {
        this.doorEvents.removeAt(0);
      }
      const doorEvents = this.normalizeDoorEvents(report);
      doorEvents.forEach((event: DoorEvent) => {
        this.doorEvents.push(this.buildDoorEventGroup(event));
      });
      while (this.wheelsUpEvents.length !== 0) {
        this.wheelsUpEvents.removeAt(0);
      }
      this.normalizeWheelsEvents(report.wheelsUpEvents, report.wheelsUpSite, report.wheelsUpTimeL, report.wheelsUpTime)
        .forEach(event => this.wheelsUpEvents.push(this.buildWheelsEventGroup(event)));
      while (this.wheelsDownEvents.length !== 0) {
        this.wheelsDownEvents.removeAt(0);
      }
      this.normalizeWheelsEvents(report.wheelsDownEvents, report.wheelsDownSite, report.wheelsDownTimeL, report.wheelsDownTime)
        .forEach(event => this.wheelsDownEvents.push(this.buildWheelsEventGroup(event)));
    } else {
      this.addNote();
    }
  }

  private bindPreflightChecks() {
    this.reportForm.get('preflightMEBCheck')?.valueChanges.subscribe(value =>
      this.onPreflightCheckChange('preflightMEBCheck', 'preflightMEBCheckTime', 'Preflight MEB Check', !!value)
    );
    this.reportForm.get('preflightMEKO2AED')?.valueChanges.subscribe(value =>
      this.onPreflightCheckChange('preflightMEKO2AED', 'preflightMEKO2AEDTime', 'Preflight MEK, O2 Tanks, AED', !!value)
    );
    this.reportForm.get('safetyBriefingCompleted')?.valueChanges.subscribe(value =>
      this.onPreflightCheckChange('safetyBriefingCompleted', 'safetyBriefingCompletedTime', 'Safety Briefing Completed', !!value)
    );
    this.reportForm.get('seatBeltsSecured')?.valueChanges.subscribe(value =>
      this.onPreflightCheckChange('seatBeltsSecured', 'seatBeltsSecuredTime', 'Seat Belts Secured Per ASO', !!value)
    );
  }

  private syncStatusCheckboxes(narcStatus: string, medStatus: string) {
    this.narcRecordNaChecked = narcStatus === 'N/A';
    this.narcRecordAdminChecked = narcStatus === 'Administered';
    this.medRecordNaChecked = medStatus === 'N/A';
    this.medRecordAdminChecked = medStatus === 'Administered';
  }

  addFlightRn() {
    if (this.visibleFlightRns < this.maxFlightRns) {
      this.visibleFlightRns += 1;
    }
  }

  private syncVisibleFlightRns(report: Partial<NursingReport>) {
    if (report.fifthICEFlightRN) {
      this.visibleFlightRns = 5;
      return;
    }
    if (report.fourthICEFlightRN) {
      this.visibleFlightRns = 4;
      return;
    }
    if (report.thirdICEFlightRN) {
      this.visibleFlightRns = 3;
      return;
    }
    this.visibleFlightRns = 2;
  }

  get notes() {
    return this.reportForm.get('notes') as FormArray;
  }

  get delayEntries() {
    return this.reportForm.get('delayEntries') as FormArray;
  }

  get doorEvents() {
    return this.reportForm.get('doorEvents') as FormArray;
  }

  get wheelsUpEvents() {
    return this.reportForm.get('wheelsUpEvents') as FormArray;
  }

  get wheelsDownEvents() {
    return this.reportForm.get('wheelsDownEvents') as FormArray;
  }

  updatePaxCount(controlName: PaxCountControl, delta: number) {
    const control = this.reportForm.get(controlName);
    if (!control) return;
    const current = Number(control.value ?? 0);
    const normalized = Number.isFinite(current) ? current : 0;
    const nextValue = Math.max(0, normalized + delta);
    control.setValue(nextValue);
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

  addDoorEvent(type: 'Close' | 'Open') {
    const timestamp = new Date().toISOString();
    this.doorEvents.push(this.buildDoorEventGroup({
      type,
      timestamp
    }));
    this.addDoorEventNarrative(type, timestamp);
  }

  addWheelsUpEvent() {
    const event = this.buildWheelsEventFromControls('wheelsUpSite', 'wheelsUpTimeL', 'wheelsUpTime');
    if (!event) return;
    this.wheelsUpEvents.push(this.buildWheelsEventGroup(event));
    this.reportForm.get('wheelsUpSite')?.setValue('');
    this.reportForm.get('wheelsUpTimeL')?.setValue('');
    this.reportForm.get('wheelsUpTime')?.setValue('');
  }

  addWheelsDownEvent() {
    const event = this.buildWheelsEventFromControls('wheelsDownSite', 'wheelsDownTimeL', 'wheelsDownTime');
    if (!event) return;
    this.wheelsDownEvents.push(this.buildWheelsEventGroup(event));
    this.reportForm.get('wheelsDownSite')?.setValue('');
    this.reportForm.get('wheelsDownTimeL')?.setValue('');
    this.reportForm.get('wheelsDownTime')?.setValue('');
  }

  removeDoorEvent(index: number) {
    this.doorEvents.removeAt(index);
  }

  removeWheelsUpEvent(index: number) {
    this.wheelsUpEvents.removeAt(index);
  }

  removeWheelsDownEvent(index: number) {
    this.wheelsDownEvents.removeAt(index);
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

  buildDoorEventGroup(event?: DoorEvent) {
    return this.fb.group({
      type: [event?.type || 'Close'],
      timestamp: [event?.timestamp || new Date().toISOString()]
    });
  }

  buildWheelsEventGroup(event?: WheelsEvent) {
    return this.fb.group({
      site: [event?.site || ''],
      timeL: [event?.timeL || '', [this.timeHHMMValidator]],
      timeZ: [event?.timeZ || '', [this.timeHHMMValidator]]
    });
  }

  normalizeWheelsEvents(events: WheelsEvent[] | undefined, site?: string, timeL?: string, timeZ?: string): WheelsEvent[] {
    if (Array.isArray(events) && events.length > 0) {
      return events;
    }
    const trimmedSite = (site || '').toString().trim();
    const trimmedTimeL = (timeL || '').toString().trim();
    const trimmedTimeZ = (timeZ || '').toString().trim();
    if (!trimmedSite && !trimmedTimeL && !trimmedTimeZ) {
      return [];
    }
    return [{
      site: trimmedSite,
      timeL: trimmedTimeL,
      timeZ: trimmedTimeZ
    }];
  }

  buildWheelsEventFromControls(siteControl: string, timeLControl: string, timeZControl: string): WheelsEvent | null {
    const site = (this.reportForm.get(siteControl)?.value || '').toString().trim();
    let timeL = (this.reportForm.get(timeLControl)?.value || '').toString().trim();
    let timeZ = (this.reportForm.get(timeZControl)?.value || '').toString().trim();
    if (!timeL && !timeZ && !site) {
      return null;
    }
    if (!timeL && !timeZ) {
      timeL = this.getCurrentTimestamp();
    }
    timeL = this.normalizeTimeValue(timeL);
    timeZ = timeZ ? this.normalizeTimeValue(timeZ) : '';
    return {
      site,
      timeL,
      timeZ
    };
  }

  addDoorEventNarrative(type: 'Close' | 'Open', timestamp: string) {
    const timeL = this.formatTimeFromIso(timestamp);
    const note: NarrativeNote = {
      timeL,
      rn: '',
      note: `Door ${type} @ ${timeL}`
    };
    this.notes.push(this.buildNoteGroup(note));
  }

  formatTimeFromIso(timestamp: string): string {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
      return this.getCurrentTimestamp();
    }
    return date.getHours().toString().padStart(2, '0') + date.getMinutes().toString().padStart(2, '0');
  }

  normalizeDoorEvents(report: Partial<NursingReport>): DoorEvent[] {
    if (Array.isArray(report.doorEvents) && report.doorEvents.length > 0) {
      return report.doorEvents.filter((event): event is DoorEvent => !!event?.timestamp);
    }
    const events: DoorEvent[] = [];
    const closeEvent = this.buildDoorEventFromTime('Close', report.doorsCloseTime, report.date);
    if (closeEvent) events.push(closeEvent);
    const openEvent = this.buildDoorEventFromTime('Open', report.doorsOpenTime, report.date);
    if (openEvent) events.push(openEvent);
    return events;
  }

  buildDoorEventFromTime(type: 'Close' | 'Open', timeValue?: string, reportDate?: string): DoorEvent | null {
    const trimmed = (timeValue || '').toString().trim();
    if (!trimmed) return null;
    const normalized = this.normalizeTimeValue(trimmed);
    const baseDate = reportDate ? new Date(reportDate) : new Date();
    const date = Number.isNaN(baseDate.getTime()) ? new Date() : new Date(baseDate);
    if (/^\d{4}$/.test(normalized)) {
      const hours = Number(normalized.slice(0, 2));
      const minutes = Number(normalized.slice(2));
      date.setHours(hours, minutes, 0, 0);
    }
    return { type, timestamp: date.toISOString() };
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

  stampTimeOnFocus(controlName: ReportTimeControl) {
    const control = this.reportForm.get(controlName);
    if (!control) return;
    const currentValue = (control.value || '').toString().trim();
    if (currentValue) return;
    control.setValue(this.getCurrentTimestamp());
  }

  stampNoteTimeOnFocus(index: number) {
    const control = this.notes.at(index)?.get('timeL');
    if (!control) return;
    const currentValue = (control.value || '').toString().trim();
    if (currentValue) return;
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
  }

  // Helper to get current timestamp in HHMM format
  getCurrentTimestamp(): string {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');
  }


  onNarcRecordChange(checked: boolean, status: 'N/A' | 'Administered') {
    const control = this.reportForm.get('narcRecordStatus');
    if (!control) return;
    if (checked) {
      control.setValue(status);
    } else if (control.value === status) {
      control.setValue('');
    }
    this.narcRecordNaChecked = control.value === 'N/A';
    this.narcRecordAdminChecked = control.value === 'Administered';
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
    this.medRecordNaChecked = control.value === 'N/A';
    this.medRecordAdminChecked = control.value === 'Administered';
    this.reportService.setMedicationRecordStatus(control.value || '');
  }

  onPreflightCheckChange(
    controlName: PreflightControl,
    timeControlName: PreflightTimeControl,
    label: string,
    checked: boolean
  ) {
    const timeControl = this.reportForm.get(timeControlName);
    if (!timeControl) return;
    if (checked) {
      const timestamp = this.getCurrentTimestamp();
      timeControl.setValue(timestamp);
      this.addPreflightNarrative(label, timestamp);
    } else {
      timeControl.setValue('');
    }
  }

  private formatDateInput(value: string | Date | null | undefined): string {
    if (!value) return '';
    const date = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  addPreflightNarrative(label: string, timestamp: string) {
    const note: NarrativeNote = {
      timeL: timestamp,
      rn: '',
      note: `${label} @ ${timestamp}`
    };
    this.notes.push(this.buildNoteGroup(note));
  }

  async onSubmit() {
    if (this.reportForm.valid) {
      const existingReport = await this.reportService.getLatestReport();
      const dateValue = this.reportForm.value.date;
      const serializedDate = dateValue && typeof dateValue.toLocalNativeDate === 'function' 
        ? dateValue.toLocalNativeDate().toISOString() 
        : dateValue;

      const reportPayload = {
        ...(existingReport || {}),
        ...this.reportForm.value,
        date: serializedDate,
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
