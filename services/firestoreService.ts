import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Patient, AnalysisResult, UserProfile } from '../types';

// Collection path: users/{userId}/patients/{patientId}
const getPatientsCollection = (userId: string) => {
  return collection(db, 'users', userId, 'patients');
};

const getPatientDoc = (userId: string, patientId: string) => {
  return doc(db, 'users', userId, 'patients', patientId);
};

// Add a new patient
export const addPatient = async (userId: string, patient: Patient): Promise<void> => {
  try {
    const patientRef = getPatientDoc(userId, patient.id);
    await setDoc(patientRef, patient);
  } catch (error) {
    console.error('Error adding patient:', error);
    throw error;
  }
};

// Get all patients for a user
export const getPatients = async (userId: string): Promise<Patient[]> => {
  try {
    const patientsRef = getPatientsCollection(userId);
    const querySnapshot = await getDocs(patientsRef);
    
    const patients: Patient[] = [];
    querySnapshot.forEach((doc) => {
      patients.push(doc.data() as Patient);
    });
    
    return patients;
  } catch (error) {
    console.error('Error getting patients:', error);
    throw error;
  }
};

// Get a single patient
export const getPatient = async (userId: string, patientId: string): Promise<Patient | null> => {
  try {
    const patientRef = getPatientDoc(userId, patientId);
    const docSnap = await getDoc(patientRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as Patient;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting patient:', error);
    throw error;
  }
};

// Update patient (e.g., add scan results)
export const updatePatient = async (userId: string, patientId: string, updates: Partial<Patient>): Promise<void> => {
  try {
    const patientRef = getPatientDoc(userId, patientId);
    await updateDoc(patientRef, updates);
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
};

// Add scan to patient
export const addScanToPatient = async (userId: string, patientId: string, scan: AnalysisResult): Promise<void> => {
  try {
    const patient = await getPatient(userId, patientId);
    if (patient) {
      const updatedScans = [...(patient.scans || []), scan];
      await updatePatient(userId, patientId, { scans: updatedScans });
    }
  } catch (error) {
    console.error('Error adding scan to patient:', error);
    throw error;
  }
};

// Delete a patient
export const deletePatient = async (userId: string, patientId: string): Promise<void> => {
  try {
    const patientRef = getPatientDoc(userId, patientId);
    await deleteDoc(patientRef);
  } catch (error) {
    console.error('Error deleting patient:', error);
    throw error;
  }
};

// Real-time listener for patients
export const subscribeToPatients = (
  userId: string, 
  onUpdate: (patients: Patient[]) => void
): Unsubscribe => {
  const patientsRef = getPatientsCollection(userId);
  
  return onSnapshot(patientsRef, (querySnapshot) => {
    const patients: Patient[] = [];
    querySnapshot.forEach((doc) => {
      patients.push(doc.data() as Patient);
    });
    onUpdate(patients);
  }, (error) => {
    console.error('Error in patients subscription:', error);
  });
};

// ==================== USER PROFILE FUNCTIONS ====================

const getUserProfileDoc = (userId: string) => {
  return doc(db, 'userProfiles', userId);
};

// Create or update user profile
export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  try {
    const profileRef = getUserProfileDoc(profile.uid);
    await setDoc(profileRef, profile, { merge: true });
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const profileRef = getUserProfileDoc(userId);
    const docSnap = await getDoc(profileRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    const profileRef = getUserProfileDoc(userId);
    await updateDoc(profileRef, updates);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Real-time listener for user profile
export const subscribeToUserProfile = (
  userId: string,
  onUpdate: (profile: UserProfile | null) => void
): Unsubscribe => {
  const profileRef = getUserProfileDoc(userId);
  
  return onSnapshot(profileRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data() as UserProfile);
    } else {
      onUpdate(null);
    }
  }, (error) => {
    console.error('Error in user profile subscription:', error);
  });
};
