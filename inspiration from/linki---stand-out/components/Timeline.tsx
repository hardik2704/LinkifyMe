import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { User, CreditCard, FileText, ArrowRight } from 'lucide-react';

export const Timeline: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"]
    });

    const steps = [
        {
            id: 1,
            icon: User,
            title: "Enter Profile",
            description: "Paste your LinkedIn URL to start the deep-dive analysis.",
            color: "from-blue-500 to-cyan-400"
        },
        {
            id: 2,
            icon: CreditCard,
            title: "Complete Payment",
            description: "Secure one-time payment for premium insights.",
            color: "from-indigo-500 to-purple-500"
        },
        {
            id: 3,
            icon: FileText,
            title: "Receive Summary",
            description: "Get your personalized action plan instantly.",
            color: "from-cyan-500 to-teal-400"
        }
    ];

    return (
        <section ref={containerRef} className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold text-rich-black tracking-tight mb-4"
                    >
                        How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-400">Works</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-500 max-w-2xl mx-auto"
                    >
                        Three simple steps to professional excellence.
                    </motion.p>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0 rounded-full" />
                    <motion.div
                        className="hidden md:block absolute top-1/2 left-0 h-1 bg-gradient-to-r from-brand to-brand-light -translate-y-1/2 z-0 rounded-full origin-left"
                        style={{ scaleX: scrollYProgress }}
                    />

                    {/* Connecting Line (Mobile) */}
                    <div className="md:hidden absolute top-0 left-8 bottom-0 w-1 bg-gray-100 -translate-x-1/2 z-0 rounded-full" />
                    <motion.div
                        className="md:hidden absolute top-0 left-8 w-1 bg-gradient-to-b from-brand to-brand-light -translate-x-1/2 z-0 rounded-full origin-top"
                        style={{ scaleY: scrollYProgress, height: '100%' }}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2, duration: 0.5 }}
                                className="flex flex-col items-center md:items-start relative group"
                            >
                                {/* Step Node */}
                                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-gray-100 shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
                                    <step.icon className={`w-8 h-8 text-gray-700 group-hover:text-brand transition-colors duration-300`} />

                                    {/* Number Badge */}
                                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-rich-black text-white flex items-center justify-center font-bold text-sm border-2 border-white">
                                        {step.id}
                                    </div>
                                </div>

                                <div className="text-center md:text-left pl-16 md:pl-0">
                                    <h3 className="text-xl font-bold text-rich-black mb-2">{step.title}</h3>
                                    <p className="text-gray-500 leading-relaxed">{step.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
