export enum AppScreen {
  SPLASH = 'SPLASH',
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  PATIENTS = 'PATIENTS',
  SETTINGS = 'SETTINGS',
  PROFILE = 'PROFILE',
  PATIENT_PROFILE = 'PATIENT_PROFILE',
  ADD_PATIENT = 'ADD_PATIENT',
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

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  admittedDate: string;
  scans?: AnalysisResult[];
}

export interface UserProfile {
  uid: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  specialization: string;
  email: string;
  photoURL?: string;
}