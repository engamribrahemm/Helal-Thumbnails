import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-[#0E0E0E] border-b border-[#1F1F1F]">
      <div className="flex items-center gap-3">
        {/* Custom Logo: Yellow Bowtie/Butterfly Shape - Narrower aspect ratio to match brand */}
        <div className="h-10 w-auto flex items-center justify-center">
            <svg viewBox="0 0 64 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto" preserveAspectRatio="xMidYMid meet">
                <path d="M0 0 L32 50 L0 100 Z" fill="#F2C100" />
                <path d="M64 0 L32 50 L64 100 Z" fill="#F2C100" />
            </svg>
        </div>
        <h1 className="text-xl font-bold text-white tracking-wide">
          Helal Thumbnails
        </h1>
      </div>
      <div className="flex gap-4 text-gray-400">
        <button className="hover:text-[#F2C100] transition-colors">
          <i className="fa-solid fa-gear text-xl"></i>
        </button>
        <button className="hover:text-[#F2C100] transition-colors">
          <i className="fa-solid fa-circle-question text-xl"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;