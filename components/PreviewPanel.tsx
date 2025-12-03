import React, { useState, useEffect } from 'react';
import { GeneratedImage, ImageSize } from '../types';

interface Props {
  currentBatch: GeneratedImage[];
  history: GeneratedImage[];
  isGenerating: boolean;
}

const PreviewPanel: React.FC<Props> = ({ currentBatch, history, isGenerating }) => {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Determine which list to show
  const imagesToShow = showHistory ? history : currentBatch;
  const title = showHistory ? `History (${history.length})` : `New Results (${currentBatch.length})`;
  
  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      if (e.key === 'ArrowRight') navigateImage(1);
      if (e.key === 'ArrowLeft') navigateImage(-1);
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, imagesToShow]);

  const handleDownload = (img: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = img.url;
    link.download = `helal-thumbnail-${img.size}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const navigateImage = (direction: number) => {
    if (!selectedImage) return;
    const currentIndex = imagesToShow.findIndex(img => img.id === selectedImage.id);
    if (currentIndex === -1) return;

    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < imagesToShow.length) {
      setSelectedImage(imagesToShow[newIndex]);
    }
  };

  return (
    <>
      <div className="bg-[#1A1A1A] border border-[#F2C100] rounded-xl p-6 min-h-[400px]">
          <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                 <h2 className="text-white font-bold text-xl uppercase tracking-wider">
                    <i className="fa-solid fa-photo-film text-[#F2C100] mr-2"></i> {isGenerating ? 'Designing...' : title}
                 </h2>
              </div>
              
              {history.length > 0 && (
                <button 
                    onClick={() => setShowHistory(!showHistory)}
                    className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${
                        showHistory 
                        ? 'bg-[#F2C100] text-black border-[#F2C100]' 
                        : 'bg-transparent text-gray-400 border-gray-700 hover:text-white'
                    }`}
                >
                    {showHistory ? 'View Current' : 'View History'} <i className={`fa-solid ${showHistory ? 'fa-bolt' : 'fa-clock-rotate-left'} ml-1`}></i>
                </button>
              )}
          </div>

          {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-64 gap-6">
                  {/* Rotating Logo Spinner */}
                  <div className="w-16 h-16 animate-spin flex items-center justify-center">
                    <svg viewBox="0 0 64 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                        <path d="M0 0 L32 50 L0 100 Z" fill="#F2C100" />
                        <path d="M64 0 L32 50 L64 100 Z" fill="#F2C100" />
                    </svg>
                  </div>
                  <p className="text-[#F2C100] animate-pulse text-lg font-medium">Designing...</p>
              </div>
          ) : imagesToShow.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-600 gap-4">
                  <i className="fa-regular fa-image text-6xl opacity-20"></i>
                  <p>Your generated thumbnails will appear here.</p>
              </div>
          ) : (
              <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                  {imagesToShow.map((img) => (
                      <div 
                        key={img.id} 
                        className="bg-black rounded-lg overflow-hidden border border-gray-800 group cursor-pointer hover:border-[#F2C100] transition-all"
                        onClick={() => setSelectedImage(img)}
                      >
                          <div className="relative aspect-video">
                              <img src={img.url} alt="Generated" className="w-full h-full object-contain" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <i className="fa-solid fa-expand text-white text-3xl drop-shadow-lg"></i>
                              </div>
                          </div>
                          <div className="p-2 flex justify-between items-center bg-[#0E0E0E]">
                              <span className="text-[#F2C100] text-[10px] font-bold px-1.5 py-0.5 border border-[#F2C100] rounded">
                                  {img.size === ImageSize.YOUTUBE ? 'YT' : 'IG'}
                              </span>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDownload(img); }}
                                className="text-gray-400 hover:text-white"
                                title="Download"
                              >
                                <i className="fa-solid fa-download"></i>
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>

      {/* Full Screen Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 animate-fadeIn">
          
          {/* Navigation Arrows */}
          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-[#F2C100] transition-colors p-4 z-50 disabled:opacity-20"
            onClick={() => navigateImage(-1)}
            disabled={imagesToShow.findIndex(img => img.id === selectedImage.id) === 0}
          >
            <i className="fa-solid fa-chevron-left text-5xl drop-shadow-lg"></i>
          </button>
          
          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-[#F2C100] transition-colors p-4 z-50 disabled:opacity-20"
            onClick={() => navigateImage(1)}
            disabled={imagesToShow.findIndex(img => img.id === selectedImage.id) === imagesToShow.length - 1}
          >
            <i className="fa-solid fa-chevron-right text-5xl drop-shadow-lg"></i>
          </button>

          <button 
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <i className="fa-solid fa-xmark text-4xl"></i>
          </button>
          
          <div className="max-w-[90vw] max-h-[80vh] relative">
             <img 
               src={selectedImage.url} 
               alt="Full Screen" 
               className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl border border-[#333]" 
             />
          </div>

          <div className="mt-6 flex gap-4">
             <button 
                onClick={() => handleDownload(selectedImage)}
                className="bg-[#F2C100] text-black font-bold text-lg py-3 px-8 rounded-full hover:scale-105 transition-transform flex items-center gap-2"
              >
                 <i className="fa-solid fa-download"></i> Download
              </button>
              <div className="text-gray-500 flex items-center gap-2 text-sm">
                 <span>{imagesToShow.findIndex(img => img.id === selectedImage.id) + 1} of {imagesToShow.length}</span>
              </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PreviewPanel;