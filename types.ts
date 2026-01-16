export enum AppScreen {
  SPLASH = 'SPLASH',
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  PATIENT_PROFILE = 'PATIENT_PROFILE',
  UPLOAD = 'UPLOAD',
  QUALITY_CHECK = 'QUALITY_CHECK',
  REPORT = 'REPORT',
  AI_REASONING = 'AI_REASONING',
}

export interface Region {
  label: string;
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface AnalysisResult {
  finalGrade: string;
  clinicianNotes: string;
  reasoning: string;
  date: string;
  regions?: Region[];
}

export interface PatientDetails {
  id: string;
  name: string; // Mocked
  dob: string; // Mocked
}