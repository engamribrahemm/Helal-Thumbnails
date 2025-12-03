import React from 'react';
import { ThumbnailConfig, ImageSize } from '../types';

interface Props {
  config: ThumbnailConfig;
  setConfig: React.Dispatch<React.SetStateAction<ThumbnailConfig>>;
}

interface InputWithSuggestionsProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  suggestions: string[];
  placeholder?: string;
}

const InputWithSuggestions: React.FC<InputWithSuggestionsProps> = ({ label, value, onChange, suggestions, placeholder }) => {
  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">
        {label}
      </label>
      <textarea 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F2C100] transition-colors mb-2 resize-y min-h-[3.5rem]"
        placeholder={placeholder}
        rows={3}
      />
      <div className="flex flex-wrap gap-1.5">
        {suggestions.slice(0, 4).map((suggestion) => (
          <button 
            key={suggestion} 
            onClick={() => onChange(suggestion)}
            className={`text-[10px] px-2 py-1 rounded-full border transition-all ${
              value === suggestion 
                ? 'bg-[#F2C100] text-black border-[#F2C100] font-bold' 
                : 'bg-[#151515] text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white'
            }`}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

const SettingsForm: React.FC<Props> = ({ config, setConfig }) => {
  
  const handleChange = (key: keyof ThumbnailConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const cardClass = "bg-[#1A1A1A] border-l-4 border-[#F2C100] rounded-r-xl p-5 shadow-lg";

  // Configuration Data
  const poses = ["Pointing at camera", "Crossed arms", "Hands on face", "Thinking", "Thumbs up", "Open arms"];
  const styles = ["Cinematic", "MrBeast Style", "Ali Abdaal", "Neon Cyberpunk", "Dramatic", "Hyper-Realistic"];
  const cameraAngles = ["Eye-level", "Low Angle", "Wide Shot", "Close-up", "Selfie Style"];
  const emotions = ["Shocked", "Excited", "Happy", "Serious", "Angry", "Laughing"];
  const backgrounds = ["Blurred Studio", "Neon Tech Grid", "Explosion", "Gradient", "City Street", "Money Rain"];
  const lightings = ["Softbox Studio", "Neon Rim Lights", "Dramatic", "Natural Sunlight", "Golden Hour"];

  return (
    <div className="flex flex-col gap-6">
      
      {/* Visual & Scene Settings */}
      <section>
        <h2 className="text-[#F2C100] font-bold text-lg uppercase tracking-wider mb-4">
            <i className="fa-solid fa-sliders mr-2"></i> Visual Settings
        </h2>
        
        <div className={cardClass}>
           {/* Grid Layout for Inputs */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <InputWithSuggestions 
                  label="Pose" 
                  value={config.pose} 
                  onChange={(val) => handleChange('pose', val)} 
                  suggestions={poses}
              />
              <InputWithSuggestions 
                  label="Style" 
                  value={config.style} 
                  onChange={(val) => handleChange('style', val)} 
                  suggestions={styles}
              />
              <InputWithSuggestions 
                  label="Emotion" 
                  value={config.emotion} 
                  onChange={(val) => handleChange('emotion', val)} 
                  suggestions={emotions}
              />
               <InputWithSuggestions 
                  label="Camera Angle" 
                  value={config.cameraAngle} 
                  onChange={(val) => handleChange('cameraAngle', val)} 
                  suggestions={cameraAngles}
              />
              <InputWithSuggestions 
                  label="Background" 
                  value={config.background} 
                  onChange={(val) => handleChange('background', val)} 
                  suggestions={backgrounds}
              />
              <InputWithSuggestions 
                  label="Lighting" 
                  value={config.lighting} 
                  onChange={(val) => handleChange('lighting', val)} 
                  suggestions={lightings}
              />
           </div>
        </div>
      </section>

      {/* Output Size */}
      <section>
        <h2 className="text-[#F2C100] font-bold text-lg uppercase tracking-wider mb-4">
            <i className="fa-solid fa-expand mr-2"></i> Output Size
        </h2>
        <div className="grid grid-cols-2 gap-4">
            <div 
                onClick={() => handleChange('selectedSize', ImageSize.YOUTUBE)}
                className={`cursor-pointer px-4 py-3 rounded-lg border flex items-center justify-center gap-3 transition-all ${config.selectedSize === ImageSize.YOUTUBE ? 'bg-[#F2C100] border-[#F2C100] text-black shadow-[0_0_15px_rgba(242,193,0,0.3)]' : 'bg-[#1A1A1A] border-gray-700 text-gray-400 hover:border-gray-500'}`}
            >
                <i className="fa-brands fa-youtube text-2xl"></i>
                <div className="text-left">
                    <div className="font-bold text-sm">YouTube</div>
                    <div className="text-[10px] opacity-70">1920x1080</div>
                </div>
            </div>

            <div 
                onClick={() => handleChange('selectedSize', ImageSize.REELS)}
                className={`cursor-pointer px-4 py-3 rounded-lg border flex items-center justify-center gap-3 transition-all ${config.selectedSize === ImageSize.REELS ? 'bg-[#F2C100] border-[#F2C100] text-black shadow-[0_0_15px_rgba(242,193,0,0.3)]' : 'bg-[#1A1A1A] border-gray-700 text-gray-400 hover:border-gray-500'}`}
            >
                <i className="fa-brands fa-instagram text-2xl"></i>
                <div className="text-left">
                    <div className="font-bold text-sm">Reels</div>
                    <div className="text-[10px] opacity-70">1080x1920</div>
                </div>
            </div>
        </div>
      </section>

    </div>
  );
};

export default SettingsForm;