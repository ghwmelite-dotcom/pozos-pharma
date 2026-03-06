import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

/* ------------------------------------------------------------------ */
/*  FLASHCARD DATA - 70+ educationally accurate pharmacy cards        */
/* ------------------------------------------------------------------ */

const CARD_DATA = [
  // --- Drug Classifications (10 cards) ---
  { id: 1, front: "Classify Amlodipine", back: "Dihydropyridine Calcium Channel Blocker (CCB). Used for hypertension and angina. Selectively inhibits calcium influx across vascular smooth muscle and cardiac muscle.", category: "Drug Classifications", difficulty: 2 },
  { id: 2, front: "Classify Metformin", back: "Biguanide oral antidiabetic agent. First-line therapy for Type 2 Diabetes Mellitus. Not an insulin secretagogue.", category: "Drug Classifications", difficulty: 1 },
  { id: 3, front: "Classify Ciprofloxacin", back: "Second-generation Fluoroquinolone antibiotic. Broad-spectrum bactericidal agent that inhibits DNA gyrase and topoisomerase IV.", category: "Drug Classifications", difficulty: 2 },
  { id: 4, front: "Classify Omeprazole", back: "Proton Pump Inhibitor (PPI). Irreversibly inhibits H+/K+ ATPase in gastric parietal cells. Used for GERD, peptic ulcers, and Zollinger-Ellison syndrome.", category: "Drug Classifications", difficulty: 1 },
  { id: 5, front: "Classify Losartan", back: "Angiotensin II Receptor Blocker (ARB). Selectively blocks AT1 receptors. Used in hypertension, diabetic nephropathy, and heart failure when ACEIs are not tolerated.", category: "Drug Classifications", difficulty: 2 },
  { id: 6, front: "Classify Salbutamol", back: "Short-acting Beta-2 Adrenergic Agonist (SABA). Selective bronchodilator used as reliever in asthma and COPD. Onset 5-15 min, duration 4-6 hours.", category: "Drug Classifications", difficulty: 1 },
  { id: 7, front: "Classify Fluoxetine", back: "Selective Serotonin Reuptake Inhibitor (SSRI). First-line antidepressant. Also used in OCD, bulimia nervosa, and panic disorder. Long half-life (~4-6 days for active metabolite).", category: "Drug Classifications", difficulty: 2 },
  { id: 8, front: "Classify Prednisolone", back: "Intermediate-acting synthetic glucocorticoid. Used as anti-inflammatory and immunosuppressant. 4x more potent than cortisol with less mineralocorticoid activity.", category: "Drug Classifications", difficulty: 2 },
  { id: 9, front: "Classify Warfarin", back: "Coumarin-derivative anticoagulant (Vitamin K antagonist). Inhibits synthesis of Vitamin K-dependent clotting factors (II, VII, IX, X) and proteins C and S.", category: "Drug Classifications", difficulty: 3 },
  { id: 10, front: "Classify Diazepam", back: "Long-acting Benzodiazepine. Enhances GABAa receptor activity. Schedule 4 controlled substance in Ghana. Used for anxiety, seizures, muscle spasm, and alcohol withdrawal.", category: "Drug Classifications", difficulty: 2 },

  // --- Mechanisms of Action (10 cards) ---
  { id: 11, front: "Mechanism of action of Metformin", back: "Decreases hepatic glucose production, increases insulin sensitivity in peripheral tissues, decreases intestinal absorption of glucose. Activates AMP-activated protein kinase (AMPK). Does NOT stimulate insulin secretion.", category: "Mechanisms of Action", difficulty: 3 },
  { id: 12, front: "Mechanism of action of Penicillins", back: "Bind to penicillin-binding proteins (PBPs) and inhibit transpeptidase enzyme, preventing cross-linking of peptidoglycan in bacterial cell wall synthesis. Bactericidal, time-dependent killing.", category: "Mechanisms of Action", difficulty: 2 },
  { id: 13, front: "Mechanism of action of ACE Inhibitors (e.g. Enalapril)", back: "Inhibit Angiotensin-Converting Enzyme, preventing conversion of Angiotensin I to Angiotensin II. Also reduce bradykinin degradation (causes cough). Decrease aldosterone secretion, reduce preload and afterload.", category: "Mechanisms of Action", difficulty: 2 },
  { id: 14, front: "Mechanism of action of Statins (e.g. Atorvastatin)", back: "Competitively inhibit HMG-CoA reductase, the rate-limiting enzyme in cholesterol biosynthesis. Upregulate hepatic LDL receptors, increasing LDL clearance. Also have pleiotropic effects (anti-inflammatory, endothelial function).", category: "Mechanisms of Action", difficulty: 3 },
  { id: 15, front: "Mechanism of action of Aspirin (low-dose)", back: "Irreversibly acetylates cyclooxygenase-1 (COX-1) in platelets, inhibiting thromboxane A2 (TXA2) synthesis. Effect lasts lifetime of platelet (7-10 days). At higher doses, also inhibits COX-2.", category: "Mechanisms of Action", difficulty: 3 },
  { id: 16, front: "Mechanism of action of Chloroquine", back: "Accumulates in parasite food vacuole, inhibits heme polymerase, preventing conversion of toxic heme to hemozoin. Toxic heme accumulation kills the Plasmodium parasite. Active against erythrocytic stages.", category: "Mechanisms of Action", difficulty: 3 },
  { id: 17, front: "Mechanism of action of Methotrexate", back: "Inhibits dihydrofolate reductase (DHFR), blocking conversion of dihydrofolate to tetrahydrofolate. Impairs purine and thymidylate synthesis, inhibiting DNA/RNA/protein synthesis. At low doses, anti-inflammatory via adenosine release.", category: "Mechanisms of Action", difficulty: 4 },
  { id: 18, front: "Mechanism of action of Morphine", back: "Agonist at mu (primary), kappa, and delta opioid receptors. Opens K+ channels (hyperpolarization) and inhibits Ca2+ channels, reducing neurotransmitter release. Acts in CNS (PAG, spinal cord dorsal horn) and periphery.", category: "Mechanisms of Action", difficulty: 3 },
  { id: 19, front: "Mechanism of action of Insulin Glargine", back: "Long-acting insulin analogue. Forms microprecipitates at injection site due to neutral pH of subcutaneous tissue (formulated at pH 4). Slow dissolution provides peakless ~24-hour basal insulin coverage.", category: "Mechanisms of Action", difficulty: 3 },
  { id: 20, front: "Mechanism of action of Azithromycin", back: "Binds to 50S ribosomal subunit, inhibiting translocation step of bacterial protein synthesis. Bacteriostatic (bactericidal at high concentrations). Concentrates in tissues and phagocytes, giving long tissue half-life.", category: "Mechanisms of Action", difficulty: 2 },

  // --- Side Effects & ADRs (10 cards) ---
  { id: 21, front: "Major side effects of ACE Inhibitors", back: "Dry persistent cough (10-15%, due to bradykinin accumulation), hyperkalemia, angioedema (rare but serious), first-dose hypotension, teratogenic (contraindicated in pregnancy), acute renal failure in bilateral renal artery stenosis.", category: "Side Effects & ADRs", difficulty: 2 },
  { id: 22, front: "Side effects of Metformin", back: "GI disturbances (nausea, diarrhoea, metallic taste) - most common, lactic acidosis (rare but fatal, risk increased in renal impairment), Vitamin B12 deficiency with long-term use. Does NOT cause hypoglycaemia as monotherapy.", category: "Side Effects & ADRs", difficulty: 2 },
  { id: 23, front: "Adverse effects of Aminoglycosides (e.g. Gentamicin)", back: "Nephrotoxicity (reversible, monitor creatinine), Ototoxicity (irreversible, vestibular and cochlear damage), Neuromuscular blockade (rare, risk with myasthenia gravis). Require therapeutic drug monitoring (TDM). Avoid in pregnancy.", category: "Side Effects & ADRs", difficulty: 3 },
  { id: 24, front: "Side effects of Corticosteroids (chronic use)", back: "Cushing syndrome, osteoporosis, hyperglycaemia/diabetes, immunosuppression, peptic ulcers, adrenal suppression, thin skin/easy bruising, cataracts/glaucoma, growth retardation in children, mood disturbances, muscle wasting.", category: "Side Effects & ADRs", difficulty: 3 },
  { id: 25, front: "Major ADRs of Chloroquine", back: "Pruritus (especially in dark-skinned individuals), retinopathy with chronic use (irreversible bull's eye maculopathy), QT prolongation, hypoglycaemia, neuropsychiatric effects, myopathy. Contraindicated in psoriasis and epilepsy.", category: "Side Effects & ADRs", difficulty: 3 },
  { id: 26, front: "Side effects of Carbamazepine", back: "Stevens-Johnson syndrome / Toxic Epidermal Necrolysis (HLA-B*1502 screening recommended), hyponatraemia (SIADH), aplastic anaemia, hepatotoxicity, diplopia/ataxia, enzyme induction (CYP3A4), teratogenic (neural tube defects).", category: "Side Effects & ADRs", difficulty: 4 },
  { id: 27, front: "ADRs of Rifampicin", back: "Hepatotoxicity, orange-red discolouration of body fluids (tears, urine, sweat), potent CYP450 enzyme inducer (reduces efficacy of OCs, warfarin, HIV drugs), flu-like syndrome with intermittent dosing, thrombocytopenia.", category: "Side Effects & ADRs", difficulty: 3 },
  { id: 28, front: "Side effects of NSAIDs (e.g. Ibuprofen)", back: "GI ulceration/bleeding (COX-1 inhibition reduces protective prostaglandins), renal impairment, cardiovascular risk (MI, stroke - especially COX-2 selective), bronchospasm in aspirin-sensitive asthma, platelet dysfunction.", category: "Side Effects & ADRs", difficulty: 2 },
  { id: 29, front: "Adverse effects of Isoniazid (INH)", back: "Peripheral neuropathy (prevent with pyridoxine/Vitamin B6), hepatotoxicity (monitor LFTs), lupus-like syndrome, pyridoxine deficiency, drug-induced hepatitis. Slow acetylators at higher risk of toxicity.", category: "Side Effects & ADRs", difficulty: 3 },
  { id: 30, front: "ADRs of Fluoroquinolones", back: "Tendon rupture/tendinitis (especially Achilles, risk with age >60, steroids), QT prolongation, CNS effects (seizures, confusion), photosensitivity, dysglycaemia, peripheral neuropathy, aortic aneurysm risk. Avoid in children (cartilage damage).", category: "Side Effects & ADRs", difficulty: 3 },

  // --- Drug Interactions (9 cards) ---
  { id: 31, front: "Why is Warfarin + NSAIDs dangerous?", back: "NSAIDs inhibit platelet function (additive bleeding risk), can displace warfarin from protein binding, and cause GI ulceration. Combined = significantly increased risk of GI bleeding. Use paracetamol instead. If unavoidable, add PPI.", category: "Drug Interactions", difficulty: 2 },
  { id: 32, front: "Interaction: Metronidazole + Alcohol", back: "Disulfiram-like reaction: severe nausea, vomiting, flushing, headache, tachycardia, abdominal cramps. Metronidazole inhibits aldehyde dehydrogenase, causing acetaldehyde accumulation. Avoid alcohol during and 48 hours after treatment.", category: "Drug Interactions", difficulty: 2 },
  { id: 33, front: "Interaction: Ciprofloxacin + Antacids/Iron/Calcium", back: "Divalent and trivalent cations (Al3+, Mg2+, Ca2+, Fe2+/3+) form insoluble chelation complexes with fluoroquinolones, dramatically reducing absorption. Separate administration by at least 2 hours before or 4-6 hours after.", category: "Drug Interactions", difficulty: 2 },
  { id: 34, front: "Interaction: ACEIs/ARBs + Potassium-sparing diuretics", back: "Both increase serum potassium: ACEIs/ARBs reduce aldosterone; K-sparing diuretics block K+ excretion. Combined use risks life-threatening hyperkalaemia. Monitor K+ closely. Risk factors: renal impairment, diabetes, elderly.", category: "Drug Interactions", difficulty: 3 },
  { id: 35, front: "Interaction: Rifampicin + Oral Contraceptives", back: "Rifampicin is a potent inducer of CYP3A4 and P-glycoprotein. Dramatically reduces plasma levels of ethinylestradiol and progestogens, causing contraceptive failure. Advise alternative/additional contraception during and 4 weeks after TB treatment.", category: "Drug Interactions", difficulty: 2 },
  { id: 36, front: "Interaction: Simvastatin + Erythromycin", back: "Erythromycin inhibits CYP3A4, which metabolises simvastatin. Increased statin levels cause risk of rhabdomyolysis (muscle breakdown, myoglobinuria, acute renal failure). Use pravastatin/rosuvastatin instead (not CYP3A4 metabolised).", category: "Drug Interactions", difficulty: 3 },
  { id: 37, front: "Interaction: Methotrexate + Trimethoprim", back: "Both are antifolate drugs. Trimethoprim inhibits dihydrofolate reductase, potentiating methotrexate toxicity. Can cause severe pancytopenia and megaloblastic anaemia. Avoid combination; if necessary, increase folinic acid rescue.", category: "Drug Interactions", difficulty: 4 },
  { id: 38, front: "Interaction: Digoxin + Amiodarone", back: "Amiodarone inhibits P-glycoprotein and reduces renal clearance of digoxin, increasing digoxin levels by 70-100%. Reduce digoxin dose by 50% when starting amiodarone. Monitor digoxin levels and for toxicity signs.", category: "Drug Interactions", difficulty: 4 },
  { id: 39, front: "Interaction: SSRIs + MAOIs", back: "Contraindicated combination. Risk of Serotonin Syndrome: hyperthermia, rigidity, myoclonus, autonomic instability, mental status changes. Potentially fatal. Require 2-week washout between drugs (5 weeks for fluoxetine due to long half-life).", category: "Drug Interactions", difficulty: 3 },

  // --- Dosage Forms & Routes (9 cards) ---
  { id: 40, front: "Types of oral modified-release dosage forms", back: "Sustained-release (SR): slow continuous release. Enteric-coated (EC): resist gastric acid, dissolve in intestinal pH. Controlled-release (CR): zero-order kinetics. Extended-release (XR/XL): once daily dosing. Must NOT be crushed or chewed.", category: "Dosage Forms & Routes", difficulty: 2 },
  { id: 41, front: "What is bioavailability?", back: "Fraction of administered dose that reaches systemic circulation in unchanged form. IV = 100%. Oral bioavailability affected by: absorption, first-pass metabolism, drug stability in GI tract, P-glycoprotein efflux. Expressed as F (0-1 or 0-100%).", category: "Dosage Forms & Routes", difficulty: 2 },
  { id: 42, front: "Advantages of suppository dosage form", back: "Avoids first-pass metabolism (partially, lower rectum drains to systemic circulation), useful in vomiting/unconscious patients, local rectal action, suitable for paediatric/geriatric patients who cannot swallow, avoids GI irritation.", category: "Dosage Forms & Routes", difficulty: 2 },
  { id: 43, front: "What is an emulsion? Types?", back: "Two-phase system: immiscible liquids stabilised by emulsifying agent. Oil-in-Water (o/w): oil dispersed in water, washable, non-greasy (e.g. lotions). Water-in-Oil (w/o): water dispersed in oil, occlusive, greasy (e.g. cold cream). Test: dilution test, dye test.", category: "Dosage Forms & Routes", difficulty: 3 },
  { id: 44, front: "Routes of insulin administration", back: "Subcutaneous (SC) injection: most common, into abdomen/thigh/arm. IV: only regular/soluble insulin for DKA. Inhalation: Afrezza (rapid-acting). Insulin pump: continuous SC infusion. NOT given orally (destroyed by GI enzymes). Rotation of injection sites prevents lipodystrophy.", category: "Dosage Forms & Routes", difficulty: 2 },
  { id: 45, front: "What is a metered-dose inhaler (MDI)?", back: "Pressurised aerosol delivering precise drug dose to lungs. Contains drug, propellant (HFA), and surfactant. Requires coordination of actuation and inhalation. Spacer device improves delivery and reduces oropharyngeal deposition. Rinse mouth after corticosteroid MDIs.", category: "Dosage Forms & Routes", difficulty: 2 },
  { id: 46, front: "Difference between cream and ointment", back: "Cream: o/w or w/o emulsion, cosmetically elegant, washable, non-occlusive, suitable for moist/weeping lesions. Ointment: semi-solid greasy base (petrolatum), occlusive, better skin penetration, suitable for dry/scaly lesions, longer contact time. Ointments = more potent delivery.", category: "Dosage Forms & Routes", difficulty: 1 },
  { id: 47, front: "What is the transdermal route?", back: "Drug delivery through intact skin into systemic circulation via patches. Advantages: steady plasma levels, avoids first-pass metabolism, non-invasive, good compliance. Examples: fentanyl, nicotine, GTN patches. Limitations: only potent lipophilic drugs with low MW (<500 Da).", category: "Dosage Forms & Routes", difficulty: 2 },
  { id: 48, front: "What is lyophilisation (freeze-drying)?", back: "Process of removing water from a frozen product by sublimation under vacuum. Used for unstable drugs (proteins, vaccines, antibiotics). Produces porous cake that reconstitutes rapidly. Improves stability and shelf-life. Examples: reconstitutable injectable antibiotics.", category: "Dosage Forms & Routes", difficulty: 3 },

  // --- Pharmaceutical Calculations (8 cards) ---
  { id: 49, front: "Calculate: A patient needs 500mg amoxicillin. Suspension is 250mg/5mL. Volume to administer?", back: "Volume = (Dose needed / Concentration) = (500mg / 250mg) x 5mL = 10mL. Always use: Volume = (Required dose / Stock strength) x Volume of stock.", category: "Pharmaceutical Calculations", difficulty: 1 },
  { id: 50, front: "What does 1% w/v mean?", back: "1g of solute dissolved in 100mL of solution. So 1% w/v = 1g/100mL = 10mg/mL = 10,000mcg/mL. Example: 1% lidocaine = 10mg/mL. To find amount: multiply % by 10 to get mg/mL.", category: "Pharmaceutical Calculations", difficulty: 2 },
  { id: 51, front: "Calculate: IV infusion of dopamine 3mcg/kg/min for a 70kg patient. Stock: 200mg in 250mL D5W.", back: "Dose = 3 x 70 = 210 mcg/min. Stock conc = 200mg/250mL = 0.8mg/mL = 800mcg/mL. Rate = 210/800 = 0.2625 mL/min = 15.75 mL/hr. Round to 16 mL/hr on infusion pump.", category: "Pharmaceutical Calculations", difficulty: 4 },
  { id: 52, front: "Paediatric dose by Clark's Rule", back: "Child dose = (Weight in kg / 70) x Adult dose. Alternative (by weight in lbs): (Weight in lbs / 150) x Adult dose. Example: 25kg child, adult dose 500mg = (25/70) x 500 = 178.6mg. Note: BSA method (Mosteller) is more accurate.", category: "Pharmaceutical Calculations", difficulty: 2 },
  { id: 53, front: "Calculate drops/min: 1L NS over 8 hours (drop factor 20 drops/mL)", back: "Volume = 1000mL. Time = 8 x 60 = 480 min. Rate = 1000/480 = 2.083 mL/min. Drops/min = 2.083 x 20 = 41.67, round to 42 drops/min. Formula: (Volume x Drop factor) / (Time in minutes).", category: "Pharmaceutical Calculations", difficulty: 2 },
  { id: 54, front: "What is a millimole (mmol)? Convert 585mg NaCl to mmol.", back: "A millimole = molecular weight in mg. NaCl MW = 58.5. mmol = mass(mg)/MW = 585/58.5 = 10 mmol NaCl. Since NaCl dissociates fully: 10 mmol Na+ and 10 mmol Cl-. Normal saline (0.9%) contains ~154 mmol/L Na+.", category: "Pharmaceutical Calculations", difficulty: 3 },
  { id: 55, front: "Alligation method: Mix 95% and 50% alcohol to make 70%", back: "Draw alligation grid: 95 and 50 on left, 70 in centre. Parts of 95% = |50-70| = 20. Parts of 50% = |95-70| = 25. Ratio = 20:25 = 4:5. So mix 4 parts of 95% with 5 parts of 50% to get 70% alcohol.", category: "Pharmaceutical Calculations", difficulty: 3 },
  { id: 56, front: "Calculate BMI for a patient weighing 85kg, height 1.7m", back: "BMI = Weight(kg) / Height(m)^2 = 85 / (1.7)^2 = 85 / 2.89 = 29.4 kg/m^2. Classification: Underweight <18.5, Normal 18.5-24.9, Overweight 25-29.9, Obese >=30. This patient is Overweight (nearly obese).", category: "Pharmaceutical Calculations", difficulty: 1 },

  // --- Ghana Pharmacy Law & Ethics (9 cards) ---
  { id: 57, front: "Ghana FDA Act", back: "Public Health Act 2012, Act 851 - establishes FDA to regulate food, drugs, cosmetics, medical devices, household chemicals, tobacco, and clinical trials in Ghana. Replaced the Food and Drugs Law of 1992 (PNDCL 305B).", category: "Ghana Pharmacy Law & Ethics", difficulty: 2 },
  { id: 58, front: "Pharmacy Act of Ghana", back: "Pharmacy Act 1994, Act 489 - establishes the Pharmacy Council of Ghana to regulate pharmacy practice, education, and registration of pharmacists and pharmacy technicians. Defines who can compound, dispense, and sell drugs.", category: "Ghana Pharmacy Law & Ethics", difficulty: 2 },
  { id: 59, front: "Controlled substances regulation in Ghana", back: "Narcotic Drugs (Control, Enforcement and Sanctions) Act 1990, PNDCL 236 - controls narcotic drugs and psychotropic substances. NACOB (Narcotics Control Board, now NACOC) enforces. Schedules align with UN conventions. Penalties include imprisonment.", category: "Ghana Pharmacy Law & Ethics", difficulty: 3 },
  { id: 60, front: "Who can own a pharmacy in Ghana?", back: "Only a registered pharmacist can own/operate a retail pharmacy (Pharmacy Act 489). Must be licensed by the Pharmacy Council. Corporate ownership is restricted - pharmacist must hold controlling interest. Premises must meet Pharmacy Council standards.", category: "Ghana Pharmacy Law & Ethics", difficulty: 2 },
  { id: 61, front: "Ghana NHIS and pharmaceutical services", back: "National Health Insurance Scheme (Act 852, 2012) provides access to essential medicines on the National Health Insurance Medicines List (NHIML). Pharmacies/hospitals claim reimbursement from NHIA. Covers ~95% of disease burden in Ghana.", category: "Ghana Pharmacy Law & Ethics", difficulty: 3 },
  { id: 62, front: "What is the Ghana Essential Medicines List (EML)?", back: "Regularly updated list of medicines considered essential for the healthcare needs of Ghana's population. Based on WHO EML, adapted to local disease patterns (malaria, TB, HIV). Guides procurement, prescribing, and NHIS coverage. Compiled by MoH.", category: "Ghana Pharmacy Law & Ethics", difficulty: 2 },
  { id: 63, front: "Categories of drug outlets in Ghana", back: "Pharmacy (Class A): owned by pharmacist, sells all medicines. Wholesale pharmacy: pharmacist-owned wholesale. Chemical shop/OTC medicine seller (Class C): licensed to sell OTC medicines only, no prescription drugs. Hospital pharmacy: within health facilities.", category: "Ghana Pharmacy Law & Ethics", difficulty: 2 },
  { id: 64, front: "Professional ethics: Pharmacist's duty of confidentiality", back: "Pharmacists must maintain patient confidentiality regarding health information, medications, and conditions. Exceptions: patient consent, legal requirement, public health emergency, healthcare team communication for patient care. Breach = professional misconduct (Pharmacy Council Code of Ethics).", category: "Ghana Pharmacy Law & Ethics", difficulty: 2 },
  { id: 65, front: "Good Pharmacy Practice (GPP) standards in Ghana", back: "Pharmacy Council enforces GPP: proper storage conditions, temperature monitoring, adequate record-keeping, patient counselling, dispensing by qualified personnel, prescription documentation, adverse event reporting to FDA. Based on WHO/FIP joint guidelines.", category: "Ghana Pharmacy Law & Ethics", difficulty: 2 },

  // --- Tropical Disease Drugs (10 cards) ---
  { id: 66, front: "First-line treatment for uncomplicated malaria in Ghana", back: "Artemisinin-based Combination Therapy (ACT): Artesunate-Amodiaquine (AA) or Artemether-Lumefantrine (AL). Given for 3 days. Artemisinin component gives rapid parasite clearance; partner drug eliminates remaining parasites. Per Ghana National Malaria Treatment Guidelines.", category: "Tropical Disease Drugs", difficulty: 2 },
  { id: 67, front: "Treatment of severe/complicated malaria", back: "IV/IM Artesunate (first-line) for at least 24 hours until patient can take oral ACT. If unavailable: IV quinine. Pre-referral: rectal artesunate (especially children). Monitor for: cerebral malaria, severe anaemia, hypoglycaemia, respiratory distress, renal failure.", category: "Tropical Disease Drugs", difficulty: 3 },
  { id: 68, front: "First-line TB treatment regimen (Ghana)", back: "2RHZE/4RH - Intensive phase (2 months): Rifampicin, Isoniazid, Pyrazinamide, Ethambutol (daily). Continuation phase (4 months): Rifampicin, Isoniazid (daily). DOT (Directly Observed Therapy) recommended. Total = 6 months. Fixed-dose combinations used.", category: "Tropical Disease Drugs", difficulty: 3 },
  { id: 69, front: "Mass Drug Administration (MDA) for lymphatic filariasis in Ghana", back: "Annual MDA with Ivermectin + Albendazole in endemic areas (no onchocerciasis co-endemicity). In onchocerciasis co-endemic areas: Ivermectin + Albendazole. Targets Wuchereria bancrofti (main cause in Ghana). Goal: elimination by interrupting transmission.", category: "Tropical Disease Drugs", difficulty: 3 },
  { id: 70, front: "Drugs for amoebic dysentery", back: "Metronidazole 400-800mg TDS x 5-10 days (tissue amoebicide, kills trophozoites) FOLLOWED BY Diloxanide furoate 500mg TDS x 10 days (luminal amoebicide, eliminates cysts from gut). Both agents needed for complete cure of Entamoeba histolytica.", category: "Tropical Disease Drugs", difficulty: 3 },
  { id: 71, front: "Treatment of schistosomiasis (Bilharzia)", back: "Praziquantel: single oral dose 40mg/kg (S. mansoni, S. haematobium). Increases permeability of schistosome cell membrane to calcium, causing contraction, paralysis, and tegumental damage. WHO targets school-age children in endemic areas for MDA.", category: "Tropical Disease Drugs", difficulty: 2 },
  { id: 72, front: "Drugs used in onchocerciasis (river blindness)", back: "Ivermectin (Mectizan): single oral dose 150mcg/kg annually or semi-annually. Kills microfilariae (not adult worms). Free through Mectizan Donation Program. Doxycycline 100mg x 4-6 weeks kills Wolbachia endosymbiont, sterilising adult worms.", category: "Tropical Disease Drugs", difficulty: 3 },
  { id: 73, front: "Ghana first-line ART regimen for HIV", back: "Dolutegravir (DTG)-based: TDF + 3TC + DTG (Tenofovir + Lamivudine + Dolutegravir). Single pill fixed-dose combination available. DTG preferred over Efavirenz due to higher efficacy, higher genetic barrier to resistance, and fewer side effects. Per Ghana National ART Guidelines.", category: "Tropical Disease Drugs", difficulty: 3 },
  { id: 74, front: "Treatment of Buruli ulcer", back: "Rifampicin + Clarithromycin (oral) daily for 8 weeks (WHO recommended). Previously: Rifampicin + Streptomycin (injectable). Caused by Mycobacterium ulcerans. Surgery may be needed for extensive lesions. Common in Ghana, especially Ashanti and Central regions.", category: "Tropical Disease Drugs", difficulty: 4 },
  { id: 75, front: "Antimalarial chemoprophylaxis options for travelers to Ghana", back: "Atovaquone-Proguanil (Malarone): start 1-2 days before, daily during, 7 days after. Doxycycline: start 1-2 days before, daily during, 4 weeks after. Mefloquine: weekly, start 2 weeks before, 4 weeks after. Ghana = chloroquine-resistant area, so chloroquine NOT suitable.", category: "Tropical Disease Drugs", difficulty: 3 },
];

/* ------------------------------------------------------------------ */
/*  DECK CONFIGURATION                                                */
/* ------------------------------------------------------------------ */

const DECKS = [
  { name: "Drug Classifications", totalCards: 150, icon: "pills", color: "#C9A84C" },
  { name: "Mechanisms of Action", totalCards: 200, icon: "gear", color: "#E8D48B" },
  { name: "Side Effects & ADRs", totalCards: 180, icon: "warning", color: "#ef4444" },
  { name: "Drug Interactions", totalCards: 120, icon: "arrows", color: "#f59e0b" },
  { name: "Dosage Forms & Routes", totalCards: 100, icon: "capsule", color: "#3b82f6" },
  { name: "Pharmaceutical Calculations", totalCards: 80, icon: "calculator", color: "#8b5cf6" },
  { name: "Ghana Pharmacy Law & Ethics", totalCards: 90, icon: "scale", color: "#10b981" },
  { name: "Tropical Disease Drugs", totalCards: 100, icon: "globe", color: "#06b6d4" },
];

/* ------------------------------------------------------------------ */
/*  SVG ICONS                                                         */
/* ------------------------------------------------------------------ */

const Icons = {
  pills: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5m-4.75-11.396c.251.023.501.05.75.082M12 21a8.966 8.966 0 0 0 5.982-2.275M12 21a8.966 8.966 0 0 1-5.982-2.275" />
    </svg>
  ),
  gear: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
  warning: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  ),
  arrows: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  ),
  capsule: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
  ),
  calculator: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25v-.008Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007v-.008Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z" />
    </svg>
  ),
  scale: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" />
    </svg>
  ),
  globe: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.466.732-3.558" />
    </svg>
  ),
  flip: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
    </svg>
  ),
  back: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  ),
  plus: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  chart: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  ),
  keyboard: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5h10.5m-10.5 3h10.5m-10.5 3h4.5m-4.5 3h10.5M3.375 3h17.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125H3.375a1.125 1.125 0 0 1-1.125-1.125V4.125C2.25 3.504 2.754 3 3.375 3Z" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/*  DIFFICULTY LABELS                                                 */
/* ------------------------------------------------------------------ */

const difficultyConfig = {
  1: { label: "Beginner", color: "text-green-400", bg: "bg-green-400/10 border-green-400/20" },
  2: { label: "Easy", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  3: { label: "Medium", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  4: { label: "Hard", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20" },
  5: { label: "Expert", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
};

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                    */
/* ------------------------------------------------------------------ */

export default function Flashcards() {
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [customCards, setCustomCards] = useState([]);
  const [newCard, setNewCard] = useState({ front: "", back: "", category: "" });

  // Stats
  const [stats, setStats] = useState({
    studiedToday: 0,
    totalMastered: 0,
    streak: 0,
    accuracyRate: 0,
    dailyReviews: [0, 0, 0, 0, 0, 0, 0],
  });

  // Card ratings tracker
  const [ratings, setRatings] = useState({ again: 0, hard: 0, good: 0, easy: 0 });

  // Mastered counts per deck (starts at 0, updates as user studies)
  const [masteredCounts] = useState({
    "Drug Classifications": 0,
    "Mechanisms of Action": 0,
    "Side Effects & ADRs": 0,
    "Drug Interactions": 0,
    "Dosage Forms & Routes": 0,
    "Pharmaceutical Calculations": 0,
    "Ghana Pharmacy Law & Ethics": 0,
    "Tropical Disease Drugs": 0,
  });

  // Get cards for current deck
  const allCards = [...CARD_DATA, ...customCards];
  const deckCards = selectedDeck
    ? allCards.filter((c) => c.category === selectedDeck)
    : [];
  const currentCard = deckCards[currentIndex] || null;

  // Card counts for study mode
  const newCount = Math.max(0, deckCards.length - currentIndex - 1);
  const learningCount = ratings.again + ratings.hard;
  const reviewCount = ratings.good + ratings.easy;

  /* -- Flip card --------------------------------------------------- */
  const flipCard = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  /* -- Rate card --------------------------------------------------- */
  const rateCard = useCallback(
    (rating) => {
      setRatings((prev) => ({ ...prev, [rating]: prev[rating] + 1 }));
      setStats((prev) => ({
        ...prev,
        studiedToday: prev.studiedToday + 1,
        totalMastered: rating === "easy" || rating === "good" ? prev.totalMastered + 1 : prev.totalMastered,
        accuracyRate: Math.round(
          ((prev.accuracyRate * prev.studiedToday + (rating === "good" || rating === "easy" ? 100 : 0)) /
            (prev.studiedToday + 1))
        ),
      }));
      setIsFlipped(false);
      setTimeout(() => {
        if (currentIndex < deckCards.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          setCurrentIndex(0);
        }
      }, 200);
    },
    [currentIndex, deckCards.length]
  );

  /* -- Keyboard shortcuts ------------------------------------------ */
  useEffect(() => {
    if (!selectedDeck) return;
    const handler = (e) => {
      if (showCreateForm) return;
      if (e.code === "Space") {
        e.preventDefault();
        flipCard();
      }
      if (isFlipped) {
        if (e.key === "1") rateCard("again");
        if (e.key === "2") rateCard("hard");
        if (e.key === "3") rateCard("good");
        if (e.key === "4") rateCard("easy");
      }
      if (e.key === "ArrowRight" && !isFlipped) {
        setCurrentIndex((prev) => Math.min(prev + 1, deckCards.length - 1));
      }
      if (e.key === "ArrowLeft" && !isFlipped) {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedDeck, isFlipped, flipCard, rateCard, deckCards.length, showCreateForm]);

  /* -- Select deck ------------------------------------------------- */
  const selectDeck = (deckName) => {
    setSelectedDeck(deckName);
    setCurrentIndex(0);
    setIsFlipped(false);
    setRatings({ again: 0, hard: 0, good: 0, easy: 0 });
  };

  /* -- Back to decks ----------------------------------------------- */
  const backToDecks = () => {
    setSelectedDeck(null);
    setIsFlipped(false);
    setCurrentIndex(0);
  };

  /* -- Add custom card --------------------------------------------- */
  const addCustomCard = (e) => {
    e.preventDefault();
    if (!newCard.front.trim() || !newCard.back.trim() || !newCard.category) return;
    setCustomCards((prev) => [
      ...prev,
      {
        id: Date.now(),
        front: newCard.front.trim(),
        back: newCard.back.trim(),
        category: newCard.category,
        difficulty: 3,
      },
    ]);
    setNewCard({ front: "", back: "", category: "" });
    setShowCreateForm(false);
  };

  /* ---------------------------------------------------------------- */
  /*  RENDER: STUDY MODE                                              */
  /* ---------------------------------------------------------------- */

  if (selectedDeck) {
    const deckConfig = DECKS.find((d) => d.name === selectedDeck);
    const progress = deckCards.length > 0 ? ((currentIndex + 1) / deckCards.length) * 100 : 0;
    const avgDifficulty = deckCards.length > 0
      ? Math.round(deckCards.reduce((s, c) => s + c.difficulty, 0) / deckCards.length)
      : 3;

    return (
      <div className="min-h-screen bg-warm-50 dark:bg-gray-950 transition-colors duration-300">
        {/* Top Bar */}
        <div className="sticky top-0 z-20 bg-warm-50/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button
              onClick={backToDecks}
              className="flex items-center gap-2 text-sm font-body text-gray-600 dark:text-gray-400 hover:text-[#C9A84C] dark:hover:text-[#C9A84C] transition-colors"
            >
              {Icons.back}
              <span>Back to Decks</span>
            </button>
            <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white hidden sm:block">
              {selectedDeck}
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-body text-gray-500 dark:text-gray-400">
                {Icons.keyboard}
                <span className="hidden sm:inline">Space: Flip | 1-4: Rate</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Card Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-body">
                  <span className="text-gray-600 dark:text-gray-400">
                    Card {currentIndex + 1} of {deckCards.length}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-blue-500">New: {newCount}</span>
                    <span className="text-amber-500">Learning: {learningCount}</span>
                    <span className="text-green-500">Reviewed: {reviewCount}</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${progress}%`,
                      background: "linear-gradient(90deg, #C9A84C, #E8D48B)",
                    }}
                  />
                </div>
              </div>

              {/* Flashcard with flip animation */}
              <div
                className="relative w-full cursor-pointer"
                style={{ perspective: "1200px", minHeight: "340px" }}
                onClick={flipCard}
              >
                <div
                  className="relative w-full h-full transition-transform duration-[600ms] ease-in-out"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    minHeight: "340px",
                  }}
                >
                  {/* Front */}
                  <div
                    className="absolute inset-0 rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center text-center border border-gray-200 dark:border-gray-700/50 dark-glass"
                    style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                  >
                    {currentCard && (
                      <>
                        <div className="mb-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-body border ${difficultyConfig[currentCard.difficulty]?.bg || ""} ${difficultyConfig[currentCard.difficulty]?.color || ""}`}
                          >
                            {difficultyConfig[currentCard.difficulty]?.label || "Medium"}
                          </span>
                        </div>
                        <p className="gold-text font-display text-xl sm:text-2xl lg:text-3xl font-bold leading-relaxed">
                          {currentCard.front}
                        </p>
                        <p className="mt-6 text-sm text-gray-500 dark:text-gray-500 font-body flex items-center gap-2">
                          {Icons.flip} Click or press Space to reveal answer
                        </p>
                      </>
                    )}
                    {!currentCard && (
                      <p className="text-gray-400 dark:text-gray-500 font-body">
                        No cards in this deck yet. Add some custom cards!
                      </p>
                    )}
                  </div>

                  {/* Back */}
                  <div
                    className="absolute inset-0 rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center text-center border border-[#C9A84C]/30 dark:border-[#C9A84C]/20 bg-white dark:bg-gray-900"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    {currentCard && (
                      <>
                        <div className="mb-4 text-xs font-body text-[#C9A84C] uppercase tracking-wider">
                          Answer
                        </div>
                        <p className="text-gray-800 dark:text-gray-100 font-body text-base sm:text-lg leading-relaxed max-w-xl">
                          {currentCard.back}
                        </p>
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 w-full">
                          <p className="text-xs text-gray-400 dark:text-gray-500 font-body">
                            Category: {currentCard.category}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Rating Buttons */}
              <div
                className={`flex flex-wrap items-center justify-center gap-3 transition-all duration-300 ${
                  isFlipped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                }`}
              >
                <span className="text-xs text-gray-500 dark:text-gray-500 font-body mr-2">How well did you know this?</span>
                <button
                  onClick={(e) => { e.stopPropagation(); rateCard("again"); }}
                  className="px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 font-body text-sm font-medium transition-all"
                >
                  Again <span className="text-xs opacity-60 ml-1">(1)</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); rateCard("hard"); }}
                  className="px-5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 font-body text-sm font-medium transition-all"
                >
                  Hard <span className="text-xs opacity-60 ml-1">(2)</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); rateCard("good"); }}
                  className="px-5 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 hover:bg-green-500/20 font-body text-sm font-medium transition-all"
                >
                  Good <span className="text-xs opacity-60 ml-1">(3)</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); rateCard("easy"); }}
                  className="px-5 py-2.5 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 text-[#C9A84C] hover:bg-[#C9A84C]/20 font-body text-sm font-medium transition-all"
                >
                  Easy <span className="text-xs opacity-60 ml-1">(4)</span>
                </button>
              </div>

              {/* Navigation arrows (visible when not flipped) */}
              {!isFlipped && deckCards.length > 1 && (
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
                    disabled={currentIndex === 0}
                    className="p-2 rounded-lg text-gray-400 hover:text-[#C9A84C] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-body">
                    Use arrow keys to navigate
                  </span>
                  <button
                    onClick={() => setCurrentIndex((p) => Math.min(deckCards.length - 1, p + 1))}
                    disabled={currentIndex === deckCards.length - 1}
                    className="p-2 rounded-lg text-gray-400 hover:text-[#C9A84C] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar: Stats Panel */}
            <div className="space-y-6">
              {/* Session Stats */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-4">
                <h3 className="font-display text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {Icons.chart} Session Statistics
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3 text-center">
                    <p className="text-2xl font-display font-bold text-[#C9A84C]">{stats.studiedToday}</p>
                    <p className="text-xs font-body text-gray-500 dark:text-gray-400">Studied Today</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3 text-center">
                    <p className="text-2xl font-display font-bold text-green-500">{stats.totalMastered}</p>
                    <p className="text-xs font-body text-gray-500 dark:text-gray-400">Total Mastered</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3 text-center">
                    <p className="text-2xl font-display font-bold text-orange-500">{stats.streak}</p>
                    <p className="text-xs font-body text-gray-500 dark:text-gray-400">Day Streak</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3 text-center">
                    <p className="text-2xl font-display font-bold text-blue-500">{stats.accuracyRate}%</p>
                    <p className="text-xs font-body text-gray-500 dark:text-gray-400">Accuracy</p>
                  </div>
                </div>

                {/* Weekly Review Chart */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-body text-gray-500 dark:text-gray-400 mb-3">Daily Reviews (Last 7 Days)</p>
                  <div className="flex items-end justify-between gap-1.5 h-20">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                      const val = stats.dailyReviews[i];
                      const maxVal = Math.max(...stats.dailyReviews, 1);
                      const height = (val / maxVal) * 100;
                      return (
                        <div key={day} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full relative" style={{ height: "60px" }}>
                            <div
                              className="absolute bottom-0 w-full rounded-t transition-all duration-500"
                              style={{
                                height: `${height}%`,
                                background: i === 6 ? "#C9A84C" : "linear-gradient(to top, #C9A84C40, #C9A84C80)",
                                minHeight: val > 0 ? "4px" : "0px",
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-body text-gray-400">{day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Deck Info */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-3">
                <h3 className="font-display text-sm font-bold text-gray-900 dark:text-white">Deck Info</h3>
                <div className="space-y-2 text-sm font-body">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Total cards (loaded)</span>
                    <span className="font-medium text-gray-900 dark:text-white">{deckCards.length}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Full deck size</span>
                    <span className="font-medium text-gray-900 dark:text-white">{deckConfig?.totalCards || 0}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Avg. difficulty</span>
                    <span className={`font-medium ${difficultyConfig[avgDifficulty]?.color || ""}`}>
                      {difficultyConfig[avgDifficulty]?.label || "Medium"}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>This session</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {ratings.again + ratings.hard + ratings.good + ratings.easy} rated
                    </span>
                  </div>
                </div>
              </div>

              {/* Add Custom Card Button */}
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors font-body text-sm"
              >
                {Icons.plus}
                Add Custom Card
              </button>
            </div>
          </div>
        </div>

        {/* Create Card Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">Create Custom Card</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={addCustomCard} className="space-y-4">
                <div>
                  <label className="block text-sm font-body font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Front (Question/Term)
                  </label>
                  <textarea
                    value={newCard.front}
                    onChange={(e) => setNewCard((p) => ({ ...p, front: e.target.value }))}
                    rows={3}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm font-body text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C]"
                    placeholder="Enter the question or term..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-body font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Back (Answer/Definition)
                  </label>
                  <textarea
                    value={newCard.back}
                    onChange={(e) => setNewCard((p) => ({ ...p, back: e.target.value }))}
                    rows={4}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm font-body text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C]"
                    placeholder="Enter the answer or definition..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-body font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Category / Deck
                  </label>
                  <select
                    value={newCard.category}
                    onChange={(e) => setNewCard((p) => ({ ...p, category: e.target.value }))}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm font-body text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C]"
                    required
                  >
                    <option value="">Select a deck...</option>
                    {DECKS.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-body text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl text-sm font-body font-medium text-gray-900 transition-all hover:shadow-lg hover:shadow-[#C9A84C]/20"
                    style={{ background: "linear-gradient(135deg, #C9A84C, #E8D48B)" }}
                  >
                    Add Card
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  RENDER: DECK SELECTION (DEFAULT VIEW)                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-20 blur-3xl"
            style={{ background: "radial-gradient(ellipse, #C9A84C, transparent 70%)" }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm font-body text-gray-500 dark:text-gray-400 mb-6">
            <Link
              to="/learn"
              className="hover:text-[#C9A84C] transition-colors"
            >
              Academy
            </Link>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
            <span className="text-gray-900 dark:text-white font-medium">Flashcards</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                Pharmacy <span className="gold-text">Flashcards</span>
              </h1>
              <p className="mt-3 font-body text-gray-600 dark:text-gray-400 max-w-xl text-base sm:text-lg">
                1200+ cards with spaced repetition for long-term retention
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-body font-medium text-gray-900 transition-all hover:shadow-lg hover:shadow-[#C9A84C]/20 shrink-0"
              style={{ background: "linear-gradient(135deg, #C9A84C, #E8D48B)" }}
            >
              {Icons.plus}
              Create Card
            </button>
          </div>
        </div>
      </section>

      {/* Stats Overview Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Studied Today", value: stats.studiedToday, color: "#C9A84C" },
            { label: "Total Mastered", value: stats.totalMastered, color: "#10b981" },
            { label: "Day Streak", value: stats.streak, color: "#f59e0b" },
            { label: "Accuracy Rate", value: `${stats.accuracyRate}%`, color: "#3b82f6" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 text-center"
            >
              <p className="text-2xl font-display font-bold" style={{ color: s.color }}>
                {s.value}
              </p>
              <p className="text-xs font-body text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Deck Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-6">
          Choose a Deck
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {DECKS.map((deck) => {
            const mastered = masteredCounts[deck.name] || 0;
            const progressPct = (mastered / deck.totalCards) * 100;
            const deckCardCount = allCards.filter((c) => c.category === deck.name).length;
            const avgDiff = Math.round(
              allCards
                .filter((c) => c.category === deck.name)
                .reduce((sum, c) => sum + c.difficulty, 0) /
                Math.max(deckCardCount, 1)
            );

            return (
              <div
                key={deck.name}
                className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-[#C9A84C]/50 dark:hover:border-[#C9A84C]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#C9A84C]/5 overflow-hidden"
              >
                {/* Color strip */}
                <div className="h-1" style={{ background: deck.color }} />

                <div className="p-5 space-y-4">
                  {/* Icon + Title */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: `${deck.color}15`, color: deck.color }}
                      >
                        {Icons[deck.icon]}
                      </div>
                      <div>
                        <h3 className="font-display text-sm font-bold text-gray-900 dark:text-white leading-tight">
                          {deck.name}
                        </h3>
                        <p className="text-xs font-body text-gray-500 dark:text-gray-400 mt-0.5">
                          {deck.totalCards} cards
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-body px-2 py-0.5 rounded-full border ${difficultyConfig[avgDiff]?.bg || ""} ${difficultyConfig[avgDiff]?.color || ""}`}
                    >
                      {difficultyConfig[avgDiff]?.label || "Medium"}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-body">
                      <span className="text-gray-500 dark:text-gray-400">
                        {mastered} mastered
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {Math.round(progressPct)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${progressPct}%`,
                          background: deck.color,
                        }}
                      />
                    </div>
                  </div>

                  {/* Study Button */}
                  <button
                    onClick={() => selectDeck(deck.name)}
                    className="w-full py-2.5 rounded-xl text-sm font-body font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#C9A84C] hover:text-[#C9A84C] dark:hover:border-[#C9A84C] dark:hover:text-[#C9A84C] transition-all group-hover:border-[#C9A84C]/50 group-hover:text-[#C9A84C]"
                  >
                    Study ({deckCardCount} loaded)
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Weekly Review Chart */}
        <div className="mt-10 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            {Icons.chart} Weekly Review Activity
          </h3>
          <div className="flex items-end justify-between gap-2 sm:gap-4 h-32">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
              const val = stats.dailyReviews[i];
              const maxVal = Math.max(...stats.dailyReviews, 1);
              const height = (val / maxVal) * 100;
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-body text-gray-500 dark:text-gray-400">{val}</span>
                  <div className="w-full relative" style={{ height: "80px" }}>
                    <div
                      className="absolute bottom-0 w-full rounded-t-lg transition-all duration-700"
                      style={{
                        height: `${height}%`,
                        background:
                          i === 6
                            ? "linear-gradient(to top, #C9A84C, #E8D48B)"
                            : "linear-gradient(to top, #C9A84C30, #C9A84C60)",
                        minHeight: val > 0 ? "6px" : "0px",
                      }}
                    />
                  </div>
                  <span className="text-xs font-body text-gray-400 dark:text-gray-500">{day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Create Card Modal (from deck view) */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">Create Custom Card</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={addCustomCard} className="space-y-4">
              <div>
                <label className="block text-sm font-body font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Front (Question/Term)
                </label>
                <textarea
                  value={newCard.front}
                  onChange={(e) => setNewCard((p) => ({ ...p, front: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm font-body text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C]"
                  placeholder="Enter the question or term..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-body font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Back (Answer/Definition)
                </label>
                <textarea
                  value={newCard.back}
                  onChange={(e) => setNewCard((p) => ({ ...p, back: e.target.value }))}
                  rows={4}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm font-body text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C]"
                  placeholder="Enter the answer or definition..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-body font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Category / Deck
                </label>
                <select
                  value={newCard.category}
                  onChange={(e) => setNewCard((p) => ({ ...p, category: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm font-body text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C]"
                  required
                >
                  <option value="">Select a deck...</option>
                  {DECKS.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-body text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-sm font-body font-medium text-gray-900 transition-all hover:shadow-lg hover:shadow-[#C9A84C]/20"
                  style={{ background: "linear-gradient(135deg, #C9A84C, #E8D48B)" }}
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
