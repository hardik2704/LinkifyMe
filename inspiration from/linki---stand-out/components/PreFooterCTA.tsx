import React from 'react';
import { Button } from './ui/Button';
import { motion } from 'framer-motion';

export const PreFooterCTA: React.FC = () => {
  return (
    <section className="py-40 relative flex items-center justify-center">

      <div className="relative z-10 text-center max-w-4xl px-4">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl md:text-8xl font-bold text-rich-black mb-8 tracking-tighter"
        >
          Don't vanish. <br />
          <span className="text-brand">
            Stand out.
          </span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-gray-500 text-xl mb-12 max-w-xl mx-auto">
            Join 10,000+ professionals engineering their serendipity.
          </p>
          <Button size="lg" className="h-16 px-10 text-xl shadow-[0_0_50px_rgba(79,70,229,0.2)] hover:shadow-[0_0_80px_rgba(79,70,229,0.4)] transition-shadow duration-500">
            Start Free Audit
          </Button>
        </motion.div>
      </div>
    </section>
  );
};