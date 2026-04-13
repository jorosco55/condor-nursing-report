export interface NursingReport {
  id?: number;
  date: string;
  site: string;
  iceFlightRN: string;
  secondICEFlightRN: string;
  thirdICEFlightRN?: string;
  fourthICEFlightRN?: string;
  fifthICEFlightRN?: string;
  tailNumber: string;
  missionNumber: string;
  siteStops: string;
  foicTitle: string;
  asoLead: string;
  preflightMEBCheck: boolean;
  preflightMEBCheckTime?: string;
  preflightMEKO2AED: boolean;
  preflightMEKO2AEDTime?: string;
  safetyBriefingCompleted: boolean;
  safetyBriefingCompletedTime?: string;
  seatBeltsSecured: boolean;
  seatBeltsSecuredTime?: string;
  narcRecordStatus: string;
  medicationRecordStatus: string;
  
  // Logistics
  showtimeZ1: string;
  blockTimeZ1: string;
  endTimeZ1: string;

  wheelsUpSite: string;
  wheelsUpTimeL: string;
  wheelsUpTime: string;
  wheelsDownSite: string;
  wheelsDownTimeL: string;
  wheelsDownTime: string;
  wheelsUpEvents?: WheelsEvent[];
  wheelsDownEvents?: WheelsEvent[];
  doorsCloseTime?: string;
  doorsOpenTime?: string;
  doorEvents?: DoorEvent[];

  // Record Status
  reportStatus: 'Open' | 'Closed';
  
  showtimeZ2: string; // RON
  blockTimeZ2: string; // RON
  endTimeZ2: string; // RON
  ronUsed: boolean;
  ronStartDate?: string;
  ronEndDate?: string;

  // Narrative
  notes: NarrativeNote[];

  // Narcotics
  narcotics: NarcoticEntry[];

  // Transfer of Care
  transferOfCareSite: string;
  receivedCare: boolean;
  transferOfCareComment?: string;

  // PAX Medicated
  paxMedicated: PaxMedicationEntry[];

  // Cleared Medical with FOIC
  clearedMedicalWithFoic: boolean;
  paxTotal: number | null;
  paxFemales: number | null;
  paxFemaleNotPregnantConfirmed: number | null;
  paxMale: number | null;
  paxMinors: number | null;
  paxWithMedications: number | null;
  paxNeeding72HrAssessment: number | null;

  // Operational
  allPaxSafelyOnboarded: boolean;
  allPaxGivenFoodWaterLavBreaks: boolean;

  // Delay
  delayReasons: string;
  delayEntries?: DelayEntry[];

  // Special Circumstances — home page toggles (one per SC tab section)
  specialCircumstancePaxWrapped: boolean;            // WRAP Restraint
  specialCircumstanceMedicalControlContacted: boolean; // Medical Control / Command & Escalation
  specialCircumstanceCardiacArrest?: boolean;         // Cardiac Arrest
  specialCircumstanceMedicalComplaintAssessed: boolean; // EMS Activation / In-Flight Medical Emergency
  specialCircumstanceSeizure?: boolean;               // Seizure Activity
  specialCircumstanceChestPain?: boolean;             // Chest Pain
  specialCircumstanceViolentIncident: boolean;        // Violent Incident
  // Legacy fields — kept for backward-compat with saved data
  specialCircumstanceSiteSupervisorAdvised?: boolean;
  specialCircumstanceMedicalEmergencyOnboardEms?: boolean;
  
  // Special Circumstances (detailed form data from Special Circ. tab)
  specialCircumstancesData?: Record<string, unknown>;

  // Signatures
  rnSignature?: string; // Base64
  dateSigned?: string;
  secondRnSignature?: string; // Base64
  secondDateSigned?: string;
}

export interface DelayEntry {
  timeL: string;
  reasons: string[];
}

export interface WheelsEvent {
  site: string;
  timeL: string;
  timeZ: string;
}

export interface DoorEvent {
  type: 'Close' | 'Open';
  timestamp: string;
}

export interface NarrativeNote {
  timeL: string;
  rn: string;    // Selected RN for this note
  note: string;
}

export interface PaxMedicationEntry {
  aNumber: string;
  medication: string;
  dose: string;
  doseUnit: string;
  route: string;
  prnGiven: boolean;
  vitalsNa: boolean;
  bpSystolic: string;
  bpDiastolic: string;
  hr: string;
  resp: string;
  temp: string;
  o2Sat: string;
  ratePercent: string;
  annotatedOnMtf: string;
}

export interface NarcoticEntry {
  foicNameSiteMNum: string;
  date: string;
  flightNurseName: string;
  paxId: string;
  narcoticDescription: string;
  amountReceived: string;
  receivedFrom: string;
  receivedFromSignature: string;
  amountDispersedEnRoute: string;
  amountRemaining: string;
  releasedTo: string;
  releasedToSignature: string;
  flightNurseSignature: string;
}
