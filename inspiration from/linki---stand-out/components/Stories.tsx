import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: "Alex R.",
    role: "Senior PM at Google",
    text: "Recruiter messages went up 300% in 48 hours.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "Sarah K.",
    role: "Founder, TechFlow",
    text: "Fundraising became easier when my profile looked inevitable.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "James L.",
    role: "VP Sales, Oracle",
    text: "The psychology behind the rewrite is unmatched.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "Priya M.",
    role: "Engineer, Netflix",
    text: "I didn't apply. They came to me.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "Davide B.",
    role: "Director, Spotify",
    text: "Essential infrastructure for your career.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
  },
];

export const Stories: React.FC = () => {
  return (
    <section id="stories" className="py-24 relative">


      <div className="mb-16 text-center relative z-20">
        <h2 className="text-3xl md:text-4xl font-bold text-rich-black tracking-tight">
          Hall of <span className="text-gray-400">Fame</span>
        </h2>
      </div>

      <div className="flex overflow-hidden">
        <motion.div
          className="flex gap-8 px-4"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        >
          {[...testimonials, ...testimonials].map((story, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[400px] p-8 rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-md transition-shadow group"
            >
              <p className="text-lg text-gray-700 font-medium mb-6 leading-relaxed group-hover:text-rich-black transition-colors">
                "{story.text}"
              </p>
              <div className="flex items-center">
                <img
                  src={story.image}
                  alt={story.name}
                  className="w-12 h-12 rounded-full border-2 border-gray-100 mr-4 object-cover group-hover:border-brand/50 transition-colors"
                />
                <div>
                  <h4 className="text-rich-black font-bold">{story.name}</h4>
                  <p className="text-sm text-brand">{story.role}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
