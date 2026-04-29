import { Component, OnDestroy, OnInit, AfterViewInit, ViewChildren, QueryList, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { ToastController, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { timeOutline, closeCircleOutline } from 'ionicons/icons';
import { TuiButton } from '@taiga-ui/core';
import { ReportService } from '../services/report.service';
import { NarcoticEntry, NursingReport } from '../models/report.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import SignaturePad from 'signature_pad';

interface NarcoticFieldRow {
  key: keyof NarcoticEntry;
  labelLines: string[];
  rowClass?: string;
  fields: FormlyFieldConfig[];
}

@Component({
  selector: 'app-narcotics',
  templateUrl: './narcotics.page.html',
  styleUrls: ['./narcotics.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    FormlyModule,
    TuiButton
  ]
})
export class NarcoticsPage implements OnInit, AfterViewInit, OnDestroy {
  narcoticsForm!: FormGroup;
  narcoticsRequired = false;
  private destroy$ = new Subject<void>();
  private currentNarcoticsAdministered = false;
  
  // We will manage signature pads in a map keyed by pad ID to keep track of multiple canvases per entry
  private signaturePads = new Map<string, SignaturePad>();
  
  private signaturePadOptions = {
    minWidth: 1,
    maxWidth: 3,
    throttle: 0,
    velocityFilterWeight: 0.7,
    dotSize: 1.5,
    penColor: 'rgb(0, 0, 0)',
    backgroundColor: 'rgb(255, 255, 255)'
  };

  @ViewChildren('signatureCanvas') signatureCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;

  rnList: string[] = [];

  private minEntries = 1;

  topFieldRows: NarcoticFieldRow[] = [
    this.buildFieldRow('foicNameSiteMNum', ['FOIC name / Site / M#'], 'condor-text'),
    this.buildFieldRow('date', ['Date :'], 'condor-date'),
    this.buildFieldRow('flightNurseName', ['Flight Nurse name :'], 'condor-select', {
      placeholder: '-- Select RN --',
      options: []
    }),
    this.buildFieldRow('paxId', ['PAX ID# (A-number) :'], 'condor-text'),
    this.buildFieldRow('narcoticDescription', ['Narcotic Description :', '(Drug Name, mg, frequency)'], 'condor-textarea', {}, 'double-height'),
    this.buildFieldRow('amountReceived', ['Amount Received :'], 'condor-text', {
      placeholder: 'Quantity #'
    }),
    this.buildFieldRow('receivedFrom', ['Received from :', '(Name, badge #, facility name origination)'], 'condor-textarea', {}, 'double-height')
  ];

  bottomFieldRows: NarcoticFieldRow[] = [
    this.buildFieldRow('amountDispersedEnRoute', ['Amount dispersed en route (if any) :'], 'condor-text', {
      placeholder: 'Quantity #'
    }),
    this.buildFieldRow('amountRemaining', ['Amount remaining :'], 'condor-text', {
      placeholder: 'Quantity #'
    }),
    this.buildFieldRow('releasedTo', ['Released to:', '(Name, badge #, receiving facility or location name)'], 'condor-textarea', {}, 'double-height')
  ];

  private fb = inject(FormBuilder);
  private reportService = inject(ReportService);
  private toastCtrl = inject(ToastController);

  constructor() {
    addIcons({ timeOutline, closeCircleOutline });
  }

  ngOnInit() {
    this.rnList = this.reportService.rnList;
    this.setFieldOptions('flightNurseName', this.rnList);
    this.initForm();
    this.loadLatestReport();

    this.reportService.narcRecordStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.currentNarcoticsAdministered = status === 'Administered';
        this.applyRequiredNarcotic(this.currentNarcoticsAdministered);
      });

    this.narcoticsForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.reportService.setHasNarcoticSelection(this.hasAnyNarcoticSelection());
      });
  }

  ngAfterViewInit() {
    this.setupSignaturePads();
    this.signatureCanvases.changes
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.setupSignaturePads());
    window.addEventListener('resize', this.handleSignatureResize);
  }

  ionViewWillEnter() {
    this.loadLatestReport();
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.handleSignatureResize);
    this.destroy$.next();
    this.destroy$.complete();
  }

  get entries(): FormArray {
    return this.narcoticsForm.get('entries') as FormArray;
  }

  initForm() {
    this.narcoticsForm = this.fb.group({
      entries: this.fb.array([])
    });

    for (let i = 0; i < this.minEntries; i++) {
      this.entries.push(this.createEntry());
    }
  }

  getControlValue(index: number, controlName: string): string {
    return this.entries.at(index)?.get(controlName)?.value || '';
  }

  asFormGroup(control: unknown): FormGroup {
    return control as FormGroup;
  }

  isNarcoticAlertRow(row: NarcoticFieldRow): boolean {
    return row.key === 'narcoticDescription' && this.narcoticsRequired && !this.hasAnyNarcoticSelection();
  }

  private buildFieldRow(
    key: keyof NarcoticEntry,
    labelLines: string[],
    type: string,
    props: Record<string, unknown> = {},
    rowClass = ''
  ): NarcoticFieldRow {
    return {
      key,
      labelLines,
      rowClass,
      fields: [
        {
          key,
          type,
          props: {
            noBorder: true,
            ...props
          }
        }
      ]
    };
  }

  private setFieldOptions(key: keyof NarcoticEntry, options: string[]) {
    [...this.topFieldRows, ...this.bottomFieldRows]
      .filter(row => row.key === key)
      .forEach(row => {
        row.fields[0].props = {
          ...row.fields[0].props,
          options
        };
      });
  }

  setupSignaturePads() {
    const canvases = this.signatureCanvases?.toArray() ?? [];
    
    // Create new pads if missing
    canvases.forEach((canvasRef) => {
      const canvas = canvasRef.nativeElement;
      const padId = canvas.dataset['padId'];
      const index = parseInt(canvas.dataset['index'] || '0', 10);
      const controlName = canvas.dataset['controlName'] || '';
      
      if (!padId || !controlName) return;

      if (!this.signaturePads.has(padId)) {
        this.resizeSignatureCanvas(canvas);
        this.attachSignatureTouchHandlers(canvas);
        const pad = new SignaturePad(canvas, this.signaturePadOptions);
        
        const existingValue = this.entries.at(index)?.get(controlName)?.value;
        if (existingValue) {
          pad.fromDataURL(existingValue);
        }
        
        // Listeners
        (pad as unknown as { onEnd?: () => void }).onEnd = () => {
          const control = this.entries.at(index)?.get(controlName);
          if (!control) return;
          control.setValue(pad.isEmpty() ? '' : pad.toDataURL());
        };
        
        this.signaturePads.set(padId, pad);
      }
    });

    // Cleanup old pads
    const currentPadIds = canvases.map(c => c.nativeElement.dataset['padId']).filter(Boolean) as string[];
    for (const [padId, pad] of this.signaturePads.entries()) {
      if (!currentPadIds.includes(padId)) {
        pad.off();
        this.signaturePads.delete(padId);
      }
    }
  }

  clearSignature(padId: string, index: number, controlName: string) {
    const pad = this.signaturePads.get(padId);
    if (pad) {
      pad.clear();
    }
    this.entries.at(index)?.get(controlName)?.setValue('');
  }

  private handleSignatureResize = () => {
    this.signatureCanvases?.toArray().forEach(canvasRef => {
      const canvas = canvasRef.nativeElement;
      const padId = canvas.dataset['padId'];
      if (!padId) return;
      
      const pad = this.signaturePads.get(padId);
      if (!pad) return;

      const data = pad.isEmpty() ? '' : pad.toDataURL();
      this.resizeSignatureCanvas(canvas);
      pad.clear();
      if (data) {
        pad.fromDataURL(data);
      }
    });
  };

  private resizeSignatureCanvas(canvas: HTMLCanvasElement) {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    const context = canvas.getContext('2d');
    if (context) {
      context.scale(ratio, ratio);
    }
  }

  private attachSignatureTouchHandlers(canvas: HTMLCanvasElement) {
    if (canvas.dataset['signatureBound'] === 'true') return;
    canvas.addEventListener('touchstart', (event: TouchEvent) => {
      event.preventDefault();
    }, { passive: false });
    canvas.addEventListener('touchmove', (event: TouchEvent) => {
      event.preventDefault();
    }, { passive: false });
    canvas.style.touchAction = 'none';
    canvas.dataset['signatureBound'] = 'true';
  }

  createEntry(data?: Partial<NarcoticEntry>): FormGroup {
    return this.fb.group({
      foicNameSiteMNum: [data?.foicNameSiteMNum || ''],
      date: [data?.date || new Date().toISOString().split('T')[0]],
      flightNurseName: [data?.flightNurseName || ''],
      paxId: [data?.paxId || ''],
      narcoticDescription: [data?.narcoticDescription || ''],
      amountReceived: [data?.amountReceived || ''],
      receivedFrom: [data?.receivedFrom || ''],
      receivedFromSignature: [data?.receivedFromSignature || ''],
      amountDispersedEnRoute: [data?.amountDispersedEnRoute || ''],
      amountRemaining: [data?.amountRemaining || ''],
      releasedTo: [data?.releasedTo || ''],
      releasedToSignature: [data?.releasedToSignature || ''],
      flightNurseSignature: [data?.flightNurseSignature || '']
    });
  }

  async loadLatestReport() {
    const report = await this.reportService.getLatestReport();
    if (!report) {
      return;
    }

    this.entries.clear();
    const entriesFromReport = report.narcotics || [];
    while (entriesFromReport.length < this.minEntries) {
      entriesFromReport.push({
        foicNameSiteMNum: '',
        date: new Date().toISOString().split('T')[0],
        flightNurseName: '',
        paxId: '',
        narcoticDescription: '',
        amountReceived: '',
        receivedFrom: '',
        receivedFromSignature: '',
        amountDispersedEnRoute: '',
        amountRemaining: '',
        releasedTo: '',
        releasedToSignature: '',
        flightNurseSignature: ''
      });
    }

    entriesFromReport.forEach(entry => this.entries.push(this.createEntry(entry)));

    this.currentNarcoticsAdministered = report.narcRecordStatus === 'Administered';
    this.applyRequiredNarcotic(this.currentNarcoticsAdministered);
    this.reportService.setHasNarcoticSelection(this.hasAnyNarcoticSelection());
  }

  applyRequiredNarcotic(isRequired: boolean) {
    const firstEntry = this.entries.at(0) as FormGroup | undefined;
    const narcoticControl = firstEntry?.get('narcoticDescription');
    if (!narcoticControl) return;

    this.narcoticsRequired = isRequired;
    if (isRequired) {
      narcoticControl.setValidators([Validators.required]);
    } else {
      narcoticControl.clearValidators();
    }
    narcoticControl.updateValueAndValidity({ emitEvent: false });
  }

  hasAnyNarcoticSelection(): boolean {
    return this.entries.controls.some(control => {
      const narcoticDesc = control.get('narcoticDescription')?.value || '';
      return narcoticDesc.trim().length > 0;
    });
  }

  async saveNarcotics() {
    const report = await this.reportService.getLatestReport();
    if (!report) {
      const toast = await this.toastCtrl.create({
        message: 'Create a report first, then add narcotics.',
        duration: 2000,
        color: 'warning'
      });
      toast.present();
      return;
    }

    const updatedReport: NursingReport = {
      ...report,
      narcotics: this.entries.value as NarcoticEntry[]
    };

    await this.reportService.saveReport(updatedReport);
    const toast = await this.toastCtrl.create({
      message: 'Narcotics saved successfully!',
      duration: 2000,
      color: 'success'
    });
    toast.present();
  }

  addEntry() {
    this.entries.push(this.createEntry());
  }

  removeEntry(index: number) {
    if (index === 0) return;
    this.entries.removeAt(index);
  }
}
