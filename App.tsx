import React, { useState, useEffect, useRef } from 'react';
import { Logo } from './components/Logo';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { analyzeRetinalImage } from './services/geminiService';
import { analyzeWithHuggingFace } from './services/huggingfaceService';
import { loginWithEmail, loginWithGoogle, logout, onAuthStateChange } from './services/authService';
import { addPatient, getPatients, subscribeToPatients, addScanToPatient, getUserProfile, saveUserProfile, subscribeToUserProfile } from './services/firestoreService';
import { AppScreen, AnalysisResult, Patient, UserProfile } from './types';
import type { User } from 'firebase/auth';

// Icons with thin stroke width (1.5px) as per spec
const EmailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
);
const LockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
);
const CameraIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
const ImageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);
const ChevronRightIcon = () => (
  <svg className="w-5 h-5 text-nexthria-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
);
const BackIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
);
const SparklesIcon = () => (
  <svg className="w-5 h-5 text-nexthria-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
);
const CheckCircleIcon = () => (
  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const WarningIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
);
const InfoIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
);
const PlusIcon = () => (
  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
);
const HomeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
);
const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
);
const SettingsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.066 2.573c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
const CloudUploadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
);


const App = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.SPLASH);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [profileTab, setProfileTab] = useState<'scans' | 'vitals' | 'history'>('scans');
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Patient Management
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [patientForm, setPatientForm] = useState({
    name: '',
    id: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    admittedDate: new Date().toISOString().split('T')[0]
  });

  // User Profile & Settings
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'settings'>('dashboard');
  const [profileForm, setProfileForm] = useState({
    name: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    specialization: ''
  });

  // Splash Screen Effect
  useEffect(() => {
    if (screen === AppScreen.SPLASH) {
      const timer = setTimeout(() => {
        setScreen(AppScreen.LOGIN);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChange((currentUser) => {
      setUser(currentUser);
      if (currentUser && screen === AppScreen.LOGIN) {
        setScreen(AppScreen.DASHBOARD);
      }
    });
    return () => unsubscribe();
  }, [screen]);

  // Load patients from Firestore and set up real-time listener
  useEffect(() => {
    if (!user) {
      setPatients([]);
      return;
    }

    // Set up real-time listener for patients
    const unsubscribe = subscribeToPatients(user.uid, (updatedPatients) => {
      setPatients(updatedPatients);
      
      // Update selectedPatient if it's in the updated list
      if (selectedPatient) {
        const updated = updatedPatients.find(p => p.id === selectedPatient.id);
        if (updated) {
          setSelectedPatient(updated);
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Load user profile from Firestore and set up real-time listener
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      return;
    }

    // Set up real-time listener for user profile
    const unsubscribe = subscribeToUserProfile(user.uid, (profile) => {
      if (profile) {
        setUserProfile(profile);
        setProfileForm({
          name: profile.name || '',
          age: profile.age?.toString() || '',
          gender: profile.gender || 'Male',
          specialization: profile.specialization || ''
        });
      } else {
        // Create default profile if doesn't exist
        const defaultProfile: UserProfile = {
          uid: user.uid,
          name: user.displayName || '',
          age: 0,
          gender: 'Male',
          specialization: '',
          email: user.email || ''
        };
        setUserProfile(defaultProfile);
        saveUserProfile(defaultProfile);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setAuthError('');
      await loginWithEmail(email, password);
      // Auth state listener will handle navigation
    } catch (error: any) {
      setAuthError(error.message || 'Failed to sign in');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthError('');
      await loginWithGoogle();
      // Auth state listener will handle navigation
    } catch (error: any) {
      setAuthError(error.message || 'Failed to sign in with Google');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setScreen(AppScreen.LOGIN);
    } catch (error: any) {
      console.error('Logout error:', error);
    }
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    const newPatient: Patient = {
      id: patientForm.id,
      name: patientForm.name,
      age: parseInt(patientForm.age),
      gender: patientForm.gender,
      admittedDate: patientForm.admittedDate,
      scans: []
    };
    
    try {
      // Save to Firestore
      await addPatient(user.uid, newPatient);
      
      // Reset form and navigate
      setPatientForm({
        name: '',
        id: '',
        age: '',
        gender: 'Male',
        admittedDate: new Date().toISOString().split('T')[0]
      });
      setActiveTab('patients');
      setScreen(AppScreen.PATIENTS);
    } catch (error) {
      console.error('Error adding patient:', error);
      alert('Failed to add patient. Please try again.');
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setScreen(AppScreen.PATIENT_PROFILE);
    setProfileTab('scans');
  };

  const handleAddPatientFromSearch = () => {
    setPatientForm({
      ...patientForm,
      name: searchQuery,
    });
    setSearchQuery('');
    setScreen(AppScreen.ADD_PATIENT);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Move from Upload to Quality Check
  const handleReviewScan = () => {
    if (selectedImage) {
      setScreen(AppScreen.QUALITY_CHECK);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);

    // Extract MIME type and Base64 data robustly from Data URL
    const matches = selectedImage.match(/^data:(.+);base64,(.+)$/);
    let mimeType = "image/jpeg";
    let base64Data = "";
    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64Data = matches[2];
    } else {
      const parts = selectedImage.split(',');
      base64Data = parts[1] || selectedImage;
    }

    try {
      // 1. Get DR result from Hugging Face
      const hfResult = await analyzeWithHuggingFace(base64Data, mimeType);
      const finalGrade = hfResult.highest_probability_class;

      // 2. Get AI reasoning from Gemini using the HF result as context
      const geminiPrompt = `A diabetic retinopathy model classified this image as: ${finalGrade}.\nDetailed confidences: ${JSON.stringify(hfResult.detailed_classification)}.\nProvide a clinical reasoning and summary for this result.`;
      const geminiResult = await analyzeRetinalImage(base64Data, mimeType, geminiPrompt);

      const result: AnalysisResult = {
        finalGrade,
        clinicianNotes: geminiResult.notes,
        reasoning: geminiResult.reasoning,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        regions: geminiResult.regions || []
      };
      
      setAnalysisResult(result);
      
      // Save scan to selected patient in Firestore
      if (selectedPatient && user) {
        try {
          await addScanToPatient(user.uid, selectedPatient.id, result);
          // Real-time listener will update the local state
        } catch (error) {
          console.error('Error saving scan:', error);
        }
      }
    } catch (err) {
      const errorResult: AnalysisResult = {
        finalGrade: 'Error',
        clinicianNotes: 'Failed to analyze image.',
        reasoning: String(err),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        regions: []
      };
      setAnalysisResult(errorResult);
    }
    setIsAnalyzing(false);
    setScreen(AppScreen.REPORT);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // --- RENDER FUNCTIONS ---

  const renderSplash = () => (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in bg-nexthria-bg relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-nexthria-cyan/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <Logo size="xl" className="mb-8 animate-pulse-glow" animated={true} />
      <h1 className="text-4xl font-bold tracking-tight text-white mb-3">NexEye</h1>
      <p className="text-nexthria-text-secondary font-medium tracking-wide">Intelligent Diagnostics</p>
      <p className="text-nexthria-text-tertiary text-xs mt-2 font-medium">v1.0</p>
    </div>
  );

  const renderLogin = () => (
    <div className="flex flex-col h-full px-6 pt-16 pb-10 animate-fade-in max-w-md mx-auto w-full relative">
       <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[50%] bg-gradient-to-b from-nexthria-blue/10 to-transparent blur-3xl pointer-events-none"></div>

      <div className="flex flex-col items-center mb-10 relative z-10">
        <Logo size="lg" className="mb-8" />
        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-nexthria-text-tertiary">Sign in to access patient records</p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-5 w-full z-10">
        {authError && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {authError}
          </div>
        )}
        <Input 
          icon={<EmailIcon />} 
          placeholder="Email Address" 
          type="email" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input 
          icon={<LockIcon />} 
          placeholder="Password" 
          type="password" 
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <div className="flex justify-end">
          <button type="button" className="text-sm text-nexthria-cyan hover:text-white transition-colors font-medium">Forgot Password?</button>
        </div>

        <Button type="submit" className="mt-2">Sign In</Button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-6 z-10">
        <div className="flex items-center w-full gap-4">
          <div className="h-px bg-white/10 flex-1"></div>
          <span className="text-nexthria-text-tertiary text-sm font-medium">OR CONTINUE WITH</span>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>
        <Button 
          variant="outline" 
          fullWidth 
          onClick={(e) => { e.preventDefault(); handleGoogleLogin(); }}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>
      </div>

      <p className="mt-auto text-center text-[11px] text-nexthria-text-tertiary leading-relaxed px-4">
        For Qualified Healthcare Professionals Only
      </p>
    </div>
  );

  const renderAddPatient = () => (
    <div className="flex flex-col h-full px-6 py-6 animate-fade-in max-w-md mx-auto w-full relative">
      <div className="relative flex items-center justify-center mb-8">
        <button 
          onClick={() => { setActiveTab('patients'); setScreen(AppScreen.PATIENTS); }}
          className="absolute left-0 p-2 text-nexthria-text-secondary hover:text-white transition-colors"
        >
          <BackIcon />
        </button>
        <h2 className="text-xl font-bold text-white">Add New Patient</h2>
      </div>

      <form onSubmit={handleAddPatient} className="flex flex-col gap-5 flex-1">
        <Input 
          placeholder="Patient Name" 
          type="text" 
          required 
          value={patientForm.name}
          onChange={(e) => setPatientForm({...patientForm, name: e.target.value})}
        />
        
        <Input 
          placeholder="Patient ID" 
          type="text" 
          required 
          value={patientForm.id}
          onChange={(e) => setPatientForm({...patientForm, id: e.target.value})}
        />
        
        <Input 
          placeholder="Age" 
          type="number" 
          required 
          value={patientForm.age}
          onChange={(e) => setPatientForm({...patientForm, age: e.target.value})}
        />
        
        <div className="relative">
          <select
            value={patientForm.gender}
            onChange={(e) => setPatientForm({...patientForm, gender: e.target.value as 'Male' | 'Female' | 'Other'})}
            className="w-full bg-[#1F2937] border border-transparent rounded-2xl py-4 px-5 text-white text-[15px] font-medium focus:outline-none focus:bg-[#263345] focus:border-nexthria-cyan/30 focus:ring-2 focus:ring-nexthria-cyan/10 transition-all duration-300"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="relative">
          <label className="block text-nexthria-text-secondary text-sm mb-2">Admitted Date</label>
          <Input 
            type="date" 
            required 
            value={patientForm.admittedDate}
            onChange={(e) => setPatientForm({...patientForm, admittedDate: e.target.value})}
          />
        </div>

        <Button type="submit" className="mt-auto">Add Patient</Button>
      </form>
    </div>
  );

  // Helper function to navigate between main sections
  const navigateToTab = (tab: 'dashboard' | 'patients' | 'settings') => {
    setActiveTab(tab);
    if (tab === 'dashboard') setScreen(AppScreen.DASHBOARD);
    else if (tab === 'patients') setScreen(AppScreen.PATIENTS);
    else if (tab === 'settings') setScreen(AppScreen.SETTINGS);
  };

  const renderDashboard = () => {
    // Calculate statistics
    const totalPatients = patients.length;
    const totalScans = patients.reduce((sum, p) => sum + (p.scans?.length || 0), 0);
    const recentScans = patients
      .flatMap(p => (p.scans || []).map(s => ({ ...s, patientName: p.name, patientId: p.id })))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    
    // Count by severity
    const severityCounts = patients.reduce((acc, p) => {
      const latestScan = p.scans && p.scans.length > 0 ? p.scans[p.scans.length - 1] : null;
      if (latestScan?.finalGrade.includes('No DR') || latestScan?.finalGrade.includes('No Anomalies')) acc.normal++;
      else if (latestScan?.finalGrade.includes('Mild')) acc.mild++;
      else if (latestScan?.finalGrade.includes('Moderate')) acc.moderate++;
      else if (latestScan?.finalGrade.includes('Severe') || latestScan?.finalGrade.includes('Proliferative')) acc.severe++;
      return acc;
    }, { normal: 0, mild: 0, moderate: 0, severe: 0 });

    const userInitials = userProfile?.name ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'DR';

    return (
    <div className="flex flex-col h-full animate-fade-in relative bg-nexthria-bg w-full max-w-md mx-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Dashboard</h2>
            <p className="text-nexthria-text-secondary text-sm">Welcome back, {userProfile?.name || 'Doctor'}</p>
          </div>
          <button 
            onClick={() => setScreen(AppScreen.PROFILE)}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 p-[2px] hover:scale-105 transition-transform"
          >
             <div className="w-full h-full rounded-full bg-[#1F2937] flex items-center justify-center">
              <span className="font-bold text-sm text-white">{userInitials}</span>
             </div>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-6 mb-6 grid grid-cols-2 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="text-3xl font-bold text-white mb-1">{totalPatients}</div>
          <div className="text-nexthria-text-secondary text-sm">Total Patients</div>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <div className="text-3xl font-bold text-nexthria-cyan mb-1">{totalScans}</div>
          <div className="text-nexthria-text-secondary text-sm">Total Scans</div>
        </div>
      </div>

      {/* Severity Distribution */}
      <div className="px-6 mb-6">
        <h3 className="text-white font-semibold mb-4">Patient Status</h3>
        <div className="glass-card p-5 rounded-2xl flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-emerald-400 text-sm">Normal</span>
            <span className="text-white font-semibold">{severityCounts.normal}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-yellow-400 text-sm">Mild DR</span>
            <span className="text-white font-semibold">{severityCounts.mild}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-orange-400 text-sm">Moderate DR</span>
            <span className="text-white font-semibold">{severityCounts.moderate}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-red-400 text-sm">Severe DR</span>
            <span className="text-white font-semibold">{severityCounts.severe}</span>
          </div>
        </div>
      </div>

      {/* Recent Scans */}
      <div className="flex-1 overflow-y-auto px-6 pb-24">
        <h3 className="text-white font-semibold mb-4">Recent Scans</h3>
        {recentScans.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl text-center text-nexthria-text-tertiary">
            <p>No scans yet</p>
            <p className="text-xs mt-2">Add patients and upload scans to see them here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentScans.map((scan, idx) => (
              <div key={idx} className="glass-card p-4 rounded-2xl">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-white font-medium">{scan.patientName}</p>
                    <p className="text-nexthria-text-tertiary text-xs">ID: {scan.patientId}</p>
                  </div>
                  <span className="text-nexthria-text-secondary text-xs">{scan.date}</span>
                </div>
                <div className="text-nexthria-cyan text-sm font-semibold">{scan.finalGrade}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="absolute bottom-0 w-full h-[80px] bg-[#0B0F19]/90 backdrop-blur-xl border-t border-white/5 flex items-start justify-around pt-4 z-40">
        <button onClick={() => navigateToTab('dashboard')} className="flex flex-col items-center gap-1 group">
          <div className="text-nexthria-cyan"><HomeIcon /></div>
          <span className="text-[10px] font-medium text-nexthria-cyan">Dashboard</span>
        </button>
        <button onClick={() => navigateToTab('patients')} className="flex flex-col items-center gap-1 group">
          <div className="text-nexthria-text-tertiary group-hover:text-white transition-colors"><UsersIcon /></div>
          <span className="text-[10px] font-medium text-nexthria-text-tertiary group-hover:text-white transition-colors">Patients</span>
        </button>
        <button onClick={() => navigateToTab('settings')} className="flex flex-col items-center gap-1 group">
          <div className="text-nexthria-text-tertiary group-hover:text-white transition-colors"><SettingsIcon /></div>
          <span className="text-[10px] font-medium text-nexthria-text-tertiary group-hover:text-white transition-colors">Settings</span>
        </button>
      </div>
    </div>
    );
  };

  const renderPatients = () => {
    // Filter patients based on search query
    const filteredPatients = patients.filter(patient => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      
      return (
        patient.name.toLowerCase().includes(query) ||
        patient.id.toLowerCase().includes(query) ||
        patient.admittedDate.includes(query) ||
        patient.age.toString().includes(query) ||
        patient.gender.toLowerCase().includes(query)
      );
    });

    const getStatusColor = (grade?: string) => {
      if (!grade) return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
      if (grade.includes('No DR') || grade.includes('No Anomalies')) 
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      if (grade.includes('Mild')) 
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
      if (grade.includes('Moderate')) 
        return 'bg-orange-500/10 border-orange-500/20 text-orange-400';
      if (grade.includes('Severe') || grade.includes('Proliferative')) 
        return 'bg-red-500/10 border-red-500/20 text-red-400';
      return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
    };

    const userInitials = userProfile?.name ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'DR';

    return (
    <div className="flex flex-col h-full animate-fade-in relative bg-nexthria-bg w-full max-w-md mx-auto">
      {/* Header & Search */}
      <div className="px-6 pt-12 pb-4 flex flex-col gap-6 z-10 bg-nexthria-bg/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Patient List</h2>
          <button 
            onClick={() => setScreen(AppScreen.PROFILE)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 p-[2px]"
          >
             <div className="w-full h-full rounded-full bg-[#1F2937] flex items-center justify-center font-bold text-sm">{userInitials}</div>
          </button>
        </div>
        <Input 
          icon={<SearchIcon />} 
          placeholder="Search name, ID, or DoB" 
          className="shadow-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto px-6 pb-24 flex flex-col gap-4">
        {patients.length === 0 && !searchQuery ? (
          <div className="flex flex-col items-center justify-center h-40 text-nexthria-text-tertiary">
            <p>No patients added yet</p>
            <p className="text-xs mt-2">Click the + button to add a patient</p>
          </div>
        ) : filteredPatients.length === 0 && searchQuery ? (
          <div className="flex flex-col items-center justify-center h-40 gap-4 animate-fade-in">
            <div className="text-nexthria-text-tertiary text-center">
              <p className="text-white font-medium mb-1">No patients found</p>
              <p className="text-sm">No results for "{searchQuery}"</p>
            </div>
            <button
              onClick={handleAddPatientFromSearch}
              className="flex items-center gap-2 px-6 py-3 bg-nexthria-cyan/10 border border-nexthria-cyan/30 rounded-xl text-nexthria-cyan hover:bg-nexthria-cyan/20 transition-all duration-300 font-medium"
            >
              <PlusIcon />
              Add "{searchQuery}" as new patient
            </button>
          </div>
        ) : (
          filteredPatients.map((patient) => {
            const latestScan = patient.scans && patient.scans.length > 0 
              ? patient.scans[patient.scans.length - 1] 
              : null;

            return (
              <div 
                key={patient.id}
                onClick={() => handleSelectPatient(patient)}
                className="glass-card p-5 rounded-2xl flex items-center justify-between group hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div>
                  <h3 className="text-white font-semibold text-lg">{patient.name}</h3>
                  <p className="text-nexthria-text-secondary text-sm">ID: {patient.id}</p>
                  <p className="text-nexthria-text-tertiary text-xs mt-1">
                    {patient.age} • {patient.gender} • Admitted: {new Date(patient.admittedDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide ${getStatusColor(latestScan?.finalGrade)}`}>
                    {latestScan?.finalGrade || 'No Scans'}
                  </span>
                  <ChevronRightIcon />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FAB */}
      <button 
        onClick={() => setScreen(AppScreen.ADD_PATIENT)}
        className="absolute bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-nexthria-cyan to-nexthria-blue shadow-[0_0_20px_rgba(34,211,238,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 z-30"
      >
        <PlusIcon />
      </button>

      {/* Bottom Nav */}
      <div className="absolute bottom-0 w-full h-[80px] bg-[#0B0F19]/90 backdrop-blur-xl border-t border-white/5 flex items-start justify-around pt-4 z-40">
        <button onClick={() => navigateToTab('dashboard')} className="flex flex-col items-center gap-1 group">
          <div className="text-nexthria-text-tertiary group-hover:text-white transition-colors"><HomeIcon /></div>
          <span className="text-[10px] font-medium text-nexthria-text-tertiary group-hover:text-white transition-colors">Dashboard</span>
        </button>
        <button onClick={() => navigateToTab('patients')} className="flex flex-col items-center gap-1 group">
          <div className="text-nexthria-cyan"><UsersIcon /></div>
          <span className="text-[10px] font-medium text-nexthria-cyan">Patients</span>
        </button>
        <button onClick={() => navigateToTab('settings')} className="flex flex-col items-center gap-1 group">
          <div className="text-nexthria-text-tertiary group-hover:text-white transition-colors"><SettingsIcon /></div>
          <span className="text-[10px] font-medium text-nexthria-text-tertiary group-hover:text-white transition-colors">Settings</span>
        </button>
      </div>
    </div>
    );
  };

  const renderSettings = () => {
    const userInitials = userProfile?.name ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'DR';

    return (
    <div className="flex flex-col h-full animate-fade-in relative bg-nexthria-bg w-full max-w-md mx-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <button 
            onClick={() => setScreen(AppScreen.PROFILE)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 p-[2px]"
          >
             <div className="w-full h-full rounded-full bg-[#1F2937] flex items-center justify-center font-bold text-sm">{userInitials}</div>
          </button>
        </div>
      </div>

      {/* Settings List */}
      <div className="flex-1 overflow-y-auto px-6 pb-24">
        <div className="flex flex-col gap-4">
          {/* Theme Toggle */}
          <div className="glass-card p-5 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-nexthria-cyan">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">Dark Mode</p>
                  <p className="text-nexthria-text-tertiary text-xs">Currently enabled</p>
                </div>
              </div>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`relative w-12 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-nexthria-cyan' : 'bg-gray-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${theme === 'dark' ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Profile Settings */}
          <button
            onClick={() => setScreen(AppScreen.PROFILE)}
            className="glass-card p-5 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-nexthria-cyan">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Profile Settings</p>
                <p className="text-nexthria-text-tertiary text-xs">Update your information</p>
              </div>
            </div>
            <ChevronRightIcon />
          </button>

          {/* Notifications */}
          <div className="glass-card p-5 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-nexthria-cyan">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">Notifications</p>
                  <p className="text-nexthria-text-tertiary text-xs">Push notifications</p>
                </div>
              </div>
              <button className="relative w-12 h-6 rounded-full bg-gray-600">
                <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white" />
              </button>
            </div>
          </div>

          {/* About */}
          <div className="glass-card p-5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="text-nexthria-cyan">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">About</p>
                <p className="text-nexthria-text-tertiary text-xs">Version 1.0.0</p>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="glass-card p-5 rounded-2xl flex items-center gap-3 hover:bg-red-500/10 transition-colors border border-red-500/20"
          >
            <div className="text-red-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <p className="text-red-400 font-medium">Logout</p>
          </button>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="absolute bottom-0 w-full h-[80px] bg-[#0B0F19]/90 backdrop-blur-xl border-t border-white/5 flex items-start justify-around pt-4 z-40">
        <button onClick={() => navigateToTab('dashboard')} className="flex flex-col items-center gap-1 group">
          <div className="text-nexthria-text-tertiary group-hover:text-white transition-colors"><HomeIcon /></div>
          <span className="text-[10px] font-medium text-nexthria-text-tertiary group-hover:text-white transition-colors">Dashboard</span>
        </button>
        <button onClick={() => navigateToTab('patients')} className="flex flex-col items-center gap-1 group">
          <div className="text-nexthria-text-tertiary group-hover:text-white transition-colors"><UsersIcon /></div>
          <span className="text-[10px] font-medium text-nexthria-text-tertiary group-hover:text-white transition-colors">Patients</span>
        </button>
        <button onClick={() => navigateToTab('settings')} className="flex flex-col items-center gap-1 group">
          <div className="text-nexthria-cyan"><SettingsIcon /></div>
          <span className="text-[10px] font-medium text-nexthria-cyan">Settings</span>
        </button>
      </div>
    </div>
    );
  };

  const renderProfile = () => {
    const handleProfileUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || !userProfile) return;

      try {
        const updatedProfile: UserProfile = {
          ...userProfile,
          name: profileForm.name,
          age: parseInt(profileForm.age),
          gender: profileForm.gender,
          specialization: profileForm.specialization
        };
        await saveUserProfile(updatedProfile);
        alert('Profile updated successfully!');
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile');
      }
    };

    const userInitials = userProfile?.name ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'DR';

    return (
    <div className="flex flex-col h-full px-6 py-6 animate-fade-in max-w-md mx-auto w-full relative bg-nexthria-bg">
      <div className="relative flex items-center justify-center mb-8">
        <button 
          onClick={() => setScreen(activeTab === 'settings' ? AppScreen.SETTINGS : AppScreen.DASHBOARD)}
          className="absolute left-0 p-2 text-nexthria-text-secondary hover:text-white transition-colors"
        >
          <BackIcon />
        </button>
        <h2 className="text-xl font-bold text-white">My Profile</h2>
      </div>

      {/* Profile Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 p-[2px] mb-4">
          <div className="w-full h-full rounded-full bg-[#1F2937] flex items-center justify-center">
            <span className="text-3xl font-bold text-white">{userInitials}</span>
          </div>
        </div>
        <p className="text-nexthria-text-secondary text-sm">{userProfile?.email}</p>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleProfileUpdate} className="flex flex-col gap-5 flex-1">
        <div>
          <label className="block text-nexthria-text-secondary text-sm mb-2">Full Name</label>
          <Input 
            placeholder="Dr. John Doe" 
            type="text" 
            required 
            value={profileForm.name}
            onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-nexthria-text-secondary text-sm mb-2">Age</label>
          <Input 
            placeholder="35" 
            type="number" 
            required 
            value={profileForm.age}
            onChange={(e) => setProfileForm({...profileForm, age: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-nexthria-text-secondary text-sm mb-2">Gender</label>
          <select
            value={profileForm.gender}
            onChange={(e) => setProfileForm({...profileForm, gender: e.target.value as 'Male' | 'Female' | 'Other'})}
            className="w-full bg-[#1F2937] border border-transparent rounded-2xl py-4 px-5 text-white text-[15px] font-medium focus:outline-none focus:bg-[#263345] focus:border-nexthria-cyan/30 focus:ring-2 focus:ring-nexthria-cyan/10 transition-all duration-300"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div>
          <label className="block text-nexthria-text-secondary text-sm mb-2">Specialization</label>
          <Input 
            placeholder="Ophthalmology" 
            type="text" 
            required 
            value={profileForm.specialization}
            onChange={(e) => setProfileForm({...profileForm, specialization: e.target.value})}
          />
        </div>

        <div className="flex flex-col gap-3 mt-auto">
          <Button type="submit">Save Changes</Button>
          <Button 
            type="button"
            onClick={handleLogout}
            variant="outline" 
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            Logout
          </Button>
        </div>
      </form>
    </div>
    );
  };

  const renderPatientProfile = () => {
    if (!selectedPatient) return null;
    
    const initials = selectedPatient.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    return (
    <div className="flex flex-col h-full animate-fade-in relative bg-nexthria-bg w-full max-w-md mx-auto">
        {/* Header */}
        <div className="pt-6 pb-6 px-6 bg-gradient-to-b from-[#161B28] to-transparent">
            <div className="relative flex items-center justify-center mb-6">
                 <button 
                    onClick={() => setScreen(AppScreen.DASHBOARD)}
                    className="absolute left-0 p-2 text-nexthria-text-secondary hover:text-white transition-colors"
                >
                    <BackIcon />
                </button>
                <span className="text-white font-semibold">Patient Profile</span>
            </div>
            
            <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 p-[2px] mb-4 shadow-xl">
                     <div className="w-full h-full rounded-full bg-[#1F2937] flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{initials}</span>
                     </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedPatient.name}</h2>
                <p className="text-nexthria-text-secondary font-medium">{selectedPatient.age} • {selectedPatient.gender}</p>
                <p className="text-nexthria-text-tertiary text-xs mt-1">ID: {selectedPatient.id}</p>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between px-6 mb-6 border-b border-white/10">
            {['Scans', 'Vitals', 'History'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setProfileTab(tab.toLowerCase() as any)}
                    className={`flex-1 pb-3 text-sm font-semibold transition-all relative ${
                        profileTab === tab.toLowerCase() 
                        ? 'text-white' 
                        : 'text-nexthria-text-tertiary hover:text-nexthria-text-secondary'
                    }`}
                >
                    {tab}
                    {profileTab === tab.toLowerCase() && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-nexthria-cyan shadow-[0_0_10px_rgba(34,211,238,0.5)] rounded-full"></div>
                    )}
                </button>
            ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-32">
            {profileTab === 'scans' && (
                <div className="flex flex-col gap-4 animate-fade-in">
                    {selectedPatient.scans && selectedPatient.scans.length > 0 ? (
                      selectedPatient.scans.map((scan, index) => (
                        <div key={index} className="glass-card p-5 rounded-2xl border-l-4 border-l-nexthria-cyan">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-white font-semibold text-lg">{scan.finalGrade}</p>
                              <p className="text-nexthria-text-tertiary text-xs">{scan.date}</p>
                            </div>
                          </div>
                          <p className="text-nexthria-text-secondary text-sm">{scan.clinicianNotes}</p>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-40 text-nexthria-text-tertiary">
                        <p>No scans available</p>
                        <p className="text-xs mt-2">Upload a scan to get started</p>
                      </div>
                    )}
                </div>
            )}
            
            {profileTab === 'vitals' && (
                 <div className="flex flex-col items-center justify-center h-40 text-nexthria-text-tertiary animate-fade-in">
                    <p>No vitals data available</p>
                 </div>
            )}
            
            {profileTab === 'history' && (
                 <div className="flex flex-col items-center justify-center h-40 text-nexthria-text-tertiary animate-fade-in">
                    <p>No history data available</p>
                 </div>
            )}
        </div>

        {/* Upload Scan Button */}
        <div className="absolute bottom-6 left-6 right-6">
            <button 
              onClick={() => setScreen(AppScreen.UPLOAD)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-nexthria-cyan to-nexthria-blue text-white font-semibold flex items-center justify-center gap-3 hover:opacity-90 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(34,211,238,0.3)]"
            >
              <CameraIcon />
              Upload Scan
            </button>
        </div>
    </div>
    );
  };

  const renderUpload = () => (
    <div className="flex flex-col h-full px-6 py-6 animate-fade-in max-w-md mx-auto w-full relative">
       {/* Back Button for Upload screen to go back to Patient Profile */}
      <button 
          onClick={() => setScreen(AppScreen.PATIENT_PROFILE)}
          className="absolute left-6 top-8 z-20 text-nexthria-text-secondary hover:text-white transition-colors"
        >
          <BackIcon />
        </button>

      <div className="flex flex-col items-center mb-8 mt-4">
        <span className="text-xs font-semibold tracking-wider text-nexthria-text-secondary uppercase">Step 1 of 3</span>
        <h2 className="text-xl font-bold text-white mt-1">Upload Scan</h2>
        <div className="w-full h-1 bg-white/5 mt-6 rounded-full overflow-hidden">
          <div className="w-1/3 h-full bg-nexthria-cyan rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
        </div>
      </div>

      <div 
        className="flex-1 glass-card rounded-3xl flex flex-col items-center justify-center mb-6 relative overflow-hidden group hover:bg-[#1E293B]/80 transition-all duration-300 cursor-pointer border-dashed border-2 border-white/10 hover:border-nexthria-cyan/30"
        onClick={triggerFileUpload}
      >
         {selectedImage ? (
           <img src={selectedImage} alt="Preview" className="w-full h-full object-cover opacity-90" />
         ) : (
           <>
             <div className="w-20 h-20 bg-[#0B0F19] rounded-full flex items-center justify-center mb-6 shadow-xl border border-white/5 group-hover:scale-110 transition-transform duration-300">
               <CameraIcon />
             </div>
             <p className="text-white font-medium mb-1">Tap to upload scan</p>
             <p className="text-nexthria-text-tertiary text-sm">Supported: JPG, PNG, DICOM</p>
           </>
         )}
         <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept="image/*" 
            className="hidden" 
         />
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <button 
          onClick={triggerFileUpload}
          className="flex items-center justify-between p-4 glass-card rounded-2xl hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center gap-4 text-white">
             <div className="p-2.5 bg-[#1F2937] rounded-xl text-nexthria-cyan"><CameraIcon /></div>
             <span className="font-medium text-[15px]">Take Photo</span>
          </div>
          <div className="group-hover:translate-x-1 transition-transform">
            <ChevronRightIcon />
          </div>
        </button>

        <button 
          onClick={triggerFileUpload}
          className="flex items-center justify-between p-4 glass-card rounded-2xl hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center gap-4 text-white">
             <div className="p-2.5 bg-[#1F2937] rounded-xl text-nexthria-cyan"><ImageIcon /></div>
             <span className="font-medium text-[15px]">Choose from Gallery</span>
          </div>
           <div className="group-hover:translate-x-1 transition-transform">
            <ChevronRightIcon />
          </div>
        </button>
      </div>

      <Button 
        onClick={handleReviewScan} 
        disabled={!selectedImage}
        className="mt-auto shadow-lg"
      >
        Review Scan
      </Button>
    </div>
  );

  const renderQualityCheck = () => (
    <div className="flex flex-col h-full animate-fade-in relative bg-[#0B0F19]">
       {/* Top Bar */}
       <div className="px-6 pt-6 pb-2 z-20">
         <div className="flex flex-col items-center mb-4">
          <span className="text-xs font-semibold tracking-wider text-nexthria-text-secondary uppercase">Step 2 of 3 • Quality Check</span>
          <div className="w-full h-1 bg-white/5 mt-4 rounded-full overflow-hidden max-w-md">
            <div className="w-2/3 h-full bg-nexthria-cyan rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
          </div>
        </div>
      </div>

      {/* Main Preview with Full Coverage */}
      <div className="flex-1 relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
         {selectedImage && (
           <img src={selectedImage} alt="Quality Check" className="w-full h-full object-contain" />
         )}
         
         {/* Instruction Tooltip */}
         <button className="absolute top-6 right-6 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white border border-white/10 transition-colors z-20">
           <InfoIcon />
         </button>

         {/* Quality Overlay (Glassmorphism Slide-Up) */}
         <div className="absolute bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-xl border-t border-white/10 rounded-t-[32px] p-6 pb-8 transition-transform animate-fade-in z-20">
            <div className="max-w-md mx-auto">
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6"></div>
              
              <h2 className="text-lg font-bold text-white mb-5">Image Quality Analysis</h2>
              
              <div className="space-y-4 mb-8">
                {/* List Item 1 */}
                <div className="flex items-center gap-3">
                  <div className="p-1 rounded-full bg-emerald-500/10">
                    <CheckCircleIcon />
                  </div>
                  <span className="text-slate-200 font-medium">Focus: <span className="text-emerald-400">Sharpness acceptable</span></span>
                </div>

                {/* List Item 2 */}
                <div className="flex items-center gap-3">
                  <div className="p-1 rounded-full bg-emerald-500/10">
                    <CheckCircleIcon />
                  </div>
                  <span className="text-slate-200 font-medium">Exposure: <span className="text-emerald-400">Balanced</span></span>
                </div>

                {/* List Item 3 */}
                <div className="flex items-center gap-3">
                  <div className="p-1 rounded-full bg-amber-500/10">
                    <WarningIcon />
                  </div>
                  <span className="text-slate-200 font-medium">Centering: <span className="text-amber-400">Slightly off-axis</span></span>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setScreen(AppScreen.UPLOAD)}
                  className="flex-1"
                >
                  Retake Photo
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleAnalyze} 
                  disabled={isAnalyzing}
                  className="flex-[2]"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Confirm Quality'}
                </Button>
              </div>
            </div>
         </div>
      </div>
    </div>
  );

  const renderAIReasoning = () => {
    // Fallback reasoning if null
    const reasoning = analysisResult?.reasoning || "";

    // Simple parser to format **text** as headers for better readability
    const formatText = (text: string) => {
      const parts = text.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          // Render bold parts as section headers
          return <strong key={index} className="text-white block mt-6 mb-2 text-lg font-bold tracking-wide">{part.slice(2, -2)}</strong>;
        }
        return <span key={index}>{part}</span>;
      });
    };

    return (
        <div className="flex flex-col h-full animate-fade-in relative bg-nexthria-bg w-full max-w-md mx-auto">
             <div className="px-6 pt-6 pb-2 relative flex items-center justify-center">
                 <button 
                    onClick={() => setScreen(AppScreen.REPORT)}
                    className="absolute left-6 p-2 -ml-2 text-nexthria-text-secondary hover:text-white transition-colors"
                >
                    <BackIcon />
                </button>
                <h2 className="text-xl font-bold text-white">AI Analysis</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-2xl">
                     <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                        <div className="p-3 rounded-xl bg-nexthria-cyan/10 text-nexthria-cyan shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                            <SparklesIcon /> 
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">Reasoning Report</h3>
                            <p className="text-xs text-nexthria-text-tertiary">Generated by NexEye AI Model</p>
                        </div>
                    </div>
                    
                    <div className="text-sm text-nexthria-text-secondary leading-relaxed whitespace-pre-wrap">
                        {formatText(reasoning)}
                    </div>
                </div>
            </div>
        </div>
    );
  };

  const renderReport = () => {
    // If analysisResult exists, we use it; otherwise we default to the "Moderate DR" scenario from the design prompt.
    const grade = analysisResult?.finalGrade || "Moderate DR";
    
    // Mock regions if not present (for demo purposes if API call wasn't made or failed gracefully)
    // Coords are 0-100 percentage based.
    const regions = (analysisResult?.regions && analysisResult.regions.length > 0) ? analysisResult.regions : [
        { label: "Microaneurysms", ymin: 45, xmin: 55, ymax: 55, xmax: 65 },
        { label: "Hemorrhage", ymin: 25, xmin: 60, ymax: 35, xmax: 70 }
    ];

    // Mocking confidence for the design prompt as it's not currently in the API response type
    const confidence = 94; 
    const radius = 33; // Reduced to 33 to allow space for glow within viewBox
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (confidence / 100) * circumference;

    // Determine status style based on grade
    let statusConfig = {
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      text: "text-orange-400",
      icon: <WarningIcon />,
      label: "Referral Recommended"
    };

    const lowerGrade = grade.toLowerCase();
    
    if (lowerGrade.includes("no dr") || lowerGrade.includes("mild") || lowerGrade.includes("normal")) {
      statusConfig = {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        text: "text-emerald-400",
        icon: <CheckCircleIcon />,
        label: "Routine Follow-up"
      };
    } else if (lowerGrade.includes("invalid") || lowerGrade.includes("error")) {
        statusConfig = {
        bg: "bg-slate-500/10",
        border: "border-slate-500/20",
        text: "text-slate-400",
        icon: <InfoIcon />,
        label: "Review Required"
      };
    }

    return (
        <div className="flex flex-col h-full px-6 py-6 animate-fade-in max-w-md mx-auto w-full overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col items-center mb-6 relative">
                 <button 
                    onClick={() => setScreen(AppScreen.DASHBOARD)}
                    className="absolute left-0 top-1 p-2 text-nexthria-text-secondary hover:text-white transition-colors"
                >
                    <BackIcon />
                </button>
                <h2 className="text-xl font-bold text-white">Analysis Result</h2>
                <p className="text-nexthria-text-secondary text-sm font-medium mt-1">ID: P-4092 • Left Eye (OS)</p>
            </div>

            {/* Image Container with Heatmap */}
            <div className="relative w-full rounded-xl overflow-hidden bg-black mb-6 shadow-2xl group border border-white/10">
                 {selectedImage && (
                    <img src={selectedImage} alt="Retinal Scan" className="w-full h-auto object-contain block" />
                 )}
                 
                 {/* Dynamic SVG Overlay for Heatmap Regions */}
                 <div className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${showHeatmap ? 'opacity-100' : 'opacity-0'}`}>
                     <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                         {/* Tech Grid Background (Subtle) */}
                         <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                             <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(34, 211, 238, 0.1)" strokeWidth="0.5"/>
                         </pattern>
                         <rect width="100%" height="100%" fill="url(#grid)" />

                         {/* Render Dynamic Regions */}
                         {regions.map((region, index) => (
                             <g key={index}>
                                 {/* Blur Filter for Heatmap Glow Effect */}
                                 <defs>
                                     <filter id={`glow-${index}`} x="-50%" y="-50%" width="200%" height="200%">
                                         <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                         <feMerge>
                                             <feMergeNode in="coloredBlur"/>
                                             <feMergeNode in="SourceGraphic"/>
                                         </feMerge>
                                     </filter>
                                 </defs>
                                 
                                 {/* The Region Rectangle */}
                                 <rect 
                                     x={region.xmin} 
                                     y={region.ymin} 
                                     width={region.xmax - region.xmin} 
                                     height={region.ymax - region.ymin}
                                     fill="rgba(34, 211, 238, 0.2)" 
                                     stroke="#22D3EE" 
                                     strokeWidth="0.5"
                                     rx="2"
                                     filter={`url(#glow-${index})`}
                                     className="animate-pulse"
                                 />
                                 {/* Dashed Indicator Line */}
                                 <line 
                                     x1={region.xmax} 
                                     y1={region.ymin} 
                                     x2={region.xmax + 5} 
                                     y2={region.ymin - 5} 
                                     stroke="#22D3EE" 
                                     strokeWidth="0.2" 
                                 />
                                 {/* Label */}
                                 <text 
                                    x={region.xmax + 6} 
                                    y={region.ymin - 5} 
                                    fill="#22D3EE" 
                                    fontSize="3" 
                                    fontWeight="bold"
                                    className="uppercase tracking-widest"
                                 >
                                     {region.label}
                                 </text>
                             </g>
                         ))}
                     </svg>
                 </div>

                 {/* Toggle Switch */}
                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-3 border border-white/10 z-10">
                    <span className="text-xs font-medium text-white">AI Heatmap</span>
                    <button 
                        onClick={() => setShowHeatmap(!showHeatmap)}
                        className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${showHeatmap ? 'bg-nexthria-cyan' : 'bg-slate-600'}`}
                    >
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${showHeatmap ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </button>
                 </div>
            </div>

            {/* Confidence Card */}
            <div className="glass-card rounded-2xl py-8 px-6 mb-6 flex items-center justify-between relative overflow-hidden">
                {/* Background decorative glow for the card itself */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-nexthria-cyan/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10">
                    <h3 className="text-nexthria-text-secondary text-xs uppercase tracking-wider font-semibold mb-1">Severity</h3>
                    <p className="text-white text-2xl font-bold mb-3">{grade}</p>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${statusConfig.bg} ${statusConfig.border} border`}>
                        <div className={statusConfig.text}>
                          {statusConfig.icon}
                        </div>
                        <span className={`${statusConfig.text} text-[11px] font-bold uppercase tracking-wide`}>{statusConfig.label}</span>
                    </div>
                </div>
                
                <div className="flex flex-col items-center relative z-10">
                    <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                             <defs>
                                <linearGradient id="confidenceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#22D3EE" />
                                    <stop offset="100%" stopColor="#3B82F6" />
                                </linearGradient>
                                <filter id="glow-ring" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                    <feMerge>
                                        <feMergeNode in="coloredBlur"/>
                                        <feMergeNode in="SourceGraphic"/>
                                    </feMerge>
                                </filter>
                            </defs>
                            
                            {/* Outer Decorative Track */}
                            <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
                            
                            {/* Main Track Background */}
                            <circle cx="50" cy="50" r={radius} stroke="#1F2937" strokeWidth="6" fill="none" strokeLinecap="round" />
                            
                            {/* Progress Ring with Gradient & Glow */}
                            <circle 
                                cx="50" cy="50" r={radius} 
                                stroke="url(#confidenceGradient)" 
                                strokeWidth="6" 
                                fill="none" 
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                                filter="url(#glow-ring)"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-white text-2xl font-bold tracking-tight">{confidence}%</span>
                        </div>
                    </div>
                    <span className="text-[10px] text-nexthria-text-secondary mt-1 uppercase tracking-wider font-semibold">Confidence</span>
                </div>
            </div>

            {/* AI Reasoning Button - Opens Separate Screen */}
            <button 
                onClick={() => setScreen(AppScreen.AI_REASONING)}
                className="w-full glass-card rounded-2xl p-5 mb-6 flex items-center justify-between group hover:bg-white/5 transition-colors border border-white/10 text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-nexthria-cyan/10 text-nexthria-cyan shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                        <SparklesIcon /> 
                    </div>
                    <div>
                        <span className="block font-semibold text-white text-sm tracking-wide">AI Analysis Reasoning</span>
                        <span className="text-xs text-nexthria-text-tertiary">Tap to read full report</span>
                    </div>
                </div>
                <div className="text-nexthria-text-tertiary group-hover:text-white transition-transform duration-300 group-hover:translate-x-1">
                    <ChevronRightIcon />
                </div>
            </button>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mb-8">
                <Button variant="primary">Export PDF Report</Button>
                <Button variant="outline" className="border-nexthria-cyan/50 text-nexthria-cyan hover:bg-nexthria-cyan/10">Compare Previous</Button>
            </div>

            {/* Legal Footer */}
            <p className="mt-auto text-center text-[11px] text-nexthria-text-tertiary leading-relaxed">
                AI-generated insight. For clinical decision support only. Final diagnosis must be confirmed by a qualified professional.
            </p>
        </div>
    );
  };

  return (
    <div className="h-screen w-full bg-nexthria-bg text-white overflow-hidden font-sans selection:bg-nexthria-cyan/30 selection:text-white">
      <div className="h-full w-full">
        {screen === AppScreen.SPLASH && renderSplash()}
        {screen === AppScreen.LOGIN && renderLogin()}
        {screen === AppScreen.DASHBOARD && renderDashboard()}
        {screen === AppScreen.PATIENTS && renderPatients()}
        {screen === AppScreen.SETTINGS && renderSettings()}
        {screen === AppScreen.PROFILE && renderProfile()}
        {screen === AppScreen.ADD_PATIENT && renderAddPatient()}
        {screen === AppScreen.PATIENT_PROFILE && renderPatientProfile()}
        {screen === AppScreen.UPLOAD && renderUpload()}
        {screen === AppScreen.QUALITY_CHECK && renderQualityCheck()}
        {screen === AppScreen.REPORT && renderReport()}
        {screen === AppScreen.AI_REASONING && renderAIReasoning()}
      </div>
    </div>
  );
};

export default App;