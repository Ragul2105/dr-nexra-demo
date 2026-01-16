import React, { useState, useEffect, useRef } from 'react';
import { Logo } from './components/Logo';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { analyzeRetinalImage } from './services/geminiService';
import { analyzeWithHuggingFace } from './services/huggingfaceService';
import { AppScreen, AnalysisResult } from './types';

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
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [profileTab, setProfileTab] = useState<'scans' | 'vitals' | 'history'>('vitals');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Splash Screen Effect
  useEffect(() => {
    if (screen === AppScreen.SPLASH) {
      const timer = setTimeout(() => {
        setScreen(AppScreen.LOGIN);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isTermsAccepted) {
      setScreen(AppScreen.DASHBOARD);
    }
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

      setAnalysisResult({
        finalGrade,
        clinicianNotes: geminiResult.notes,
        reasoning: geminiResult.reasoning,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        regions: geminiResult.regions || []
      });
    } catch (err) {
      setAnalysisResult({
        finalGrade: 'Error',
        clinicianNotes: 'Failed to analyze image.',
        reasoning: String(err),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        regions: []
      });
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
        <Input icon={<EmailIcon />} placeholder="Email Address" type="email" required />
        <Input icon={<LockIcon />} placeholder="Password" type="password" required />
        
        <div className="flex justify-end">
          <button type="button" className="text-sm text-nexthria-cyan hover:text-white transition-colors font-medium">Forgot Password?</button>
        </div>

        <div className="flex items-start gap-3 my-1">
            <div className="relative flex items-center pt-0.5">
            <input 
                type="checkbox" 
                id="terms"
                checked={isTermsAccepted}
                onChange={(e) => setIsTermsAccepted(e.target.checked)}
                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-600 bg-[#1F2937] transition-all checked:border-nexthria-cyan checked:bg-nexthria-cyan hover:border-nexthria-cyan/50 focus:ring-2 focus:ring-nexthria-cyan/20"
            />
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-0.5 text-[#0B0F19] opacity-0 transition-opacity peer-checked:opacity-100">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
            </div>
            <label htmlFor="terms" className="text-xs text-nexthria-text-secondary leading-tight cursor-pointer select-none">
            I agree to the <a href="#" className="text-nexthria-blue hover:text-nexthria-cyan transition-colors font-medium">Terms</a> & <a href="#" className="text-nexthria-blue hover:text-nexthria-cyan transition-colors font-medium">Data Privacy Policy</a> for processing biometric data.
            </label>
        </div>

        <Button type="submit" className="mt-2" disabled={!isTermsAccepted}>Sign In</Button>
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
          onClick={(e) => { e.preventDefault(); if(isTermsAccepted) setScreen(AppScreen.DASHBOARD); }}
          disabled={!isTermsAccepted}
        >
          Hospital SSO Provider
        </Button>
      </div>

      <p className="mt-auto text-center text-[11px] text-nexthria-text-tertiary leading-relaxed px-4">
        For Qualified Healthcare Professionals Only
      </p>
    </div>
  );

  const renderDashboard = () => (
    <div className="flex flex-col h-full animate-fade-in relative bg-nexthria-bg w-full max-w-md mx-auto">
      {/* Header & Search */}
      <div className="px-6 pt-12 pb-4 flex flex-col gap-6 z-10 bg-nexthria-bg/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Patient List</h2>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-nexthria-cyan to-nexthria-indigo p-[2px]">
             <div className="w-full h-full rounded-full bg-nexthria-card flex items-center justify-center font-bold text-sm">DR</div>
          </div>
        </div>
        <Input 
          icon={<SearchIcon />} 
          placeholder="Search name, ID, or DoB" 
          className="shadow-lg"
        />
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto px-6 pb-24 flex flex-col gap-4">
        
        {/* Card 1 - Sarah Jenkins - Clickable to Profile */}
        <div 
            onClick={() => { setScreen(AppScreen.PATIENT_PROFILE); setProfileTab('vitals'); }}
            className="glass-card p-5 rounded-2xl flex items-center justify-between group hover:bg-white/5 transition-colors cursor-pointer"
        >
          <div>
            <h3 className="text-white font-semibold text-lg">Sarah Jenkins</h3>
            <p className="text-nexthria-text-secondary text-sm">ID: P-9921</p>
            <p className="text-nexthria-text-tertiary text-xs mt-1">Today, 9:41 AM</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-semibold tracking-wide">
              High Risk
            </span>
            <ChevronRightIcon />
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between group hover:bg-white/5 transition-colors cursor-pointer">
          <div>
            <h3 className="text-white font-semibold text-lg">Michael Chen</h3>
            <p className="text-nexthria-text-secondary text-sm">ID: P-8820</p>
            <p className="text-nexthria-text-tertiary text-xs mt-1">Yesterday</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold tracking-wide">
              Mild DR
            </span>
            <ChevronRightIcon />
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between group hover:bg-white/5 transition-colors cursor-pointer">
          <div>
            <h3 className="text-white font-semibold text-lg">Aisha Binti</h3>
            <p className="text-nexthria-text-secondary text-sm">ID: P-7712</p>
            <p className="text-nexthria-text-tertiary text-xs mt-1">2 days ago</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-400 text-[11px] font-semibold tracking-wide">
              No Anomalies
            </span>
            <ChevronRightIcon />
          </div>
        </div>

      </div>

      {/* FAB */}
      <button 
        onClick={() => setScreen(AppScreen.UPLOAD)}
        className="absolute bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-nexthria-cyan to-nexthria-blue shadow-[0_0_20px_rgba(34,211,238,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 z-30"
      >
        <PlusIcon />
      </button>

      {/* Bottom Nav */}
      <div className="absolute bottom-0 w-full h-[80px] bg-[#0B0F19]/90 backdrop-blur-xl border-t border-white/5 flex items-start justify-around pt-4 z-40">
        <button className="flex flex-col items-center gap-1 group">
          <div className="text-nexthria-cyan"><HomeIcon /></div>
          <span className="text-[10px] font-medium text-nexthria-cyan">Dashboard</span>
        </button>
        <button className="flex flex-col items-center gap-1 group">
          <div className="text-nexthria-text-tertiary group-hover:text-white transition-colors"><UsersIcon /></div>
          <span className="text-[10px] font-medium text-nexthria-text-tertiary group-hover:text-white transition-colors">Patients</span>
        </button>
        <button className="flex flex-col items-center gap-1 group">
          <div className="text-nexthria-text-tertiary group-hover:text-white transition-colors"><SettingsIcon /></div>
          <span className="text-[10px] font-medium text-nexthria-text-tertiary group-hover:text-white transition-colors">Settings</span>
        </button>
      </div>
    </div>
  );

  const renderPatientProfile = () => (
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
                        <span className="text-2xl font-bold text-white">SJ</span>
                     </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">Sarah Jenkins</h2>
                <p className="text-nexthria-text-secondary font-medium">54 • Female</p>
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

        {/* Content - Vitals */}
        <div className="flex-1 overflow-y-auto px-6 pb-24">
            {profileTab === 'vitals' && (
                <div className="flex flex-col gap-4 animate-fade-in">
                    {/* Metric 1 - HbA1c */}
                    <div className="glass-card p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-red-500">
                        <div>
                            <p className="text-nexthria-text-secondary text-xs uppercase tracking-wider font-semibold mb-1">HbA1c</p>
                            <p className="text-2xl font-bold text-red-400">7.8%</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                            <WarningIcon />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         {/* Metric 2 - BP */}
                        <div className="glass-card p-5 rounded-2xl">
                             <p className="text-nexthria-text-secondary text-xs uppercase tracking-wider font-semibold mb-2">Blood Pressure</p>
                             <p className="text-xl font-bold text-white">140/90</p>
                             <p className="text-[10px] text-nexthria-text-tertiary mt-1">mmHg</p>
                        </div>
                        {/* Metric 3 - Diagnosed */}
                        <div className="glass-card p-5 rounded-2xl">
                             <p className="text-nexthria-text-secondary text-xs uppercase tracking-wider font-semibold mb-2">Diagnosed</p>
                             <p className="text-xl font-bold text-white">12 Years</p>
                             <p className="text-[10px] text-nexthria-text-tertiary mt-1">Type 2 Diabetes</p>
                        </div>
                    </div>

                     {/* Extra styling for "Read Only" feel */}
                     <div className="mt-4 p-4 rounded-xl border border-dashed border-white/10 bg-white/5">
                        <p className="text-nexthria-text-tertiary text-xs text-center">
                            Last updated from EMR: Today, 8:30 AM
                        </p>
                     </div>
                </div>
            )}
            
            {/* Placeholders for other tabs */}
            {profileTab !== 'vitals' && (
                 <div className="flex flex-col items-center justify-center h-40 text-nexthria-text-tertiary animate-fade-in">
                    <p>No data available</p>
                 </div>
            )}
        </div>

        {/* EMR Sync Footer */}
        <div className="absolute bottom-6 left-6 right-6">
            <button className="w-full py-4 rounded-2xl bg-[#1F2937] border border-white/10 text-nexthria-cyan font-semibold flex items-center justify-center gap-3 hover:bg-[#263345] transition-colors active:scale-[0.98]">
                <CloudUploadIcon />
                Sync to Hospital EMR
            </button>
        </div>
    </div>
  );

  const renderUpload = () => (
    <div className="flex flex-col h-full px-6 py-6 animate-fade-in max-w-md mx-auto w-full relative">
       {/* Back Button for Upload screen to go back to Dashboard */}
      <button 
          onClick={() => setScreen(AppScreen.DASHBOARD)}
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