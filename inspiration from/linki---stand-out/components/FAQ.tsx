import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: "Is this cheating?",
    answer: "No. It's engineering. We use the same algorithms LinkedIn uses to rank profiles, but in reverse to optimize yours."
  },
  {
    question: "How long does the audit take?",
    answer: "Less than 200 milliseconds. Our edge computing infrastructure analyzes 50+ data points instantly."
  },
  {
    question: "Will my current employer know?",
    answer: "We operate in stealth mode. No notifications are sent. Your optimization process is completely private."
  },
  {
    question: "What is the SSI Score?",
    answer: "Social Selling Index. It's the hidden metric LinkedIn uses to decide who sees your content. We help you max it out."
  }
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-rich-black mb-4 tracking-tight">
            Protocol <span className="text-brand">Details</span>
          </h2>
          <p className="text-gray-500">Everything you need to know about the system.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm transition-all duration-300 ${openIndex === index ? 'border-brand/20 shadow-md ring-1 ring-brand/5' : 'hover:border-black/10'}`}
            >
              <button
                className="w-full flex items-center justify-between p-6 text-left group"
                onClick={() => setOpenIndex(prev => prev === index ? null : index)}
              >
                <span className={`text-lg font-medium transition-colors ${openIndex === index ? 'text-rich-black' : 'text-gray-600 group-hover:text-rich-black'}`}>
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <Minus className="w-5 h-5 text-brand" />
                ) : (
                  <Plus className="w-5 h-5 text-gray-400 group-hover:text-rich-black transition-colors" />
                )}
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 text-gray-500 leading-relaxed border-t border-dashed border-black/5 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};