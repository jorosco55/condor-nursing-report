import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastController, IonHeader, IonToolbar, IonTitle, IonContent, IonRow, IonCol, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { callOutline, timeOutline, chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
import { TuiButton, TuiTextfield, TuiIcon } from '@taiga-ui/core';
import { TuiCheckbox, TuiTextarea } from '@taiga-ui/kit';
import { ReportService } from '../services/report.service';
import { NursingReport } from '../models/report.model';

type ScSectionKey = 'wrap' | 'medControl' | 'cardiacArrest' | 'ems' | 'seizure' | 'chestPain' | 'violentIncident';

@Component({
  selector: 'app-special-circumstances',
  templateUrl: './special-circumstances.page.html',
  styleUrls: ['./special-circumstances.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonRow,
    IonCol,
    IonIcon,
    TuiTextfield,
    TuiCheckbox,
    TuiTextarea,
    TuiButton,
    TuiIcon
  ]
})
export class SpecialCircumstancesPage implements OnInit {
  scForm!: FormGroup;

  // Tracks which sections were flagged Yes on the Nursing Report tab
  scTriggers = {
    wrap: false,
    medControl: false,
    cardiacArrest: false,
    ems: false,
    seizure: false,
    chestPain: false,
    violentIncident: false
  };

  // Controls which sections are expanded
  sectionOpen: {
    wrap: boolean;
    medControl: boolean;
    cardiacArrest: boolean;
    ems: boolean;
    seizure: boolean;
    chestPain: boolean;
    violentIncident: boolean;
  } = {
    wrap: true,
    medControl: false,
    cardiacArrest: false,
    ems: false,
    seizure: false,
    chestPain: false,
    violentIncident: false
  };

  private fb = inject(FormBuilder);
  private reportService = inject(ReportService);
  private toastCtrl = inject(ToastController);

  constructor() {
    addIcons({ callOutline, timeOutline, chevronDownOutline, chevronUpOutline });
  }

  ngOnInit() {
    this.initForm();
    this.loadFromReport();
  }

  ionViewWillEnter() {
    this.loadFromReport();
  }

  initForm() {
    this.scForm = this.fb.group({
      // ── WRAP Restraint ──────────────────────────────────────────────────
      // Incident Info
      wrapInitiatedDateTime: [''],
      wrapLocation: [''],
      foicNotified: [null],
      foicNotifiedTime: [''],
      asoPresent: [null],

      // Pre-Assessment
      reasonForWrap: [''],
      behaviorAgitated: [false],
      behaviorCombative: [false],
      behaviorNonCompliant: [false],
      behaviorOther: [false],
      behaviorOtherText: [''],

      // Nursing Role / Safety
      nursingObservedOnly: [false],
      nursingVisualMonitoring: [false],
      nursingAccompaniedFoic: [false],
      distanceArmsLength: [null],

      // Initial Post-Restraint Assessment
      restraintPositionAppropriate: [null],
      upperExtremitiesNoBlanching: [null],
      circulationIntact: [null],
      respirationsNormal: [false],
      respirationsLabored: [false],
      respirationsShallow: [false],
      spo2: [''],
      locAlert: [false],
      locDrowsy: [false],
      locAltered: [false],
      overheatingNo: [false],
      overheatingYes: [false],

      // Ongoing Monitoring
      monitorQ15x4: [false],
      monitorQ30x2: [false],
      monitorQ1hrOngoing: [false],
      monitorDeviations: [''],

      // Behavior During Monitoring
      behaviorDuringCooperative: [false],
      behaviorDuringAgitated: [false],
      behaviorDuringLimited: [false],
      behaviorDuringNotes: [''],

      // Escalation / Reporting
      changesReportedToFoic: [null],
      foicInstructionsFollowed: [null],
      visualMonitoringMaintained: [null],

      // Clinical Observations
      clinCirculationWnl: [null],
      clinCirculationConcern: [''],
      clinRespiratoryWnl: [null],
      clinRespiratoryConcern: [''],
      alertnessStable: [false],
      alertnessDeclining: [false],
      alertnessFluctuating: [false],

      // Outcome / Status
      outcomeRemainsInWrap: [false],
      outcomeReleased: [false],
      outcomeTransferred: [false],
      outcomeOther: [false],
      outcomeOtherText: [''],

      // Documentation Note
      docPrimaryNurse: [false],
      docSecondaryNurse: [false],
      objectiveDocMaintained: [null],

      // Notifications
      notifSiteSupervisor: [false],
      notifProgramManager: [false],
      notifTime: [''],

      // ── Medical Control / Command & Escalation ───────────────────────────
      // Incident Info
      medCtrlDateTime: [''],
      medCtrlLocation: [''],
      medCtrlPatientName: [''],
      medCtrlPatientId: [''],

      // Type of Medical Control
      medCtrlOnLine: [false],
      onlinePhysicianDirecting: [false],
      contactPhone: [false],
      contactSatPhone: [false],
      contactRadio: [false],
      contactOther: [false],
      contactOtherText: [''],
      onlineProviderName: [''],
      onlineTimeContacted: [''],
      medCtrlOffLine: [false],
      offlinePhysicianNotAvail: [false],
      offlineProtocolFollowed: [false],
      offlineReason: [''],

      // Escalation Pathway
      escalationANotified: [false],
      escalationATime: [''],
      escalationANameContacted: [''],
      escalationBContacted: [false],
      escalationBTime: [''],
      escalationBSummary: [''],
      escalationCEms: [false],
      escalationCEmsTime: [''],
      escalationCFoicNotified: [false],
      escalationCMedControl: [false],

      // Clinical Situation Classification
      clinSitRoutine: [false],
      clinSitMedicalConcern: [false],
      clinSitLifeThreatening: [false],

      // Actions Taken
      actionFollowedMedCtrl: [false],
      actionFollowedProtocol: [false],
      actionPatientStabilized: [false],
      actionContinuedMonitoring: [false],
      actionDocumented: [false],
      actionNotes: [''],

      // Outcome / Disposition
      dispositionContinuedCare: [false],
      dispositionTransportEms: [false],
      dispositionCareTransferredEms: [false],
      dispositionMedControlOversight: [false],

      // Communication Log
      commLogSupPm: [null],
      commLogSupPmTime: [''],
      commLogMedCtrl: [null],
      commLogMedCtrlTime: [''],
      commLogEms: [null],
      commLogEmsTime: [''],

      // ── Cardiac Arrest ───────────────────────────────────────────────────
      // Incident Info
      caDateTime: [''],
      caLocationFacility: [false],
      caLocationTransport: [false],
      caLocationAircraft: [false],
      caFlightTransportId: [''],
      caDestination: [''],

      // Patient Info
      caANumber: [''],

      // Initial Assessment
      caUnresponsive: [false],
      caApneic: [false],
      caPulseless: [false],
      caTimeArrestRecognized: [''],

      // Immediate Actions
      caFoicNotified: [false],
      caAircraftDiversion: [false],
      caCprStarted: [false],
      caFirmSurface: [false],
      caAedRequested: [false],
      caOxygenPrepared: [false],
      caEmkObtained: [false],

      // CPR / Resuscitation
      caCprStartTime: [''],
      caCompContinuous: [null],
      caAirwayBvm: [false],
      caAirwayAdvanced: [false],
      caAirwayNone: [false],
      caOxygenApplied: [null],

      // AED / Defibrillation
      caAedAppliedTime: [''],
      caRhythmShockable: [''],
      caShocksDelivered: [''],

      // Medications / IV Access
      caIvAccess: [null],
      caFluidsGiven: [null],
      caMedications: [''],

      // ROSC
      caRoscAchieved: [null],
      caTimeOfRosc: [''],

      // Post-ROSC Status
      caPostBp: [''],
      caPostHr: [''],
      caPostRr: [''],
      caPostSpo2: [''],
      caPostLocUnresponsive: [false],
      caPostLocImproving: [false],
      caPostLocAlert: [false],

      // Ongoing Care
      caHighFlowO2: [false],
      caIvFluid: [false],
      caGlucoseChecked: [false],
      caContinuousMonitoring: [false],
      caAclsContinued: [false],

      // Flight / Transport
      caFlightTimeRemaining: [''],
      caDiversionConfirmed: [false],
      caEmsArranged: [false],
      caMedControlConsulted: [false],

      // Communication / Notifications
      caFoicNotif: [false],
      caCaptainNotif: [false],
      caMedControlContact: [false],
      caSupervisorNotif: [false],

      // Handoff to EMS
      caEmsArrivalTime: [''],
      caHandoffCompleted: [null],
      caHandoffArrestTime: [''],
      caHandoffCprStart: [''],
      caHandoffAedShocks: [''],
      caHandoffRosc: [null],
      caHandoffInterventions: [''],

      // Post-Event Actions
      caCareTransferred: [false],
      caSceneStabilized: [false],
      caDebriefCompleted: [false],

      // ── EMS Activation / In-Flight Medical Emergency ─────────────────────
      // Incident Info
      emsDateTime: [''],
      emsLocationGround: [false],
      emsLocationFacility: [false],
      emsLocationAircraft: [false],
      emsFlightTransportId: [''],
      emsDestination: [''],

      // Patient Info
      emsANumber: [''],
      emsCondition: [''],

      // EMS Activation
      emsActivated: [false],
      emsTimeActivated: [''],
      emsReasonActivation: [''],
      emsWhoActivated: [''],

      // Initial Assessment
      emsLocAlert: [false],
      emsLocAltered: [false],
      emsLocUnresponsive: [false],
      emsCondStable: [false],
      emsCondUnstable: [false],
      emsCondCritical: [false],
      emsPrimarySymptoms: [''],

      // Interventions Prior to EMS Arrival
      emsAirwayMgmt: [false],
      emsOxygen: [false],
      emsIvAccess: [false],
      emsFluids: [false],
      emsMedGiven: [false],
      emsMedDetails: [''],
      emsPositioning: [false],
      emsMonitoring: [false],
      emsInterventionNotes: [''],

      // Vital Signs
      emsBp: [''],
      emsHr: [''],
      emsRr: [''],
      emsTemp: [''],
      emsSpo2: [''],
      emsTrendNotes: [''],

      // Patient Status During Care
      emsStatusImproved: [false],
      emsStatusUnchanged: [false],
      emsStatusWorsened: [false],
      emsStatusNotes: [''],

      // EMS Handoff
      emsTimeArrived: [''],
      emsReportGiven: [null],
      emsHandoffFindings: [''],

      // Post-Handoff Actions
      emsCareTransferred: [false],
      emsPaxNoLongerInCustody: [false],
      emsSceneStabilized: [false],

      // Flight / Transport Decision
      emsFlightTimeRemaining: [''],
      emsContinueFlight: [false],
      emsEmsAtDestination: [false],
      emsDiversionConsidered: [false],
      emsDecisionReason: [''],

      // Communication / Notifications
      emsFoicNotified: [false],
      emsCaptainNotified: [false],
      emsSupervisorNotified: [false],
      emsTimeNotified: [''],

      // Debrief
      emsSupervisorContacted: [null],
      emsDebriefTime: [''],
      emsDebriefSummary: [''],

      // Agency Transferred
      emsAgencyName: [''],
      emsAgencyDateTime: [''],

      // ── Seizure Activity ──────────────────────────────────────────────────
      // Incident Info
      szDateTime: [''],
      szLocationFacility: [false],
      szLocationTransport: [false],
      szLocationAircraft: [false],
      szNotifiedBy: [''],
      szFoicNotified: [null],

      // Patient Info
      szANumber: [''],

      // Seizure Event
      szTimeStarted: [''],
      szTimeEnded: [''],
      szDuration: [''],

      // Observed Activity
      szTonicClonic: [false],
      szFocal: [false],
      szUnknownType: [false],
      szFullBody: [false],
      szPartial: [false],
      szOtherActivity: [false],
      szOtherActivityText: [''],
      szLossOfConsciousness: [false],
      szIncontinence: [false],
      szOralTrauma: [false],

      // Immediate Actions
      szPositionedOnSide: [false],
      szAirwayProtected: [false],
      szInjuryPrevention: [false],
      szStayedWithPatient: [false],

      // Post-Ictal Assessment
      szPostLocAlert: [false],
      szPostLocConfused: [false],
      szPostLocUnresponsive: [false],
      szBehaviorCalm: [false],
      szBehaviorAgitated: [false],
      szBehaviorLethargic: [false],
      szAirwayPatent: [false],
      szAirwayCompromised: [false],
      szComplaintHeadache: [false],
      szComplaintFatigue: [false],
      szComplaintOther: [false],
      szComplaintOtherText: [''],

      // Vitals (Post-Seizure)
      szBp: [''],
      szHr: [''],
      szRr: [''],
      szTemp: [''],
      szSpo2: [''],
      szRepeatVitals: [''],

      // History
      szKnownSeizureDisorder: [''],
      szMedicationsReviewed: [null],
      szAllergiesReviewed: [null],

      // Interventions
      szOxygen: [false],
      szIvAccess: [false],
      szFluids: [false],
      szAirwaySupport: [false],
      szMovedToMonitored: [false],

      // Clinical Considerations
      szProlongedSeizure: [false],
      szRecurrentSeizures: [false],
      szNoPriorHistory: [false],
      szExtendedPostIctal: [false],

      // Response / Status
      szReturnedToBaseline: [false],
      szImproving: [false],
      szNoChange: [false],
      szWorsening: [false],
      szStatusNotes: [''],

      // Notifications / Escalation
      szFoicUpdated: [false],
      szMedControlConsulted: [false],
      szCaptainNotified: [false],
      szEmsRequested: [false],
      szSupervisorNotified: [false],

      // Disposition
      szContinueMonitoring: [false],
      szPrepareEmsHandoff: [false],
      szDiversionConsidered: [false],

      // Monitoring
      szFrequentReassessment: [null],
      szContinuousObservation: [null],

      // ── Chest Pain ────────────────────────────────────────────────────────
      // Incident Info
      cpDateTime: [''],
      cpLocationFacility: [false],
      cpLocationTransport: [false],
      cpLocationAircraft: [false],
      cpEscortStaff: [''],

      // Patient Info
      cpANumber: [''],

      // Initial Status
      cpAmbulatory: [false],
      cpAssisted: [false],
      cpUnableToAmbulate: [false],
      cpLocAlert: [false],
      cpLocAltered: [false],
      cpLocUnresponsive: [false],
      cpDistressNone: [false],
      cpDistressMild: [false],
      cpDistressMod: [false],
      cpDistressSevere: [false],

      // Subjective
      cpPatientStatement: [''],

      // Pain Assessment
      cpOnsetSudden: [false],
      cpOnsetGradual: [false],
      cpOnsetTime: [''],
      cpPainLocation: [''],
      cpRadiationNone: [false],
      cpRadiationArm: [false],
      cpRadiationJaw: [false],
      cpRadiationBack: [false],
      cpRadiationOther: [false],
      cpRadiationOtherText: [''],
      cpQualityPressure: [false],
      cpQualitySharp: [false],
      cpQualityBurning: [false],
      cpQualityTightness: [false],
      cpPainSeverity: [''],
      cpDuration: [''],

      // Associated Symptoms
      cpSob: [false],
      cpNausea: [false],
      cpVomiting: [false],
      cpDiaphoresis: [false],
      cpDizziness: [false],
      cpPalpitations: [false],
      cpAnxiety: [false],
      cpCough: [false],
      cpFever: [false],
      cpOtherSymptom: [false],
      cpOtherSymptomText: [''],

      // Vitals
      cpBp: [''],
      cpHr: [''],
      cpRr: [''],
      cpTemp: [''],
      cpSpo2: [''],
      cpRepeatVitals: [''],

      // Focused Assessment
      cpCardiacHistory: [false],
      cpHtn: [false],
      cpDiabetes: [false],
      cpSmoker: [false],
      cpAnxietyHistory: [false],
      cpGerd: [false],
      cpTrauma: [false],
      cpMedsReviewed: [false],
      cpAllergiesReviewed: [false],

      // Rule-Out Considerations
      cpRoCardiac: [false],
      cpRoAnxiety: [false],
      cpRoGerd: [false],
      cpRoMusculoskeletal: [false],
      cpRoPulmonary: [false],
      cpRoOther: [false],
      cpRoOtherText: [''],

      // Interventions
      cpMovedToObservation: [false],
      cpAedAvailable: [false],
      cpOxygen: [false],
      cpIvAccess: [false],
      cpFluids: [false],
      cpAsa: [false],
      cpNtg: [false],
      cpNtgDoses: [''],
      cpSbpPriorNtg: [''],

      // Response to Treatment
      cpResponseImproved: [false],
      cpResponseNoChange: [false],
      cpResponseWorsened: [false],
      cpResponseNotes: [''],

      // Notifications / Escalation
      cpFoicNotified: [false],
      cpMedControl: [false],
      cpSupervisorNotified: [false],

      // Disposition
      cpContinueMonitoring: [false],
      cpEmsRequested: [false],
      cpDiversionInitiated: [false],

      // Monitoring
      cpFrequentVitals: [null],
      cpReassessmentCompleted: [null],

      // ── Violent Incident ──────────────────────────────────────────────────
      // Incident Info
      viDateTimeIncident: [''],
      viAssessmentTime: [''],
      viLocation: [''],
      viTypeInmateInmate: [false],
      viTypeInmateStaff: [false],
      viTypeUseOfForce: [false],
      viTypeOther: [false],
      viTypeOtherText: [''],

      // PAX Info
      viPaxIds: [''],

      // Initial Status
      viAmbulatory: [false],
      viWheelchair: [false],
      viStretcher: [false],
      viLocAlert: [false],
      viLocAltered: [false],
      viLocUnresponsive: [false],
      viBehaviorCalm: [false],
      viBehaviorAgitated: [false],
      viBehaviorCombative: [false],
      viBehaviorOther: [false],
      viBehaviorOtherText: [''],
      viDistressNone: [false],
      viDistressMild: [false],
      viDistressMod: [false],
      viDistressSevere: [false],

      // Subjective
      viPatientStatement: [''],
      viPainScale: [''],
      viHeadache: [false],
      viDizziness: [false],
      viLocSymptom: [false],
      viNausea: [false],
      viSob: [false],
      viPain: [false],
      viOtherComplaint: [false],
      viOtherComplaintText: [''],

      // Vitals
      viBp: [''],
      viHr: [''],
      viRr: [''],
      viTemp: [''],
      viSpo2: [''],

      // Primary Survey
      viAirwayPatent: [false],
      viAirwayCompromised: [false],
      viBreathingNormal: [false],
      viBreathingLabored: [false],
      viCirculationStable: [false],
      viCirculationBleeding: [false],

      // Injury Assessment
      viNoneObserved: [false],
      viAbrasionChecked: [false],
      viAbrasion: [''],
      viLacerationChecked: [false],
      viLaceration: [''],
      viContusionChecked: [false],
      viContusion: [''],
      viSwellingChecked: [false],
      viSwelling: [''],
      viBleedingControlled: [false],
      viBleedingActive: [false],
      viHeadInjuryNone: [false],
      viHeadInjuryLoc: [false],
      viHeadInjuryConfusion: [false],
      viHeadInjuryVomiting: [false],
      viHeadInjuryUnequal: [false],

      // Neuro Check
      viAoPerson: [false],
      viAoPlace: [false],
      viAoTime: [false],
      viAoSituation: [false],
      viPupilsEqual: [false],
      viPupilsUnequal: [false],
      viPupilsReactive: [false],
      viMotorNormal: [false],
      viMotorDeficit: [false],
      viMotorDeficitText: [''],

      // Use of Force / Restraints
      viNotApplicable: [false],
      viForceType: [''],
      viRestraints: [false],
      viCirculationChecked: [null],
      viForceInjuries: [''],

      // Interventions
      viIntNone: [false],
      viFirstAid: [false],
      viWoundCare: [false],
      viIce: [false],
      viMedication: [false],
      viMedicationText: [''],
      viImmobilization: [false],
      viOtherIntervention: [false],
      viOtherInterventionText: [''],

      // Disposition
      viReturnToFacility: [false],
      viObservationFlight: [false],
      viEmsTransfer: [false],

      // Notifications
      viSiteSupervisor: [false],
      viMedicalDirector: [false],
      viFoicAdvised: [false],
      viOtherNotif: [''],

      // Follow-Up
      viRecheckNeeded: [null],
      viRecheckWhen: [''],
      viSpecialInstructions: ['']
    });
  }

  toggleSection(key: ScSectionKey) {
    this.sectionOpen[key] = !this.sectionOpen[key];
  }

  openAndScrollTo(key: ScSectionKey, id: string) {
    this.sectionOpen[key] = true;
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  openTimePicker(input: HTMLInputElement) {
    if (typeof input.showPicker === 'function') {
      input.showPicker();
    } else {
      input.focus();
    }
  }

  applyScTimePicker(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    const rawValue = (input.value || '').toString().trim();
    if (!rawValue) return;
    const normalized = this.normalizeTimeValue(rawValue);
    const control = this.scForm.get(controlName);
    if (!control) return;
    control.setValue(normalized);
    control.markAsTouched();
  }

  private normalizeTimeValue(value: string): string {
    if (/^\d{4}$/.test(value)) return value;
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
    return match ? `${match[1]}${match[2]}` : value;
  }

  setStrVal(controlName: string, value: string) {
    const control = this.scForm.get(controlName);
    if (!control) return;
    control.setValue(control.value === value ? '' : value);
  }

  setNo(controlName: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const control = this.scForm.get(controlName);
    if (!control) return;
    if (checked) {
      control.setValue(false, { emitEvent: true });
    }
  }

  async loadFromReport() {
    const report = await this.reportService.getLatestReport();
    if (!report) return;

    // Sync required-field highlights from Nursing Report tab toggles
    this.scTriggers = {
      wrap: report.specialCircumstancePaxWrapped === true,
      medControl: report.specialCircumstanceMedicalControlContacted === true,
      cardiacArrest: report.specialCircumstanceCardiacArrest === true,
      ems: report.specialCircumstanceMedicalComplaintAssessed === true,
      seizure: report.specialCircumstanceSeizure === true,
      chestPain: report.specialCircumstanceChestPain === true,
      violentIncident: report.specialCircumstanceViolentIncident === true
    };

    // Auto-expand sections flagged Yes; collapse the rest
    const anyTriggered = Object.values(this.scTriggers).some(v => v);
    if (anyTriggered) {
      this.sectionOpen = { ...this.scTriggers };
    }

    if (report.specialCircumstancesData) {
      this.scForm.patchValue(report.specialCircumstancesData, { emitEvent: false });
    }
  }

  async save() {
    const report = await this.reportService.getLatestReport();
    if (!report) {
      const toast = await this.toastCtrl.create({
        message: 'Create a report first, then add special circumstances.',
        duration: 2000,
        color: 'warning'
      });
      toast.present();
      return;
    }

    const updatedReport = {
      ...report,
      specialCircumstancesData: this.scForm.value
    } as NursingReport;

    await this.reportService.saveReport(updatedReport);
    const toast = await this.toastCtrl.create({
      message: 'Special Circumstances saved!',
      duration: 2000,
      color: 'success'
    });
    toast.present();
  }
}
