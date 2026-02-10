import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

export const Comparison: React.FC = () => {
   return (
      <section className="py-32 relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
               <h2 className="text-4xl md:text-5xl font-bold mb-6 text-rich-black tracking-tight">
                  The <span className="text-gradient">Shift</span>
               </h2>
               <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                  Stop competing in the noise. Ascend to the signal.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
               {/* The Old Way */}
               <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="relative p-10 rounded-3xl border border-black/5 bg-gray-50 overflow-hidden group grayscale opacity-70 hover:opacity-100 transition-opacity"
               >
                  <div className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <h3 className="text-2xl font-bold text-gray-400 mb-8 flex items-center">
                     <span className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 mr-3">
                        <X className="w-4 h-4 text-gray-400" />
                     </span>
                     Standard Profile
                  </h3>
                  <ul className="space-y-6 text-gray-400">
                     <li className="flex items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 mr-3" />
                        Generic "Open to work" frames
                     </li>
                     <li className="flex items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 mr-3" />
                        Keyword-stuffed, unreadable bios
                     </li>
                     <li className="flex items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 mr-3" />
                        Zero social proof or metrics
                     </li>
                     <li className="flex items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 mr-3" />
                        Passive waiting for recruiters
                     </li>
                  </ul>
               </motion.div>

               {/* The Linki Way */}
               <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="relative p-10 rounded-3xl border border-brand/20 bg-white overflow-hidden ring-1 ring-brand/10 shadow-2xl shadow-brand/10"
               >
                  <div className="absolute inset-0 bg-brand-gradient opacity-[0.03]" />

                  <h3 className="text-2xl font-bold text-rich-black mb-8 flex items-center relative z-10">
                     <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand mr-3 shadow-lg shadow-brand/30">
                        <Check className="w-4 h-4 text-white" />
                     </span>
                     Optimized Asset
                  </h3>
                  <ul className="space-y-6 text-gray-700 relative z-10">
                     {[
                        "Psychologically engineered hooks",
                        "Metric-driven achievement stack",
                        "Automated inbound lead generation",
                        "Top 1% SSI Score Authority"
                     ].map((item, i) => (
                        <li key={i} className="flex items-start">
                           <span className="w-1.5 h-1.5 rounded-full bg-brand mt-2 mr-3" />
                           {item}
                        </li>
                     ))}
                  </ul>
               </motion.div>
            </div>
         </div>
      </section>
   );
};