export interface NursingReport {
  id?: number;
  date: string;
  site: string;
  iceFlightRN: string;
  secondICEFlightRN: string;
  tailNumber: string;
  missionNumber: string;
  siteStops: string;
  foicTitle: string;
  asoLead: string;
  preflightMEBCheck: boolean;
  preflightMEKO2AED: boolean;
  safetyBriefingCompleted: boolean;
  seatBeltsSecured: boolean;
  narcRecordStatus: string;
  medicationRecordStatus: string;
  
  // Logistics
  showtimeZ1: string;
  blockTimeZ1: string;
  endTimeZ1: string;

  wheelsUpSite: string;
  wheelsUpTime: string;
  wheelsDownSite: string;
  wheelsDownTime: string;
  
  showtimeZ2: string; // RON
  blockTimeZ2: string; // RON
  endTimeZ2: string; // RON
  ronUsed: boolean;

  // Narrative
  notes: NarrativeNote[];

  // Narcotics
  narcotics: NarcoticEntry[];

  // Transfer of Care
  transferOfCareSite: string;
  receivedCare: boolean;

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
  delayReasons: string[];

  // Special Circumstances
  specialCircumstancePaxWrapped: boolean;
  specialCircumstanceMedicalComplaintAssessed: boolean;
  specialCircumstanceMedicalControlContacted: boolean;
  specialCircumstanceSiteSupervisorAdvised: boolean;
  specialCircumstanceMedicalEmergencyOnboardEms: boolean;
  
  // Signatures
  rnSignature?: string; // Base64
  dateSigned?: string;
  secondRnSignature?: string; // Base64
  secondDateSigned?: string;
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
  bs: string;
  annotatedOnMtf: string;
}

export interface NarcoticEntry {
  narcoticName: string;
  dosageUnit: string;
  timeZ: string;
  rnName: string;
  rnSignature: string;
}
