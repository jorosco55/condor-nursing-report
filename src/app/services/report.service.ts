import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NursingReport } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private STORAGE_KEY = 'vighter_nursing_reports';
  private ACTIVE_REPORT_KEY = 'vighter_active_report_id';
  private FORCE_NEW_REPORT_KEY = 'vighter_force_new_report';
  private narcRecordStatusSubject = new BehaviorSubject<string>('');
  private medicationRecordStatusSubject = new BehaviorSubject<string>('');
  private hasNarcoticSelectionSubject = new BehaviorSubject<boolean>(false);
  private hasMedsSelectionSubject = new BehaviorSubject<boolean>(false);

  narcRecordStatus$ = this.narcRecordStatusSubject.asObservable();
  medicationRecordStatus$ = this.medicationRecordStatusSubject.asObservable();
  hasNarcoticSelection$ = this.hasNarcoticSelectionSubject.asObservable();
  hasMedsSelection$ = this.hasMedsSelectionSubject.asObservable();

  readonly rnList: string[] = [
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
      this.clearForceNewReport();
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reports));
    this.setActiveReportId(report.id || null);
  }

  async getAllReports(): Promise<NursingReport[]> {
    const reportsJson = localStorage.getItem(this.STORAGE_KEY);
    return reportsJson ? JSON.parse(reportsJson) : [];
  }

  async getLatestReport(): Promise<NursingReport | null> {
    const reports = await this.getAllReports();
    const activeId = this.getActiveReportId();
    if (activeId) {
      const activeReport = reports.find(report => report.id === activeId) || null;
      if (activeReport) {
        return activeReport;
      }
    }
    if (this.isForceNewReport()) {
      return null;
    }
    return reports.length > 0 ? reports[reports.length - 1] : null;
  }

  setActiveReportId(id: number | null): void {
    if (!id) {
      localStorage.removeItem(this.ACTIVE_REPORT_KEY);
      return;
    }
    localStorage.setItem(this.ACTIVE_REPORT_KEY, id.toString());
  }

  getActiveReportId(): number | null {
    const value = localStorage.getItem(this.ACTIVE_REPORT_KEY);
    if (!value) return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  startNewReport(): void {
    localStorage.setItem(this.FORCE_NEW_REPORT_KEY, 'true');
    this.setActiveReportId(null);
  }

  isForceNewReport(): boolean {
    return localStorage.getItem(this.FORCE_NEW_REPORT_KEY) === 'true';
  }

  clearForceNewReport(): void {
    localStorage.removeItem(this.FORCE_NEW_REPORT_KEY);
  }
}
