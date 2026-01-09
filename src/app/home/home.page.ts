import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ReportService } from '../services/report.service';

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
    MatDividerModule
  ]
})
export class HomePage implements OnInit {
  reportForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadLatestDraft();
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
      narcRecord: [''],
      
      // Logistics
      showtimeZ1: [''],
      blockTimeZ1: [''],
      endTimeZ1: [''],
      
      showtimeZ2: [''], // RON
      blockTimeZ2: [''], // RON
      endTimeZ2: [''], // RON
      ronUsed: [false],

      // Narrative
      notes: this.fb.array([])
    });
  }

  async loadLatestDraft() {
    const report = await this.reportService.getLatestReport();
    if (report) {
      this.reportForm.patchValue(report);
      // Clear notes array and rebuild
      while (this.notes.length !== 0) {
        this.notes.removeAt(0);
      }
      report.notes.forEach(note => {
        this.notes.push(this.fb.group(note));
      });
    } else {
      this.addNote();
    }
  }

  get notes() {
    return this.reportForm.get('notes') as FormArray;
  }

  addNote() {
    const now = new Date();
    const timeL = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');
    
    const noteGroup = this.fb.group({
      timeL: [timeL],
      note: ['']
    });
    this.notes.push(noteGroup);
  }

  removeNote(index: number) {
    this.notes.removeAt(index);
  }

  async onSubmit() {
    if (this.reportForm.valid) {
      await this.reportService.saveReport(this.reportForm.value);
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
}
