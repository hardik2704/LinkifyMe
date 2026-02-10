import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo Representation */}
        <div className="flex items-center gap-1 select-none cursor-pointer" aria-label="Linkni Logo">
          {/* 'l' */}
          <span className="text-[#0B3B6F] font-bold text-5xl leading-none font-sans">l</span>
          
          {/* 'in' square */}
          <div className="bg-[#0B3B6F] rounded-lg h-12 w-14 flex items-center justify-center pb-1">
            <span className="text-white font-bold text-4xl leading-none font-sans pt-0.5">in</span>
          </div>

          {/* 'ki' */}
          <span className="text-[#0B3B6F] font-bold text-5xl leading-none font-sans">ki</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ShieldCheck size={16} className="text-green-600" />
          <span className="hidden sm:inline">Secure Checkout</span>
        </div>
      </div>
    </nav>
  );
};