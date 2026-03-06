import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

/* ===================================================================
   SIMULATION DATA - 6 compounding simulations for Ghanaian pharmacy
   =================================================================== */

const simulations = [
  {
    id: 1,
    name: 'Simple Syrup Preparation',
    difficulty: 'Beginner',
    description:
      'Prepare Simple Syrup (Syrupus Simplex BP), a foundational vehicle and sweetening agent used in oral liquid formulations across Ghanaian pharmacies.',
    estimatedTime: '25 mins',
    equipment: [
      'Glass beaker (1L)',
      'Graduated cylinder (500mL)',
      'Glass stirring rod',
      'Bunsen burner or hot plate',
      'Thermometer',
      'Tared balance',
      'Muslin cloth or filter',
      'Amber glass bottle (500mL)',
    ],
    ingredients: [
      { name: 'Sucrose (granulated sugar)', amount: 667, unit: 'g' },
      { name: 'Purified Water BP', amount: 500, unit: 'mL' },
    ],
    steps: [
      {
        instruction:
          'Wash hands thoroughly and put on a clean lab coat. Ensure the compounding area is clean and sanitized.',
        duration: '2 mins',
      },
      {
        instruction:
          'Measure 500 mL of Purified Water BP using a graduated cylinder. Pour into the glass beaker.',
        criticalPoint: 'Read the meniscus at eye level for accurate measurement.',
        duration: '2 mins',
      },
      {
        instruction:
          'Heat the water on the hot plate to approximately 50-60 degrees Celsius. Monitor with the thermometer.',
        criticalPoint:
          'Do not boil the water. Excessive heat causes caramelization and inversion of sucrose.',
        duration: '5 mins',
      },
      {
        instruction:
          'Weigh 667 g of sucrose on the tared balance. Add the sucrose gradually to the warm water while stirring continuously.',
        duration: '5 mins',
      },
      {
        instruction:
          'Continue stirring until all the sucrose is completely dissolved. The solution should be clear with no undissolved crystals.',
        duration: '5 mins',
      },
      {
        instruction:
          'Remove from heat and allow the syrup to cool to room temperature.',
        criticalPoint:
          'Do not add preservatives while the solution is still hot as they may decompose.',
        duration: '3 mins',
      },
      {
        instruction:
          'Filter the syrup through muslin cloth into the amber glass bottle to remove any particulate matter.',
        duration: '2 mins',
      },
      {
        instruction:
          'Label the bottle with: product name, concentration (66.7% w/v), date of preparation, expiry date (4 weeks), and storage instructions (Store below 25 degrees Celsius).',
        duration: '1 min',
      },
    ],
    safetyNotes: [
      'Wear protective lab coat and gloves at all times.',
      'Handle hot liquids with care to avoid burns.',
      'Ensure adequate ventilation when using the hot plate.',
      'Do not taste or ingest any preparation during compounding.',
    ],
    qualityChecks: [
      'Syrup is clear and free from particulate matter',
      'Specific gravity is approximately 1.313',
      'No crystallization observed on cooling',
      'Volume matches expected yield (approximately 1000 mL)',
      'Label is complete and legible',
    ],
  },
  {
    id: 2,
    name: 'Calamine Lotion',
    difficulty: 'Beginner',
    description:
      'Compound Calamine Lotion BP, a widely used topical suspension in Ghana for treating skin irritation, mild sunburn, and insect bites.',
    estimatedTime: '20 mins',
    equipment: [
      'Mortar and pestle',
      'Graduated cylinder (100mL)',
      'Glass measure (500mL)',
      'Glass stirring rod',
      'Tared balance',
      'Amber bottle (200mL)',
    ],
    ingredients: [
      { name: 'Calamine BP', amount: 15, unit: 'g' },
      { name: 'Zinc Oxide BP', amount: 5, unit: 'g' },
      { name: 'Glycerol BP', amount: 5, unit: 'mL' },
      { name: 'Bentonite', amount: 3, unit: 'g' },
      { name: 'Sodium Citrate', amount: 0.5, unit: 'g' },
      { name: 'Purified Water BP', amount: 'to 100', unit: 'mL' },
    ],
    steps: [
      {
        instruction:
          'Wash hands and prepare the compounding area. Assemble all equipment and ingredients.',
        duration: '2 mins',
      },
      {
        instruction:
          'Weigh 15 g calamine and 5 g zinc oxide accurately on the tared balance.',
        criticalPoint:
          'Ensure the balance is calibrated and tared correctly before each weighing.',
        duration: '2 mins',
      },
      {
        instruction:
          'Triturate the calamine and zinc oxide together in the mortar to a fine, uniform powder.',
        duration: '3 mins',
      },
      {
        instruction:
          'Add 5 mL glycerol to the powder and mix to form a smooth paste using the pestle.',
        criticalPoint:
          'Add glycerol gradually to avoid lumps. The paste must be completely smooth.',
        duration: '3 mins',
      },
      {
        instruction:
          'In a separate container, dissolve 0.5 g sodium citrate in a small quantity of purified water, then add 3 g bentonite. Allow to hydrate for 5 minutes.',
        duration: '5 mins',
      },
      {
        instruction:
          'Gradually add the bentonite solution to the calamine paste, mixing thoroughly after each addition.',
        duration: '2 mins',
      },
      {
        instruction:
          'Make up the final volume to 100 mL with purified water. Mix well to ensure a uniform suspension.',
        duration: '2 mins',
      },
      {
        instruction:
          'Transfer to the amber bottle. Label with: Calamine Lotion BP, date, expiry (2 weeks), "Shake Well Before Use", "For External Use Only".',
        duration: '1 min',
      },
    ],
    safetyNotes: [
      'Calamine and zinc oxide are fine powders; avoid inhaling dust.',
      'Wear a face mask when handling dry powders.',
      'This preparation is for external use only.',
      'Keep away from eyes and mucous membranes.',
    ],
    qualityChecks: [
      'Lotion is uniformly pink in colour',
      'No lumps or gritty particles visible',
      'Lotion re-disperses easily on shaking',
      'pH is within acceptable range (7-8)',
      'Label includes "Shake Well Before Use"',
    ],
  },
  {
    id: 3,
    name: 'Hydrocortisone Cream 1%',
    difficulty: 'Intermediate',
    description:
      'Prepare Hydrocortisone Cream BP 1% w/w, a topical corticosteroid for inflammatory skin conditions. This involves emulsion-based compounding techniques.',
    estimatedTime: '35 mins',
    equipment: [
      'Porcelain mortar and pestle',
      'Water bath',
      'Glass beakers (2x 250mL)',
      'Thermometer',
      'Tared balance (analytical)',
      'Glass stirring rod',
      'Spatula',
      'Ointment jar (50g)',
      'Ointment slab (tile)',
    ],
    ingredients: [
      { name: 'Hydrocortisone powder BP', amount: 1, unit: 'g' },
      { name: 'Cetostearyl Alcohol', amount: 7.2, unit: 'g' },
      { name: 'White Soft Paraffin', amount: 15, unit: 'g' },
      { name: 'Liquid Paraffin', amount: 6, unit: 'g' },
      { name: 'Cetomacrogol 1000', amount: 2.3, unit: 'g' },
      { name: 'Chlorocresol', amount: 0.1, unit: 'g' },
      { name: 'Purified Water BP', amount: 'to 100', unit: 'g' },
    ],
    steps: [
      {
        instruction:
          'Prepare the compounding area. Ensure all equipment is clean and dry. Calibrate the analytical balance.',
        duration: '3 mins',
      },
      {
        instruction:
          'Oil phase: Weigh cetostearyl alcohol (7.2 g), white soft paraffin (15 g), liquid paraffin (6 g), and cetomacrogol 1000 (2.3 g). Combine in a beaker.',
        criticalPoint:
          'Use analytical balance for hydrocortisone. Accuracy is critical for potent active ingredients.',
        duration: '5 mins',
      },
      {
        instruction:
          'Heat the oil phase on the water bath to approximately 60 degrees Celsius until all components have melted and mixed uniformly.',
        duration: '5 mins',
      },
      {
        instruction:
          'Aqueous phase: Dissolve 0.1 g chlorocresol in the purified water. Heat to 60 degrees Celsius in a separate beaker.',
        criticalPoint:
          'Both phases must be at the same temperature (60 degrees Celsius) before mixing to form a stable emulsion.',
        duration: '4 mins',
      },
      {
        instruction:
          'Add the aqueous phase to the oil phase gradually while stirring continuously and vigorously to form the emulsion base.',
        criticalPoint:
          'Continuous stirring is essential. Stop adding if the emulsion shows signs of cracking.',
        duration: '5 mins',
      },
      {
        instruction:
          'Continue stirring as the cream cools. Do not stop stirring until the temperature drops below 40 degrees Celsius.',
        duration: '5 mins',
      },
      {
        instruction:
          'Levigate 1 g hydrocortisone with a small amount of the cream base on the ointment slab to form a smooth concentrate.',
        criticalPoint:
          'Ensure hydrocortisone is finely dispersed with no visible particles. Poor levigation leads to non-uniform potency.',
        duration: '4 mins',
      },
      {
        instruction:
          'Incorporate the hydrocortisone concentrate into the bulk cream using geometric dilution. Mix thoroughly.',
        duration: '3 mins',
      },
      {
        instruction:
          'Pack into the ointment jar. Label: Hydrocortisone Cream 1% w/w, date, expiry (28 days), "For External Use Only", "Keep out of reach of children".',
        duration: '1 min',
      },
    ],
    safetyNotes: [
      'Hydrocortisone is a potent corticosteroid; wear gloves to avoid skin absorption.',
      'Use analytical balance for weighing the active ingredient.',
      'Handle hot water bath carefully to avoid burns.',
      'Do not use on broken skin or infected areas without medical advice.',
      'Chlorocresol may cause sensitization in some patients.',
    ],
    qualityChecks: [
      'Cream is smooth and homogeneous with no grittiness',
      'Cream is white to off-white in colour',
      'No phase separation observed',
      'Cream spreads easily and is non-greasy',
      'Active ingredient uniformly distributed (check multiple samples)',
      'pH is between 3.5 and 6.5',
    ],
  },
  {
    id: 4,
    name: 'Pediatric Paracetamol Suspension',
    difficulty: 'Intermediate',
    description:
      'Compound Paracetamol Oral Suspension 120mg/5mL for pediatric use, one of the most commonly dispensed preparations in Ghanaian community pharmacies for childhood fever and pain.',
    estimatedTime: '30 mins',
    equipment: [
      'Mortar and pestle',
      'Graduated cylinder (100mL)',
      'Glass beaker (500mL)',
      'Glass stirring rod',
      'Tared balance',
      'Amber glass bottle (100mL)',
      'Syringe or measuring cup',
      'pH meter or pH strips',
    ],
    ingredients: [
      { name: 'Paracetamol BP powder', amount: 2.4, unit: 'g' },
      { name: 'Tragacanth powder (suspending agent)', amount: 0.2, unit: 'g' },
      {
        name: 'Compound Hydroxybenzoate Solution (preservative)',
        amount: 1,
        unit: 'mL',
      },
      { name: 'Sucrose', amount: 30, unit: 'g' },
      { name: 'Strawberry flavouring', amount: 0.5, unit: 'mL' },
      { name: 'Purified Water BP', amount: 'to 100', unit: 'mL' },
    ],
    steps: [
      {
        instruction:
          'Verify the prescription: Paracetamol 120mg/5mL, 100mL. Calculate total paracetamol needed: 2.4 g for 100 mL.',
        criticalPoint:
          'Double-check the dose calculation. Pediatric dosing errors can be life-threatening.',
        duration: '3 mins',
      },
      {
        instruction:
          'Weigh 2.4 g paracetamol and 0.2 g tragacanth powder on the tared balance.',
        duration: '2 mins',
      },
      {
        instruction:
          'Triturate paracetamol and tragacanth together in the mortar to obtain a fine, uniform powder.',
        duration: '3 mins',
      },
      {
        instruction:
          'Add a small quantity of purified water (approximately 10 mL) to the powder to form a smooth paste. Triturate thoroughly.',
        criticalPoint:
          'The paste must be completely smooth with no lumps. Paracetamol is poorly soluble; it must be evenly suspended.',
        duration: '3 mins',
      },
      {
        instruction:
          'Dissolve 30 g sucrose in approximately 40 mL warm purified water in the glass beaker.',
        duration: '3 mins',
      },
      {
        instruction:
          'Gradually add the sucrose solution to the paracetamol paste, mixing well after each addition.',
        duration: '3 mins',
      },
      {
        instruction:
          'Add 1 mL compound hydroxybenzoate solution and 0.5 mL strawberry flavouring. Mix.',
        duration: '2 mins',
      },
      {
        instruction:
          'Make up to 100 mL with purified water. Stir well. Check pH (target 5.0-6.5).',
        duration: '2 mins',
      },
      {
        instruction:
          'Transfer to amber glass bottle. Label: Paracetamol Suspension 120mg/5mL, date, expiry (14 days), "Shake Well Before Use", "Keep Refrigerated", patient details, dose instructions.',
        criticalPoint:
          'Include a measuring syringe or cup with the dispensed product. Advise caregiver on correct dosing.',
        duration: '2 mins',
      },
    ],
    safetyNotes: [
      'Paracetamol overdose causes severe hepatotoxicity. Double-check all calculations.',
      'Ensure correct concentration: 120 mg per 5 mL for pediatric use.',
      "Advise parents on maximum daily dose for the child's age and weight.",
      'Store in refrigerator and discard after 14 days.',
      'Always include a calibrated oral syringe for accurate dosing.',
    ],
    qualityChecks: [
      'Suspension re-disperses uniformly on shaking',
      'No large particles or settling observed',
      'pH is between 5.0 and 6.5',
      'Colour and taste are acceptable',
      'Volume is accurate (100 mL)',
      'Concentration verified: 120 mg/5 mL',
    ],
  },
  {
    id: 5,
    name: 'Capsule Filling - Omeprazole 20mg',
    difficulty: 'Advanced',
    description:
      'Extemporaneously fill hard gelatin capsules with Omeprazole 20mg, a proton pump inhibitor for gastric ulcers. Requires precision weighing and understanding of powder flow properties.',
    estimatedTime: '40 mins',
    equipment: [
      'Analytical balance (0.001g sensitivity)',
      'Size 2 hard gelatin capsules (20 units)',
      'Mortar and pestle',
      'Capsule filling tray',
      'Powder scoop',
      'Spatula',
      'Weighing boats',
      'Desiccator',
    ],
    ingredients: [
      { name: 'Omeprazole BP powder', amount: 400, unit: 'mg' },
      { name: 'Lactose monohydrate (diluent)', amount: 3.6, unit: 'g' },
      { name: 'Maize starch (glidant)', amount: 0.2, unit: 'g' },
    ],
    steps: [
      {
        instruction:
          'Calculate fill weight per capsule: 20 mg omeprazole + diluent to fill Size 2 capsule (approximately 200 mg total fill weight). Prepare for 20 capsules with 10% excess.',
        criticalPoint:
          'Accuracy of active ingredient weighing is critical. Use an analytical balance with at least 0.001 g sensitivity.',
        duration: '3 mins',
      },
      {
        instruction:
          'Weigh 400 mg (0.400 g) omeprazole powder on the analytical balance using a clean weighing boat.',
        criticalPoint:
          'Omeprazole is acid-labile. Work quickly and avoid exposure to moisture. Handle with gloves.',
        duration: '3 mins',
      },
      {
        instruction:
          'Weigh 3.6 g lactose monohydrate and 0.2 g maize starch.',
        duration: '2 mins',
      },
      {
        instruction:
          'Using geometric dilution, combine the omeprazole with the lactose and maize starch in the mortar. Start by adding an equal weight of lactose to the omeprazole, mix for 2 minutes, then double the quantity of diluent each time.',
        criticalPoint:
          'Geometric dilution ensures uniform distribution of the active ingredient. Poor mixing leads to dose variation between capsules.',
        duration: '8 mins',
      },
      {
        instruction:
          'Determine the average fill weight of a Size 2 capsule by weighing 5 empty capsules, then calculate the weight of powder needed per capsule.',
        duration: '3 mins',
      },
      {
        instruction:
          'Set up the capsule filling tray. Separate capsule bodies and caps. Place bodies in the tray.',
        duration: '3 mins',
      },
      {
        instruction:
          'Fill each capsule body with the powder blend, tapping gently to settle. Use the spatula to level. Weigh every 5th capsule to check weight uniformity.',
        criticalPoint:
          'Weight variation should not exceed plus or minus 10% of average fill weight. Reject and refill capsules outside this range.',
        duration: '10 mins',
      },
      {
        instruction:
          'Replace capsule caps and ensure they lock securely. Polish capsules with a clean, dry cloth.',
        duration: '3 mins',
      },
      {
        instruction:
          'Package in a light-resistant container with desiccant. Label: Omeprazole Capsules 20 mg, quantity, date, expiry (7 days), "Store in a cool, dry place", "Swallow whole - do not crush or chew".',
        criticalPoint:
          'Include desiccant in packaging. Omeprazole degrades rapidly with moisture.',
        duration: '2 mins',
      },
    ],
    safetyNotes: [
      'Omeprazole is acid-labile and moisture-sensitive. Minimize exposure to air.',
      'Wear gloves and avoid inhaling powder dust.',
      'Use analytical balance calibrated on the day of compounding.',
      'Discard any capsules that show discolouration or are damaged.',
      'Document batch number, quantities used, and weight checks for audit trail.',
    ],
    qualityChecks: [
      'Weight variation within plus or minus 10% of target fill weight',
      'Capsules are properly sealed and intact',
      'No powder leakage from capsules',
      'Uniform appearance - no discolouration',
      'All 20 capsules accounted for and documented',
      'Batch record completed and signed',
    ],
  },
  {
    id: 6,
    name: 'Sterile Eye Drops - Chloramphenicol 0.5%',
    difficulty: 'Advanced',
    description:
      'Prepare sterile Chloramphenicol Eye Drops 0.5% w/v under aseptic conditions. A critical preparation commonly needed in Ghanaian hospitals requiring strict aseptic technique.',
    estimatedTime: '45 mins',
    equipment: [
      'Laminar airflow cabinet',
      'Autoclave',
      'Sterile glass beakers',
      'Sterile graduated cylinder',
      'Sterile glass stirring rod',
      'Membrane filter (0.22 micron)',
      'Sterile dropper bottles (10mL)',
      'pH meter',
      'Analytical balance',
      'Sterile gloves and gown',
    ],
    ingredients: [
      { name: 'Chloramphenicol BP', amount: 50, unit: 'mg' },
      { name: 'Boric Acid (tonicity agent)', amount: 190, unit: 'mg' },
      { name: 'Borax (buffer)', amount: 30, unit: 'mg' },
      {
        name: 'Phenylmercuric Acetate (preservative)',
        amount: 0.2,
        unit: 'mg',
      },
      { name: 'Water for Injection BP', amount: 'to 10', unit: 'mL' },
    ],
    steps: [
      {
        instruction:
          'Gown up in sterile attire: scrub hands, don sterile gown, mask, and sterile gloves. Enter the clean room and switch on the laminar airflow cabinet at least 30 minutes before starting.',
        criticalPoint:
          'Aseptic technique is paramount. Any breach of sterility requires restarting the entire preparation.',
        duration: '5 mins',
      },
      {
        instruction:
          'Sterilize all glassware and equipment by autoclaving at 121 degrees Celsius for 15 minutes (or verify pre-sterilized status).',
        duration: '3 mins',
      },
      {
        instruction:
          'Working inside the laminar airflow cabinet, weigh 50 mg chloramphenicol on the analytical balance.',
        criticalPoint:
          'Chloramphenicol is a potent antibiotic. Handle with care and avoid inhalation or skin contact.',
        duration: '3 mins',
      },
      {
        instruction:
          'Dissolve chloramphenicol in approximately 5 mL of Water for Injection by gentle warming (do not exceed 40 degrees Celsius).',
        criticalPoint:
          'Do not overheat. Chloramphenicol degrades at high temperatures.',
        duration: '5 mins',
      },
      {
        instruction:
          'Weigh and dissolve 190 mg boric acid and 30 mg borax in the chloramphenicol solution. Stir until completely dissolved.',
        duration: '3 mins',
      },
      {
        instruction:
          'Add 0.2 mg phenylmercuric acetate from a pre-prepared stock solution. Mix gently.',
        duration: '2 mins',
      },
      {
        instruction:
          'Make up to 10 mL with Water for Injection. Check pH (target 7.0 - 7.4). Adjust with boric acid or borax if necessary.',
        criticalPoint:
          'Eye drops must be within physiological pH range (7.0-7.4) to avoid irritation and pain on instillation.',
        duration: '3 mins',
      },
      {
        instruction:
          'Filter the solution through a 0.22 micron sterile membrane filter into the sterile dropper bottle. This is the sterilization step.',
        criticalPoint:
          'Perform bubble point test on the filter before and after use to confirm membrane integrity.',
        duration: '5 mins',
      },
      {
        instruction:
          'Seal the dropper bottle. Perform visual inspection against black and white backgrounds for particulate matter.',
        duration: '3 mins',
      },
      {
        instruction:
          'Label: Chloramphenicol Eye Drops 0.5% w/v, date, expiry (7 days after opening), "Sterile", "For Ophthalmic Use Only", "Store 2-8 degrees Celsius", "Discard 28 days after preparation".',
        criticalPoint:
          'Sterile preparations must include strict expiry dates. Advise patient on storage and discard dates.',
        duration: '3 mins',
      },
    ],
    safetyNotes: [
      'Maintain aseptic technique throughout. Work within the laminar airflow cabinet at all times.',
      'Chloramphenicol may cause aplastic anaemia with systemic absorption. Minimize exposure.',
      'Phenylmercuric acetate is toxic; use stock solution to avoid weighing minute quantities.',
      'Eye preparations must be sterile, isotonic, and at physiological pH.',
      'Document all environmental monitoring and sterility assurance steps.',
      'Any contamination suspicion mandates disposal and re-preparation.',
    ],
    qualityChecks: [
      'Solution is clear and free from particulate matter',
      'pH is between 7.0 and 7.4',
      'Solution is isotonic (no stinging on application)',
      'Sterility confirmed via membrane filter integrity test',
      'Dropper delivers correct drop size',
      'Label includes all mandatory information for sterile products',
      'Environmental monitoring log completed',
    ],
  },
];

/* ===================================================================
   DIFFICULTY BADGE STYLES
   =================================================================== */

const diffBadgeDark = {
  Beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const diffBadgeLight = {
  Beginner: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  Intermediate: 'bg-amber-100 text-amber-700 border-amber-300',
  Advanced: 'bg-red-100 text-red-700 border-red-300',
};

/* ===================================================================
   INLINE SVG ICONS
   =================================================================== */

const IconFlask = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3v6.015a2.25 2.25 0 01-.659 1.591L5.47 14.227a4.5 4.5 0 003.18 7.68h6.7a4.5 4.5 0 003.18-7.68l-3.621-3.621a2.25 2.25 0 01-.659-1.591V3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3h7.5" />
  </svg>
);

const IconClock = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={1.5} fill="none" />
  </svg>
);

const IconCheck = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const IconLock = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 018 0v4" />
  </svg>
);

const IconWarning = ({ className = 'w-5 h-5 text-amber-500' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </svg>
);

const IconArrowLeft = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const IconChevronDown = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const IconBeaker = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6v4.5a1.5 1.5 0 01-.44 1.06l-2.12 2.12a1.5 1.5 0 00-.44 1.06V21H6V11.74a1.5 1.5 0 00-.44-1.06L3.44 8.56A1.5 1.5 0 013 7.5V5a2 2 0 012-2h4z" />
  </svg>
);

const IconSteps = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h4.5" />
    <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth={1.5} fill="none" />
  </svg>
);

const IconTrophy = () => (
  <svg className="w-16 h-16 mx-auto text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8m-4-4v4m-5-8a7 7 0 0110 0M5 7V5a2 2 0 012-2h10a2 2 0 012 2v2m0 0h2a2 2 0 012 2v1a4 4 0 01-4 4h-1m-10-7H4a2 2 0 00-2 2v1a4 4 0 004 4h1" />
  </svg>
);

const IconShield = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l7 4v5c0 5.25-3.5 9.74-7 11-3.5-1.26-7-5.75-7-11V6l7-4z" />
  </svg>
);

/* ===================================================================
   MAIN COMPONENT
   =================================================================== */

export default function CompoundingLab() {
  const [activeSim, setActiveSim] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [checkedEquipment, setCheckedEquipment] = useState({});
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [checkedQuality, setCheckedQuality] = useState({});
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [safetyAcknowledged, setSafetyAcknowledged] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  /* ---- Timer ---- */
  useEffect(() => {
    let interval;
    if (timerRunning && !completed) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, completed]);

  const formatTime = useCallback((seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  }, []);

  /* ---- Start / Exit Simulation ---- */
  const startSim = (sim) => {
    setActiveSim(sim);
    setCurrentStep(0);
    setCheckedEquipment({});
    setCheckedIngredients({});
    setCheckedQuality({});
    setSafetyOpen(false);
    setSafetyAcknowledged(false);
    setTimer(0);
    setTimerRunning(true);
    setCompleted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const exitSim = () => {
    setActiveSim(null);
    setTimerRunning(false);
    setCompleted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ---- Step advancement ---- */
  const completeStep = () => {
    if (!activeSim) return;
    if (currentStep < activeSim.steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setTimerRunning(false);
      setCompleted(true);
    }
  };

  /* ---- Toggle helpers ---- */
  const toggleEquipment = (i) =>
    setCheckedEquipment((p) => ({ ...p, [i]: !p[i] }));
  const toggleIngredient = (i) =>
    setCheckedIngredients((p) => ({ ...p, [i]: !p[i] }));
  const toggleQuality = (i) =>
    setCheckedQuality((p) => ({ ...p, [i]: !p[i] }));

  /* ---- Score ---- */
  const calcScore = () => {
    if (!activeSim) return 0;
    const eqLen = activeSim.equipment.length;
    const eqDone = Object.values(checkedEquipment).filter(Boolean).length;
    const ingLen = activeSim.ingredients.length;
    const ingDone = Object.values(checkedIngredients).filter(Boolean).length;
    const qcLen = activeSim.qualityChecks.length;
    const qcDone = Object.values(checkedQuality).filter(Boolean).length;

    const stepsScore = 40; // all steps completed
    const eqScore = eqLen > 0 ? (eqDone / eqLen) * 20 : 20;
    const ingScore = ingLen > 0 ? (ingDone / ingLen) * 20 : 20;
    const qcScore = qcLen > 0 ? (qcDone / qcLen) * 15 : 15;
    const safetyScore = safetyAcknowledged ? 5 : 0;

    return Math.round(stepsScore + eqScore + ingScore + qcScore + safetyScore);
  };

  /* ================================================================
     RENDER: COMPLETION VIEW
     ================================================================ */
  if (completed && activeSim) {
    const score = calcScore();
    const circumference = 2 * Math.PI * 56; // r=56

    return (
      <div className="min-h-screen bg-warm-50 dark:bg-gray-950 transition-colors">
        <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
          <div className="dark-glass bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 sm:p-10 text-center space-y-8">
            {/* Trophy */}
            <IconTrophy />

            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold gold-text">
                Simulation Complete!
              </h2>
              <p className="font-body text-gray-600 dark:text-gray-400 mt-1">
                {activeSim.name}
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-left">
              {[
                { label: 'Time Taken', value: formatTime(timer) },
                {
                  label: 'Steps Completed',
                  value: `${activeSim.steps.length}/${activeSim.steps.length}`,
                },
                {
                  label: 'Safety Notes',
                  value: safetyAcknowledged ? 'Reviewed' : 'Not Reviewed',
                },
                {
                  label: 'Quality Checks',
                  value: `${Object.values(checkedQuality).filter(Boolean).length}/${activeSim.qualityChecks.length}`,
                },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="gold-glass bg-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-xl p-3 sm:p-4"
                >
                  <p className="font-body text-xs text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="font-display text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Score ring */}
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="currentColor"
                    className="text-gray-200 dark:text-white/10"
                    strokeWidth="10"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="#C9A84C"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${(score / 100) * circumference} ${circumference}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-display text-3xl font-bold text-gray-900 dark:text-white">
                  {score}
                </span>
              </div>
              <p className="font-body text-sm text-gray-500 dark:text-gray-400">
                Score out of 100
              </p>
            </div>

            {/* Quality control checklist */}
            <div className="text-left space-y-3">
              <h3 className="font-display text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <IconShield />
                Quality Control Checklist
              </h3>
              <div className="space-y-2">
                {activeSim.qualityChecks.map((qc, idx) => (
                  <label
                    key={idx}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedQuality[idx]}
                      onChange={() => toggleQuality(idx)}
                      className="mt-0.5 accent-[#C9A84C] w-4 h-4"
                    />
                    <span
                      className={`font-body text-sm transition-colors ${
                        checkedQuality[idx]
                          ? 'text-emerald-600 dark:text-emerald-400 line-through'
                          : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
                      }`}
                    >
                      {qc}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={exitSim}
                className="px-6 py-3 rounded-xl font-display font-semibold text-sm bg-gradient-to-r from-[#C9A84C] to-[#E8D48B] text-gray-900 hover:from-[#A8893A] hover:to-[#C9A84C] transition-all shadow-lg shadow-[#C9A84C]/20 hover:shadow-[#C9A84C]/40"
              >
                Try Another Simulation
              </button>
              <button
                onClick={() => startSim(activeSim)}
                className="px-6 py-3 rounded-xl font-display font-semibold text-sm border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
              >
                Repeat This Simulation
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================================================================
     RENDER: ACTIVE SIMULATION VIEW
     ================================================================ */
  if (activeSim) {
    const progressPercent =
      ((currentStep + 1) / activeSim.steps.length) * 100;

    return (
      <div className="min-h-screen bg-warm-50 dark:bg-gray-950 transition-colors">
        {/* Sticky top bar */}
        <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={exitSim}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 transition shrink-0"
                aria-label="Exit simulation"
              >
                <IconArrowLeft />
              </button>
              <div className="min-w-0">
                <h1 className="font-display text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight truncate">
                  {activeSim.name}
                </h1>
                <span
                  className={`inline-block text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full border ${diffBadgeLight[activeSim.difficulty]} dark:${diffBadgeDark[activeSim.difficulty]}`}
                >
                  {activeSim.difficulty}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 font-body text-sm shrink-0">
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <IconClock />
                <span className="font-mono tabular-nums text-xs sm:text-sm">
                  {formatTime(timer)}
                </span>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] font-semibold text-[10px] sm:text-xs whitespace-nowrap">
                Step {currentStep + 1} / {activeSim.steps.length}
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-gray-200 dark:bg-white/5">
            <div
              className="h-full bg-gradient-to-r from-[#C9A84C] to-[#E8D48B] transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Main layout */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ---- Left sidebar ---- */}
            <aside className="lg:col-span-3 space-y-4">
              {/* Equipment panel */}
              <div className="dark-glass bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4">
                <h3 className="font-display text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <IconBeaker />
                  Equipment
                  <span className="ml-auto text-[10px] font-body text-gray-400 dark:text-gray-500">
                    {Object.values(checkedEquipment).filter(Boolean).length}/
                    {activeSim.equipment.length}
                  </span>
                </h3>
                <div className="space-y-2">
                  {activeSim.equipment.map((eq, idx) => (
                    <label
                      key={idx}
                      className="flex items-start gap-2.5 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={!!checkedEquipment[idx]}
                        onChange={() => toggleEquipment(idx)}
                        className="mt-0.5 accent-[#C9A84C] w-3.5 h-3.5"
                      />
                      <span
                        className={`font-body text-xs leading-relaxed transition-all ${
                          checkedEquipment[idx]
                            ? 'line-through text-gray-400 dark:text-gray-600'
                            : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
                        }`}
                      >
                        {eq}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Ingredients panel */}
              <div className="dark-glass bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4">
                <h3 className="font-display text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <IconFlask />
                  Ingredients
                  <span className="ml-auto text-[10px] font-body text-gray-400 dark:text-gray-500">
                    {Object.values(checkedIngredients).filter(Boolean).length}/
                    {activeSim.ingredients.length}
                  </span>
                </h3>
                <div className="space-y-2">
                  {activeSim.ingredients.map((ing, idx) => (
                    <label
                      key={idx}
                      className="flex items-start gap-2.5 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={!!checkedIngredients[idx]}
                        onChange={() => toggleIngredient(idx)}
                        className="mt-0.5 accent-[#C9A84C] w-3.5 h-3.5"
                      />
                      <span
                        className={`font-body text-xs leading-relaxed transition-all ${
                          checkedIngredients[idx]
                            ? 'line-through text-gray-400 dark:text-gray-600'
                            : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
                        }`}
                      >
                        {ing.name}{' '}
                        <span className="font-semibold text-[#A8893A] dark:text-[#E8D48B]">
                          {ing.amount} {ing.unit}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Safety notes panel */}
              <div className="dark-glass bg-amber-50 dark:bg-amber-900/10 border border-amber-300 dark:border-amber-500/20 rounded-xl overflow-hidden">
                <button
                  onClick={() => {
                    setSafetyOpen(!safetyOpen);
                    if (!safetyAcknowledged) setSafetyAcknowledged(true);
                  }}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="font-display text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                    <IconWarning />
                    Safety Notes
                    {safetyAcknowledged && (
                      <span className="text-[10px] font-body text-emerald-600 dark:text-emerald-400">
                        (Reviewed)
                      </span>
                    )}
                  </span>
                  <IconChevronDown
                    className={`w-4 h-4 text-amber-500 transition-transform duration-200 ${safetyOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {safetyOpen && (
                  <div className="px-4 pb-4 space-y-2.5">
                    {activeSim.safetyNotes.map((note, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 font-body text-xs text-amber-800 dark:text-amber-300 leading-relaxed"
                      >
                        <span className="mt-1.5 block w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            {/* ---- Main content: Steps ---- */}
            <main className="lg:col-span-9 space-y-3">
              <h2 className="font-display text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <IconSteps />
                Procedure
              </h2>

              {activeSim.steps.map((step, idx) => {
                const isCurrent = idx === currentStep;
                const isDone = idx < currentStep;
                const isLocked = idx > currentStep;

                return (
                  <div
                    key={idx}
                    className={`rounded-xl border transition-all duration-300 ${
                      isCurrent
                        ? 'dark-glass bg-white dark:bg-white/5 border-[#C9A84C]/50 shadow-lg shadow-[#C9A84C]/10 ring-1 ring-[#C9A84C]/20'
                        : isDone
                          ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-300 dark:border-emerald-500/20'
                          : 'bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 opacity-50'
                    } p-4`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Step indicator circle */}
                      <div
                        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isDone
                            ? 'bg-emerald-500 text-white'
                            : isCurrent
                              ? 'bg-gradient-to-br from-[#C9A84C] to-[#E8D48B] text-gray-900'
                              : 'bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-gray-600'
                        }`}
                      >
                        {isDone ? (
                          <IconCheck />
                        ) : isLocked ? (
                          <IconLock />
                        ) : (
                          idx + 1
                        )}
                      </div>

                      {/* Step content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-display text-[10px] sm:text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                            Step {idx + 1}
                          </span>
                          {step.duration && (
                            <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                              <IconClock className="w-3 h-3" />
                              {step.duration}
                            </span>
                          )}
                        </div>

                        <p
                          className={`font-body text-sm leading-relaxed ${
                            isLocked
                              ? 'text-gray-400 dark:text-gray-600'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {step.instruction}
                        </p>

                        {/* Critical point warning box */}
                        {step.criticalPoint && isCurrent && (
                          <div className="mt-3 flex items-start gap-2.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/20 rounded-lg p-3">
                            <IconWarning className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="font-body text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                              <span className="font-semibold">
                                Critical Point:
                              </span>{' '}
                              {step.criticalPoint}
                            </p>
                          </div>
                        )}

                        {/* Completed critical point (dimmed) */}
                        {step.criticalPoint && isDone && (
                          <div className="mt-2 flex items-start gap-2 opacity-50">
                            <IconCheck className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                            <p className="font-body text-[10px] text-gray-500 dark:text-gray-500 leading-relaxed">
                              Critical point addressed
                            </p>
                          </div>
                        )}

                        {/* Complete Step button */}
                        {isCurrent && (
                          <button
                            onClick={completeStep}
                            className="mt-4 px-5 py-2.5 rounded-xl font-display font-semibold text-sm bg-gradient-to-r from-[#C9A84C] to-[#E8D48B] text-gray-900 hover:from-[#A8893A] hover:to-[#C9A84C] transition-all shadow-lg shadow-[#C9A84C]/20 hover:shadow-[#C9A84C]/40 active:scale-[0.98]"
                          >
                            {idx === activeSim.steps.length - 1
                              ? 'Complete Simulation'
                              : 'Complete Step'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </main>
          </div>
        </div>
      </div>
    );
  }

  /* ================================================================
     RENDER: SIMULATION SELECTION (default view)
     ================================================================ */
  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-950 transition-colors">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-body text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link
            to="/learn"
            className="hover:text-[#C9A84C] transition flex items-center gap-1"
          >
            <IconArrowLeft />
            <span>Learning Hub</span>
          </Link>
          <span className="select-none">/</span>
          <span className="text-gray-900 dark:text-white font-medium">
            Compounding Lab
          </span>
        </nav>

        {/* Title block */}
        <div className="flex items-start gap-4 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#C9A84C] to-[#E8D48B] text-gray-900 shadow-lg shadow-[#C9A84C]/20 shrink-0">
            <IconFlask className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold gold-text leading-tight">
              Virtual Compounding Lab
            </h1>
            <p className="font-body text-gray-600 dark:text-gray-400 mt-1 max-w-2xl text-sm sm:text-base">
              Practice pharmaceutical compounding procedures step-by-step.
              Master essential techniques used in Ghanaian pharmacy practice
              with interactive, guided simulations.
            </p>
          </div>
        </div>
      </div>

      {/* Simulation Selection Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {simulations.map((sim) => (
            <div
              key={sim.id}
              className="dark-glass bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 hover:border-[#C9A84C]/40 hover:shadow-xl hover:shadow-[#C9A84C]/5 transition-all duration-300 flex flex-col group"
            >
              {/* Top row: badge + time */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full border ${diffBadgeLight[sim.difficulty]} dark:${diffBadgeDark[sim.difficulty]}`}
                >
                  {sim.difficulty}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-body">
                  <IconClock className="w-3.5 h-3.5" />
                  {sim.estimatedTime}
                </div>
              </div>

              {/* Title */}
              <h3 className="font-display text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#C9A84C] transition-colors">
                {sim.name}
              </h3>

              {/* Description */}
              <p className="font-body text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 flex-1">
                {sim.description}
              </p>

              {/* Meta row */}
              <div className="flex items-center gap-4 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-body mb-4">
                <span className="flex items-center gap-1">
                  <IconFlask className="w-3.5 h-3.5" />
                  {sim.ingredients.length} ingredients
                </span>
                <span className="flex items-center gap-1">
                  <IconSteps />
                  {sim.steps.length} steps
                </span>
              </div>

              {/* Start button */}
              <button
                onClick={() => startSim(sim)}
                className="w-full py-2.5 sm:py-3 rounded-xl font-display font-semibold text-sm bg-gradient-to-r from-[#C9A84C] to-[#E8D48B] text-gray-900 hover:from-[#A8893A] hover:to-[#C9A84C] transition-all shadow-lg shadow-[#C9A84C]/20 hover:shadow-[#C9A84C]/40 active:scale-[0.98]"
              >
                Start Simulation
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
