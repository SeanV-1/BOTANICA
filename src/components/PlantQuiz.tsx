import React, { useState } from 'react';
import { PLANTS_DATA } from '../data';
import { Plant } from '../types';
import { Sun, Droplet, ShieldCheck, RefreshCw, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PlantQuizProps {
  onAdopt: (plant: Plant, nickname: string) => void;
  onViewPlant: (plant: Plant) => void;
}

export default function PlantQuiz({ onAdopt, onViewPlant }: PlantQuizProps) {
  const [step, setStep] = useState<number>(0);
  const [lightSelection, setLightSelection] = useState<string>('');
  const [waterSelection, setWaterSelection] = useState<string>('');
  const [petSelection, setPetSelection] = useState<string>('');
  const [resultPlant, setResultPlant] = useState<Plant | null>(null);
  const [adoptedNickname, setAdoptedNickname] = useState<string>('');
  const [didAdopt, setDidAdopt] = useState<boolean>(false);

  // Questions definitions
  const questions = [
    {
      id: 'light',
      title: 'How does natural light move through your desired space?',
      subtitle: 'Lighting is the food of the plant kingdom. Assess your light levels accurately.',
      icon: Sun,
      color: 'text-brand-gold',
      options: [
        { value: 'low', label: 'Dusky Shadows & Low Indirect Light', desc: 'No windows nearby, or facing a narrow alley. Gentle ambient light only.' },
        { value: 'medium', label: 'Dappled Glow & Moderate Indirect Light', desc: 'Slightly set back from an east-facing window. Soft daylight.' },
        { value: 'bright', label: 'Luminous Glow & Bright Indirect Light', desc: 'Sits near large west/south facing windows. Energetic, shadow-casting light.' }
      ]
    },
    {
      id: 'water',
      title: 'How would you describe your personal watering personality?',
      subtitle: 'Be honest about your routine to ensure we do not overwater or desiccate roots.',
      icon: Droplet,
      color: 'text-sky-400',
      options: [
        { value: 'devoted', label: 'The Doting Nurturer (Daily Checks & Misting)', desc: 'You find immense calm in examining leaves and checking soil moisture often.' },
        { value: 'steady', label: 'The Balanced Companion (Once-a-Week Checkins)', desc: 'You love keeping a crisp calendar rhythm. Consistent and reliable.' },
        { value: 'wanderer', label: 'The Busy Explorer (Frequent Wanderer / Forgetful)', desc: 'You travel for work or go long stretches without remembering to water.' }
      ]
    },
    {
      id: 'pets',
      title: 'Do you share your sanctuary with cats, dogs, or toddlers?',
      subtitle: 'Some plants produce protective crystals or juices that can cause discomfort if ingested.',
      icon: ShieldCheck,
      color: 'text-brand-terracotta',
      options: [
        { value: 'yes', label: 'Yes, pet-friendly species are a priority', desc: 'Furry companions are curious chewing guests. Safety is non-negotiable.' },
        { value: 'no', label: 'No pets, or they completely overlook plants', desc: 'I am free to house complex exotic foliage without toxic constraints.' }
      ]
    }
  ];

  const handleOptionSelect = (val: string) => {
    if (step === 0) {
      setLightSelection(val);
      setStep(1);
    } else if (step === 1) {
      setWaterSelection(val);
      setStep(2);
    } else if (step === 2) {
      setPetSelection(val);
      calculateRecommendation(lightSelection, waterSelection, val);
    }
  };

  const calculateRecommendation = (light: string, water: string, pets: string) => {
    let topPlant = PLANTS_DATA[0];
    let topScore = -999;

    PLANTS_DATA.forEach((plant) => {
      let score = 0;

      // 1. Light Score logic
      if (light === 'low') {
        if (plant.light === 'Low Indirect') score += 10;
        else if (plant.light === 'Moderate Indirect') score += 4;
        else score -= 5;
      } else if (light === 'medium') {
        if (plant.light === 'Moderate Indirect') score += 10;
        else if (plant.light === 'Low Indirect') score += 6;
        else if (plant.light === 'Bright Indirect') score += 6;
      } else if (light === 'bright') {
        if (plant.light === 'Bright Indirect') score += 10;
        else if (plant.light === 'Moderate Indirect') score += 6;
        else score -= 4;
      }

      // 2. Watering Frequency Score logic
      if (water === 'devoted') {
        if (plant.wateringFrequencyDays <= 6) score += 10;
        else if (plant.wateringFrequencyDays <= 8) score += 5;
        else score -= 2;
      } else if (water === 'steady') {
        if (plant.wateringFrequencyDays >= 7 && plant.wateringFrequencyDays <= 9) score += 10;
        else score += 4;
      } else if (water === 'wanderer') {
        if (plant.wateringFrequencyDays >= 10) score += 10;
        else if (plant.wateringFrequencyDays >= 8) score += 3;
        else score -= 6;
      }

      // 3. Pet Safety (Ultimate hard filter)
      if (pets === 'yes') {
        if (plant.toxicity === 'Pet-friendly') {
          score += 20;
        } else {
          score -= 50; // Heavily penalize toxic ones for pet houses
        }
      } else {
        score += 5; // standard bonus for non-pet houses
      }

      if (score > topScore) {
        topScore = score;
        topPlant = plant;
      }
    });

    setResultPlant(topPlant);
    // Suggest the default plant name as initial nickname
    setAdoptedNickname(`My Green ${topPlant.name.split(' ')[0]}`);
    setStep(3);
  };

  const handleReset = () => {
    setStep(0);
    setLightSelection('');
    setWaterSelection('');
    setPetSelection('');
    setResultPlant(null);
    setAdoptedNickname('');
    setDidAdopt(false);
  };

  const executeAdoption = () => {
    if (resultPlant) {
      onAdopt(resultPlant, adoptedNickname || resultPlant.name);
      setDidAdopt(true);
    }
  };

  const currentQ = questions[step];

  return (
    <div className="py-12 px-6 max-w-4xl mx-auto" id="quiz-workspace">
      
      {/* Quiz Progress Header */}
      {step < 3 && (
        <div className="text-center mb-10" id="quiz-header-layout">
          <div className="text-xs font-mono uppercase tracking-widest text-brand-gold mb-2">
            Sanctuary Compatibility Quiz — Step {step + 1} of 3
          </div>
          <div className="w-48 h-1 bg-hunter-900 mx-auto rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-brand-gold" 
              initial={{ width: "33%" }}
              animate={{ width: `${((step + 1) / 3) * 100}%` }}
              transition={{ type: "spring", stiffness: 85, damping: 14 }}
              id="quiz-progress-bar"
            ></motion.div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step < 3 ? (
          <motion.div 
            key={step}
            initial={{ opacity: 0, x: 45, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -45, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
            className="bg-hunter-900/40 border border-hunter-800/50 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
            id={`quiz-step-card-${step}`}
          >
            {/* Subtle Background Glow */}
            <div className="absolute -top-48 -right-48 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex justify-center mb-6">
              <motion.div 
                className="p-4 bg-hunter-950/80 rounded-2xl border border-hunter-850"
                whileHover={{ scale: 1.1, rotate: 6 }}
              >
                <currentQ.icon className={`w-8 h-8 ${currentQ.color}`} />
              </motion.div>
            </div>

            <h3 className="font-serif text-2xl md:text-3xl font-medium text-center text-brand-cream tracking-tight max-w-2xl mx-auto mb-3">
              {currentQ.title}
            </h3>
            <p className="text-sm font-light text-center text-brand-cream/60 max-w-lg mx-auto mb-10">
              {currentQ.subtitle}
            </p>

            <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto" id="quiz-options-grid">
              {currentQ.options.map((opt, i) => (
                <motion.button
                  key={opt.value}
                  onClick={() => handleOptionSelect(opt.value)}
                  className="group relative text-left p-6 rounded-2xl bg-hunter-950/60 hover:bg-hunter-900 border border-hunter-800/40 hover:border-brand-gold/60 text-brand-cream cursor-pointer transition-all duration-300 block w-full"
                  id={`quiz-option-${i}`}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.1 } }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 rounded-full border border-brand-cream/20 flex items-center justify-center text-xs font-mono group-hover:border-brand-gold group-hover:text-brand-gold text-brand-cream/40 transition-colors">
                      {String.fromCharCode(65 + i)}
                    </div>
                    <div>
                      <h4 className="font-sans font-medium text-base text-brand-cream group-hover:text-brand-gold transition-colors">
                        {opt.label}
                      </h4>
                      <p className="text-xs font-light text-brand-cream/50 mt-1">
                        {opt.desc}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          /* Step 3: Recommendation screen */
          resultPlant && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 95, damping: 15 }}
              className="bg-hunter-900/30 border border-hunter-800/40 rounded-3xl overflow-hidden shadow-2xl relative"
              id="quiz-result-card"
            >
              {/* Ambient Background Gradient matching image mood */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-brand-gold/5 via-transparent to-transparent pointer-events-none"></div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                
                {/* Left Column: Photorealistic studio portrait of the matched plant */}
                <div className="md:col-span-5 relative min-h-[300px] md:min-h-[500px]" id="result-image-container">
                  <motion.img 
                    src={resultPlant.image} 
                    alt={resultPlant.name}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-hunter-950 via-hunter-950/10 to-transparent md:bg-gradient-to-r md:from-transparent md:to-hunter-900/30"></div>
                  
                  {/* Score Tag */}
                  <motion.div 
                    className="absolute top-4 left-4 bg-brand-gold text-hunter-950 px-3 py-1 rounded-full font-mono font-bold text-[10px] tracking-widest uppercase"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: 0.4 } }}
                  >
                    98% SANCTUARY MATCH
                  </motion.div>
                </div>

                {/* Right Column: Matched plant stories and caregiver configuration */}
                <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-between" id="result-details">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-brand-gold">
                      Your Botanical Companion
                    </span>
                    <h2 className="font-serif text-3xl md:text-4xl font-semibold text-brand-cream mt-1 mb-2 leading-tight">
                      {resultPlant.name}
                    </h2>
                    <p className="font-mono text-xs italic text-[#8ba89b] mb-6">
                      {resultPlant.scientificName} — Family {resultPlant.family}
                    </p>

                    <p className="text-sm font-light text-brand-cream/80 leading-relaxed mb-6">
                      {resultPlant.fullStory}
                    </p>

                    {/* Matching Specifications Stats */}
                    <div className="grid grid-cols-2 gap-4 border-t border-b border-hunter-800/40 py-5 mb-8" id="result-stats">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-hunter-950/80 border border-hunter-800 flex items-center justify-center">
                          <Sun className="w-4 h-4 text-brand-gold" />
                        </div>
                        <div>
                          <div className="text-[10px] font-mono text-brand-cream/40 uppercase">EXPOSURE</div>
                          <div className="text-xs font-sans text-brand-cream">{resultPlant.light}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-hunter-950/80 border border-hunter-800 flex items-center justify-center">
                          <Droplet className="w-4 h-4 text-sky-400" />
                        </div>
                        <div>
                          <div className="text-[10px] font-mono text-brand-cream/40 uppercase">INTERVAL</div>
                          <div className="text-xs font-sans text-brand-cream">Every {resultPlant.wateringFrequencyDays} Days</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-hunter-950/80 border border-hunter-800 flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4 text-teal-400" />
                        </div>
                        <div>
                          <div className="text-[10px] font-mono text-brand-cream/40 uppercase">PET SAFETY</div>
                          <div className="text-xs font-sans text-[#8ba89b]">{resultPlant.toxicity}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-hunter-950/80 border border-hunter-800 flex items-center justify-center">
                          <Check className="w-4 h-4 text-brand-terracotta" />
                        </div>
                        <div>
                          <div className="text-[10px] font-mono text-brand-cream/40 uppercase">DIFFICULTY</div>
                          <div className="text-xs font-sans text-brand-cream">{resultPlant.difficulty}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nickname and Adoption Area */}
                  <div className="bg-hunter-950/60 p-5 rounded-2xl border border-hunter-800/40" id="result-action-panel">
                    {didAdopt ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-2" 
                        id="adoption-success-message"
                      >
                        <p className="text-sm font-medium text-brand-gold flex items-center justify-center">
                          <Check className="w-5 h-5 mr-1.5 stroke-[3]" /> Added to Your Greenhouse Sanctuary!
                        </p>
                        <p className="text-xs text-brand-cream/50 mt-1">
                          Go to the Greenhouse tab to track moisture levels and schedule maintenance.
                        </p>
                      </motion.div>
                    ) : (
                      <div className="space-y-4" id="adoption-form-container">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-widest text-brand-cream/50 mb-1.5">
                            Give This Companion a Nickname
                          </label>
                          <input 
                            type="text" 
                            value={adoptedNickname}
                            onChange={(e) => setAdoptedNickname(e.target.value)}
                            placeholder="e.g. Cleo, The General, Little Green"
                            className="w-full px-4 py-2.5 bg-hunter-950 border border-hunter-800 focus:border-brand-gold outline-none text-sm rounded-xl text-brand-cream tracking-wide transition-colors"
                            id="adopted-nickname-input"
                          />
                        </div>

                        <div className="flex space-x-3">
                          <motion.button
                            onClick={executeAdoption}
                            className="flex-1 bg-brand-gold text-hunter-950 font-mono tracking-widest uppercase text-xs font-bold py-3 px-6 rounded-xl hover:bg-hunter-600 active:scale-[0.98] transition-all flex items-center justify-center space-x-1.5"
                            id="adopt-matching-companion-button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Plus className="w-4 h-4" />
                            <span>ADD TO GREENHOUSE</span>
                          </motion.button>

                          <motion.button
                            onClick={() => onViewPlant(resultPlant)}
                            className="px-4 py-3 bg-hunter-900 border border-hunter-800 text-brand-cream text-xs uppercase font-mono tracking-wider rounded-xl hover:bg-hunter-850 active:scale-[0.98] transition-all"
                            id="learn-more-result-button"
                            whileHover={{ scale: 1.03 }}
                          >
                            Details
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Back / Repeat Button */}
                  <button
                    onClick={handleReset}
                    className="mt-6 text-center text-xs text-brand-cream/40 hover:text-brand-cream font-mono uppercase tracking-widest flex items-center justify-center space-x-1.5 group mx-auto"
                    id="reset-quiz-button"
                  >
                    <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                    <span>Take Quiz Once More</span>
                  </button>
                </div>

              </div>
            </motion.div>
          )
        )}
       </AnimatePresence>
    </div>
  );
}
