import React, { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Zap, Shield, TrendingUp, Cpu, Globe } from 'lucide-react';

const features = [
  {
    title: "Instant Velocity",
    description: "Analysis results delivered in under 200ms using edge cashing.",
    icon: Zap,
    colSpan: "md:col-span-2",
  },
  {
    title: "Global Reach",
    description: "Benchmark your profile against top 1% globally.",
    icon: Globe,
    colSpan: "md:col-span-1",
  },
  {
    title: "AI Precision",
    description: "Neural networks trained on 10M+ profiles for exact recommendations.",
    icon: Cpu,
    colSpan: "md:col-span-1",
  },
  {
    title: "Growth Metrics",
    description: "Track your SSI score improvements over time.",
    icon: TrendingUp,
    colSpan: "md:col-span-2",
  },
];

const FeatureCard = ({ feature, i }: { feature: typeof features[0], i: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1 }}
      onMouseMove={handleMouseMove}
      className={`group relative overflow-hidden rounded-3xl border border-black/5 bg-white p-8 ${feature.colSpan} hover:border-brand/30 transition-shadow duration-300 shadow-sm hover:shadow-lg`}
    >
      <div className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100">
        <motion.div
          className="absolute inset-0 bg-brand-gradient-subtle opacity-30"
          style={{
            maskImage: useMotionTemplate`radial-gradient(350px circle at ${x}px ${y}px, black, transparent)`,
            WebkitMaskImage: useMotionTemplate`radial-gradient(350px circle at ${x}px ${y}px, black, transparent)`,
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/5 text-brand group-hover:bg-brand group-hover:text-white transition-colors">
          <feature.icon size={24} />
        </div>
        <div>
          <h3 className="mb-2 text-xl font-bold text-rich-black">{feature.title}</h3>
          <p className="text-gray-500 leading-relaxed">{feature.description}</p>
        </div>
      </div>
    </motion.div>
  );
};

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-rich-black tracking-tight">
            Engineered for <span className="text-gradient">Domination</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            A suite of tools designed to put you leagues ahead of the competition.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={i} feature={feature} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
};