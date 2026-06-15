import React, { useState } from 'react';
import { Plant } from '../types';
import { X, Sun, Droplet, ShieldCheck, HelpCircle, Thermometer, Flag, Compass, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { BotanicalKeyButton } from './BotanicalKeyButton';

interface PlantDetailModalProps {
  plant: Plant | null;
  onClose: () => void;
  onAdopt: (plant: Plant, nickname: string) => void;
  isAlreadyAdopted: boolean;
}

export default function PlantDetailModal({ plant, onClose, onAdopt, isAlreadyAdopted }: PlantDetailModalProps) {
  const [nickname, setNickname] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  if (!plant) return null;

  const handleAdopt = (e: React.FormEvent) => {
    e.preventDefault();
    onAdopt(plant, nickname || `My ${plant.name.split(' ')[0]}`);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setNickname('');
    }, 2500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-hunter-950/85 backdrop-blur-lg overflow-y-auto" 
      id="detail-modal-root"
    >
      
      {/* Container Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20, transition: { duration: 0.2 } }}
        transition={{ type: "spring", stiffness: 140, damping: 18 }}
        className="relative bg-hunter-900 border border-hunter-800/60 rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl"
        id={`modal-container-${plant.id}`}
      >
        {/* Absolute Close Hammer Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-hunter-950/80 text-brand-cream/60 hover:text-brand-cream border border-hunter-800/40 hover:border-brand-gold/30 transition-all cursor-pointer"
          id="close-modal-btn"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Column A: Photorealistic display with custom title banner */}
          <div className="relative h-64 md:h-[550px]" id="modal-image-col">
            <img 
              src={plant.image} 
              alt={plant.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-hunter-900 via-transparent to-transparent"></div>
            
            {/* Origin Pill Tag */}
            <div className="absolute bottom-4 left-4 bg-hunter-950/80 border border-hunter-800/40 backdrop-blur-md px-3 py-1 rounded-full text-xs text-brand-cream flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-brand-gold" />
              <span>Native to {plant.origin}</span>
            </div>
          </div>

          {/* Column B: Highly-refined botanical story specs & adoption */}
          <div className="p-8 md:p-10 flex flex-col justify-between" id="modal-content-col">
            <div className="space-y-6">
              
              {/* Heading classification */}
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-brand-gold">
                  {plant.category} Species Showcase
                </span>
                <h3 className="font-serif text-2xl md:text-3xl font-semibold text-brand-cream mt-0.5 leading-tight">
                  {plant.name}
                </h3>
                <p className="text-xs font-mono text-[#8ba89b] italic mt-1.5">
                  {plant.scientificName} — {plant.family} Family
                </p>
              </div>

              {/* Backstory narrative */}
              <div>
                <h4 className="text-xs font-mono uppercase text-brand-cream/40 tracking-wider mb-1.5">Botanical Narrative</h4>
                <p className="text-xs font-light text-brand-cream/80 leading-relaxed">
                  {plant.fullStory}
                </p>
              </div>

              {/* Visual Grid specifications */}
              <div className="grid grid-cols-2 gap-4 border-t border-b border-hunter-800/30 py-5" id="modal-care-spec-grid">
                
                <div className="flex items-center space-x-2.5 text-xs text-brand-cream/80">
                  <Sun className="w-4 h-4 text-brand-gold" />
                  <div>
                    <span className="text-[9px] font-mono uppercase text-brand-cream/40 block">EXPOSURE</span>
                    <span className="font-sans font-medium">{plant.light}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 text-xs text-brand-cream/80">
                  <Droplet className="w-4 h-4 text-sky-400" />
                  <div>
                    <span className="text-[9px] font-mono uppercase text-brand-cream/40 block">INTERVALS</span>
                    <span className="font-sans font-medium">Every {plant.wateringFrequencyDays} days</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 text-xs text-brand-cream/80">
                  <Thermometer className="w-4 h-4 text-amber-500" />
                  <div>
                    <span className="text-[9px] font-mono uppercase text-brand-cream/40 block">IDEAL TEMP</span>
                    <span className="font-sans font-medium">{plant.idealTemp}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 text-xs text-brand-cream/80">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <div>
                    <span className="text-[9px] font-mono uppercase text-brand-cream/40 block">PET TOXICITY</span>
                    <span className={`font-sans font-medium ${plant.toxicity === 'Pet-friendly' ? 'text-teal-400' : 'text-[#8ba89b]'}`}>
                      {plant.toxicity}
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* Adoption block */}
            <div className="mt-8 border-t border-hunter-800/20 pt-6" id="modal-adopter-module">
              {success ? (
                <div className="text-center p-4 bg-teal-900/10 border border-teal-500/20 rounded-xl" id="modal-adoption-success">
                  <p className="text-teal-400 font-medium text-xs font-sans flex items-center justify-center">
                    <Sparkles className="w-4 h-4 mr-2 text-brand-gold animate-spin" /> Successfully adopted! Added to greenhouse collection.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleAdopt} className="space-y-3" id="modal-adoption-form">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-brand-cream/55">
                      Sanctuary Adoption Suite
                    </label>
                    <span className="text-xs font-mono font-bold text-brand-gold">
                      ESTIMATED: {plant.price}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 bg-hunter-950/40 p-4 rounded-2xl border border-hunter-850/60 shadow-inner">
                    <div className="flex-1 space-y-1">
                      <span className="text-[9px] font-mono font-bold tracking-widest text-[#8ba89b] uppercase">Specimen Identifier</span>
                      <input 
                        type="text"
                        required
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder={`Nickname (e.g., Greenie)`}
                        className="w-full px-3.5 py-2.5 bg-hunter-950 border border-hunter-800 focus:border-brand-gold outline-none text-xs rounded-xl text-brand-cream tracking-wide transition-colors"
                        id="modal-nickname-input"
                      />
                    </div>
                    <div className="flex-none">
                      <BotanicalKeyButton
                        id="modal-submit-adopt-btn"
                        icon={Sparkles}
                        type="submit"
                        ledColor="#f59e0b"
                        symbolColor="#fcd34d"
                        label="ADOPT"
                        title="Adopt this Companion"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-brand-cream/40 leading-tight">
                    Adopting records moisture status dynamically in the virtual Greenhouse Dashboard. Keep your leaves hydrated!
                  </p>
                </form>
              )}
            </div>

          </div>

        </div>

      </motion.div>

    </motion.div>
  );
}
