import React, { useRef } from 'react';
import { ReferenceImage } from '../types';

interface Props {
  images: ReferenceImage[];
  setImages: React.Dispatch<React.SetStateAction<ReferenceImage[]>>;
}

const ReferenceUpload: React.FC<Props> = ({ images, setImages }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Cast to File[] because Array.from on FileList can sometimes be inferred as unknown[]
      const files = Array.from(e.target.files) as File[];
      processFiles(files);
    }
  };

  const processFiles = (files: File[]) => {
    files.forEach(file => {
      if (images.length >= 20) return; // Limit check

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Data = base64String.split(',')[1];
        
        setImages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            data: base64Data,
            mimeType: file.type
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-[#F2C100] font-bold text-lg uppercase tracking-wider">
                <i className="fa-solid fa-images mr-2"></i> Reference Images
            </h2>
            <span className="text-xs text-gray-500">{images.length} / 20</span>
        </div>
        
      <div 
        className="border-2 border-dashed border-[#F2C100] bg-[#1A1A1A] rounded-xl p-8 text-center cursor-pointer transition-all hover:bg-[#252525] group"
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange}
        />
        
        {images.length === 0 ? (
          <div className="py-8">
            <div className="mb-4">
              <i className="fa-solid fa-cloud-arrow-up text-4xl text-[#F2C100] group-hover:scale-110 transition-transform"></i>
            </div>
            <p className="text-white font-semibold text-lg">Click to Upload Reference Images</p>
            <p className="text-gray-400 text-sm mt-2">Upload up to 20 images to lock facial identity.</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {images.map((img) => (
              <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-700">
                <img 
                  src={`data:${img.mimeType};base64,${img.data}`} 
                  alt="Ref" 
                  className="w-full h-full object-cover" 
                />
                <button 
                  onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                  className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            ))}
            <div className="flex items-center justify-center aspect-square border-2 border-dashed border-gray-600 rounded-lg text-gray-500">
               <i className="fa-solid fa-plus"></i>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ReferenceUpload;