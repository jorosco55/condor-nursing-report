import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { TuiButton, TuiDataListDirective, TuiTextfieldComponent, TuiTextfieldDirective } from '@taiga-ui/core';
import { TuiCheckbox, TuiDataListWrapperComponent, TuiSelectDirective } from '@taiga-ui/kit';
import { ReportService } from '../services/report.service';
import { PaxMedicationEntry, NursingReport } from '../models/report.model';

@Component({
  selector: 'app-meds',
  templateUrl: './meds.page.html',
  styleUrls: ['./meds.page.scss'],
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
    TuiCheckbox,
    TuiButton
  ]
})
export class MedsPage implements OnInit {
  medsForm!: FormGroup;
  medsRequired = false;

  routeOptions: string[] = ['PO', 'IM', 'IV', 'IN', 'SQ', 'SL'];
  medicationOptions: string[] = [
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
  doseOptions: string[] = ['0.5', '1', '2', '5', '10', '20', '50', '100'];
  doseUnits: string[] = ['mg', 'mcg', 'g', 'mL', 'units', 'mEq', 'tab'];

  private fb = inject(FormBuilder);
  private reportService = inject(ReportService);
  private toastCtrl = inject(ToastController);

  ngOnInit() {
    this.initForm();
    this.loadLatestReport();

    this.reportService.medicationRecordStatus$
      .subscribe(status => {
        this.medsRequired = status === 'Administered';
      });

    this.medsForm.valueChanges
      .subscribe(() => {
        this.reportService.setHasMedsSelection(this.hasAnyMedsSelection());
      });
  }

  get paxMedicated(): FormArray {
    return this.medsForm.get('paxMedicated') as FormArray;
  }

  initForm() {
    this.medsForm = this.fb.group({
      paxMedicated: this.fb.array([])
    });
  }

  createPaxMedicatedEntry(data?: Partial<PaxMedicationEntry>): FormGroup {
    const group = this.fb.group({
      aNumber: [data?.aNumber || ''],
      medication: [data?.medication || ''],
      dose: [data?.dose || ''],
      doseUnit: [data?.doseUnit || ''],
      route: [data?.route || ''],
      prnGiven: [data?.prnGiven || false],
      vitalsNa: [data?.vitalsNa || false],
      bpSystolic: [data?.bpSystolic || ''],
      bpDiastolic: [data?.bpDiastolic || ''],
      hr: [data?.hr || ''],
      resp: [data?.resp || ''],
      temp: [data?.temp || ''],
      o2Sat: [data?.o2Sat || ''],
      ratePercent: [data?.ratePercent || ''],
      annotatedOnMtf: [data?.annotatedOnMtf || '']
    });

    group.get('vitalsNa')?.valueChanges.subscribe((isNa: boolean | null) => {
      if (isNa === true) {
        this.clearVitals(group);
      }
    });

    return group;
  }

  resetPaxMedicated(entries: PaxMedicationEntry[]) {
    while (this.paxMedicated.length !== 0) {
      this.paxMedicated.removeAt(0);
    }
    if (entries.length === 0) {
      this.addPaxMedicated();
      return;
    }
    entries.forEach(entry => this.paxMedicated.push(this.createPaxMedicatedEntry(entry)));
  }

  addPaxMedicated() {
    this.paxMedicated.push(this.createPaxMedicatedEntry());
  }

  removePaxMedicated(index: number) {
    this.paxMedicated.removeAt(index);
  }

  async loadLatestReport() {
    const report = await this.reportService.getLatestReport();
    if (!report) {
      this.addPaxMedicated();
      return;
    }
    this.resetPaxMedicated(report.paxMedicated || []);
    this.reportService.setHasMedsSelection(this.hasAnyMedsSelection());
  }

  clearVitals(group: FormGroup) {
    group.patchValue(
      {
        bpSystolic: '',
        bpDiastolic: '',
        hr: '',
        resp: '',
        temp: '',
        o2Sat: '',
        ratePercent: ''
      },
      { emitEvent: false }
    );
  }

  hasAnyMedsSelection(): boolean {
    return this.paxMedicated.controls.some(control => {
      const medication = control.get('medication')?.value || '';
      return medication.trim().length > 0;
    });
  }

  async saveMeds() {
    const report = await this.reportService.getLatestReport();
    if (!report) {
      const toast = await this.toastCtrl.create({
        message: 'Create a report first, then add medications.',
        duration: 2000,
        color: 'warning'
      });
      toast.present();
      return;
    }

    const updatedReport: NursingReport = {
      ...report,
      paxMedicated: this.paxMedicated.value as PaxMedicationEntry[]
    };

    await this.reportService.saveReport(updatedReport);
    const toast = await this.toastCtrl.create({
      message: 'Medication data saved successfully!',
      duration: 2000,
      color: 'success'
    });
    toast.present();
  }
}
