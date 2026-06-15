import { Plant, SymptomGuide } from './types';

export const PLANTS_DATA: Plant[] = [
  {
    id: 'licuala-grandis',
    name: 'Licuala Grandis Fan Palm',
    scientificName: 'Licuala grandis',
    family: 'Arecaceae',
    origin: 'Vanuatu & Solomon Islands',
    description: 'An extraordinary and rare fan palm featuring glossy, pleated circular emerald-green leaves. It commands immediate focus with its sculptural silhouette.',
    fullStory: 'Deep within the hum of the South Pacific rain forests, the Licuala Grandis grows slowly beneath the heavy jungle canopy. Characterized by spectacular entire fan-shaped leaves, it is a statement of architectural luxury. This plant thrives in high humidity and bright, warm environments, capturing the essence of exotic rain-kissed islands right inside contemporary indoor spaces.',
    light: 'Bright Indirect',
    water: 'Moderate (consistent)',
    difficulty: 'Intermediate',
    size: '30" - 48" height',
    toxicity: 'Pet-friendly',
    wateringFrequencyDays: 7,
    image: '/src/assets/images/plant_hero_1781543958364.jpg',
    category: 'Palm',
    price: '$120.00',
    idealTemp: '65°F - 85°F (18°C - 29°C)'
  },
  {
    id: 'calathea-duo',
    name: 'Vibrant Calathea & Peace Lily Duo',
    scientificName: 'Calathea ornata & Spathiphyllum',
    family: 'Marantaceae / Araceae',
    origin: 'South American Rainforests',
    description: 'A striking arrangement pairing the beautiful patterned pinstripes of Calathea with the dark, glossy, elegant crown of Spathiphyllum.',
    fullStory: 'Combining the rhythmic light-sensitive leaf movements of Calathea ("the prayer plant") with the outstanding air-purifying foliage of the Peace Lily. This arrangement provides a dual texture of rich patterns and broad architectural leaves. They thrive in dappled light and moisture-rich layers simulating the forest floor.',
    light: 'Moderate Indirect',
    water: 'High (keep moist)',
    difficulty: 'Intermediate',
    size: '18" - 24" height',
    toxicity: 'Mildly toxic',
    wateringFrequencyDays: 5,
    image: '/src/assets/images/plant_duo_1781543972763.jpg',
    category: 'Foliage',
    price: '$85.00',
    idealTemp: '60°F - 80°F (16°C - 27°C)'
  },
  {
    id: 'chamaedorea-terracotta',
    name: 'Chamaedorea Elegans Rustic',
    scientificName: 'Chamaedorea elegans',
    family: 'Arecaceae',
    origin: 'Central America & Mexico',
    description: 'An elegant miniature palm in a gorgeous custom terracotta and glazed ceramic designer vase. Extremely hardy and refined.',
    fullStory: 'Dating back to Victorian parlor collections, the Parlor Palm is celebrated for adapting to low lighting and varying humidity. Our rustic edition combines this timeless resilience with a contemporary split-texture ceramic pot, celebrating earth and glazing in equal measure.',
    light: 'Low Indirect',
    water: 'Low (allow soil to dry)',
    difficulty: 'Beginner',
    size: '12" - 16" height',
    toxicity: 'Pet-friendly',
    wateringFrequencyDays: 10,
    image: '/src/assets/images/plant_grid_1_1781543986749.jpg',
    category: 'Palm',
    price: '$65.00',
    idealTemp: '65°F - 80°F (18°C - 27°C)'
  },
  {
    id: 'dracaena-corn',
    name: 'Dracaena Compacta & Succulent Garden',
    scientificName: 'Dracaena fragrans & Sedum',
    family: 'Asparagaceae',
    origin: 'Tropical Africa',
    description: 'A slender, architectural corn plant nested with a tiny premium stone succulent. Excellent for clean vertical lines and table styling.',
    fullStory: 'Dracaena compacta features tightly clustered, deep pine-green leaves on dense wooden stalks. This variety is slower growing and highly structural, complemented by a low-profile round succulent in a matching forest tray that adds an exquisite desktop garden footprint.',
    light: 'Moderate Indirect',
    water: 'Low (allow soil to dry)',
    difficulty: 'Beginner',
    size: '14" - 20" height',
    toxicity: 'Toxic to pets',
    wateringFrequencyDays: 12,
    image: '/src/assets/images/plant_grid_2_1781544000514.jpg',
    category: 'Dracaena',
    price: '$72.00',
    idealTemp: '60°F - 75°F (15°C - 24°C)'
  },
  {
    id: 'parlor-palm-sand',
    name: 'Neanthe Parlor Palm in Sandstone',
    scientificName: 'Chamaedorea elegans (Sandstone)',
    family: 'Arecaceae',
    origin: 'Guatemalan Rainforest Highlands',
    description: 'Lush, feathered fronds that cascade gently. Presented in a premium sandstone-finish ceramic bowl with a matching tray.',
    fullStory: 'This premium specimen features denser, more feathery leaflets that thrive with slightly more humidity and constant room temperatures. Elevated by a custom-carved sandstone dish, it mimics high altitude soil environments, allowing roots to breathe freely.',
    light: 'Moderate Indirect',
    water: 'Moderate (consistent)',
    difficulty: 'Beginner',
    size: '16" - 22" height',
    toxicity: 'Pet-friendly',
    wateringFrequencyDays: 8,
    image: '/src/assets/images/plant_grid_3_1781544016582.jpg',
    category: 'Palm',
    price: '$92.00',
    idealTemp: '65°F - 80°F (18°C - 27°C)'
  }
];

export const SYMPTOMS_GUIDE: SymptomGuide[] = [
  {
    symptom: 'Crispy brown leaf tips or outer margins',
    cause: 'Inadequate moisture or mineral buildup from tap water.',
    solution: 'Increase ambient humidity (mist or use pebble tray) and switch to filtered, distilled, or rainwater for your regular watering.'
  },
  {
    symptom: 'Leaves yellowing with limp stems, moist soil',
    cause: 'Overwatering or root rot due to poor soil drainage.',
    solution: 'Cease watering immediately. Ensure drainage holes in ceramic pots are clear, allow root ball to dry out completely, and check for soft roots.'
  },
  {
    symptom: 'Drooping, curling leaves with dry sandy soil',
    cause: 'Underwatering or excessive direct heat exposure.',
    solution: 'Submerge the potted base in 2 inches of lukewarm water for 15 minutes to let the clay / potting soil re-saturate evenly.'
  },
  {
    symptom: 'Fading foliage color, pale leaves, very slow growth',
    cause: 'Insufficient light or exhausted soil nutrition.',
    solution: 'Gently reposition the plant closer to an east or north-facing window, or implement organic seaweed fertilizer during spring growth.'
  },
  {
    symptom: 'Webbing underneath stems or small white cotton spots',
    cause: 'Spider mites or mealybug infestation (common in humid rooms).',
    solution: 'Wipe all leaves wash with a gentle insecticidal neem oil spray and isolate from other greenhouse items to avoid spread.'
  }
];
