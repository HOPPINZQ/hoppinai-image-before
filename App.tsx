
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Camera, Upload, RefreshCw, Clock, Download, Share2, ShieldCheck, AlertCircle, Sparkles, Grid, Maximize2, Trash2 } from 'lucide-react';
import { AgeSlider } from './components/AgeSlider';
import { ComparisonView } from './components/ComparisonView';
import { ShareModal } from './components/ShareModal';
import { travelInTime } from './services/geminiService';
import { SessionState, TimeTravelResult } from './types';

const PROCESSING_STEPS = [
  "Analyzing facial landmarks...",
  "Identifying unique identifiers...",
  "Simulating temporal biological shifts...",
  "Applying skin texture transformations...",
  "Recalculating structural pigments...",
  "Preserving identity features...",
  "Rendering final age projection...",
  "Polishing temporal details..."
];

const App: React.FC = () => {
  const [session, setSession] = useState<SessionState>({
    originalImage: null,
    currentAge: 20,
    results: {},
    isProcessing: false,
    error: null,
  });
  
  const [selectedBatch, setSelectedBatch] = useState<number[]>([]);
  const [activeResultKey, setActiveResultKey] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'focus' | 'grid'>('focus');
  const [showPrivacy, setShowPrivacy] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: number | undefined;
    if (session.isProcessing) {
      setCurrentStepIndex(0);
      interval = window.setInterval(() => {
        setCurrentStepIndex((prev) => (prev + 1) % PROCESSING_STEPS.length);
      }, 2500);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [session.isProcessing]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSession(prev => ({
          ...prev,
          originalImage: reader.result as string,
          results: {},
          error: null
        }));
        setSelectedBatch([]);
        setActiveResultKey(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startTimeTravel = async (targetAges: number[]) => {
    if (!session.originalImage || targetAges.length === 0) return;

    setSession(prev => ({ ...prev, isProcessing: true, error: null }));
    
    try {
      const newResults = { ...session.results };
      
      for (const age of targetAges) {
        const direction = age >= 0 ? 'future' : 'past';
        const resultImageUrl = await travelInTime(
          session.originalImage,
          age,
          direction
        );

        const resultKey = `${age}`;
        newResults[resultKey] = {
          age,
          direction,
          imageUrl: resultImageUrl,
          prompt: ''
        };
        
        // Progressively update UI
        setSession(prev => ({
          ...prev,
          results: { ...newResults }
        }));
        setActiveResultKey(resultKey);
      }

      setSession(prev => ({ ...prev, isProcessing: false }));
      setSelectedBatch([]);
    } catch (error: any) {
      setSession(prev => ({
        ...prev,
        isProcessing: false,
        error: error.message || "Failed to travel through time. Please try again."
      }));
    }
  };

  const reset = () => {
    setSession({
      originalImage: null,
      currentAge: 20,
      results: {},
      isProcessing: false,
      error: null
    });
    setSelectedBatch([]);
    setActiveResultKey(null);
  };

  const handleShare = async (imageUrl: string, age: number) => {
    if (navigator.share) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], `chronos-lens-${age}.png`, { type: 'image/png' });
        
        const shareData: ShareData = {
          title: 'ChronosLens Transformation',
          text: `Check out my ${age > 0 ? `+${age}` : age} year transformation!`,
          url: window.location.href,
          files: [file]
        };

        if (navigator.canShare && navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      } catch (err) {
        console.error('Error sharing natively:', err);
      }
    }
    setShowShareModal(true);
  };

  const toggleBatchAge = (age: number) => {
    setSelectedBatch(prev => 
      prev.includes(age) ? prev.filter(a => a !== age) : [...prev, age]
    );
  };

  const currentResult = activeResultKey ? session.results[activeResultKey] : null;
  const resultsList = Object.values(session.results).sort((a, b) => a.age - b.age);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-[#020617] text-slate-100">
      {/* Header */}
      <header className="w-full max-w-6xl flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
            <Clock className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight uppercase">ChronosLens</h1>
            <p className="text-slate-500 text-[10px] font-bold tracking-[0.2em] uppercase">Temporal AI Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={() => setShowPrivacy(true)}
            className="p-2.5 hover:bg-slate-800 rounded-full transition-colors text-slate-400"
            title="Privacy Policy"
          >
            <ShieldCheck className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Controls */}
        <div className="w-full lg:w-[380px] flex flex-col gap-6 shrink-0">
          <div className="glass-panel p-6 rounded-[32px] space-y-6">
            {!session.originalImage ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-slate-700/50 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
              >
                <div className="p-5 bg-slate-800 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-white" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">Input Portrait</p>
                  <p className="text-xs text-slate-500 mt-1">Tap to upload your image</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl group ring-1 ring-white/10">
                  <img src={session.originalImage} className="w-full h-full object-cover" alt="Original" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={reset}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold transition-all shadow-xl"
                    >
                      <Trash2 className="w-3 h-3" /> New Photo
                    </button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <AgeSlider 
                    value={session.currentAge} 
                    selectedBatch={selectedBatch}
                    onChange={(v) => setSession(s => ({ ...s, currentAge: v }))}
                    onToggleBatch={toggleBatchAge}
                    disabled={session.isProcessing}
                  />
                  
                  <button
                    onClick={() => startTimeTravel(selectedBatch.length > 0 ? selectedBatch : [session.currentAge])}
                    disabled={session.isProcessing || (selectedBatch.length === 0 && session.currentAge === 0)}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98]"
                  >
                    {session.isProcessing ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                    {session.isProcessing 
                      ? 'Temporal Folding...' 
                      : selectedBatch.length > 0 
                        ? `Process ${selectedBatch.length} Ages`
                        : `Simulate ${session.currentAge > 0 ? '+' : ''}${session.currentAge} Years`
                    }
                  </button>
                </div>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
              accept="image/*" 
            />
          </div>

          <div className="flex gap-4 p-5 bg-blue-500/5 rounded-3xl border border-blue-500/10">
            <Sparkles className="w-6 h-6 flex-shrink-0 text-blue-500" />
            <p className="text-xs leading-relaxed text-slate-400">
              <span className="font-bold text-slate-200 block mb-1 uppercase tracking-wider">AI Ethics Notice</span>
              Our temporal algorithms are designed to visualize biological progression while strictly respecting your unique identity.
            </p>
          </div>
        </div>

        {/* Main Result Display */}
        <div className="w-full flex-1">
          {session.isProcessing && !activeResultKey ? (
            <div className="w-full aspect-square md:aspect-[4/3] glass-panel rounded-[40px] flex flex-col items-center justify-center gap-8 border border-white/5">
              <div className="relative">
                <div className="w-32 h-32 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin shadow-[0_0_40px_rgba(59,130,246,0.1)]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <Clock className="w-10 h-10 text-blue-400 animate-pulse" />
                </div>
              </div>
              
              <div className="text-center space-y-4 px-6 max-w-md">
                <div className="space-y-1">
                  <p className="text-xl font-bold text-blue-400 tracking-tight">Accessing Timeline...</p>
                  <div className="h-6 flex items-center justify-center overflow-hidden">
                    <p key={currentStepIndex} className="text-slate-400 text-sm animate-in fade-in slide-in-from-bottom-2 duration-500 italic">
                      {PROCESSING_STEPS[currentStepIndex]}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                    style={{ width: `${((currentStepIndex + 1) / PROCESSING_STEPS.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : resultsList.length > 0 ? (
            <div className="space-y-8 animate-in fade-in duration-1000">
              <div className="flex items-center justify-between">
                <div className="flex gap-2 p-1 bg-slate-900 rounded-xl border border-white/5">
                  <button 
                    onClick={() => setViewMode('focus')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'focus' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <Maximize2 className="w-4 h-4" /> Focus
                  </button>
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <Grid className="w-4 h-4" /> Timeline
                  </button>
                </div>
                {session.isProcessing && (
                  <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                    <span className="text-xs font-bold text-blue-400">Processing queue...</span>
                  </div>
                )}
              </div>

              {viewMode === 'focus' && currentResult ? (
                <div className="space-y-6">
                  <ComparisonView 
                    original={session.originalImage!} 
                    processed={currentResult.imageUrl} 
                  />
                  <div className="flex flex-wrap gap-4 justify-between items-center bg-slate-900/50 p-6 rounded-[32px] border border-white/5">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                        Projection: {currentResult.age > 0 ? `+${currentResult.age}` : currentResult.age} Years
                      </h2>
                      <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Temporal Analysis Successful</p>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = currentResult.imageUrl;
                          link.download = `chronos-lens-${currentResult.age}.png`;
                          link.click();
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-slate-950 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all active:scale-95"
                      >
                        <Download className="w-4 h-4" /> Download
                      </button>
                      <button 
                        onClick={() => handleShare(currentResult.imageUrl, currentResult.age)}
                        className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-all border border-white/5"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                  {resultsList.map((res) => (
                    <div 
                      key={res.age}
                      onClick={() => { setViewMode('focus'); setActiveResultKey(`${res.age}`); }}
                      className={`group relative aspect-[3/4] rounded-3xl overflow-hidden border-2 cursor-pointer transition-all hover:scale-[1.02] ${activeResultKey === `${res.age}` ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : 'border-white/5 hover:border-white/20'}`}
                    >
                      <img src={res.imageUrl} className="w-full h-full object-cover" alt={`Age ${res.age}`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4 translate-y-2 group-hover:translate-y-0 transition-transform">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Age Point</p>
                            <p className="text-xl font-black italic">{res.age > 0 ? `+${res.age}` : res.age} YRS</p>
                          </div>
                          <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                            <Maximize2 className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Empty state within grid if nothing processed */}
                  {resultsList.length === 0 && (
                    <div className="col-span-full py-20 text-center space-y-4">
                      <Grid className="w-12 h-12 text-slate-800 mx-auto" />
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No temporal nodes detected</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : session.error ? (
            <div className="w-full aspect-square md:aspect-[4/3] bg-red-950/10 border border-red-500/20 rounded-[40px] flex flex-col items-center justify-center gap-6 text-center p-10">
              <div className="p-5 bg-red-500/20 rounded-3xl text-red-500">
                <AlertCircle className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-red-400">Simulation Failure</h3>
                <p className="text-slate-400 max-w-sm text-sm">{session.error}</p>
              </div>
              <button 
                onClick={() => startTimeTravel(selectedBatch.length > 0 ? selectedBatch : [session.currentAge])}
                className="mt-4 px-10 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-red-900/20"
              >
                Retry Simulation
              </button>
            </div>
          ) : (
            <div className="w-full aspect-square md:aspect-[4/3] glass-panel rounded-[40px] flex flex-col items-center justify-center gap-6 border-dashed border-2 border-slate-800/50 text-slate-500 overflow-hidden relative group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)]"></div>
              <div className="p-8 bg-slate-900 rounded-full border border-white/5 relative z-10 group-hover:scale-110 transition-transform duration-500">
                <Clock className="w-20 h-20 opacity-10" />
              </div>
              <div className="text-center space-y-2 relative z-10">
                <h3 className="text-xl font-bold text-slate-400 tracking-tight">Temporal Engine Standby</h3>
                <p className="max-w-xs mx-auto text-sm opacity-60">Upload a portrait to begin biological time mapping across multiple age nodes.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Share Modal */}
      {currentResult && (
        <ShareModal 
          isOpen={showShareModal} 
          onClose={() => setShowShareModal(false)} 
          imageUrl={currentResult.imageUrl}
          ageOffset={currentResult.age}
        />
      )}

      {/* Privacy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="glass-panel max-w-lg w-full rounded-[40px] p-10 space-y-8 animate-in zoom-in-95 duration-300 relative border border-white/10 shadow-2xl">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-blue-600 rounded-3xl">
                <ShieldCheck className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">Identity Secure</h2>
                <p className="text-blue-500 text-[10px] font-black tracking-widest uppercase">Privacy Protocols Active</p>
              </div>
            </div>
            <div className="space-y-5 text-slate-400">
              <p className="text-lg text-slate-300 font-medium leading-relaxed">ChronosLens utilizes edge-to-edge AI processing to ensure your biological data remains yours.</p>
              <ul className="space-y-4 text-sm font-medium">
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  Images are processed transiently via Gemini Vision Transformers.
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  We do not archive or index biometric signatures.
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  Processing history is local to your current session.
                </li>
              </ul>
            </div>
            <button 
              onClick={() => setShowPrivacy(false)}
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[24px] font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98]"
            >
              Initialize Engine
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
