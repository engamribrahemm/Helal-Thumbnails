import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ReferenceUpload from './components/ReferenceUpload';
import SettingsForm from './components/SettingsForm';
import PreviewPanel from './components/PreviewPanel';
import { ThumbnailConfig, ReferenceImage, GeneratedImage, ImageSize, GenerationTab } from './types';
import { generateThumbnails } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GenerationTab>(GenerationTab.YOUTUBE);
  
  const [config, setConfig] = useState<ThumbnailConfig>({
    pose: 'Pointing at camera',
    style: 'Cinematic',
    cameraAngle: 'Eye-level',
    emotion: 'Shocked',
    lighting: 'Softbox Studio',
    background: 'Blurred Studio',
    selectedSize: ImageSize.YOUTUBE, 
    icons: '',
  });

  // Sync size with tab selection
  useEffect(() => {
    if (activeTab === GenerationTab.YOUTUBE) {
      setConfig(prev => ({ ...prev, selectedSize: ImageSize.YOUTUBE }));
    } else {
      setConfig(prev => ({ ...prev, selectedSize: ImageSize.REELS }));
    }
  }, [activeTab]);

  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  
  // Current batch (latest 4)
  const [currentBatch, setCurrentBatch] = useState<GeneratedImage[]>([]);
  // History of previous generations
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (referenceImages.length === 0) {
        setError("Please upload at least one reference image to lock facial identity.");
        return;
    }

    setIsGenerating(true);
    setError(null);

    // Move current batch to history before generating new ones
    if (currentBatch.length > 0) {
      setHistory(prev => [...currentBatch, ...prev]);
      setCurrentBatch([]); // Clear current view for loading state
    }

    try {
      const results = await generateThumbnails(config, referenceImages);
      
      const newImages: GeneratedImage[] = results.map(res => ({
        id: crypto.randomUUID(),
        url: `data:image/png;base64,${res.base64}`,
        size: res.size,
        prompt: config.pose,
        timestamp: Date.now()
      }));

      setCurrentBatch(newImages);
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("Requested entity was not found")) {
          setError("API Key Error: Please re-select your Paid API Key.");
      } else {
          setError("Failed to generate thumbnail. Please try again or check your API key.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white font-sans selection:bg-[#F2C100] selection:text-black">
      <Header />
      
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
            <div className="bg-[#1A1A1A] p-1 rounded-xl flex gap-1 border border-gray-800">
                <button 
                    onClick={() => setActiveTab(GenerationTab.YOUTUBE)}
                    className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === GenerationTab.YOUTUBE ? 'bg-[#F2C100] text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    <i className="fa-brands fa-youtube"></i> YouTube Thumbnail
                </button>
                <button 
                    onClick={() => setActiveTab(GenerationTab.REELS_PRO)}
                    className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === GenerationTab.REELS_PRO ? 'bg-[#F2C100] text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    <i className="fa-brands fa-instagram"></i> Helal Reel Thumbnail
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Inputs */}
            <div className="lg:col-span-6 space-y-8">
                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg flex items-center gap-3">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                        {error}
                    </div>
                )}

                <ReferenceUpload images={referenceImages} setImages={setReferenceImages} />
                
                <SettingsForm config={config} setConfig={setConfig} activeTab={activeTab} />

                {/* Generate Button */}
                <div className="pt-4 pb-10">
                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full bg-[#F2C100] text-black text-xl font-black uppercase py-5 rounded-lg shadow-[0_0_20px_rgba(242,193,0,0.3)] hover:shadow-[0_0_40px_rgba(242,193,0,0.5)] hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3"
                    >
                        {isGenerating ? (
                            <>
                               <span className="animate-spin w-5 h-5 flex items-center justify-center">
                                    {/* Rotating Logo Spinner */}
                                    <svg viewBox="0 0 64 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                                        <path d="M0 0 L32 50 L0 100 Z" fill="currentColor" />
                                        <path d="M64 0 L32 50 L64 100 Z" fill="currentColor" />
                                    </svg>
                               </span>
                               Generating...
                            </>
                        ) : (
                            <>
                                GENERATE {activeTab === GenerationTab.REELS_PRO ? 'REEL PRO' : ''} <i className="fa-solid fa-bolt"></i>
                            </>
                        )}
                    </button>
                    <p className="text-center text-gray-500 text-sm mt-3">
                        Generates variations with {activeTab === GenerationTab.REELS_PRO ? 'custom graphics' : 'locked identity'}.
                    </p>
                </div>
            </div>

            {/* Right Column: Preview (Sticky) */}
            <div className="lg:col-span-6">
                 <div className="sticky top-24">
                    <PreviewPanel 
                      currentBatch={currentBatch} 
                      history={history}
                      isGenerating={isGenerating} 
                    />
                 </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;