import React from 'react';
import { Play } from 'lucide-react';

export const DemoVideo: React.FC = () => {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-12">Still confused?</h2>
        
        <div className="relative aspect-video w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden border-4 border-white group cursor-pointer">
            {/* Mock Tablet/Screen Look */}
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                <img src="https://picsum.photos/1200/800?grayscale" alt="Dashboard" className="opacity-40 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                
                <div className="z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-8 h-8 text-white fill-current ml-1" />
                    </div>
                    <span className="mt-4 text-white font-medium tracking-wide">Watch the 2-minute walkthrough</span>
                </div>
            </div>
            
            {/* Floating UI Elements for decoration */}
            <div className="absolute top-8 left-8 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 hidden md:block animate-bounce-slow">
                <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};