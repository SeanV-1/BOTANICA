export interface Plant {
  id: string;
  name: string;
  scientificName: string;
  family: string;
  origin: string;
  description: string;
  fullStory: string;
  light: 'Low Indirect' | 'Moderate Indirect' | 'Bright Indirect' | 'Direct Sun';
  water: 'Low (allow soil to dry)' | 'Moderate (consistent)' | 'High (keep moist)';
  difficulty: 'Beginner' | 'Intermediate' | 'Connoisseur';
  size: string;
  toxicity: 'Pet-friendly' | 'Toxic to pets' | 'Mildly toxic';
  wateringFrequencyDays: number;
  image: string;
  category: 'Palm' | 'Foliage' | 'Dracaena' | 'Rare';
  price: string;
  idealTemp: string;
}

export interface GreenhouseItem {
  id: string;
  plantId: string;
  nickname: string;
  dateAdded: string;
  lastWatered: string; // ISO String
  notes: string;
  alertsEnabled?: boolean;
}

export interface SymptomGuide {
  symptom: string;
  cause: string;
  solution: string;
}
