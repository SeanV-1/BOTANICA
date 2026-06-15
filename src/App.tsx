import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PLANTS_DATA, SYMPTOMS_GUIDE } from './data';
import { Plant, GreenhouseItem } from './types';
import Navigation from './components/Navigation';
import PlantQuiz from './components/PlantQuiz';
import CareGreenhouse from './components/CareGreenhouse';
import PlantDetailModal from './components/PlantDetailModal';
import { AnimatedDock } from './components/AnimatedDock';

// Lucide icons
import { 
  Sprout, 
  Droplet, 
  Heart, 
  HelpCircle, 
  BookOpen, 
  ShieldCheck, 
  Info,
  ChevronRight,
  Sparkles,
  Search,
  MessageSquare,
  Compass,
  Bell,
  X,
  Twitter,
  Instagram,
  Github,
  Linkedin
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('gallery');
  const [greenhouseItems, setGreenhouseItems] = useState<GreenhouseItem[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [timeSimulationDays, setTimeSimulationDays] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeSymptomIndex, setActiveSymptomIndex] = useState<number>(0);
  const [favoritePlantIds, setFavoritePlantIds] = useState<string[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // Sound Synth for generic button clicks
  const playClickSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  };

  // Hydrate greenhouse collection from localstorage
  useEffect(() => {
    const saved = localStorage.getItem('blonarc_greenhouse');
    if (saved) {
      try {
        setGreenhouseItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse local greenhouse storage', e);
      }
    } else {
      // Seed our custom beautiful greenhouse with default items to show off simulation immediately
      const initialSeed: GreenhouseItem[] = [
        {
          id: 'seed-1',
          plantId: 'chamaedorea-terracotta',
          nickname: 'Aurelia (Parlor Royal)',
          dateAdded: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
          lastWatered: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          notes: 'Thriving beautifully in the bookshelf. New sprout visible near the base!'
        },
        {
          id: 'seed-2',
          plantId: 'licuala-grandis',
          nickname: 'The Emperor (Fan Palm)',
          dateAdded: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          lastWatered: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
          notes: 'Placed in south-facing office bay. Prefers indirect misting in high mornings.'
        }
      ];
      setGreenhouseItems(initialSeed);
      localStorage.setItem('blonarc_greenhouse', JSON.stringify(initialSeed));
    }

    const savedFavs = localStorage.getItem('blonarc_favorites');
    if (savedFavs) {
      try {
        setFavoritePlantIds(JSON.parse(savedFavs));
      } catch (e) {}
    }
  }, []);

  // Global cursor move coordinates style injection (Zero Re-render Spotlight technology)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
      document.documentElement.style.setProperty('--mouse-opacity', '1');
    };

    const handleMouseLeave = () => {
      document.documentElement.style.setProperty('--mouse-opacity', '0');
    };

    const handleMouseEnter = () => {
      document.documentElement.style.setProperty('--mouse-opacity', '1');
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  // Save changes to localstorage
  const saveGreenhouse = (newItems: GreenhouseItem[]) => {
    setGreenhouseItems(newItems);
    localStorage.setItem('blonarc_greenhouse', JSON.stringify(newItems));
  };

  const handleAdoptPlant = (plant: Plant, nickname: string) => {
    const newItem: GreenhouseItem = {
      id: `gh-${Date.now()}`,
      plantId: plant.id,
      nickname: nickname,
      dateAdded: new Date().toISOString(),
      lastWatered: new Date().toISOString(),
      notes: 'No specific notes logged yet.'
    };
    const updated = [...greenhouseItems, newItem];
    saveGreenhouse(updated);
  };

  const handleWaterItem = (itemId: string) => {
    const updated = greenhouseItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          lastWatered: new Date().toISOString()
        };
      }
      return item;
    });
    setDismissedAlerts(prev => prev.filter(id => id !== itemId));
    saveGreenhouse(updated);
  };

  const handleToggleAlerts = (itemId: string) => {
    playClickSound();
    const updated = greenhouseItems.map(item => {
      if (item.id === itemId) {
        const isCurrentlyEnabled = item.alertsEnabled !== false;
        return {
          ...item,
          alertsEnabled: !isCurrentlyEnabled
        };
      }
      return item;
    });
    saveGreenhouse(updated);
  };

  const handleUpdateNotes = (itemId: string, newNotes: string) => {
    const updated = greenhouseItems.map(item => {
      if (item.id === itemId) {
        return { ...item, notes: newNotes };
      }
      return item;
    });
    saveGreenhouse(updated);
  };

  const handleRemoveItem = (itemId: string) => {
    const updated = greenhouseItems.filter(item => item.id !== itemId);
    saveGreenhouse(updated);
  };

  const handleAddDefaultSample = () => {
    const palm = PLANTS_DATA.find(p => p.id === 'chamaedorea-terracotta');
    if (palm) {
      handleAdoptPlant(palm, 'Barnaby Parlor');
    }
  };

  const toggleFavorite = (plantId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    let updated: string[];
    if (favoritePlantIds.includes(plantId)) {
      updated = favoritePlantIds.filter(id => id !== plantId);
    } else {
      updated = [...favoritePlantIds, plantId];
    }
    setFavoritePlantIds(updated);
    localStorage.setItem('blonarc_favorites', JSON.stringify(updated));
  };

  // Filter Catalog
  const filteredPlants = PLANTS_DATA.filter(plant => {
    const matchesSearch = plant.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          plant.scientificName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || plant.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate high-fidelity real-time watering alerts
  const activeAlertsList = greenhouseItems.map(item => {
    const parentPlant = PLANTS_DATA.find((p) => p.id === item.plantId);
    if (!parentPlant) return null;

    const lastWateredTime = new Date(item.lastWatered).getTime();
    const msElapsed = Date.now() - lastWateredTime;
    const realDaysElapsed = msElapsed / (1000 * 60 * 60 * 24);
    const totalDaysElapsed = realDaysElapsed + timeSimulationDays;
    const limitDays = parentPlant.wateringFrequencyDays;
    
    const ratio = Math.max(0, (limitDays - totalDaysElapsed) / limitDays);
    const percentLeft = Math.round(ratio * 100);

    return {
      item,
      parentPlant,
      percentLeft,
      isThirsty: percentLeft <= 25
    };
  }).filter((x): x is NonNullable<typeof x> => {
    return x !== null && x.isThirsty && x.item.alertsEnabled !== false && !dismissedAlerts.includes(x.item.id);
  });

  return (
    <div className="min-h-screen flex flex-col bg-hunter-950 text-brand-cream selection:bg-brand-terracotta selection:text-brand-cream relative" id="app-workspace">
      
      {/* High-Performance Interactive Mouse Spotlights */}
      <div className="mouse-spotlight-bg" aria-hidden="true" />
      <div className="mouse-spotlight-overlay" aria-hidden="true" />
      
      {/* Decorative Forest Backing ambient noise elements (Studio Shadows) */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-gradient-to-b from-brand-gold/5 via-transparent to-transparent pointer-events-none rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-0 w-[45vw] h-[45vw] bg-gradient-to-tr from-hunter-600/5 via-transparent to-transparent pointer-events-none rounded-full blur-3xl"></div>

      {/* Main Navigation bar */}
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        greenhouseCount={greenhouseItems.length}
      />

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          
          {/* VIEW 1: EXOTIC GALLERY WORKSPACE (EDITORIAL SHOWCASE) */}
          {activeTab === 'gallery' && (
            <motion.div 
              key="gallery"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-0" 
              id="gallery-workspace"
            >
            
            {/* HERO SEGMENT (Block 1 in Image) */}
            <section 
              className="relative min-h-[90vh] flex items-center bg-gradient-to-b from-hunter-950 via-hunter-900 to-hunter-950 py-16 px-6 lg:px-12 border-b border-hunter-900/30 overflow-hidden"
              id="hero-section"
            >
              {/* Background ambient shade */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,71,49,0.15),transparent_60%)]"></div>

              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 w-full">
                
                {/* Left narrative area: large text elements */}
                <div className="lg:col-span-6 space-y-8" id="hero-left-col">
                  
                  {/* Decorative pre-header brand lines */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="flex items-center space-x-3 text-xs tracking-[0.25em] font-mono text-brand-gold uppercase"
                  >
                    <span className="w-8 h-[1px] bg-brand-gold"></span>
                    <span>ESTABLISHED MCMLXXXIV (1984)</span>
                  </motion.div>

                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="font-serif text-5xl md:text-7xl font-light text-brand-cream tracking-tight leading-none" id="hero-display-header"
                  >
                    Cultivated <br />
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.7 }}
                      className="italic text-brand-terracotta inline-block"
                    >
                      exotic
                    </motion.span> <br />
                    Collection
                  </motion.h1>

                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="max-w-lg text-sm md:text-base font-light text-brand-cream/70 leading-relaxed font-sans" id="hero-display-subtitle"
                  >
                    Step inside a silent botanical sanctuary. We organize highly architectural, premium potted exotics carefully reared inside our forest-green glasshouses to infuse living rooms with organic sculptured artistry.
                  </motion.p>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="flex flex-wrap gap-4 pt-4" id="hero-btn-container"
                  >
                    <a 
                      href="#catalog-view"
                      className="px-8 py-3.5 bg-brand-gold hover:bg-hunter-600 text-hunter-950 font-mono text-xs font-bold tracking-widest uppercase rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      EXPLORE CATALOGUE
                    </a>
                    
                    <button 
                      onClick={() => { playClickSound(); setActiveTab('quiz'); }}
                      className="px-8 py-3.5 border border-brand-cream/30 hover:border-brand-gold text-brand-cream font-mono text-xs tracking-widest uppercase rounded-full hover:bg-hunter-900/50 transition-all duration-300"
                    >
                      MATCH MY ROOM
                    </button>
                  </motion.div>

                  {/* Tiny metadata spec list matching high end editorial look */}
                  <div className="grid grid-cols-3 gap-6 pt-10 border-t border-hunter-900/40" id="hero-specials">
                    <div>
                      <div className="text-xl font-serif text-brand-gold font-light">05+</div>
                      <div className="text-[10px] font-mono tracking-wider text-brand-cream/50 uppercase mt-1">Exotic Species</div>
                    </div>
                    <div>
                      <div className="text-xl font-serif text-brand-gold font-light">100%</div>
                      <div className="text-[10px] font-mono tracking-wider text-brand-cream/50 uppercase mt-1">Acclimatized</div>
                    </div>
                    <div>
                      <div className="text-xl font-serif text-brand-gold font-light">Organic</div>
                      <div className="text-[10px] font-mono tracking-wider text-brand-cream/50 uppercase mt-1">Soil Infusion</div>
                    </div>
                  </div>

                </div>

                {/* Right media area: Lush Licuala Grandis Fan Palm image */}
                <div className="lg:col-span-6 relative flex justify-center lg:justify-end" id="hero-right-col">
                  <div className="relative w-full max-w-lg aspect-[3/4] rounded-t-[10rem] rounded-b-[2rem] overflow-hidden border border-hunter-800/40 shadow-2xl group cursor-pointer" onClick={() => setSelectedPlant(PLANTS_DATA[0])}>
                    
                    <img 
                      src="/src/assets/images/plant_hero_1781543958364.jpg" 
                      alt="Licuala Grandis Fan Palm" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Dark gradient blur covering image bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-hunter-950 via-hunter-950/20 to-transparent"></div>

                    {/* Overlay specs info */}
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                      <div>
                        <span className="text-[10px] font-mono text-[#8ba89b] italic tracking-wide">Featured Species</span>
                        <h3 className="font-serif text-xl font-semibold text-brand-cream">Licuala Grandis</h3>
                        <p className="text-[10px] font-mono text-brand-gold tracking-widest mt-0.5">EXOTIC PALM</p>
                      </div>
                      
                      <div className="p-3.5 rounded-full bg-hunter-950/80 backdrop-blur-md border border-hunter-800 text-brand-gold hover:text-brand-cream hover:scale-110 transition-all cursor-pointer" title="View Full Narrative">
                        <BookOpen className="w-4 h-4" />
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </section>


            {/* STORY / FEATURED DUO SEGMENT (Block 2 in Image) */}
            <section 
              className="py-24 bg-hunter-950 border-b border-hunter-900/30 px-6 lg:px-12 relative overflow-hidden"
              id="feature-story-section"
            >
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                
                {/* Visual Area (Duos) on Left representation, content on Right */}
                <div className="lg:col-span-6 order-2 lg:order-1 relative" id="story-visual-col">
                  <div className="relative w-full max-w-lg aspect-[4/3] rounded-3xl overflow-hidden border border-hunter-800/40 shadow-xl group cursor-pointer" onClick={() => setSelectedPlant(PLANTS_DATA[1])}>
                    
                    <img 
                      src="/src/assets/images/plant_duo_1781543972763.jpg" 
                      alt="Dual foliage Calathea duo" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-hunter-950 via-hunter-950/20 to-transparent"></div>

                    {/* Dual botanical badge tags */}
                    <div className="absolute top-4 left-4 bg-hunter-950/80 border border-hunter-800/40 px-3 py-1 rounded-full text-[10px] font-mono text-brand-cream flex items-center space-x-1.5 backdrop-blur-sm">
                      <Sprout className="w-3.5 h-3.5 text-brand-gold" />
                      <span>Foliage Arrangement Duo</span>
                    </div>

                  </div>
                </div>

                {/* Narrative Area on Right */}
                <div className="lg:col-span-6 order-1 lg:order-2 space-y-6" id="story-narrative-col">
                  
                  <motion.span 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-[10px] font-mono tracking-[0.25em] text-brand-terracotta uppercase block"
                  >
                    FEATURED COMBINATION
                  </motion.span>
                  
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="font-serif text-3xl md:text-5xl font-light text-brand-cream tracking-tight leading-none"
                  >
                    Elegant Foliage <br />
                    <span className="italic text-brand-terracotta font-normal">Satiated Rhythm</span>
                  </motion.h2>

                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-sm font-light text-brand-cream/70 leading-relaxed font-sans max-w-md"
                  >
                    Some species thrive double. Our custom-curated combinations pair light-sensitive Calathea pinstripes with glossy, air-purifying broad foliage Peace Lilies. Complete with slow-release nutrients and custom glaze clay bowls.
                  </motion.p>

                  <div className="pt-4 flex space-x-4" id="story-btn-row">
                    <button
                      onClick={() => setSelectedPlant(PLANTS_DATA[1])}
                      className="px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-brand-cream hover:text-brand-terracotta border border-brand-gold/30 hover:border-brand-terracotta rounded-full transition-all duration-300 bg-hunter-900/30"
                    >
                      READ BIOGRAPHY
                    </button>
                  </div>

                </div>

              </div>
            </section>


            {/* PLANT CATALOG SPECIES GRID (Block 3 in Image) */}
            <section 
              className="py-24 bg-gradient-to-b from-hunter-950 to-hunter-900/60 px-6 lg:px-12 scroll-mt-20"
              id="catalog-view"
            >
              <div className="max-w-7xl mx-auto space-y-12">
                
                {/* Centered Heading mimicking Featured Editions layout */}
                <div className="text-center space-y-4 max-w-2xl mx-auto" id="catalog-header">
                  <motion.span 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-[10px] font-mono tracking-[0.2em] text-brand-terracotta uppercase block"
                  >
                    EXCLUSIVE STOCK
                  </motion.span>
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="font-serif text-3xl md:text-5xl font-light text-brand-cream tracking-tight leading-none"
                  >
                    Featured Editions
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-xs md:text-sm font-light text-brand-cream/60 leading-relaxed"
                  >
                    A limited series of forest-acclimatized plants potted inside our custom-layered sand, clay, and terracotta designer dishes. Ready for sanctuary integration.
                  </motion.p>
                </div>

                {/* Filter + Search Bar (Interactive controls) */}
                <div 
                  className="bg-hunter-950/70 border border-hunter-800/40 p-4 rounded-2xl max-w-3xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between"
                  id="catalog-controllers"
                >
                  
                  {/* Category Filter Pills */}
                  <div className="flex flex-wrap gap-1.5" id="category-pills">
                    {['All', 'Palm', 'Foliage', 'Dracaena'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => { playClickSound(); setSelectedCategory(cat); }}
                        className={`px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded-full transition-all ${
                          selectedCategory === cat 
                            ? 'bg-brand-gold text-hunter-950 font-bold' 
                            : 'text-brand-cream/70 hover:text-brand-cream hover:bg-hunter-900/40'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Search bar */}
                  <div className="relative w-full md:w-64" id="search-input-container">
                    <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-brand-cream/35" />
                    <input 
                      type="text" 
                      placeholder="Search species name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-hunter-900 border border-hunter-800 focus:border-brand-gold text-xs rounded-xl text-brand-cream placeholder-brand-cream/30 focus:outline-none transition-colors"
                      id="catalog-search"
                    />
                  </div>

                </div>

                {/* 3-Column Catalog Grid with staggered spring layout */}
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6" 
                  id="catalog-grid"
                  layout="position"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.05
                      }
                    }
                  }}
                >
                  {filteredPlants.map((plant) => {
                    const isFav = favoritePlantIds.includes(plant.id);
                    return (
                      <motion.div 
                        layout="position"
                        variants={{
                          hidden: { opacity: 0, y: 35, scale: 0.95 },
                          show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 110, damping: 14 } }
                        }}
                        whileHover={{ y: -8, scale: 1.01, boxShadow: "0 20px 40px rgba(24,38,27,0.15)" }}
                        whileTap={{ scale: 0.98 }}
                        key={plant.id}
                        onClick={() => setSelectedPlant(plant)}
                        className="bg-hunter-900/20 border border-hunter-800/30 rounded-3xl overflow-hidden hover:border-brand-gold/30 transition-all duration-300 group cursor-pointer flex flex-col justify-between shadow-md"
                        id={`plant-card-${plant.id}`}
                      >
                        
                        {/* Media and Favorite trigger */}
                        <div className="relative aspect-[3/4] overflow-hidden" id={`card-media-${plant.id}`}>
                          <img 
                            src={plant.image} 
                            alt={plant.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-hunter-950 via-transparent to-transparent opacity-75"></div>

                          {/* Quick Add Companion Favorite trigger */}
                          <button
                            onClick={(e) => toggleFavorite(plant.id, e)}
                            className="absolute top-4 right-4 p-2.5 rounded-full bg-hunter-950/80 border border-hunter-800/40 text-brand-cream/70 hover:text-brand-terracotta backdrop-blur-md transition-colors"
                            title="Favorite/Wishlist Plant"
                            id={`fav-btn-${plant.id}`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-brand-terracotta stroke-brand-terracotta' : ''}`} />
                          </button>

                          {/* Category Sub-badge overlay */}
                          <span className="absolute bottom-4 left-4 px-2.5 py-0.5 text-[9px] font-mono tracking-widest bg-brand-gold text-hunter-950 rounded-full font-bold uppercase">
                            {plant.category}
                          </span>
                        </div>

                        {/* Plant description body */}
                        <div className="p-6 space-y-3" id={`card-body-${plant.id}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-serif text-lg font-semibold text-brand-cream group-hover:text-brand-gold transition-colors leading-tight">
                                {plant.name}
                              </h3>
                              <p className="text-[10px] font-mono italic text-[#8ba89b] mt-0.5">
                                {plant.scientificName}
                              </p>
                            </div>
                            <span className="font-mono text-xs font-semibold text-brand-gold whitespace-nowrap pt-1">
                              {plant.price}
                            </span>
                          </div>

                          <p className="text-xs font-light text-brand-cream/65 line-clamp-2 leading-relaxed">
                            {plant.description}
                          </p>

                          <div className="pt-3 border-t border-hunter-850/40 flex justify-between items-center text-[10px] font-mono text-brand-cream/50" id="card-meta">
                            <span className="flex items-center">
                              <Droplet className="w-3 h-3 mr-1 text-sky-450" /> Water: {plant.wateringFrequencyDays} days
                            </span>
                            <span className="hover:underline flex items-center group-hover:text-brand-gold transition-colors">
                              Bio Specs <ChevronRight className="w-3 h-3 ml-0.5" />
                            </span>
                          </div>
                        </div>

                      </motion.div>
                    );
                  })}
                </motion.div>

                {filteredPlants.length === 0 && (
                  <div className="text-center py-12 text-brand-cream/40 font-light text-sm" id="catalog-no-results">
                    No matching exotics currently in stock. Refine your search query.
                  </div>
                )}

              </div>
            </section>


            {/* COMPOSITE INTERACTIVE CARE CLINIC (The Botanical Hospital Solver) */}
            <section 
              className="py-24 bg-hunter-950 border-t border-hunter-900/30 px-6 lg:px-12 relative overflow-hidden"
              id="care-clinic-diagnose"
            >
              <div className="max-w-4xl mx-auto text-center space-y-12">
                
                <div className="space-y-3" id="clinic-header">
                  <span className="text-[10px] font-mono tracking-[0.25em] text-brand-gold uppercase block">
                    INTELLIGENT SANCTUARY CARE
                  </span>
                  <h2 className="font-serif text-3xl md:text-5xl font-light text-brand-cream tracking-tight">
                    Botanical Care Clinique
                  </h2>
                  <p className="text-sm font-light text-brand-cream/60 max-w-md mx-auto leading-relaxed">
                    Leaves speaking? Match symptoms with organic diagnoses tailored by our expert greenhouse growers to cure foliage stresses.
                  </p>
                </div>

                {/* Main Diagnose Workspace cards layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch" id="clinic-body">
                  
                  {/* Left Tabs Column: Listing Symptom issues */}
                  <div className="md:col-span-5 flex flex-col justify-start space-y-2 text-left" id="clinic-tab-labels">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-brand-cream/40 mb-2 pl-2">Select Visible Symptom</span>
                    {SYMPTOMS_GUIDE.map((guide, idx) => (
                      <button
                        key={idx}
                        onClick={() => { playClickSound(); setActiveSymptomIndex(idx); }}
                        className={`p-4 rounded-xl text-left text-xs transition-all flex items-center justify-between border cursor-pointer ${
                          activeSymptomIndex === idx
                            ? 'bg-hunter-900/60 border-brand-gold text-brand-gold font-medium'
                            : 'bg-hunter-950 border-hunter-850/30 text-brand-cream/70 hover:bg-hunter-900/30'
                        }`}
                        id={`symptom-tab-btn-${idx}`}
                      >
                        <span className="pr-4">{guide.symptom}</span>
                        <ChevronRight className="w-4 h-4 opacity-70 shrink-0" />
                      </button>
                    ))}
                  </div>

                  {/* Right display Column: Detailing the treatment */}
                  <div 
                    className="md:col-span-7 bg-hunter-900/20 border border-hunter-800/40 p-8 rounded-2xl text-left flex flex-col justify-between overflow-hidden relative"
                    id="clinic-treatment-details"
                  >
                    <AnimatePresence mode="wait">
                      <motion.div 
                        key={activeSymptomIndex}
                        variants={{
                          hidden: { opacity: 0 },
                          visible: {
                            opacity: 1,
                            transition: {
                              staggerChildren: 0.08,
                            }
                          },
                          exit: {
                            opacity: 0,
                            x: -12,
                            transition: { duration: 0.15 }
                          }
                        }}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-6"
                      >
                        
                        <motion.div 
                          variants={{
                            hidden: { opacity: 0, y: 8 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
                          }}
                          className="flex items-center space-x-3 text-[10px] font-mono text-brand-terracotta tracking-wider uppercase"
                        >
                          <Info className="w-4 h-4 shrink-0" />
                          <span>Symptom Selected: {SYMPTOMS_GUIDE[activeSymptomIndex].symptom}</span>
                        </motion.div>

                        <motion.div 
                          variants={{
                            hidden: { opacity: 0, y: 12 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } }
                          }}
                          className="space-y-2"
                        >
                          <h4 className="text-xs font-mono uppercase tracking-wide text-brand-cream/45">Probable Underlying Cause</h4>
                          <p className="text-sm font-light text-brand-cream/80 leading-relaxed italic">
                            "{SYMPTOMS_GUIDE[activeSymptomIndex].cause}"
                          </p>
                        </motion.div>

                        <motion.div 
                          variants={{
                            hidden: { opacity: 0, y: 12 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } }
                          }}
                          className="space-y-2 pt-2 border-t border-hunter-850/40"
                        >
                          <h4 className="text-xs font-mono uppercase tracking-wide text-brand-cream/45">Curated Treatment Action</h4>
                          <p className="text-sm font-light text-[#8ba89b] leading-relaxed">
                            {SYMPTOMS_GUIDE[activeSymptomIndex].solution}
                          </p>
                        </motion.div>

                      </motion.div>
                    </AnimatePresence>

                    <div className="pt-8 border-t border-hunter-850/20 text-[10px] font-mono text-brand-cream/40 leading-snug flex items-center space-x-2 mt-6">
                      <ShieldCheck className="w-4 h-4 text-brand-gold" />
                      <span>Regular monitoring helps root acclimatizations. Always inspect soil deep density.</span>
                    </div>

                  </div>

                </div>

              </div>
            </section>

            </motion.div>
          )}

          {/* VIEW 2: GREENHOUSE TRACKER VIEW */}
          {activeTab === 'greenhouse' && (
            <motion.div 
              key="greenhouse"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <div className="py-12 bg-hunter-950 border-b border-hunter-900/30" id="greenhouse-view-header">
                <div className="max-w-4xl mx-auto text-center space-y-3 px-4">
                  <span className="text-[10px] font-mono tracking-[0.25em] text-brand-gold uppercase block">
                    My Private Sanctuary
                  </span>
                  <h1 className="font-serif text-4xl md:text-5xl font-light text-brand-cream">
                    My Greenhouse Collection
                  </h1>
                  <p className="text-xs md:text-sm font-light text-brand-cream/60 max-w-md mx-auto">
                    Monitor moisture ratios, fast-forward time to test water decay thresholds, and track daily progress notes to secure botanical wellness.
                  </p>
                </div>
              </div>

              <CareGreenhouse 
                items={greenhouseItems}
                onWater={handleWaterItem}
                onUpdateNotes={handleUpdateNotes}
                onRemove={handleRemoveItem}
                onToggleAlerts={handleToggleAlerts}
                onAddDefaultSample={handleAddDefaultSample}
                timeSimulationDays={timeSimulationDays}
                setTimeSimulationDays={setTimeSimulationDays}
              />
            </motion.div>
          )}

          {/* VIEW 3: COMPANION MATCHING QUIZ VIEW */}
          {activeTab === 'quiz' && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <div className="py-12 bg-hunter-950 border-b border-hunter-900/30" id="quiz-view-header">
                <div className="max-w-4xl mx-auto text-center space-y-3 px-4">
                  <span className="text-[10px] font-mono tracking-[0.25em] text-brand-terracotta uppercase block">
                    Discover Sanctuary Balance
                  </span>
                  <h1 className="font-serif text-4xl md:text-5xl font-light text-brand-cream">
                    Companion Matching Quiz
                  </h1>
                  <p className="text-xs md:text-sm font-light text-brand-cream/60 max-w-sm mx-auto">
                    Find the exact breed matching your ambient lighting, pet-safety needs, and watering personality.
                  </p>
                </div>
              </div>

              <PlantQuiz 
                onAdopt={handleAdoptPlant}
                onViewPlant={(plant) => setSelectedPlant(plant)}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER BAR - Luxury Curated Editorial Layout */}
      <footer className="bg-[#090f0b] border-t border-hunter-800/40 pt-16 pb-12 px-6 text-brand-cream/60 relative overflow-hidden" id="editorial-footer">
        {/* Soft atmospheric backlight halo */}
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          
          {/* Main Footer Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-hunter-900/20">
            
            {/* Column 1: Brand Curation (5 cols) */}
            <div className="md:col-span-5 space-y-4 text-left">
              <div className="flex items-center space-x-2.5">
                <span className="font-serif text-xl font-bold tracking-widest text-brand-cream">BOTANICA</span>
                <span className="px-1.5 py-0.5 text-[8px] font-mono uppercase bg-brand-gold/10 text-brand-gold rounded tracking-wider border border-brand-gold/25">EST. 2026</span>
              </div>
              <p className="text-xs font-light text-brand-cream/50 leading-relaxed max-w-sm">
                An archival digital sanctuary crafted for rare botanical specimens, offering precise moisture analytics and aesthetic greenhouse diagnostics. Developed exclusively under our curator’s direct vision.
              </p>
            </div>

            {/* Column 2: Quick Navigation Actions (4 cols) */}
            <div className="md:col-span-4 space-y-3 text-left">
              <h5 className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-gold">Exquisite Shortcuts</h5>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <button onClick={() => { playClickSound(); setActiveTab('gallery'); }} className="hover:text-brand-gold text-brand-cream/50 text-left transition-colors py-0.5">
                  // GALLERY SPECIES
                </button>
                <button onClick={() => { playClickSound(); setActiveTab('greenhouse'); }} className="hover:text-brand-gold text-brand-cream/50 text-left transition-colors py-0.5">
                  // GREENHOUSE LABS
                </button>
                <button onClick={() => { playClickSound(); setActiveTab('quiz'); }} className="hover:text-brand-gold text-brand-cream/50 text-left transition-colors py-0.5">
                  // SANCTUARY QUIZ
                </button>
              </div>
            </div>

            {/* Column 3: Curator Signature (3 cols) */}
            <div className="md:col-span-3 space-y-3 text-left">
              <h5 className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-terracotta">Sanctuary Register</h5>
              <div className="space-y-1.5 text-xs font-light text-brand-cream/40">
                <div className="flex justify-between">
                  <span>Greenhouse Inventory:</span>
                  <span className="font-mono text-brand-cream/70">{greenhouseItems.length} spec.</span>
                </div>
                <div className="flex justify-between">
                  <span>Watering Alerts:</span>
                  <span className="font-mono text-brand-terracotta">{activeAlertsList.length} active</span>
                </div>
                <div className="flex justify-between">
                  <span>Chief Curator:</span>
                  <span className="font-serif italic text-brand-cream/80">Sean</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Metabar Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-brand-cream/30 gap-6" id="footer-metabar">
            <div className="flex items-center space-x-1.5">
              <span>© 2026 BOTANICA.</span>
              <span>•</span>
              <span>ALL RIGHTS RESERVED.</span>
            </div>
            
            <div className="flex-1 w-full flex justify-center pb-8 sm:pb-0 sm:mt-0">
              <AnimatedDock items={[
                { link: 'https://github.com/SeanV-1', target: '_blank', Icon: <Github className="w-5 h-5 text-brand-cream hover:text-brand-gold transition-colors duration-300" /> },
                { link: 'https://www.linkedin.com/in/sean-as-3a0665384/', target: '_blank', Icon: <Linkedin className="w-5 h-5 text-brand-cream hover:text-brand-gold transition-colors duration-300" /> }
              ]} />
            </div>

            <div className="flex items-center space-x-1 uppercase text-[9px] tracking-wider text-brand-cream/40">
              <span>SHADOWS & PALMS</span>
            </div>
          </div>

        </div>
      </footer>

      {/* LUXURY PLANET BIOGRAPHY DETAIL MODAL */}
      <AnimatePresence>
        {selectedPlant && (
          <PlantDetailModal 
            plant={selectedPlant}
            onClose={() => setSelectedPlant(null)}
            onAdopt={(plant, nickname) => {
              handleAdoptPlant(plant, nickname);
              setSelectedPlant(null);
            }}
            isAlreadyAdopted={greenhouseItems.some(i => i.plantId === selectedPlant.id)}
          />
        )}
      </AnimatePresence>

      {/* Dynamic Floating Push Notification Tray */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {activeAlertsList.map(({ item, parentPlant, percentLeft }) => (
            <motion.div
              layout
              key={`alert-${item.id}`}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, x: 50, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-[#111a13]/95 backdrop-blur-md border border-brand-terracotta/40 rounded-2xl p-4 shadow-2xl flex items-start space-x-3 pointer-events-auto overflow-hidden relative"
            >
              {/* Hot glow backing */}
              <div className="absolute top-0 left-0 w-1 h-full bg-brand-terracotta" />
              
              {/* circular thumbnail */}
              <div className="w-10 h-10 rounded-full overflow-hidden border border-hunter-800 shrink-0 bg-hunter-950">
                <img
                  src={parentPlant.image}
                  alt={parentPlant.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Text metadata */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-brand-terracotta font-semibold uppercase tracking-wider flex items-center">
                    <Bell className="w-3 h-3 mr-1 animate-bounce" /> WATER DETAILS
                  </span>
                  <button
                    onClick={() => setDismissedAlerts(prev => [...prev, item.id])}
                    className="text-brand-cream/30 hover:text-brand-cream/60 p-1 rounded-full hover:bg-hunter-950/50 transition-colors cursor-pointer"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <h4 className="font-serif text-sm font-medium text-brand-cream leading-tight mt-1">
                  {item.nickname}
                </h4>
                <p className="text-xs text-brand-cream/60 leading-normal font-light mt-0.5">
                  Typical cycle of <span className="font-semibold text-brand-gold">{parentPlant.wateringFrequencyDays} days</span> is past due. Dry level is <span className="font-semibold text-brand-terracotta">{100 - percentLeft}%</span>.
                </p>

                {/* Direct quick action controller */}
                <div className="mt-3 flex items-center justify-between border-t border-hunter-800/40 pt-2.5">
                  <span className="text-[9px] font-mono text-brand-cream/30">
                    ID: {item.id.replace('gh-', '')}
                  </span>
                  <button
                    onClick={() => handleWaterItem(item.id)}
                    className="px-3 py-1 bg-brand-terracotta text-brand-cream hover:bg-brand-terracotta/90 text-[10px] font-mono font-bold tracking-widest uppercase rounded-md transition-colors cursor-pointer"
                  >
                    Water Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
