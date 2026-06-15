import React from 'react';
import { Sprout, Calendar, Sparkles, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { InteractiveMenu } from './InteractiveMenu';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  greenhouseCount: number;
}

export default function Navigation({ activeTab, setActiveTab, greenhouseCount }: NavigationProps) {
  const [logoImgUrl, setLogoImgUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Fetch the Pinterest pin image details via our CORS-free backend proxy
    fetch('/api/pinterest-logo')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP status ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && (data.thumbnail_url || data.url)) {
          setLogoImgUrl(data.thumbnail_url || data.url);
        }
      })
      .catch(err => {
        console.warn('Google AI Studio Proxy: Pinterest fetch unavailable, using beautiful fallback.', err);
      });
  }, []);

  const customMenuItems = [
    { id: 'gallery', label: 'gallery', icon: Sprout },
    { id: 'greenhouse', label: 'greenhouse', icon: Calendar },
    { id: 'quiz', label: 'quiz', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-40 bg-hunter-950/90 backdrop-blur-md border-b border-hunter-900/40 px-6 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">
        
        {/* Logo and Curator Signature */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 shrink-0" id="nav-brand-container">
          <motion.div 
            onClick={() => setActiveTab('gallery')} 
            className="flex items-center space-x-2.5 cursor-pointer group"
            id="nav-logo"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {/* Elegant luxury logo emblem load */}
            <div className="w-8 h-8 rounded-full border border-brand-gold/30 flex items-center justify-center bg-hunter-900/60 transition-all duration-300 group-hover:border-brand-gold overflow-hidden shrink-0">
              {logoImgUrl ? (
                <img 
                  src={logoImgUrl} 
                  alt="Botanica Logo" 
                  className="w-full h-full object-cover scale-105"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-brand-gold transition-transform duration-500 group-hover:rotate-[15deg]">
                  <path d="M12 3c-1.5 3-4.5 4.5-5 7.5-.5 3 1.5 5.5 3.5 6s4.5-1.5 5-4c.5-2.5-2-6.5-3.5-9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 21v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )}
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center space-x-1.5">
                <span className="font-serif text-xl font-semibold tracking-widest text-brand-cream group-hover:text-brand-gold transition-colors duration-300">
                  BOTANICA
                </span>
                <span className="px-1.5 py-0.5 text-[8px] font-mono uppercase bg-brand-terracotta/20 text-brand-terracotta rounded tracking-widest">
                  CURATOR
                </span>
              </div>
              <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-brand-cream/40">
                Botanical Living Art
              </span>
            </div>
          </motion.div>
        </div>

        {/* Center Navigation Modern Mobile Menu */}
        <div id="nav-center-menu" className="flex items-center justify-center">
          <InteractiveMenu
            activeId={activeTab}
            onChange={setActiveTab}
            items={customMenuItems}
            accentColor="var(--color-brand-terracotta)"
          />
        </div>

        {/* Right Call To Action matching the pill button in the image */}
        <div className="flex items-center space-x-3" id="nav-cta-container">
          <motion.button
            onClick={() => setActiveTab('greenhouse')}
            className="px-5 py-2 text-xs font-mono tracking-widest uppercase border border-brand-gold/50 hover:border-brand-gold text-brand-cream hover:bg-hunter-900/50 rounded-full transition-all duration-300 flex items-center space-x-2"
            id="nav-greenhouse-button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Heart className="w-3.5 h-3.5 fill-brand-terracotta stroke-brand-terracotta animate-pulse" />
            <span>MY GREENHOUSE ({greenhouseCount})</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
