import { Component, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import SignaturePad from 'signature_pad';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { ReportService } from '../services/report.service';

@Component({
  selector: 'app-export',
  templateUrl: './export.page.html',
  styleUrls: ['./export.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ]
})
export class ExportPage implements AfterViewInit {
  @ViewChild('canvas1', { static: false }) canvas1!: ElementRef;
  @ViewChild('canvas2', { static: false }) canvas2!: ElementRef;
  
  signaturePad1!: SignaturePad;
  signaturePad2!: SignaturePad;

  private reportService = inject(ReportService);
  private toastCtrl = inject(ToastController);

  ngAfterViewInit() {
    // Configure SignaturePad with touch-optimized settings
    const signaturePadOptions = {
      minWidth: 1,
      maxWidth: 3,
      throttle: 0,
      velocityFilterWeight: 0.7,
      dotSize: 1.5,
      penColor: 'rgb(0, 0, 0)',
      backgroundColor: 'rgb(255, 255, 255)'
    };

    this.signaturePad1 = new SignaturePad(this.canvas1.nativeElement, signaturePadOptions);
    this.signaturePad2 = new SignaturePad(this.canvas2.nativeElement, signaturePadOptions);
    
    this.resizeCanvases();
    this.setupTouchListeners();
  }

  resizeCanvases() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    
    [this.canvas1, this.canvas2].forEach(canvasRef => {
      const canvas = canvasRef.nativeElement;
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext('2d').scale(ratio, ratio);
    });
    
    this.signaturePad1.clear();
    this.signaturePad2.clear();
  }

  setupTouchListeners() {
    // Prevent page scroll when drawing on signature pads
    [this.canvas1, this.canvas2].forEach(canvasRef => {
      const canvas = canvasRef.nativeElement;
      
      // Prevent default touch behavior to avoid scrolling while signing
      canvas.addEventListener('touchstart', (e: TouchEvent) => {
        e.preventDefault();
      }, { passive: false });
      
      canvas.addEventListener('touchmove', (e: TouchEvent) => {
        e.preventDefault();
      }, { passive: false });
      
      // Ensure smooth drawing on touch devices
      canvas.style.touchAction = 'none';
    });

    // Handle window resize for responsive signature pads
    window.addEventListener('resize', () => {
      this.resizeCanvases();
    });
  }

  clearSignature(padNumber: number) {
    if (padNumber === 1) {
      this.signaturePad1.clear();
    } else {
      this.signaturePad2.clear();
    }
  }

  async saveSignatures() {
    const report = await this.reportService.getLatestReport();
    if (!report) {
      const toast = await this.toastCtrl.create({
        message: 'No report data found.',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
      return;
    }

    let savedCount = 0;

    if (!this.signaturePad1.isEmpty()) {
      report.rnSignature = this.signaturePad1.toDataURL();
      report.dateSigned = new Date().toISOString();
      savedCount++;
    }

    if (!this.signaturePad2.isEmpty()) {
      report.secondRnSignature = this.signaturePad2.toDataURL();
      report.secondDateSigned = new Date().toISOString();
      savedCount++;
    }

    if (savedCount > 0) {
      await this.reportService.saveReport(report);
      const toast = await this.toastCtrl.create({
        message: `Saved ${savedCount} signature(s) to report!`,
        duration: 2000,
        color: 'success'
      });
      toast.present();
    } else {
      const toast = await this.toastCtrl.create({
        message: 'Please provide at least one signature.',
        duration: 2000,
        color: 'warning'
      });
      toast.present();
    }
  }

  async generatePDF() {
    const report = await this.reportService.getLatestReport();
    if (!report) {
      const toast = await this.toastCtrl.create({
        message: 'No report data found to export.',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
      return;
    }

    // Initialize pdfMake vfs inside the method to avoid initialization issues
    (pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;

    const yesNo = (value: boolean | undefined) => (value ? 'Yes' : 'No');
    const formatVitals = (entry: any) => {
      if (entry?.vitalsNa) return 'N/A';
      const parts = [] as string[];
      if (entry?.bpSystolic || entry?.bpDiastolic) {
        parts.push(`BP ${entry.bpSystolic || ''}/${entry.bpDiastolic || ''} mmHg`.trim());
      }
      if (entry?.hr) parts.push(`HR ${entry.hr}`);
      if (entry?.resp) parts.push(`Resp ${entry.resp}`);
      if (entry?.temp) parts.push(`Temp ${entry.temp}`);
      if (entry?.o2Sat) parts.push(`O2 Sat ${entry.o2Sat}%`);
      if (entry?.ratePercent) parts.push(`Rate% ${entry.ratePercent}%`);
      if (entry?.bs) parts.push(`BS ${entry.bs}`);
      return parts.length > 0 ? parts.join(', ') : 'N/A';
    };

    const paxMedicatedRows = report.paxMedicated && report.paxMedicated.length > 0
      ? report.paxMedicated.map(entry => {
          const doseValue = entry.dose
            ? `${entry.dose}${entry.doseUnit ? ` ${entry.doseUnit}` : ''}`
            : 'N/A';
          return [
            entry.aNumber || 'N/A',
            entry.medication || 'N/A',
            doseValue,
            entry.route || 'N/A',
            entry.prnGiven ? 'Yes' : 'No',
            formatVitals(entry),
            entry.annotatedOnMtf || 'N/A'
          ];
        })
      : [[{ text: 'No PAX medications recorded', colSpan: 7 }, '', '', '', '', '', '']];

    const delayReasons = report.delayReasons && report.delayReasons.length > 0
      ? report.delayReasons.join(', ')
      : 'N/A';

    const docDefinition: any = {
      content: [
        { text: 'VIGHTER - Nursing Report', style: 'header' },
        { text: '10010 San Pedro Ave Ste 850, San Antonio, TX 78216', style: 'subheader' },
        { text: 'Main: 1.210.774.5393 | www.vighter.com', style: 'subheader' },
        { text: ' ', margin: [0, 10] },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [{ text: 'Date:', bold: true }, new Date(report.date).toLocaleDateString()],
              [{ text: 'Site:', bold: true }, report.site],
              [{ text: 'ICE Flight RN:', bold: true }, report.iceFlightRN],
              [{ text: '2nd ICE Flight RN:', bold: true }, report.secondICEFlightRN || 'N/A'],
              [{ text: 'Tail #:', bold: true }, report.tailNumber],
              [{ text: 'Mission #:', bold: true }, report.missionNumber]
            ]
          }
        },
        { text: 'Flight Times', style: 'sectionHeader', margin: [0, 20, 0, 10] },
        {
          table: {
            widths: ['*', '*'],
              body: [
                [{ text: 'Doors Close Time (L):', bold: true }, report.doorsCloseTimeL || 'N/A'],
                [{ text: 'Doors Close Time (Z):', bold: true }, report.doorsCloseTime || 'N/A'],
                [{ text: 'Doors Open Time (L):', bold: true }, report.doorsOpenTimeL || 'N/A'],
                [{ text: 'Doors Open Time (Z):', bold: true }, report.doorsOpenTime || 'N/A'],
                [{ text: 'Wheels Up Site:', bold: true }, report.wheelsUpSite || 'N/A'],
                [{ text: 'Wheels Up Time (L):', bold: true }, report.wheelsUpTimeL || 'N/A'],
                [{ text: 'Wheels Up Time (Z):', bold: true }, report.wheelsUpTime || 'N/A'],
                [{ text: 'Wheels Down Site:', bold: true }, report.wheelsDownSite || 'N/A'],
                [{ text: 'Wheels Down Time (L):', bold: true }, report.wheelsDownTimeL || 'N/A'],
                [{ text: 'Wheels Down Time (Z):', bold: true }, report.wheelsDownTime || 'N/A']
              ]
            }
          },
        { text: 'Transfer of Care', style: 'sectionHeader', margin: [0, 20, 0, 10] },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [{ text: 'Transfer of care to ICE LEAD (Site):', bold: true }, report.transferOfCareSite || 'N/A'],
              [{ text: 'Received care:', bold: true }, yesNo(report.receivedCare)]
            ]
          }
        },
        { text: 'PAX Medicated', style: 'sectionHeader', margin: [0, 20, 0, 10] },
        {
          table: {
            widths: [60, 90, 50, 50, 40, 90, '*'],
            body: [
              [
                { text: 'A-Number', bold: true },
                { text: 'Medication', bold: true },
                { text: 'Dose', bold: true },
                { text: 'Route', bold: true },
                { text: 'PRN', bold: true },
                { text: 'Vitals', bold: true },
                { text: 'Annotated on MTF', bold: true }
              ],
              ...paxMedicatedRows
            ]
          }
        },
        { text: 'Cleared Medical with FOIC', style: 'sectionHeader', margin: [0, 20, 0, 10] },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [{ text: 'Cleared Medical with FOIC:', bold: true }, yesNo(report.clearedMedicalWithFoic)],
              [{ text: '# PAX Total:', bold: true }, report.paxTotal ?? 'N/A'],
              [{ text: '# PAX Females:', bold: true }, report.paxFemales ?? 'N/A'],
              [{ text: 'Pre-flight not pregnant (count):', bold: true }, report.paxFemaleNotPregnantConfirmed ?? 'N/A'],
              [{ text: '# PAX Male:', bold: true }, report.paxMale ?? 'N/A'],
              [{ text: '# PAX Minors:', bold: true }, report.paxMinors ?? 'N/A'],
              [{ text: '# PAX with Medications:', bold: true }, report.paxWithMedications ?? 'N/A'],
              [{ text: '# PAX needing <72-hour RN assessment:', bold: true }, report.paxNeeding72HrAssessment ?? 'N/A']
            ]
          }
        },
        { text: 'Operational', style: 'sectionHeader', margin: [0, 20, 0, 10] },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [{ text: 'All PAX safely on-boarded:', bold: true }, yesNo(report.allPaxSafelyOnboarded)],
              [{ text: 'All PAX given food, water and lavatory breaks:', bold: true }, yesNo(report.allPaxGivenFoodWaterLavBreaks)]
            ]
          }
        },
        { text: 'Delay', style: 'sectionHeader', margin: [0, 20, 0, 10] },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [{ text: 'Delay reason(s):', bold: true }, delayReasons]
            ]
          }
        },
        { text: 'Special Circumstances', style: 'sectionHeader', margin: [0, 20, 0, 10] },
        {
          table: {
            widths: ['*', '*'],
              body: [
                [{ text: 'PAX wrapped:', bold: true }, yesNo(report.specialCircumstancePaxWrapped)],
                [{ text: 'Medical complaint assessment completed:', bold: true }, yesNo(report.specialCircumstanceMedicalComplaintAssessed)],
                [{ text: 'Vighter Medical Control contacted:', bold: true }, yesNo(report.specialCircumstanceMedicalControlContacted)],
                [{ text: 'Site supervisor advised:', bold: true }, yesNo(report.specialCircumstanceSiteSupervisorAdvised)],
                [{ text: 'Medical emergency on-board EMS contacted:', bold: true }, yesNo(report.specialCircumstanceMedicalEmergencyOnboardEms)],
                [{ text: 'Violent Incident:', bold: true }, yesNo(report.specialCircumstanceViolentIncident)]
              ]
            }
          },
        { text: 'Narrative Log', style: 'sectionHeader', margin: [0, 20, 0, 10] },
        {
          table: {
            widths: [50, '*'],
            body: [
              [{ text: 'Time (L)', bold: true }, { text: 'Notes', bold: true }],
              ...report.notes.map(n => [n.timeL, n.note])
            ]
          }
        }
      ],
      styles: {
        header: { fontSize: 18, bold: true, alignment: 'center' },
        subheader: { fontSize: 10, alignment: 'center', color: '#666' },
        sectionHeader: { fontSize: 14, bold: true, color: '#3f51b5' }
      }
    };

    // Add Signatures to PDF
    const signatureContent: any[] = [];
    
    const sig1 = report.rnSignature || (!this.signaturePad1.isEmpty() ? this.signaturePad1.toDataURL() : null);
    const sig2 = report.secondRnSignature || (!this.signaturePad2.isEmpty() ? this.signaturePad2.toDataURL() : null);

    if (sig1 || sig2) {
      docDefinition.content.push({ text: 'Flight RN Signatures', style: 'sectionHeader', margin: [0, 20, 0, 10] });
      
      const sigTableBody: any[] = [];
      const sigRow: any[] = [];
      const labelRow: any[] = [];

      if (sig1) {
        sigRow.push({ image: sig1, width: 150 });
        labelRow.push({ text: `1st RN Signed on: ${new Date(report.dateSigned || Date.now()).toLocaleString()}`, fontSize: 8 });
      } else {
        sigRow.push('');
        labelRow.push('');
      }

      if (sig2) {
        sigRow.push({ image: sig2, width: 150 });
        labelRow.push({ text: `2nd RN Signed on: ${new Date(report.secondDateSigned || Date.now()).toLocaleString()}`, fontSize: 8 });
      } else {
        sigRow.push('');
        labelRow.push('');
      }

      sigTableBody.push(sigRow);
      sigTableBody.push(labelRow);

      docDefinition.content.push({
        table: {
          widths: ['*', '*'],
          body: sigTableBody
        },
        layout: 'noBorders'
      });
    }

    pdfMake.createPdf(docDefinition).download(`Nursing_Report_${report.missionNumber || 'Draft'}.pdf`);
  }
}
