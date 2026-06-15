import React, { useState } from 'react';
import { GreenhouseItem, Plant } from '../types';
import { PLANTS_DATA } from '../data';
import { Droplet, Calendar, FileText, Trash2, Sliders, CheckCircle, AlertTriangle, Thermometer, Bell, BellOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BotanicalKeyButton } from './BotanicalKeyButton';

interface CareGreenhouseProps {
  items: GreenhouseItem[];
  onWater: (itemId: string) => void;
  onUpdateNotes: (itemId: string, newNotes: string) => void;
  onRemove: (itemId: string) => void;
  onToggleAlerts: (itemId: string) => void;
  onAddDefaultSample: () => void;
  timeSimulationDays: number;
  setTimeSimulationDays: (days: number) => void;
}

export default function CareGreenhouse({
  items,
  onWater,
  onUpdateNotes,
  onRemove,
  onToggleAlerts,
  onAddDefaultSample,
  timeSimulationDays,
  setTimeSimulationDays,
}: CareGreenhouseProps) {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');
  const [activeWandIds, setActiveWandIds] = useState<Record<string, boolean>>({});

  // Sourced Audio chime using Web Audio API
  const playWaterChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Node oscillators
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Water bubble sweep sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1450, ctx.currentTime + 0.18);
      
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      // AudioContext fails gracefully when user hasn't clicked page (browser policies)
    }
  };

  const handleWaterClick = (id: string) => {
    playWaterChime();
    setActiveWandIds(prev => ({ ...prev, [id]: true }));
    onWater(id);
    setTimeout(() => {
      setActiveWandIds(prev => ({ ...prev, [id]: false }));
    }, 600);
  };

  const startEditingNote = (item: GreenhouseItem) => {
    setEditingNoteId(item.id);
    setNoteText(item.notes);
  };

  const saveNoteClick = (id: string) => {
    onUpdateNotes(id, noteText);
    setEditingNoteId(null);
  };

  // Dynamic color interpolator transitioning smoothly from Red (0%) to Terracotta (25%) to Gold (65%) to Green (100%)
  const getHealthColor = (percent: number) => {
    if (percent <= 25) {
      // Red: rgb(239, 68, 68) to Terracotta: rgb(211, 115, 81)
      const p = percent / 25;
      const r = Math.round(239 + (211 - 239) * p);
      const g = Math.round(68 + (115 - 68) * p);
      const b = Math.round(68 + (81 - 68) * p);
      return `rgb(${r}, ${g}, ${b})`;
    } else if (percent <= 65) {
      // Terracotta: rgb(211, 115, 81) to Gold: rgb(204, 164, 98)
      const p = (percent - 25) / 40;
      const r = Math.round(211 + (204 - 211) * p);
      const g = Math.round(115 + (164 - 115) * p);
      const b = Math.round(81 + (98 - 81) * p);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Gold: rgb(204, 164, 98) to Vibrant Green: rgb(52, 211, 153)
      const p = (percent - 65) / 35;
      const r = Math.round(204 + (52 - 204) * p);
      const g = Math.round(164 + (211 - 164) * p);
      const b = Math.round(98 + (153 - 98) * p);
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  // Helper inside greenhouse matching simulated elapsed days
  const calculateCareMetrics = (item: GreenhouseItem) => {
    const parentPlant = PLANTS_DATA.find((p) => p.id === item.plantId);
    if (!parentPlant) return { percentLeft: 0, statusLabel: 'Thirsty', colorClass: 'bg-brand-terracotta', alertStyle: 'text-brand-terracotta' };

    const lastWateredTime = new Date(item.lastWatered).getTime();
    
    // Calculate elapsed hours, taking into account the time simulation slider
    const msElapsed = Date.now() - lastWateredTime;
    const realDaysElapsed = msElapsed / (1000 * 60 * 60 * 24);
    const totalDaysElapsed = realDaysElapsed + timeSimulationDays;

    const limitDays = parentPlant.wateringFrequencyDays;
    
    // Percentage remaining (moisture quotient)
    const ratio = Math.max(0, (limitDays - totalDaysElapsed) / limitDays);
    const percentLeft = Math.round(ratio * 100);

    let statusLabel = 'Prisist hydrated';
    let colorClass = 'bg-teal-400';
    let alertStyle = 'text-teal-400';

    if (percentLeft > 60) {
      statusLabel = 'Vibrant & Satiated';
      colorClass = 'bg-teal-400';
      alertStyle = 'text-teal-400';
    } else if (percentLeft > 25) {
      statusLabel = 'Satisfactory Dryness';
      colorClass = 'bg-brand-gold';
      alertStyle = 'text-brand-gold';
    } else if (percentLeft > 0) {
      statusLabel = 'Thirsty. Watering Due';
      colorClass = 'bg-brand-terracotta animate-pulse';
      alertStyle = 'text-brand-terracotta font-medium';
    } else {
      statusLabel = 'PARCHED / Critical Care Required';
      colorClass = 'bg-red-500 animate-bounce';
      alertStyle = 'text-red-500 font-bold';
    }

    return {
      percentLeft,
      statusLabel,
      colorClass,
      alertStyle,
      parentPlant,
    };
  };

  // Greenhouse Health Metric: average moisture percent across all items
  const calculateTotalHealth = () => {
    if (items.length === 0) return 100;
    const total = items.reduce((acc, item) => {
      const metric = calculateCareMetrics(item);
      return acc + metric.percentLeft;
    }, 0);
    return Math.round(total / items.length);
  };

  const greenhouseHealth = calculateTotalHealth();

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto" id="greenhouse-workspace">
      
      {/* Simulation Controls Dashboard */}
      <div 
        className="mb-10 bg-hunter-900/20 backdrop-blur-md rounded-2xl p-6 border border-hunter-800/40 flex flex-col md:flex-row items-center justify-between gap-6"
        id="greenhouse-tuner-panel"
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-hunter-950 rounded-xl border border-hunter-850">
            <Sliders className="w-5 h-5 text-brand-gold" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-medium text-brand-cream">Moisture Decay Simulator</h3>
            <p className="text-xs font-light text-brand-cream/50 mt-0.5">
              Simulate elapsed days to observe moisture evaporation rates.
            </p>
          </div>
        </div>

        {/* Time Slider */}
        <div className="flex items-center space-x-4 w-full md:w-auto" id="simulator-interactive-slider">
          <span className="text-xs font-mono text-brand-cream/60 uppercase">Normal Time</span>
          <input 
            type="range" 
            min="0" 
            max="14" 
            value={timeSimulationDays}
            onChange={(e) => setTimeSimulationDays(parseInt(e.target.value, 10))}
            className="w-full md:w-64 accent-brand-gold h-1 bg-hunter-950 rounded-lg cursor-pointer"
          />
          <span className="text-xs font-mono text-brand-gold bg-hunter-950 px-2.5 py-1 rounded border border-hunter-850">
            +{timeSimulationDays} Days Induced
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        /* Empty State */
        <div 
          className="text-center py-20 bg-hunter-900/10 border border-dashed border-hunter-800/40 rounded-3xl max-w-xl mx-auto"
          id="greenhouse-empty-canvas"
        >
          <div className="w-16 h-16 rounded-full bg-hunter-900/30 flex items-center justify-center mx-auto mb-6">
            <Droplet className="w-7 h-7 text-brand-gold stroke-[1.5]" />
          </div>
          <h3 className="font-serif text-2xl text-brand-cream font-medium mb-2">My Greenhouse is Vacant</h3>
          <p className="text-sm font-light text-brand-cream/55 max-w-sm mx-auto mb-8">
            You must select plants in our Exotic Gallery or match with our companion quiz to build your custom plant family tracking calendar.
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={onAddDefaultSample}
              className="px-5 py-2.5 bg-brand-gold text-hunter-950 text-xs font-bold font-mono tracking-widest uppercase rounded-full hover:bg-hunter-600 transition-all"
              id="greenhouse-add-sample-btn"
            >
              SPAWN TEST PALM
            </button>
          </div>
        </div>
      ) : (
        /* Active Display Grid */
        <div className="space-y-8" id="greenhouse-active-grid">
          
          {/* Header Dashboard Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" id="greenhouse-vitals-cards">
            
            <div className="bg-hunter-900/10 border border-hunter-800/30 rounded-2xl p-5 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-hunter-950/80 border border-hunter-800 flex items-center justify-center">
                <Thermometer className="w-5 h-5 text-brand-gold" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-cream/50">Sanctuary Vitals</span>
                <div className="text-sm font-sans font-medium text-brand-cream mt-0.5">Average Temperature: <span className="font-mono text-brand-gold font-bold">72°F</span></div>
              </div>
            </div>

            <div className="bg-hunter-900/10 border border-hunter-800/30 rounded-2xl p-5 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-hunter-950/80 border border-hunter-800 flex items-center justify-center">
                <div className="text-lg font-mono font-bold text-teal-400">{items.length}</div>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-cream/50">Adopted Companions</span>
                <div className="text-sm font-sans font-medium text-brand-cream mt-0.5">Actively tracked specimens</div>
              </div>
            </div>

            <div className="bg-hunter-900/10 border border-hunter-800/30 rounded-2xl p-5 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-hunter-950/80 border border-hunter-800 flex items-center justify-center">
                <div className={`text-lg font-mono font-bold ${greenhouseHealth > 50 ? 'text-teal-400' : 'text-brand-terracotta'}`}>{greenhouseHealth}%</div>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-cream/50">Greenhouse Moisture Health</span>
                <div className="text-sm font-sans font-medium text-brand-cream mt-0.5">Overall sanctuary hydration level</div>
              </div>
            </div>

          </div>

          {/* Plant Tracking Grid with dynamic card exits & spring entries */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            id="greenhouse-items-list-grid"
            layout
          >
            <AnimatePresence mode="popLayout">
              {items.map((item) => {
                const metrics = calculateCareMetrics(item);
                const parent = metrics.parentPlant;
                const isEditingNote = editingNoteId === item.id;

                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: -20, transition: { duration: 0.25 } }}
                    whileHover={{ y: -6, boxShadow: "0 15px 30px rgba(0,0,0,0.2)" }}
                    transition={{ type: "spring", stiffness: 120, damping: 15 }}
                    key={item.id}
                    className="bg-hunter-900/30 border border-hunter-800/40 rounded-3xl overflow-hidden flex flex-col justify-between shadow-lg relative group hover:border-brand-gold/30 transition-all duration-300"
                    id={`greenhouse-item-card-${item.id}`}
                  >
                    
                    {/* Card Main Image and Basic Tags */}
                    <div className="relative h-48 w-full" id={`item-media-${item.id}`}>
                      <img 
                        src={parent.image} 
                        alt={parent.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-hunter-950 via-hunter-950/20 to-transparent"></div>
                      
                      <button
                        onClick={() => onRemove(item.id)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-hunter-950/80 text-brand-cream/50 hover:text-red-400 border border-hunter-800/30 hover:border-red-400/40 transition-all cursor-pointer"
                        title="Prune Plant from Greenhouse"
                        id={`remove-plant-btn-${item.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <div className="flex-1 min-w-0 pr-3">
                          <span className="px-2 py-0.5 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 font-mono text-[9px] rounded-full uppercase tracking-wider">
                            {parent.category}
                          </span>
                          <h4 className="font-serif text-lg font-medium text-brand-cream leading-tight mt-1.5 truncate">
                            {item.nickname}
                          </h4>
                          <p className="text-xs font-mono text-brand-cream/50 italic mt-0.5 truncate">
                            {parent.name}
                          </p>
                        </div>

                        {/* Health Progress Ring around Circular Plant Thumbnail */}
                        <div className="relative flex items-center justify-center shrink-0 w-14 h-14" id={`health-ring-${item.id}`}>
                          <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 56 56">
                            {/* Track Circle */}
                            <circle
                              cx="28"
                              cy="28"
                              r="23"
                              className="stroke-hunter-950/60"
                              strokeWidth="3"
                              fill="transparent"
                            />
                            {/* Dynamic Watercolor Progress Ring */}
                            <motion.circle
                              cx="28"
                              cy="28"
                              r="23"
                              stroke={getHealthColor(metrics.percentLeft)}
                              strokeWidth="3"
                              fill="transparent"
                              strokeDasharray={144.5}
                              initial={{ strokeDashoffset: 144.5 }}
                              animate={{ strokeDashoffset: 144.5 - (metrics.percentLeft / 100) * 144.5 }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              strokeLinecap="round"
                            />
                          </svg>

                          {/* Clipped circular thumbnail */}
                          <div className="w-9 h-9 rounded-full overflow-hidden border border-hunter-950/40 relative z-10 bg-hunter-900 flex items-center justify-center">
                            <img
                              src={parent.image}
                              alt={parent.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            {/* Irrigation flash overlay */}
                            {activeWandIds[item.id] && (
                              <motion.div
                                initial={{ opacity: 0.8, scale: 0.8 }}
                                animate={{ opacity: 0, scale: 1.25 }}
                                className="absolute inset-0 bg-sky-300 rounded-full z-20"
                                transition={{ duration: 0.5 }}
                              />
                            )}
                          </div>

                          {/* Mini Numeric Health Tag Badge */}
                          <div 
                            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border border-hunter-950 flex items-center justify-center z-20 shadow"
                            style={{ backgroundColor: getHealthColor(metrics.percentLeft) }}
                            title={`${metrics.percentLeft}% Hydrated`}
                          >
                            <span className="text-[7px] text-hunter-950 font-bold leading-none">{metrics.percentLeft}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Care Gauge & Simulation Math */}
                    <div className="p-6 space-y-5" id={`item-care-body-${item.id}`}>
                      
                      {/* Live Moisture Tracking Dial */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-mono text-brand-cream/50 uppercase tracking-wide flex items-center">
                            <Droplet className="w-3.5 h-3.5 mr-1 text-sky-400" />
                            Soil Hydration
                          </span>
                          <span className={`font-semibold ${metrics.alertStyle}`}>
                            {metrics.percentLeft}% ({metrics.statusLabel})
                          </span>
                        </div>

                        {/* High-fidelity Bar Indicator with Dynamic Color Interpolation and Threshold Notching */}
                        <div className="relative w-full h-2.5 bg-hunter-950 rounded-full border border-hunter-850 overflow-hidden shadow-inner flex items-center" id={`indicator-track-${item.id}`}>
                          {metrics.percentLeft <= 35 && (
                            <motion.div 
                              className="absolute inset-0 bg-brand-terracotta/5 pointer-events-none"
                              animate={{ opacity: [0.2, 0.6, 0.2] }}
                              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                            />
                          )}

                          {/* Smooth color fluid filling segment */}
                          <motion.div 
                            className="h-full rounded-full"
                            style={{ backgroundColor: getHealthColor(metrics.percentLeft) }}
                            initial={{ width: 0 }}
                            animate={{ width: `${metrics.percentLeft}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          ></motion.div>

                          {/* Dry Threshold Hatch at 25% */}
                          <div 
                            className="absolute top-0 bottom-0 w-0.5 bg-brand-terracotta/40 border-l border-dashed border-brand-terracotta/30 z-10" 
                            style={{ left: '25%' }}
                            title="Watering Threshold Trigger (25%)"
                          />
                        </div>

                        {/* Threshold Helper Legend & Pulse Warn */}
                        <div className="flex justify-between items-center text-[9px] font-mono text-brand-cream/35 px-1 pt-0.5">
                          <span className="flex items-center">
                            <span className="w-1 h-3 bg-brand-terracotta/40 mr-1.5 inline-block shrink-0 rounded" />
                            Dry limit (25%)
                          </span>
                          {metrics.percentLeft <= 35 && (
                            <motion.span 
                              className="flex items-center text-brand-terracotta font-medium"
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            >
                              <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                              {metrics.percentLeft <= 25 ? 'Critical Hydration' : 'Approaching Dry Limit'}
                            </motion.span>
                          )}
                        </div>
                      </div>

                      {/* Adoption and Watering Timers list */}
                      <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-hunter-800/20 py-3 font-light text-brand-cream/70" id="item-timers">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono uppercase text-brand-cream/45 block">ADOPTED ON</span>
                          <span className="font-semibold flex items-center">
                            <Calendar className="w-3 h-3 mr-1 text-brand-gold/60" />
                            {new Date(item.dateAdded).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                          </span>
                        </div>
                        <div className="space-y-0.5 text-right">
                          <span className="text-[9px] font-mono uppercase text-brand-cream/45 block">LAST WATERED</span>
                          <span className="font-semibold italic">
                            {new Date(item.lastWatered).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {/* Progress Notes Notepad */}
                      <div className="bg-hunter-950/50 p-3.5 rounded-xl border border-hunter-850/40 relative" id="item-notes-module">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-mono uppercase tracking-wider text-brand-cream/45 flex items-center">
                            <FileText className="w-3 h-3 mr-1 text-[#8ba89b]" /> Care Records
                          </span>
                          {!isEditingNote && (
                            <button 
                              onClick={() => startEditingNote(item)}
                              className="text-[10px] font-mono text-brand-gold hover:underline cursor-pointer"
                            >
                              Edit
                            </button>
                          )}
                        </div>

                        {isEditingNote ? (
                          <div className="space-y-2">
                            <textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              rows={2}
                              maxLength={150}
                              className="w-full bg-hunter-900 border border-hunter-800 text-xs rounded p-2 text-brand-cream focus:outline-none focus:border-brand-gold"
                              placeholder="Log leaf growth, humidity notes..."
                            />
                            <div className="flex justify-end space-x-1.5">
                              <button
                                onClick={() => setEditingNoteId(null)}
                                className="px-2 py-1 bg-hunter-800 rounded text-[10px] text-brand-cream/60 uppercase font-mono hover:text-brand-cream"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => saveNoteClick(item.id)}
                                className="px-2 py-1 bg-brand-gold text-hunter-950 rounded text-[10px] font-bold uppercase font-mono hover:bg-hunter-600"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-brand-cream/60 italic font-light line-clamp-2">
                            {item.notes || "No progress entered. Tap edit to log growth behavior..."}
                          </p>
                        )}
                      </div>

                      {/* Push Alerts Toggle */}
                      <div className="flex items-center justify-between text-xs py-1.5 border-t border-b border-hunter-805/30" id={`alerts-toggle-row-${item.id}`}>
                        <div className="flex items-center space-x-2">
                          {item.alertsEnabled !== false ? (
                            <Bell className="w-3.5 h-3.5 text-brand-gold" />
                          ) : (
                            <BellOff className="w-3.5 h-3.5 text-brand-cream/35" />
                          )}
                          <div className="flex flex-col text-left">
                            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-brand-cream/80">Schedule Alerts</span>
                            <span className="text-[9px] text-brand-cream/40">Watering alerts based on schedule</span>
                          </div>
                        </div>
                        {/* Elegant Toggle Switch */}
                        <button
                          onClick={() => onToggleAlerts(item.id)}
                          role="switch"
                          aria-checked={item.alertsEnabled !== false}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            item.alertsEnabled !== false ? 'bg-brand-gold' : 'bg-hunter-950 border-hunter-800'
                          }`}
                          id={`toggle-alerts-switch-${item.id}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-md transition duration-200 ease-in-out ${
                              item.alertsEnabled !== false ? 'translate-x-4 bg-hunter-950' : 'translate-x-0 bg-brand-cream/70'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Skeuomorphic Irrigation Deck */}
                      <div className="flex items-center justify-between p-4 bg-hunter-950/70 rounded-2xl border border-hunter-850/60 shadow-inner" id={`irrigation-deck-${item.id}`}>
                        <div className="flex flex-col space-y-1 pr-2 max-w-[160px]">
                          <span className="text-[9px] font-mono font-bold tracking-widest text-[#8ba89b] uppercase">Pneumatic Valve</span>
                          <p className="text-[10px] text-brand-cream/50 leading-normal font-light">
                            Press down physical switch to irrigate soil cells.
                          </p>
                        </div>
                        <BotanicalKeyButton
                          id={`irrigate-plant-btn-${item.id}`}
                          icon={Droplet}
                          active={activeWandIds[item.id]}
                          onClick={() => handleWaterClick(item.id)}
                          ledColor="#38bdf8"
                          symbolColor="#7dd3fc"
                          label="IRRIGATE"
                          title="Press Mechanical Key to Irrigate"
                        />
                      </div>

                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

        </div>
      )}

    </div>
  );
}
