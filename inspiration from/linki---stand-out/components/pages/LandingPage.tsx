import React from 'react';
import { Navbar } from '../Navbar';
import { Hero } from '../Hero';
import { Comparison } from '../Comparison';
import { Features } from '../Features';
import { Stories } from '../Stories';
import { DemoVideo } from '../DemoVideo';
import { Footer } from '../Footer';
import { Integrations } from '../Integrations';
import { PreFooterCTA } from '../PreFooterCTA';
import { FAQ } from '../FAQ';
import { Timeline } from '../Timeline';

export const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white text-rich-black font-sans selection:bg-brand selection:text-white overflow-x-hidden relative">
            {/* Global Atmosphere - Subtle Clouds */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Top Left Cloud */}
                <div className="absolute top-[-15%] left-[-15%] w-[45vw] h-[45vw] bg-brand/15 rounded-full blur-[120px] mix-blend-multiply animate-slow-spin" />

                {/* Bottom Right Cloud */}
                <div className="absolute bottom-[-15%] right-[-15%] w-[45vw] h-[45vw] bg-blue-600/15 rounded-full blur-[120px] mix-blend-multiply animate-slow-spin" style={{ animationDirection: 'reverse' }} />

                {/* Random Floating Cloud */}
                <div className="absolute top-[30%] left-[10%] w-[25vw] h-[25vw] bg-indigo-300/10 rounded-full blur-[100px] mix-blend-multiply animate-pulse" />

                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
            </div>

            <div className="relative z-10">
                <Navbar />
                <main>
                    <Hero />
                    <Comparison />
                    <Timeline />
                    <Integrations />
                    <Features />
                    <Stories />
                    <DemoVideo />
                    <FAQ />
                    <PreFooterCTA />
                </main>
                <Footer />
            </div>
        </div>
    );
};
