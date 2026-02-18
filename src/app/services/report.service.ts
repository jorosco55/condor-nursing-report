import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NursingReport } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private STORAGE_KEY = 'vighter_nursing_reports';
  private narcRecordStatusSubject = new BehaviorSubject<string>('');
  private medicationRecordStatusSubject = new BehaviorSubject<string>('');
  private hasNarcoticSelectionSubject = new BehaviorSubject<boolean>(false);
  private hasMedsSelectionSubject = new BehaviorSubject<boolean>(false);

  narcRecordStatus$ = this.narcRecordStatusSubject.asObservable();
  medicationRecordStatus$ = this.medicationRecordStatusSubject.asObservable();
  hasNarcoticSelection$ = this.hasNarcoticSelectionSubject.asObservable();
  hasMedsSelection$ = this.hasMedsSelectionSubject.asObservable();

  constructor() { }

  setNarcRecordStatus(status: string) {
    this.narcRecordStatusSubject.next(status);
  }

  setMedicationRecordStatus(status: string) {
    this.medicationRecordStatusSubject.next(status);
  }

  setHasNarcoticSelection(hasSelection: boolean) {
    this.hasNarcoticSelectionSubject.next(hasSelection);
  }

  setHasMedsSelection(hasSelection: boolean) {
    this.hasMedsSelectionSubject.next(hasSelection);
  }

  async hydrateNarcoticsState(): Promise<void> {
    const report = await this.getLatestReport();
    this.setNarcRecordStatus(report?.narcRecordStatus || '');
    this.setMedicationRecordStatus(report?.medicationRecordStatus || '');
    const hasSelection = (report?.narcotics || []).some(entry => (entry.narcoticName || '').trim().length > 0);
    this.setHasNarcoticSelection(hasSelection);
    const hasMedsSelection = (report?.paxMedicated || []).some(entry => (entry.medication || '').trim().length > 0);
    this.setHasMedsSelection(hasMedsSelection);
  }

  async saveReport(report: NursingReport): Promise<void> {
    const reports = await this.getAllReports();
    if (report.id) {
      const index = reports.findIndex(r => r.id === report.id);
      if (index > -1) {
        reports[index] = report;
      }
    } else {
      report.id = Date.now();
      reports.push(report);
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reports));
  }

  async getAllReports(): Promise<NursingReport[]> {
    const reportsJson = localStorage.getItem(this.STORAGE_KEY);
    return reportsJson ? JSON.parse(reportsJson) : [];
  }

  async getLatestReport(): Promise<NursingReport | null> {
    const reports = await this.getAllReports();
    return reports.length > 0 ? reports[reports.length - 1] : null;
  }
}
