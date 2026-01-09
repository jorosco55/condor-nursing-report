import { Injectable } from '@angular/core';
import { NursingReport } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private STORAGE_KEY = 'vighter_nursing_reports';

  constructor() { }

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
