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
  narcRecord: string;
  
  // Logistics
  showtimeZ1: string;
  blockTimeZ1: string;
  endTimeZ1: string;
  
  showtimeZ2: string; // RON
  blockTimeZ2: string; // RON
  endTimeZ2: string; // RON
  ronUsed: boolean;

  // Narrative
  notes: NarrativeNote[];
  
  // Signatures
  rnSignature?: string; // Base64
  dateSigned?: string;
  secondRnSignature?: string; // Base64
  secondDateSigned?: string;
}

export interface NarrativeNote {
  timeL: string;
  note: string;
}
