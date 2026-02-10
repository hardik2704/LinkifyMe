import React from 'react';
import { motion } from 'framer-motion';

const logos = [
  "Notion", "Slack", "Gmail", "LinkedIn", "HubSpot", "Salesforce"
];

export const Integrations: React.FC = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-brand font-medium mb-4 uppercase tracking-widest text-sm"
        >
          The Ecosystem
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-bold text-rich-black mb-20 tracking-tight"
        >
          Seamlessly <span className="text-gray-400">Connected.</span>
        </motion.h2>

        <div className="relative h-[400px] flex items-center justify-center">
          {/* Central Node */}
          <div className="absolute z-10 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl border border-black/5">
            <span className="font-bold text-rich-black text-xl tracking-tighter">linki<span className="text-brand">.</span></span>
          </div>

          {/* Orbit Rings */}
          <div className="absolute border border-black/10 rounded-full w-[300px] h-[300px] animate-slow-spin opacity-50" />
          <div className="absolute border border-black/5 rounded-full w-[500px] h-[500px] animate-slow-spin opacity-30" style={{ animationDirection: 'reverse', animationDuration: '20s' }} />

          {/* Orbiting Logos */}
          {logos.map((logo, i) => {
            const angle = (i / logos.length) * 2 * Math.PI;
            const radius = 180;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <motion.div
                key={logo}
                className="absolute text-sm font-medium text-gray-600 bg-white border border-black/10 px-4 py-2 rounded-full shadow-sm"
                style={{ x, y }}
                animate={{
                  x: [x, Math.cos(angle + Math.PI * 2) * radius],
                  y: [y, Math.sin(angle + Math.PI * 2) * radius]
                }}
                transition={{
                  duration: 25,
                  repeat: Infinity,
                  ease: "linear",
                  delay: -i * (25 / logos.length)
                }}
              >
                {logo}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};