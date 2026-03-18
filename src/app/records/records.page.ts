import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonBadge, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronUpOutline, chevronDownOutline } from 'ionicons/icons';
import { TuiButton, TuiDataList, TuiTextfield } from '@taiga-ui/core';
import { TuiDataListWrapper, TuiSelect } from '@taiga-ui/kit';
import { ReportService } from '../services/report.service';
import { NursingReport } from '../models/report.model';

@Component({
  selector: 'app-records',
  templateUrl: './records.page.html',
  styleUrls: ['./records.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonButton,
    IonIcon,
    TuiTextfield,
    TuiSelect,
    TuiDataList,
    TuiDataListWrapper,
    TuiButton
  ]
})
export class RecordsPage implements OnInit {
  records: NursingReport[] = [];
  searchTerm = '';
  statusFilter: 'All' | 'Open' | 'Closed' = 'All';
  expandedRecordId: number | null = null;

  private reportService = inject(ReportService);
  private router = inject(Router);

  constructor() {
    addIcons({ chevronUpOutline, chevronDownOutline });
  }

  private mockRecords: NursingReport[] = [
    { id: 9001, date: '2026-02-20T10:15:00.000Z', site: 'IWA', iceFlightRN: 'Sarah Johnson, RN', secondICEFlightRN: 'Michael Chen, RN', tailNumber: 'N712CV', missionNumber: 'M-1021', siteStops: 'IWA, ELP', foicTitle: 'FOIC', asoLead: 'ASO', preflightMEBCheck: true, preflightMEKO2AED: true, safetyBriefingCompleted: true, seatBeltsSecured: true, narcRecordStatus: '', medicationRecordStatus: '', showtimeZ1: '0910', blockTimeZ1: '0945', endTimeZ1: '1130', wheelsUpSite: 'IWA', wheelsUpTimeL: '0630', wheelsUpTime: '0930', wheelsDownSite: 'ELP', wheelsDownTimeL: '0900', wheelsDownTime: '1200', showtimeZ2: '', blockTimeZ2: '', endTimeZ2: '', ronUsed: false, notes: [], narcotics: [], transferOfCareSite: 'ELP', receivedCare: false, paxMedicated: [], clearedMedicalWithFoic: false, paxTotal: null, paxFemales: null, paxFemaleNotPregnantConfirmed: null, paxMale: null, paxMinors: null, paxWithMedications: null, paxNeeding72HrAssessment: null, allPaxSafelyOnboarded: false, allPaxGivenFoodWaterLavBreaks: false, delayReasons: '', specialCircumstancePaxWrapped: false, specialCircumstanceMedicalComplaintAssessed: false, specialCircumstanceMedicalControlContacted: false, specialCircumstanceSiteSupervisorAdvised: false, specialCircumstanceMedicalEmergencyOnboardEms: false, specialCircumstanceViolentIncident: false, reportStatus: 'Open', doorsCloseTime: '0915', doorsOpenTime: '1215' },
    { id: 9002, date: '2026-02-19T14:40:00.000Z', site: 'ELP', iceFlightRN: 'Emily Rodriguez, RN', secondICEFlightRN: 'James Williams, RN', tailNumber: 'N805CV', missionNumber: 'M-1020', siteStops: 'ELP, ALX', foicTitle: 'FOIC', asoLead: 'ASO', preflightMEBCheck: true, preflightMEKO2AED: true, safetyBriefingCompleted: true, seatBeltsSecured: true, narcRecordStatus: '', medicationRecordStatus: '', showtimeZ1: '1330', blockTimeZ1: '1405', endTimeZ1: '1620', wheelsUpSite: 'ELP', wheelsUpTimeL: '0730', wheelsUpTime: '1400', wheelsDownSite: 'ALX', wheelsDownTimeL: '0930', wheelsDownTime: '1600', showtimeZ2: '', blockTimeZ2: '', endTimeZ2: '', ronUsed: false, notes: [], narcotics: [], transferOfCareSite: 'ALX', receivedCare: true, paxMedicated: [], clearedMedicalWithFoic: true, paxTotal: 85, paxFemales: 36, paxFemaleNotPregnantConfirmed: 30, paxMale: 49, paxMinors: 4, paxWithMedications: 3, paxNeeding72HrAssessment: 1, allPaxSafelyOnboarded: true, allPaxGivenFoodWaterLavBreaks: true, delayReasons: 'Weather delay', specialCircumstancePaxWrapped: false, specialCircumstanceMedicalComplaintAssessed: true, specialCircumstanceMedicalControlContacted: false, specialCircumstanceSiteSupervisorAdvised: false, specialCircumstanceMedicalEmergencyOnboardEms: false, specialCircumstanceViolentIncident: false, reportStatus: 'Closed', doorsCloseTime: '1345', doorsOpenTime: '1610' },
    { id: 9003, date: '2026-02-18T08:05:00.000Z', site: 'ALX', iceFlightRN: 'Maria Garcia, RN', secondICEFlightRN: 'David Brown, RN', tailNumber: 'N611CV', missionNumber: 'M-1019', siteStops: 'ALX', foicTitle: 'FOIC', asoLead: 'ASO', preflightMEBCheck: true, preflightMEKO2AED: true, safetyBriefingCompleted: false, seatBeltsSecured: true, narcRecordStatus: '', medicationRecordStatus: '', showtimeZ1: '0700', blockTimeZ1: '0740', endTimeZ1: '1015', wheelsUpSite: 'ALX', wheelsUpTimeL: '0205', wheelsUpTime: '0705', wheelsDownSite: 'ALX', wheelsDownTimeL: '0515', wheelsDownTime: '1015', showtimeZ2: '', blockTimeZ2: '', endTimeZ2: '', ronUsed: false, notes: [], narcotics: [], transferOfCareSite: 'ALX', receivedCare: false, paxMedicated: [], clearedMedicalWithFoic: false, paxTotal: 60, paxFemales: 22, paxFemaleNotPregnantConfirmed: 18, paxMale: 38, paxMinors: 2, paxWithMedications: 2, paxNeeding72HrAssessment: 0, allPaxSafelyOnboarded: true, allPaxGivenFoodWaterLavBreaks: true, delayReasons: '', specialCircumstancePaxWrapped: false, specialCircumstanceMedicalComplaintAssessed: false, specialCircumstanceMedicalControlContacted: false, specialCircumstanceSiteSupervisorAdvised: false, specialCircumstanceMedicalEmergencyOnboardEms: false, specialCircumstanceViolentIncident: false, reportStatus: 'Open', doorsCloseTime: '0655', doorsOpenTime: '1020' },
    { id: 9004, date: '2026-02-17T18:20:00.000Z', site: 'HRL', iceFlightRN: 'Jennifer Martinez, RN', secondICEFlightRN: 'Robert Taylor, RN', tailNumber: 'N902CV', missionNumber: 'M-1018', siteStops: 'HRL, IWA', foicTitle: 'FOIC', asoLead: 'ASO', preflightMEBCheck: true, preflightMEKO2AED: true, safetyBriefingCompleted: true, seatBeltsSecured: true, narcRecordStatus: '', medicationRecordStatus: '', showtimeZ1: '1700', blockTimeZ1: '1750', endTimeZ1: '2015', wheelsUpSite: 'HRL', wheelsUpTimeL: '1150', wheelsUpTime: '1750', wheelsDownSite: 'IWA', wheelsDownTimeL: '1415', wheelsDownTime: '2015', showtimeZ2: '', blockTimeZ2: '', endTimeZ2: '', ronUsed: false, notes: [], narcotics: [], transferOfCareSite: 'IWA', receivedCare: true, paxMedicated: [], clearedMedicalWithFoic: true, paxTotal: 92, paxFemales: 40, paxFemaleNotPregnantConfirmed: 36, paxMale: 52, paxMinors: 6, paxWithMedications: 4, paxNeeding72HrAssessment: 2, allPaxSafelyOnboarded: true, allPaxGivenFoodWaterLavBreaks: true, delayReasons: 'Mechanical', specialCircumstancePaxWrapped: false, specialCircumstanceMedicalComplaintAssessed: false, specialCircumstanceMedicalControlContacted: true, specialCircumstanceSiteSupervisorAdvised: true, specialCircumstanceMedicalEmergencyOnboardEms: false, specialCircumstanceViolentIncident: false, reportStatus: 'Closed', doorsCloseTime: '1735', doorsOpenTime: '2020' },
    { id: 9005, date: '2026-02-16T12:10:00.000Z', site: 'IWA', iceFlightRN: 'Lisa Anderson, RN', secondICEFlightRN: 'Christopher Lee, RN', tailNumber: 'N744CV', missionNumber: 'M-1017', siteStops: 'IWA, HRL', foicTitle: 'FOIC', asoLead: 'ASO', preflightMEBCheck: true, preflightMEKO2AED: true, safetyBriefingCompleted: true, seatBeltsSecured: true, narcRecordStatus: '', medicationRecordStatus: '', showtimeZ1: '1100', blockTimeZ1: '1140', endTimeZ1: '1330', wheelsUpSite: 'IWA', wheelsUpTimeL: '0605', wheelsUpTime: '1105', wheelsDownSite: 'HRL', wheelsDownTimeL: '0830', wheelsDownTime: '1330', showtimeZ2: '', blockTimeZ2: '', endTimeZ2: '', ronUsed: false, notes: [], narcotics: [], transferOfCareSite: 'HRL', receivedCare: false, paxMedicated: [], clearedMedicalWithFoic: false, paxTotal: 70, paxFemales: 28, paxFemaleNotPregnantConfirmed: 25, paxMale: 42, paxMinors: 3, paxWithMedications: 1, paxNeeding72HrAssessment: 1, allPaxSafelyOnboarded: true, allPaxGivenFoodWaterLavBreaks: true, delayReasons: '', specialCircumstancePaxWrapped: false, specialCircumstanceMedicalComplaintAssessed: false, specialCircumstanceMedicalControlContacted: false, specialCircumstanceSiteSupervisorAdvised: false, specialCircumstanceMedicalEmergencyOnboardEms: false, specialCircumstanceViolentIncident: false, reportStatus: 'Open', doorsCloseTime: '1050', doorsOpenTime: '1335' },
    { id: 9006, date: '2026-02-15T07:45:00.000Z', site: 'ELP', iceFlightRN: 'Sarah Johnson, RN', secondICEFlightRN: 'Emily Rodriguez, RN', tailNumber: 'N833CV', missionNumber: 'M-1016', siteStops: 'ELP', foicTitle: 'FOIC', asoLead: 'ASO', preflightMEBCheck: true, preflightMEKO2AED: true, safetyBriefingCompleted: true, seatBeltsSecured: true, narcRecordStatus: '', medicationRecordStatus: '', showtimeZ1: '0645', blockTimeZ1: '0720', endTimeZ1: '0900', wheelsUpSite: 'ELP', wheelsUpTimeL: '0045', wheelsUpTime: '0645', wheelsDownSite: 'ELP', wheelsDownTimeL: '0300', wheelsDownTime: '0900', showtimeZ2: '', blockTimeZ2: '', endTimeZ2: '', ronUsed: false, notes: [], narcotics: [], transferOfCareSite: 'ELP', receivedCare: false, paxMedicated: [], clearedMedicalWithFoic: false, paxTotal: 55, paxFemales: 20, paxFemaleNotPregnantConfirmed: 18, paxMale: 35, paxMinors: 1, paxWithMedications: 0, paxNeeding72HrAssessment: 0, allPaxSafelyOnboarded: true, allPaxGivenFoodWaterLavBreaks: true, delayReasons: '', specialCircumstancePaxWrapped: false, specialCircumstanceMedicalComplaintAssessed: false, specialCircumstanceMedicalControlContacted: false, specialCircumstanceSiteSupervisorAdvised: false, specialCircumstanceMedicalEmergencyOnboardEms: false, specialCircumstanceViolentIncident: false, reportStatus: 'Open', doorsCloseTime: '0635', doorsOpenTime: '0905' },
    { id: 9007, date: '2026-02-14T16:30:00.000Z', site: 'ALX', iceFlightRN: 'Michael Chen, RN', secondICEFlightRN: 'James Williams, RN', tailNumber: 'N670CV', missionNumber: 'M-1015', siteStops: 'ALX, IWA', foicTitle: 'FOIC', asoLead: 'ASO', preflightMEBCheck: true, preflightMEKO2AED: true, safetyBriefingCompleted: true, seatBeltsSecured: true, narcRecordStatus: '', medicationRecordStatus: '', showtimeZ1: '1530', blockTimeZ1: '1605', endTimeZ1: '1830', wheelsUpSite: 'ALX', wheelsUpTimeL: '0930', wheelsUpTime: '1530', wheelsDownSite: 'IWA', wheelsDownTimeL: '1130', wheelsDownTime: '1730', showtimeZ2: '', blockTimeZ2: '', endTimeZ2: '', ronUsed: false, notes: [], narcotics: [], transferOfCareSite: 'IWA', receivedCare: true, paxMedicated: [], clearedMedicalWithFoic: true, paxTotal: 88, paxFemales: 34, paxFemaleNotPregnantConfirmed: 30, paxMale: 54, paxMinors: 5, paxWithMedications: 2, paxNeeding72HrAssessment: 1, allPaxSafelyOnboarded: true, allPaxGivenFoodWaterLavBreaks: true, delayReasons: 'Flight Crew', specialCircumstancePaxWrapped: false, specialCircumstanceMedicalComplaintAssessed: false, specialCircumstanceMedicalControlContacted: true, specialCircumstanceSiteSupervisorAdvised: false, specialCircumstanceMedicalEmergencyOnboardEms: false, specialCircumstanceViolentIncident: false, reportStatus: 'Closed', doorsCloseTime: '1515', doorsOpenTime: '1735' },
    { id: 9008, date: '2026-02-13T11:25:00.000Z', site: 'HRL', iceFlightRN: 'David Brown, RN', secondICEFlightRN: 'Lisa Anderson, RN', tailNumber: 'N790CV', missionNumber: 'M-1014', siteStops: 'HRL', foicTitle: 'FOIC', asoLead: 'ASO', preflightMEBCheck: true, preflightMEKO2AED: true, safetyBriefingCompleted: true, seatBeltsSecured: true, narcRecordStatus: '', medicationRecordStatus: '', showtimeZ1: '1030', blockTimeZ1: '1105', endTimeZ1: '1245', wheelsUpSite: 'HRL', wheelsUpTimeL: '0530', wheelsUpTime: '1030', wheelsDownSite: 'HRL', wheelsDownTimeL: '0745', wheelsDownTime: '1245', showtimeZ2: '', blockTimeZ2: '', endTimeZ2: '', ronUsed: false, notes: [], narcotics: [], transferOfCareSite: 'HRL', receivedCare: false, paxMedicated: [], clearedMedicalWithFoic: false, paxTotal: 48, paxFemales: 16, paxFemaleNotPregnantConfirmed: 14, paxMale: 32, paxMinors: 0, paxWithMedications: 1, paxNeeding72HrAssessment: 0, allPaxSafelyOnboarded: true, allPaxGivenFoodWaterLavBreaks: true, delayReasons: '', specialCircumstancePaxWrapped: false, specialCircumstanceMedicalComplaintAssessed: false, specialCircumstanceMedicalControlContacted: false, specialCircumstanceSiteSupervisorAdvised: false, specialCircumstanceMedicalEmergencyOnboardEms: false, specialCircumstanceViolentIncident: false, reportStatus: 'Open', doorsCloseTime: '1015', doorsOpenTime: '1250' },
    { id: 9009, date: '2026-02-12T19:10:00.000Z', site: 'IWA', iceFlightRN: 'Christopher Lee, RN', secondICEFlightRN: 'Sarah Johnson, RN', tailNumber: 'N910CV', missionNumber: 'M-1013', siteStops: 'IWA, ELP', foicTitle: 'FOIC', asoLead: 'ASO', preflightMEBCheck: true, preflightMEKO2AED: true, safetyBriefingCompleted: true, seatBeltsSecured: true, narcRecordStatus: '', medicationRecordStatus: '', showtimeZ1: '1800', blockTimeZ1: '1840', endTimeZ1: '2105', wheelsUpSite: 'IWA', wheelsUpTimeL: '1205', wheelsUpTime: '1805', wheelsDownSite: 'ELP', wheelsDownTimeL: '1420', wheelsDownTime: '2020', showtimeZ2: '', blockTimeZ2: '', endTimeZ2: '', ronUsed: false, notes: [], narcotics: [], transferOfCareSite: 'ELP', receivedCare: true, paxMedicated: [], clearedMedicalWithFoic: true, paxTotal: 95, paxFemales: 41, paxFemaleNotPregnantConfirmed: 37, paxMale: 54, paxMinors: 7, paxWithMedications: 5, paxNeeding72HrAssessment: 2, allPaxSafelyOnboarded: true, allPaxGivenFoodWaterLavBreaks: true, delayReasons: 'Ground delay R/t ICE', specialCircumstancePaxWrapped: false, specialCircumstanceMedicalComplaintAssessed: true, specialCircumstanceMedicalControlContacted: false, specialCircumstanceSiteSupervisorAdvised: false, specialCircumstanceMedicalEmergencyOnboardEms: false, specialCircumstanceViolentIncident: false, reportStatus: 'Closed', doorsCloseTime: '1750', doorsOpenTime: '2025' },
    { id: 9010, date: '2026-02-11T09:00:00.000Z', site: 'ELP', iceFlightRN: 'James Williams, RN', secondICEFlightRN: 'Maria Garcia, RN', tailNumber: 'N623CV', missionNumber: 'M-1012', siteStops: 'ELP, ALX', foicTitle: 'FOIC', asoLead: 'ASO', preflightMEBCheck: true, preflightMEKO2AED: true, safetyBriefingCompleted: true, seatBeltsSecured: true, narcRecordStatus: '', medicationRecordStatus: '', showtimeZ1: '0800', blockTimeZ1: '0830', endTimeZ1: '1040', wheelsUpSite: 'ELP', wheelsUpTimeL: '0300', wheelsUpTime: '0800', wheelsDownSite: 'ALX', wheelsDownTimeL: '0505', wheelsDownTime: '1005', showtimeZ2: '', blockTimeZ2: '', endTimeZ2: '', ronUsed: false, notes: [], narcotics: [], transferOfCareSite: 'ALX', receivedCare: false, paxMedicated: [], clearedMedicalWithFoic: false, paxTotal: 63, paxFemales: 24, paxFemaleNotPregnantConfirmed: 20, paxMale: 39, paxMinors: 2, paxWithMedications: 1, paxNeeding72HrAssessment: 0, allPaxSafelyOnboarded: true, allPaxGivenFoodWaterLavBreaks: true, delayReasons: '', specialCircumstancePaxWrapped: false, specialCircumstanceMedicalComplaintAssessed: false, specialCircumstanceMedicalControlContacted: false, specialCircumstanceSiteSupervisorAdvised: false, specialCircumstanceMedicalEmergencyOnboardEms: false, specialCircumstanceViolentIncident: false, reportStatus: 'Open', doorsCloseTime: '0745', doorsOpenTime: '1010' }
  ];

  ngOnInit() {
    this.loadRecords();
  }

  ionViewWillEnter() {
    this.loadRecords();
  }

  async loadRecords() {
    const reports = await this.reportService.getAllReports();
    const source = [...reports, ...this.mockRecords]
      .map(report => ({
        ...report,
        reportStatus: report.reportStatus || 'Open'
      }))
      .sort((a, b) => {
        const aDate = a.date ? new Date(a.date).getTime() : 0;
        const bDate = b.date ? new Date(b.date).getTime() : 0;
        return bDate - aDate;
      });
    this.records = source;
  }

  get filteredRecords(): NursingReport[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.records.filter(record => {
      const matchesStatus = this.statusFilter === 'All' || record.reportStatus === this.statusFilter;
      if (!term) return matchesStatus;
      const mission = (record.missionNumber || '').toLowerCase();
      const site = (record.site || '').toLowerCase();
      return matchesStatus && (mission.includes(term) || site.includes(term));
    });
  }

  formatDate(value: string | undefined): string {
    if (!value) return 'N/A';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'N/A';
    return parsed.toLocaleDateString();
  }

  toggleDetails(record: NursingReport) {
    if (!record.id) return;
    this.expandedRecordId = this.expandedRecordId === record.id ? null : record.id;
  }

  async toggleStatus(record: NursingReport) {
    const updated: NursingReport = {
      ...record,
      reportStatus: record.reportStatus === 'Closed' ? 'Open' : 'Closed'
    };
    await this.reportService.saveReport(updated);
    this.records = this.records.map(item => (item.id === updated.id ? updated : item));
  }

  openRecord(record: NursingReport) {
    if (!record.id) return;
    this.reportService.setActiveReportId(record.id);
    this.reportService.clearForceNewReport();
    this.router.navigate(['/tabs/report']);
  }

  async duplicateRecord(record: NursingReport) {
    const cloned: NursingReport = {
      ...record,
      id: undefined,
      reportStatus: 'Open',
      date: new Date().toISOString(),
      rnSignature: undefined,
      dateSigned: undefined,
      secondRnSignature: undefined,
      secondDateSigned: undefined
    };
    await this.reportService.saveReport(cloned);
    this.reportService.setActiveReportId(cloned.id || null);
    this.router.navigate(['/tabs/report']);
  }

  startNewRecord() {
    this.reportService.startNewReport();
    this.router.navigate(['/tabs/report']);
  }
}
