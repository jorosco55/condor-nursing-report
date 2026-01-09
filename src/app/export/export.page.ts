import { Component, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
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
    MatCardModule,
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
    this.signaturePad1 = new SignaturePad(this.canvas1.nativeElement);
    this.signaturePad2 = new SignaturePad(this.canvas2.nativeElement);
    this.resizeCanvases();
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
              [{ text: 'Mission #:', bold: true }, report.missionNumber],
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
