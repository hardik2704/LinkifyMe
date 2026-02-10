import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/Button';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4"
      >
        <motion.div
          layout
          className={`
                relative flex items-center justify-between px-6 transition-all duration-300
                ${isScrolled
              ? 'w-[90%] md:w-[60%] lg:w-[50%] h-16 bg-white/70 backdrop-blur-xl border border-black/5 rounded-full shadow-lg'
              : 'w-full max-w-7xl h-20 bg-transparent border-transparent'
            }
            `}
        >
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <AnimatePresence mode="wait">
              {!isScrolled ? (
                <motion.img
                  key="full-logo"
                  src="/logos/linkifyme-text.png"
                  alt="LinkifyMe"
                  className="h-10 md:h-12 w-auto object-contain"
                  initial={{ opacity: 0, scale: 0.8, rotateX: -90 }}
                  animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotateX: 90 }}
                  transition={{ duration: 0.4, ease: "backOut" }}
                />
              ) : (
                <motion.img
                  key="icon-logo"
                  src="/logos/linkifyme-icon.png"
                  alt="Li"
                  className="h-10 md:h-12 w-auto object-contain"
                  initial={{ opacity: 0, scale: 0.8, rotateX: -90 }}
                  animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotateX: 90 }}
                  transition={{ duration: 0.4, ease: "backOut" }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            {['Features', 'Stories', 'Pricing'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-gray-600 hover:text-rich-black transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-brand transition-all group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:block">
            <Button
              variant={isScrolled ? 'primary' : 'outline'}
              size="sm"
              className={!isScrolled ? "text-rich-black border-black/10 hover:bg-black/5" : ""}
              onClick={() => navigate('/audit')}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-rich-black p-2 hover:bg-black/5 rounded-full transition-colors"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </motion.div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-md pt-28 px-6 md:hidden flex flex-col items-center space-y-8 border-b border-black/5"
          >
            {['Features', 'Stories', 'Pricing'].map((item, i) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-medium text-rich-black hover:text-brand transition-colors"
              >
                {item}
              </motion.a>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-xs"
            >
              <Button className="w-full" onClick={() => {
                navigate('/audit');
                setIsMobileMenuOpen(false);
              }}>Get Started</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};