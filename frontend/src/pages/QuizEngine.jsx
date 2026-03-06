import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";

/* ──────────────────────────── question bank ──────────────────────────── */
const QUESTION_BANK = {
  pharmacology: [
    { q: "Which enzyme does Aspirin irreversibly inhibit?", opts: ["Lipoxygenase", "Cyclooxygenase (COX)", "Phospholipase A2", "Thromboxane synthase"], correct: 1, explanation: "Aspirin irreversibly acetylates cyclooxygenase (COX-1 and COX-2), blocking prostaglandin and thromboxane synthesis.", difficulty: "easy" },
    { q: "Metformin's primary mechanism of action in Type 2 Diabetes is:", opts: ["Stimulating insulin secretion", "Decreasing hepatic glucose production", "Blocking alpha-glucosidase", "Enhancing GLP-1 activity"], correct: 1, explanation: "Metformin primarily reduces hepatic glucose output via AMP-activated protein kinase (AMPK) activation and also improves peripheral insulin sensitivity.", difficulty: "medium" },
    { q: "Which antihypertensive is MOST appropriate as first-line for a Ghanaian patient with diabetes and proteinuria?", opts: ["Amlodipine", "Lisinopril", "Atenolol", "Hydrochlorothiazide"], correct: 1, explanation: "ACE inhibitors (e.g., Lisinopril) are first-line for diabetic nephropathy because they reduce intra-glomerular pressure and proteinuria. This aligns with Ghana STG recommendations.", difficulty: "medium" },
    { q: "The antidote for Warfarin overdose is:", opts: ["Protamine sulphate", "Vitamin K (Phytomenadione)", "Naloxone", "Flumazenil"], correct: 1, explanation: "Vitamin K reverses warfarin's inhibition of vitamin K-dependent clotting factors (II, VII, IX, X). For acute bleeding, fresh frozen plasma or prothrombin complex concentrate is also used.", difficulty: "easy" },
    { q: "Which of the following drugs causes SLE-like syndrome as an adverse effect?", opts: ["Isoniazid", "Hydralazine", "Rifampicin", "Ethambutol"], correct: 1, explanation: "Hydralazine is classically associated with drug-induced lupus erythematosus, especially in slow acetylators. Isoniazid and procainamide can also cause it but hydralazine is the most classic association.", difficulty: "hard" },
    { q: "Artemether-Lumefantrine (Coartem) is the first-line treatment for uncomplicated malaria in Ghana. Lumefantrine's role is:", opts: ["Rapid parasite clearance", "Preventing recrudescence by eliminating residual parasites", "Gametocidal activity", "Hepatic schizonticide"], correct: 1, explanation: "Lumefantrine is a long-acting partner drug that eliminates residual parasites after artemether's rapid action, preventing recrudescence. This combination is recommended by Ghana's NMCP.", difficulty: "medium" },
    { q: "Which beta-blocker has intrinsic sympathomimetic activity (ISA)?", opts: ["Propranolol", "Atenolol", "Pindolol", "Metoprolol"], correct: 2, explanation: "Pindolol has ISA, meaning it partially activates beta-receptors while blocking the effect of catecholamines. This results in less resting bradycardia compared to other beta-blockers.", difficulty: "hard" },
    { q: "The mechanism of action of Omeprazole is:", opts: ["H2 receptor blockade", "Irreversible inhibition of H+/K+ ATPase", "Neutralization of gastric acid", "Prostaglandin analogue"], correct: 1, explanation: "Omeprazole is a proton pump inhibitor (PPI) that irreversibly inhibits the H+/K+ ATPase enzyme system (proton pump) in gastric parietal cells.", difficulty: "easy" },
    { q: "Which aminoglycoside has the LOWEST nephrotoxicity risk?", opts: ["Gentamicin", "Amikacin", "Streptomycin", "Tobramycin"], correct: 2, explanation: "Streptomycin has the lowest nephrotoxicity among aminoglycosides because it has less renal cortical accumulation. However, it has higher vestibular toxicity.", difficulty: "hard" },
    { q: "In the Ghana Essential Medicines List, which analgesic ladder step does Tramadol belong to?", opts: ["Step 1 - Non-opioid", "Step 2 - Weak opioid", "Step 3 - Strong opioid", "Not on the EML"], correct: 1, explanation: "Tramadol is classified as a Step 2 (weak opioid) analgesic on the WHO pain ladder and is included in Ghana's Essential Medicines List for moderate pain management.", difficulty: "medium" },
    { q: "Chloroquine resistance in P. falciparum is mediated by mutations in:", opts: ["pfmdr1 gene only", "pfcrt gene (PfCRT transporter)", "DHFR gene", "Kelch13 gene"], correct: 1, explanation: "Mutations in the pfcrt gene (Plasmodium falciparum chloroquine resistance transporter) are the primary determinant of chloroquine resistance, allowing the parasite to efflux chloroquine from the food vacuole.", difficulty: "hard" },
    { q: "Which drug requires dose adjustment in patients with G6PD deficiency, common in West Africa?", opts: ["Amoxicillin", "Primaquine", "Metronidazole", "Ciprofloxacin"], correct: 1, explanation: "Primaquine causes severe haemolytic anaemia in G6PD-deficient patients. G6PD testing is recommended before prescribing primaquine, especially in malaria-endemic regions like Ghana where G6PD deficiency prevalence is ~15-20%.", difficulty: "medium" },
  ],
  pharmaceutical_chemistry: [
    { q: "The beta-lactam ring is a structural feature of:", opts: ["Aminoglycosides", "Penicillins and Cephalosporins", "Macrolides", "Tetracyclines"], correct: 1, explanation: "The four-membered beta-lactam ring is the core pharmacophore of penicillins, cephalosporins, carbapenems, and monobactams. It is essential for antibacterial activity.", difficulty: "easy" },
    { q: "Which functional group is responsible for the acid-lability of Erythromycin?", opts: ["Hydroxyl group", "Keto group at C-9", "Cladinose sugar", "Lactone ring"], correct: 1, explanation: "The C-9 keto group participates in intramolecular cyclisation in acidic conditions, forming inactive anhydro and spiroketal derivatives, making erythromycin base acid-labile.", difficulty: "hard" },
    { q: "Prodrug activation of Enalapril involves:", opts: ["Oxidation in the liver", "Hydrolysis of the ethyl ester to Enalaprilat", "Reduction by gut bacteria", "Glucuronidation"], correct: 1, explanation: "Enalapril is an ethyl ester prodrug that is hydrolysed by hepatic esterases to the active diacid form, Enalaprilat, which inhibits ACE.", difficulty: "medium" },
    { q: "The Biopharmaceutics Classification System (BCS) Class II drugs have:", opts: ["High solubility, high permeability", "Low solubility, high permeability", "High solubility, low permeability", "Low solubility, low permeability"], correct: 1, explanation: "BCS Class II drugs (e.g., ibuprofen, ketoconazole) have low aqueous solubility but high membrane permeability. Dissolution is the rate-limiting step for absorption.", difficulty: "easy" },
    { q: "SAR studies of Quinolones show that the atom at position 8 affects:", opts: ["Spectrum of activity only", "Phototoxicity and anaerobic activity", "Renal clearance", "Protein binding"], correct: 1, explanation: "A halogen (especially fluorine or chlorine) at position 8 of quinolones enhances anaerobic activity but increases phototoxicity risk, as seen with lomefloxacin and sparfloxacin.", difficulty: "hard" },
    { q: "Which type of isomerism is exhibited by Adrenaline (Epinephrine)?", opts: ["Geometric isomerism", "Optical isomerism (chirality)", "Structural isomerism", "Tautomerism"], correct: 1, explanation: "Adrenaline has a chiral carbon and exists as R and S enantiomers. The R-(-)-enantiomer is the naturally occurring, pharmacologically active form.", difficulty: "medium" },
    { q: "The Henderson-Hasselbalch equation predicts that a weak acid drug (pKa 4.4) in stomach pH 1.4 will be:", opts: ["99.9% ionised", "50% ionised", "99.9% unionised", "Completely degraded"], correct: 2, explanation: "For weak acids: pH = pKa + log([A-]/[HA]). At pH 1.4 (3 units below pKa 4.4), the ratio of ionised to unionised is 1:1000, so ~99.9% is unionised and well-absorbed from the stomach.", difficulty: "medium" },
    { q: "Clavulanic acid inhibits beta-lactamase by:", opts: ["Competitive reversible binding", "Irreversible (suicide) inhibition", "Allosteric modulation", "Chelating zinc at the active site"], correct: 1, explanation: "Clavulanic acid is a suicide (mechanism-based) inhibitor. It binds to beta-lactamase, undergoes ring opening, and forms a stable acyl-enzyme intermediate that permanently inactivates the enzyme.", difficulty: "medium" },
    { q: "The pharmacophore model of H1-antihistamines requires:", opts: ["A basic nitrogen, two aromatic rings, and a 2-3 carbon linker", "A carboxylic acid group and a long alkyl chain", "A steroid nucleus", "A thiazole ring system"], correct: 0, explanation: "Classical H1-antihistamines share a pharmacophore: a basic (tertiary) amine nitrogen connected via a 2-3 carbon chain or ether/amine linker to two aromatic or heteroaromatic rings (e.g., diphenhydramine, chlorpheniramine).", difficulty: "hard" },
    { q: "Paracetamol (Acetaminophen) hepatotoxicity is caused by:", opts: ["The parent drug directly", "NAPQI (N-acetyl-p-benzoquinone imine) metabolite", "Glucuronide conjugate", "Sulphate conjugate"], correct: 1, explanation: "At therapeutic doses, paracetamol is mostly conjugated. In overdose, CYP2E1 generates the toxic metabolite NAPQI, which depletes glutathione and causes hepatocellular necrosis. N-acetylcysteine is the antidote as a glutathione precursor.", difficulty: "easy" },
  ],
  pharmacognosy: [
    { q: "Cryptolepis sanguinolenta, widely used in Ghanaian herbal medicine, contains the alkaloid:", opts: ["Quinine", "Cryptolepine", "Berberine", "Artemisinin"], correct: 1, explanation: "Cryptolepine is the major indoloquinoline alkaloid from Cryptolepis sanguinolenta (Nibima), traditionally used in Ghana for malaria and has demonstrated antimalarial, antibacterial, and anti-inflammatory activities.", difficulty: "medium" },
    { q: "Which class of secondary metabolites gives Turmeric (Curcuma longa) its yellow colour?", opts: ["Alkaloids", "Flavonoids", "Curcuminoids (diarylheptanoids)", "Anthraquinones"], correct: 2, explanation: "Curcuminoids, particularly curcumin (diferuloylmethane), are polyphenolic diarylheptanoid pigments responsible for turmeric's characteristic yellow colour and its anti-inflammatory properties.", difficulty: "easy" },
    { q: "The Dragendorff's reagent is used to detect:", opts: ["Tannins", "Alkaloids", "Saponins", "Glycosides"], correct: 1, explanation: "Dragendorff's reagent (potassium bismuth iodide) gives an orange-red precipitate with alkaloids. It is a general alkaloid detection reagent used in pharmacognostic screening.", difficulty: "easy" },
    { q: "Digitalis glycosides (Digoxin) are obtained from:", opts: ["Digitalis purpurea (Foxglove)", "Rauwolfia serpentina", "Cinchona bark", "Catharanthus roseus"], correct: 0, explanation: "Digitalis purpurea (purple foxglove) is the classical source of cardiac glycosides. Digoxin is primarily obtained from D. lanata. These glycosides inhibit Na+/K+ ATPase in cardiac cells.", difficulty: "easy" },
    { q: "Neem (Azadirachta indica), used extensively in Ghana, contains the active compound:", opts: ["Azadirachtin", "Capsaicin", "Thymol", "Eugenol"], correct: 0, explanation: "Azadirachtin is a tetranortriterpenoid (limonoid) from neem with potent insecticidal, antifeedant, and antimalarial properties. Neem is widely used in Ghanaian traditional medicine for skin conditions and malaria.", difficulty: "medium" },
    { q: "Which chromatographic technique is used by the Ghana FDA for herbal medicine quality control and fingerprinting?", opts: ["Paper chromatography only", "HPLC and TLC fingerprinting", "Gas chromatography only", "Gel filtration"], correct: 1, explanation: "The Ghana FDA's Centre for Plant Medicine Research uses HPLC and TLC fingerprinting as standard methods for quality control, standardisation, and authentication of herbal medicinal products.", difficulty: "medium" },
    { q: "Moringa oleifera leaves are rich in:", opts: ["Cardiac glycosides", "Vitamins A, C, minerals, and isothiocyanates", "Tropane alkaloids", "Anthraquinones"], correct: 1, explanation: "Moringa oleifera (drumstick tree) leaves are nutritionally dense, containing high levels of vitamins A, C, iron, calcium, and bioactive isothiocyanates with antioxidant and anti-inflammatory properties.", difficulty: "easy" },
    { q: "The WHO Traditional Medicine Strategy 2014-2023 recommends that member states like Ghana should:", opts: ["Ban all traditional medicine", "Integrate traditional medicine into national health systems with regulation", "Replace all conventional drugs with herbals", "Only use traditional medicine for mental health"], correct: 1, explanation: "The WHO strategy encourages integration of quality-assured traditional and complementary medicine into health service delivery, with appropriate regulation. Ghana has implemented this through the Traditional Medicine Practice Council.", difficulty: "medium" },
    { q: "Voacanga africana, found in Ghanaian forests, yields alkaloids related to:", opts: ["Morphine", "Ibogaine (indole alkaloids)", "Cocaine", "Atropine"], correct: 1, explanation: "Voacanga africana contains iboga-type indole alkaloids, including voacangine and tabersonine, which are precursors for the semi-synthesis of vincamine used in cerebrovascular disorders.", difficulty: "hard" },
    { q: "The foam test in phytochemical screening detects:", opts: ["Alkaloids", "Tannins", "Saponins", "Flavonoids"], correct: 2, explanation: "Saponins produce persistent foam (>1cm, lasting >10 minutes) when an aqueous extract is vigorously shaken. This is due to their surface-active amphiphilic structure (hydrophilic sugar + hydrophobic aglycone).", difficulty: "easy" },
  ],
  clinical_pharmacy: [
    { q: "A patient on Warfarin presents with INR of 7.5 and no active bleeding. The MOST appropriate action is:", opts: ["Continue same dose", "Withhold warfarin and give oral Vitamin K 2.5mg", "Give IV Vitamin K 10mg and FFP", "Immediately start heparin"], correct: 1, explanation: "For INR >5 without significant bleeding, withhold warfarin and give low-dose oral Vitamin K (1-2.5mg). Recheck INR in 24-48 hours. IV Vitamin K and FFP are reserved for active serious bleeding.", difficulty: "medium" },
    { q: "According to Ghana's STG, the first-line treatment for acute watery diarrhoea in a 2-year-old is:", opts: ["Loperamide and antibiotics", "ORS and Zinc supplementation for 10-14 days", "IV fluids only", "Metronidazole"], correct: 1, explanation: "Ghana STG recommends ORS for rehydration plus Zinc supplementation (20mg/day for 10-14 days for children >6 months) for acute watery diarrhoea. Zinc reduces duration and severity and prevents recurrence for 2-3 months.", difficulty: "easy" },
    { q: "Which drug interaction is MOST clinically significant?", opts: ["Paracetamol + Vitamin C", "Methotrexate + NSAIDs", "Amoxicillin + Paracetamol", "Omeprazole + Antacids"], correct: 1, explanation: "NSAIDs reduce renal clearance of methotrexate and displace it from protein binding, potentially causing fatal methotrexate toxicity (pancytopenia, mucositis, renal failure). This interaction requires dose monitoring.", difficulty: "medium" },
    { q: "Pharmaceutical Care in the Ghanaian context (per Pharmacy Council guidelines) emphasizes:", opts: ["Only dispensing drugs accurately", "Responsible provision of drug therapy to achieve definite outcomes improving quality of life", "Selling as many products as possible", "Referring all patients to doctors"], correct: 1, explanation: "Pharmaceutical care, as defined by Hepler and Strand and adopted by Ghana's Pharmacy Council, involves the pharmacist taking responsibility for drug therapy outcomes, including identifying and resolving drug-related problems.", difficulty: "easy" },
    { q: "A TB patient on RHZE regimen develops visual disturbances. The MOST likely causative drug is:", opts: ["Rifampicin (R)", "Isoniazid (H)", "Pyrazinamide (Z)", "Ethambutol (E)"], correct: 3, explanation: "Ethambutol causes dose-dependent optic neuritis (retrobulbar neuritis) presenting as decreased visual acuity, red-green colour blindness, and central scotomas. Baseline visual acuity testing is recommended before starting ethambutol.", difficulty: "medium" },
    { q: "In NHIS prescribing, the maximum number of items per prescription is:", opts: ["3 items", "5 items", "No limit", "10 items"], correct: 1, explanation: "Ghana's NHIS guidelines typically allow up to 5 items per prescription encounter to promote rational prescribing. Additional items may require justification or a new encounter.", difficulty: "medium" },
    { q: "The MOST important counselling point for a patient starting Metformin is:", opts: ["Take on empty stomach", "Take with or after meals to reduce GI side effects", "Avoid all fruits", "Stop if urine colour changes"], correct: 1, explanation: "Metformin commonly causes GI side effects (nausea, diarrhoea, abdominal discomfort). Taking with or after meals significantly reduces these effects. Starting with a low dose and gradual titration also helps.", difficulty: "easy" },
    { q: "Therapeutic Drug Monitoring is ESSENTIAL for which drug?", opts: ["Amoxicillin", "Gentamicin", "Metformin", "Omeprazole"], correct: 1, explanation: "Gentamicin has a narrow therapeutic index with significant nephrotoxicity and ototoxicity. TDM (peak and trough levels) is essential to ensure efficacy while minimizing toxicity, especially in renal impairment.", difficulty: "easy" },
    { q: "A pharmacist identifies a prescription for Ciprofloxacin in a 10-year-old child. The BEST action is:", opts: ["Dispense as written", "Contact the prescriber to discuss - Ciprofloxacin is generally avoided in children due to arthropathy risk", "Refuse and send patient away", "Substitute with Erythromycin without telling anyone"], correct: 1, explanation: "Fluoroquinolones are generally contraindicated in children <18 years due to risk of cartilage damage (arthropathy). The pharmacist should contact the prescriber to discuss alternatives while documenting the intervention.", difficulty: "medium" },
    { q: "Medication Therapy Management (MTM) in community pharmacy in Ghana includes:", opts: ["Only selling medicines", "Comprehensive medication review, creating medication action plans, and patient education", "Diagnosing diseases", "Performing surgery"], correct: 1, explanation: "MTM involves the pharmacist systematically reviewing all medications, identifying drug-related problems, creating action plans, and educating patients. The Pharmacy Council of Ghana increasingly promotes this clinical role.", difficulty: "medium" },
    { q: "A patient on ARVs (TDF/3TC/DTG) develops renal impairment. Which component needs dose adjustment?", opts: ["Lamivudine (3TC) only", "Dolutegravir (DTG) only", "Tenofovir disoproxil (TDF) - consider switching to TAF", "No adjustment needed"], correct: 2, explanation: "TDF (Tenofovir disoproxil fumarate) is nephrotoxic and renally cleared. In renal impairment, consider switching to TAF (tenofovir alafenamide) or adjusting the dose interval. 3TC also needs renal dose adjustment.", difficulty: "hard" },
    { q: "The correct order of CPR steps according to current guidelines is:", opts: ["Airway, Breathing, Compressions", "Compressions, Airway, Breathing (C-A-B)", "Breathing, Compressions, Airway", "Check pulse for 30 seconds first"], correct: 1, explanation: "Current AHA/BLS guidelines recommend C-A-B sequence (Compressions first, then Airway, then Breathing) to minimize delay in starting chest compressions, which are the most critical intervention.", difficulty: "medium" },
  ],
  pharmacy_practice: [
    { q: "The Pharmacy Act of Ghana (Act 489, 1994) established:", opts: ["The Food and Drugs Authority", "The Pharmacy Council of Ghana", "The Medical and Dental Council", "The Nursing and Midwifery Council"], correct: 1, explanation: "The Pharmacy Act 1994 (Act 489) established the Pharmacy Council to regulate pharmacy practice, register pharmacists and pharmacy technicians, and accredit pharmacy programmes in Ghana.", difficulty: "easy" },
    { q: "A Schedule 1 (Part 1) drug in Ghana can ONLY be:", opts: ["Sold OTC by anyone", "Sold by a licensed chemical seller", "Dispensed by a pharmacist on prescription", "Purchased online freely"], correct: 2, explanation: "Schedule 1 Part 1 drugs (Class A poisons) can only be dispensed by a registered pharmacist on a valid prescription. These include controlled substances, strong antibiotics, and other prescription-only medicines.", difficulty: "easy" },
    { q: "Good Dispensing Practice (GDP) includes all EXCEPT:", opts: ["Verifying the prescription for legality and appropriateness", "Patient counselling on medication use", "Diagnosing the patient's condition", "Maintaining dispensing records"], correct: 2, explanation: "Diagnosing conditions is outside the pharmacist's scope (it is the prescriber's role). GDP includes receiving/validating prescriptions, clinical screening, accurate dispensing, labelling, counselling, and record-keeping.", difficulty: "easy" },
    { q: "Under Ghana's drug classification, Paracetamol tablets are classified as:", opts: ["Prescription Only Medicine", "Pharmacy-Only Medicine (OTC-P)", "General Sales List / OTC", "Controlled substance"], correct: 2, explanation: "Paracetamol in standard strengths is available as an over-the-counter (OTC)/general sales medicine in Ghana and can be sold by licensed chemical sellers and pharmacies without prescription.", difficulty: "easy" },
    { q: "The primary role of the Ghana Food and Drugs Authority (FDA) is:", opts: ["Training pharmacists", "Regulation of food, drugs, cosmetics, medical devices, and household chemicals", "Setting drug prices", "Running hospitals"], correct: 1, explanation: "Ghana FDA (established by Public Health Act 851, 2012) is responsible for the regulation of food, drugs, food supplements, herbal medicines, cosmetics, medical devices, household chemicals, and tobacco products.", difficulty: "easy" },
    { q: "A prescription is legally valid in Ghana if it contains:", opts: ["Only the drug name", "Patient details, prescriber details, drug details (name, dose, frequency, quantity), date, and signature", "Just the pharmacy stamp", "A verbal order only"], correct: 1, explanation: "A legally valid prescription must contain: patient name/age/address, date, drug name (preferably generic/INN), strength, dosage form, dose, frequency, duration/quantity, prescriber's name/signature/registration number.", difficulty: "medium" },
    { q: "Controlled drugs (e.g., Morphine, Pethidine) in Ghana require:", opts: ["No special documentation", "A special controlled drug prescription and register entries", "Only a verbal order from any health worker", "Purchase from any shop"], correct: 1, explanation: "Controlled drugs under the Narcotics Drugs (Control, Enforcement and Sanctions) Act require special prescriptions, a CD register with documented receipt/supply, and secure storage in double-locked cabinets.", difficulty: "medium" },
    { q: "Professional ethics in pharmacy require a pharmacist to:", opts: ["Prioritise profit over patient safety", "Maintain patient confidentiality and act in the patient's best interest", "Dispense any request without questions", "Share patient information freely on social media"], correct: 1, explanation: "The Pharmacy Council Code of Ethics mandates that pharmacists maintain patient confidentiality, act with integrity, prioritise patient welfare, maintain competence through CPD, and avoid conflicts of interest.", difficulty: "easy" },
    { q: "Cold chain management in pharmacy is critical for:", opts: ["Paracetamol tablets", "Insulin and vaccines", "Multivitamin tablets", "Oral rehydration salts"], correct: 1, explanation: "Insulin (2-8C storage) and vaccines require unbroken cold chain management. Temperature excursions can denature these proteins, rendering them ineffective. Pharmacies must have calibrated refrigerators with temperature logs.", difficulty: "medium" },
    { q: "Continuing Professional Development (CPD) for pharmacists in Ghana requires:", opts: ["No further education after graduation", "Accumulating CPD credits for licence renewal with the Pharmacy Council", "Only reading one textbook per year", "Attending one conference ever"], correct: 1, explanation: "The Pharmacy Council of Ghana requires pharmacists to accumulate CPD credits through approved activities (workshops, conferences, online courses, publications) for annual practising licence renewal.", difficulty: "medium" },
  ],
  pharma_microbiology: [
    { q: "The minimum temperature and time for autoclaving pharmaceutical products is:", opts: ["100°C for 30 minutes", "121°C for 15 minutes", "160°C for 2 hours", "80°C for 1 hour"], correct: 1, explanation: "Autoclaving (moist heat sterilisation) requires a minimum of 121°C at 15 psi for 15 minutes to achieve sterilisation. This is the standard for pharmaceutical and hospital applications.", difficulty: "easy" },
    { q: "The Kirby-Bauer disc diffusion test measures:", opts: ["Minimum bactericidal concentration", "Zone of inhibition to determine antibiotic susceptibility", "Bacterial growth rate", "Endotoxin levels"], correct: 1, explanation: "The Kirby-Bauer method measures the zone of inhibition around antibiotic-impregnated discs on an agar plate inoculated with the test organism. Zone diameter is compared to CLSI breakpoints.", difficulty: "easy" },
    { q: "USP <71> Sterility Testing requires incubation for:", opts: ["3 days", "7 days", "14 days", "28 days"], correct: 2, explanation: "USP <71> requires incubation of sterility test media for not less than 14 days, using both Fluid Thioglycollate Medium (for anaerobes/aerobes at 30-35°C) and Soybean-Casein Digest Medium (for fungi at 20-25°C).", difficulty: "medium" },
    { q: "Ghana FDA GMP requirements for cleanrooms in sterile manufacturing mandate:", opts: ["No air filtration needed", "HEPA-filtered air with Class 100 at point of fill", "Open windows for ventilation", "Standard room conditions"], correct: 1, explanation: "Ghana FDA follows WHO GMP guidelines requiring HEPA-filtered air in aseptic processing areas. Grade A (Class 100/ISO 5) is required at the critical filling point with appropriate background grades.", difficulty: "medium" },
    { q: "The LAL (Limulus Amebocyte Lysate) test detects:", opts: ["Viable bacteria", "Fungal contamination", "Bacterial endotoxins (pyrogens)", "Viral particles"], correct: 2, explanation: "The LAL test detects and quantifies bacterial endotoxins (lipopolysaccharides from Gram-negative bacteria) in pharmaceutical products, particularly parenterals. Endotoxin limits are specified in pharmacopoeias.", difficulty: "medium" },
    { q: "Antimicrobial Resistance (AMR) in Ghana is primarily driven by:", opts: ["Excessive handwashing", "Over-the-counter antibiotic sales without prescription and incomplete courses", "Too many hospital beds", "Excessive vaccine use"], correct: 1, explanation: "AMR in Ghana is fuelled by easy OTC access to antibiotics through chemical sellers, self-medication, incomplete treatment courses, poor infection control, and limited microbiology lab capacity for susceptibility testing.", difficulty: "easy" },
    { q: "Water for Injection (WFI) differs from Purified Water in that WFI must also pass:", opts: ["Colour test", "Bacterial endotoxin test (< 0.25 EU/mL)", "Taste test", "Viscosity test"], correct: 1, explanation: "WFI must meet all Purified Water specifications plus pass the bacterial endotoxin test (< 0.25 EU/mL). It is produced by distillation or validated reverse osmosis and used for parenteral preparations.", difficulty: "hard" },
    { q: "The MOST appropriate method for sterilising heat-labile pharmaceutical solutions is:", opts: ["Autoclaving", "Dry heat sterilisation", "Membrane filtration (0.22 μm)", "Ethylene oxide"], correct: 2, explanation: "Membrane filtration through 0.22 μm filters is the method of choice for heat-labile solutions (e.g., protein drugs, certain ophthalmic solutions) as it removes bacteria without thermal degradation.", difficulty: "medium" },
  ],
  pharmaceutics: [
    { q: "The BCS (Biopharmaceutics Classification System) Class II drugs have:", opts: ["High solubility, high permeability", "Low solubility, high permeability", "High solubility, low permeability", "Low solubility, low permeability"], correct: 1, explanation: "BCS Class II drugs (e.g., ibuprofen, ketoconazole) have low aqueous solubility but high membrane permeability. Dissolution rate is the rate-limiting step for their absorption.", difficulty: "easy" },
    { q: "The primary purpose of wet granulation in tablet manufacturing is to:", opts: ["Reduce tablet weight", "Improve flow properties and compressibility of powder blends", "Add colour to tablets", "Sterilise the active ingredient"], correct: 1, explanation: "Wet granulation converts fine powders into granules with improved flow, compressibility, and content uniformity. It involves adding a binder solution, wet massing, drying, and sizing.", difficulty: "easy" },
    { q: "An O/W emulsion has:", opts: ["Oil as the continuous phase", "Water as the continuous phase with oil droplets dispersed", "No surfactant", "Only one phase"], correct: 1, explanation: "In an oil-in-water (O/W) emulsion, oil droplets are dispersed in a continuous aqueous phase, stabilised by an emulsifying agent. Most oral and topical pharmaceutical emulsions are O/W type.", difficulty: "easy" },
    { q: "The disintegration test for uncoated tablets (USP) requires tablets to disintegrate within:", opts: ["5 minutes", "15 minutes", "30 minutes", "60 minutes"], correct: 2, explanation: "USP specifies that uncoated tablets must disintegrate within 30 minutes in the disintegration apparatus using water or specified medium at 37±2°C. Enteric-coated tablets have different requirements.", difficulty: "medium" },
    { q: "HLB (Hydrophile-Lipophile Balance) values of 8-18 indicate a surfactant suitable for:", opts: ["W/O emulsions", "O/W emulsions", "Detergency only", "Antifoaming"], correct: 1, explanation: "HLB values of 8-18 favour O/W emulsion formation. Lower HLB values (3-6) favour W/O emulsions. This system helps in selecting appropriate emulsifying agents for pharmaceutical formulations.", difficulty: "medium" },
    { q: "Controlled-release tablets that use a hydrophilic matrix system typically employ:", opts: ["Magnesium stearate", "HPMC (Hydroxypropyl methylcellulose)", "Talc", "Silicon dioxide"], correct: 1, explanation: "HPMC is the most widely used hydrophilic matrix polymer for controlled-release tablets. It hydrates on contact with GI fluid, forming a gel layer that controls drug release by diffusion and erosion.", difficulty: "medium" },
    { q: "Danadams Pharmaceutical Industry in Ghana primarily manufactures:", opts: ["Only injectables", "Solid oral dosage forms including tablets and capsules", "Only herbal products", "Only veterinary drugs"], correct: 1, explanation: "Danadams is one of Ghana's leading local pharmaceutical manufacturers, producing solid oral dosage forms (tablets, capsules), liquids, and other essential medicines for the Ghanaian and West African market.", difficulty: "easy" },
    { q: "The purpose of enteric coating on tablets is to:", opts: ["Improve taste only", "Prevent drug release in the stomach and allow release in the intestine", "Make tablets waterproof", "Increase shelf life only"], correct: 1, explanation: "Enteric coating resists dissolution in acidic gastric pH but dissolves at intestinal pH (>5.5). This protects acid-labile drugs (e.g., omeprazole) or prevents gastric irritation (e.g., aspirin).", difficulty: "easy" },
  ],
  pathophysiology: [
    { q: "The hallmark pathological finding in atherosclerosis is:", opts: ["Venous thrombosis", "Fatty plaque (atheroma) formation in arterial walls", "Valvular calcification only", "Capillary fragility"], correct: 1, explanation: "Atherosclerosis involves the formation of atheromatous plaques (lipid-laden deposits) within arterial intima, leading to vessel narrowing, ischaemia, and potential plaque rupture with thrombosis.", difficulty: "easy" },
    { q: "In Type 2 Diabetes, the primary pathophysiological defect is:", opts: ["Absolute insulin deficiency from autoimmune beta-cell destruction", "Insulin resistance with relative insulin deficiency", "Glucagon excess only", "Renal glucose wasting"], correct: 1, explanation: "Type 2 DM is characterised by peripheral insulin resistance (muscle, liver, adipose) coupled with progressive beta-cell dysfunction leading to relative insulin deficiency. Obesity is a major risk factor.", difficulty: "easy" },
    { q: "The Plasmodium falciparum malaria parasite primarily causes severe disease by:", opts: ["Infecting white blood cells", "Sequestration of infected red blood cells in cerebral microvasculature", "Destroying platelets", "Blocking lymph nodes"], correct: 1, explanation: "P. falciparum-infected RBCs express PfEMP1 protein that binds to endothelial receptors, causing sequestration in microvessels of the brain, lungs, and other organs, leading to cerebral malaria and organ failure.", difficulty: "medium" },
    { q: "Hypertension prevalence in urban Ghana is approximately:", opts: ["5-10%", "15-20%", "28-35%", "50-60%"], correct: 2, explanation: "Epidemiological studies estimate hypertension prevalence in urban Ghana at approximately 28-35%, driven by dietary changes, sedentary lifestyle, obesity, and genetic predisposition. It is a leading NCD in Ghana.", difficulty: "medium" },
    { q: "Helicobacter pylori causes peptic ulcer disease by:", opts: ["Direct acid secretion", "Producing urease that damages gastric mucosa and triggering inflammation", "Blocking bicarbonate production only", "Causing gastric cancer only"], correct: 1, explanation: "H. pylori produces urease (converting urea to ammonia), disrupting the mucous barrier. It also triggers chronic inflammation via cytokines and direct mucosal damage, leading to peptic ulceration. Prevalence in Ghana is 60-75%.", difficulty: "medium" },
    { q: "The pathophysiology of asthma involves:", opts: ["Only bronchospasm", "Chronic airway inflammation, bronchial hyperresponsiveness, and reversible airflow obstruction", "Permanent alveolar destruction", "Pleural effusion"], correct: 1, explanation: "Asthma is characterised by the triad of chronic airway inflammation (eosinophilic), bronchial hyperresponsiveness to triggers, and reversible airflow limitation due to bronchoconstriction, mucosal oedema, and mucus hypersecretion.", difficulty: "easy" },
    { q: "Hepatitis B virus (HBV) is transmitted primarily through:", opts: ["Faecal-oral route only", "Blood, sexual contact, and vertical (mother-to-child) transmission", "Airborne droplets", "Contaminated water only"], correct: 1, explanation: "HBV is a blood-borne virus transmitted via percutaneous/mucosal exposure to infected blood/body fluids, sexual contact, and vertical transmission. Ghana has ~12-15% HBV prevalence, making it highly endemic.", difficulty: "easy" },
    { q: "The RAAS (Renin-Angiotensin-Aldosterone System) in hypertension leads to:", opts: ["Vasodilation and sodium excretion", "Vasoconstriction, sodium/water retention, and increased blood pressure", "Decreased heart rate only", "Potassium retention"], correct: 1, explanation: "RAAS activation produces angiotensin II (potent vasoconstrictor) and stimulates aldosterone release (promoting renal sodium/water reabsorption), both contributing to elevated blood pressure. ACEi/ARBs target this system.", difficulty: "medium" },
  ],
  pharmacokinetics: [
    { q: "The volume of distribution (Vd) of a drug relates:", opts: ["Drug dose to plasma concentration", "Total amount of drug in the body to its plasma concentration", "Drug clearance to half-life", "Bioavailability to absorption rate"], correct: 1, explanation: "Vd = Amount of drug in body / Plasma concentration. A large Vd indicates extensive tissue distribution (e.g., chloroquine Vd ~200L), while a small Vd suggests confinement to plasma (e.g., warfarin ~8L).", difficulty: "easy" },
    { q: "A drug's half-life (t½) is 6 hours. Approximately how long until steady-state is reached with regular dosing?", opts: ["6 hours", "12 hours", "24-30 hours (4-5 half-lives)", "48 hours"], correct: 2, explanation: "Steady-state is reached after approximately 4-5 half-lives of continuous dosing. For t½ = 6 hours: 4-5 × 6 = 24-30 hours. At steady state, drug input rate equals elimination rate.", difficulty: "easy" },
    { q: "Ghana FDA bioequivalence studies for generic drugs require the 90% CI of AUC and Cmax ratios to fall within:", opts: ["70-143%", "80-125%", "90-110%", "95-105%"], correct: 1, explanation: "Ghana FDA follows WHO/ICH guidelines requiring the 90% confidence interval of the geometric mean ratios (test/reference) for AUC and Cmax to fall within 80-125% for bioequivalence approval of generic medicines.", difficulty: "medium" },
    { q: "CYP2D6 ultrarapid metaboliser phenotype, notable in West African populations, affects the metabolism of:", opts: ["Paracetamol primarily", "Codeine (increased conversion to morphine, risking toxicity)", "Metformin", "Penicillins"], correct: 1, explanation: "CYP2D6 ultrarapid metabolisers have gene duplications leading to increased enzyme activity. Codeine is converted to morphine faster, risking opioid toxicity. This phenotype has higher prevalence in Ghanaian populations.", difficulty: "hard" },
    { q: "The Cockcroft-Gault equation estimates:", opts: ["Hepatic clearance", "Creatinine clearance (as a proxy for GFR)", "Volume of distribution", "Bioavailability"], correct: 1, explanation: "Cockcroft-Gault estimates CrCl using age, weight, serum creatinine, and sex. It is widely used in Ghanaian clinical practice for renal dose adjustments of drugs like gentamicin, vancomycin, and tenofovir.", difficulty: "easy" },
    { q: "Rifampicin is a potent inducer of CYP3A4. In TB-HIV co-infected patients in Ghana, this interaction is critical because:", opts: ["It has no drug interactions", "It dramatically reduces plasma levels of ARVs like efavirenz and protease inhibitors", "It only affects paracetamol levels", "It increases ARV levels dangerously"], correct: 1, explanation: "Rifampicin induces CYP3A4 and P-glycoprotein, reducing plasma concentrations of many ARVs by 50-95%. This is why dolutegravir dose is doubled (50mg BD) during rifampicin-based TB treatment in Ghana.", difficulty: "hard" },
    { q: "First-pass metabolism primarily occurs in the:", opts: ["Kidneys", "Liver and gut wall", "Lungs", "Brain"], correct: 1, explanation: "First-pass metabolism occurs primarily in the liver and intestinal wall after oral absorption. Drugs absorbed from the GI tract pass through the portal circulation to the liver before reaching systemic circulation.", difficulty: "easy" },
    { q: "Therapeutic Drug Monitoring (TDM) is essential for all of the following EXCEPT:", opts: ["Gentamicin", "Phenytoin", "Amoxicillin", "Lithium"], correct: 2, explanation: "Amoxicillin has a wide therapeutic index and predictable pharmacokinetics, making TDM unnecessary. Gentamicin, phenytoin, and lithium all have narrow therapeutic indices requiring TDM to prevent toxicity.", difficulty: "medium" },
  ],
  toxicology: [
    { q: "The specific antidote for Paracetamol (Acetaminophen) overdose is:", opts: ["Naloxone", "N-Acetylcysteine (NAC)", "Flumazenil", "Atropine"], correct: 1, explanation: "NAC replenishes hepatic glutathione stores depleted by the toxic metabolite NAPQI. It is most effective when given within 8 hours of ingestion but can be beneficial up to 24 hours. The 150/50/100 mg/kg IV protocol is standard.", difficulty: "easy" },
    { q: "Organophosphate poisoning presents with the SLUDGE mnemonic which stands for:", opts: ["Sleep, Lethargy, Urination, Diarrhoea, Grief, Emesis", "Salivation, Lacrimation, Urination, Defecation, GI distress, Emesis", "Sweating, Liver failure, Ulcers, Delirium, Gangrene, Edema", "Seizures, Lung damage, Unconsciousness, Death, Gastroparesis, Encephalopathy"], correct: 1, explanation: "SLUDGE describes the muscarinic cholinergic excess from acetylcholinesterase inhibition: Salivation, Lacrimation, Urination, Defecation, GI distress (cramping), Emesis. Treatment is atropine + pralidoxime.", difficulty: "easy" },
    { q: "In heavy metal poisoning from illegal gold mining (galamsey) in Ghana, the MOST common toxic exposure is:", opts: ["Lead only", "Mercury from amalgamation process", "Arsenic only", "Cadmium only"], correct: 1, explanation: "Mercury is the primary toxic exposure in artisanal gold mining (galamsey) in Ghana. Miners use mercury amalgamation to extract gold, causing occupational mercury poisoning and environmental water/soil contamination.", difficulty: "medium" },
    { q: "The antidote for Benzodiazepine overdose is:", opts: ["Naloxone", "NAC", "Flumazenil", "Vitamin K"], correct: 2, explanation: "Flumazenil is a competitive GABA-A receptor antagonist that reverses benzodiazepine sedation. However, it must be used cautiously as it can precipitate seizures in chronic benzodiazepine users or mixed overdoses.", difficulty: "easy" },
    { q: "Tramadol abuse is a significant public health concern in Ghana. Tramadol overdose can cause:", opts: ["Only drowsiness", "Seizures, respiratory depression, and serotonin syndrome", "Only mild nausea", "No serious effects"], correct: 1, explanation: "Tramadol at high doses causes seizures (lowered seizure threshold), respiratory depression (opioid effect), and serotonin syndrome. Ghana FDA has restricted tramadol due to widespread abuse, particularly among youth.", difficulty: "medium" },
    { q: "The LD50 of a substance represents:", opts: ["The dose that causes 50% effect", "The dose lethal to 50% of a test population", "The maximum safe dose", "The minimum toxic dose"], correct: 1, explanation: "LD50 (Lethal Dose 50) is the dose of a substance that kills 50% of the test animal population. It is a standard measure of acute toxicity used to compare the relative toxicity of different substances.", difficulty: "easy" },
    { q: "Type B (Bizarre) adverse drug reactions are characterised by:", opts: ["Dose-dependent and predictable effects", "Unpredictable, not dose-related, often immunological (e.g., anaphylaxis, SJS)", "Always mild", "Only occurring with overdose"], correct: 1, explanation: "Type B ADRs are idiosyncratic, unpredictable, not dose-related, and often immune-mediated. Examples include anaphylaxis, Stevens-Johnson syndrome, and drug-induced lupus. They have high mortality but low incidence.", difficulty: "medium" },
    { q: "The Ghana FDA pharmacovigilance system requires healthcare professionals to report ADRs using:", opts: ["Social media posts", "The Blue ADR Reporting Form (Med Safety app or paper form)", "Verbal communication only", "No reporting is required"], correct: 1, explanation: "Ghana FDA's pharmacovigilance programme uses the Blue Form (also available via the Med Safety app) for spontaneous ADR reporting. Healthcare professionals, including pharmacists, are encouraged to report all suspected ADRs.", difficulty: "easy" },
  ],
  public_health_pharmacy: [
    { q: "Ghana's National Health Insurance Scheme (NHIS) was established by:", opts: ["Act 489 of 1994", "Act 650 of 2003 (revised by Act 852 of 2012)", "Act 851 of 2012", "The 1992 Constitution directly"], correct: 1, explanation: "NHIS was established by the National Health Insurance Act 650 of 2003, later revised by Act 852 of 2012. It provides financial protection for accessing healthcare, covering about 40% of Ghana's population.", difficulty: "medium" },
    { q: "The first-line treatment for uncomplicated malaria in Ghana according to NMCP guidelines is:", opts: ["Chloroquine", "Quinine", "Artemether-Lumefantrine (AL)", "Sulfadoxine-Pyrimethamine"], correct: 2, explanation: "Artemether-Lumefantrine (Coartem) is Ghana's first-line ACT for uncomplicated P. falciparum malaria since 2004. Artesunate-Amodiaquine is the alternative first-line. Parenteral artesunate is used for severe malaria.", difficulty: "easy" },
    { q: "The WHO-recommended strategy for TB treatment is:", opts: ["Single drug therapy", "DOTS (Directly Observed Therapy, Short-course)", "Surgery only", "No treatment for latent TB"], correct: 1, explanation: "DOTS involves direct observation of medication intake, standardised short-course regimens (2RHZE/4RH), uninterrupted drug supply, systematic monitoring, and government commitment. Ghana adopted DOTS nationally.", difficulty: "easy" },
    { q: "Antimicrobial Stewardship Programmes (ASP) in Ghanaian hospitals aim to:", opts: ["Prescribe more antibiotics", "Optimise antibiotic use, reduce resistance, and improve patient outcomes", "Replace antibiotics with herbals", "Eliminate all antibiotic use"], correct: 1, explanation: "ASPs promote rational antibiotic prescribing through guidelines, formulary restrictions, prospective audit, and education. Ghana's National Action Plan on AMR (2017) mandates ASP implementation in all hospitals.", difficulty: "easy" },
    { q: "The Expanded Programme on Immunization (EPI) in Ghana provides:", opts: ["Only BCG vaccine", "Free childhood vaccines including BCG, OPV, Pentavalent, PCV, Rotavirus, Measles, and Yellow Fever", "Vaccines only for adults", "Only malaria vaccines"], correct: 1, explanation: "Ghana's EPI provides free vaccines to all children under 1 year. The schedule includes BCG, OPV, Pentavalent (DPT-HepB-Hib), PCV-13, Rotavirus, Measles-Rubella, Yellow Fever, and recently RTS,S malaria vaccine.", difficulty: "easy" },
    { q: "Ghana's test-and-treat policy for HIV means:", opts: ["Only testing high-risk groups", "All individuals diagnosed HIV-positive are eligible for immediate ART regardless of CD4 count", "Treating only when CD4 < 200", "Testing without treatment"], correct: 1, explanation: "Ghana adopted the WHO test-and-treat policy in 2016, meaning all HIV-positive individuals begin ART immediately upon diagnosis, regardless of CD4 count. The current first-line regimen is TLD (Tenofovir/Lamivudine/Dolutegravir).", difficulty: "medium" },
    { q: "Intermittent Preventive Treatment in pregnancy (IPTp) in Ghana uses:", opts: ["Chloroquine monthly", "Sulfadoxine-Pyrimethamine (SP/Fansidar) at each ANC visit from 13 weeks", "Artemether-Lumefantrine weekly", "No chemoprevention"], correct: 1, explanation: "IPTp-SP involves giving at least 3 doses of SP (Fansidar) during pregnancy, starting at 13 weeks and at each ANC visit at least 1 month apart. This reduces malaria-related maternal anaemia and low birth weight.", difficulty: "medium" },
    { q: "The pharmacist's role in public health in Ghana includes all EXCEPT:", opts: ["Immunization advocacy and administration", "Health screening (BP, blood glucose)", "Performing surgical procedures", "Medication therapy management and patient education"], correct: 2, explanation: "Pharmacists in Ghana play expanding public health roles: immunization, health screening, smoking cessation, medication management, and community education. Surgical procedures are outside the pharmacist's scope.", difficulty: "easy" },
  ],
};

const CATEGORIES = [
  { id: "pharmacology", name: "Pharmacology", count: 20, time: 30, icon: "pill", color: "#C9A84C" },
  { id: "pharmaceutical_chemistry", name: "Pharmaceutical Chemistry", count: 15, time: 25, icon: "flask", color: "#60a5fa" },
  { id: "pharmacognosy", name: "Pharmacognosy", count: 15, time: 20, icon: "leaf", color: "#34d399" },
  { id: "clinical_pharmacy", name: "Clinical Pharmacy", count: 20, time: 35, icon: "heart", color: "#f472b6" },
  { id: "pharmacy_practice", name: "Pharmacy Practice & Ethics", count: 10, time: 15, icon: "scale", color: "#a78bfa" },
  { id: "pharma_microbiology", name: "Pharmaceutical Microbiology", count: 8, time: 15, icon: "flask", color: "#f59e0b" },
  { id: "pharmaceutics", name: "Pharmaceutics & Dosage Forms", count: 8, time: 15, icon: "pill", color: "#06b6d4" },
  { id: "pathophysiology", name: "Pathophysiology", count: 8, time: 15, icon: "heart", color: "#ef4444" },
  { id: "pharmacokinetics", name: "Pharmacokinetics", count: 8, time: 15, icon: "flask", color: "#8b5cf6" },
  { id: "toxicology", name: "Toxicology & Poisons", count: 8, time: 15, icon: "scale", color: "#dc2626" },
  { id: "public_health_pharmacy", name: "Public Health Pharmacy", count: 8, time: 15, icon: "heart", color: "#10b981" },
];

const GRADES = [
  { min: 80, letter: "A", label: "Excellent" },
  { min: 70, letter: "B", label: "Very Good" },
  { min: 60, letter: "C", label: "Good" },
  { min: 50, letter: "D", label: "Pass" },
  { min: 0, letter: "F", label: "Fail" },
];

/* ───────────────────────────── SVG icons ─────────────────────────────── */
const icons = {
  pill: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M10.5 1.5l-8.5 8.5a5.66 5.66 0 008 8l8.5-8.5a5.66 5.66 0 00-8-8z" />
      <line x1="6" y1="14" x2="14" y2="6" />
    </svg>
  ),
  flask: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M9 3h6M10 3v6.5L4 20h16L14 9.5V3" />
    </svg>
  ),
  leaf: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34M17 8A5 5 0 003 18M17 8l4-4" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  ),
  scale: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M12 3v18M3 7l3 5h6l3-5M15 7l3 5h3l-3-5M8 7L5 12M19 7l-3 5" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  flag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  chevronLeft: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  chevronRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  trophy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
      <path d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2M6 3h12v7a6 6 0 01-12 0V3zM9 21h6M12 17v4" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

/* ───────────────────────── confetti component ────────────────────────── */
function Confetti() {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: ["#C9A84C", "#E8D48B", "#34d399", "#60a5fa", "#f472b6", "#a78bfa"][i % 6],
    size: 6 + Math.random() * 8,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            top: "-20px",
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ───────────────────────── best scores (empty until user completes quizzes) */
const mockBestScores = {
  pharmacology: null,
  pharmaceutical_chemistry: null,
  pharmacognosy: null,
  clinical_pharmacy: null,
  pharmacy_practice: null,
  pharma_microbiology: null,
  pharmaceutics: null,
  pathophysiology: null,
  pharmacokinetics: null,
  toxicology: null,
  public_health_pharmacy: null,
};

/* ═══════════════════════════ MAIN COMPONENT ══════════════════════════ */
export default function QuizEngine() {
  const [view, setView] = useState("select"); // select | quiz | results
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [difficulty, setDifficulty] = useState("mixed");
  const [questionCount, setQuestionCount] = useState("all");
  const [timed, setTimed] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timerWarning, setTimerWarning] = useState(null); // "5min" | "1min" | null
  const [showConfetti, setShowConfetti] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const timerRef = useRef(null);
  const warningTimeoutRef = useRef(null);

  /* ─────────────── timer logic ─────────────── */
  useEffect(() => {
    if (view !== "quiz" || !timed || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        if (prev === 301) {
          setTimerWarning("5min");
          warningTimeoutRef.current = setTimeout(() => setTimerWarning(null), 3000);
        }
        if (prev === 61) {
          setTimerWarning("1min");
          warningTimeoutRef.current = setTimeout(() => setTimerWarning(null), 3000);
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      clearInterval(timerRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, timed, submitted]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  /* ─────────── start quiz ─────────── */
  const startQuiz = (catId) => {
    const cat = CATEGORIES.find((c) => c.id === catId);
    let pool = [...QUESTION_BANK[catId]];
    if (difficulty !== "mixed") {
      pool = pool.filter((q) => q.difficulty === difficulty);
    }
    // shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    let count = pool.length;
    if (questionCount !== "all") {
      count = Math.min(parseInt(questionCount), pool.length);
    }
    pool = pool.slice(0, count);
    if (pool.length === 0) {
      alert("No questions match the selected difficulty. Try 'Mixed' difficulty.");
      return;
    }
    setQuestions(pool);
    setSelectedCategory(cat);
    setCurrentQ(0);
    setAnswers({});
    setFlagged(new Set());
    setSubmitted(false);
    setReviewMode(false);
    setTimerWarning(null);
    const totalSec = timed ? cat.time * 60 : 0;
    setTimeLeft(totalSec);
    setTotalTime(totalSec);
    setView("quiz");
  };

  /* ─────────── submit quiz ─────────── */
  const handleSubmit = useCallback((autoSubmit = false) => {
    clearInterval(timerRef.current);
    setSubmitted(true);
    setShowSubmitModal(false);
    setView("results");
    // check for confetti
    const score = computeScore();
    if (score.pct >= 80) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, questions]);

  const computeScore = useCallback(() => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });
    const pct = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    const grade = GRADES.find((g) => pct >= g.min);
    return { correct, total: questions.length, pct, grade };
  }, [answers, questions]);

  const computeBreakdown = useCallback(() => {
    const breakdown = { easy: { total: 0, correct: 0 }, medium: { total: 0, correct: 0 }, hard: { total: 0, correct: 0 } };
    questions.forEach((q, i) => {
      const d = q.difficulty;
      breakdown[d].total++;
      if (answers[i] === q.correct) breakdown[d].correct++;
    });
    return breakdown;
  }, [answers, questions]);

  /* ═════════════════════════ SELECT VIEW ═════════════════════════════ */
  if (view === "select") {
    return (
      <div className="min-h-screen bg-warm-50 dark:bg-gray-950 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6 font-body">
            <Link to="/learn" className="hover:text-[#C9A84C] transition-colors">Academy</Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100">Quizzes</span>
          </nav>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-display font-bold gold-text mb-3">Quiz Engine</h1>
            <p className="text-gray-600 dark:text-gray-400 font-body text-lg max-w-2xl">
              Test your knowledge with timed assessments in KNUST/UG exam format. Choose a category, configure your quiz, and challenge yourself.
            </p>
          </div>

          {/* Settings Panel */}
          <div className="dark-glass rounded-2xl p-6 mb-8 border border-gray-200 dark:border-gray-800">
            <h2 className="font-display font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4">Quiz Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-body text-gray-600 dark:text-gray-400 mb-1.5">Difficulty</label>
                <div className="flex flex-wrap gap-2">
                  {["easy", "medium", "hard", "mixed"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-body capitalize transition-all ${
                        difficulty === d
                          ? "bg-[#C9A84C] text-white shadow-lg shadow-[#C9A84C]/25"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-body text-gray-600 dark:text-gray-400 mb-1.5">Questions</label>
                <div className="flex flex-wrap gap-2">
                  {["10", "15", "20", "all"].map((n) => (
                    <button
                      key={n}
                      onClick={() => setQuestionCount(n)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-body capitalize transition-all ${
                        questionCount === n
                          ? "bg-[#C9A84C] text-white shadow-lg shadow-[#C9A84C]/25"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {n === "all" ? "All" : n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-body text-gray-600 dark:text-gray-400 mb-1.5">Timer</label>
                <div className="flex gap-2">
                  {[true, false].map((t) => (
                    <button
                      key={String(t)}
                      onClick={() => setTimed(t)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-body transition-all ${
                        timed === t
                          ? "bg-[#C9A84C] text-white shadow-lg shadow-[#C9A84C]/25"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {t ? "Timed" : "Untimed"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORIES.map((cat) => {
              const bestScore = mockBestScores[cat.id];
              return (
                <div
                  key={cat.id}
                  className="dark-glass rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:border-[#C9A84C]/50 transition-all hover:shadow-lg hover:shadow-[#C9A84C]/10 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-[#C9A84C]/10 transition-colors" style={{ color: cat.color }}>
                      {icons[cat.icon]}
                    </div>
                    {bestScore != null && (
                      <span className={`text-xs font-body px-2 py-1 rounded-full ${bestScore >= 70 ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"}`}>
                        Best: {bestScore}%
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-semibold text-gray-900 dark:text-gray-100 mb-2">{cat.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 font-body mb-4">
                    <span>{cat.count} Qs</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                    <span className="flex items-center gap-1">{icons.clock} {cat.time} min</span>
                  </div>
                  <div className="flex gap-1 mb-5">
                    {["easy", "medium", "hard"].map((d) => (
                      <span key={d} className="text-xs font-body px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 capitalize">{d}</span>
                    ))}
                  </div>
                  <button
                    onClick={() => startQuiz(cat.id)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#A8893A] text-white font-display font-semibold text-sm hover:shadow-lg hover:shadow-[#C9A84C]/30 transition-all active:scale-[0.98]"
                  >
                    Start Quiz
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ═════════════════════════ QUIZ VIEW ═══════════════════════════════ */
  if (view === "quiz" && !submitted) {
    const q = questions[currentQ];
    const answered = Object.keys(answers).length;
    const progress = questions.length > 0 ? ((currentQ + 1) / questions.length) * 100 : 0;
    const isFlagged = flagged.has(currentQ);

    return (
      <div className="min-h-screen bg-warm-50 dark:bg-gray-950 transition-colors">
        {/* Timer Warning Overlay */}
        {timerWarning && (
          <div className={`fixed inset-0 z-40 pointer-events-none flex items-center justify-center ${timerWarning === "1min" ? "animate-pulse" : ""}`}>
            <div className={`px-8 py-4 rounded-2xl text-white font-display font-bold text-2xl shadow-2xl ${timerWarning === "1min" ? "bg-red-600" : "bg-yellow-600"}`}>
              {timerWarning === "1min" ? "1 minute remaining!" : "5 minutes remaining!"}
            </div>
          </div>
        )}

        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <h2 className="font-display font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                {selectedCategory?.name}
              </h2>
              <span className="text-sm font-body text-gray-500 dark:text-gray-400 shrink-0">
                Q{currentQ + 1}/{questions.length}
              </span>
            </div>
            {timed && (
              <div className={`flex items-center gap-1.5 font-mono text-sm font-semibold shrink-0 ${timeLeft <= 60 ? "text-red-500 animate-pulse" : timeLeft <= 300 ? "text-yellow-600 dark:text-yellow-400" : "text-gray-700 dark:text-gray-300"}`}>
                {icons.clock}
                {formatTime(timeLeft)}
              </div>
            )}
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-gray-200 dark:bg-gray-800">
            <div
              className="h-full bg-gradient-to-r from-[#C9A84C] to-[#E8D48B] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-6">
            {/* Question Area */}
            <div>
              <div className="dark-glass rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 mb-6">
                <div className="flex items-center gap-3 mb-5">
                  <span className="px-3 py-1 rounded-lg bg-[#C9A84C]/10 text-[#C9A84C] text-sm font-display font-semibold">
                    Question {currentQ + 1}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-body capitalize ${q.difficulty === "easy" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : q.difficulty === "medium" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"}`}>
                    {q.difficulty}
                  </span>
                  {isFlagged && (
                    <span className="text-yellow-500">{icons.flag}</span>
                  )}
                </div>

                <p className="text-gray-900 dark:text-gray-100 font-body text-base sm:text-lg leading-relaxed mb-6">
                  {q.q}
                </p>

                <div className="space-y-3">
                  {q.opts.map((opt, idx) => {
                    const letter = ["A", "B", "C", "D"][idx];
                    const selected = answers[currentQ] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setAnswers((prev) => ({ ...prev, [currentQ]: idx }))}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 group/opt ${
                          selected
                            ? "border-[#C9A84C] bg-[#C9A84C]/10 dark:bg-[#C9A84C]/10"
                            : "border-gray-200 dark:border-gray-700 hover:border-[#C9A84C]/50 hover:bg-gray-50 dark:hover:bg-gray-900"
                        }`}
                      >
                        <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-display font-semibold transition-all ${
                          selected
                            ? "bg-[#C9A84C] text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover/opt:bg-[#C9A84C]/20 group-hover/opt:text-[#C9A84C]"
                        }`}>
                          {letter}
                        </span>
                        <span className={`font-body text-sm sm:text-base pt-1 ${selected ? "text-gray-900 dark:text-gray-100 font-medium" : "text-gray-700 dark:text-gray-300"}`}>
                          {opt}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
                  disabled={currentQ === 0}
                  className="flex items-center gap-1 px-4 py-2.5 rounded-xl font-body text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {icons.chevronLeft} Previous
                </button>

                <button
                  onClick={() => {
                    setFlagged((prev) => {
                      const n = new Set(prev);
                      if (n.has(currentQ)) n.delete(currentQ);
                      else n.add(currentQ);
                      return n;
                    });
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-body text-sm font-medium transition-all ${
                    isFlagged
                      ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                  }`}
                >
                  {icons.flag} {isFlagged ? "Unflag" : "Flag"}
                </button>

                {currentQ < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQ((p) => Math.min(questions.length - 1, p + 1))}
                    className="flex items-center gap-1 px-4 py-2.5 rounded-xl font-body text-sm font-medium bg-[#C9A84C] text-white hover:bg-[#A8893A] transition-all"
                  >
                    Next {icons.chevronRight}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="flex items-center gap-1 px-5 py-2.5 rounded-xl font-display text-sm font-semibold bg-gradient-to-r from-green-600 to-green-700 text-white hover:shadow-lg hover:shadow-green-600/30 transition-all"
                  >
                    Submit Quiz
                  </button>
                )}
              </div>
            </div>

            {/* Question Grid */}
            <div className="hidden lg:block">
              <div className="sticky top-20 dark-glass rounded-2xl p-4 border border-gray-200 dark:border-gray-800">
                <h3 className="font-display font-semibold text-sm text-gray-900 dark:text-gray-100 mb-3">Questions</h3>
                <div className="grid grid-cols-5 gap-1.5 mb-4">
                  {questions.map((_, i) => {
                    const isAnswered = answers[i] != null;
                    const isCurrent = i === currentQ;
                    const isFl = flagged.has(i);
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentQ(i)}
                        className={`w-8 h-8 rounded-lg text-xs font-body font-medium flex items-center justify-center transition-all ${
                          isCurrent
                            ? "bg-[#C9A84C] text-white ring-2 ring-[#C9A84C]/50"
                            : isAnswered
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : isFl
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
                <div className="space-y-1.5 text-xs font-body text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/30" /> Answered ({answered})</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-yellow-100 dark:bg-yellow-900/30" /> Flagged ({flagged.size})</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-800" /> Unanswered ({questions.length - answered})</div>
                </div>
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full mt-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-display text-sm font-semibold hover:shadow-lg transition-all"
                >
                  Submit Quiz
                </button>
              </div>
            </div>
          </div>

          {/* Mobile question grid */}
          <div className="lg:hidden mt-6">
            <details className="dark-glass rounded-2xl border border-gray-200 dark:border-gray-800">
              <summary className="p-4 font-display font-semibold text-sm text-gray-900 dark:text-gray-100 cursor-pointer">
                Question Navigator ({answered}/{questions.length} answered)
              </summary>
              <div className="px-4 pb-4">
                <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5 mb-3">
                  {questions.map((_, i) => {
                    const isAnswered = answers[i] != null;
                    const isCurrent = i === currentQ;
                    const isFl = flagged.has(i);
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentQ(i)}
                        className={`w-8 h-8 rounded-lg text-xs font-body font-medium flex items-center justify-center transition-all ${
                          isCurrent
                            ? "bg-[#C9A84C] text-white"
                            : isAnswered
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : isFl
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-display text-sm font-semibold"
                >
                  Submit Quiz
                </button>
              </div>
            </details>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="dark-glass rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-3 mb-4 text-yellow-600 dark:text-yellow-400">
                {icons.warning}
                <h3 className="font-display font-bold text-lg text-gray-900 dark:text-gray-100">Submit Quiz?</h3>
              </div>
              <div className="font-body text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-2">
                <p>You have answered <strong className="text-gray-900 dark:text-gray-100">{answered}</strong> of <strong className="text-gray-900 dark:text-gray-100">{questions.length}</strong> questions.</p>
                {questions.length - answered > 0 && (
                  <p className="text-yellow-600 dark:text-yellow-400">{questions.length - answered} question(s) remain unanswered.</p>
                )}
                {flagged.size > 0 && (
                  <p className="text-yellow-600 dark:text-yellow-400">{flagged.size} question(s) flagged for review.</p>
                )}
                <p className="pt-1">Are you sure you want to submit?</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-body text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  Continue Quiz
                </button>
                <button
                  onClick={() => handleSubmit()}
                  className="flex-1 py-2.5 rounded-xl font-display text-sm font-semibold bg-gradient-to-r from-green-600 to-green-700 text-white hover:shadow-lg transition-all"
                >
                  Yes, Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ═════════════════════════ RESULTS VIEW ════════════════════════════ */
  if (view === "results") {
    const { correct, total, pct, grade } = computeScore();
    const breakdown = computeBreakdown();
    const timeTaken = totalTime > 0 ? totalTime - timeLeft : 0;

    return (
      <div className="min-h-screen bg-warm-50 dark:bg-gray-950 transition-colors">
        {showConfetti && <Confetti />}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6 font-body">
            <Link to="/learn" className="hover:text-[#C9A84C] transition-colors">Academy</Link>
            <span>/</span>
            <button onClick={() => setView("select")} className="hover:text-[#C9A84C] transition-colors">Quizzes</button>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100">Results</span>
          </nav>

          {/* Score Card */}
          <div className="dark-glass rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 mb-8 text-center">
            <div className="inline-flex p-3 rounded-2xl bg-[#C9A84C]/10 text-[#C9A84C] mb-4">
              {icons.trophy}
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 dark:text-gray-100 mb-1">
              {selectedCategory?.name} Results
            </h2>
            <p className="font-body text-gray-500 dark:text-gray-400 mb-6">Quiz completed</p>

            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mb-8">
              {/* Score Circle */}
              <div className="relative w-36 h-36">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" className="stroke-gray-200 dark:stroke-gray-800" />
                  <circle
                    cx="50" cy="50" r="42" fill="none" strokeWidth="8"
                    stroke="#C9A84C"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display font-bold text-3xl text-gray-900 dark:text-gray-100">{pct}%</span>
                  <span className="font-body text-xs text-gray-500 dark:text-gray-400">{correct}/{total}</span>
                </div>
              </div>

              {/* Grade & Info */}
              <div className="text-left space-y-3">
                <div>
                  <span className="text-xs font-body text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grade</span>
                  <p className={`font-display font-bold text-4xl ${pct >= 50 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {grade.letter} <span className="text-base font-medium text-gray-500 dark:text-gray-400">({grade.label})</span>
                  </p>
                </div>
                {timed && (
                  <div>
                    <span className="text-xs font-body text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</span>
                    <p className="font-body text-gray-900 dark:text-gray-100">
                      {formatTime(timeTaken)} <span className="text-gray-500 dark:text-gray-400">/ {formatTime(totalTime)}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Difficulty Breakdown */}
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-6">
              {Object.entries(breakdown).map(([d, val]) => (
                val.total > 0 && (
                  <div key={d} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
                    <p className={`text-xs font-body capitalize mb-1 ${d === "easy" ? "text-green-600 dark:text-green-400" : d === "medium" ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}`}>{d}</p>
                    <p className="font-display font-bold text-gray-900 dark:text-gray-100">{val.correct}/{val.total}</p>
                    <p className="text-xs font-body text-gray-500">{val.total > 0 ? Math.round((val.correct / val.total) * 100) : 0}%</p>
                  </div>
                )
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setReviewMode(!reviewMode)}
                className="px-5 py-2.5 rounded-xl font-body text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                {reviewMode ? "Hide Review" : "Review Answers"}
              </button>
              <button
                onClick={() => startQuiz(selectedCategory.id)}
                className="px-5 py-2.5 rounded-xl font-display text-sm font-semibold bg-gradient-to-r from-[#C9A84C] to-[#A8893A] text-white hover:shadow-lg hover:shadow-[#C9A84C]/30 transition-all"
              >
                Retake Quiz
              </button>
              <button
                onClick={() => setView("select")}
                className="px-5 py-2.5 rounded-xl font-body text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                Back to Quizzes
              </button>
            </div>
          </div>

          {/* Question Review */}
          {reviewMode && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg text-gray-900 dark:text-gray-100">Question Review</h3>
              {questions.map((q, i) => {
                const userAnswer = answers[i];
                const isCorrect = userAnswer === q.correct;
                return (
                  <div
                    key={i}
                    className={`dark-glass rounded-2xl p-5 sm:p-6 border-2 transition-all ${
                      isCorrect
                        ? "border-green-200 dark:border-green-900/50"
                        : userAnswer == null
                        ? "border-gray-200 dark:border-gray-800"
                        : "border-red-200 dark:border-red-900/50"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className={`shrink-0 mt-0.5 ${isCorrect ? "text-green-500" : "text-red-500"}`}>
                        {isCorrect ? icons.check : icons.x}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-display font-semibold text-gray-900 dark:text-gray-100">Q{i + 1}</span>
                          <span className={`text-xs px-2 py-0.5 rounded capitalize font-body ${q.difficulty === "easy" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : q.difficulty === "medium" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"}`}>
                            {q.difficulty}
                          </span>
                        </div>
                        <p className="font-body text-sm text-gray-800 dark:text-gray-200 mb-3">{q.q}</p>
                        <div className="space-y-1.5 mb-3">
                          {q.opts.map((opt, idx) => {
                            const isUserPick = userAnswer === idx;
                            const isRight = q.correct === idx;
                            return (
                              <div
                                key={idx}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-body ${
                                  isRight
                                    ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 font-medium"
                                    : isUserPick && !isRight
                                    ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 line-through"
                                    : "text-gray-600 dark:text-gray-400"
                                }`}
                              >
                                <span className="font-semibold w-5">{["A", "B", "C", "D"][idx]}.</span>
                                {opt}
                                {isRight && <span className="ml-auto shrink-0 text-green-500">{icons.check}</span>}
                                {isUserPick && !isRight && <span className="ml-auto shrink-0 text-red-500">{icons.x}</span>}
                              </div>
                            );
                          })}
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-3 border border-blue-200 dark:border-blue-900/30">
                          <p className="text-xs font-display font-semibold text-blue-800 dark:text-blue-300 mb-1">Explanation</p>
                          <p className="text-sm font-body text-blue-900 dark:text-blue-200 leading-relaxed">{q.explanation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
