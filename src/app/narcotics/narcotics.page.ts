import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReportService } from '../services/report.service';
import { NarcoticEntry, NursingReport } from '../models/report.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-narcotics',
  templateUrl: './narcotics.page.html',
  styleUrls: ['./narcotics.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class NarcoticsPage implements OnInit, OnDestroy {
  narcoticsForm!: FormGroup;
  narcoticsRequired = false;
  private destroy$ = new Subject<void>();
  private currentNarcoticsAdministered = false;

  narcoticOptions: string[] = [
    'Morphine',
    'Fentanyl',
    'Ketamine',
    'Midazolam',
    'Lorazepam',
    'Hydromorphone',
    'Oxycodone',
    'Diazepam'
  ];

  dosageUnits: string[] = ['mg', 'mcg', 'g', 'mL', 'units', 'oz'];

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

  private totalEntries = 5;

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
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

  ionViewWillEnter() {
    this.loadLatestReport();
  }

  ngOnDestroy() {
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

    for (let i = 0; i < this.totalEntries; i++) {
      this.entries.push(this.createEntry());
    }
  }

  createEntry(data?: Partial<NarcoticEntry>): FormGroup {
    return this.fb.group({
      narcoticName: [data?.narcoticName || ''],
      dosageUnit: [data?.dosageUnit || ''],
      timeZ: [data?.timeZ || ''],
      rnName: [data?.rnName || ''],
      rnSignature: [data?.rnSignature || '']
    });
  }

  async loadLatestReport() {
    const report = await this.reportService.getLatestReport();
    if (!report) {
      return;
    }

    this.entries.clear();
    const entriesFromReport = (report.narcotics || []).slice(0, this.totalEntries);
    while (entriesFromReport.length < this.totalEntries) {
      entriesFromReport.push({
        narcoticName: '',
        dosageUnit: '',
        timeZ: '',
        rnName: '',
        rnSignature: ''
      });
    }

    entriesFromReport.forEach(entry => this.entries.push(this.createEntry(entry)));

    this.currentNarcoticsAdministered = report.narcRecordStatus === 'Administered';
    this.applyRequiredNarcotic(this.currentNarcoticsAdministered);
    this.reportService.setHasNarcoticSelection(this.hasAnyNarcoticSelection());
  }

  applyRequiredNarcotic(isRequired: boolean) {
    const firstEntry = this.entries.at(0) as FormGroup | undefined;
    const narcoticControl = firstEntry?.get('narcoticName');
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
      const narcoticName = control.get('narcoticName')?.value || '';
      return narcoticName.trim().length > 0;
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
}
