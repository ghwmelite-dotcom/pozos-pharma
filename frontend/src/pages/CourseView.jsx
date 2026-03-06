import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";

const COURSES = {
  "pharmacology-1": {
    id: "pharmacology-1",
    title: "Pharmacology I",
    description:
      "A foundational course covering the principles of drug action, pharmacokinetics, pharmacodynamics, and the major drug classes used in clinical practice across Ghana and West Africa.",
    estimatedTime: "6 hours",
    lessons: [
      {
        id: "pharm1-L1",
        title: "Introduction to Pharmacology",
        duration: "45 min",
        content: `Pharmacology is the science of drugs and their interactions with living systems. It encompasses the study of drug composition, properties, mechanisms of action, and therapeutic applications. For pharmacy students in Ghana, a strong pharmacological foundation is essential given the diverse disease burden the country faces, including malaria, hypertension, diabetes, and infectious diseases.\n\nThe discipline is broadly divided into pharmacokinetics (what the body does to the drug) and pharmacodynamics (what the drug does to the body). Understanding these two pillars allows pharmacists to predict drug behaviour, optimise dosing regimens, and minimise adverse effects. The Pharmacy Council of Ghana mandates pharmacology as a core competency area for all registered pharmacists.\n\nIn this introductory lesson, we establish the vocabulary and conceptual framework that will guide the rest of the course. Key terms such as agonist, antagonist, efficacy, potency, and therapeutic index will be defined and contextualised with examples drawn from commonly dispensed medications in Ghanaian community pharmacies.`,
        keyPoints: [
          "Pharmacology is divided into pharmacokinetics and pharmacodynamics",
          "Agonists activate receptors while antagonists block them",
          "The therapeutic index measures the safety margin of a drug",
          "Ghana's Pharmacy Council requires pharmacology as a core competency",
        ],
        quiz: [
          {
            question: "What does pharmacokinetics primarily study?",
            options: [
              "How drugs affect the body",
              "How the body affects drugs",
              "How drugs are manufactured",
              "How drugs are marketed",
            ],
            correctIndex: 1,
          },
          {
            question: "A drug with a high therapeutic index is considered:",
            options: ["More dangerous", "Less effective", "Safer", "More expensive"],
            correctIndex: 2,
          },
          {
            question: "An antagonist drug:",
            options: [
              "Activates a receptor to produce a response",
              "Blocks a receptor and prevents activation",
              "Has no interaction with receptors",
              "Only works on enzymes",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "pharm1-L2",
        title: "Pharmacokinetics: Absorption & Distribution",
        duration: "50 min",
        content: `Drug absorption is the process by which a drug moves from its site of administration into the systemic circulation. The oral route is the most common in Ghanaian healthcare settings due to patient convenience and cost-effectiveness. Factors affecting oral absorption include gastric pH, intestinal motility, food interactions, and the physicochemical properties of the drug molecule itself.\n\nBioavailability is a critical pharmacokinetic parameter defined as the fraction of an administered dose that reaches systemic circulation in unchanged form. Intravenous administration provides 100% bioavailability by definition. First-pass metabolism in the liver can significantly reduce bioavailability of orally administered drugs such as propranolol and morphine, which is particularly relevant when counselling patients on why oral doses may be higher than parenteral doses.\n\nDrug distribution refers to the reversible transfer of drug from the blood to the tissues. The volume of distribution (Vd) is a theoretical parameter that relates the total amount of drug in the body to its plasma concentration. Highly lipophilic drugs like diazepam have large Vd values, distributing extensively into adipose tissue. Plasma protein binding, particularly to albumin, affects the free fraction of drug available for pharmacological action.`,
        keyPoints: [
          "Bioavailability measures the fraction of drug reaching systemic circulation",
          "First-pass metabolism reduces oral bioavailability of many drugs",
          "Volume of distribution (Vd) relates total body drug to plasma concentration",
          "Only unbound (free) drug is pharmacologically active",
        ],
        quiz: [
          {
            question: "Which route of administration has 100% bioavailability?",
            options: ["Oral", "Sublingual", "Intravenous", "Rectal"],
            correctIndex: 2,
          },
          {
            question: "First-pass metabolism primarily occurs in the:",
            options: ["Kidneys", "Liver", "Lungs", "Stomach"],
            correctIndex: 1,
          },
          {
            question: "A drug with a very large volume of distribution is likely:",
            options: [
              "Confined to the plasma",
              "Highly water-soluble",
              "Extensively distributed into tissues",
              "Rapidly excreted",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "pharm1-L3",
        title: "Pharmacokinetics: Metabolism & Excretion",
        duration: "50 min",
        content: `Drug metabolism (biotransformation) converts lipophilic drug molecules into more hydrophilic metabolites that can be excreted by the kidneys. The liver is the principal organ of drug metabolism, with the cytochrome P450 (CYP) enzyme superfamily playing a central role. CYP3A4 is the most abundant hepatic CYP enzyme and metabolises approximately 50% of all clinically used drugs.\n\nPhase I reactions (oxidation, reduction, hydrolysis) introduce or unmask a functional group, often mediated by CYP enzymes. Phase II reactions (conjugation) attach a polar endogenous molecule such as glucuronic acid, sulfate, or glutathione to the drug or its Phase I metabolite. Some drugs are prodrugs that require metabolic activation; codeine, for example, is demethylated by CYP2D6 to morphine for analgesic effect. Pharmacogenomic variations in CYP2D6 are prevalent in West African populations, affecting the metabolism of codeine, tamoxifen, and several antidepressants.\n\nRenal excretion is the major route of drug elimination. It involves glomerular filtration, active tubular secretion, and passive tubular reabsorption. Drugs primarily eliminated by the kidneys, such as metformin and gentamicin, require dose adjustment in patients with impaired renal function. The Cockcroft-Gault equation is commonly used in Ghanaian clinical practice to estimate creatinine clearance for such adjustments.`,
        keyPoints: [
          "CYP3A4 metabolises about 50% of all clinically used drugs",
          "Phase I reactions modify the drug; Phase II reactions conjugate it",
          "CYP2D6 polymorphisms in West African populations affect drug response",
          "Renal dose adjustments require estimation of creatinine clearance",
        ],
        quiz: [
          {
            question: "Which CYP enzyme is most abundant in the human liver?",
            options: ["CYP1A2", "CYP2D6", "CYP3A4", "CYP2C19"],
            correctIndex: 2,
          },
          {
            question: "Phase II metabolism involves:",
            options: [
              "Oxidation reactions only",
              "Conjugation with polar molecules",
              "Reduction reactions only",
              "Hydrolysis of ester bonds",
            ],
            correctIndex: 1,
          },
          {
            question: "Which drug requires dose adjustment in renal impairment?",
            options: ["Metformin", "Diazepam", "Warfarin", "Phenytoin"],
            correctIndex: 0,
          },
        ],
      },
      {
        id: "pharm1-L4",
        title: "Pharmacodynamics: Receptors & Signal Transduction",
        duration: "45 min",
        content: `Pharmacodynamics examines the biochemical and physiological effects of drugs on the body. Most drugs produce their effects by interacting with specific macromolecular targets known as receptors. The four major receptor superfamilies are ligand-gated ion channels, G-protein-coupled receptors (GPCRs), enzyme-linked receptors, and nuclear receptors. GPCRs are the largest family and are targets for approximately 34% of all FDA-approved drugs.\n\nDrug-receptor interactions follow the law of mass action. Affinity describes how tightly a drug binds to its receptor, while efficacy describes the ability of the drug-receptor complex to produce a biological response. A full agonist has high efficacy, a partial agonist has intermediate efficacy, and an antagonist has zero efficacy despite having affinity. Dose-response curves graphically represent these relationships and are essential tools for comparing drug potency and efficacy.\n\nSignal transduction cascades amplify receptor activation into cellular responses. For example, beta-adrenergic receptor stimulation activates the Gs-adenylyl cyclase-cAMP-PKA pathway, increasing heart rate and contractility. Understanding these pathways is critical for predicting both therapeutic effects and adverse reactions of drugs commonly prescribed in Ghanaian hospitals, such as salbutamol for asthma and atenolol for hypertension.`,
        keyPoints: [
          "GPCRs are the largest receptor family and target of ~34% of approved drugs",
          "Affinity refers to binding strength; efficacy refers to response magnitude",
          "Dose-response curves compare drug potency and efficacy visually",
          "Signal transduction amplifies receptor activation into cellular effects",
        ],
        quiz: [
          {
            question: "Which receptor superfamily is the most common drug target?",
            options: [
              "Ligand-gated ion channels",
              "G-protein-coupled receptors",
              "Enzyme-linked receptors",
              "Nuclear receptors",
            ],
            correctIndex: 1,
          },
          {
            question: "A partial agonist has:",
            options: ["Zero efficacy", "Maximal efficacy", "Intermediate efficacy", "No affinity"],
            correctIndex: 2,
          },
          {
            question: "Beta-adrenergic receptor activation increases intracellular:",
            options: ["cGMP", "cAMP", "Calcium only", "IP3 only"],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "pharm1-L5",
        title: "Autonomic Nervous System Pharmacology",
        duration: "55 min",
        content: `The autonomic nervous system (ANS) regulates involuntary physiological functions through its sympathetic and parasympathetic divisions. Drugs that modulate ANS activity are among the most widely prescribed medications in Ghana, treating conditions from hypertension and asthma to peptic ulcer disease and glaucoma.\n\nCholinergic drugs act on muscarinic and nicotinic receptors. Direct-acting muscarinic agonists like pilocarpine are used topically for glaucoma, while indirect-acting agents like neostigmine inhibit acetylcholinesterase and are used in myasthenia gravis. Atropine, a muscarinic antagonist, is used for bradycardia and as a preanaesthetic medication. In Ghana, organophosphate poisoning from agricultural pesticide exposure is a clinical scenario where atropine is life-saving.\n\nAdrenergic pharmacology involves catecholamines and their receptors. Adrenaline (epinephrine) acts on alpha and beta receptors and is the drug of choice for anaphylaxis. Selective beta-2 agonists such as salbutamol are the mainstay of acute asthma management. Alpha-1 blockers like prazosin and beta-blockers like atenolol and propranolol are important antihypertensives. Understanding receptor selectivity is key to predicting therapeutic effects and side effects of these agents.`,
        keyPoints: [
          "The ANS has sympathetic (adrenergic) and parasympathetic (cholinergic) divisions",
          "Atropine is critical in organophosphate poisoning management",
          "Adrenaline is first-line treatment for anaphylaxis",
          "Receptor selectivity determines drug specificity and side-effect profile",
        ],
        quiz: [
          {
            question: "Which drug is first-line for anaphylaxis?",
            options: ["Atropine", "Salbutamol", "Adrenaline (Epinephrine)", "Prazosin"],
            correctIndex: 2,
          },
          {
            question: "Organophosphate poisoning is treated with:",
            options: ["Pilocarpine", "Neostigmine", "Atropine", "Propranolol"],
            correctIndex: 2,
          },
          {
            question: "Salbutamol selectively stimulates which receptor?",
            options: ["Alpha-1", "Alpha-2", "Beta-1", "Beta-2"],
            correctIndex: 3,
          },
        ],
      },
      {
        id: "pharm1-L6",
        title: "Antimalarial Pharmacology",
        duration: "50 min",
        content: `Malaria remains the leading cause of outpatient visits in Ghana, making antimalarial pharmacology essential knowledge for every Ghanaian pharmacist. Plasmodium falciparum is the predominant species, responsible for severe and potentially fatal disease. The Ghana Health Service recommends artemisinin-based combination therapy (ACT) as first-line treatment for uncomplicated malaria, with artesunate-amodiaquine and artemether-lumefantrine being the most commonly used combinations.\n\nArtemisinin derivatives (artesunate, artemether, dihydroartemisinin) are sesquiterpene lactones that contain an endoperoxide bridge essential for antimalarial activity. They are the most rapidly acting blood schizonticides available, reducing parasite biomass by approximately 10,000-fold per asexual cycle. Their mechanism involves iron-mediated generation of free radicals within the parasite. To prevent resistance, artemisinins must always be used in combination with a longer-acting partner drug.\n\nFor malaria chemoprophylaxis in Ghana, options include atovaquone-proguanil, doxycycline, and mefloquine. Sulfadoxine-pyrimethamine (SP) is used for intermittent preventive treatment in pregnancy (IPTp) as recommended by the WHO and adopted by Ghana's National Malaria Control Programme. Pharmacists play a vital role in counselling patients on correct dosing, the importance of completing the full course, and recognising danger signs of severe malaria.`,
        keyPoints: [
          "ACT is first-line treatment for uncomplicated P. falciparum malaria in Ghana",
          "Artemisinins reduce parasite load by ~10,000-fold per cycle",
          "Artemisinins must be combined with partner drugs to prevent resistance",
          "SP is used for intermittent preventive treatment in pregnancy (IPTp)",
        ],
        quiz: [
          {
            question: "What is the first-line treatment for uncomplicated malaria in Ghana?",
            options: [
              "Chloroquine alone",
              "Artemisinin-based combination therapy (ACT)",
              "Quinine alone",
              "Sulfadoxine-pyrimethamine alone",
            ],
            correctIndex: 1,
          },
          {
            question: "Why must artemisinins be used in combination therapy?",
            options: [
              "They are too expensive alone",
              "To prevent resistance development",
              "They are not effective alone",
              "They cause severe side effects alone",
            ],
            correctIndex: 1,
          },
          {
            question: "Which drug is used for malaria prevention in pregnancy in Ghana?",
            options: ["Artesunate", "Mefloquine", "Sulfadoxine-pyrimethamine (SP)", "Chloroquine"],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "pharm1-L7",
        title: "Antihypertensive Agents",
        duration: "50 min",
        content: `Hypertension is a major public health challenge in Ghana, with an estimated prevalence of 30-35% in the adult population. The Ghana Hypertension Guidelines align closely with international recommendations, emphasising lifestyle modifications alongside pharmacotherapy. First-line antihypertensive classes include thiazide diuretics, calcium channel blockers (CCBs), angiotensin-converting enzyme (ACE) inhibitors, and angiotensin receptor blockers (ARBs).\n\nCalcium channel blockers such as amlodipine are particularly effective in patients of African descent and are widely used in Ghana. They inhibit L-type calcium channels in vascular smooth muscle, causing vasodilation and reducing peripheral resistance. ACE inhibitors (enalapril, lisinopril) and ARBs (losartan, valsartan) block the renin-angiotensin-aldosterone system and are preferred when there is concomitant diabetes or chronic kidney disease. The dry cough associated with ACE inhibitors is a common reason for switching to ARBs.\n\nThiazide diuretics (hydrochlorothiazide, bendroflumethiazide) reduce blood volume and are cost-effective options available on the National Health Insurance Scheme (NHIS) medicines list. Beta-blockers are no longer first-line for uncomplicated hypertension but remain important for patients with concurrent heart failure or post-myocardial infarction. Combination therapy is frequently required to achieve target blood pressure, and fixed-dose combinations improve adherence.`,
        keyPoints: [
          "Hypertension prevalence in Ghana is estimated at 30-35% in adults",
          "CCBs like amlodipine are particularly effective in African-descent patients",
          "ACE inhibitors are preferred with comorbid diabetes or CKD",
          "Fixed-dose combinations improve medication adherence",
        ],
        quiz: [
          {
            question: "Which antihypertensive class is especially effective in patients of African descent?",
            options: ["Beta-blockers", "ACE inhibitors", "Calcium channel blockers", "Alpha-blockers"],
            correctIndex: 2,
          },
          {
            question: "A common side effect of ACE inhibitors is:",
            options: ["Ankle swelling", "Dry cough", "Hyperkalaemia diarrhoea", "Weight gain"],
            correctIndex: 1,
          },
          {
            question: "Why are fixed-dose combinations preferred in hypertension management?",
            options: [
              "They are always cheaper",
              "They improve medication adherence",
              "They have fewer side effects",
              "They are available OTC",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "pharm1-L8",
        title: "Antibiotic Pharmacology & Stewardship",
        duration: "55 min",
        content: `Antimicrobial resistance (AMR) is a growing threat in Ghana, driven by factors including over-the-counter antibiotic sales, self-medication, and substandard or counterfeit products. Understanding antibiotic pharmacology and stewardship principles is therefore critical for Ghanaian pharmacists. The Ghana National Action Plan on AMR provides a framework for combating resistance.\n\nBeta-lactam antibiotics (penicillins, cephalosporins, carbapenems) remain the most widely prescribed class. They inhibit bacterial cell wall synthesis by binding to penicillin-binding proteins (PBPs). Amoxicillin is the most commonly dispensed antibiotic in Ghanaian pharmacies, used for respiratory and urinary tract infections. Co-amoxiclav (amoxicillin-clavulanate) extends the spectrum by inhibiting beta-lactamase enzymes. Cephalosporins are classified by generation, with third-generation agents like ceftriaxone reserved for serious infections.\n\nFluoroquinolones (ciprofloxacin, levofloxacin) inhibit DNA gyrase and topoisomerase IV. While effective against gram-negative organisms, their overuse has led to rising resistance rates. Macrolides (azithromycin, erythromycin) inhibit protein synthesis at the 50S ribosomal subunit. Antibiotic stewardship requires pharmacists to promote rational use, verify indications and durations, check local resistance patterns, and educate patients on the importance of completing prescribed courses while discouraging antibiotic stockpiling.`,
        keyPoints: [
          "AMR is a critical public health threat in Ghana driven by OTC antibiotic misuse",
          "Beta-lactams inhibit cell wall synthesis via penicillin-binding proteins",
          "Clavulanate extends amoxicillin's spectrum by inhibiting beta-lactamase",
          "Pharmacists must champion antibiotic stewardship and rational prescribing",
        ],
        quiz: [
          {
            question: "Beta-lactam antibiotics work by inhibiting:",
            options: ["Protein synthesis", "DNA replication", "Cell wall synthesis", "Folic acid synthesis"],
            correctIndex: 2,
          },
          {
            question: "What is the role of clavulanate in co-amoxiclav?",
            options: [
              "It enhances absorption of amoxicillin",
              "It inhibits beta-lactamase enzymes",
              "It broadens gram-positive coverage",
              "It reduces side effects",
            ],
            correctIndex: 1,
          },
          {
            question: "A key driver of antimicrobial resistance in Ghana is:",
            options: [
              "Excessive hospital use only",
              "Over-the-counter antibiotic sales and self-medication",
              "Too few antibiotics on the market",
              "Climate change",
            ],
            correctIndex: 1,
          },
        ],
      },
    ],
  },
  "pharma-chemistry": {
    id: "pharma-chemistry",
    title: "Pharmaceutical Chemistry",
    description:
      "Explore the chemical basis of drug design, structure-activity relationships, and quality assurance of pharmaceutical products relevant to the Ghanaian drug market.",
    estimatedTime: "4.5 hours",
    lessons: [
      {
        id: "pchem-L1",
        title: "Drug Design & Structure-Activity Relationships",
        duration: "45 min",
        content: `Structure-activity relationships (SAR) form the cornerstone of rational drug design. SAR studies systematically modify a lead compound's chemical structure and evaluate the resulting changes in biological activity. This approach allows medicinal chemists to optimise potency, selectivity, and pharmacokinetic properties while minimising toxicity.\n\nThe pharmacophore is the ensemble of steric and electronic features necessary for optimal interaction with a specific biological target. For example, the beta-lactam ring is the pharmacophore of penicillin antibiotics; its integrity is essential for antibacterial activity. Modifications to the side chain alter the spectrum of activity and resistance to beta-lactamases, leading to semi-synthetic penicillins like amoxicillin and flucloxacillin.\n\nComputer-aided drug design (CADD) has revolutionised the drug discovery process. Molecular docking, quantitative SAR (QSAR), and virtual screening enable researchers to predict binding affinities and biological activities before synthesis. These tools are increasingly accessible to African pharmaceutical researchers, with institutions like KNUST and the University of Ghana contributing to drug discovery efforts targeting tropical diseases prevalent on the continent.`,
        keyPoints: [
          "SAR studies link chemical structure modifications to changes in drug activity",
          "The pharmacophore is the minimum structural feature required for activity",
          "Computer-aided drug design predicts activity before synthesis",
          "Ghanaian institutions contribute to drug discovery for tropical diseases",
        ],
        quiz: [
          {
            question: "A pharmacophore is best described as:",
            options: [
              "The complete molecular structure of a drug",
              "The minimum structural features needed for biological activity",
              "The brand name of a drug",
              "The metabolite of a drug",
            ],
            correctIndex: 1,
          },
          {
            question: "The essential structural feature of penicillins is the:",
            options: ["Thiazolidine ring", "Beta-lactam ring", "Imidazole ring", "Pyridine ring"],
            correctIndex: 1,
          },
          {
            question: "QSAR stands for:",
            options: [
              "Quality Standard Analytical Review",
              "Quantitative Structure-Activity Relationship",
              "Qualitative Structural Analysis Report",
              "Quick Screening Assay Result",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "pchem-L2",
        title: "Stereochemistry in Drug Action",
        duration: "45 min",
        content: `Stereochemistry profoundly influences drug action because biological receptors are inherently chiral. Enantiomers, which are non-superimposable mirror images, can exhibit dramatically different pharmacological profiles. The classic tragic example is thalidomide: the (R)-enantiomer is a sedative, while the (S)-enantiomer is teratogenic.\n\nMany commonly dispensed drugs in Ghana are racemic mixtures. Omeprazole, a proton pump inhibitor widely used for peptic ulcer disease, is marketed as a racemate. Its S-enantiomer, esomeprazole, offers improved bioavailability due to lower first-pass metabolism. Similarly, the S-enantiomer of amlodipine (levamlodipine) retains the antihypertensive activity while reducing peripheral oedema.\n\nChiral resolution and asymmetric synthesis are methods used to obtain single enantiomers. Regulatory agencies increasingly require pharmaceutical companies to evaluate individual enantiomers during drug development. For Ghanaian pharmacists, understanding stereochemistry is essential when counselling patients about differences between branded and generic products, particularly when switching between racemic and enantiopure formulations.`,
        keyPoints: [
          "Enantiomers can have completely different pharmacological effects",
          "Biological receptors are chiral and distinguish between enantiomers",
          "Esomeprazole is the S-enantiomer of omeprazole with improved bioavailability",
          "Regulatory agencies now require evaluation of individual enantiomers",
        ],
        quiz: [
          {
            question: "Enantiomers are molecules that are:",
            options: [
              "Identical in all properties",
              "Non-superimposable mirror images",
              "Structural isomers",
              "Different compounds entirely",
            ],
            correctIndex: 1,
          },
          {
            question: "Which enantiomer of thalidomide caused birth defects?",
            options: ["(R)-enantiomer", "(S)-enantiomer", "Both equally", "Neither"],
            correctIndex: 1,
          },
          {
            question: "Esomeprazole compared to racemic omeprazole has:",
            options: [
              "Lower bioavailability",
              "Improved bioavailability",
              "Identical bioavailability",
              "No clinical use",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "pchem-L3",
        title: "Analytical Methods in Drug Quality Control",
        duration: "50 min",
        content: `Drug quality control ensures that pharmaceutical products meet predefined specifications for identity, purity, potency, and stability. In Ghana, the Food and Drugs Authority (FDA) oversees post-market surveillance, and pharmacists must understand the analytical techniques used to detect substandard and falsified medicines, which remain a significant challenge across West Africa.\n\nHigh-performance liquid chromatography (HPLC) is the gold standard for assay and purity testing of pharmaceutical products. It separates drug substances and their impurities based on differential interactions with a stationary phase. UV-Vis spectrophotometry is a cost-effective and widely available method used for identification and quantitative assays, relying on the Beer-Lambert law. Thin-layer chromatography (TLC) serves as a rapid screening tool for drug identity in resource-limited settings.\n\nDissolution testing evaluates how quickly a drug substance is released from its dosage form and is critical for ensuring bioequivalence of generic products. Ghana's FDA requires comparative dissolution studies for generic registration. Pharmacopeial standards from the British Pharmacopoeia (BP), United States Pharmacopeia (USP), and the International Pharmacopoeia (Ph.Int.) provide the reference methods and acceptance criteria used in Ghanaian quality control laboratories.`,
        keyPoints: [
          "HPLC is the gold standard for drug purity and assay testing",
          "TLC is useful for rapid drug identity screening in resource-limited settings",
          "Dissolution testing is essential for demonstrating bioequivalence of generics",
          "Ghana FDA requires comparative dissolution studies for generic registration",
        ],
        quiz: [
          {
            question: "Which technique is the gold standard for drug assay?",
            options: [
              "Thin-layer chromatography",
              "UV spectrophotometry",
              "High-performance liquid chromatography",
              "Infrared spectroscopy",
            ],
            correctIndex: 2,
          },
          {
            question: "Dissolution testing is primarily used to:",
            options: [
              "Identify unknown drugs",
              "Evaluate drug release from dosage forms",
              "Measure drug toxicity",
              "Determine drug structure",
            ],
            correctIndex: 1,
          },
          {
            question: "Which pharmacopoeia is commonly referenced in Ghana?",
            options: [
              "Japanese Pharmacopoeia only",
              "European Pharmacopoeia only",
              "British Pharmacopoeia and USP",
              "Chinese Pharmacopoeia only",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "pchem-L4",
        title: "Chemistry of Anti-infective Agents",
        duration: "50 min",
        content: `Anti-infective agents constitute the largest category of drugs dispensed in Ghanaian pharmacies due to the high burden of infectious diseases. Understanding their chemistry is essential for predicting spectrum of activity, mechanisms of resistance, and drug stability. The chemical structures of antibiotics directly determine their interactions with bacterial targets.\n\nThe beta-lactam nucleus (azetidinone ring) is a four-membered cyclic amide shared by penicillins, cephalosporins, carbapenems, and monobactams. This strained ring is responsible for acylating the active-site serine of penicillin-binding proteins. Modifications to the side chain at position 6 (penicillins) or position 7 (cephalosporins) alter gram-positive vs. gram-negative coverage, acid stability, and beta-lactamase resistance.\n\nAminoglycosides (gentamicin, amikacin) are polybasic sugars linked by glycosidic bonds. Their polycationic nature at physiological pH drives binding to the 30S ribosomal subunit and explains their poor oral absorption and nephrotoxic potential. Fluoroquinolones contain a bicyclic aromatic core with a fluorine at position 6 (critical for DNA gyrase binding) and a piperazine ring at position 7 (enhancing gram-negative activity). The chelation of fluoroquinolones with divalent cations (Ca2+, Mg2+, Fe2+) is a clinically significant drug-food interaction that pharmacists must counsel patients about.`,
        keyPoints: [
          "The beta-lactam ring is a strained four-membered cyclic amide essential for activity",
          "Side-chain modifications determine spectrum and resistance profiles of beta-lactams",
          "Aminoglycoside polycationic nature causes poor oral absorption and nephrotoxicity",
          "Fluoroquinolone chelation with cations is a key drug-food interaction",
        ],
        quiz: [
          {
            question: "The beta-lactam ring is a:",
            options: ["Six-membered ring", "Five-membered ring", "Four-membered cyclic amide", "Three-membered ring"],
            correctIndex: 2,
          },
          {
            question: "Aminoglycosides have poor oral absorption because:",
            options: [
              "They are lipophilic",
              "They are polycationic and highly polar",
              "They are rapidly metabolised in the gut",
              "They are destroyed by stomach acid",
            ],
            correctIndex: 1,
          },
          {
            question: "Fluoroquinolones should not be taken with antacids because of:",
            options: [
              "pH-dependent absorption",
              "Chelation with divalent cations",
              "Enzyme induction",
              "Protein binding displacement",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "pchem-L5",
        title: "Drug Stability & Degradation Pathways",
        duration: "45 min",
        content: `Drug stability refers to the ability of a pharmaceutical product to retain its chemical, physical, microbiological, and biopharmaceutical properties within specified limits throughout its shelf life. In tropical climates like Ghana's, high temperature and humidity accelerate degradation, making stability studies particularly critical. ICH Stability Guidelines Zone IVb (hot and humid) applies to Ghana and other tropical countries.\n\nHydrolysis is the most common chemical degradation pathway, affecting drugs containing ester, amide, or lactam bonds. Aspirin undergoes hydrolysis to salicylic acid (producing a vinegary smell), and the beta-lactam ring in penicillins is susceptible to hydrolytic cleavage. Oxidation is another major pathway, affecting drugs like adrenaline (forming adrenochrome) and morphine. Antioxidants such as sodium metabisulfite and BHT are commonly added to formulations to retard oxidation.\n\nPhotodegradation affects light-sensitive drugs like nifedipine and nitroprusside, necessitating amber-coloured containers or opaque packaging. Pharmacists in Ghana must be particularly vigilant about storage conditions, as power outages can disrupt cold-chain integrity for heat-sensitive products like insulin and some reconstituted antibiotics. Proper patient counselling on storage at the point of dispensing is a critical pharmaceutical care activity.`,
        keyPoints: [
          "Ghana falls under ICH Zone IVb (hot and humid) for stability testing",
          "Hydrolysis is the most common chemical degradation pathway for drugs",
          "Aspirin hydrolysis produces salicylic acid and a characteristic vinegar smell",
          "Power outages in Ghana pose risks to cold-chain-dependent medications",
        ],
        quiz: [
          {
            question: "Ghana falls under which ICH stability zone?",
            options: ["Zone I", "Zone II", "Zone III", "Zone IVb"],
            correctIndex: 3,
          },
          {
            question: "The most common chemical degradation pathway for drugs is:",
            options: ["Oxidation", "Hydrolysis", "Photodegradation", "Polymerisation"],
            correctIndex: 1,
          },
          {
            question: "A vinegary smell from aspirin tablets indicates:",
            options: [
              "Normal aspirin odour",
              "Hydrolysis to salicylic acid and acetic acid",
              "Oxidation of aspirin",
              "Microbial contamination",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "pchem-L6",
        title: "Natural Products Chemistry in Drug Development",
        duration: "45 min",
        content: `Natural products have historically been a rich source of drug leads. Over 60% of anticancer drugs and 75% of anti-infective agents are derived from or inspired by natural products. Ghana's rich biodiversity and traditional medicine heritage represent an untapped reservoir for drug discovery. The Centre for Plant Medicine Research in Mampong-Akuapem has been instrumental in scientifically evaluating Ghanaian medicinal plants.\n\nArtemisinin, derived from Artemisia annua (sweet wormwood), exemplifies the power of natural product chemistry. Its unique endoperoxide bridge is essential for antimalarial activity. Semi-synthetic derivatives such as artesunate and artemether have improved pharmacokinetic profiles. Quinine, the original antimalarial isolated from Cinchona bark, remains a second-line treatment for severe malaria in Ghana.\n\nCryptolepis sanguinolenta has yielded cryptolepine, a compound with demonstrated antimalarial, antibacterial, and antihyperglycaemic activities. Taxol (from Taxus brevifolia), vincristine (from Catharanthus roseus), and morphine (from Papaver somniferum) are other landmark natural product drugs. Standardisation and quality control of herbal medicines through phytochemical profiling remain priorities for the FDA Ghana and the Traditional Medicine Practice Council.`,
        keyPoints: [
          "Over 60% of anticancer agents are natural-product-derived",
          "Artemisinin's endoperoxide bridge is essential for antimalarial activity",
          "Cryptolepis sanguinolenta is a Ghanaian plant with multiple pharmacological activities",
          "Standardisation of herbal medicines is a priority for Ghana's FDA",
        ],
        quiz: [
          {
            question: "What structural feature is essential for artemisinin's activity?",
            options: ["Beta-lactam ring", "Endoperoxide bridge", "Benzene ring", "Ester bond"],
            correctIndex: 1,
          },
          {
            question: "Cryptolepis sanguinolenta is a Ghanaian plant with:",
            options: [
              "Antimalarial activity only",
              "No proven pharmacological activity",
              "Antimalarial, antibacterial, and antihyperglycaemic activities",
              "Anticancer activity only",
            ],
            correctIndex: 2,
          },
          {
            question: "Quinine was originally isolated from:",
            options: ["Artemisia annua", "Cinchona bark", "Catharanthus roseus", "Papaver somniferum"],
            correctIndex: 1,
          },
        ],
      },
    ],
  },
  pharmacognosy: {
    id: "pharmacognosy",
    title: "Pharmacognosy",
    description:
      "Study the medicinal properties of natural products, with emphasis on Ghanaian and West African medicinal plants, their phytochemistry, and standardisation.",
    estimatedTime: "3.5 hours",
    lessons: [
      {
        id: "pgnosy-L1",
        title: "Introduction to Pharmacognosy & Ethnobotany",
        duration: "40 min",
        content: `Pharmacognosy is the study of drugs derived from natural sources, including plants, animals, minerals, and microorganisms. In Ghana, an estimated 70-80% of the population uses traditional herbal medicines, often as the first point of healthcare contact, especially in rural areas. This makes pharmacognosy a uniquely relevant discipline for Ghanaian pharmacy practice.\n\nEthnobotany, the study of how indigenous peoples use plants, provides valuable leads for drug discovery. Ghana's diverse ethnic groups (Akan, Ewe, Ga, Dagomba, and others) each possess rich traditions of herbal medicine. Documentation of this indigenous knowledge is both scientifically valuable and culturally important. The Centre for Scientific Research into Plant Medicine (CSRPM) in Mampong-Akuapem, established in 1975, has been a pioneer in validating Ghanaian traditional remedies.\n\nThe World Health Organisation (WHO) Traditional Medicine Strategy encouraged member states to integrate traditional and complementary medicine into national health systems. Ghana responded with the Traditional Medicine Practice Act (Act 575, 2000) and the establishment of the Traditional Medicine Practice Council. Pharmacists serve as a bridge between traditional and orthodox medicine, ensuring safety and efficacy while respecting cultural practices.`,
        keyPoints: [
          "70-80% of Ghanaians use traditional herbal medicines",
          "CSRPM in Mampong-Akuapem is a leading centre for plant medicine research",
          "Ghana's Act 575 regulates traditional medicine practice",
          "Pharmacists bridge traditional and orthodox medicine systems",
        ],
        quiz: [
          {
            question: "What percentage of Ghanaians use traditional herbal medicines?",
            options: ["20-30%", "40-50%", "70-80%", "90-100%"],
            correctIndex: 2,
          },
          {
            question: "CSRPM is located in:",
            options: ["Accra", "Kumasi", "Mampong-Akuapem", "Tamale"],
            correctIndex: 2,
          },
          {
            question: "Ghana's Traditional Medicine Practice Act is:",
            options: ["Act 299", "Act 575", "Act 851", "Act 1013"],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "pgnosy-L2",
        title: "Major Ghanaian Medicinal Plants",
        duration: "45 min",
        content: `Ghana boasts a diverse flora with hundreds of species used in traditional medicine. Azadirachta indica (neem, known locally as "Dua" or "Nini") is ubiquitous in Ghana and used for malaria, skin diseases, and as an insect repellent. Scientific studies have confirmed the presence of azadirachtin, nimbin, and other limonoids with antimalarial, anti-inflammatory, and insecticidal properties.\n\nCryptolepis sanguinolenta (Nibima in Twi) is perhaps Ghana's most studied medicinal plant. Traditionally used as a decoction for malaria and fever, research at CSRPM and the University of Ghana has validated its antimalarial efficacy. The primary alkaloid, cryptolepine, has demonstrated activity against chloroquine-resistant P. falciparum strains. A standardised phytomedicine from this plant has been developed and is available in Ghanaian pharmacies.\n\nOther important species include Moringa oleifera (leaves rich in vitamins A, C, iron, and calcium, used for nutrition supplementation), Vernonia amygdalina (bitter leaf, used for diabetes and gastrointestinal complaints), and Lippia multiflora (used as a calming tea and for hypertension). The documentation and conservation of these medicinal plants is critical given threats from urbanisation, deforestation, and unsustainable harvesting practices across the Guinea and Sudan savanna zones of Ghana.`,
        keyPoints: [
          "Neem (Azadirachta indica) contains limonoids with confirmed antimalarial activity",
          "Cryptolepis sanguinolenta (Nibima) is effective against resistant P. falciparum",
          "Moringa oleifera is widely used for nutritional supplementation in Ghana",
          "Conservation of medicinal plant species is a growing concern",
        ],
        quiz: [
          {
            question: "Cryptolepis sanguinolenta is known in Twi as:",
            options: ["Dua", "Nibima", "Prekese", "Sida"],
            correctIndex: 1,
          },
          {
            question: "The primary bioactive alkaloid in Cryptolepis sanguinolenta is:",
            options: ["Quinine", "Cryptolepine", "Azadirachtin", "Artemisinin"],
            correctIndex: 1,
          },
          {
            question: "Moringa oleifera is primarily valued for:",
            options: ["Antimalarial activity", "Nutritional supplementation", "Wound healing only", "Sedative properties"],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "pgnosy-L3",
        title: "Phytochemistry & Extraction Methods",
        duration: "45 min",
        content: `Phytochemistry involves the isolation, purification, and structural characterisation of chemical compounds from plants. The major classes of bioactive phytochemicals include alkaloids, flavonoids, terpenes, tannins, saponins, and glycosides. Each class has distinctive chemical properties that influence both biological activity and extraction methodology.\n\nExtraction is the critical first step in phytochemical investigation. Maceration (soaking plant material in solvent at room temperature) is the simplest technique and mirrors traditional preparation methods. Soxhlet extraction uses continuous solvent recycling for more exhaustive extraction. Modern techniques include ultrasound-assisted extraction (UAE), microwave-assisted extraction (MAE), and supercritical fluid extraction (SFE), which offer improved efficiency and selectivity.\n\nSolvent polarity guides the sequential extraction strategy: non-polar solvents (petroleum ether, hexane) extract lipids, waxes, and terpenoids; intermediate solvents (chloroform, ethyl acetate) extract alkaloids and flavonoid aglycones; polar solvents (methanol, water) extract glycosides, tannins, and polar alkaloid salts. Chromatographic techniques (column chromatography, HPLC, preparative TLC) are then used to isolate individual compounds. Ghanaian research institutions utilise these methods to characterise bioactive compounds from local medicinal plants.`,
        keyPoints: [
          "Major phytochemical classes include alkaloids, flavonoids, terpenes, and tannins",
          "Solvent polarity determines which compound classes are extracted",
          "Modern extraction techniques (UAE, MAE) improve efficiency over traditional methods",
          "Chromatography (HPLC, column) is used to isolate individual compounds",
        ],
        quiz: [
          {
            question: "Which solvent would best extract polar glycosides?",
            options: ["Petroleum ether", "Hexane", "Chloroform", "Methanol or water"],
            correctIndex: 3,
          },
          {
            question: "Soxhlet extraction works by:",
            options: [
              "Soaking at room temperature",
              "Continuous solvent recycling",
              "Microwave irradiation",
              "Supercritical fluid compression",
            ],
            correctIndex: 1,
          },
          {
            question: "Which class of phytochemicals includes quinine and caffeine?",
            options: ["Flavonoids", "Terpenes", "Alkaloids", "Tannins"],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "pgnosy-L4",
        title: "Quality Control of Herbal Medicines",
        duration: "40 min",
        content: `Quality control of herbal medicines is essential to ensure safety, efficacy, and consistency. Unlike single-entity synthetic drugs, herbal products contain complex mixtures of compounds, making standardisation challenging. The WHO Guidelines on Good Manufacturing Practices for Herbal Medicines provide a framework adopted by Ghana's FDA for regulating herbal medicinal products.\n\nAuthentication is the first step, confirming the correct plant species through macroscopic and microscopic examination. Pharmacognostic methods include organoleptic evaluation (colour, odour, taste), microscopy of powdered material (identifying characteristic cell types like stone cells, trichomes, and starch grains), and chemical tests (colour reactions specific to phytochemical classes). DNA barcoding is an emerging tool for unambiguous species identification.\n\nQuantitative quality parameters include total ash, acid-insoluble ash, extractive values, moisture content, and heavy metal limits. Marker compound quantification using HPLC provides a measure of batch-to-batch consistency. Microbial limits testing is critical for herbal products, particularly those prepared as aqueous decoctions in non-sterile environments. Ghana's FDA has progressively tightened quality requirements for registered herbal medicines, moving the industry toward international standards.`,
        keyPoints: [
          "Herbal medicine QC follows WHO GMP guidelines adopted by Ghana's FDA",
          "Authentication uses macroscopy, microscopy, and chemical tests",
          "Marker compound quantification by HPLC ensures batch consistency",
          "Microbial testing is critical for traditionally prepared herbal products",
        ],
        quiz: [
          {
            question: "The first step in herbal medicine quality control is:",
            options: ["HPLC analysis", "Microbial testing", "Authentication of the plant species", "Dissolution testing"],
            correctIndex: 2,
          },
          {
            question: "Pharmacognostic microscopy identifies plants by:",
            options: [
              "DNA sequencing",
              "Characteristic cell types like trichomes and stone cells",
              "Chemical synthesis",
              "Spectroscopic analysis",
            ],
            correctIndex: 1,
          },
          {
            question: "Marker compound quantification is performed by:",
            options: ["TLC only", "UV spectroscopy only", "HPLC", "Titration"],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "pgnosy-L5",
        title: "Regulation & Integration of Traditional Medicine in Ghana",
        duration: "40 min",
        content: `Ghana has been at the forefront of integrating traditional medicine into the formal healthcare system. The Traditional Medicine Practice Act (Act 575) established the Traditional Medicine Practice Council to regulate practitioners, while the FDA Ghana registers and monitors herbal medicinal products. These twin regulatory arms aim to protect public health while respecting traditional knowledge.\n\nThe integration agenda includes the establishment of herbal medicine units in some public hospitals and the inclusion of selected herbal medicines on the Essential Medicines List. The Ghana Herbal Pharmacopoeia, produced by CSRPM, provides monographs for validated Ghanaian medicinal plants, including botanical descriptions, phytochemical profiles, safety data, and recommended uses. This is a critical reference for pharmacists dispensing herbal products.\n\nChallenges remain, including ensuring consistent quality of herbal products, preventing adulteration (some products have been found to contain undeclared pharmaceutical substances like dexamethasone or sildenafil), herb-drug interactions (e.g., St. John's wort inducing CYP3A4 and reducing efficacy of antiretrovirals), and integrating evidence-based herbal medicine into pharmacy curricula. Pharmacists must be competent in both orthodox and traditional medicine to serve the Ghanaian population effectively.`,
        keyPoints: [
          "Act 575 and FDA Ghana jointly regulate traditional medicine",
          "The Ghana Herbal Pharmacopoeia provides validated plant monographs",
          "Adulteration of herbal products with undeclared pharmaceuticals is a concern",
          "Herb-drug interactions (e.g., St. John's wort with ARVs) require pharmacist vigilance",
        ],
        quiz: [
          {
            question: "The Ghana Herbal Pharmacopoeia is produced by:",
            options: ["FDA Ghana", "Pharmacy Council", "CSRPM", "Ministry of Health"],
            correctIndex: 2,
          },
          {
            question: "A major safety concern with herbal medicines in Ghana is:",
            options: [
              "Excessive pricing",
              "Adulteration with undeclared pharmaceuticals",
              "Lack of traditional knowledge",
              "Over-regulation",
            ],
            correctIndex: 1,
          },
          {
            question: "St. John's wort can reduce efficacy of ARVs by:",
            options: [
              "Inhibiting drug absorption",
              "Inducing CYP3A4 metabolism",
              "Competing for protein binding",
              "Blocking renal excretion",
            ],
            correctIndex: 1,
          },
        ],
      },
    ],
  },
  "clinical-pharmacy": {
    id: "clinical-pharmacy",
    title: "Clinical Pharmacy",
    description:
      "Develop clinical decision-making skills for pharmaceutical care, covering patient assessment, drug therapy management, and counselling in the Ghanaian healthcare context.",
    estimatedTime: "5 hours",
    lessons: [
      {
        id: "clinpharm-L1",
        title: "Principles of Pharmaceutical Care",
        duration: "45 min",
        content: `Pharmaceutical care, as defined by Hepler and Strand, is the responsible provision of drug therapy for the purpose of achieving definite outcomes that improve a patient's quality of life. In Ghana, the pharmacy profession is transitioning from a product-centred to a patient-centred model, with clinical pharmacy practice gaining recognition in both hospital and community settings.\n\nThe pharmaceutical care process involves three key steps: identifying drug therapy problems (DTPs), developing a care plan, and follow-up evaluation. Common DTPs include unnecessary drug therapy, need for additional therapy, wrong drug or dose, adverse drug reactions, non-adherence, and drug interactions. Ghanaian pharmacists encounter these issues daily, particularly polypharmacy in elderly patients and medication non-adherence due to cost barriers.\n\nDocumentation of pharmaceutical care activities is essential for continuity of care and professional recognition. The SOAP (Subjective, Objective, Assessment, Plan) note is a widely used documentation format. The Pharmacy Council of Ghana has increasingly emphasised clinical pharmacy competencies in licensure examinations and continuing professional development requirements, reflecting the profession's evolution.`,
        keyPoints: [
          "Pharmaceutical care aims to achieve outcomes improving patient quality of life",
          "Drug therapy problems include wrong drug, dose, ADRs, and non-adherence",
          "SOAP notes are the standard documentation format for pharmaceutical care",
          "Ghana's Pharmacy Council emphasises clinical competencies in licensure",
        ],
        quiz: [
          {
            question: "Pharmaceutical care was defined by:",
            options: ["WHO", "Hepler and Strand", "Ghana Pharmacy Council", "FDA Ghana"],
            correctIndex: 1,
          },
          {
            question: "SOAP stands for:",
            options: [
              "Standard Operating Assessment Procedure",
              "Subjective, Objective, Assessment, Plan",
              "Safety, Outcomes, Analysis, Protocol",
              "Screening, Observation, Action, Prevention",
            ],
            correctIndex: 1,
          },
          {
            question: "A major cause of non-adherence in Ghana is:",
            options: ["Patient choice", "Lack of pharmacies", "Cost barriers", "Too many pharmacists"],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "clinpharm-L2",
        title: "Patient Medication History & Counselling",
        duration: "50 min",
        content: `A thorough medication history is the foundation of effective pharmaceutical care. It should capture all prescription medications, over-the-counter drugs, herbal medicines (critical in Ghana where herbal use is widespread), dietary supplements, allergies, and adverse drug reaction history. The medication history interview requires effective communication skills adapted to Ghana's multilingual context.\n\nPatient counselling is a core competency for pharmacists. Effective counselling covers the drug name and purpose, dosage and administration instructions, expected outcomes and timeline, possible side effects and how to manage them, storage requirements, and when to seek medical attention. The WHO "Three Prime Questions" framework is a useful structure. In Ghana, counselling often needs to address health literacy challenges and may require communication in local languages.\n\nAdherence counselling is particularly important for chronic conditions like HIV, hypertension, and diabetes, where long-term therapy is essential. Motivational interviewing techniques help pharmacists explore patient concerns and barriers. Pill organisers, simplified regimens, and mobile phone reminders are practical interventions used in Ghanaian pharmacy practice to support adherence.`,
        keyPoints: [
          "Medication histories must include herbal medicines, critical in Ghanaian practice",
          "Counselling should address drug purpose, dosing, side effects, and storage",
          "Ghana's multilingual context requires adaptable communication skills",
          "Motivational interviewing supports adherence for chronic disease patients",
        ],
        quiz: [
          {
            question: "A complete medication history in Ghana should include:",
            options: [
              "Prescription drugs only",
              "Prescription and OTC drugs only",
              "All medications including herbal medicines",
              "Only drugs from the NHIS list",
            ],
            correctIndex: 2,
          },
          {
            question: "The WHO 'Three Prime Questions' framework is used for:",
            options: ["Drug manufacturing", "Patient counselling", "Drug regulation", "Pharmacovigilance"],
            correctIndex: 1,
          },
          {
            question: "Which technique helps explore patient barriers to adherence?",
            options: [
              "Lecturing",
              "Motivational interviewing",
              "Drug information sheets only",
              "Prescription refill monitoring only",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "clinpharm-L3",
        title: "Drug Interactions & Adverse Drug Reactions",
        duration: "55 min",
        content: `Drug interactions occur when the effect of one drug is altered by the presence of another drug, food, or herbal product. They can be pharmacokinetic (affecting absorption, distribution, metabolism, or excretion) or pharmacodynamic (additive, synergistic, or antagonistic effects at the target site). In Ghana, the concurrent use of orthodox and herbal medicines creates a complex interaction landscape.\n\nClinically significant interactions include warfarin with NSAIDs (increased bleeding risk), metformin with alcohol (lactic acidosis risk), ACE inhibitors with potassium-sparing diuretics (hyperkalaemia), and antiretrovirals with rifampicin (reduced ARV efficacy due to CYP3A4 induction). Herbal interactions are particularly challenging: garlic supplements may enhance bleeding with warfarin, bitter kola (Garcinia kola) may affect theophylline metabolism, and neem preparations may interact with immunosuppressants.\n\nAdverse drug reactions (ADRs) range from predictable Type A (augmented, dose-dependent) to unpredictable Type B (bizarre, idiosyncratic). Pharmacovigilance is the science of monitoring and preventing ADRs. Ghana's FDA operates a national pharmacovigilance centre as part of the WHO Programme for International Drug Monitoring. Pharmacists are legally and professionally mandated to report ADRs using the FDA yellow form, contributing to medication safety for the population.`,
        keyPoints: [
          "Drug interactions can be pharmacokinetic or pharmacodynamic",
          "Concurrent herbal-orthodox medicine use creates unique interaction risks in Ghana",
          "Type A ADRs are dose-dependent; Type B ADRs are idiosyncratic",
          "Ghana's FDA operates a pharmacovigilance centre; pharmacists must report ADRs",
        ],
        quiz: [
          {
            question: "Warfarin combined with NSAIDs increases the risk of:",
            options: ["Hyperglycaemia", "Bleeding", "Hypotension", "Sedation"],
            correctIndex: 1,
          },
          {
            question: "Type A adverse drug reactions are:",
            options: [
              "Unpredictable and rare",
              "Dose-dependent and predictable",
              "Allergic in nature",
              "Always life-threatening",
            ],
            correctIndex: 1,
          },
          {
            question: "Pharmacists report ADRs in Ghana using:",
            options: ["The Pharmacy Council form", "The FDA yellow form", "Email to WHO", "Verbal reports only"],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "clinpharm-L4",
        title: "Management of Diabetes Mellitus",
        duration: "50 min",
        content: `Diabetes mellitus is a growing epidemic in Ghana, with prevalence estimates of 6-8% in urban areas. Type 2 diabetes accounts for over 90% of cases and is driven by increasing urbanisation, sedentary lifestyles, and dietary changes. The Ghana Diabetes Association and the Ministry of Health have developed clinical guidelines aligned with IDF recommendations.\n\nMetformin remains the first-line pharmacotherapy for Type 2 diabetes. It reduces hepatic glucose production, enhances insulin sensitivity, and does not cause weight gain or hypoglycaemia when used as monotherapy. Sulfonylureas (glibenclamide, gliclazide) stimulate pancreatic insulin secretion and are widely available and affordable in Ghana. However, they carry risks of hypoglycaemia and weight gain. If targets are not met with dual therapy, a third agent or insulin may be added.\n\nPatient education is central to diabetes management. Pharmacists counsel on medication adherence, blood glucose self-monitoring, recognition and management of hypoglycaemia (glucose tablets, sugar-containing fluids), foot care (diabetic neuropathy is a leading cause of amputation), dietary modification (reducing refined carbohydrates, increasing vegetables), and the importance of regular HbA1c testing (target usually below 7%). In Ghana, community pharmacists often serve as the most accessible healthcare provider for ongoing diabetes management support.`,
        keyPoints: [
          "Diabetes prevalence in urban Ghana is estimated at 6-8%",
          "Metformin is first-line therapy as it avoids hypoglycaemia and weight gain",
          "Sulfonylureas are affordable but carry hypoglycaemia risk",
          "Pharmacists play a key role in diabetes education and monitoring in Ghana",
        ],
        quiz: [
          {
            question: "First-line pharmacotherapy for Type 2 diabetes is:",
            options: ["Glibenclamide", "Insulin", "Metformin", "Pioglitazone"],
            correctIndex: 2,
          },
          {
            question: "A major advantage of metformin over sulfonylureas is:",
            options: [
              "It is injectable",
              "It does not cause hypoglycaemia as monotherapy",
              "It works faster",
              "It is cheaper",
            ],
            correctIndex: 1,
          },
          {
            question: "The recommended HbA1c target for most diabetic patients is below:",
            options: ["5%", "7%", "10%", "12%"],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "clinpharm-L5",
        title: "HIV/AIDS Pharmaceutical Care",
        duration: "55 min",
        content: `Ghana has a generalised HIV epidemic with a national prevalence of approximately 1.7%. The Ghana AIDS Commission coordinates the national response, while the National AIDS/STI Control Programme (NACP) manages clinical care. Antiretroviral therapy (ART) has transformed HIV from a death sentence into a manageable chronic condition, and pharmacists are integral to the care team.\n\nGhana's current first-line ART regimen for treatment-naive adults is tenofovir disoproxil fumarate + lamivudine + dolutegravir (TLD), aligned with WHO recommendations. This once-daily fixed-dose combination simplifies adherence and has a high barrier to resistance. Second-line regimens include zidovudine + lamivudine + atazanavir/ritonavir. Pharmacists must understand the pharmacology of each class: NRTIs inhibit reverse transcriptase by chain termination, NNRTIs bind non-competitively to reverse transcriptase, and INSTIs block viral DNA integration.\n\nPharmaceutical care for HIV patients encompasses adherence support (greater than 95% adherence is needed for optimal viral suppression), monitoring for adverse effects (TDF nephrotoxicity, AZT anaemia, EFV neuropsychiatric effects), managing drug interactions (particularly with TB co-treatment using rifampicin), and providing confidential patient counselling. Community pharmacy-based ART dispensing programs are expanding in Ghana to improve access and reduce stigma associated with hospital-based care.`,
        keyPoints: [
          "Ghana's HIV prevalence is approximately 1.7%",
          "TLD (tenofovir/lamivudine/dolutegravir) is the preferred first-line ART",
          "Greater than 95% adherence is needed for optimal viral suppression",
          "Community pharmacy ART dispensing is expanding to reduce stigma",
        ],
        quiz: [
          {
            question: "Ghana's recommended first-line ART regimen includes:",
            options: ["AZT + 3TC + NVP", "TDF + 3TC + DTG", "d4T + 3TC + EFV", "ABC + 3TC + LPV/r"],
            correctIndex: 1,
          },
          {
            question: "What level of adherence is needed for optimal HIV viral suppression?",
            options: ["Greater than 50%", "Greater than 70%", "Greater than 85%", "Greater than 95%"],
            correctIndex: 3,
          },
          {
            question: "A key drug interaction concern in HIV-TB co-treatment involves:",
            options: ["Metformin", "Rifampicin", "Amlodipine", "Omeprazole"],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "clinpharm-L6",
        title: "Pharmacovigilance & Medication Safety",
        duration: "45 min",
        content: `Pharmacovigilance is the science and activities relating to the detection, assessment, understanding, and prevention of adverse effects or any other drug-related problems. The WHO established the Programme for International Drug Monitoring in 1968, and Ghana joined as a full member in 2001 through the FDA Safety Monitoring Division.\n\nMedication errors occur at any stage: prescribing (wrong drug, dose, or frequency), dispensing (wrong product, label, or quantity), and administration (wrong route, time, or technique). In Ghanaian healthcare settings, common contributory factors include look-alike/sound-alike drug names (e.g., chloroquine vs. chlorpromazine), illegible prescriptions, language barriers, and inadequate staffing. Pharmacists serve as the last line of defence before medications reach patients.\n\nRisk minimisation strategies include automated dispensing systems, barcode verification, clinical decision support, standardised prescribing protocols, and patient identification procedures. In Ghana, practical measures include prescription review checklists, therapeutic duplication checks, allergy verification, and patient counselling at the point of dispensing. Building a culture of safety where errors are reported without punitive consequences enables learning and system improvement. The Ghana Pharmacists Association promotes medication safety through continuing education and practice guidelines.`,
        keyPoints: [
          "Ghana joined the WHO Drug Monitoring Programme in 2001 via FDA",
          "Medication errors occur at prescribing, dispensing, and administration stages",
          "Look-alike/sound-alike drug names are a common error source in Ghana",
          "A non-punitive reporting culture is essential for medication safety improvement",
        ],
        quiz: [
          {
            question: "Ghana joined the WHO Drug Monitoring Programme in:",
            options: ["1968", "1990", "2001", "2010"],
            correctIndex: 2,
          },
          {
            question: "Pharmacists in the medication use process serve as:",
            options: [
              "First point of prescribing",
              "Last line of defence before drugs reach patients",
              "Only advisory role",
              "Manufacturing oversight",
            ],
            correctIndex: 1,
          },
          {
            question: "A non-punitive error reporting culture is important because:",
            options: [
              "It allows blaming individuals",
              "It enables learning and system improvement",
              "It reduces documentation",
              "It is cheaper to implement",
            ],
            correctIndex: 1,
          },
        ],
      },
    ],
  },
  "pharmacy-practice": {
    id: "pharmacy-practice",
    title: "Pharmacy Practice & Ethics",
    description:
      "A comprehensive course on professional pharmacy practice, pharmaceutical legislation, ethics, and the regulatory framework governing pharmacy in Ghana.",
    estimatedTime: "5 hours",
    lessons: [
      {
        id: "pp-L1",
        title: "Introduction to Pharmacy Practice in Ghana",
        duration: "45 min",
        content: `Pharmacy practice in Ghana has evolved significantly since the establishment of the first formal pharmacy training programme at the Kwame Nkrumah University of Science and Technology (KNUST) in 1952. Today, pharmacists play a critical role in the Ghanaian healthcare system, serving as the most accessible healthcare professionals in many communities. The Pharmacy Council of Ghana, established under the Health Professions Regulatory Bodies Act (Act 857), oversees the registration, licensing, and regulation of pharmacists and pharmacy premises throughout the country.\n\nThe role of the pharmacist has expanded beyond traditional dispensing to encompass patient counselling, medication therapy management, public health advocacy, and pharmaceutical care. In Ghana, pharmacists practise in diverse settings including community pharmacies, hospital pharmacies, regulatory agencies such as the Food and Drugs Authority (FDA), the pharmaceutical industry, and academia. The Ghana Health Service and the National Health Insurance Authority also employ pharmacists in policy and programme roles.\n\nProfessional development is a cornerstone of pharmacy practice. The Pharmacy Council requires Continuing Professional Development (CPD) for licence renewal, ensuring that pharmacists remain current with advances in therapeutics, legislation, and clinical guidelines. The Pharmaceutical Society of Ghana (PSGH) organises annual conferences and workshops that serve as key platforms for professional growth and networking among practitioners across the country.`,
        keyPoints: [
          "The Pharmacy Council of Ghana regulates pharmacist registration and practice under Act 857",
          "Pharmacists in Ghana practise in community, hospital, regulatory, industrial, and academic settings",
          "KNUST established the first pharmacy training programme in Ghana in 1952",
          "Continuing Professional Development (CPD) is mandatory for licence renewal",
        ],
        quiz: [
          {
            question: "Which Act established the Pharmacy Council of Ghana as a regulatory body?",
            options: [
              "Pharmacy Act 489",
              "Public Health Act 851",
              "Health Professions Regulatory Bodies Act 857",
              "Food and Drugs Authority Act 793",
            ],
            correctIndex: 2,
          },
          {
            question: "The first formal pharmacy training programme in Ghana was established at:",
            options: [
              "University of Ghana",
              "KNUST",
              "University of Health and Allied Sciences",
              "University of Cape Coast",
            ],
            correctIndex: 1,
          },
          {
            question: "Continuing Professional Development (CPD) in Ghana is required for:",
            options: [
              "Initial registration only",
              "Hospital pharmacists only",
              "Licence renewal for all pharmacists",
              "Academic pharmacists only",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "pp-L2",
        title: "Pharmaceutical Legislation & Drug Regulation",
        duration: "50 min",
        content: `Pharmaceutical legislation in Ghana is anchored by several key statutes. The Pharmacy Act 1994 (Act 489) regulates the practice of pharmacy, the sale of drugs, and the operation of pharmacy premises. It establishes offences related to unlicensed practice and the sale of prescription-only medicines by unqualified persons. The Public Health Act 2012 (Act 851), Part Seven, provides for the regulation of food, drugs, cosmetics, household chemicals, and medical devices, forming the legal basis for the operations of the Food and Drugs Authority.\n\nThe Food and Drugs Authority (FDA) of Ghana is the national regulatory authority responsible for ensuring the safety, quality, and efficacy of medicines, biological products, and medical devices. The FDA oversees product registration, post-market surveillance, pharmacovigilance, and the regulation of clinical trials. All pharmaceutical products marketed in Ghana must be registered with the FDA, and manufacturers must comply with Good Manufacturing Practice (GMP) standards. The FDA also operates the Safety Monitoring and Clinical Trials Division, which manages the national spontaneous adverse drug reaction reporting system.\n\nDrug scheduling and classification in Ghana follows a tiered system. Prescription-only medicines (POM) can only be dispensed on the authority of a valid prescription from an authorised prescriber. Pharmacy-only medicines (P) may be sold without a prescription but only from licensed pharmacies under the supervision of a pharmacist. Over-the-counter (OTC) medicines are available from licensed chemical shops and pharmacies. Understanding this classification is fundamental for pharmacists to ensure lawful and safe dispensing practice.`,
        keyPoints: [
          "Pharmacy Act 489 regulates pharmacy practice and drug sales in Ghana",
          "The Public Health Act 851 provides the legal basis for the FDA's operations",
          "All medicines marketed in Ghana must be registered with the FDA",
          "Drug scheduling includes POM, Pharmacy-only, and OTC categories",
        ],
        quiz: [
          {
            question: "Which legislation directly regulates the practice of pharmacy in Ghana?",
            options: [
              "Public Health Act 851",
              "Pharmacy Act 489",
              "Narcotics Control Act",
              "Health Institutions and Facilities Act",
            ],
            correctIndex: 1,
          },
          {
            question: "Pharmacy-only (P) medicines in Ghana can be:",
            options: [
              "Sold in any retail shop",
              "Dispensed only with a prescription",
              "Sold from licensed pharmacies under pharmacist supervision without a prescription",
              "Sold only in hospitals",
            ],
            correctIndex: 2,
          },
          {
            question: "The national adverse drug reaction reporting system in Ghana is managed by the:",
            options: [
              "Pharmacy Council",
              "Ghana Health Service",
              "Ministry of Health",
              "Food and Drugs Authority",
            ],
            correctIndex: 3,
          },
        ],
      },
      {
        id: "pp-L3",
        title: "Good Dispensing Practice",
        duration: "50 min",
        content: `Good dispensing practice is the cornerstone of pharmaceutical care and patient safety. The dispensing process begins with the receipt and validation of a prescription. In Ghana, a valid prescription must contain the prescriber's name, qualification, and registration number; the patient's name and age; the date of prescribing; the drug name (preferably generic/INN), strength, dosage form, quantity, and directions for use. Pharmacists must verify the prescriber's authority, check for completeness, and assess clinical appropriateness before dispensing.\n\nThe dispensing workflow involves selecting the correct medication, accurate counting or measuring, appropriate labelling, and final verification. Labels must include the patient's name, drug name and strength, directions for use, quantity dispensed, date of dispensing, pharmacy name and address, and any relevant warnings or auxiliary labels. In Ghana, where patients may have limited literacy, pictorial aids and verbal counselling in the local language are essential components of effective dispensing. The pharmacist must also check for drug interactions, contraindications, and appropriate dosing based on patient factors such as age, weight, renal function, and pregnancy status.\n\nPatient counselling during dispensing is a professional obligation, not an optional service. Pharmacists should explain the purpose of the medication, how and when to take it, common side effects and what to do if they occur, storage requirements, and the importance of adherence. Record keeping is essential for tracking dispensing history, facilitating refills, and supporting pharmacovigilance. Many pharmacies in Ghana are transitioning from manual dispensing registers to electronic pharmacy management systems to improve efficiency and traceability.`,
        keyPoints: [
          "Prescription validation includes checking prescriber authority and clinical appropriateness",
          "Labels must include patient name, drug details, directions, quantity, date, and pharmacy information",
          "Patient counselling in the local language with pictorial aids improves understanding",
          "Record keeping supports dispensing history tracking and pharmacovigilance",
        ],
        quiz: [
          {
            question: "A valid prescription in Ghana must include the prescriber's:",
            options: [
              "Home address and phone number",
              "Name, qualification, and registration number",
              "National ID number only",
              "Hospital department only",
            ],
            correctIndex: 1,
          },
          {
            question: "During dispensing, checking for drug interactions is the responsibility of the:",
            options: [
              "Prescriber only",
              "Nurse",
              "Pharmacist",
              "Patient",
            ],
            correctIndex: 2,
          },
          {
            question: "Which is NOT a required element on a dispensing label in Ghana?",
            options: [
              "Patient's name",
              "Drug name and strength",
              "Manufacturer's batch number",
              "Directions for use",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "pp-L4",
        title: "Controlled Substances Management",
        duration: "50 min",
        content: `The regulation of controlled substances in Ghana is governed by the Narcotic Drugs (Control, Enforcement and Sanctions) Act 1990 (PNDCL 236) and its subsequent amendments, as well as the Pharmacy Act 489. Ghana's Narcotics Control Commission (NACOC), now the Narcotics Control Board (NACOB), is the primary agency responsible for the enforcement of narcotic drug control legislation. Controlled substances are classified into schedules based on their abuse potential, medical utility, and safety profile, in accordance with the United Nations Single Convention on Narcotic Drugs and the Convention on Psychotropic Substances.\n\nPharmacies that handle controlled drugs (CDs) must maintain a Controlled Drugs Register, a bound book with consecutively numbered pages in which all receipts and issues of controlled substances are recorded. Each entry must include the date, name and address of the supplier or recipient, the quantity received or supplied, and the running balance. The register must be kept for a minimum of two years from the date of the last entry. Storage of controlled substances requires a locked cupboard or safe within the pharmacy, accessible only to the pharmacist-in-charge or an authorised delegate.\n\nPrescribing of controlled substances is subject to additional requirements beyond standard prescriptions. CD prescriptions must be written in ink or be otherwise indelible, be signed and dated by the prescriber, specify the total quantity in words and figures, and include the prescriber's full address. Pharmacists must refuse to dispense CD prescriptions that do not meet these requirements. The balance of CDs must be verified by regular stock checks, and any discrepancies must be investigated and reported to the appropriate authorities immediately.`,
        keyPoints: [
          "NACOB is the primary enforcement agency for narcotic drug control in Ghana",
          "The Controlled Drugs Register must record all receipts and issues with running balances",
          "CDs must be stored in a locked cupboard or safe accessible only to the pharmacist-in-charge",
          "CD prescriptions must specify total quantity in both words and figures",
        ],
        quiz: [
          {
            question: "The Controlled Drugs Register must be kept for a minimum of:",
            options: [
              "Six months from the last entry",
              "One year from the last entry",
              "Two years from the last entry",
              "Five years from the last entry",
            ],
            correctIndex: 2,
          },
          {
            question: "A controlled drug prescription must specify the total quantity in:",
            options: [
              "Words only",
              "Figures only",
              "Both words and figures",
              "Metric units only",
            ],
            correctIndex: 2,
          },
          {
            question: "Access to the controlled drugs storage in a pharmacy is restricted to:",
            options: [
              "Any pharmacy staff member",
              "The pharmacist-in-charge or authorised delegate",
              "The pharmacy owner only",
              "Any registered healthcare professional",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "pp-L5",
        title: "Pharmacy Ethics & Professional Conduct",
        duration: "50 min",
        content: `Professional ethics in pharmacy is governed by the Code of Ethics established by the Pharmacy Council of Ghana, which sets the standards of conduct expected of all registered pharmacists. The fundamental principles include the duty to prioritise patient welfare, to maintain professional competence, to uphold the dignity and honour of the profession, and to act with honesty and integrity in all professional dealings. Pharmacists in Ghana swear an oath upon registration that commits them to these ethical principles.\n\nPatient confidentiality is a critical ethical obligation. Pharmacists must protect all patient information obtained during the course of practice, including prescription records, health conditions, and personal details. Disclosure of patient information is only permissible with the patient's informed consent or when required by law, such as in cases of notifiable diseases under the Public Health Act. Informed consent requires that patients receive adequate information about their treatment options, potential risks, and alternatives before agreeing to a course of therapy. Pharmacists must also manage conflicts of interest transparently, particularly regarding financial incentives from pharmaceutical companies that could influence prescribing or dispensing decisions.\n\nProfessional misconduct in pharmacy can lead to disciplinary action by the Pharmacy Council, ranging from caution and reprimand to suspension or removal from the register. Examples of misconduct include practising while impaired, dispensing without a valid licence, engaging in fraudulent prescription activities, and failing to maintain adequate professional standards. The Council operates a disciplinary committee that investigates complaints and conducts hearings. Pharmacists have the right to legal representation and appeal in disciplinary proceedings, ensuring due process is observed.`,
        keyPoints: [
          "The Pharmacy Council's Code of Ethics mandates patient welfare as the primary obligation",
          "Patient confidentiality may only be breached with consent or when required by law",
          "Conflicts of interest from pharmaceutical company incentives must be managed transparently",
          "Professional misconduct can result in suspension or removal from the pharmacy register",
        ],
        quiz: [
          {
            question: "Patient information may be disclosed without consent when:",
            options: [
              "A family member requests it",
              "It is required by law such as for notifiable diseases",
              "The pharmacist believes it is in the patient's interest",
              "Another healthcare professional asks informally",
            ],
            correctIndex: 1,
          },
          {
            question: "The most severe disciplinary sanction the Pharmacy Council can impose is:",
            options: [
              "A written warning",
              "A fine of GHS 10,000",
              "Removal from the pharmacy register",
              "Mandatory retraining",
            ],
            correctIndex: 2,
          },
          {
            question: "A pharmacist who accepts financial incentives from a drug company to preferentially dispense their products is engaging in:",
            options: [
              "Good business practice",
              "Professional networking",
              "A conflict of interest that must be disclosed",
              "Standard pharmaceutical marketing",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "pp-L6",
        title: "Community & Hospital Pharmacy Practice",
        duration: "55 min",
        content: `Community pharmacy is the most common practice setting for pharmacists in Ghana, with over 3,000 licensed pharmacies serving communities across the country. Community pharmacists are often the first point of contact for patients seeking healthcare, particularly in areas with limited access to physicians. Their roles include dispensing prescription and over-the-counter medicines, providing patient counselling, managing minor ailments, conducting health screening (blood pressure, blood glucose), and promoting public health campaigns such as malaria prevention and immunisation awareness.\n\nHospital pharmacy practice in Ghana encompasses a broader scope of services. Hospital pharmacists are responsible for medicines procurement and supply chain management, formulary development, drug information services, medication safety initiatives, and increasingly, clinical pharmacy services at the ward level. Teaching hospitals such as Korle Bu, Komfo Anokye, and Tamale Teaching Hospital have established clinical pharmacy programmes where pharmacists participate in ward rounds, review medication charts, and provide evidence-based recommendations to the healthcare team. The Ghana National Drugs Programme promotes rational drug use through the Standard Treatment Guidelines and the Essential Medicines List.\n\nIntegration with the National Health Insurance Scheme (NHIS) has significantly shaped pharmacy practice in Ghana. Community pharmacies credentialed under NHIS can dispense medicines to insured patients and claim reimbursement from the National Health Insurance Authority. This has improved access to essential medicines but also introduced challenges related to delayed reimbursements, limited formulary coverage, and administrative burden. Pharmacists must navigate the NHIS medicines list, generic substitution policies, and claims documentation requirements to ensure patients receive optimal care while maintaining the financial viability of their practice.`,
        keyPoints: [
          "Over 3,000 licensed community pharmacies operate across Ghana",
          "Hospital pharmacists participate in ward rounds and clinical decision-making at teaching hospitals",
          "The Standard Treatment Guidelines and Essential Medicines List guide rational drug use",
          "NHIS credentialing allows community pharmacies to serve insured patients with reimbursement",
        ],
        quiz: [
          {
            question: "Community pharmacists in Ghana commonly provide which additional service beyond dispensing?",
            options: [
              "Surgical procedures",
              "Blood pressure and blood glucose screening",
              "Radiological imaging",
              "Laboratory culture and sensitivity testing",
            ],
            correctIndex: 1,
          },
          {
            question: "The Ghana National Drugs Programme promotes rational drug use through:",
            options: [
              "Television advertising",
              "Mandatory generic prescribing laws",
              "Standard Treatment Guidelines and Essential Medicines List",
              "Drug price controls",
            ],
            correctIndex: 2,
          },
          {
            question: "A challenge associated with NHIS integration for pharmacies is:",
            options: [
              "Excess funding from the scheme",
              "Unlimited formulary coverage",
              "Delayed reimbursements from NHIA",
              "Reduced patient volume",
            ],
            correctIndex: 2,
          },
        ],
      },
    ],
  },
  "biopharmaceutics": {
    id: "biopharmaceutics",
    title: "Biopharmaceutics & Pharmacokinetics",
    description:
      "An advanced course covering biopharmaceutical principles, drug absorption, bioavailability, pharmacokinetic modeling, and therapeutic drug monitoring relevant to clinical practice in Ghana.",
    estimatedTime: "5.5 hours",
    lessons: [
      {
        id: "biopk-L1",
        title: "Biopharmaceutical Classification System (BCS)",
        duration: "50 min",
        content: `The Biopharmaceutical Classification System (BCS) is a scientific framework introduced by Gordon Amidon in 1995 that classifies drug substances based on their aqueous solubility and intestinal permeability. The system divides drugs into four classes: Class I (high solubility, high permeability), Class II (low solubility, high permeability), Class III (high solubility, low permeability), and Class IV (low solubility, low permeability). This classification has profound implications for drug formulation, generic drug approval, and bioequivalence testing.\n\nFor pharmaceutical practice in Ghana and West Africa, the BCS is particularly relevant to the registration and approval of generic medicines. The Ghana FDA and the WHO Prequalification Programme use BCS-based biowaivers to streamline the approval of generic formulations of Class I and, in some cases, Class III drugs. A biowaiver allows a generic manufacturer to demonstrate equivalence through in vitro dissolution testing rather than expensive in vivo bioequivalence studies, thereby reducing the cost and time required for generic drug registration. This is especially important in Ghana, where generic medicines constitute a significant portion of the pharmaceutical market and contribute to medicine affordability and accessibility.\n\nCommon examples relevant to Ghanaian practice include metformin (BCS Class III — high solubility, low permeability), amlodipine (BCS Class I), and ibuprofen (BCS Class II). Understanding BCS classification helps pharmacists evaluate the potential for formulation-dependent differences in bioavailability among generic products, which is critical when counselling patients who switch between brands — a common occurrence under the NHIS medicines list.`,
        keyPoints: [
          "BCS classifies drugs into four classes based on solubility and permeability",
          "Class I drugs have high solubility and high permeability, making them ideal biowaiver candidates",
          "The Ghana FDA and WHO Prequalification use BCS-based biowaivers for generic approval",
          "BCS classification helps pharmacists evaluate bioavailability differences among generic brands",
        ],
        quiz: [
          {
            question: "A BCS Class II drug has:",
            options: [
              "High solubility and high permeability",
              "Low solubility and high permeability",
              "High solubility and low permeability",
              "Low solubility and low permeability",
            ],
            correctIndex: 1,
          },
          {
            question: "BCS-based biowaivers allow generic manufacturers to demonstrate equivalence through:",
            options: [
              "In vivo bioequivalence studies in human subjects",
              "Animal pharmacokinetic studies",
              "In vitro dissolution testing",
              "Clinical efficacy trials",
            ],
            correctIndex: 2,
          },
          {
            question: "Metformin is classified as BCS Class III, meaning it has:",
            options: [
              "Low solubility and low permeability",
              "High solubility and high permeability",
              "Low solubility and high permeability",
              "High solubility and low permeability",
            ],
            correctIndex: 3,
          },
        ],
      },
      {
        id: "biopk-L2",
        title: "Drug Absorption & Bioavailability",
        duration: "55 min",
        content: `Drug absorption from the gastrointestinal tract is a complex process governed by physicochemical, physiological, and formulation factors. Most orally administered drugs are absorbed in the small intestine due to its large surface area, rich blood supply, and optimal pH for absorption of weakly acidic and weakly basic drugs. The primary mechanism of absorption for most drugs is passive transcellular diffusion, although carrier-mediated transport, paracellular transport, and endocytosis also play roles for specific drug molecules.\n\nBioavailability (F) is defined as the fraction of an administered dose that reaches the systemic circulation in unchanged form. It is a product of the fraction absorbed (fa), the fraction escaping gut wall metabolism (fg), and the fraction escaping first-pass hepatic metabolism (fh), expressed as F = fa × fg × fh. Absolute bioavailability is determined by comparing the area under the plasma concentration-time curve (AUC) after oral administration to that after intravenous administration. Relative bioavailability compares a test formulation to a reference formulation by the same route, which is the basis of bioequivalence studies conducted by the Ghana FDA for generic drug registration.\n\nFactors affecting bioavailability in the Ghanaian clinical context include the effect of traditional herbal medicines on drug absorption (for example, herbal preparations containing tannins can chelate iron supplements and tetracyclines), the impact of tropical diets high in fibre on gastric motility, and the prevalence of co-infections (such as malaria and HIV) that may alter gastrointestinal physiology. Bioequivalence studies require that the 90% confidence intervals for the AUC ratio and Cmax ratio of the test-to-reference formulation fall within the 80-125% acceptance range.`,
        keyPoints: [
          "Most oral drug absorption occurs in the small intestine via passive transcellular diffusion",
          "Bioavailability (F) equals fa × fg × fh, accounting for absorption and first-pass metabolism",
          "Bioequivalence requires 90% CI of AUC and Cmax ratios within 80-125%",
          "Herbal medicines and tropical dietary factors can significantly affect drug absorption in Ghana",
        ],
        quiz: [
          {
            question: "Bioavailability (F) is calculated as:",
            options: [
              "The total dose administered",
              "fa × fg × fh",
              "AUC divided by Cmax",
              "Plasma concentration at steady state",
            ],
            correctIndex: 1,
          },
          {
            question: "Bioequivalence acceptance criteria require AUC and Cmax ratios within:",
            options: [
              "70-130%",
              "90-110%",
              "80-125%",
              "85-115%",
            ],
            correctIndex: 2,
          },
          {
            question: "Which factor relevant to Ghanaian practice can reduce drug absorption?",
            options: [
              "Co-administration with clean water",
              "Herbal preparations containing tannins",
              "Administration in the fasted state",
              "Use of immediate-release formulations",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "biopk-L3",
        title: "Pharmacokinetic Parameters & Modeling",
        duration: "55 min",
        content: `Pharmacokinetic modelling describes the time course of drug concentrations in the body using mathematical models. The one-compartment model treats the body as a single, kinetically homogeneous unit where the drug distributes instantaneously and uniformly. This model is suitable for drugs that rapidly equilibrate between plasma and tissues, such as aminoglycosides in the initial distribution phase. The two-compartment model adds a peripheral tissue compartment, accounting for the initial distribution phase followed by a slower elimination phase, and is appropriate for drugs like vancomycin and digoxin.\n\nKey pharmacokinetic parameters include the area under the plasma concentration-time curve (AUC), which reflects total drug exposure; Cmax, the maximum plasma concentration achieved; Tmax, the time to reach Cmax; the elimination half-life (t½), the time required for plasma concentration to decrease by 50%; clearance (CL), the volume of plasma completely cleared of drug per unit time; and volume of distribution (Vd), the theoretical volume needed to contain the total body drug at the same concentration as plasma. At steady state, achieved after approximately 4-5 half-lives of repeated dosing, the rate of drug input equals the rate of elimination.\n\nIn Ghanaian clinical practice, these parameters guide dosing decisions for critical medications. For example, gentamicin dosing in neonates at Korle Bu Teaching Hospital uses population pharmacokinetic data to determine appropriate doses and intervals. Steady-state concepts inform the loading dose strategy for antimalarials like artesunate-amodiaquine, where rapid attainment of therapeutic concentrations is essential for treating severe Plasmodium falciparum malaria. Understanding AUC and Cmax is also vital for pharmacists involved in therapeutic drug monitoring and in evaluating bioequivalence data for generic medicines on the NHIS formulary.`,
        keyPoints: [
          "The one-compartment model assumes instantaneous and uniform drug distribution",
          "AUC reflects total drug exposure while Cmax indicates peak plasma concentration",
          "Steady state is reached after approximately 4-5 elimination half-lives",
          "Population pharmacokinetic data guides neonatal and paediatric dosing in Ghanaian hospitals",
        ],
        quiz: [
          {
            question: "Steady state during repeated drug dosing is typically achieved after:",
            options: [
              "1-2 half-lives",
              "2-3 half-lives",
              "4-5 half-lives",
              "7-10 half-lives",
            ],
            correctIndex: 2,
          },
          {
            question: "The pharmacokinetic parameter that best reflects total drug exposure is:",
            options: [
              "Cmax",
              "Tmax",
              "AUC",
              "Half-life",
            ],
            correctIndex: 2,
          },
          {
            question: "A two-compartment model is most appropriate for drugs that:",
            options: [
              "Distribute instantaneously throughout the body",
              "Show a distinct distribution phase followed by an elimination phase",
              "Are only administered intravenously",
              "Have zero-order elimination kinetics",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "biopk-L4",
        title: "Drug Distribution & Protein Binding",
        duration: "50 min",
        content: `Drug distribution is the process by which a drug reversibly leaves the bloodstream and enters the extracellular fluid and tissues. The extent of distribution depends on blood flow to tissues, the drug's ability to cross biological membranes, plasma protein binding, and tissue binding affinity. Highly perfused organs such as the liver, kidneys, brain, and heart receive drug rapidly, while poorly perfused tissues like adipose and bone equilibrate more slowly. The volume of distribution (Vd) is a proportionality constant that relates plasma concentration to total body drug content — a large Vd indicates extensive tissue distribution.\n\nPlasma protein binding significantly influences drug distribution, metabolism, and elimination. Albumin is the major binding protein for acidic drugs (such as warfarin, phenytoin, and naproxen), while alpha-1-acid glycoprotein (AAG) binds basic drugs (such as lidocaine and propranolol). Only the unbound (free) fraction of drug is pharmacologically active, can cross membranes, and is available for metabolism and excretion. Conditions prevalent in Ghana such as malnutrition, hepatic disease (including hepatitis B), nephrotic syndrome, and severe malaria can decrease albumin levels, leading to increased free drug fractions and potentially enhanced pharmacological effects or toxicity.\n\nSpecialised barriers govern drug distribution to certain compartments. The blood-brain barrier (BBB) restricts entry of polar and large molecules into the central nervous system, which is clinically relevant when selecting antimicrobials for CNS infections such as cryptococcal meningitis in HIV patients — a significant clinical challenge in Ghana. Placental transfer of drugs is important in the management of pregnant women, particularly concerning the safety of antimalarials (artemisinins are avoided in the first trimester) and antiretrovirals used for prevention of mother-to-child HIV transmission.`,
        keyPoints: [
          "Volume of distribution (Vd) relates plasma concentration to total drug in the body",
          "Albumin binds acidic drugs while alpha-1-acid glycoprotein binds basic drugs",
          "Hypoalbuminaemia from malnutrition or disease increases free drug fraction and toxicity risk",
          "The blood-brain barrier and placental transfer are critical considerations in CNS infections and pregnancy",
        ],
        quiz: [
          {
            question: "A drug with a Vd of 500 L is most likely:",
            options: [
              "Confined to the plasma compartment",
              "Distributed primarily in extracellular fluid",
              "Extensively bound to plasma proteins",
              "Extensively distributed into peripheral tissues",
            ],
            correctIndex: 3,
          },
          {
            question: "In a patient with severe malnutrition and low albumin, the free fraction of warfarin will:",
            options: [
              "Decrease significantly",
              "Remain unchanged",
              "Increase, raising the risk of bleeding",
              "Become completely protein-bound",
            ],
            correctIndex: 2,
          },
          {
            question: "Alpha-1-acid glycoprotein (AAG) primarily binds:",
            options: [
              "Acidic drugs like warfarin",
              "Basic drugs like lidocaine",
              "Neutral drugs only",
              "Fat-soluble vitamins",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "biopk-L5",
        title: "Drug Metabolism & Elimination",
        duration: "55 min",
        content: `Drug metabolism converts lipophilic drug molecules into more hydrophilic metabolites suitable for renal or biliary excretion. The liver is the primary site of drug metabolism, with the cytochrome P450 (CYP) enzyme superfamily catalysing the majority of Phase I oxidative reactions. The major CYP isoforms involved in drug metabolism include CYP3A4 (responsible for approximately 50% of drug metabolism), CYP2D6, CYP2C9, CYP2C19, and CYP1A2. Phase II conjugation reactions — including glucuronidation, sulfation, acetylation, and glutathione conjugation — further increase water solubility for elimination.\n\nPharmacogenomic variation in drug-metabolising enzymes is of particular importance in West African populations. CYP2D6 polymorphisms show distinct patterns in Ghanaian populations compared to European and Asian groups, with a notable prevalence of gene duplications leading to ultra-rapid metaboliser phenotypes. This has clinical implications for drugs such as codeine (which is converted to morphine by CYP2D6, posing toxicity risk in ultra-rapid metabolisers), tamoxifen, and certain antipsychotics. CYP2C19 poor metaboliser status affects the efficacy of clopidogrel and proton pump inhibitors. The NAT2 acetylator phenotype, relevant to isoniazid metabolism in tuberculosis treatment, also shows population-specific distributions in Ghana.\n\nDrug-drug interactions at the metabolic level are a significant clinical concern. Enzyme inducers such as rifampicin (commonly used in TB treatment) and efavirenz (used in HIV therapy) can dramatically reduce plasma concentrations of co-administered drugs including artemether-lumefantrine, oral contraceptives, and antiretrovirals. Conversely, enzyme inhibitors like ketoconazole, erythromycin, and ritonavir increase plasma concentrations of substrate drugs, risking toxicity. Given the high burden of co-infections in Ghana (TB-HIV, malaria-HIV), pharmacists must be vigilant in identifying and managing metabolic drug interactions.`,
        keyPoints: [
          "CYP3A4 metabolises approximately 50% of all clinically used drugs",
          "CYP2D6 ultra-rapid metaboliser phenotype is notable in West African populations",
          "Rifampicin and efavirenz are potent enzyme inducers affecting many co-administered drugs",
          "TB-HIV and malaria-HIV co-infections in Ghana create complex drug interaction scenarios",
        ],
        quiz: [
          {
            question: "A CYP2D6 ultra-rapid metaboliser receiving codeine is at risk of:",
            options: [
              "Therapeutic failure due to lack of morphine formation",
              "Morphine toxicity due to excessive conversion",
              "No change in drug response",
              "Allergic reaction to codeine",
            ],
            correctIndex: 1,
          },
          {
            question: "Rifampicin affects co-administered drugs by:",
            options: [
              "Inhibiting CYP enzymes and increasing drug levels",
              "Inducing CYP enzymes and decreasing drug levels",
              "Blocking renal tubular secretion",
              "Displacing drugs from protein binding sites",
            ],
            correctIndex: 1,
          },
          {
            question: "Phase II conjugation reactions include all of the following EXCEPT:",
            options: [
              "Glucuronidation",
              "Sulfation",
              "Oxidation",
              "Acetylation",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "biopk-L6",
        title: "Therapeutic Drug Monitoring (TDM)",
        duration: "55 min",
        content: `Therapeutic drug monitoring (TDM) is the clinical practice of measuring drug concentrations in biological fluids, usually plasma or serum, to optimise individual patient dosing. TDM is indicated for drugs with a narrow therapeutic index (NTI), where the toxic concentration is close to the therapeutic concentration. Common NTI drugs monitored in Ghanaian clinical practice include aminoglycosides (gentamicin, amikacin), vancomycin, phenytoin, carbamazepine, lithium, digoxin, and theophylline. The goal of TDM is to maintain drug concentrations within the therapeutic window — above the minimum effective concentration (MEC) and below the minimum toxic concentration (MTC).\n\nProper sampling technique and timing are critical for meaningful TDM results. Trough levels (taken just before the next dose) are most commonly measured and reflect the minimum concentration during a dosing interval. Peak levels (taken 1-2 hours post-dose for oral drugs, or 30 minutes after IV infusion completion) assess whether adequate concentrations are achieved. For aminoglycosides, both peak and trough monitoring is essential: peak concentrations ensure bactericidal efficacy while trough concentrations are monitored to prevent nephrotoxicity and ototoxicity. Samples should be drawn at steady state (after 4-5 half-lives) unless there is concern for acute toxicity.\n\nDose adjustment based on TDM results must consider patient-specific factors including renal and hepatic function, age, body composition, concurrent diseases, and interacting medications. In Ghana, TDM services are primarily available at tertiary teaching hospitals such as Korle Bu, Komfo Anokye, and the 37 Military Hospital. Pharmacists play a key role in the TDM process by recommending appropriate sampling times, interpreting drug concentration results in the clinical context, calculating adjusted doses using pharmacokinetic equations, and monitoring for clinical response and adverse effects. Expanding TDM capacity in district hospitals across Ghana would significantly improve the management of patients on NTI drugs, particularly those with epilepsy, cardiac arrhythmias, and serious infections.`,
        keyPoints: [
          "TDM is indicated for narrow therapeutic index drugs where toxic and therapeutic levels are close",
          "Trough levels are drawn just before the next dose; peak levels assess maximum concentration",
          "Aminoglycoside monitoring requires both peak (efficacy) and trough (toxicity) measurements",
          "TDM services in Ghana are primarily available at tertiary teaching hospitals",
        ],
        quiz: [
          {
            question: "The primary purpose of monitoring aminoglycoside trough levels is to:",
            options: [
              "Ensure bactericidal efficacy",
              "Prevent nephrotoxicity and ototoxicity",
              "Determine the loading dose",
              "Measure oral bioavailability",
            ],
            correctIndex: 1,
          },
          {
            question: "TDM blood samples should ideally be drawn:",
            options: [
              "Immediately after the first dose",
              "At any random time during therapy",
              "At steady state, after 4-5 half-lives",
              "Only when toxicity is suspected",
            ],
            correctIndex: 2,
          },
          {
            question: "Which of the following is NOT a narrow therapeutic index drug?",
            options: [
              "Phenytoin",
              "Amoxicillin",
              "Digoxin",
              "Lithium",
            ],
            correctIndex: 1,
          },
        ],
      },
    ],
  },
  "pharma-microbiology": {
    id: "pharma-microbiology",
    title: "Pharmaceutical Microbiology",
    description:
      "A comprehensive course covering microbial science as it applies to pharmacy practice, pharmaceutical manufacturing, and infection control. Topics include sterilisation, antimicrobial susceptibility testing, contamination control, GMP microbiology, and hospital infection prevention — all contextualised for Ghanaian pharmacy practice.",
    estimatedTime: "5 hours",
    lessons: [
      {
        id: "pmicro-L1",
        title: "Introduction to Pharmaceutical Microbiology",
        duration: "45 min",
        content: `Pharmaceutical microbiology is the branch of microbiology concerned with the production, quality control, and safe use of pharmaceutical products. It encompasses the study of microorganisms — bacteria, fungi, viruses, and parasites — that can contaminate medicines, cause infections in patients, or be harnessed to produce therapeutic agents such as antibiotics and vaccines. In Ghana, the Pharmacy Council mandates that every registered pharmacist demonstrates competence in basic microbiology, making this subject a core component of the B.Pharm curriculum at institutions such as KNUST, University of Ghana, and the University of Cape Coast.

Bacteria are classified as Gram-positive or Gram-negative based on their cell-wall structure, a distinction that has direct implications for antibiotic selection. Gram-positive organisms such as Staphylococcus aureus retain the crystal violet stain due to their thick peptidoglycan layer, while Gram-negative bacteria like Escherichia coli possess an outer membrane containing lipopolysaccharide (LPS). Fungi, including Candida and Aspergillus species, are eukaryotic organisms that can contaminate oral suspensions and topical preparations. Viruses, though acellular, are of immense pharmaceutical relevance — from the hepatitis B virus that affects blood-derived products to SARS-CoV-2, which reshaped pharmacy practice across Ghana Health Service facilities.

Understanding microbial classification allows pharmacists to predict contamination risks, choose appropriate preservatives, and counsel patients on the correct use of antimicrobials. At Korle Bu Teaching Hospital and other tertiary facilities in Ghana, clinical pharmacists collaborate with microbiologists daily to optimise antibiotic therapy. The Ghana FDA requires that every marketing-authorisation application for a non-sterile product includes microbial-limit test data, underscoring the regulatory importance of this discipline.`,
        keyPoints: [
          "Pharmaceutical microbiology covers bacteria, fungi, viruses, and parasites relevant to drug production and patient care",
          "Gram staining differentiates bacteria by cell-wall structure and guides antibiotic selection",
          "The Pharmacy Council of Ghana requires microbiology competence for pharmacist registration",
          "Ghana FDA mandates microbial-limit testing for non-sterile pharmaceutical products",
        ],
        quiz: [
          {
            question:
              "Which structural feature is responsible for Gram-negative bacteria appearing pink after Gram staining?",
            options: [
              "Thick peptidoglycan layer",
              "Outer membrane with lipopolysaccharide",
              "Absence of a cell wall",
              "Presence of teichoic acids",
            ],
            correctIndex: 1,
          },
          {
            question:
              "Which Ghanaian institution is primarily responsible for registering pharmacists and setting competency standards in microbiology?",
            options: [
              "Ghana Health Service",
              "Food and Drugs Authority",
              "Pharmacy Council of Ghana",
              "National Health Insurance Authority",
            ],
            correctIndex: 2,
          },
          {
            question:
              "Fungi such as Candida species are classified as which type of organism?",
            options: [
              "Prokaryotic",
              "Acellular",
              "Eukaryotic",
              "Archaeal",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "pmicro-L2",
        title: "Sterilisation & Disinfection",
        duration: "50 min",
        content: `Sterilisation is the complete elimination of all viable microorganisms, including bacterial spores, from a product or surface. It is an absolute concept — an item is either sterile or it is not. Disinfection, by contrast, reduces the microbial load to a safe level but does not necessarily destroy spores. In pharmaceutical manufacturing, the choice of sterilisation method depends on the nature of the product: heat-stable aqueous injections are terminally sterilised by autoclaving (moist heat at 121 °C for 15 minutes), while thermolabile biologicals may require aseptic filtration through 0.22 µm membrane filters. Dry-heat sterilisation (160 °C for 2 hours) is reserved for glassware and non-aqueous preparations such as oily injections. Ghana FDA Good Manufacturing Practice (GMP) guidelines, aligned with WHO standards, require documented validation of every sterilisation cycle used in local production facilities.

Chemical disinfection plays a critical role in hospital pharmacy compounding areas and community pharmacy surfaces. Common agents include 70 % ethanol, sodium hypochlorite, chlorhexidine gluconate, and quaternary ammonium compounds. Selection depends on the spectrum of activity, material compatibility, and contact time. In Ghanaian hospitals such as Korle Bu and Komfo Anokye Teaching Hospital, pharmacy aseptic units follow standard operating procedures that specify daily surface disinfection with validated agents and periodic fumigation with hydrogen peroxide vapour.

Monitoring sterilisation effectiveness involves biological indicators (e.g., Geobacillus stearothermophilus spores for autoclaves), chemical indicators (autoclave tape, Bowie-Dick test), and physical parameter recording (time-temperature charts). The Ghana FDA inspects local manufacturers to verify that sterilisation records are maintained and that parametric release criteria are met. Failure to demonstrate sterility assurance can result in batch recall and suspension of the manufacturing licence.`,
        keyPoints: [
          "Autoclaving at 121 °C for 15 minutes is the gold-standard moist-heat sterilisation method for heat-stable products",
          "Aseptic filtration through 0.22 µm filters is used for thermolabile pharmaceuticals",
          "Ghana FDA GMP guidelines require documented validation of all sterilisation cycles",
          "Biological indicators such as Geobacillus stearothermophilus spores verify autoclave effectiveness",
        ],
        quiz: [
          {
            question:
              "What is the standard time-temperature combination for autoclaving pharmaceutical products?",
            options: [
              "100 °C for 30 minutes",
              "121 °C for 15 minutes",
              "160 °C for 2 hours",
              "134 °C for 3 minutes",
            ],
            correctIndex: 1,
          },
          {
            question:
              "Which sterilisation method is most appropriate for a heat-sensitive protein-based injectable?",
            options: [
              "Dry-heat sterilisation",
              "Autoclaving",
              "Filtration through a 0.22 µm membrane",
              "Ethylene oxide gas",
            ],
            correctIndex: 2,
          },
          {
            question:
              "Which biological indicator organism is used to validate autoclave cycles?",
            options: [
              "Geobacillus stearothermophilus",
              "Bacillus atrophaeus",
              "Escherichia coli",
              "Staphylococcus aureus",
            ],
            correctIndex: 0,
          },
        ],
      },
      {
        id: "pmicro-L3",
        title: "Antimicrobial Susceptibility Testing",
        duration: "50 min",
        content: `Antimicrobial susceptibility testing (AST) determines whether a specific microorganism is sensitive or resistant to particular antibiotics, guiding clinicians and pharmacists in selecting optimal therapy. The Minimum Inhibitory Concentration (MIC) is the lowest concentration of an antimicrobial agent that prevents visible growth of a bacterium after overnight incubation. MIC values are compared to clinical breakpoints published by the Clinical and Laboratory Standards Institute (CLSI) or the European Committee on Antimicrobial Susceptibility Testing (EUCAST) to classify isolates as susceptible, intermediate, or resistant. At KNUST's Department of Pharmaceutics and the Noguchi Memorial Institute for Medical Research at the University of Ghana, researchers routinely determine MICs for locally circulating pathogens.

The Kirby-Bauer disc diffusion method is the most widely used AST technique in Ghanaian hospital laboratories due to its simplicity and low cost. A standardised inoculum of the test organism is spread on Mueller-Hinton agar, antibiotic-impregnated discs are placed on the surface, and zone-of-inhibition diameters are measured after 16–18 hours of incubation at 35 °C. Results are interpreted using CLSI zone-diameter breakpoint tables. Automated systems such as VITEK 2 are available at some tertiary facilities, but resource constraints mean that disc diffusion remains the backbone of AST in most Ghanaian hospitals and reference laboratories.

Antimicrobial resistance (AMR) is a growing public health crisis in Ghana. Extended-spectrum beta-lactamase (ESBL)-producing Enterobacteriaceae and methicillin-resistant Staphylococcus aureus (MRSA) are increasingly reported in surveillance data from Korle Bu and Komfo Anokye Teaching Hospitals. The Ghana National Action Plan on AMR, aligned with WHO's Global Action Plan, calls for strengthened laboratory capacity, antibiotic stewardship programmes, and restrictions on over-the-counter antibiotic sales — all areas where pharmacists play a pivotal role.`,
        keyPoints: [
          "MIC is the lowest antibiotic concentration that inhibits visible bacterial growth",
          "The Kirby-Bauer disc diffusion method is the most common AST technique in Ghanaian laboratories",
          "CLSI breakpoints classify organisms as susceptible, intermediate, or resistant",
          "Ghana's National Action Plan on AMR emphasises antibiotic stewardship and pharmacist involvement",
        ],
        quiz: [
          {
            question:
              "What does MIC stand for in antimicrobial susceptibility testing?",
            options: [
              "Maximum Inhibitory Capacity",
              "Minimum Inhibitory Concentration",
              "Microbial Identification Code",
              "Mean Inhibition Coefficient",
            ],
            correctIndex: 1,
          },
          {
            question:
              "Which agar medium is standard for the Kirby-Bauer disc diffusion test?",
            options: [
              "Blood agar",
              "MacConkey agar",
              "Mueller-Hinton agar",
              "Sabouraud dextrose agar",
            ],
            correctIndex: 2,
          },
          {
            question:
              "ESBL-producing Enterobacteriaceae are resistant to which class of antibiotics?",
            options: [
              "Extended-spectrum cephalosporins and penicillins",
              "Aminoglycosides only",
              "Macrolides only",
              "Glycopeptides only",
            ],
            correctIndex: 0,
          },
        ],
      },
      {
        id: "pmicro-L4",
        title: "Microbial Contamination & Quality Control",
        duration: "45 min",
        content: `Microbial contamination of pharmaceutical products can lead to product spoilage, loss of potency, and serious patient harm, particularly in immunocompromised individuals. Contamination may originate from raw materials, water, manufacturing equipment, the production environment, or personnel. The United States Pharmacopeia (USP) chapters <61> and <62> — widely referenced by the Ghana FDA — describe methods for enumerating total aerobic microbial count (TAMC) and total combined yeast and mould count (TYMC), as well as tests for the absence of specified indicator organisms such as Escherichia coli, Salmonella, Pseudomonas aeruginosa, and Staphylococcus aureus.

Bioburden testing quantifies the microbial load on raw materials or in-process samples. USP acceptance criteria for non-sterile oral dosage forms typically allow a TAMC of not more than 10³ CFU/g and a TYMC of not more than 10² CFU/g, with absence of E. coli. Topical products have tighter limits, and sterile products must pass the USP <71> sterility test, which involves membrane filtration or direct inoculation into fluid thioglycolate medium (for bacteria) and soybean-casein digest medium (for fungi), followed by 14 days of incubation. Local pharmaceutical manufacturers in Ghana, such as Danadams, Tobinco, and Ernest Chemists, must conduct these tests as part of batch-release protocols overseen by the Ghana FDA.

Preservative effectiveness testing (PET), described in USP <51>, ensures that multi-dose liquid formulations resist microbial contamination during their shelf life. The test challenges the product with defined inocula of bacteria, yeast, and mould and monitors log reductions over 28 days. Failure to pass PET may require reformulation with alternative preservatives or a change in container-closure system. Pharmacists involved in extemporaneous compounding at Ghanaian hospital pharmacies must also apply these principles to ensure the microbiological quality of their preparations.`,
        keyPoints: [
          "USP <61> and <62> describe microbial enumeration and indicator-organism testing for non-sterile products",
          "Non-sterile oral products must have TAMC ≤ 10³ CFU/g and TYMC ≤ 10² CFU/g per USP limits",
          "Sterility testing per USP <71> requires 14 days of incubation in thioglycolate and soybean-casein digest media",
          "Ghana FDA oversees batch-release microbial quality control for all locally manufactured pharmaceuticals",
        ],
        quiz: [
          {
            question:
              "Which USP chapter describes the sterility test for pharmaceutical products?",
            options: [
              "USP <51>",
              "USP <61>",
              "USP <71>",
              "USP <62>",
            ],
            correctIndex: 2,
          },
          {
            question:
              "What is the maximum allowable total aerobic microbial count (TAMC) for a non-sterile oral dosage form according to USP?",
            options: [
              "10² CFU/g",
              "10⁴ CFU/g",
              "10⁵ CFU/g",
              "10³ CFU/g",
            ],
            correctIndex: 3,
          },
          {
            question:
              "Preservative effectiveness testing (PET) monitors microbial log reductions over how many days?",
            options: [
              "7 days",
              "14 days",
              "28 days",
              "56 days",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "pmicro-L5",
        title: "Good Manufacturing Practice (GMP) Microbiology",
        duration: "55 min",
        content: `Good Manufacturing Practice (GMP) microbiology ensures that pharmaceutical manufacturing environments are designed, monitored, and controlled to minimise microbial contamination of drug products. Cleanrooms are classified by the maximum allowable number of airborne particles per cubic metre: ISO Class 5 (Grade A) areas are used for high-risk aseptic operations, while ISO Class 7 (Grade C) and ISO Class 8 (Grade D) areas serve as supporting environments. The Ghana FDA, guided by WHO GMP standards, requires local manufacturers to validate their cleanroom HVAC systems, maintain differential air pressures, and demonstrate compliance through regular environmental monitoring. Facilities at Entrance Pharmaceuticals and LaGray Chemical Company, among others, undergo periodic GMP inspections by the Ghana FDA.

Environmental monitoring (EM) programmes measure both viable and non-viable airborne particles, as well as surface microbial contamination. Settle plates, active air samplers, and contact plates (RODAC plates) are used to collect viable samples from critical and non-critical zones. WHO recommends action limits of less than 1 CFU per plate for Grade A zones and less than 100 CFU per plate for Grade D zones. Water used in pharmaceutical manufacturing must meet pharmacopoeial specifications: Purified Water (PW) has a microbial limit of 100 CFU/mL, while Water for Injection (WFI) must contain fewer than 10 CFU/100 mL and be free of bacterial endotoxins above 0.25 EU/mL.

Personnel are the single largest source of microbial contamination in cleanrooms. Gowning procedures, including the use of sterile gloves, face masks, head covers, and shoe covers, must be validated through microbiological monitoring of the operator's garments. In Ghana, the Pharmacy Council's Continuing Professional Development (CPD) programme includes GMP microbiology modules, ensuring that production pharmacists remain current with evolving WHO and PIC/S standards. Trend analysis of environmental monitoring data is essential for detecting excursions early and implementing corrective and preventive actions (CAPA).`,
        keyPoints: [
          "Cleanrooms are classified from ISO Class 5 (Grade A) for aseptic operations to ISO Class 8 (Grade D) for support areas",
          "Environmental monitoring uses settle plates, active air samplers, and contact plates to measure viable contamination",
          "Water for Injection must contain < 10 CFU/100 mL and endotoxin levels below 0.25 EU/mL",
          "Ghana FDA GMP inspections verify cleanroom validation, environmental monitoring, and personnel gowning procedures",
        ],
        quiz: [
          {
            question:
              "Which ISO cleanroom class corresponds to WHO Grade A, used for high-risk aseptic filling?",
            options: [
              "ISO Class 5",
              "ISO Class 7",
              "ISO Class 8",
              "ISO Class 3",
            ],
            correctIndex: 0,
          },
          {
            question:
              "What is the pharmacopoeial microbial limit for Water for Injection (WFI)?",
            options: [
              "100 CFU/mL",
              "50 CFU/mL",
              "< 10 CFU/100 mL",
              "Zero CFU — absolute sterility",
            ],
            correctIndex: 2,
          },
          {
            question:
              "Which sampling method uses agar plates exposed to the environment for a set time to detect airborne microorganisms?",
            options: [
              "Active air sampling",
              "Membrane filtration",
              "Settle plates",
              "Contact (RODAC) plates",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "pmicro-L6",
        title: "Hospital & Community Pharmacy Infection Control",
        duration: "35 min",
        content: `Infection control in pharmacy settings aims to prevent healthcare-associated infections (HAIs) among patients, staff, and the community. The WHO's "Five Moments for Hand Hygiene" framework is adopted across Ghana Health Service facilities, including pharmacy departments at Korle Bu Teaching Hospital, 37 Military Hospital, and Tamale Teaching Hospital. Pharmacists must perform hand hygiene before preparing medications, before and after patient contact, and after touching potentially contaminated surfaces. Alcohol-based hand rubs (60–80 % ethanol or isopropanol) are the preferred method when hands are not visibly soiled, while soap and water are required after contact with spore-forming organisms such as Clostridioides difficile.

Aseptic technique is critical when pharmacists compound sterile preparations such as intravenous admixtures, total parenteral nutrition (TPN), and ophthalmic solutions. The compounding area must meet at minimum ISO Class 5 conditions at the point of work, typically achieved with a laminar airflow workbench. In Ghana, hospital pharmacies that prepare cytotoxic agents must additionally use biological safety cabinets with HEPA-filtered exhaust to protect operators and prevent environmental contamination. The Pharmacy Council's Standards for Pharmaceutical Services require that all sterile compounding personnel complete initial competency assessments and annual re-validation, including aseptic technique simulation tests (media fills).

Community pharmacies in Ghana, many operating under the National Health Insurance Scheme (NHIS), also bear infection-control responsibilities. Proper storage of reconstituted antibiotics, single-use dispensing of controlled substances, and routine disinfection of dispensing surfaces reduce cross-contamination risks. The Ghana FDA's Guidelines for Licensing of Pharmacy Premises specify minimum hygiene standards, including availability of handwashing stations and proper waste segregation. Pharmacists should educate patients on completing full antibiotic courses, safe needle disposal for insulin users, and the importance of vaccination — all critical public health interventions that support the NHIS goal of universal health coverage.`,
        keyPoints: [
          "WHO's Five Moments for Hand Hygiene is the standard framework adopted across Ghana Health Service pharmacy departments",
          "Sterile compounding requires ISO Class 5 conditions at the point of work, typically via laminar airflow workbenches",
          "Pharmacy Council standards mandate annual re-validation of aseptic technique for sterile compounding personnel",
          "NHIS-accredited community pharmacies must maintain handwashing stations and proper waste segregation per Ghana FDA licensing guidelines",
        ],
        quiz: [
          {
            question:
              "According to WHO, what concentration range of ethanol in alcohol-based hand rubs is considered effective?",
            options: [
              "40–50 %",
              "60–80 %",
              "90–100 %",
              "20–30 %",
            ],
            correctIndex: 1,
          },
          {
            question:
              "What type of equipment must be used when compounding cytotoxic agents in a hospital pharmacy?",
            options: [
              "Laminar airflow workbench with horizontal flow",
              "Biological safety cabinet with HEPA-filtered exhaust",
              "Standard fume hood",
              "Open bench with face shield",
            ],
            correctIndex: 1,
          },
          {
            question:
              "Which organism requires handwashing with soap and water rather than alcohol-based hand rub due to spore formation?",
            options: [
              "Clostridioides difficile",
              "Staphylococcus aureus",
              "Escherichia coli",
              "Candida albicans",
            ],
            correctIndex: 0,
          },
        ],
      },
    ],
  },
  "pharmaceutics": {
    id: "pharmaceutics",
    title: "Pharmaceutics & Dosage Forms",
    description:
      "A comprehensive course on the science of dosage form design, formulation, and manufacturing. Covers solid, liquid, semi-solid, parenteral, and novel drug delivery systems with emphasis on Ghana's pharmaceutical landscape and regulatory standards.",
    estimatedTime: "5.5 hours",
    lessons: [
      {
        id: "phtics-L1",
        title: "Introduction to Dosage Forms",
        duration: "45 min",
        content: `Pharmaceutics is the discipline of pharmacy that deals with the design, formulation, manufacture, and evaluation of dosage forms. A dosage form is the physical form in which a drug is presented for administration — whether as a tablet, capsule, syrup, injection, or cream. Understanding dosage forms is essential for every Ghanaian pharmacist, as the choice of dosage form directly influences drug bioavailability, patient compliance, and therapeutic outcomes. The Ghana Essential Medicines List (EML) catalogues hundreds of formulations across multiple dosage form categories, reflecting the diversity of clinical needs in the country.\n\nDosage forms are broadly classified into four categories: solid (tablets, capsules, powders, granules), liquid (solutions, suspensions, emulsions, syrups), semi-solid (ointments, creams, gels, pastes), and parenteral (injectables, infusions). Each category has distinct formulation requirements, stability profiles, and manufacturing processes. In Ghana, solid oral dosage forms dominate the pharmaceutical market, with local manufacturers such as Danadams Pharmaceutical Industry, Entrance Pharmaceuticals, and Ernest Chemists producing a wide range of tablets and capsules that appear on the Ghana EML.\n\nThe Pharmacy Council of Ghana and the Ghana Food and Drugs Authority (FDA) set stringent standards for dosage form quality, requiring compliance with pharmacopoeial specifications for identity, purity, strength, and stability. Pharmacists must understand these standards to ensure that every dispensed product meets the required quality benchmarks, whether sourced from local manufacturers or imported.`,
        keyPoints: [
          "Dosage forms are classified into solid, liquid, semi-solid, and parenteral categories",
          "The Ghana Essential Medicines List guides formulary decisions across the health system",
          "Local manufacturers like Danadams, Entrance Pharma, and Ernest Chemists produce key dosage forms",
          "Ghana FDA and Pharmacy Council enforce pharmacopoeial quality standards for all dosage forms",
        ],
        quiz: [
          {
            question: "Which of the following is NOT a major classification of dosage forms?",
            options: [
              "Solid",
              "Gaseous",
              "Semi-solid",
              "Parenteral",
            ],
            correctIndex: 1,
          },
          {
            question: "Which Ghanaian institution is responsible for regulating the quality of pharmaceutical dosage forms?",
            options: [
              "Ghana Health Service",
              "Ghana Food and Drugs Authority",
              "Ministry of Finance",
              "National Health Insurance Authority",
            ],
            correctIndex: 1,
          },
          {
            question: "Which dosage form category dominates the Ghanaian pharmaceutical market?",
            options: [
              "Parenteral products",
              "Semi-solid preparations",
              "Solid oral dosage forms",
              "Transdermal patches",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "phtics-L2",
        title: "Tablet Formulation & Manufacturing",
        duration: "55 min",
        content: `Tablets are the most widely used solid dosage form worldwide and in Ghana, accounting for the majority of prescriptions dispensed in community and hospital pharmacies. Tablet formulation involves combining the active pharmaceutical ingredient (API) with carefully selected excipients — binders (e.g., polyvinylpyrrolidone, starch paste), disintegrants (e.g., croscarmellose sodium, sodium starch glycolate), lubricants (e.g., magnesium stearate), glidants (e.g., colloidal silicon dioxide), and fillers (e.g., lactose, microcrystalline cellulose). Each excipient plays a specific role in ensuring the tablet can be manufactured reproducibly and performs as intended in the patient's body.\n\nThe two principal manufacturing methods are wet granulation and direct compression. Wet granulation involves mixing the API and excipients with a granulating fluid to form granules that are then dried, sized, and compressed. This method improves flow properties and content uniformity but requires additional processing steps. Direct compression, on the other hand, blends the API with directly compressible excipients and feeds the mixture straight into a tablet press, offering lower cost and shorter processing time. Ghanaian manufacturers such as Danadams Pharmaceutical Industry employ both methods depending on the drug's properties. Film coating and sugar coating are applied to improve appearance, mask taste, or provide enteric protection.\n\nQuality control of tablets is governed by pharmacopoeial tests including weight uniformity, hardness (crushing strength), friability, disintegration time, and dissolution testing. The Ghana FDA requires that all locally manufactured and imported tablets meet British Pharmacopoeia (BP) or United States Pharmacopoeia (USP) standards. Dissolution testing is particularly critical as it serves as an in-vitro surrogate for in-vivo bioavailability, ensuring that generic tablets perform equivalently to the innovator product.`,
        keyPoints: [
          "Key tablet excipients include binders, disintegrants, lubricants, glidants, and fillers",
          "Wet granulation and direct compression are the two main tablet manufacturing methods",
          "Film coating masks taste, improves appearance, or provides enteric protection",
          "Dissolution testing is a critical quality control measure for tablet bioequivalence",
        ],
        quiz: [
          {
            question: "Which excipient class helps a tablet break apart in the GI tract?",
            options: [
              "Lubricants",
              "Binders",
              "Disintegrants",
              "Glidants",
            ],
            correctIndex: 2,
          },
          {
            question: "Direct compression differs from wet granulation because it:",
            options: [
              "Requires a granulating fluid",
              "Eliminates the granulation and drying steps",
              "Always produces coated tablets",
              "Cannot be used with excipients",
            ],
            correctIndex: 1,
          },
          {
            question: "Dissolution testing of tablets serves as a surrogate for:",
            options: [
              "Tablet hardness",
              "In-vivo bioavailability",
              "Powder flow properties",
              "Excipient compatibility",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "phtics-L3",
        title: "Liquid Dosage Forms",
        duration: "50 min",
        content: `Liquid dosage forms are indispensable in Ghanaian healthcare, particularly for paediatric and geriatric patients who cannot swallow solid dosage forms. They include solutions (homogeneous mixtures of solute and solvent), suspensions (dispersions of insoluble drug particles in a liquid medium), emulsions (dispersions of two immiscible liquids stabilised by an emulsifying agent), syrups (concentrated aqueous sugar solutions), and elixirs (hydroalcoholic sweetened solutions). Oral Rehydration Salt (ORS) solution is one of the most critical liquid formulations in Ghana, used extensively to manage dehydration from diarrhoeal diseases — a leading cause of childhood morbidity. The WHO/UNICEF low-osmolarity ORS formula is standard in Ghanaian health facilities.\n\nFormulating stable liquid dosage forms requires careful attention to solubility, pH, viscosity, preservative selection, and flavouring. Suspensions pose particular challenges because the dispersed particles tend to sediment; formulators use suspending agents such as xanthan gum, methylcellulose, or bentonite to retard settling and ensure dose uniformity upon shaking. Emulsions require appropriate HLB (hydrophilic-lipophilic balance) values for the emulsifier to maintain stability. In Ghana's tropical climate, microbial growth is a significant concern, necessitating effective preservative systems — commonly methylparaben and propylparaben or sodium benzoate — and adherence to BP limits for microbial contamination.\n\nGhanaian pharmaceutical companies like Ernest Chemists and Entrance Pharmaceuticals produce a range of liquid dosage forms including paracetamol suspensions, antacid suspensions, and cough syrups for the local market. The Ghana FDA requires that all liquid formulations pass content uniformity, pH, viscosity, microbial limit, and stability testing before market authorisation. Pharmacists dispensing these products must counsel patients on proper storage (often below 25°C), shaking before use for suspensions, and the use of accurate measuring devices.`,
        keyPoints: [
          "ORS solution is a critical liquid formulation for managing dehydration in Ghana",
          "Suspending agents retard sedimentation and ensure dose uniformity in suspensions",
          "Preservative systems are essential in tropical climates to prevent microbial growth",
          "Liquid dosage forms must pass content uniformity, pH, viscosity, and microbial limit tests",
        ],
        quiz: [
          {
            question: "Which type of liquid dosage form contains insoluble drug particles dispersed in a liquid medium?",
            options: [
              "Solution",
              "Elixir",
              "Suspension",
              "Syrup",
            ],
            correctIndex: 2,
          },
          {
            question: "The HLB value is most relevant when formulating:",
            options: [
              "Tablets",
              "Emulsions",
              "Capsules",
              "Suppositories",
            ],
            correctIndex: 1,
          },
          {
            question: "Why is preservative selection especially important for liquid dosage forms in Ghana?",
            options: [
              "To improve taste",
              "To increase drug solubility",
              "To prevent microbial growth in tropical conditions",
              "To reduce manufacturing costs",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "phtics-L4",
        title: "Semi-solid Dosage Forms",
        duration: "45 min",
        content: `Semi-solid dosage forms — ointments, creams, gels, pastes, and suppositories — are formulated for topical, rectal, or vaginal administration. They are widely used in Ghana for dermatological conditions (fungal infections, eczema, wounds), musculoskeletal pain, and haemorrhoids. Ointments are greasy preparations based on hydrocarbon bases such as white soft paraffin or wool fat, providing an occlusive barrier that enhances drug penetration and protects wounded skin. Creams are semi-solid emulsions — either oil-in-water (O/W) or water-in-oil (W/O) — that are more cosmetically acceptable and easier to wash off than ointments. Gels are semirigid systems in which a liquid phase is constrained within a polymeric matrix, offering a non-greasy feel favoured by patients.\n\nFormulation of semi-solids in Ghana's tropical climate presents unique stability challenges. High ambient temperatures (often exceeding 30°C) can cause phase separation in creams, softening of ointments, and syneresis (liquid expulsion) in gels. Formulators must select appropriate emulsifying systems, thickening agents, and antioxidants to ensure product integrity throughout the shelf life. Suppositories, formulated with bases such as cocoa butter or polyethylene glycol (PEG), must have melting points carefully calibrated — cocoa butter suppositories should melt at body temperature (around 37°C) but remain solid during storage in warm environments, which can be problematic without cold chain facilities.\n\nLocal Ghanaian manufacturers produce semi-solid products including antifungal creams (clotrimazole, miconazole), anti-inflammatory gels (diclofenac), and wound care ointments. The Ghana FDA requires semi-solid products to meet specifications for drug content, pH, viscosity, microbial limits, and tube or container integrity. Pharmacists must educate patients on correct application techniques, appropriate quantities, and storage requirements to maximise therapeutic benefit.`,
        keyPoints: [
          "Ointments provide occlusive barriers while creams are emulsion-based and more cosmetically elegant",
          "Tropical temperatures in Ghana pose stability challenges including phase separation and softening",
          "Suppository base melting points must be carefully calibrated for tropical storage conditions",
          "Ghana FDA requires semi-solid products to meet specifications for content, pH, viscosity, and microbial limits",
        ],
        quiz: [
          {
            question: "An oil-in-water cream is generally preferred over an ointment because it is:",
            options: [
              "More occlusive",
              "More cosmetically acceptable and easier to wash off",
              "More stable at high temperatures",
              "Less likely to contain preservatives",
            ],
            correctIndex: 1,
          },
          {
            question: "Syneresis in gels refers to:",
            options: [
              "Increased viscosity over time",
              "Expulsion of liquid from the gel matrix",
              "Colour change during storage",
              "Enhanced drug release",
            ],
            correctIndex: 1,
          },
          {
            question: "Cocoa butter suppositories are challenging in Ghana because:",
            options: [
              "They are too expensive to manufacture",
              "They may melt during storage in warm environments",
              "They are not listed on the Ghana EML",
              "They cannot contain active drugs",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "phtics-L5",
        title: "Parenteral & Sterile Products",
        duration: "50 min",
        content: `Parenteral dosage forms are sterile preparations intended for administration by injection or infusion, bypassing the gastrointestinal tract. They include intravenous (IV) solutions, intramuscular (IM) injections, subcutaneous (SC) injections, and large-volume parenteral (LVP) infusions such as Normal Saline, Ringer's Lactate, and 5% Dextrose. In Ghana, parenteral products are critical in hospital settings for managing severe malaria, surgical patients, dehydration, and emergency care. Aseptic manufacturing is the cornerstone of parenteral production — any microbial contamination can lead to life-threatening sepsis or endotoxin reactions.\n\nFormulation of parenteral products demands strict control of tonicity, pH, particulate matter, pyrogenicity, and sterility. Isotonic solutions (approximately 0.9% NaCl equivalent) prevent haemolysis or crenation of red blood cells. Buffers maintain pH within the acceptable range of 3–9 for IV products. Water for Injection (WFI) is produced by distillation or reverse osmosis and must meet stringent limits for endotoxins (less than 0.25 EU/mL). Reconstitution of lyophilised (freeze-dried) products — such as certain antibiotics (e.g., ceftriaxone, ampicillin) — requires pharmacists to use the correct diluent and volume, a common point of error in Ghanaian hospital pharmacies.\n\nSterility assurance relies on terminal sterilisation (autoclaving at 121°C for 15 minutes) where possible, or aseptic processing in cleanroom environments with HEPA-filtered laminar airflow for heat-sensitive products. The Ghana FDA inspects local parenteral manufacturers and requires compliance with WHO Good Manufacturing Practice (GMP) guidelines. Facilities such as the Korle Bu Teaching Hospital pharmacy and regional hospital pharmacies prepare IV admixtures and must maintain strict aseptic technique. Pharmacists play a pivotal role in checking compatibility of IV additives, calculating infusion rates, and monitoring for adverse reactions.`,
        keyPoints: [
          "Parenteral products must be sterile, pyrogen-free, and isotonic for safe administration",
          "Water for Injection must meet endotoxin limits of less than 0.25 EU/mL",
          "Reconstitution of lyophilised drugs is a common source of medication errors in hospitals",
          "Ghana FDA requires WHO GMP compliance for all parenteral product manufacturers",
        ],
        quiz: [
          {
            question: "An isotonic IV solution has a sodium chloride equivalent of approximately:",
            options: [
              "0.45%",
              "0.9%",
              "3%",
              "5%",
            ],
            correctIndex: 1,
          },
          {
            question: "Terminal sterilisation by autoclaving is typically performed at:",
            options: [
              "100°C for 30 minutes",
              "121°C for 15 minutes",
              "160°C for 2 hours",
              "80°C for 1 hour",
            ],
            correctIndex: 1,
          },
          {
            question: "Pyrogens in parenteral products are dangerous because they cause:",
            options: [
              "Drug degradation",
              "Fever and potentially fatal reactions",
              "Changes in drug colour",
              "Increased viscosity",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "phtics-L6",
        title: "Drug Delivery Systems & Modified Release",
        duration: "40 min",
        content: `Modified-release drug delivery systems are designed to alter the rate, timing, or site of drug release to improve therapeutic outcomes, reduce dosing frequency, and minimise side effects. Controlled-release (CR) tablets use matrix systems (hydrophilic polymers like HPMC or hydrophobic waxes) or reservoir systems (coated pellets or osmotic pumps) to provide sustained drug release over 12–24 hours. Extended-release formulations of common medications such as metformin XR, nifedipine OROS, and theophylline SR are included on the Ghana EML and are regularly dispensed in Ghanaian pharmacies. Pharmacists must counsel patients never to crush or chew these formulations, as this destroys the release mechanism and can cause dose dumping.\n\nTransdermal drug delivery systems (TDDS) deliver drugs through the skin into systemic circulation via adhesive patches. Examples include fentanyl patches for chronic pain and nicotine patches for smoking cessation. While less commonly used in Ghana compared to oral formulations, transdermal systems offer advantages of steady-state plasma levels, avoidance of first-pass metabolism, and improved patient compliance. Nanotechnology-based drug delivery — including liposomes, polymeric nanoparticles, and solid lipid nanoparticles — represents the frontier of pharmaceutics research. Researchers at KNUST (Kwame Nkrumah University of Science and Technology) Department of Pharmaceutics and the University of Ghana School of Pharmacy are actively investigating nanoparticle formulations for targeted delivery of antimalarials and anticancer agents.\n\nThe Ghanaian pharmaceutical research landscape is growing, with institutions like KNUST, University of Ghana, and the Centre for Plant Medicine Research exploring locally sourced excipients (e.g., cashew gum, shea butter) for novel drug delivery applications. These efforts align with the African Union's Pharmaceutical Manufacturing Plan for Africa (PMPA), which encourages local innovation and self-sufficiency. Pharmacists graduating in Ghana should be conversant with these emerging technologies, as they will increasingly influence formulary decisions and patient care in the coming decades.`,
        keyPoints: [
          "Controlled-release systems use matrix or reservoir mechanisms to sustain drug release",
          "Patients must never crush modified-release formulations to avoid dose dumping",
          "KNUST and University of Ghana researchers are advancing nanoparticle drug delivery for antimalarials",
          "Locally sourced excipients like cashew gum and shea butter are being explored for novel formulations",
        ],
        quiz: [
          {
            question: "Dose dumping occurs when a modified-release tablet is:",
            options: [
              "Stored at high temperature",
              "Crushed or chewed before swallowing",
              "Taken with food",
              "Administered intravenously",
            ],
            correctIndex: 1,
          },
          {
            question: "Which Ghanaian university is actively researching nanoparticle drug delivery systems?",
            options: [
              "University of Cape Coast",
              "KNUST",
              "University of Education, Winneba",
              "Ghana Institute of Management",
            ],
            correctIndex: 1,
          },
          {
            question: "Transdermal drug delivery offers which advantage over oral administration?",
            options: [
              "Faster onset of action",
              "Lower cost",
              "Avoidance of first-pass metabolism",
              "Higher bioavailability for all drugs",
            ],
            correctIndex: 2,
          },
        ],
      },
    ],
  },
  "herbal-medicine": {
    id: "herbal-medicine",
    title: "Traditional & Herbal Medicine Regulation",
    description:
      "A comprehensive course exploring traditional and herbal medicine regulation in Ghana, covering the Traditional Medicine Practice Council, Ghana FDA registration of herbal products, quality control and standardization, common Ghanaian medicinal plants, herbal-drug interactions, and evidence-based practice in traditional medicine.",
    estimatedTime: "4.5 hours",
    lessons: [
      {
        id: "herb-L1",
        title: "Traditional Medicine in Ghana",
        duration: "40 min",
        content: `Traditional medicine has been practised in Ghana for centuries and remains the first point of healthcare contact for a significant proportion of the population, particularly in rural communities. The World Health Organization estimates that up to 80% of Africans rely on traditional medicine for primary healthcare. In Ghana, traditional healers — known locally as "adunsifo" among the Akan, "tsofatsɛ" among the Ga, and "tiim daan" among the Dagomba — occupy respected positions in their communities and possess rich ethnomedical knowledge passed down through oral tradition and apprenticeship.\n\nThe integration of traditional medicine into Ghana's formal healthcare system gained momentum with the establishment of the Traditional Medicine Practice Council (TMPC) under the Traditional Medicine Practice Act, 2000 (Act 575). The TMPC is mandated to register and regulate traditional medicine practitioners, ensure standards of practice, and promote research into traditional medicine. The Centre for Plant Medicine Research (CPMR) in Mampong-Akuapem, established in 1975, serves as the country's premier institution for scientific validation of traditional remedies and has developed several phytomedicines that are now commercially available in Ghanaian pharmacies.\n\nThe KNUST Department of Herbal Medicine, established in 2001 within the Faculty of Pharmacy and Pharmaceutical Sciences, offers a Bachelor of Science in Herbal Medicine — the first of its kind in Africa. Graduates are recognised as Medical Herbalists and can practise alongside orthodox medical professionals. Ghana's approach to integrating traditional and modern medicine is considered a model for other African countries, with traditional medicine clinics now operating within several public hospitals including Kumasi South Hospital and Tafo Government Hospital.`,
        keyPoints: [
          "The Traditional Medicine Practice Council (TMPC) was established under Act 575 of 2000 to regulate traditional medicine in Ghana",
          "The Centre for Plant Medicine Research (CPMR) in Mampong-Akuapem scientifically validates traditional remedies",
          "KNUST offers Africa's first BSc in Herbal Medicine through its Department of Herbal Medicine",
          "Traditional medicine clinics now operate within several Ghanaian public hospitals as part of integration efforts",
        ],
        quiz: [
          {
            question: "Which Act established the Traditional Medicine Practice Council in Ghana?",
            options: [
              "Traditional Medicine Practice Act, 2000 (Act 575)",
              "Health Professions Regulatory Bodies Act, 2013 (Act 857)",
              "Food and Drugs Authority Act, 2012 (Act 851)",
              "Pharmacy Act, 1994 (Act 489)",
            ],
            correctIndex: 0,
          },
          {
            question: "Where is the Centre for Plant Medicine Research (CPMR) located?",
            options: [
              "Accra",
              "Kumasi",
              "Mampong-Akuapem",
              "Tamale",
            ],
            correctIndex: 2,
          },
          {
            question: "Which Ghanaian university offers the first BSc in Herbal Medicine programme in Africa?",
            options: [
              "University of Ghana",
              "University of Cape Coast",
              "Kwame Nkrumah University of Science and Technology (KNUST)",
              "University for Development Studies",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "herb-L2",
        title: "Ghana FDA Registration of Herbal Products",
        duration: "45 min",
        content: `The Food and Drugs Authority (FDA) of Ghana, established under the Public Health Act, 2012 (Act 851), is the primary regulatory body responsible for ensuring that herbal medicinal products manufactured, imported, exported, distributed, sold, or used in Ghana are safe, effective, and of acceptable quality. All herbal medicinal products must be registered with the Ghana FDA before they can be legally marketed. The FDA classifies herbal medicines under its drug registration framework and requires applicants to submit comprehensive dossiers including product formulation details, evidence of safety and efficacy, manufacturing information, and proposed labelling.\n\nThe registration process for herbal medicines involves several stages. Applicants must first submit a pre-registration application, followed by a full dossier that includes botanical identification and authentication of plant materials, standardized manufacturing procedures compliant with Good Manufacturing Practice (GMP), stability studies demonstrating product shelf life, and evidence of safety from toxicological studies. The Ghana FDA has adopted a tiered evidence approach: products with a long history of traditional use may rely on bibliographic evidence and documented traditional knowledge, while products making specific therapeutic claims require clinical data. The FDA also conducts facility inspections and post-market surveillance including random sampling and testing of products on the market.\n\nLabelling requirements for registered herbal products are stringent. Every product must display the FDA registration number, the full list of ingredients with botanical names, the dosage form, directions for use, contraindications, warnings, the batch number, manufacturing and expiry dates, the name and address of the manufacturer, and appropriate storage conditions. The FDA has been increasingly active in enforcement, regularly publishing lists of unapproved products and issuing public alerts about adulterated herbal preparations — particularly those found to contain undeclared orthodox medicines such as corticosteroids, sildenafil, or paracetamol.`,
        keyPoints: [
          "All herbal medicinal products must be registered with the Ghana FDA before legal marketing under the Public Health Act, 2012 (Act 851)",
          "The FDA uses a tiered evidence approach where traditionally used products may rely on bibliographic evidence while therapeutic claims require clinical data",
          "Registered herbal products must display FDA registration number, full ingredient list with botanical names, dosage, and contraindications",
          "The FDA conducts post-market surveillance and regularly alerts the public about adulterated herbal products containing undeclared orthodox medicines",
        ],
        quiz: [
          {
            question: "Under which Act was the current Ghana Food and Drugs Authority established?",
            options: [
              "Public Health Act, 2012 (Act 851)",
              "Food and Drugs Law, 1992 (PNDCL 305B)",
              "Traditional Medicine Practice Act, 2000 (Act 575)",
              "Pharmacy Act, 1994 (Act 489)",
            ],
            correctIndex: 0,
          },
          {
            question: "What type of evidence does the Ghana FDA accept for herbal products with a long history of traditional use?",
            options: [
              "Only randomized clinical trial data",
              "Bibliographic evidence and documented traditional knowledge",
              "Animal toxicology studies only",
              "No evidence is required for traditional products",
            ],
            correctIndex: 1,
          },
          {
            question: "Which of the following is a common adulterant found in unapproved herbal preparations in Ghana?",
            options: [
              "Vitamin C",
              "Folic acid",
              "Corticosteroids",
              "Iron supplements",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "herb-L3",
        title: "Herbal-Drug Interactions",
        duration: "50 min",
        content: `Herbal-drug interactions represent a critical safety concern in Ghana where many patients concurrently use herbal preparations and orthodox medicines, often without informing their healthcare providers. These interactions can be pharmacokinetic — affecting the absorption, distribution, metabolism, or excretion of conventional drugs — or pharmacodynamic, where herbal constituents produce additive, synergistic, or antagonistic effects at the site of drug action. The cytochrome P450 (CYP450) enzyme system, particularly CYP3A4, CYP2D6, CYP1A2, and CYP2C9, plays a central role in many herbal-drug interactions, as numerous phytochemicals can induce or inhibit these metabolic enzymes.\n\nSeveral Ghanaian herbal medicines have documented interaction potential. Cryptolepis sanguinolenta (Nibima), widely used as an antimalarial and for the management of type 2 diabetes, contains cryptolepine which has been shown to inhibit CYP3A4 and CYP2D6, potentially increasing plasma levels of co-administered drugs metabolised by these enzymes. Neem (Azadirachta indica, known locally as "nim" or "dua gu") leaf preparations, commonly used as antimalarials and antipyretics, may potentiate the hypoglycaemic effects of antidiabetic drugs such as metformin and glibenclamide. Moringa oleifera, widely consumed as a nutritional supplement and antihypertensive, may interact with antihypertensive medications through additive blood pressure-lowering effects and has been reported to affect the absorption of levothyroxine.\n\nPharmacists in Ghana play a vital role in identifying and preventing herbal-drug interactions. This requires routinely asking patients about herbal medicine use during dispensing, being knowledgeable about the pharmacological properties of commonly used local herbs, and documenting suspected adverse reactions through the Ghana FDA's Safety Monitoring and Clinical Trials Division. The University of Ghana School of Pharmacy and KNUST Department of Pharmacology have contributed significantly to researching the interaction profiles of Ghanaian herbal medicines, with several studies published in the Ghana Medical Journal and the Journal of Ethnopharmacology.`,
        keyPoints: [
          "Herbal-drug interactions can be pharmacokinetic (affecting CYP450 metabolism) or pharmacodynamic (additive or antagonistic effects at drug targets)",
          "Cryptolepis sanguinolenta (Nibima) inhibits CYP3A4 and CYP2D6, potentially raising levels of co-administered drugs",
          "Neem leaf preparations may potentiate hypoglycaemic effects of antidiabetic drugs like metformin and glibenclamide",
          "Pharmacists should routinely ask patients about herbal medicine use and report adverse reactions to the Ghana FDA Safety Monitoring Division",
        ],
        quiz: [
          {
            question: "Which cytochrome P450 enzymes are inhibited by cryptolepine from Cryptolepis sanguinolenta?",
            options: [
              "CYP3A4 and CYP2D6",
              "CYP1A2 and CYP2C19",
              "CYP2E1 and CYP2B6",
              "CYP2C9 and CYP3A5",
            ],
            correctIndex: 0,
          },
          {
            question: "What type of interaction can occur when Neem preparations are taken alongside metformin?",
            options: [
              "Reduced antimalarial efficacy",
              "Potentiation of hypoglycaemic effects",
              "Increased hepatotoxicity",
              "Antagonism of antihypertensive effects",
            ],
            correctIndex: 1,
          },
          {
            question: "Which division of the Ghana FDA handles adverse reaction reports from herbal medicines?",
            options: [
              "Drug Registration Division",
              "Food Division",
              "Safety Monitoring and Clinical Trials Division",
              "Environmental Health Division",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "herb-L4",
        title: "Quality Control & Standardization of Herbal Medicines",
        duration: "45 min",
        content: `Quality control and standardization of herbal medicines are essential to ensuring their safety, efficacy, and batch-to-batch consistency. Unlike orthodox medicines that contain single, well-characterised active pharmaceutical ingredients, herbal medicines are complex mixtures of hundreds of phytochemicals whose composition can vary depending on the plant species, part used, geographical origin, harvesting time, post-harvest processing, and storage conditions. In Ghana, the Centre for Plant Medicine Research (CPMR) in Mampong-Akuapem has been at the forefront of developing quality control protocols for herbal medicines, using techniques such as chromatographic fingerprinting, marker compound quantification, and organoleptic evaluation.\n\nKey analytical techniques employed in herbal medicine quality control include Thin Layer Chromatography (TLC) for rapid fingerprint profiling and identification of plant materials, and High Performance Liquid Chromatography (HPLC) for quantitative determination of marker compounds and active constituents. HPLC is considered the gold standard for herbal medicine standardization as it provides precise, reproducible quantification of specific phytochemicals. The Ghana Pharmacopoeia, along with pharmacopoeial monographs from the WHO, African Pharmacopoeia, and British Pharmacopoeia, provides reference standards for the identification and quality assessment of medicinal plants. Additional tests include determination of moisture content, total ash, acid-insoluble ash, extractive values, and screening for heavy metals (lead, mercury, arsenic, cadmium) and microbial contamination.\n\nThe CPMR Mampong has developed standardized phytomedicines from Ghanaian medicinal plants, including products for malaria, diabetes, hypertension, and wound healing. Their quality control laboratory employs both traditional pharmacognostic methods and modern analytical instrumentation. KNUST's Department of Herbal Medicine and Department of Pharmaceutical Chemistry collaborate on research into standardization of herbal products, and several Ghanaian herbal manufacturing companies such as the Centre for Scientific Research into Plant Medicine (CSRPM) products and KADICOF have adopted GMP-compliant manufacturing processes with in-house quality control laboratories.`,
        keyPoints: [
          "Herbal medicines require rigorous quality control due to complex phytochemical composition that varies with species, geography, harvest time, and processing",
          "TLC provides rapid fingerprint profiling while HPLC is the gold standard for quantitative marker compound analysis in herbal medicines",
          "The CPMR Mampong-Akuapem develops standardized phytomedicines and quality control protocols for Ghanaian herbal products",
          "Quality testing includes moisture content, ash values, extractive values, heavy metal screening, and microbial contamination assessment",
        ],
        quiz: [
          {
            question: "Which analytical technique is considered the gold standard for quantitative standardization of herbal medicines?",
            options: [
              "High Performance Liquid Chromatography (HPLC)",
              "Thin Layer Chromatography (TLC)",
              "Infrared Spectroscopy (IR)",
              "Gas Chromatography (GC)",
            ],
            correctIndex: 0,
          },
          {
            question: "Which institution is Ghana's premier facility for developing quality control protocols for herbal medicines?",
            options: [
              "Noguchi Memorial Institute for Medical Research",
              "Ghana Standards Authority",
              "Centre for Plant Medicine Research (CPMR), Mampong-Akuapem",
              "Korle-Bu Teaching Hospital Pharmacy Department",
            ],
            correctIndex: 2,
          },
          {
            question: "Which of the following is NOT a standard quality control test for herbal medicines?",
            options: [
              "Heavy metal screening",
              "Microbial contamination testing",
              "Radioactivity assay",
              "Total ash determination",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "herb-L5",
        title: "Common Ghanaian Medicinal Plants",
        duration: "50 min",
        content: `Ghana's rich biodiversity supports a wealth of medicinal plants that have been used for generations in traditional healthcare. Among the most important is Cryptolepis sanguinolenta (family Apocynaceae), known in Akan as "Nibima" and in Ewe as "Kadze." The root bark decoction has been used traditionally to treat malaria and fevers, and scientific research has validated its antimalarial activity, attributed primarily to the indoloquinoline alkaloid cryptolepine. Clinical studies conducted at the CPMR Mampong and the University of Science and Technology in Kumasi have demonstrated its efficacy against Plasmodium falciparum, and a standardized preparation is marketed as an antimalarial phytomedicine. Additionally, Cryptolepis has shown promising anti-hyperglycaemic activity, leading to its traditional use in managing type 2 diabetes.\n\nMoringa oleifera (family Moringaceae), locally called "Yevu-ti" in Ewe or simply "Moringa" across Ghana, has gained immense popularity as a nutritional supplement and medicinal plant. The leaves are exceptionally rich in vitamins A, C, and E, calcium, potassium, and protein, making them valuable for addressing malnutrition. Pharmacological studies have demonstrated antihypertensive, anti-inflammatory, antioxidant, and hypoglycaemic properties. Azadirachta indica (Neem), known in Akan as "Nim" and widely found throughout Ghana, is used traditionally for malaria, skin infections, and as a general tonic. Its leaves, bark, and seeds contain active compounds including azadirachtin and nimbolide with demonstrated antimalarial, antibacterial, and anti-inflammatory activities.\n\nLippia multiflora (family Verbenaceae), known in Akan as "Tefre" or "Gambia tea," is widely consumed as a herbal tea for hypertension, insomnia, and digestive complaints. Research at KNUST has confirmed its antihypertensive and sedative properties. Aloe vera (Aloe barbadensis), cultivated across Ghana and known in Akan as "Sere," is used topically for wound healing, burns, and skin conditions, and internally for digestive disorders. The gel contains acemannan, a polysaccharide with demonstrated wound-healing, immunomodulatory, and gastroprotective activities. These plants represent only a fraction of Ghana's medicinal flora, with ongoing ethnobotanical surveys by institutions such as the University of Ghana Department of Plant and Environmental Biology and KNUST Department of Herbal Medicine continuing to document and validate traditional uses.`,
        keyPoints: [
          "Cryptolepis sanguinolenta (Nibima) contains cryptolepine with validated antimalarial and anti-hyperglycaemic activity",
          "Moringa oleifera is nutritionally rich and has demonstrated antihypertensive, antioxidant, and hypoglycaemic properties",
          "Azadirachta indica (Neem) contains azadirachtin and nimbolide with antimalarial, antibacterial, and anti-inflammatory activities",
          "Lippia multiflora (Tefre/Gambia tea) has confirmed antihypertensive and sedative properties validated by KNUST research",
        ],
        quiz: [
          {
            question: "What is the primary active antimalarial alkaloid found in Cryptolepis sanguinolenta?",
            options: [
              "Cryptolepine",
              "Azadirachtin",
              "Quinine",
              "Artemisinin",
            ],
            correctIndex: 0,
          },
          {
            question: "Which local Akan name is used for Lippia multiflora?",
            options: [
              "Nibima",
              "Nim",
              "Tefre",
              "Sere",
            ],
            correctIndex: 2,
          },
          {
            question: "Which bioactive polysaccharide in Aloe vera is responsible for its wound-healing properties?",
            options: [
              "Nimbolide",
              "Cryptolepine",
              "Acemannan",
              "Azadirachtin",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "herb-L6",
        title: "Safety, Efficacy & Evidence-Based Practice",
        duration: "35 min",
        content: `Evidence-based practice in traditional and herbal medicine requires systematic evaluation of safety and efficacy using rigorous scientific methods while respecting the value of accumulated traditional knowledge. The World Health Organization's Traditional Medicine Strategy 2014–2023 (extended to 2025) provides a global framework for integrating traditional medicine into national health systems through regulation, research, and quality assurance. Ghana has been a leader in implementing this strategy, with the Ghana FDA, TMPC, and CPMR working together to create pathways for the scientific validation and regulation of traditional medicines. Clinical trials for herbal medicines in Ghana follow the Ghana FDA's Guidelines for Clinical Trials, which require ethical approval from institutional review boards and registration with the FDA's Safety Monitoring and Clinical Trials Division.\n\nAdverse effects monitoring — pharmacovigilance — for herbal medicines is critical yet challenging. Many patients do not report herbal medicine use to their healthcare providers, and traditional practitioners may not be trained to recognise or document adverse effects. The Ghana FDA has established a pharmacovigilance system that includes herbal medicines, encouraging health professionals and consumers to report suspected adverse reactions through the FDA's MedSafety app and spontaneous reporting forms. Common adverse effects associated with herbal medicines in Ghana include hepatotoxicity (particularly with prolonged use of certain preparations), nephrotoxicity, allergic reactions, and interactions with orthodox medicines. The Korle-Bu Teaching Hospital and Komfo Anokye Teaching Hospital have both reported cases of organ damage linked to herbal medicine use, underscoring the importance of safety monitoring.\n\nMoving towards evidence-based herbal medicine practice requires collaboration between traditional practitioners, pharmacists, physicians, and researchers. The KNUST Department of Herbal Medicine trains Medical Herbalists in both traditional knowledge and modern scientific methods, equipping them to critically evaluate evidence and practise safely. Ongoing research priorities in Ghana include conducting well-designed clinical trials for priority herbal medicines, developing pharmacovigilance capacity among traditional practitioners, establishing reference standards for commonly used medicinal plants, and investigating the mechanisms of action of traditionally used remedies using modern pharmacological and molecular biology techniques.`,
        keyPoints: [
          "The WHO Traditional Medicine Strategy provides a global framework for integrating traditional medicine through regulation, research, and quality assurance",
          "Ghana FDA pharmacovigilance for herbal medicines includes the MedSafety app and spontaneous adverse reaction reporting",
          "Common adverse effects of herbal medicines in Ghana include hepatotoxicity, nephrotoxicity, allergic reactions, and drug interactions",
          "KNUST trains Medical Herbalists in both traditional knowledge and modern scientific methods for evidence-based practice",
        ],
        quiz: [
          {
            question: "Which WHO strategy provides the global framework for traditional medicine integration into national health systems?",
            options: [
              "WHO Traditional Medicine Strategy 2014–2023",
              "WHO Essential Medicines Programme",
              "WHO Pharmaceutical Development Strategy",
              "WHO Global Health Initiative 2020",
            ],
            correctIndex: 0,
          },
          {
            question: "What tool has the Ghana FDA provided for reporting suspected adverse reactions from herbal medicines?",
            options: [
              "Ghana Health Service Portal",
              "MedSafety app and spontaneous reporting forms",
              "Traditional Medicine Practice Council hotline",
              "National Health Insurance Authority app",
            ],
            correctIndex: 1,
          },
          {
            question: "Which of the following is a commonly reported adverse effect of herbal medicine misuse in Ghana?",
            options: [
              "Hearing loss",
              "Vision impairment",
              "Hepatotoxicity",
              "Osteoporosis",
            ],
            correctIndex: 2,
          },
        ],
      },
    ],
  },
  "public-health-pharmacy": {
    id: "public-health-pharmacy",
    title: "Public Health Pharmacy",
    description:
      "Explore the pharmacist's expanding role in public health across Ghana. This course covers national health policies, disease control programmes, immunization, and antimicrobial stewardship with a strong focus on Ghana Health Service initiatives and the National Health Insurance Scheme.",
    estimatedTime: "5 hours",
    lessons: [
      {
        id: "php-L1",
        title: "Introduction to Public Health Pharmacy",
        duration: "45 min",
        content: `Public health pharmacy is the application of pharmaceutical knowledge and skills to promote population-level health outcomes, prevent disease, and reduce health disparities. In Ghana, pharmacists serve as the most accessible healthcare professionals—community pharmacies are often the first point of contact for patients in both urban and rural areas. The Ghana Health Service (GHS) recognises this unique positioning and has progressively integrated pharmacists into public health planning, surveillance, and service delivery.\n\nGhana's National Drug Policy (NDP), first adopted in 2004 and revised periodically, provides the regulatory backbone for pharmaceutical practice in the country. The policy aims to ensure the availability, affordability, and rational use of safe, effective, and good-quality medicines. It aligns with the World Health Organization's essential medicines framework and underpins procurement through the Central Medical Stores. The Pharmacy Council of Ghana enforces professional standards and ensures that pharmacists meet continuing-professional-development requirements linked to public health competencies.\n\nThe pharmacist's public health role extends well beyond dispensing. It encompasses health education, disease screening, medication therapy management, pharmacovigilance reporting to the Food and Drugs Authority (FDA Ghana), and active participation in outbreak response—as demonstrated during the COVID-19 pandemic when community pharmacists provided triage counselling and supported testing referrals. Understanding these foundations is essential before exploring the specific programmes covered in subsequent lessons.`,
        keyPoints: [
          "Public health pharmacy focuses on population-level health promotion, disease prevention, and reduction of health disparities.",
          "Ghana's National Drug Policy ensures availability, affordability, and rational use of quality-assured medicines nationwide.",
          "The Pharmacy Council of Ghana mandates continuing professional development with public health competency requirements.",
          "Community pharmacists in Ghana serve as frontline public health agents for health education, screening, and pharmacovigilance reporting.",
        ],
        quiz: [
          {
            question:
              "Which body is primarily responsible for enforcing professional standards for pharmacists in Ghana?",
            options: [
              "Pharmacy Council of Ghana",
              "Food and Drugs Authority",
              "Ghana Medical Association",
              "National Health Insurance Authority",
            ],
            correctIndex: 0,
          },
          {
            question:
              "What is the main objective of Ghana's National Drug Policy?",
            options: [
              "To ensure availability, affordability, and rational use of safe, effective, quality medicines",
              "To restrict the importation of all foreign pharmaceuticals",
              "To limit pharmacists to dispensing duties only",
              "To privatise all government hospital pharmacies",
            ],
            correctIndex: 0,
          },
          {
            question:
              "During the COVID-19 pandemic, community pharmacists in Ghana contributed to public health by:",
            options: [
              "Administering all COVID-19 vaccines nationwide",
              "Providing triage counselling and supporting testing referrals",
              "Closing their pharmacies to reduce transmission",
              "Manufacturing personal protective equipment",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "php-L2",
        title: "NHIS & Drug Policy in Ghana",
        duration: "50 min",
        content: `The National Health Insurance Scheme (NHIS), established by Act 650 of 2003 and later revised under Act 852 of 2012, is Ghana's flagship social health protection programme. Managed by the National Health Insurance Authority (NHIA), the scheme covers over 40% of the Ghanaian population and aims to provide equitable access to essential healthcare services without catastrophic out-of-pocket expenditure. Pharmacists interact with the NHIS daily through medicine claims processing, and credentialed community pharmacies serve as accredited NHIS dispensing points.\n\nThe NHIS Essential Medicines List (EML) determines which medicines are reimbursable under the scheme. This list is periodically updated by the NHIA in collaboration with the Ministry of Health and mirrors the WHO Model EML adapted to Ghana's disease burden. Drug pricing under the NHIS follows the Ghana Reference Price List, which sets maximum reimbursable amounts per item. Pharmacists must understand tariff structures, generic substitution policies, and claims documentation—errors in any of these can lead to claim rejections and financial losses for the facility. The Diagnosis-Related Grouping (DRG) system used by the NHIS also affects how pharmacists approach formulary management.\n\nChallenges remain significant: delayed reimbursements from the NHIA—sometimes exceeding six months—create cash-flow difficulties for community pharmacies. Additionally, the medicines list may not always reflect newer first-line therapies, requiring pharmacists to advocate for formulary updates. Despite these hurdles, the NHIS has substantially reduced financial barriers to accessing medicines in Ghana, and pharmacists play a critical role in sustaining the scheme's pharmaceutical component through rational prescribing advocacy and cost-effective dispensing.`,
        keyPoints: [
          "The NHIS, governed by Act 852 of 2012, covers over 40% of Ghana's population and is managed by the National Health Insurance Authority.",
          "The NHIS Essential Medicines List determines reimbursable drugs and is aligned with the WHO Model EML adapted for Ghana's disease burden.",
          "The Ghana Reference Price List sets maximum reimbursable amounts; pharmacists must master tariff structures and generic substitution policies.",
          "Delayed NHIA reimbursements remain a major challenge for accredited community pharmacies participating in the scheme.",
        ],
        quiz: [
          {
            question:
              "Which legislation currently governs the National Health Insurance Scheme in Ghana?",
            options: [
              "Act 852 of 2012",
              "Act 650 of 2003",
              "Act 299 of 1961",
              "Act 489 of 1994",
            ],
            correctIndex: 0,
          },
          {
            question:
              "What tool does the NHIS use to set maximum reimbursable amounts for medicines?",
            options: [
              "The WHO Model Essential Medicines List",
              "The Ghana Reference Price List",
              "The Pharmacy Council Fee Schedule",
              "The Central Medical Stores Catalogue",
            ],
            correctIndex: 1,
          },
          {
            question:
              "A major financial challenge faced by NHIS-accredited community pharmacies is:",
            options: [
              "Excessive patient co-payments",
              "Prohibition of generic medicines",
              "Delayed reimbursements from the NHIA",
              "Mandatory importation of branded drugs only",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "php-L3",
        title: "Malaria Control Programme",
        duration: "50 min",
        content: `Malaria remains a leading cause of morbidity and mortality in Ghana, accounting for approximately 30% of outpatient visits and about 4% of maternal deaths. The National Malaria Control Programme (NMCP), housed within the Ghana Health Service, coordinates the country's response through a multi-pronged strategy that relies heavily on pharmaceutical interventions. Ghana adopted artemisinin-based combination therapy (ACT)—specifically artesunate-amodiaquine and artemether-lumefantrine—as first-line treatment for uncomplicated malaria in 2004, in accordance with WHO guidelines. Pharmacists are central to ensuring ACT availability, proper dosing, patient counselling, and pharmacovigilance.\n\nIntermittent Preventive Treatment in Pregnancy (IPTp) with sulfadoxine-pyrimethamine (SP) is a cornerstone of antenatal malaria prevention. The WHO recommends at least three doses during pregnancy, and Ghana's coverage has steadily improved—recent data show over 60% of pregnant women receive at least three IPTp doses during antenatal visits. Seasonal Malaria Chemoprevention (SMC) with amodiaquine plus sulfadoxine-pyrimethamine targets children aged 3–59 months in the northern savannah zones where transmission is highly seasonal. The NMCP, supported by partners like the Global Fund and PMI (President's Malaria Initiative), also distributes long-lasting insecticidal nets (LLINs)—over 15 million nets were distributed in mass campaigns between 2018 and 2022.\n\nPharmacists contribute to malaria control at every level: hospital pharmacists manage ACT formularies and monitor stock-outs; community pharmacists provide rapid diagnostic test (RDT)-guided dispensing under the test-before-treat policy; and public health pharmacists participate in supply-chain management for LLIN and SMC drug distribution. Understanding the pharmacology, resistance patterns, and programmatic logistics of these interventions is essential for any pharmacist working within Ghana's health system.`,
        keyPoints: [
          "Malaria accounts for roughly 30% of outpatient visits in Ghana; artesunate-amodiaquine and artemether-lumefantrine are the first-line ACTs.",
          "IPTp with sulfadoxine-pyrimethamine is given at least three times during pregnancy, with over 60% coverage in Ghana.",
          "Seasonal Malaria Chemoprevention targets children 3–59 months in northern Ghana using amodiaquine plus sulfadoxine-pyrimethamine.",
          "Pharmacists support malaria control through ACT formulary management, RDT-guided dispensing, and LLIN/SMC supply-chain logistics.",
        ],
        quiz: [
          {
            question:
              "Which artemisinin-based combination therapies are first-line for uncomplicated malaria in Ghana?",
            options: [
              "Artesunate-amodiaquine and artemether-lumefantrine",
              "Chloroquine and primaquine",
              "Quinine and doxycycline",
              "Mefloquine and atovaquone-proguanil",
            ],
            correctIndex: 0,
          },
          {
            question:
              "Seasonal Malaria Chemoprevention (SMC) in Ghana primarily targets:",
            options: [
              "All adults in urban areas",
              "Children aged 3–59 months in northern savannah zones",
              "Pregnant women in their third trimester",
              "Healthcare workers in malaria-endemic districts",
            ],
            correctIndex: 1,
          },
          {
            question:
              "What drug combination is used for Intermittent Preventive Treatment in Pregnancy (IPTp) in Ghana?",
            options: [
              "Artemether-lumefantrine",
              "Amodiaquine-artesunate",
              "Sulfadoxine-pyrimethamine",
              "Chloroquine-proguanil",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "php-L4",
        title: "HIV/AIDS & TB National Programs",
        duration: "55 min",
        content: `Ghana's National AIDS/STI Control Programme (NACP), operating under the Ghana Health Service, coordinates the country's HIV response. Ghana has an adult HIV prevalence of approximately 1.7%, with an estimated 350,000 people living with HIV (PLHIV). The country adopted the WHO's "test-and-treat" policy in 2016, meaning all individuals who test positive are immediately eligible for antiretroviral therapy (ART) regardless of CD4 count. The current preferred first-line regimen is dolutegravir-based (tenofovir/lamivudine/dolutegravir—TLD), which has dramatically improved viral suppression rates. Pharmacists manage ART dispensing, adherence counselling, drug-interaction screening, and adverse-effect monitoring, making them indispensable to the 95-95-95 targets.\n\nTuberculosis remains a significant public health threat in Ghana, with an estimated incidence of approximately 145 cases per 100,000 population. The National Tuberculosis Control Programme (NTP) implements the WHO-recommended Directly Observed Therapy, Short-course (DOTS) strategy, which relies on standardised regimens: two months of isoniazid, rifampicin, pyrazinamide, and ethambutol (intensive phase) followed by four months of isoniazid and rifampicin (continuation phase). Multi-drug resistant TB (MDR-TB) is managed at specialised centres using longer regimens that include bedaquiline and linezolid, in line with updated WHO guidance. Pharmacists ensure uninterrupted drug supply, monitor hepatotoxicity and peripheral neuropathy, and counsel patients on the critical importance of treatment completion.\n\nHIV-TB co-infection is a major concern—approximately 14% of TB patients in Ghana are co-infected with HIV. Coordinated care requires careful pharmacological management to avoid drug interactions, particularly between rifampicin and certain antiretrovirals. Cotrimoxazole preventive therapy (CPT) and isoniazid preventive therapy (IPT) are provided to eligible PLHIV to reduce opportunistic infections and latent TB progression. Pharmacists working in both community and hospital settings must be proficient in managing these overlapping regimens and ensuring adherence across both disease programmes simultaneously.`,
        keyPoints: [
          "Ghana adopted the test-and-treat policy in 2016; the preferred first-line ART regimen is dolutegravir-based TLD (tenofovir/lamivudine/dolutegravir).",
          "TB incidence in Ghana is approximately 145 per 100,000; the DOTS strategy uses a standard 6-month regimen of isoniazid, rifampicin, pyrazinamide, and ethambutol.",
          "About 14% of TB patients in Ghana are co-infected with HIV, requiring careful management of rifampicin-antiretroviral interactions.",
          "Pharmacists provide ART adherence counselling, drug-interaction screening, and ensure uninterrupted supply for both HIV and TB programmes.",
        ],
        quiz: [
          {
            question:
              "What is the current preferred first-line ART regimen in Ghana?",
            options: [
              "Tenofovir/lamivudine/dolutegravir (TLD)",
              "Zidovudine/lamivudine/nevirapine",
              "Abacavir/lamivudine/efavirenz",
              "Stavudine/didanosine/lopinavir",
            ],
            correctIndex: 0,
          },
          {
            question:
              "The DOTS strategy for tuberculosis treatment in Ghana involves a total treatment duration of:",
            options: [
              "3 months",
              "6 months",
              "9 months",
              "12 months",
            ],
            correctIndex: 1,
          },
          {
            question:
              "A key drug interaction concern in HIV-TB co-infection management involves:",
            options: [
              "Dolutegravir and metformin",
              "Isoniazid and paracetamol",
              "Rifampicin and certain antiretrovirals",
              "Pyrazinamide and sulfadoxine",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "php-L5",
        title: "Immunization & Vaccine Programs",
        duration: "45 min",
        content: `Ghana's Expanded Programme on Immunization (EPI), established in 1978, is one of the most successful in sub-Saharan Africa. Managed by the Ghana Health Service, the programme provides free routine vaccinations against diseases including tuberculosis (BCG), poliomyelitis, diphtheria, pertussis, tetanus, hepatitis B, Haemophilus influenzae type b, pneumococcal disease, rotavirus, measles, rubella, yellow fever, and meningococcal meningitis. Ghana was also the first country in the world to receive COVID-19 vaccines through the COVAX facility in February 2021 and became a pilot country for the RTS,S malaria vaccine (Mosquirix) in 2019. National immunization coverage for the third dose of pentavalent vaccine (Penta-3) has consistently exceeded 90% in recent years.\n\nThe cold chain is the backbone of any successful immunization programme. In Ghana, the EPI cold chain stretches from national cold rooms at the Central Medical Stores in Tema through regional and district stores to health facility refrigerators and vaccine carriers used for outreach. Pharmacists with supply-chain expertise help maintain the Effective Vaccine Management (EVM) system, ensuring that vaccines are stored between +2°C and +8°C at all points. Solar-powered refrigerators have been deployed extensively in rural and off-grid areas to strengthen the last mile of the cold chain.\n\nThe role of pharmacists in immunization is expanding globally and in Ghana. While historically vaccine administration was nurse-led, the Pharmacy Council of Ghana and professional bodies have been exploring pharmacist-administered vaccination models, following successful implementation in countries like the United States and the United Kingdom. During the COVID-19 vaccination campaign, pharmacists contributed to logistics planning, vaccine reconstitution, adverse-event-following-immunization (AEFI) monitoring, and public education to combat vaccine hesitancy. As Ghana continues to introduce new vaccines into the EPI schedule, pharmacists will play an increasingly vital role in ensuring programme success.`,
        keyPoints: [
          "Ghana's EPI provides free routine vaccination against over a dozen diseases, with Penta-3 coverage consistently exceeding 90%.",
          "Ghana was the first country to receive COVAX vaccines (February 2021) and a pilot country for the RTS,S malaria vaccine in 2019.",
          "The cold chain must maintain +2°C to +8°C throughout; solar-powered refrigerators have strengthened rural cold-chain capacity.",
          "Pharmacists contribute to vaccine logistics, reconstitution, AEFI monitoring, and public education against vaccine hesitancy.",
        ],
        quiz: [
          {
            question:
              "Ghana was notable in global COVID-19 vaccine distribution because it was:",
            options: [
              "The first country to receive vaccines through the COVAX facility",
              "The first country to manufacture its own COVID-19 vaccine",
              "The only African country to achieve 100% vaccination coverage",
              "The first country to reject all COVID-19 vaccines",
            ],
            correctIndex: 0,
          },
          {
            question:
              "What is the recommended storage temperature range for vaccines in the cold chain?",
            options: [
              "−20°C to −10°C",
              "+2°C to +8°C",
              "+10°C to +15°C",
              "0°C to +2°C",
            ],
            correctIndex: 1,
          },
          {
            question:
              "The RTS,S (Mosquirix) malaria vaccine was piloted in Ghana starting in:",
            options: [
              "2015",
              "2017",
              "2019",
              "2021",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "php-L6",
        title: "Antimicrobial Resistance & Stewardship",
        duration: "40 min",
        content: `Antimicrobial resistance (AMR) is one of the most pressing public health threats worldwide, and Ghana is no exception. Studies conducted at major Ghanaian hospitals, including Korle Bu Teaching Hospital and Komfo Anokye Teaching Hospital, have documented alarming resistance rates—over 70% of Escherichia coli isolates showing resistance to ampicillin and over 50% resistance to cotrimoxazole. Ghana developed its National Action Plan on Antimicrobial Resistance (NAP-AMR) in 2017, aligned with the WHO Global Action Plan. The NAP-AMR is coordinated through a One Health approach involving the Ministry of Health, Ministry of Food and Agriculture, and the Environmental Protection Agency, recognising that AMR spans human, animal, and environmental health.\n\nAntibiotic stewardship programmes (ASPs) are being established in Ghanaian hospitals to optimise antimicrobial use and slow resistance. Key stewardship interventions include prospective audit and feedback, formulary restriction of broad-spectrum antibiotics (e.g., carbapenems and third-generation cephalosporins), development of local antibiograms, and educational outreach to prescribers. The Ghana FDA also plays a role by regulating over-the-counter antibiotic sales—though enforcement remains challenging, as antibiotics are still widely available without prescription in many community pharmacies and chemical seller shops across the country.\n\nPharmacists are central to AMR stewardship efforts. Hospital pharmacists lead or co-lead antimicrobial stewardship committees, review culture and sensitivity reports to recommend targeted therapy (de-escalation), and monitor antimicrobial consumption using defined daily doses (DDDs). Community pharmacists have a responsibility to discourage inappropriate antibiotic self-medication, counsel patients on completing prescribed courses, and report suspected substandard or falsified antimicrobials to the FDA. Strengthening the pharmacist's role in stewardship is critical for preserving the efficacy of existing antibiotics in Ghana's healthcare system.`,
        keyPoints: [
          "Ghana's NAP-AMR (2017) uses a One Health approach involving the Ministries of Health, Food and Agriculture, and the Environmental Protection Agency.",
          "Over 70% of E. coli isolates at major Ghanaian hospitals show ampicillin resistance; cotrimoxazole resistance exceeds 50%.",
          "Hospital stewardship interventions include prospective audit, formulary restriction of broad-spectrum antibiotics, and local antibiogram development.",
          "Community pharmacists must discourage antibiotic self-medication and report substandard or falsified antimicrobials to the Ghana FDA.",
        ],
        quiz: [
          {
            question:
              "Ghana's National Action Plan on Antimicrobial Resistance was developed in which year?",
            options: [
              "2017",
              "2010",
              "2020",
              "2014",
            ],
            correctIndex: 0,
          },
          {
            question:
              "Which approach does Ghana's NAP-AMR adopt to address antimicrobial resistance?",
            options: [
              "A purely hospital-based clinical approach",
              "A One Health approach spanning human, animal, and environmental sectors",
              "An approach limited to veterinary antibiotic use",
              "A pharmaceutical-industry-led voluntary approach",
            ],
            correctIndex: 1,
          },
          {
            question:
              "A key stewardship role for hospital pharmacists in Ghana includes:",
            options: [
              "Prescribing antibiotics independently without physician oversight",
              "Selling antibiotics over the counter to increase revenue",
              "Reviewing culture and sensitivity reports to recommend de-escalation of therapy",
              "Restricting all antibiotic use to oral formulations only",
            ],
            correctIndex: 2,
          },
        ],
      },
    ],
  },
  "supply-chain": {
    id: "supply-chain",
    title: "Pharmaceutical Supply Chain Management",
    description:
      "A comprehensive course on the pharmaceutical supply chain, covering procurement, storage, distribution, and quality assurance with a focus on Ghana's public health supply systems, cold chain logistics, and last-mile delivery innovations.",
    estimatedTime: "5 hours",
    lessons: [
      {
        id: "sc-L1",
        title: "Introduction to Pharmaceutical Supply Chain",
        duration: "40 min",
        content: `The pharmaceutical supply chain encompasses the entire journey of medicines from manufacturer to patient. It includes procurement, storage, distribution, and dispensing — each stage carrying its own regulatory, logistical, and quality requirements. In Ghana, the supply chain is shaped by the country's healthcare structure, where the Ghana Health Service (GHS) operates public facilities alongside a vibrant private pharmacy sector. The Central Medical Stores (CMS) in Tema serves as the national hub for procuring and warehousing essential medicines destined for public hospitals and clinics across all sixteen regions.\n\nGhana's drug supply landscape presents unique challenges and opportunities. The country imports approximately 70 percent of its pharmaceutical products, with the Tema port serving as the primary entry point. Local manufacturers such as Danadams, Entrance Pharmaceuticals, and LaGray Chemical Company contribute to domestic production, but the range of locally manufactured products remains limited. The National Health Insurance Scheme (NHIS) further influences the supply chain by determining which medicines are reimbursed, thereby driving demand patterns across public and private facilities.\n\nUnderstanding the full procurement-to-dispensing cycle is critical for every pharmacist. Inefficiencies at any stage — whether delayed procurement, improper storage, or fragmented distribution — directly affect medicine availability and patient outcomes. This lesson lays the groundwork by mapping the key actors (Ministry of Health, GHS, FDA Ghana, CMS, regional medical stores, wholesalers, and community pharmacies) and the flow of products, information, and funds that connect them.`,
        keyPoints: [
          "The pharmaceutical supply chain spans procurement, storage, distribution, and dispensing",
          "Ghana's Central Medical Stores in Tema is the national hub for public-sector medicines",
          "Approximately 70% of Ghana's pharmaceuticals are imported through Tema port",
          "The NHIS reimbursement list drives demand patterns across public and private facilities",
        ],
        quiz: [
          {
            question:
              "What is the primary national hub for procuring and warehousing public-sector medicines in Ghana?",
            options: [
              "Central Medical Stores in Tema",
              "Korle Bu Teaching Hospital Pharmacy",
              "Ghana FDA headquarters in Accra",
              "Komfo Anokye Teaching Hospital stores",
            ],
            correctIndex: 0,
          },
          {
            question:
              "Approximately what percentage of Ghana's pharmaceutical products are imported?",
            options: [
              "70%",
              "30%",
              "50%",
              "90%",
            ],
            correctIndex: 0,
          },
          {
            question:
              "Which scheme significantly influences medicine demand patterns by determining reimbursable medicines?",
            options: [
              "Ghana Medical Association scheme",
              "National Health Insurance Scheme (NHIS)",
              "WHO Essential Medicines Programme",
              "African Union Health Initiative",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "sc-L2",
        title: "Drug Procurement & Quantification",
        duration: "50 min",
        content: `Drug procurement is the process of acquiring pharmaceutical products in the right quantities, at the right time, and at the best possible price while ensuring quality standards are met. In Ghana's public sector, procurement is guided by the Public Procurement Act (Act 663) and coordinated largely through the Central Medical Stores. The process typically begins with quantification — estimating the quantities of medicines needed based on consumption data, morbidity patterns, and service expansion plans. Accurate quantification prevents both stock-outs that leave patients without critical treatments and overstocking that leads to expiry and waste.\n\nForecasting methods range from consumption-based approaches, which rely on historical usage data, to morbidity-based methods that estimate needs from disease prevalence and standard treatment guidelines. Ghana's CMS uses a combination of both, drawing on data from the District Health Information Management System (DHIMS2). Tendering follows quantification, with competitive bidding used to secure value for money. For antiretrovirals and other donor-funded commodities, procurement often occurs through international mechanisms such as the Global Fund's Pooled Procurement Mechanism or UNICEF Supply Division. The WHO Prequalification Programme plays a vital role by certifying that manufacturers meet international Good Manufacturing Practice (GMP) standards, giving procurement agencies confidence in product quality.\n\nGhana's procurement landscape has evolved considerably with the introduction of e-procurement platforms and framework agreements that streamline the tendering process. The Ghana Medical Stores Limited (GMSL), a successor entity to CMS operations, is tasked with professionalising procurement and distribution. Challenges remain, including foreign exchange fluctuations that affect import costs, long lead times from international suppliers, and the need for greater transparency in tender evaluation. Understanding these dynamics equips pharmacists to contribute meaningfully to procurement committees at hospital and district levels.`,
        keyPoints: [
          "Quantification uses consumption-based and morbidity-based forecasting methods",
          "Ghana's Public Procurement Act (Act 663) governs public-sector medicine purchasing",
          "WHO Prequalification certifies manufacturers meet international GMP standards",
          "DHIMS2 provides consumption and morbidity data used for forecasting in Ghana",
        ],
        quiz: [
          {
            question:
              "Which Ghanaian law governs public-sector procurement including pharmaceutical purchases?",
            options: [
              "Public Procurement Act (Act 663)",
              "Pharmacy Act (Act 489)",
              "Food and Drugs Act (Act 523)",
              "Health Institutions and Facilities Act (Act 829)",
            ],
            correctIndex: 0,
          },
          {
            question:
              "What is the primary purpose of the WHO Prequalification Programme in pharmaceutical procurement?",
            options: [
              "Setting retail prices for medicines",
              "Certifying that manufacturers meet international GMP standards",
              "Distributing medicines to developing countries",
              "Training pharmacists in procurement",
            ],
            correctIndex: 1,
          },
          {
            question:
              "Which data system does Ghana's CMS draw on for consumption and morbidity data during quantification?",
            options: [
              "Ghana Post tracking system",
              "National Identification Authority database",
              "DHIMS2 (District Health Information Management System)",
              "NHIS claims database only",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "sc-L3",
        title: "Storage & Cold Chain Management",
        duration: "55 min",
        content: `Proper storage of pharmaceutical products is essential to maintaining their efficacy, safety, and quality throughout the supply chain. Most medicines require controlled room temperature storage (15–25°C), but Ghana's tropical climate — with ambient temperatures frequently exceeding 30°C and high humidity levels — poses significant challenges. Warehouses and pharmacy storerooms must be equipped with adequate ventilation or air conditioning, humidity control, and continuous temperature monitoring. The Ghana FDA's inspection guidelines require storage facilities to demonstrate compliance with Good Storage Practice (GSP), including proper shelving, pest control, and separation of expired or recalled products.\n\nCold chain management is critical for temperature-sensitive products such as vaccines, insulin, oxytocin, and certain biologics. The cold chain refers to the unbroken series of refrigerated storage and transport links that maintain products within their required temperature range (typically 2–8°C for most vaccines). Ghana's Expanded Programme on Immunization (EPI) relies on a robust cold chain network from national cold rooms in Tema down to regional and district levels, with solar-powered refrigerators deployed in many rural health facilities. Any break in the cold chain — whether during transport from regional medical stores or due to power outages at facility level — can render vaccines ineffective, wasting scarce resources and leaving populations unprotected.\n\nInventory management principles such as First Expiry, First Out (FEFO) and First In, First Out (FIFO) are fundamental to storage operations. FEFO is the preferred approach in pharmaceutical settings, ensuring that products closest to their expiry date are dispensed first, thereby minimising waste. In Ghana's climate, accelerated degradation of heat-sensitive medicines makes adherence to these principles even more important. Pharmacists overseeing storage facilities must conduct regular stock counts, monitor temperature logs daily, and ensure that cold chain equipment is maintained through preventive maintenance schedules. The introduction of remote temperature monitoring devices with SMS alerts has improved cold chain oversight in several GHS districts.`,
        keyPoints: [
          "Ghana's tropical climate requires active temperature and humidity control for medicine storage",
          "Cold chain products (vaccines, insulin) must be maintained at 2–8°C from Tema to facility level",
          "FEFO (First Expiry, First Out) is the preferred stock rotation method in pharmaceutical storage",
          "Solar-powered refrigerators support cold chain in rural Ghanaian health facilities",
        ],
        quiz: [
          {
            question:
              "What is the standard cold chain temperature range for most vaccines?",
            options: [
              "2–8°C",
              "0–4°C",
              "8–15°C",
              "15–25°C",
            ],
            correctIndex: 0,
          },
          {
            question:
              "Which stock rotation method is preferred in pharmaceutical storage to minimise waste from expiry?",
            options: [
              "Last In, First Out (LIFO)",
              "First In, First Out (FIFO)",
              "First Expiry, First Out (FEFO)",
              "Random allocation",
            ],
            correctIndex: 2,
          },
          {
            question:
              "What technology has been deployed in rural Ghanaian health facilities to support vaccine cold chain?",
            options: [
              "Diesel-powered generators only",
              "Solar-powered refrigerators",
              "Underground ice storage",
              "Chemical cooling packs exclusively",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "sc-L4",
        title: "Inventory Management & LMIS",
        duration: "50 min",
        content: `Effective inventory management ensures that the right medicines are available in the right quantities at the right time, while minimising waste and holding costs. Two widely used analytical tools in pharmaceutical inventory management are ABC analysis and VEN analysis. ABC analysis classifies items by their annual consumption value — Class A items represent roughly 10–20% of products but account for 70–80% of total expenditure, demanding the tightest controls. VEN analysis categorises medicines as Vital, Essential, or Non-essential based on their clinical importance. Combining ABC and VEN analyses allows supply chain managers to prioritise procurement and monitoring efforts: a Vital/Class A item such as antiretrovirals or antimalarials receives the highest attention, while a Non-essential/Class C item like a vitamin supplement may be managed with simpler reorder systems.\n\nReorder point calculations ensure timely replenishment before stock runs out. The reorder point is determined by the average consumption rate multiplied by the lead time, plus a safety stock buffer to account for variability. In Ghana, lead times can be unpredictable due to port delays, customs clearance processes, and transportation challenges to remote districts. This makes safety stock calculations particularly important. Stock-out prevention is a major priority for the Ghana Health Service, as medicine unavailability drives patients to the informal market where quality cannot be guaranteed and contributes to poor health outcomes.\n\nGhana has progressively digitised its supply chain through Logistics Management Information Systems (LMIS). The GHS eLMIS platform enables health facilities to report stock levels, consumption, and losses electronically, replacing paper-based reporting that was slow and error-prone. Data from eLMIS feeds into national dashboards that allow supply chain managers at regional and national levels to identify impending stock-outs and redirect supplies proactively. Despite progress, challenges remain: internet connectivity gaps in rural areas, inconsistent data entry by facility staff, and the need for ongoing training. Integration of eLMIS with DHIMS2 and the NHIS claims system represents the next frontier for a fully data-driven supply chain in Ghana.`,
        keyPoints: [
          "ABC analysis classifies products by expenditure value; VEN analysis by clinical importance",
          "Reorder points account for consumption rate, lead time, and safety stock to prevent stock-outs",
          "Ghana's eLMIS platform enables electronic reporting of stock levels and consumption data",
          "Integration of eLMIS with DHIMS2 and NHIS systems is key to a data-driven supply chain",
        ],
        quiz: [
          {
            question:
              "In ABC analysis, Class A pharmaceutical items typically represent what proportion of total expenditure?",
            options: [
              "70–80%",
              "10–20%",
              "40–50%",
              "90–100%",
            ],
            correctIndex: 0,
          },
          {
            question:
              "What does VEN analysis classify medicines by?",
            options: [
              "Volume, Expense, and Novelty",
              "Vital, Essential, and Non-essential clinical importance",
              "Vendor, Expiry, and Number in stock",
              "Value, Efficacy, and Necessity of prescription",
            ],
            correctIndex: 1,
          },
          {
            question:
              "What digital system does the Ghana Health Service use for electronic stock level and consumption reporting?",
            options: [
              "SAP Enterprise",
              "Oracle Health Suite",
              "GHS eLMIS platform",
              "Microsoft Dynamics Pharmacy",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "sc-L5",
        title: "Distribution & Last-Mile Delivery",
        duration: "45 min",
        content: `Pharmaceutical distribution connects manufacturers and central warehouses to the health facilities and pharmacies where patients access medicines. In Ghana, the public-sector distribution network follows a tiered structure: the Central Medical Stores in Tema supplies Regional Medical Stores (RMS), which in turn supply district hospitals, health centres, and Community-based Health Planning and Services (CHPS) compounds. The private sector relies on licensed pharmaceutical wholesalers and distributors who supply community pharmacies and licensed chemical sellers. Efficient distribution requires reliable transportation, route optimisation, and maintaining product integrity during transit — particularly for cold chain items that need refrigerated vehicles.\n\nThe urban-rural divide presents one of the most persistent distribution challenges in Ghana. While facilities in Accra, Kumasi, and other major cities benefit from proximity to warehouses and well-maintained roads, rural and hard-to-reach areas in the Northern, Upper East, Upper West, and Oti regions face long travel distances, poor road infrastructure (especially during rainy seasons), and limited transport options. These barriers contribute to medicine stock-outs in rural facilities and health inequities between urban and rural populations. Innovative approaches are being explored, including hub-and-spoke distribution models, motorcycle courier networks, and community health worker-led resupply systems.\n\nGhana has gained international recognition for its pioneering use of drone technology in medical supply delivery. Zipline, an autonomous drone delivery company, operates distribution centres in Omenako, Mpanya, Vobsi, and other locations, delivering blood products, vaccines, essential medicines, and COVID-19 vaccines to over 2,500 health facilities across the country. Drones can complete deliveries in 30–45 minutes to facilities that might take hours to reach by road, dramatically reducing emergency response times. This last-mile innovation has positioned Ghana as a global leader in health supply chain technology and offers a model for overcoming geographic barriers to medicine access across sub-Saharan Africa.`,
        keyPoints: [
          "Ghana's public distribution follows a tiered CMS-to-RMS-to-district structure",
          "The urban-rural divide causes medicine stock-outs in remote northern and rural facilities",
          "Zipline operates drone delivery from multiple centres serving over 2,500 health facilities in Ghana",
          "Drones deliver blood products, vaccines, and essential medicines in 30–45 minutes to remote areas",
        ],
        quiz: [
          {
            question:
              "What is the tiered public-sector distribution structure in Ghana?",
            options: [
              "Central Medical Stores to Regional Medical Stores to district facilities",
              "WHO warehouse to national hospital to pharmacy",
              "Manufacturer direct to patient",
              "Port authority to retail pharmacy only",
            ],
            correctIndex: 0,
          },
          {
            question:
              "Which company operates autonomous drone delivery of medical supplies in Ghana?",
            options: [
              "Amazon Prime Air",
              "DHL Express Ghana",
              "Zipline",
              "Wing Aviation",
            ],
            correctIndex: 2,
          },
          {
            question:
              "What is a major distribution challenge for rural health facilities in Ghana?",
            options: [
              "Excessive supply of medicines",
              "Too many distribution centres nearby",
              "Poor road infrastructure and long travel distances, especially in rainy seasons",
              "Overabundance of licensed wholesalers in rural areas",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "sc-L6",
        title: "Quality Assurance in the Supply Chain",
        duration: "45 min",
        content: `Quality assurance in the pharmaceutical supply chain ensures that medicines reaching patients are safe, effective, and of acceptable quality. Counterfeit and substandard medicines represent a grave threat across West Africa, with the WHO estimating that up to 10% of medicines in low- and middle-income countries are substandard or falsified. In Ghana, the Food and Drugs Authority (FDA) serves as the national regulatory body responsible for registering pharmaceutical products, inspecting manufacturing and storage facilities, conducting post-market surveillance, and removing unsafe products from circulation. The Ghana FDA conducts routine and risk-based inspections of importers, wholesalers, and retail outlets to verify compliance with Good Distribution Practice (GDP) and Good Storage Practice (GSP).\n\nTechnology-driven verification systems have emerged as powerful tools against counterfeits. mPedigree, a Ghanaian-founded technology company, developed a mobile verification platform that allows consumers and pharmacists to authenticate medicines by sending a scratch-off code via SMS or using a smartphone app. The system returns an instant confirmation of whether the product is genuine, empowering end-users to protect themselves. The Ghana FDA has also partnered with international organisations to deploy track-and-trace systems, and the introduction of unique product identifiers on packaging strengthens the ability to trace medicines from manufacturer to patient. These innovations complement traditional regulatory inspections and create multiple layers of protection against counterfeit infiltration.\n\nPharmacovigilance — the science of monitoring and preventing adverse drug reactions — forms another critical dimension of quality assurance. Ghana's pharmacovigilance programme, coordinated by the FDA's Safety Monitoring Division, collects spontaneous adverse event reports from healthcare professionals through the Med Safety app and yellow card reporting forms. Supply chain actors play an essential role by identifying and reporting suspected quality defects, unusual adverse events linked to specific batches, and any signs of product tampering. When quality signals are detected, the FDA can initiate batch recalls, issue public alerts, and coordinate with the manufacturer. A well-functioning pharmacovigilance system depends on the active participation of pharmacists at every level of the supply chain, from warehouse managers to community dispensers.`,
        keyPoints: [
          "Ghana's FDA inspects facilities for compliance with Good Distribution and Good Storage Practice",
          "mPedigree, a Ghanaian-founded platform, enables SMS-based medicine authentication against counterfeits",
          "WHO estimates up to 10% of medicines in low- and middle-income countries are substandard or falsified",
          "Ghana's pharmacovigilance programme uses the Med Safety app and yellow card forms for adverse event reporting",
        ],
        quiz: [
          {
            question:
              "What is the estimated percentage of substandard or falsified medicines in low- and middle-income countries according to WHO?",
            options: [
              "Up to 10%",
              "Less than 1%",
              "About 25%",
              "Over 50%",
            ],
            correctIndex: 0,
          },
          {
            question:
              "What Ghanaian-founded technology platform allows medicine authentication via SMS?",
            options: [
              "M-Pesa",
              "mPedigree",
              "Jumia Health",
              "PharmAccess",
            ],
            correctIndex: 1,
          },
          {
            question:
              "Which division of the Ghana FDA coordinates the national pharmacovigilance programme?",
            options: [
              "Drug Registration Division",
              "Food Inspectorate Division",
              "Safety Monitoring Division",
              "Cosmetics and Household Products Division",
            ],
            correctIndex: 2,
          },
        ],
      },
    ],
  },
  "pharmacokinetics": {
    id: "pharmacokinetics",
    title: "Pharmacokinetics & Drug Metabolism",
    description: "A comprehensive exploration of how the human body absorbs, distributes, metabolises, and excretes drugs. This course covers compartmental modelling, bioavailability studies, hepatic and renal drug handling, and clinically important drug interactions, with specific attention to pharmacogenomic considerations and therapeutic challenges encountered in Ghanaian clinical practice.",
    estimatedTime: "5.5 hours",
    lessons: [
      {
        id: "pk-L1",
        title: "ADME Overview",
        duration: "45 min",
        content: `Pharmacokinetics is the quantitative study of what the body does to a drug after administration. The discipline rests on four interconnected pillars known collectively as ADME: Absorption, Distribution, Metabolism, and Excretion. Absorption describes the movement of a drug from its site of administration into the systemic circulation. For orally administered medicines — the most common route dispensed in Ghanaian community pharmacies — the drug must dissolve in gastrointestinal fluid, cross the intestinal epithelium (primarily via passive transcellular diffusion or carrier-mediated transport), and survive first-pass metabolism in the gut wall and liver before reaching the bloodstream. Factors such as gastric pH, intestinal motility, food effects, and formulation design all modulate the rate and extent of absorption.\n\nDistribution refers to the reversible transfer of drug from the blood into tissues and organs. It is governed by blood flow, tissue binding, plasma-protein binding (notably to albumin and alpha-1-acid glycoprotein), and physicochemical properties like lipophilicity and ionisation state. The apparent volume of distribution (Vd) is a proportionality constant that relates the total amount of drug in the body to its plasma concentration. Highly lipophilic drugs such as chloroquine — still widely used in parts of Ghana — exhibit very large Vd values because they sequester extensively in peripheral tissues.\n\nMetabolism (biotransformation) and excretion together constitute drug elimination. Metabolism primarily occurs in the liver through Phase I oxidative reactions catalysed by cytochrome P450 enzymes and Phase II conjugation reactions that increase water solubility. Excretion is the irreversible removal of drug or metabolites from the body, mainly via the kidneys but also through bile, lungs, and sweat. Understanding ADME allows pharmacists to predict onset of action, duration of effect, appropriate dosing intervals, and potential sources of inter-patient variability — knowledge that is foundational for pharmaceutical care at every level of the Ghanaian health system.`,
        keyPoints: [
          "ADME stands for Absorption, Distribution, Metabolism, and Excretion — the four fundamental pharmacokinetic processes.",
          "Oral absorption depends on drug dissolution, GI permeability, and survival of hepatic first-pass metabolism.",
          "Volume of distribution (Vd) links plasma concentration to total body drug content and reflects tissue binding.",
          "Metabolism (mainly hepatic) and excretion (mainly renal) are the two routes of drug elimination from the body."
        ],
        quiz: [
          {
            question: "Which pharmacokinetic parameter relates the total amount of drug in the body to its measured plasma concentration?",
            options: [
              "Volume of distribution (Vd)",
              "Clearance (CL)",
              "Bioavailability (F)",
              "Half-life (t1/2)"
            ],
            correctIndex: 0,
          },
          {
            question: "First-pass metabolism most directly reduces the bioavailability of drugs administered by which route?",
            options: [
              "Oral",
              "Intravenous",
              "Sublingual",
              "Transdermal"
            ],
            correctIndex: 0,
          },
          {
            question: "A drug with a very large volume of distribution is most likely to have which characteristic?",
            options: [
              "High lipophilicity and extensive tissue binding",
              "High water solubility and strong albumin binding",
              "Rapid renal clearance",
              "Low membrane permeability"
            ],
            correctIndex: 0,
          },
        ],
      },
      {
        id: "pk-L2",
        title: "Compartmental Models & Half-life",
        duration: "50 min",
        content: `Pharmacokinetic modelling uses mathematical compartments — hypothetical, kinetically homogeneous spaces — to describe how drug concentrations change over time. In the one-compartment model, the body is treated as a single, well-stirred volume into which drug distributes instantaneously after intravenous administration. The plasma concentration-time curve follows a mono-exponential decline characterised by a single elimination rate constant (ke). This simple model works well for many water-soluble drugs such as aminoglycoside antibiotics (gentamicin, amikacin) dosed at facilities like Korle Bu Teaching Hospital, where therapeutic drug monitoring services are available.\n\nThe two-compartment model adds a peripheral (tissue) compartment connected to the central (plasma) compartment by first-order distribution rate constants. After an IV bolus, the concentration-time profile shows a rapid initial decline (the distribution or alpha phase) followed by a slower terminal decline (the elimination or beta phase). Drugs that exhibit two-compartment behaviour include vancomycin and digoxin. Clinically, sampling too early — during the distribution phase — can yield misleadingly high concentrations, which is why timing of blood draws for TDM is critical.\n\nThe elimination half-life (t1/2) is the time required for the plasma concentration to fall by 50 percent during the terminal phase. It is calculated as t1/2 = 0.693 / ke (one-compartment) or t1/2 = 0.693 / beta (two-compartment). Half-life determines how long it takes to reach steady state during repeated dosing (approximately 4-5 half-lives) and how long drug effect persists after discontinuation. For example, the long half-life of amlodipine (~35-50 hours) supports once-daily dosing for hypertension — the most prevalent non-communicable disease in Ghana. Conversely, drugs with short half-lives like artesunate require either frequent dosing or sustained-release formulations to maintain therapeutic levels throughout an ACT regimen for malaria.`,
        keyPoints: [
          "The one-compartment model treats the body as a single kinetically homogeneous space with mono-exponential elimination.",
          "The two-compartment model adds a peripheral tissue compartment, producing distinct distribution (alpha) and elimination (beta) phases.",
          "Half-life (t1/2 = 0.693/ke) determines time to steady state (~4-5 half-lives) and duration of drug effect after stopping therapy.",
          "Sampling time relative to dose is critical in TDM to avoid measuring during the distribution phase."
        ],
        quiz: [
          {
            question: "Approximately how many half-lives are required to reach steady-state plasma concentration during repeated dosing?",
            options: [
              "4-5 half-lives",
              "1-2 half-lives",
              "7-10 half-lives",
              "2-3 half-lives"
            ],
            correctIndex: 0,
          },
          {
            question: "In a two-compartment model, the initial rapid decline in plasma concentration after an IV bolus represents which phase?",
            options: [
              "Distribution (alpha) phase",
              "Elimination (beta) phase",
              "Absorption phase",
              "Steady-state phase"
            ],
            correctIndex: 0,
          },
          {
            question: "The elimination rate constant (ke) is related to half-life by which equation?",
            options: [
              "t1/2 = 0.693 / ke",
              "t1/2 = ke / 0.693",
              "t1/2 = ke x Vd",
              "t1/2 = CL / ke"
            ],
            correctIndex: 0,
          },
        ],
      },
      {
        id: "pk-L3",
        title: "Bioavailability & Bioequivalence",
        duration: "50 min",
        content: `Bioavailability (F) is the fraction of an administered dose that reaches the systemic circulation in unchanged form. For an intravenous dose, F is by definition 1.0 (100%). For extravascular routes, F is less than 1.0 due to incomplete absorption and first-pass metabolism. Absolute bioavailability is determined by comparing the area under the plasma concentration-time curve (AUC) after extravascular administration to the AUC after an IV dose. The AUC is calculated using the trapezoidal rule and represents the total systemic drug exposure over time. Two additional parameters — Cmax (peak plasma concentration) and Tmax (time to reach Cmax) — characterise the rate of absorption and are clinically important: a higher Cmax may increase efficacy or toxicity risk, while a delayed Tmax may slow onset of action.\n\nBioequivalence (BE) studies are pivotal for generic drug approval. Two formulations are considered bioequivalent if they deliver the same active ingredient at the same rate and extent of absorption under similar conditions. Regulatory agencies, including the Ghana Food and Drugs Authority (FDA), require that the 90% confidence intervals for the ratio of AUC and Cmax between the test (generic) and reference (innovator) products fall within the 80-125% acceptance range in a crossover pharmacokinetic study conducted in healthy volunteers. This standard ensures that generic medicines marketed in Ghana provide the same therapeutic outcome as their branded counterparts.\n\nBioequivalence is especially significant in Ghana's pharmaceutical landscape, where a large proportion of medicines are imported generics or locally manufactured alternatives. The Ghana FDA has progressively strengthened its BE requirements, and the Centre for Plant Medicine Research and several university pharmacy departments contribute to local BE study capacity. For narrow therapeutic index drugs — such as carbamazepine, phenytoin, and cyclosporine — tighter BE limits may apply because small differences in exposure can cause treatment failure or toxicity. Pharmacists play a critical gatekeeping role by ensuring that substituted generics have received proper BE certification and by counselling patients on the clinical equivalence of approved generics.`,
        keyPoints: [
          "Bioavailability (F) is the fraction of a dose reaching systemic circulation unchanged; it equals 1.0 for IV dosing.",
          "AUC, Cmax, and Tmax are the key pharmacokinetic parameters used to assess rate and extent of drug absorption.",
          "The Ghana FDA requires 90% confidence intervals for AUC and Cmax ratios to fall within 80-125% for generic approval.",
          "Narrow therapeutic index drugs may require tighter bioequivalence limits to ensure safe generic substitution."
        ],
        quiz: [
          {
            question: "What is the standard bioequivalence acceptance range for the 90% confidence interval of AUC and Cmax ratios?",
            options: [
              "80-125%",
              "70-130%",
              "90-110%",
              "85-115%"
            ],
            correctIndex: 0,
          },
          {
            question: "Which pharmacokinetic parameter best represents the total systemic exposure to a drug over time?",
            options: [
              "AUC (area under the curve)",
              "Cmax (peak concentration)",
              "Tmax (time to peak)",
              "Half-life (t1/2)"
            ],
            correctIndex: 0,
          },
          {
            question: "For a drug administered intravenously, the bioavailability (F) is:",
            options: [
              "1.0 (100%)",
              "0.5 (50%)",
              "Variable depending on the drug",
              "Determined by first-pass metabolism"
            ],
            correctIndex: 0,
          },
        ],
      },
      {
        id: "pk-L4",
        title: "Hepatic Drug Metabolism",
        duration: "55 min",
        content: `The liver is the principal organ of drug biotransformation. Hepatic metabolism is conventionally divided into Phase I (functionalisation) and Phase II (conjugation) reactions. Phase I reactions — oxidation, reduction, and hydrolysis — introduce or unmask a polar functional group on the drug molecule. The cytochrome P450 (CYP) superfamily of haem-containing monooxygenases, located in the smooth endoplasmic reticulum of hepatocytes, catalyses the majority of Phase I oxidations. The most clinically important isoforms are CYP3A4 (metabolises approximately 50% of all drugs), CYP2D6, CYP2C9, CYP2C19, and CYP1A2. Phase II reactions attach an endogenous hydrophilic group — glucuronic acid, sulphate, glutathione, or an acetyl group — to the Phase I metabolite (or directly to the parent drug), dramatically increasing water solubility and facilitating renal or biliary excretion. Key Phase II enzymes include UDP-glucuronosyltransferases (UGTs), sulphotransferases, and N-acetyltransferases.\n\nPharmacogenomics — the study of how genetic variation affects drug response — has particular relevance to hepatic metabolism in Ghanaian and broader West African populations. CYP2D6 is highly polymorphic, with over 100 known allelic variants. Studies in Ghanaian cohorts have demonstrated a high prevalence of CYP2D6*17 (reduced-function allele), which is common in sub-Saharan African populations but rare in Europeans and Asians. Individuals carrying CYP2D6*17 may display intermediate metaboliser phenotypes, affecting the efficacy and toxicity of substrates such as codeine, tramadol, and tamoxifen. Notably, Ghana has also reported CYP2D6 ultra-rapid metabolisers (gene duplications), who convert codeine to morphine excessively and face heightened risk of respiratory depression. Research from the University of Ghana School of Pharmacy and the Centre for Tropical Clinical Pharmacology and Therapeutics has contributed valuable pharmacogenomic data for the Ghanaian population.\n\nClinically, understanding hepatic metabolism guides prescribing, dosing, and the prediction of drug interactions. Enzyme induction (e.g., by rifampicin, carbamazepine) increases CYP expression over days to weeks, accelerating the metabolism of co-administered drugs and potentially causing therapeutic failure. Enzyme inhibition (e.g., by ketoconazole, erythromycin, grapefruit juice) decreases CYP activity rapidly, raising plasma levels of substrates and increasing toxicity risk. In Ghana's public health context, the potent CYP3A4 induction by rifampicin — a cornerstone of TB treatment — has profound implications for antiretroviral therapy in TB/HIV co-infected patients, a topic addressed in depth in Lesson 6.`,
        keyPoints: [
          "Phase I reactions (mainly CYP450 oxidations) functionalise drug molecules; Phase II conjugation reactions increase water solubility for excretion.",
          "CYP3A4 metabolises roughly 50% of all drugs and is the most clinically significant P450 isoform.",
          "CYP2D6*17, a reduced-function allele prevalent in Ghanaian populations, can alter metabolism of codeine, tramadol, and tamoxifen.",
          "Enzyme induction increases CYP expression (risk of therapeutic failure), while inhibition decreases CYP activity (risk of toxicity)."
        ],
        quiz: [
          {
            question: "Which CYP2D6 allele is notably prevalent in Ghanaian and West African populations and confers a reduced-function phenotype?",
            options: [
              "CYP2D6*17",
              "CYP2D6*4",
              "CYP2D6*10",
              "CYP2D6*1"
            ],
            correctIndex: 0,
          },
          {
            question: "Which CYP450 isoform is responsible for the metabolism of approximately 50% of clinically used drugs?",
            options: [
              "CYP3A4",
              "CYP2D6",
              "CYP1A2",
              "CYP2E1"
            ],
            correctIndex: 0,
          },
          {
            question: "Phase II conjugation reactions primarily serve to:",
            options: [
              "Increase water solubility to facilitate excretion",
              "Activate prodrugs to their therapeutic form",
              "Reduce the molecular weight of drug molecules",
              "Enhance lipophilicity for tissue distribution"
            ],
            correctIndex: 0,
          },
        ],
      },
      {
        id: "pk-L5",
        title: "Renal Excretion & Dosing Adjustments",
        duration: "45 min",
        content: `The kidneys are the primary organs responsible for the excretion of drugs and their water-soluble metabolites. Renal drug elimination involves three processes: glomerular filtration, active tubular secretion, and passive tubular reabsorption. Glomerular filtration allows free (unbound) drug to pass from plasma into the tubular fluid at a rate proportional to the glomerular filtration rate (GFR), normally approximately 120 mL/min in a healthy adult. Active tubular secretion, mediated by organic anion transporters (OATs) and organic cation transporters (OCTs) in the proximal tubule, can clear drug even when it is protein-bound, making renal clearance exceed GFR for some agents (e.g., penicillins, metformin). Passive tubular reabsorption returns lipophilic, un-ionised drug from the tubular lumen back into the blood, reducing net renal excretion. Urinary pH manipulation can alter the ionisation state of weak acids and bases, a principle exploited in the management of certain drug overdoses.\n\nAssessing renal function is essential for safe dosing of renally eliminated drugs. The Cockcroft-Gault equation estimates creatinine clearance (CrCl) from serum creatinine, age, weight, and sex: CrCl = [(140 - age) x weight] / (72 x serum creatinine), multiplied by 0.85 for females. Although newer CKD-EPI equations using cystatin C are gaining traction, Cockcroft-Gault remains the standard referenced in most drug labelling and dose-adjustment guidelines. In Ghanaian clinical settings — where chronic kidney disease prevalence is rising, particularly in hypertensive and diabetic patients — pharmacists at facilities such as Korle Bu Teaching Hospital routinely calculate CrCl to guide dose reductions for drugs including gentamicin, vancomycin, metformin, enoxaparin, and acyclovir.\n\nDose adjustment strategies for renal impairment include reducing the individual dose while keeping the interval constant, extending the dosing interval while keeping the dose constant, or a combination of both. The choice depends on whether a drug's efficacy is concentration-dependent (favour maintaining dose, extend interval — e.g., aminoglycosides) or time-dependent (favour maintaining interval, reduce dose — e.g., beta-lactams). Pharmacists must also identify drugs that are contraindicated below certain GFR thresholds, such as metformin below 30 mL/min or dabigatran below 15 mL/min, and counsel patients accordingly. In Ghana, the increasing burden of chronic kidney disease underscores the vital role of the clinical pharmacist in renal dose optimisation.`,
        keyPoints: [
          "Renal drug excretion involves glomerular filtration, active tubular secretion (OAT/OCT transporters), and passive tubular reabsorption.",
          "The Cockcroft-Gault equation estimates creatinine clearance and remains the standard for drug dose-adjustment decisions.",
          "Concentration-dependent drugs favour extended intervals in renal impairment; time-dependent drugs favour dose reduction with maintained intervals.",
          "Pharmacists must identify drugs contraindicated below specific GFR thresholds (e.g., metformin < 30 mL/min) to prevent toxicity."
        ],
        quiz: [
          {
            question: "Which equation is most commonly referenced in drug labelling for estimating creatinine clearance to guide dose adjustments?",
            options: [
              "Cockcroft-Gault equation",
              "CKD-EPI equation",
              "MDRD equation",
              "Henderson-Hasselbalch equation"
            ],
            correctIndex: 0,
          },
          {
            question: "For a concentration-dependent antibiotic like gentamicin in a patient with renal impairment, the preferred dose-adjustment strategy is to:",
            options: [
              "Extend the dosing interval while maintaining the dose",
              "Reduce the dose while maintaining the interval",
              "Double the dose and double the interval",
              "Switch to oral formulation"
            ],
            correctIndex: 0,
          },
          {
            question: "Active tubular secretion differs from glomerular filtration in that it can:",
            options: [
              "Clear protein-bound drug from plasma",
              "Only filter free drug",
              "Reabsorb lipophilic drugs",
              "Function only at alkaline urinary pH"
            ],
            correctIndex: 0,
          },
        ],
      },
      {
        id: "pk-L6",
        title: "Drug Interactions & Clinical Pharmacokinetics",
        duration: "40 min",
        content: `Pharmacokinetic drug interactions arise when one drug alters the absorption, distribution, metabolism, or excretion of another, leading to changes in plasma concentration and clinical effect. Metabolic interactions mediated by CYP450 enzymes are the most clinically significant category. Enzyme inhibition occurs rapidly — often within one to two doses of the inhibitor — and raises substrate plasma levels, increasing toxicity risk. Potent CYP3A4 inhibitors such as ketoconazole, ritonavir, and clarithromycin can dramatically increase exposure to co-administered substrates like simvastatin (risk of rhabdomyolysis) or midazolam (risk of prolonged sedation). Enzyme induction, conversely, requires days to weeks because it depends on new protein synthesis; when the inducer is discontinued, enzyme levels return to baseline over a similar timeframe. Therapeutic drug monitoring (TDM) — measuring drug concentrations in patient samples and adjusting doses accordingly — is the primary clinical tool for managing drugs with narrow therapeutic indices where interactions are unavoidable.\n\nIn Ghana, one of the most consequential pharmacokinetic drug interactions occurs between rifampicin and antiretroviral agents in patients co-infected with tuberculosis and HIV — a common clinical scenario given the country's dual disease burden. Rifampicin is one of the most potent known inducers of CYP3A4, CYP2C19, and P-glycoprotein. When co-administered with the protease inhibitor lopinavir (boosted with ritonavir), rifampicin can reduce lopinavir plasma levels by over 75%, leading to virological failure and potential emergence of HIV drug resistance. Current WHO and Ghana AIDS Commission guidelines therefore recommend efavirenz-based or dolutegravir-based regimens for patients on rifampicin-containing TB treatment, as these agents are less affected by CYP3A4 induction. Dolutegravir, an integrase inhibitor, requires dose adjustment (50 mg twice daily instead of once daily) during rifampicin co-administration because rifampicin induces UGT1A1, the primary enzyme metabolising dolutegravir.\n\nClinical pharmacokinetic services, including TDM, are expanding in Ghana. Korle Bu Teaching Hospital and a growing number of tertiary facilities now offer aminoglycoside and vancomycin level monitoring, and discussions are underway to extend TDM to antiretrovirals and anti-epileptics. Pharmacists trained in clinical pharmacokinetics use measured drug concentrations, patient-specific parameters (weight, renal function, hepatic status), and Bayesian dosing software to individualise therapy. As Ghana's pharmaceutical care model matures, the integration of pharmacokinetic principles into routine clinical pharmacy practice will be essential for optimising treatment outcomes, minimising adverse effects, and combating antimicrobial resistance.`,
        keyPoints: [
          "CYP450-mediated metabolic interactions are the most clinically important pharmacokinetic drug interactions.",
          "Rifampicin potently induces CYP3A4 and can reduce protease inhibitor levels by >75%, necessitating alternative ARV regimens in TB/HIV co-infection.",
          "Dolutegravir dose must be increased to 50 mg twice daily when co-administered with rifampicin due to UGT1A1 induction.",
          "TDM services at Korle Bu and other Ghanaian tertiary facilities enable individualised dosing for narrow therapeutic index drugs."
        ],
        quiz: [
          {
            question: "Rifampicin reduces lopinavir plasma levels primarily by which mechanism?",
            options: [
              "Potent induction of CYP3A4",
              "Inhibition of CYP2D6",
              "Competitive binding to plasma albumin",
              "Reduction of gastrointestinal absorption"
            ],
            correctIndex: 0,
          },
          {
            question: "When dolutegravir is co-administered with rifampicin, the recommended dose adjustment is:",
            options: [
              "Increase to 50 mg twice daily",
              "Decrease to 25 mg once daily",
              "No adjustment needed",
              "Increase to 100 mg once daily"
            ],
            correctIndex: 0,
          },
          {
            question: "Enzyme inhibition typically alters substrate drug levels within what timeframe?",
            options: [
              "One to two doses of the inhibitor",
              "Two to four weeks",
              "Only after steady state of the inhibitor is reached",
              "Three to five half-lives of the substrate"
            ],
            correctIndex: 0,
          },
        ],
      },
    ],
  },

  "toxicology": {
    id: "toxicology",
    title: "Toxicology & Poison Management",
    description:
      "A comprehensive course on the principles of toxicology, common poisoning scenarios encountered in Ghanaian healthcare, and evidence-based management strategies. Covers paracetamol overdose, pesticide poisoning, heavy metal contamination, drug overdose protocols, and pharmacovigilance through the Ghana FDA.",
    estimatedTime: "4.5 hours",
    lessons: [
      {
        id: "tox-L1",
        title: "Principles of Toxicology",
        duration: "40 min",
        content: `Toxicology is the scientific study of the adverse effects of chemical, physical, and biological agents on living organisms. At its core lies the dose-response relationship, famously summarised by Paracelsus: "The dose makes the poison." Every substance — from water to cyanide — can be toxic at a sufficient dose. The median lethal dose (LD50) quantifies the dose required to kill 50% of a test population and remains a foundational benchmark for comparing the acute toxicity of substances. In pharmacy practice, the therapeutic index (TI), calculated as the ratio of the toxic dose to the therapeutic dose (TD50/ED50), guides safe prescribing. Drugs with a narrow therapeutic index such as digoxin, lithium, and warfarin demand careful monitoring because the margin between efficacy and toxicity is slim.\n\nPoisons are classified by origin (biological, chemical, physical), target organ (hepatotoxins, nephrotoxins, neurotoxins), and mechanism of action (enzyme inhibitors, receptor agonists/antagonists, metabolic disruptors). In the Ghanaian context, common toxic exposures include agricultural pesticides — particularly organophosphates and paraquat used in cocoa, vegetable, and rice farming — as well as herbal preparations of unknown composition sold in open markets. Understanding the ADME (absorption, distribution, metabolism, excretion) of toxicants is critical for predicting toxicity timelines and selecting appropriate decontamination or antidotal strategies.\n\nThe approach to a poisoned patient follows the universal "Resuscitate, Risk-assess, Investigate, Decontaminate, Enhance elimination, Antidote" framework. In Ghana, initial stabilisation typically occurs at district or regional hospitals before referral to specialised poison centres at Korle Bu Teaching Hospital in Accra or Komfo Anokye Teaching Hospital (KATH) in Kumasi. Pharmacists play an essential role in poison information, antidote stocking, and therapeutic drug monitoring across all levels of the healthcare system.`,
        keyPoints: [
          "The dose-response relationship and LD50 are foundational concepts for comparing toxicity of substances",
          "Therapeutic index (TI) guides safe prescribing — narrow TI drugs like digoxin, lithium, and warfarin require close monitoring",
          "Poisons are classified by origin, target organ, and mechanism of action",
          "The poisoned patient framework: Resuscitate, Risk-assess, Investigate, Decontaminate, Enhance elimination, Antidote",
        ],
        quiz: [
          {
            question:
              "What does the LD50 of a substance represent?",
            options: [
              "The dose that kills 50% of a test population",
              "The dose that causes toxicity in 50% of patients",
              "The dose that is therapeutically effective in 50% of patients",
              "The lethal dose for a 50 kg individual",
            ],
            correctIndex: 0,
          },
          {
            question:
              "Which of the following drugs has a narrow therapeutic index?",
            options: [
              "Amoxicillin",
              "Lithium",
              "Metformin",
              "Ibuprofen",
            ],
            correctIndex: 1,
          },
          {
            question:
              "What is the correct sequence in the management framework for a poisoned patient?",
            options: [
              "Antidote first, then resuscitate and investigate",
              "Decontaminate, then risk-assess, then resuscitate",
              "Resuscitate, risk-assess, investigate, decontaminate, enhance elimination, antidote",
              "Investigate, decontaminate, resuscitate, antidote",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "tox-L2",
        title: "Paracetamol & NSAID Overdose",
        duration: "45 min",
        content: `Paracetamol (acetaminophen) is the most commonly ingested drug in overdose worldwide, and Ghana is no exception — its widespread availability as an over-the-counter analgesic in pharmacies, chemical shops, and open markets makes it a frequent agent in both intentional and accidental poisoning. At therapeutic doses, paracetamol is predominantly metabolised by glucuronidation and sulfation. However, in overdose, these pathways become saturated, and a greater fraction is oxidised by cytochrome P450 (mainly CYP2E1) to the reactive metabolite N-acetyl-p-benzoquinone imine (NAPQI). When hepatic glutathione stores are depleted below approximately 30% of normal, NAPQI binds covalently to hepatocyte proteins, causing centrilobular hepatic necrosis. The Rumack-Matthew nomogram plots plasma paracetamol concentration against time post-ingestion to guide treatment decisions.\n\nN-acetylcysteine (NAC) is the definitive antidote and works by replenishing glutathione stores and directly conjugating NAPQI. The standard intravenous NAC protocol involves a loading dose of 150 mg/kg over 1 hour, followed by 50 mg/kg over 4 hours, then 100 mg/kg over 16 hours. In Ghanaian hospitals, NAC availability can be inconsistent; pharmacists must ensure adequate stock, especially at emergency departments of referral hospitals. Anaphylactoid reactions to IV NAC (flushing, urticaria, bronchospasm) should be managed by slowing or temporarily stopping the infusion and administering antihistamines — the infusion should be restarted once symptoms resolve, as the benefit of NAC far outweighs the risk.\n\nNSAID overdose, while generally less life-threatening than paracetamol, can cause significant gastrointestinal haemorrhage, acute kidney injury, and metabolic acidosis. Ibuprofen is the most commonly implicated NSAID in Ghana due to its availability. Management is primarily supportive: GI decontamination with activated charcoal if within one hour, aggressive IV fluid resuscitation, proton pump inhibitors for GI protection, and monitoring of renal function and electrolytes. Pharmacists should counsel patients on safe dosing and the dangers of combining multiple analgesics, a practice that remains common in Ghanaian communities.`,
        keyPoints: [
          "NAPQI is the toxic metabolite of paracetamol formed via CYP2E1 when conjugation pathways are saturated",
          "N-acetylcysteine (NAC) is the antidote — it replenishes glutathione and directly conjugates NAPQI",
          "The Rumack-Matthew nomogram guides treatment decisions based on plasma paracetamol level vs time post-ingestion",
          "NSAID overdose management is primarily supportive — activated charcoal, IV fluids, PPIs, and renal monitoring",
        ],
        quiz: [
          {
            question:
              "What is the toxic metabolite of paracetamol responsible for hepatotoxicity in overdose?",
            options: [
              "Glucuronide conjugate",
              "Sulfate conjugate",
              "N-acetyl-p-benzoquinone imine (NAPQI)",
              "Para-aminophenol",
            ],
            correctIndex: 2,
          },
          {
            question:
              "What is the mechanism of action of N-acetylcysteine (NAC) in paracetamol poisoning?",
            options: [
              "It inhibits CYP2E1 to prevent NAPQI formation",
              "It replenishes glutathione stores and conjugates NAPQI",
              "It accelerates renal excretion of paracetamol",
              "It blocks absorption of paracetamol from the GI tract",
            ],
            correctIndex: 1,
          },
          {
            question:
              "What is the recommended initial management for ibuprofen overdose presenting within one hour?",
            options: [
              "Immediate haemodialysis",
              "IV N-acetylcysteine infusion",
              "Activated charcoal administration and supportive care",
              "Forced alkaline diuresis",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "tox-L3",
        title: "Pesticide & Organophosphate Poisoning",
        duration: "50 min",
        content: `Organophosphate (OP) poisoning is a major public health concern in Ghana, particularly among cocoa farmers, vegetable growers, and rice farmers who handle pesticides such as chlorpyrifos, diazinon, and pirimiphos-methyl, often without adequate personal protective equipment. Accidental exposure during spraying and intentional self-poisoning both contribute to the burden of cases presenting at district hospitals across the Ashanti, Eastern, and Volta regions. Organophosphates irreversibly inhibit acetylcholinesterase (AChE), leading to accumulation of acetylcholine at muscarinic and nicotinic receptors. The resulting cholinergic crisis manifests with the classic SLUDGE/BBB mnemonic: Salivation, Lacrimation, Urination, Defecation, GI distress, Emesis / Bradycardia, Bronchospasm, Bronchorrhoea. Nicotinic effects include muscle fasciculations, weakness, and paralysis, while CNS effects range from anxiety to seizures and coma.\n\nThe cornerstone of OP poisoning management is atropine, a competitive muscarinic antagonist. Atropine is titrated to effect — the endpoint is drying of bronchial secretions and adequate oxygenation, not pupil size or heart rate. Initial doses of 1-3 mg IV are repeated every 5-10 minutes, and massive doses (sometimes exceeding 100 mg in the first 24 hours) may be required for severe cases. Pralidoxime (2-PAM), an oxime that reactivates inhibited AChE, should be administered early before "aging" of the enzyme-OP complex renders reactivation impossible. The WHO recommends a loading dose of 30 mg/kg IV over 20 minutes followed by 8 mg/kg/hour infusion. In many Ghanaian facilities, pralidoxime availability is limited, making early atropinisation and aggressive supportive care even more critical.\n\nParaquat, a bipyridyl herbicide still accessible in parts of Ghana despite regulatory efforts, deserves special mention. Paraquat ingestion carries a mortality rate exceeding 60-70%. It causes multi-organ failure through generation of reactive oxygen species, with pulmonary fibrosis being the hallmark lethal outcome. There is no specific antidote — management focuses on limiting absorption with Fuller's earth or activated charcoal and aggressive supportive care. Oxygen supplementation is paradoxically contraindicated as it worsens oxidative lung injury. Pharmacists in agricultural communities must advocate for safe pesticide storage, use of PPE, and awareness of poison centre contact numbers.`,
        keyPoints: [
          "Organophosphates irreversibly inhibit acetylcholinesterase, causing cholinergic crisis (SLUDGE/BBB)",
          "Atropine is titrated to drying of bronchial secretions — massive doses may be needed in severe OP poisoning",
          "Pralidoxime reactivates AChE but must be given early before enzyme-OP complex aging occurs",
          "Paraquat poisoning has very high mortality — oxygen is paradoxically contraindicated as it worsens oxidative lung damage",
        ],
        quiz: [
          {
            question:
              "What is the mechanism of toxicity of organophosphate pesticides?",
            options: [
              "Competitive antagonism of nicotinic receptors",
              "Irreversible inhibition of acetylcholinesterase",
              "Blockade of GABA receptors in the CNS",
              "Inhibition of cytochrome P450 enzymes",
            ],
            correctIndex: 1,
          },
          {
            question:
              "What is the correct clinical endpoint for atropine titration in organophosphate poisoning?",
            options: [
              "Pupil dilation to 4 mm",
              "Heart rate above 100 bpm",
              "Drying of bronchial secretions and adequate oxygenation",
              "Cessation of all muscle fasciculations",
            ],
            correctIndex: 2,
          },
          {
            question:
              "Why is supplemental oxygen generally avoided in paraquat poisoning?",
            options: [
              "Paraquat inactivates oxygen molecules",
              "Oxygen worsens oxidative lung injury and pulmonary fibrosis",
              "Oxygen accelerates paraquat absorption from the gut",
              "It causes a dangerous interaction producing cyanide gas",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "tox-L4",
        title: "Heavy Metal Poisoning",
        duration: "45 min",
        content: `Heavy metal poisoning is an important occupational and environmental health concern in Ghana, driven largely by artisanal and small-scale gold mining (galamsey) that contaminates water sources with mercury and arsenic, as well as lead exposure from paint, batteries, and informal recycling operations. The Tarkwa-Nsuaem, Obuasi, and Upper East mining regions have documented elevated mercury levels in soil, water, and the hair and blood of mining communities. Lead poisoning remains a concern in urban areas such as Accra and Kumasi, particularly among children exposed to lead-based paint in older buildings and from informal e-waste recycling at sites like Agbogbloshie.\n\nLead inhibits delta-aminolevulinic acid dehydratase (ALAD) and ferrochelatase in the haem synthesis pathway, leading to microcytic anaemia with basophilic stippling. Neurological effects — cognitive impairment, peripheral neuropathy, and encephalopathy in severe cases — are especially devastating in children. Blood lead levels above 5 mcg/dL warrant intervention. Chelation therapy with succimer (DMSA) orally or calcium disodium EDTA (CaNa2EDTA) intravenously is indicated for symptomatic patients or those with levels above 45 mcg/dL. Mercury exists in elemental, inorganic, and organic (methylmercury) forms. Elemental mercury vapour from gold amalgamation in galamsey operations causes pulmonary, neurological, and renal toxicity. Chronic exposure leads to erethism (personality changes, tremor, gingivitis). Chelation with DMSA or unithiol (DMPS) is used for symptomatic inorganic mercury poisoning.\n\nArsenic contamination in Ghana occurs through mining waste and naturally occurring geological deposits. Chronic arsenic exposure causes characteristic skin changes (hyperpigmentation, keratoses), peripheral neuropathy, and increased cancer risk (skin, lung, bladder). Acute arsenic poisoning presents with severe gastroenteritis, "rice water" diarrhoea, and cardiovascular collapse. Chelation with dimercaprol (BAL) or DMSA is the treatment of choice. Pharmacists serving mining communities should be aware of the clinical presentations, ensure chelation agents are accessible at regional hospital pharmacies, and participate in public health advocacy for environmental monitoring and safe mining practices.`,
        keyPoints: [
          "Galamsey (artisanal gold mining) is a major source of mercury and arsenic contamination in Ghanaian communities",
          "Lead inhibits haem synthesis enzymes causing microcytic anaemia — chelation with DMSA or CaNa2EDTA for severe cases",
          "Mercury vapour from gold amalgamation causes pulmonary, neurological, and renal toxicity with chronic erethism",
          "Chronic arsenic exposure causes skin changes, neuropathy, and increased cancer risk — dimercaprol or DMSA for chelation",
        ],
        quiz: [
          {
            question:
              "Which enzyme in the haem synthesis pathway is inhibited by lead?",
            options: [
              "Cytochrome P450 reductase",
              "Delta-aminolevulinic acid dehydratase (ALAD)",
              "Glucose-6-phosphate dehydrogenase",
              "Haem oxygenase",
            ],
            correctIndex: 1,
          },
          {
            question:
              "What is the primary source of mercury contamination in Ghanaian mining communities?",
            options: [
              "Industrial pharmaceutical waste",
              "Mercury-containing thermometers in hospitals",
              "Gold amalgamation in artisanal small-scale mining (galamsey)",
              "Mercury-based fungicides in agriculture",
            ],
            correctIndex: 2,
          },
          {
            question:
              "Which chelation agent is the first-line treatment for acute symptomatic arsenic poisoning?",
            options: [
              "Deferoxamine",
              "Penicillamine",
              "Dimercaprol (BAL)",
              "Calcium disodium EDTA",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "tox-L5",
        title: "Drug Overdose Management",
        duration: "45 min",
        content: `Drug overdose management requires rapid identification of the toxidrome, stabilisation of the patient, and administration of specific antidotes where available. In Ghana, the most commonly encountered drug overdoses include opioids (tramadol abuse is a significant public health problem, particularly among youth in the Northern, Ashanti, and Greater Accra regions), benzodiazepines, tricyclic antidepressants (TCAs), and antimalarials such as chloroquine. The National Poison Information Centre at Korle Bu Teaching Hospital and the toxicology unit at KATH serve as referral points for complex poisoning cases nationwide.\n\nOpioid overdose presents with the classic triad of miosis, respiratory depression, and decreased level of consciousness. Naloxone, a competitive mu-opioid receptor antagonist, is the specific antidote. Initial dosing is 0.4-2 mg IV, repeated every 2-3 minutes to a maximum of 10 mg. Because tramadol also has serotonergic and noradrenergic reuptake inhibition, overdose may present with seizures that do not respond to naloxone — benzodiazepines are the treatment of choice for tramadol-induced seizures. Benzodiazepine overdose typically causes CNS depression with relatively preserved cardiovascular function. Flumazenil, a GABA-A receptor antagonist, can reverse benzodiazepine toxicity but is used cautiously due to seizure risk in chronic benzodiazepine users and those with co-ingested proconvulsants. TCA overdose is particularly dangerous due to sodium channel blockade causing QRS prolongation, ventricular arrhythmias, and refractory hypotension. Sodium bicarbonate (1-2 mEq/kg IV bolus) is the key intervention for QRS widening above 100 ms.\n\nChloroquine overdose, though less common since the shift to artemisinin-based combination therapies, remains relevant in Ghana. It causes rapid cardiovascular collapse through sodium and potassium channel blockade. Management includes early intubation, IV diazepam (which has a direct cardioprotective effect in chloroquine toxicity), and adrenaline infusion for hypotension. Pharmacists must be knowledgeable about antidote dosing, availability, and storage requirements. Maintaining an antidote chart and emergency drug box in hospital pharmacies — stocked with naloxone, atropine, NAC, sodium bicarbonate, and flumazenil — is a critical responsibility.`,
        keyPoints: [
          "Tramadol overdose may cause seizures not responsive to naloxone — treat with benzodiazepines",
          "Naloxone (0.4-2 mg IV, repeated q2-3 min) is the specific antidote for opioid-induced respiratory depression",
          "TCA overdose causing QRS prolongation above 100 ms requires IV sodium bicarbonate bolus",
          "Chloroquine overdose management includes IV diazepam for its direct cardioprotective effect",
        ],
        quiz: [
          {
            question:
              "What is the classic triad of opioid overdose?",
            options: [
              "Miosis, respiratory depression, decreased consciousness",
              "Mydriasis, tachycardia, hyperthermia",
              "Seizures, hypertension, diaphoresis",
              "Bradycardia, hypothermia, miosis",
            ],
            correctIndex: 0,
          },
          {
            question:
              "What is the key pharmacological intervention for QRS prolongation in tricyclic antidepressant overdose?",
            options: [
              "IV calcium gluconate",
              "IV magnesium sulfate",
              "IV sodium bicarbonate",
              "IV potassium chloride",
            ],
            correctIndex: 2,
          },
          {
            question:
              "Why is diazepam specifically used in chloroquine overdose management?",
            options: [
              "It prevents chloroquine-induced seizures only",
              "It has a direct cardioprotective effect in chloroquine toxicity",
              "It accelerates hepatic metabolism of chloroquine",
              "It antagonises chloroquine at the GABA receptor",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "tox-L6",
        title: "Adverse Drug Reactions & Pharmacovigilance",
        duration: "35 min",
        content: `Adverse drug reactions (ADRs) are a significant cause of morbidity, mortality, and increased healthcare costs in Ghana. The WHO defines an ADR as "a response to a drug which is noxious and unintended, and which occurs at doses normally used in man for prophylaxis, diagnosis, or therapy." ADRs are classified into Type A (augmented — dose-dependent, predictable, related to pharmacological action) and Type B (bizarre — dose-independent, unpredictable, often immunological or idiosyncratic). Type A reactions account for approximately 80% of all ADRs and are generally manageable with dose adjustment. Type B reactions, though less common, are more dangerous and include anaphylaxis, Stevens-Johnson syndrome (SJS), and drug-induced liver injury (DILI). In Ghana, SJS/TEN reactions have been notably associated with sulfonamides, nevirapine, and carbamazepine.\n\nThe Ghana Food and Drugs Authority (FDA) operates the national pharmacovigilance system, established in alignment with the WHO Programme for International Drug Monitoring coordinated by the Uppsala Monitoring Centre (UMC). Ghana joined the WHO Programme in 2001 and has since developed a robust spontaneous reporting system. Healthcare professionals — including pharmacists — are legally and ethically obligated to report suspected ADRs using the Ghana FDA's "Blue Form" (the ADR reporting form), which can be submitted in paper format at any FDA regional office or electronically via the FDA's online reporting portal and the VigiFlow system. Pharmacists in community and hospital settings are uniquely positioned to detect ADRs through patient counselling, refill monitoring, and medication therapy management.\n\nDespite improvements, under-reporting remains the biggest challenge to pharmacovigilance in Ghana. Studies suggest that fewer than 10% of ADRs are formally reported. Barriers include lack of awareness of reporting procedures, belief that only serious or unexpected reactions need reporting, time constraints, and insufficient feedback from regulatory authorities. The Ghana FDA has responded with educational campaigns, integration of pharmacovigilance training into pharmacy curricula at KNUST, University of Ghana, and UHAS, and deployment of regional pharmacovigilance officers. Active surveillance programmes for antiretrovirals, artemisinin-based combination therapies, and COVID-19 vaccines have strengthened signal detection. Pharmacists must champion a culture of safety reporting in their practice settings, ensuring that every suspected ADR — whether serious or not — is documented and reported to support evidence-based drug safety decision-making in Ghana.`,
        keyPoints: [
          "Type A ADRs are dose-dependent and predictable; Type B are idiosyncratic and potentially life-threatening (e.g., SJS/TEN)",
          "The Ghana FDA operates the national pharmacovigilance system aligned with the WHO/UMC programme",
          "ADRs are reported via the Ghana FDA Blue Form — submitted in paper or electronically",
          "Under-reporting remains the biggest pharmacovigilance challenge — fewer than 10% of ADRs are formally reported in Ghana",
        ],
        quiz: [
          {
            question:
              "Which type of adverse drug reaction is dose-dependent and related to the known pharmacological action of the drug?",
            options: [
              "Type A (augmented)",
              "Type B (bizarre)",
              "Type C (chronic)",
              "Type D (delayed)",
            ],
            correctIndex: 0,
          },
          {
            question:
              "What is the official reporting tool used for suspected ADRs in Ghana?",
            options: [
              "The Yellow Card (MHRA)",
              "The MedWatch Form (US FDA)",
              "The Ghana FDA Blue Form",
              "The WHO Causality Assessment Form",
            ],
            correctIndex: 2,
          },
          {
            question:
              "What is the biggest challenge to pharmacovigilance in Ghana?",
            options: [
              "Lack of a national regulatory authority",
              "Under-reporting of adverse drug reactions by healthcare professionals",
              "Absence of international collaboration with the WHO",
              "Excessive reporting leading to signal noise",
            ],
            correctIndex: 1,
          },
        ],
      },
    ],
  },
  "pathophysiology": {
    id: "pathophysiology",
    title: "Pathophysiology for Pharmacists",
    description:
      "Understand the mechanisms underlying major diseases encountered in Ghanaian pharmacy practice. This course bridges basic science and clinical therapeutics, covering cardiovascular, metabolic, respiratory, infectious, and gastrointestinal pathology with Ghana-specific epidemiological data and treatment considerations.",
    estimatedTime: "5 hours",
    lessons: [
      {
        id: "patho-L1",
        title: "Introduction to Disease Mechanisms",
        duration: "45 min",
        content: `Understanding disease mechanisms is the foundation of rational pharmacotherapy. At the cellular level, disease begins when homeostatic mechanisms fail. Cell injury can result from hypoxia, chemical toxins, infectious agents, immunologic reactions, or genetic defects. When the injurious stimulus is mild or short-lived, cells may adapt through hypertrophy, hyperplasia, atrophy, or metaplasia. However, when injury exceeds the cell's adaptive capacity, irreversible damage and cell death occur — either through necrosis (pathological) or apoptosis (programmed). Pharmacists must appreciate these distinctions because drug therapy often targets specific points in the injury–adaptation–death continuum; for example, antioxidants combat oxidative stress while immunosuppressants modulate immune-mediated injury.\n\nInflammation is the body's stereotyped response to tissue injury and is central to nearly every disease pharmacists manage. Acute inflammation involves vascular changes (vasodilation, increased permeability) and cellular events (neutrophil recruitment via selectins, integrins, and chemokines). Chemical mediators — histamine, prostaglandins, leukotrienes, cytokines such as TNF-α and IL-1 — orchestrate the process and represent major drug targets (NSAIDs inhibit COX; antihistamines block H1 receptors; corticosteroids suppress multiple mediators). Chronic inflammation, characterised by macrophage and lymphocyte infiltration, underlies conditions like rheumatoid arthritis and tuberculosis, both significant in Ghana. The Ghana Health Service reports that non-communicable diseases now account for roughly 43 percent of outpatient morbidity, making an understanding of chronic inflammatory pathways increasingly important for community pharmacists.\n\nThe immune response adds another layer of complexity. Innate immunity (complement, phagocytes, natural killer cells) provides immediate defence, while adaptive immunity (T- and B-lymphocytes) confers specificity and memory. Hypersensitivity reactions — Type I (anaphylaxis), Type II (cytotoxic), Type III (immune complex), and Type IV (delayed) — are clinically relevant in pharmacy: drug allergies to penicillins and sulphonamides are common presentations at Ghanaian health facilities, and pharmacists trained at institutions like KNUST are expected to recognise and manage these reactions. Autoimmune disorders such as systemic lupus erythematosus, though less prevalent in Ghana than in Western populations, still require pharmacist awareness for appropriate counselling on immunosuppressive therapy.`,
        keyPoints: [
          "Cell injury progresses through reversible adaptation to irreversible necrosis or apoptosis, and understanding this continuum guides drug target selection.",
          "Acute inflammation is mediated by histamine, prostaglandins, and cytokines — the primary targets of NSAIDs, antihistamines, and corticosteroids.",
          "Chronic inflammation underlies many non-communicable diseases that now represent 43% of outpatient morbidity in Ghana.",
          "Hypersensitivity reactions (Types I–IV) are clinically important in pharmacy, particularly drug allergies to penicillins and sulphonamides commonly seen in Ghanaian practice.",
        ],
        quiz: [
          {
            question:
              "Which type of cell adaptation involves replacement of one differentiated cell type by another?",
            options: [
              "Metaplasia",
              "Hyperplasia",
              "Hypertrophy",
              "Atrophy",
            ],
            correctIndex: 0,
          },
          {
            question:
              "Which chemical mediator of inflammation is directly inhibited by NSAIDs through COX enzyme blockade?",
            options: [
              "Prostaglandins",
              "Histamine",
              "Complement C5a",
              "Tumour necrosis factor-alpha",
            ],
            correctIndex: 0,
          },
          {
            question:
              "A patient develops a skin rash 48–72 hours after starting a new medication. This is most consistent with which hypersensitivity type?",
            options: [
              "Type I — immediate",
              "Type II — cytotoxic",
              "Type III — immune complex",
              "Type IV — delayed",
            ],
            correctIndex: 3,
          },
        ],
      },
      {
        id: "patho-L2",
        title: "Cardiovascular Pathophysiology",
        duration: "50 min",
        content: `Cardiovascular disease (CVD) is the leading cause of death globally and an escalating concern in Ghana, where the Ghana Health Service estimates hypertension prevalence at 28–30 percent among adults. Hypertension — sustained elevation of systemic arterial pressure above 140/90 mmHg — results from increased peripheral vascular resistance, increased cardiac output, or both. Pathophysiologically, the renin-angiotensin-aldosterone system (RAAS), sympathetic nervous system overactivity, endothelial dysfunction, and sodium retention all contribute. Angiotensin II promotes vasoconstriction, aldosterone secretion, cardiac remodelling, and oxidative stress. These mechanisms form the rationale for first-line antihypertensive classes used in Ghana: ACE inhibitors (e.g., lisinopril), angiotensin receptor blockers (e.g., losartan), calcium channel blockers (e.g., amlodipine), and thiazide diuretics (e.g., hydrochlorothiazide). The Ghana Standard Treatment Guidelines emphasise that calcium channel blockers and diuretics are particularly effective in Black African populations due to the low-renin hypertension phenotype.\n\nAtherosclerosis is the pathological basis of coronary artery disease, stroke, and peripheral vascular disease. It begins with endothelial injury (from hypertension, smoking, dyslipidaemia, or diabetes), followed by lipid accumulation, macrophage infiltration to form foam cells, and progressive plaque formation. Advanced plaques may undergo rupture, triggering thrombosis and acute events — myocardial infarction or ischaemic stroke. In Ghana, stroke is a leading cause of adult mortality at teaching hospitals such as Korle Bu, with hypertension being the dominant modifiable risk factor. Pharmacists dispensing statins (e.g., atorvastatin) should understand that these drugs reduce LDL cholesterol, stabilise plaques, and improve endothelial function, providing benefit beyond mere lipid lowering.\n\nHeart failure occurs when the heart cannot pump sufficient blood to meet metabolic demands. It can be classified as heart failure with reduced ejection fraction (HFrEF, systolic failure) or heart failure with preserved ejection fraction (HFpEF, diastolic failure). Neurohormonal activation — sympathetic drive, RAAS activation, natriuretic peptide release — initially compensates but ultimately accelerates ventricular remodelling and disease progression. Treatment targets these maladaptive pathways: ACE inhibitors/ARBs reduce preload and afterload, beta-blockers (carvedilol, bisoprolol) counter sympathetic overactivity, and mineralocorticoid receptor antagonists (spironolactone) block aldosterone-driven fibrosis. At Korle Bu Teaching Hospital, heart failure admissions have increased significantly over the past decade, underscoring the need for pharmacist-led medication optimisation and adherence counselling.`,
        keyPoints: [
          "Hypertension prevalence in Ghana is 28–30% among adults, driven by RAAS activation, sympathetic overactivity, and sodium retention.",
          "Calcium channel blockers and thiazide diuretics are especially effective in Black African populations due to the low-renin hypertension phenotype.",
          "Atherosclerotic plaque rupture triggers thrombosis leading to myocardial infarction or stroke — the leading cause of adult mortality at Korle Bu Teaching Hospital.",
          "Heart failure treatment targets maladaptive neurohormonal activation with ACE inhibitors, beta-blockers, and mineralocorticoid receptor antagonists.",
        ],
        quiz: [
          {
            question:
              "Why are calcium channel blockers particularly effective as first-line antihypertensives in Black African populations?",
            options: [
              "Black African patients commonly exhibit a low-renin hypertension phenotype that responds well to CCBs",
              "CCBs have fewer side effects in tropical climates",
              "RAAS inhibitors are contraindicated in all Black patients",
              "CCBs are the only available antihypertensives in Ghana",
            ],
            correctIndex: 0,
          },
          {
            question:
              "Which process initiates atherosclerotic plaque formation?",
            options: [
              "Ventricular remodelling",
              "Endothelial injury and lipid accumulation",
              "Natriuretic peptide secretion",
              "Sympathetic nervous system suppression",
            ],
            correctIndex: 1,
          },
          {
            question:
              "In heart failure with reduced ejection fraction (HFrEF), which drug class counteracts maladaptive sympathetic overactivity?",
            options: [
              "Thiazide diuretics",
              "Calcium channel blockers",
              "Beta-blockers such as carvedilol and bisoprolol",
              "Loop diuretics such as furosemide",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "patho-L3",
        title: "Diabetes & Metabolic Disorders",
        duration: "50 min",
        content: `Diabetes mellitus is a chronic metabolic disorder characterised by sustained hyperglycaemia due to defects in insulin secretion, insulin action, or both. Type 1 diabetes results from autoimmune destruction of pancreatic beta-cells, leading to absolute insulin deficiency; it accounts for less than 5 percent of diabetes cases in Ghana but requires lifelong exogenous insulin. Type 2 diabetes — by far the more prevalent form, affecting an estimated 6–8 percent of Ghanaian adults according to the International Diabetes Federation — arises from a combination of insulin resistance in peripheral tissues (skeletal muscle, adipose, liver) and progressive beta-cell dysfunction. Pathophysiologically, excess visceral adiposity triggers chronic low-grade inflammation; adipocytes release TNF-α and IL-6, which impair insulin receptor signalling via serine phosphorylation of IRS-1. Simultaneously, elevated free fatty acids promote hepatic gluconeogenesis and lipotoxicity in beta-cells. Ghana's rapid urbanisation, dietary transition toward processed foods, and declining physical activity have accelerated the diabetes epidemic, making it a priority for the Ghana Health Service.\n\nMetabolic syndrome — defined by the co-occurrence of central obesity, hyperglycaemia, dyslipidaemia (raised triglycerides, low HDL cholesterol), and hypertension — dramatically increases cardiovascular risk. The pathophysiological unifier is insulin resistance, which drives each component. Pharmacists in Ghana frequently encounter patients presenting with two or more of these features, often alongside fatty liver disease. Management requires a multifaceted approach: lifestyle modification (diet and exercise), metformin as first-line oral hypoglycaemic (which reduces hepatic glucose output and improves insulin sensitivity), and additional agents as needed — sulphonylureas (glimepiride, gliclazide), DPP-4 inhibitors, SGLT2 inhibitors, or GLP-1 receptor agonists. The Ghana Standard Treatment Guidelines recommend metformin monotherapy for newly diagnosed Type 2 diabetes, with stepwise intensification. Pharmacists must also monitor for metformin-associated lactic acidosis risk, especially in patients with renal impairment, and counsel on gastrointestinal side effects.\n\nDiabetic complications are divided into microvascular (retinopathy, nephropathy, neuropathy) and macrovascular (coronary artery disease, stroke, peripheral arterial disease). Chronic hyperglycaemia damages blood vessels through several mechanisms: advanced glycation end-products (AGEs), polyol pathway activation, protein kinase C activation, and oxidative stress. Diabetic nephropathy is now a leading cause of chronic kidney disease in Ghanaian teaching hospitals including Korle Bu and Komfo Anokye. Pharmacists play a critical role in ensuring patients receive ACE inhibitors or ARBs for renoprotection, achieve target HbA1c below 7 percent, and attend regular screening for retinopathy and foot ulcers — the latter being a major cause of lower-limb amputation at surgical departments across Ghana.`,
        keyPoints: [
          "Type 2 diabetes affects 6–8% of Ghanaian adults, driven by insulin resistance from visceral adiposity, chronic inflammation, and beta-cell dysfunction.",
          "Metabolic syndrome links central obesity, hyperglycaemia, dyslipidaemia, and hypertension through the unifying mechanism of insulin resistance.",
          "Ghana Standard Treatment Guidelines recommend metformin as first-line therapy for Type 2 diabetes with stepwise intensification.",
          "Chronic hyperglycaemia causes microvascular damage via AGEs, polyol pathway, PKC activation, and oxidative stress — leading to nephropathy, retinopathy, and neuropathy.",
        ],
        quiz: [
          {
            question:
              "What is the primary pathophysiological defect in Type 2 diabetes mellitus?",
            options: [
              "Autoimmune destruction of beta-cells",
              "Insulin resistance combined with progressive beta-cell dysfunction",
              "Complete absence of insulin receptors",
              "Excess glucagon secretion alone",
            ],
            correctIndex: 1,
          },
          {
            question:
              "Which mechanism links visceral adiposity to insulin resistance at the molecular level?",
            options: [
              "Adipocyte release of TNF-α and IL-6 impairing insulin receptor signalling via serine phosphorylation of IRS-1",
              "Direct destruction of pancreatic islets by free fatty acids",
              "Upregulation of GLUT-4 transporters on muscle cells",
              "Increased hepatic glycogen storage",
            ],
            correctIndex: 0,
          },
          {
            question:
              "According to Ghana Standard Treatment Guidelines, what is the first-line oral agent for newly diagnosed Type 2 diabetes?",
            options: [
              "Glimepiride",
              "Insulin glargine",
              "Metformin",
              "Sitagliptin",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "patho-L4",
        title: "Respiratory Pathophysiology",
        duration: "45 min",
        content: `Respiratory diseases are among the most common presentations at outpatient departments and community pharmacies across Ghana. Asthma, a chronic inflammatory disorder of the airways, is characterised by reversible bronchoconstriction, airway hyperresponsiveness, and mucus hypersecretion. The underlying pathology involves Th2-driven eosinophilic inflammation: allergen exposure triggers IgE-mediated mast cell degranulation, releasing histamine, leukotrienes (especially LTC4, LTD4, LTE4), and prostaglandin D2, which cause bronchospasm and oedema. Chronic inflammation leads to airway remodelling — subepithelial fibrosis, smooth muscle hypertrophy, and goblet cell hyperplasia. In Ghana, asthma prevalence is estimated at 6–8 percent among children, with higher rates in urban areas such as Accra and Kumasi. Pharmacists must ensure patients understand the difference between reliever inhalers (short-acting beta-2 agonists like salbutamol) and controller inhalers (inhaled corticosteroids such as beclomethasone or budesonide), as poor inhaler technique and over-reliance on relievers remain significant problems in Ghanaian practice.\n\nChronic obstructive pulmonary disease (COPD) encompasses chronic bronchitis and emphysema, both involving progressive, largely irreversible airflow limitation. Cigarette smoking is the primary cause globally, but in Ghana, exposure to biomass fuel smoke during indoor cooking is a major additional risk factor, particularly among women in rural communities. Pathologically, COPD involves neutrophilic inflammation, protease–antiprotease imbalance (excess neutrophil elastase destroys alveolar walls in emphysema), and mucus gland hypertrophy (in chronic bronchitis). Pharmacotherapy targets airflow obstruction (long-acting muscarinic antagonists like tiotropium, long-acting beta-2 agonists like salmeterol) and inflammation (inhaled corticosteroids in frequent exacerbators). Pneumonia — bacterial, viral, or atypical — remains a leading cause of mortality in Ghana, especially among children under five and the elderly. Streptococcus pneumoniae is the most common bacterial pathogen; treatment follows Ghana Standard Treatment Guidelines with amoxicillin as first-line for community-acquired pneumonia.\n\nTuberculosis (TB) deserves special attention in the Ghanaian context. Mycobacterium tuberculosis infection begins when inhaled bacilli are phagocytosed by alveolar macrophages. The organism evades killing by inhibiting phagosome–lysosome fusion. Cell-mediated immunity (CD4+ T-cells, macrophage activation via interferon-gamma) leads to granuloma formation — a hallmark of TB pathology. Caseating granulomas may contain viable bacilli for decades (latent TB) or break down, causing cavitary disease and transmission. Ghana's TB incidence is approximately 150 per 100,000 population, with the Greater Accra and Ashanti regions bearing the highest burden. The national TB programme uses the WHO-recommended DOTS strategy with the standard regimen: 2 months of isoniazid, rifampicin, pyrazinamide, and ethambutol (intensive phase) followed by 4 months of isoniazid and rifampicin (continuation phase). Pharmacists must counsel on adherence, monitor for hepatotoxicity (especially isoniazid and pyrazinamide), and screen for drug interactions with rifampicin, a potent CYP450 inducer.`,
        keyPoints: [
          "Asthma involves Th2-driven eosinophilic inflammation with IgE-mediated mast cell degranulation causing bronchoconstriction; prevalence is 6–8% among Ghanaian children.",
          "COPD in Ghana is driven not only by smoking but significantly by biomass fuel smoke exposure, especially among rural women.",
          "Pneumonia caused by Streptococcus pneumoniae is treated first-line with amoxicillin per Ghana Standard Treatment Guidelines.",
          "TB incidence in Ghana is ~150 per 100,000; the DOTS regimen requires pharmacist counselling on adherence, hepatotoxicity monitoring, and rifampicin drug interactions.",
        ],
        quiz: [
          {
            question:
              "Which inflammatory cells and mediators primarily drive the pathophysiology of asthma?",
            options: [
              "Neutrophils and elastase",
              "Th2 lymphocytes and eosinophils releasing leukotrienes and histamine via IgE-mediated mast cell degranulation",
              "CD8+ T-cells and interferon-gamma",
              "Basophils and complement C3a exclusively",
            ],
            correctIndex: 1,
          },
          {
            question:
              "Besides cigarette smoking, what is a major risk factor for COPD in rural Ghana?",
            options: [
              "Occupational asbestos exposure",
              "Biomass fuel smoke from indoor cooking",
              "High-altitude living",
              "Excessive use of inhaled corticosteroids",
            ],
            correctIndex: 1,
          },
          {
            question:
              "Why must pharmacists specifically counsel patients on rifampicin drug interactions during TB treatment?",
            options: [
              "Rifampicin inhibits CYP450 enzymes, causing drug toxicity",
              "Rifampicin is a potent CYP450 inducer that accelerates metabolism of many co-administered drugs",
              "Rifampicin is only effective when taken with food",
              "Rifampicin causes irreversible ototoxicity",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "patho-L5",
        title: "Infectious Disease Pathophysiology",
        duration: "55 min",
        content: `Infectious diseases remain the dominant cause of morbidity and mortality in Ghana, and pharmacists are often the first point of contact for patients seeking treatment. Malaria, caused predominantly by Plasmodium falciparum in Ghana, accounts for approximately 30–40 percent of all outpatient visits according to Ghana Health Service data. The parasite lifecycle is critical to understanding drug targets: sporozoites injected by Anopheles mosquitoes travel to hepatocytes (liver stage, targeted by primaquine and atovaquone-proguanil for prophylaxis), then merozoites infect erythrocytes and undergo asexual replication (blood stage, targeted by artemisinin-based combination therapies — ACTs). During the blood stage, the parasite digests haemoglobin in its food vacuole, producing toxic haem, which it detoxifies to haemozoin. Chloroquine historically blocked haemozoin formation, but widespread P. falciparum resistance in Ghana led to its replacement by ACTs (artesunate-amodiaquine or artemether-lumefantrine) as first-line treatment per national treatment guidelines. Severe malaria with cerebral involvement, severe anaemia, or metabolic acidosis requires parenteral artesunate. Pharmacists must ensure correct dosing, complete treatment courses, and counsel against monotherapy to prevent resistance.\n\nHIV/AIDS remains a significant public health challenge in Ghana, with an adult prevalence of approximately 1.7 percent (Ghana AIDS Commission). HIV-1 is a retrovirus that selectively infects CD4+ T-helper cells via binding of gp120 to the CD4 receptor and CCR5/CXCR4 co-receptors. Reverse transcriptase converts viral RNA to DNA, which integrase incorporates into the host genome. Progressive CD4+ cell depletion leads to immunodeficiency and susceptibility to opportunistic infections — Pneumocystis jirovecii pneumonia, cryptococcal meningitis, Kaposi sarcoma, and TB (HIV-TB co-infection is a major concern in Ghana). Antiretroviral therapy (ART) targets specific viral enzymes: NRTIs (tenofovir, lamivudine) and NNRTIs (efavirenz, dolutegravir — now preferred) inhibit reverse transcriptase; protease inhibitors (lopinavir/ritonavir) block viral maturation; integrase inhibitors (dolutegravir) prevent proviral DNA integration. Ghana's national ART guidelines now recommend dolutegravir-based regimens (TLD: tenofovir + lamivudine + dolutegravir) as first-line. Pharmacists play essential roles in adherence counselling, monitoring for side effects, and managing drug interactions.\n\nHepatitis B virus (HBV) infection is hyperendemic in Ghana, with a prevalence of 12–15 percent — among the highest in the world. HBV is a hepatotropic DNA virus that does not directly kill hepatocytes; rather, liver damage results from the host immune response — cytotoxic CD8+ T-cells destroy infected hepatocytes, and chronic immune activation drives inflammation, fibrosis, cirrhosis, and hepatocellular carcinoma (HCC). The virus establishes persistence through covalently closed circular DNA (cccDNA) in the hepatocyte nucleus, which current antivirals cannot eradicate. Treatment with nucleos(t)ide analogues (tenofovir or entecavir) suppresses viral replication and reduces progression to cirrhosis and HCC but requires long-term or lifelong therapy. Ghana introduced hepatitis B vaccination into the Expanded Programme on Immunisation in 2002, and pharmacists should actively promote vaccination of unprotected adults, screen for HBsAg in pregnant women, and ensure birth-dose vaccination for neonates born to HBsAg-positive mothers.`,
        keyPoints: [
          "Malaria (P. falciparum) accounts for 30–40% of outpatient visits in Ghana; ACTs target the blood-stage parasite and have replaced chloroquine due to resistance.",
          "HIV infects CD4+ T-cells leading to immunodeficiency; Ghana's first-line ART is now dolutegravir-based (TLD regimen).",
          "Hepatitis B is hyperendemic in Ghana (12–15% prevalence); liver damage results from immune-mediated destruction of infected hepatocytes, not direct viral cytopathy.",
          "HBV cccDNA persists in hepatocyte nuclei despite antiviral therapy, necessitating long-term treatment with tenofovir or entecavir.",
        ],
        quiz: [
          {
            question:
              "At which stage of the Plasmodium falciparum lifecycle do artemisinin-based combination therapies (ACTs) primarily act?",
            options: [
              "Sporozoite stage in the mosquito salivary glands",
              "Liver (hepatic) stage",
              "Erythrocytic (blood) stage during asexual replication",
              "Gametocyte stage exclusively",
            ],
            correctIndex: 2,
          },
          {
            question:
              "Which antiretroviral drug class does dolutegravir belong to, and why is it now preferred in Ghana's first-line ART?",
            options: [
              "NNRTI — it has no drug interactions",
              "Protease inhibitor — it is the cheapest option",
              "Integrase inhibitor — it has high efficacy, a high genetic barrier to resistance, and good tolerability",
              "NRTI — it directly blocks reverse transcriptase nucleotide binding",
            ],
            correctIndex: 2,
          },
          {
            question:
              "What is the primary mechanism of liver damage in chronic hepatitis B infection?",
            options: [
              "Direct viral cytopathic effect destroying hepatocytes",
              "Immune-mediated destruction of infected hepatocytes by cytotoxic CD8+ T-cells",
              "Viral toxin accumulation in bile ducts",
              "Autoantibody-mediated complement lysis",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "patho-L6",
        title: "Gastrointestinal & Hepatic Pathophysiology",
        duration: "40 min",
        content: `Gastrointestinal (GI) disorders are extremely common in Ghanaian clinical practice, and pharmacists must understand the pathophysiology behind these conditions to provide effective pharmaceutical care. Peptic ulcer disease (PUD) — gastric and duodenal ulcers — results from an imbalance between aggressive factors (hydrochloric acid, pepsin, Helicobacter pylori infection, NSAIDs) and protective factors (mucus-bicarbonate barrier, prostaglandin-mediated mucosal blood flow, epithelial cell turnover). H. pylori, a Gram-negative spiral bacterium, colonises the gastric mucosa by producing urease to neutralise gastric acid. It causes chronic gastritis by triggering IL-8 release, neutrophil infiltration, and mucosal damage. In Ghana, H. pylori prevalence is estimated at 60–75 percent in the adult population, making it a critical consideration in PUD management. The Ghana Standard Treatment Guidelines recommend triple therapy — a proton pump inhibitor (omeprazole or esomeprazole) plus amoxicillin plus clarithromycin (or metronidazole) — for H. pylori eradication. Pharmacists should counsel on completing the full course and avoiding concurrent use of NSAIDs.\n\nDiarrhoeal diseases remain a leading cause of morbidity and mortality in Ghana, particularly among children under five years. Acute infectious diarrhoea may be caused by viruses (rotavirus — the most common cause in Ghanaian children), bacteria (Salmonella, Shigella, Vibrio cholerae, enterotoxigenic E. coli), or parasites (Giardia lamblia, Entamoeba histolytica). Pathophysiologically, secretory diarrhoea (e.g., cholera) involves toxin-mediated activation of adenylyl cyclase, raising intracellular cAMP, which opens CFTR chloride channels, causing massive chloride and water secretion into the gut lumen. Invasive diarrhoea (e.g., Shigella dysentery) involves mucosal invasion and destruction, producing bloody stools. The cornerstone of management is oral rehydration therapy (ORS), which exploits the sodium-glucose co-transporter (SGLT1) on enterocytes — glucose-coupled sodium absorption drives water reabsorption even during active secretory diarrhoea. Ghana's community-based IMCI (Integrated Management of Childhood Illness) programme relies on pharmacists and chemical sellers to provide ORS and zinc supplementation, which reduces diarrhoea duration and severity.\n\nChronic liver disease and cirrhosis represent a major and growing burden in Ghana, driven primarily by chronic hepatitis B (discussed in Lesson 5), hepatitis C, and increasingly, alcohol-related liver disease. Cirrhosis is the end-stage of chronic hepatic inflammation and fibrosis: repeated hepatocyte injury activates hepatic stellate cells, which transform into myofibroblasts and deposit excess collagen, distorting the hepatic architecture. This fibrosis disrupts sinusoidal blood flow, causing portal hypertension and its complications — oesophageal varices, ascites, splenomegaly, and hepatic encephalopathy. Hepatocellular carcinoma (HCC), strongly associated with chronic HBV infection, is one of the most common cancers in Ghanaian men. At Korle Bu and Komfo Anokye Teaching Hospitals, patients with cirrhosis frequently present with decompensated disease. Pharmacists must adjust drug dosing in hepatic impairment (especially drugs with high hepatic extraction ratios like morphine, propranolol, and lidocaine), avoid hepatotoxic medications, and counsel patients on alcohol abstinence and adherence to antiviral therapy.`,
        keyPoints: [
          "H. pylori prevalence in Ghana is 60–75%; PUD treatment requires triple therapy with a PPI plus two antibiotics for eradication.",
          "Oral rehydration therapy exploits the SGLT1 sodium-glucose co-transporter to drive water reabsorption even during active secretory diarrhoea.",
          "Cirrhosis results from stellate cell activation and collagen deposition, distorting hepatic architecture and causing portal hypertension.",
          "Pharmacists must adjust dosing of high hepatic extraction drugs (morphine, propranolol, lidocaine) in patients with liver disease and avoid hepatotoxic agents.",
        ],
        quiz: [
          {
            question:
              "How does Helicobacter pylori survive in the acidic gastric environment?",
            options: [
              "It produces urease, which converts urea to ammonia and CO2, neutralising surrounding acid",
              "It has an acid-resistant outer membrane made of lipopolysaccharide alone",
              "It resides exclusively in the duodenum where pH is neutral",
              "It secretes hydrochloric acid to match the gastric pH",
            ],
            correctIndex: 0,
          },
          {
            question:
              "Why does oral rehydration solution (ORS) remain effective even during active secretory diarrhoea like cholera?",
            options: [
              "ORS directly neutralises cholera toxin in the gut lumen",
              "Glucose in ORS activates the SGLT1 co-transporter, coupling sodium and water absorption independent of the secretory defect",
              "ORS contains antibiotics that kill Vibrio cholerae",
              "ORS stimulates increased colonic absorption to compensate for small bowel losses",
            ],
            correctIndex: 1,
          },
          {
            question:
              "Which cell type is primarily responsible for collagen deposition leading to hepatic fibrosis and cirrhosis?",
            options: [
              "Kupffer cells",
              "Hepatocytes",
              "Hepatic stellate cells (transforming into myofibroblasts)",
              "Bile duct epithelial cells",
            ],
            correctIndex: 2,
          },
        ],
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  SVG ICON HELPERS                                                   */
/* ------------------------------------------------------------------ */
const IconCheck = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const IconClock = () => (
  <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const IconBook = () => (
  <svg className="w-5 h-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z" />
  </svg>
);

const IconChevronLeft = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const IconChevronRight = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const IconStar = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const IconNote = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconDownload = () => (
  <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const IconAward = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="8" r="7" />
    <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
  </svg>
);

const IconFlame = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 23c-3.6 0-8-2.4-8-7.7 0-4 3.1-7.2 5.3-9.4.4-.4 1-.1 1 .5.1 2.2.8 4.1 2.2 5.6.1-.5.2-1 .3-1.5.5-2 1.5-4.2 3.2-6.1.4-.4 1-.2 1.1.4.3 1.5.5 3.1.5 4.6 0 1.8-.5 3.5-1.3 5 .6-.3 1.2-.8 1.6-1.4.3-.4.9-.4 1.1.1C20 15 20 16.6 20 17.5 20 20.6 15.6 23 12 23z"/>
  </svg>
);

const IconZap = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

/* ---- INTERACTIVITY: Animation CSS ---- */
const INTERACTIVE_STYLES = `
@keyframes confetti-fall {
  0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}
@keyframes correct-pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(74,222,128,0.4); }
  50% { transform: scale(1.02); box-shadow: 0 0 20px 4px rgba(74,222,128,0.2); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(74,222,128,0); }
}
@keyframes milestone-pop {
  0% { transform: scale(0.5) translateY(20px); opacity: 0; }
  60% { transform: scale(1.05) translateY(-5px); opacity: 1; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
@keyframes xp-float {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-60px); opacity: 0; }
}
@keyframes milestone-exit {
  0% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-30px); }
}
.animate-shake { animation: shake 0.5s ease-in-out; }
.animate-correct-pulse { animation: correct-pulse 0.5s ease-in-out; }
.animate-milestone-pop { animation: milestone-pop 0.5s ease-out forwards; }
.animate-xp-float { animation: xp-float 1.2s ease-out forwards; }
`;

/* ---- INTERACTIVITY: XP & Level System ---- */
const XP_PER_LESSON = 50;
const XP_PER_QUIZ_CORRECT = 30;
const XP_PER_PERFECT_QUIZ = 100;
const LEVELS = [
  { name: "Novice", minXP: 0, color: "#94a3b8" },
  { name: "Apprentice", minXP: 200, color: "#60a5fa" },
  { name: "Scholar", minXP: 500, color: "#a78bfa" },
  { name: "Expert", minXP: 1000, color: "#C9A84C" },
  { name: "Master", minXP: 2000, color: "#f97316" },
  { name: "Grand Master", minXP: 5000, color: "#ef4444" },
];

function getLevel(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return { ...LEVELS[i], index: i };
  }
  return { ...LEVELS[0], index: 0 };
}

function getNextLevel(xp) {
  const current = getLevel(xp);
  if (current.index < LEVELS.length - 1) return LEVELS[current.index + 1];
  return null;
}

function getLevelProgress(xp) {
  const current = getLevel(xp);
  const next = getNextLevel(xp);
  if (!next) return 100;
  return Math.round(((xp - current.minXP) / (next.minXP - current.minXP)) * 100);
}

/* ---- INTERACTIVITY: Streak System ---- */
function getStreakData() {
  try {
    const data = JSON.parse(localStorage.getItem("pozos-streak") || "{}");
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (data.lastDate === today) return { count: data.count || 1, active: true };
    if (data.lastDate === yesterday) return { count: data.count || 1, active: false };
    return { count: 0, active: false };
  } catch {
    return { count: 0, active: false };
  }
}

function updateStreak() {
  const today = new Date().toDateString();
  try {
    const data = JSON.parse(localStorage.getItem("pozos-streak") || "{}");
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (data.lastDate === today) return data.count;
    const newCount = data.lastDate === yesterday ? (data.count || 0) + 1 : 1;
    localStorage.setItem("pozos-streak", JSON.stringify({ lastDate: today, count: newCount }));
    return newCount;
  } catch {
    return 1;
  }
}

/* ---- INTERACTIVITY: Overlay Components ---- */
function ConfettiOverlay({ show }) {
  if (!show) return null;
  const colors = ["#C9A84C", "#E8D48B", "#A8893A", "#FFD700", "#FFA500", "#4CAF50", "#2196F3", "#9C27B0"];
  return (
    <div className="fixed inset-0 pointer-events-none z-[90] overflow-hidden">
      {Array.from({ length: 60 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${Math.random() * 100}%`,
            top: "-10px",
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
            backgroundColor: colors[i % colors.length],
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            animation: `confetti-fall ${1.5 + Math.random() * 2}s ease-in ${Math.random() * 0.5}s forwards`,
          }}
        />
      ))}
    </div>
  );
}

function MilestoneBanner({ message }) {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[80] animate-milestone-pop">
      <div className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#A8893A] via-[#C9A84C] to-[#E8D48B] text-gray-950 font-display font-bold text-lg shadow-2xl shadow-[#C9A84C]/30 flex items-center gap-3">
        <IconStar />
        {message}
        <IconStar />
      </div>
    </div>
  );
}

function XPPopup({ amount }) {
  return (
    <div className="fixed top-20 right-8 z-[80] animate-xp-float pointer-events-none">
      <div className="px-5 py-3 rounded-xl bg-[#C9A84C] text-gray-950 font-display font-bold text-xl shadow-lg shadow-[#C9A84C]/40">
        +{amount} XP
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CERTIFICATE COMPONENT                                              */
/* ------------------------------------------------------------------ */
function Certificate({ course, studentName, avgScore, completionDate, onClose }) {
  const certId = `PP-${course.id.toUpperCase().replace(/-/g, "")}-${Date.now().toString(36).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal container */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Action buttons - hidden when printing */}
        <div className="print:hidden flex justify-end gap-3 mb-4">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#C9A84C] text-gray-950 font-semibold rounded-lg hover:bg-[#E8D48B] transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print Certificate
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-white/20 text-gray-300 rounded-lg hover:bg-white/5 transition-colors text-sm"
          >
            Close
          </button>
        </div>

        {/* Certificate card */}
        <div
          id="certificate-content"
          className="bg-[#0D0B12] rounded-2xl overflow-hidden shadow-2xl shadow-[#C9A84C]/20 print:shadow-none print:rounded-none"
          style={{ aspectRatio: "1.414/1" }}
        >
          {/* Gold border frame */}
          <div className="relative h-full p-1">
            <div className="absolute inset-0 bg-gradient-to-br from-[#A8893A] via-[#E8D48B] to-[#C9A84C] rounded-2xl print:rounded-none" />
            <div className="relative h-full bg-[#0D0B12] rounded-xl print:rounded-none flex flex-col">
              {/* Inner decorative border */}
              <div className="absolute inset-3 sm:inset-5 border border-[#C9A84C]/20 rounded-lg pointer-events-none" />

              {/* Ghana flag stripe at top */}
              <div className="flex h-1.5 shrink-0">
                <div className="flex-1 bg-[#CE1126]" />
                <div className="flex-1 bg-[#FCD116]" />
                <div className="flex-1 bg-[#006B3F]" />
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-6 sm:py-10 text-center">
                {/* Kente corner accents */}
                <div className="absolute top-6 left-6 sm:top-8 sm:left-8 w-8 h-8 border-t-2 border-l-2 border-[#C9A84C]/30" />
                <div className="absolute top-6 right-6 sm:top-8 sm:right-8 w-8 h-8 border-t-2 border-r-2 border-[#C9A84C]/30" />
                <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 w-8 h-8 border-b-2 border-l-2 border-[#C9A84C]/30" />
                <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 w-8 h-8 border-b-2 border-r-2 border-[#C9A84C]/30" />

                {/* Logo mark */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center mb-4 sm:mb-6">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none">
                    <defs>
                      <linearGradient id="certGold" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#A8893A" />
                        <stop offset="50%" stopColor="#E8D48B" />
                        <stop offset="100%" stopColor="#C9A84C" />
                      </linearGradient>
                    </defs>
                    <rect x="9" y="2" width="6" height="20" rx="1.5" fill="url(#certGold)" />
                    <rect x="2" y="9" width="20" height="6" rx="1.5" fill="url(#certGold)" />
                  </svg>
                </div>

                {/* Title */}
                <p className="text-[#C9A84C]/60 text-xs sm:text-sm tracking-[0.3em] uppercase font-body mb-1 sm:mb-2">
                  PozosPharma Academy
                </p>
                <h2 className="font-display text-2xl sm:text-4xl font-bold gold-text mb-4 sm:mb-6">
                  Certificate of Completion
                </h2>

                {/* Decorative divider */}
                <div className="flex items-center gap-3 mb-4 sm:mb-6 w-full max-w-xs">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#C9A84C]/30" />
                  <svg className="w-4 h-4 text-[#C9A84C]/40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l2.09 4.26L19 7.27l-3.5 3.41.82 4.79L12 13.4l-4.32 2.07.82-4.79L5 7.27l4.91-1.01L12 2z" />
                  </svg>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#C9A84C]/30" />
                </div>

                {/* Recipient */}
                <p className="text-gray-400 text-xs sm:text-sm font-body mb-1">This certifies that</p>
                <p className="font-display text-xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                  {studentName || "Student"}
                </p>

                {/* Achievement */}
                <p className="text-gray-400 text-xs sm:text-sm font-body mb-1">has successfully completed</p>
                <p className="font-display text-lg sm:text-2xl font-semibold text-[#E8D48B] mb-2 sm:mb-3">
                  {course.title}
                </p>
                <p className="text-gray-500 text-xs sm:text-sm font-body mb-4 sm:mb-6">
                  with an average quiz score of{" "}
                  <span className="text-[#C9A84C] font-semibold">{avgScore}%</span>
                </p>

                {/* Date and cert ID */}
                <div className="flex items-center gap-6 sm:gap-10 text-xs text-gray-500 font-body">
                  <div>
                    <p className="text-[#C9A84C]/40 text-[10px] uppercase tracking-wider mb-0.5">Date</p>
                    <p>{completionDate}</p>
                  </div>
                  <div>
                    <p className="text-[#C9A84C]/40 text-[10px] uppercase tracking-wider mb-0.5">Certificate ID</p>
                    <p className="font-mono text-[11px]">{certId}</p>
                  </div>
                </div>
              </div>

              {/* Ghana flag stripe at bottom */}
              <div className="flex h-1.5 shrink-0">
                <div className="flex-1 bg-[#CE1126]" />
                <div className="flex-1 bg-[#FCD116]" />
                <div className="flex-1 bg-[#006B3F]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */
export default function CourseView() {
  const { courseId } = useParams();
  const course = COURSES[courseId];

  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [notes, setNotes] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lessonQuizScores, setLessonQuizScores] = useState({});
  const [showCertificate, setShowCertificate] = useState(false);
  const [studentNameInput, setStudentNameInput] = useState("");

  // Interactivity state
  const [xp, setXp] = useState(() => {
    try { return parseInt(localStorage.getItem("pozos-xp") || "0", 10); } catch { return 0; }
  });
  const [streak, setStreak] = useState(() => getStreakData().count);
  const [showConfetti, setShowConfetti] = useState(false);
  const [milestoneMsg, setMilestoneMsg] = useState(null);
  const [flippedCards, setFlippedCards] = useState(new Set());
  const [answerAnims, setAnswerAnims] = useState({});
  const [xpPopup, setXpPopup] = useState(null);

  // Persist XP
  useEffect(() => {
    localStorage.setItem("pozos-xp", xp.toString());
  }, [xp]);

  useEffect(() => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setAnswerAnims({});
    setFlippedCards(new Set());
  }, [currentLessonIdx]);

  /* ---- Course not found ---- */
  if (!course) {
    return (
      <div className="min-h-screen bg-warm-50 dark:bg-gray-950 flex items-center justify-center font-body">
        <div className="text-center px-6">
          <h1 className="text-3xl font-display font-bold text-warm-900 dark:text-warm-100 mb-4">
            Course Not Found
          </h1>
          <p className="text-warm-600 dark:text-warm-400 mb-6">
            The course you are looking for does not exist or has been removed.
          </p>
          <Link
            to="/learn"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#C9A84C] text-gray-950 font-semibold rounded-lg hover:bg-[#E8D48B] transition-colors"
          >
            <IconChevronLeft /> Back to Academy
          </Link>
        </div>
      </div>
    );
  }

  const lessons = course.lessons;
  const currentLesson = lessons[currentLessonIdx];
  const progress = Math.round((completedLessons.size / lessons.length) * 100);

  /* ---- Handlers ---- */
  const handleSelectLesson = (idx) => {
    setCurrentLessonIdx(idx);
    setSidebarOpen(false);
  };

  const handleMarkComplete = () => {
    if (completedLessons.has(currentLessonIdx)) return;
    const newCompleted = new Set(completedLessons);
    newCompleted.add(currentLessonIdx);
    setCompletedLessons(newCompleted);

    // Award XP
    setXp((prev) => prev + XP_PER_LESSON);
    setXpPopup({ amount: XP_PER_LESSON, key: Date.now() });
    setTimeout(() => setXpPopup(null), 1300);

    // Update streak
    setStreak(updateStreak());

    // Check milestones
    const newProgress = Math.round((newCompleted.size / lessons.length) * 100);
    const oldProgress = Math.round((completedLessons.size / lessons.length) * 100);
    const milestones = [25, 50, 75, 100];
    for (const m of milestones) {
      if (newProgress >= m && oldProgress < m) {
        const msgs = {
          25: "Quarter way there! Keep pushing!",
          50: "Halfway champion! You're crushing it!",
          75: "Almost done! The finish line is near!",
          100: "Course Complete! You're amazing!",
        };
        setMilestoneMsg(msgs[m]);
        setTimeout(() => setMilestoneMsg(null), 3500);
        if (m >= 50) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
        break;
      }
    }
  };

  const handleQuizAnswer = (qIdx, optIdx) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleQuizSubmit = () => {
    if (Object.keys(quizAnswers).length < currentLesson.quiz.length) return;
    let score = 0;
    const anims = {};
    currentLesson.quiz.forEach((q, i) => {
      if (quizAnswers[i] === q.correctIndex) {
        score++;
        anims[i] = "correct";
      } else {
        anims[i] = "wrong";
      }
    });
    setAnswerAnims(anims);
    setTimeout(() => setAnswerAnims({}), 600);

    setQuizScore(score);
    setQuizSubmitted(true);
    setLessonQuizScores((prev) => ({
      ...prev,
      [currentLessonIdx]: Math.round((score / currentLesson.quiz.length) * 100),
    }));

    // Award XP for correct answers + bonus for perfect
    const earnedXP =
      score * XP_PER_QUIZ_CORRECT +
      (score === currentLesson.quiz.length ? XP_PER_PERFECT_QUIZ : 0);
    if (earnedXP > 0) {
      setXp((prev) => prev + earnedXP);
      setXpPopup({ amount: earnedXP, key: Date.now() });
      setTimeout(() => setXpPopup(null), 1300);
    }

    // Confetti on pass (>= 50%)
    if (score >= Math.ceil(currentLesson.quiz.length / 2)) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    // Update streak
    setStreak(updateStreak());
  };

  const handleNotesChange = (value) => {
    setNotes((prev) => ({ ...prev, [currentLesson.id]: value }));
  };

  const goToPrev = () => {
    if (currentLessonIdx > 0) setCurrentLessonIdx(currentLessonIdx - 1);
  };

  const goToNext = () => {
    if (currentLessonIdx < lessons.length - 1) setCurrentLessonIdx(currentLessonIdx + 1);
  };

  /* ---------------------------------------------------------------- */
  /*  RENDER                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-950 font-body text-warm-900 dark:text-warm-100">
      <style>{INTERACTIVE_STYLES}</style>
      <ConfettiOverlay show={showConfetti} />
      {milestoneMsg && <MilestoneBanner message={milestoneMsg} />}
      {xpPopup && <XPPopup amount={xpPopup.amount} key={xpPopup.key} />}

      {/* ---- Breadcrumb ---- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-sm text-warm-500 dark:text-warm-400">
          <Link to="/academy" className="hover:text-[#C9A84C] transition-colors">
            Academy
          </Link>
          <span>/</span>
          <span className="text-warm-800 dark:text-warm-200 font-medium">{course.title}</span>
        </nav>
      </div>

      {/* ---- Course Header ---- */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="dark-glass rounded-2xl p-6 sm:p-8 border border-white/5">
          <h1 className="text-3xl sm:text-4xl font-display font-bold gold-text mb-3">
            {course.title}
          </h1>
          <p className="text-warm-600 dark:text-warm-400 max-w-3xl mb-6 leading-relaxed">
            {course.description}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-warm-500 dark:text-warm-400 mb-4">
            <span className="flex items-center gap-1">
              <IconBook />
              {lessons.length} lessons
            </span>
            <span className="flex items-center gap-1">
              <IconClock />
              {course.estimatedTime}
            </span>
            <span className="flex items-center gap-1">
              <IconStar />
              <span className="text-[#C9A84C]">
                {completedLessons.size}/{lessons.length} completed
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <IconZap />
              <span className="text-[#C9A84C] font-semibold">{xp} XP</span>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: getLevel(xp).color + "22", color: getLevel(xp).color }}
              >
                {getLevel(xp).name}
              </span>
            </span>
            {streak > 0 && (
              <span className="flex items-center gap-1.5 text-orange-400">
                <IconFlame />
                <span className="font-semibold">{streak} day streak</span>
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-md space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1 text-warm-500 dark:text-warm-400">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#A8893A] via-[#C9A84C] to-[#E8D48B] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            {/* XP Level bar */}
            <div>
              <div className="flex justify-between text-xs mb-1 text-warm-500 dark:text-warm-400">
                <span style={{ color: getLevel(xp).color }}>{getLevel(xp).name}</span>
                <span>
                  {getNextLevel(xp)
                    ? `${xp - getLevel(xp).minXP} / ${getNextLevel(xp).minXP - getLevel(xp).minXP} XP to ${getNextLevel(xp).name}`
                    : "Max Level"}
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${getLevelProgress(xp)}%`,
                    backgroundColor: getLevel(xp).color,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ---- Mobile sidebar toggle ---- */}
      <div className="lg:hidden max-w-7xl mx-auto px-4 sm:px-6 mb-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-full flex items-center justify-between px-4 py-3 dark-glass rounded-xl border border-white/5 text-sm font-medium"
        >
          <span>
            Lesson {currentLessonIdx + 1}: {currentLesson.title}
          </span>
          <svg
            className={`w-5 h-5 transition-transform ${sidebarOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* ---- Two-column layout ---- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ---- Sidebar ---- */}
          <aside className={`lg:w-80 flex-shrink-0 ${sidebarOpen ? "block" : "hidden"} lg:block`}>
            <div className="dark-glass rounded-2xl border border-white/5 overflow-hidden sticky top-6">
              <div className="p-4 border-b border-white/5">
                <h2 className="font-display font-semibold text-lg gold-text">Course Lessons</h2>
              </div>
              <ul className="divide-y divide-white/5 max-h-[70vh] overflow-y-auto">
                {lessons.map((lesson, idx) => {
                  const isCompleted = completedLessons.has(idx);
                  const isCurrent = idx === currentLessonIdx;
                  return (
                    <li key={lesson.id}>
                      <button
                        onClick={() => handleSelectLesson(idx)}
                        className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition-colors ${
                          isCurrent
                            ? "bg-[#C9A84C]/10 border-l-4 border-[#C9A84C]"
                            : "hover:bg-white/5 border-l-4 border-transparent"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCompleted
                              ? "bg-green-500/20 text-green-400"
                              : isCurrent
                              ? "bg-[#C9A84C]/20 text-[#C9A84C]"
                              : "bg-gray-700/40 text-warm-500"
                          }`}
                        >
                          {isCompleted ? <IconCheck /> : idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-medium truncate ${
                              isCurrent
                                ? "text-[#C9A84C]"
                                : isCompleted
                                ? "text-green-400"
                                : "text-warm-700 dark:text-warm-300"
                            }`}
                          >
                            {lesson.title}
                          </p>
                          <p className="text-xs text-warm-500 dark:text-warm-500 mt-0.5 flex items-center">
                            <IconClock /> {lesson.duration}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* ---- Main content ---- */}
          <main className="flex-1 min-w-0">
            {/* Lesson header */}
            <div className="dark-glass rounded-2xl border border-white/5 p-6 sm:p-8 mb-8">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm text-[#C9A84C] font-medium mb-1">
                    Lesson {currentLessonIdx + 1} of {lessons.length}
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-warm-900 dark:text-warm-50">
                    {currentLesson.title}
                  </h2>
                  <p className="text-sm text-warm-500 dark:text-warm-400 mt-1 flex items-center">
                    <IconClock /> {currentLesson.duration}
                  </p>
                </div>
                {!completedLessons.has(currentLessonIdx) ? (
                  <button
                    onClick={handleMarkComplete}
                    className="flex-shrink-0 px-4 py-2 rounded-lg bg-[#C9A84C] text-gray-950 text-sm font-semibold hover:bg-[#E8D48B] transition-colors"
                  >
                    Mark Complete
                  </button>
                ) : (
                  <span className="flex-shrink-0 flex items-center gap-1 px-4 py-2 rounded-lg bg-green-500/10 text-green-400 text-sm font-semibold">
                    <IconCheck /> Completed
                  </span>
                )}
              </div>

              {/* Lesson content paragraphs */}
              <div className="prose prose-warm dark:prose-invert max-w-none">
                {currentLesson.content.split("\n\n").map((para, i) => (
                  <p key={i} className="text-warm-700 dark:text-warm-300 leading-relaxed mb-4">
                    {para}
                  </p>
                ))}
              </div>
            </div>

            {/* Key Concepts - Interactive Flip Cards */}
            <div className="gold-glass rounded-2xl border-2 border-[#C9A84C]/30 p-6 sm:p-8 mb-8">
              <h3 className="flex items-center gap-2 text-lg font-display font-bold gold-text mb-4">
                <IconStar /> Key Concepts
                <span className="text-sm font-normal text-warm-500 ml-1">(tap to reveal)</span>
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {currentLesson.keyPoints.map((point, i) => {
                  const isFlipped = flippedCards.has(i);
                  return (
                    <button
                      key={i}
                      onClick={() =>
                        setFlippedCards((prev) => {
                          const next = new Set(prev);
                          if (next.has(i)) next.delete(i);
                          else next.add(i);
                          return next;
                        })
                      }
                      className="relative h-36 w-full cursor-pointer group text-left"
                      style={{ perspective: "1000px" }}
                    >
                      <div
                        className="relative w-full h-full transition-transform duration-500"
                        style={{
                          transformStyle: "preserve-3d",
                          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                        }}
                      >
                        {/* Front */}
                        <div
                          className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#C9A84C]/20 to-[#A8893A]/10 border border-[#C9A84C]/30 flex flex-col items-center justify-center p-4 group-hover:border-[#C9A84C]/60 transition-colors"
                          style={{ backfaceVisibility: "hidden" }}
                        >
                          <span className="text-3xl font-display font-bold text-[#C9A84C] mb-1">
                            #{i + 1}
                          </span>
                          <p className="text-xs text-warm-500">Tap to reveal</p>
                        </div>
                        {/* Back */}
                        <div
                          className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#C9A84C]/15 to-transparent border border-[#C9A84C]/40 flex items-center justify-center p-5"
                          style={{
                            backfaceVisibility: "hidden",
                            transform: "rotateY(180deg)",
                          }}
                        >
                          <p className="text-sm text-warm-700 dark:text-warm-200 text-center leading-relaxed">
                            {point}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {flippedCards.size < currentLesson.keyPoints.length && (
                <button
                  onClick={() =>
                    setFlippedCards(
                      new Set(currentLesson.keyPoints.map((_, i) => i))
                    )
                  }
                  className="mt-4 text-sm text-[#C9A84C] hover:text-[#E8D48B] transition-colors"
                >
                  Reveal all
                </button>
              )}
            </div>

            {/* Quiz section */}
            <div className="dark-glass rounded-2xl border border-white/5 p-6 sm:p-8 mb-8">
              <h3 className="text-lg font-display font-bold gold-text mb-6">Lesson Quiz</h3>
              <div className="space-y-8">
                {currentLesson.quiz.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className={
                      answerAnims[qIdx] === "correct"
                        ? "animate-correct-pulse"
                        : answerAnims[qIdx] === "wrong"
                        ? "animate-shake"
                        : ""
                    }
                  >
                    <p className="font-medium text-warm-800 dark:text-warm-200 mb-3">
                      <span className="text-[#C9A84C] mr-2">Q{qIdx + 1}.</span>
                      {q.question}
                    </p>
                    <div className="space-y-2 ml-2 sm:ml-6">
                      {q.options.map((opt, oIdx) => {
                        const selected = quizAnswers[qIdx] === oIdx;
                        const isCorrect = q.correctIndex === oIdx;
                        let optClasses =
                          "flex items-center gap-3 px-4 py-2.5 rounded-lg border cursor-pointer transition-all text-sm ";

                        if (quizSubmitted) {
                          if (isCorrect) {
                            optClasses += "border-green-500 bg-green-500/10 text-green-300";
                          } else if (selected && !isCorrect) {
                            optClasses += "border-red-500 bg-red-500/10 text-red-300";
                          } else {
                            optClasses += "border-white/10 text-warm-500 dark:text-warm-500";
                          }
                        } else {
                          optClasses += selected
                            ? "border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C]"
                            : "border-white/10 hover:border-white/20 text-warm-600 dark:text-warm-400";
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleQuizAnswer(qIdx, oIdx)}
                            className={optClasses}
                            disabled={quizSubmitted}
                          >
                            <span
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                selected
                                  ? quizSubmitted
                                    ? isCorrect
                                      ? "border-green-500 bg-green-500"
                                      : "border-red-500 bg-red-500"
                                    : "border-[#C9A84C] bg-[#C9A84C]"
                                  : quizSubmitted && isCorrect
                                  ? "border-green-500"
                                  : "border-current"
                              }`}
                            >
                              {selected && <span className="w-2 h-2 rounded-full bg-white" />}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit / Score */}
              <div className="mt-8 flex items-center gap-4 flex-wrap">
                {!quizSubmitted ? (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(quizAnswers).length < currentLesson.quiz.length}
                    className="px-6 py-2.5 bg-[#C9A84C] text-gray-950 font-semibold rounded-lg hover:bg-[#E8D48B] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Submit Answers
                  </button>
                ) : (
                  <div className="flex items-center gap-4 flex-wrap">
                    <div
                      className={`px-6 py-2.5 rounded-lg font-semibold ${
                        quizScore === currentLesson.quiz.length
                          ? "bg-green-500/20 text-green-400"
                          : quizScore >= Math.ceil(currentLesson.quiz.length / 2)
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      Score: {quizScore} / {currentLesson.quiz.length}
                    </div>
                    <button
                      onClick={() => {
                        setQuizAnswers({});
                        setQuizSubmitted(false);
                        setQuizScore(null);
                      }}
                      className="px-4 py-2.5 border border-white/10 rounded-lg text-sm hover:bg-white/5 transition-colors"
                    >
                      Retry Quiz
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Notes section */}
            <div className="dark-glass rounded-2xl border border-white/5 p-6 sm:p-8 mb-8">
              <h3 className="flex items-center gap-2 text-lg font-display font-bold text-warm-900 dark:text-warm-100 mb-4">
                <IconNote /> My Notes
              </h3>
              <textarea
                value={notes[currentLesson.id] || ""}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Type your notes for this lesson here..."
                className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-warm-800 dark:text-warm-200 placeholder-warm-500 focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 resize-y transition-colors"
              />
              <p className="text-xs text-warm-500 mt-2">Notes are saved locally during this session.</p>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-4 mb-8">
              <button
                onClick={goToPrev}
                disabled={currentLessonIdx === 0}
                className="flex items-center gap-2 px-5 py-3 dark-glass border border-white/10 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <IconChevronLeft /> Previous Lesson
              </button>
              <button
                onClick={goToNext}
                disabled={currentLessonIdx === lessons.length - 1}
                className="flex items-center gap-2 px-5 py-3 bg-[#C9A84C] text-gray-950 rounded-xl text-sm font-semibold hover:bg-[#E8D48B] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next Lesson <IconChevronRight />
              </button>
            </div>

            {/* Certificate Section */}
            {(() => {
              const allCompleted = completedLessons.size === lessons.length;
              const allQuizzed = Object.keys(lessonQuizScores).length === lessons.length;
              const avgScore = allQuizzed
                ? Math.round(Object.values(lessonQuizScores).reduce((a, b) => a + b, 0) / lessons.length)
                : 0;
              const passed = allCompleted && allQuizzed && avgScore >= 50;
              const needsMoreQuizzes = allCompleted && !allQuizzed;

              if (!allCompleted) return null;

              return (
                <div className={`rounded-2xl p-6 sm:p-8 mb-12 border-2 ${
                  passed
                    ? "gold-glass border-[#C9A84C]/40"
                    : "dark-glass border-white/10"
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                      passed ? "bg-[#C9A84C]/20 text-[#C9A84C]" : "bg-gray-700/40 text-gray-500"
                    }`}>
                      <IconAward />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-bold mb-2">
                        {passed ? (
                          <span className="gold-text">Course Completed — Certificate Available</span>
                        ) : needsMoreQuizzes ? (
                          <span className="text-warm-900 dark:text-warm-200">Complete All Quizzes to Earn Your Certificate</span>
                        ) : (
                          <span className="text-warm-900 dark:text-warm-200">Score Below Passing Threshold</span>
                        )}
                      </h3>
                      <p className="text-sm text-warm-600 dark:text-warm-400 mb-4">
                        {passed ? (
                          <>You completed all {lessons.length} lessons with an average quiz score of <strong className="text-[#C9A84C]">{avgScore}%</strong>. Enter your name below to generate your certificate.</>
                        ) : needsMoreQuizzes ? (
                          <>You have completed all lessons, but you need to submit quizzes for {lessons.length - Object.keys(lessonQuizScores).length} more lesson(s). Go back and submit each lesson quiz to unlock your certificate.</>
                        ) : (
                          <>Your average quiz score is <strong className="text-red-400">{avgScore}%</strong>. You need at least <strong>50%</strong> to earn your certificate. Retry the quizzes to improve your score.</>
                        )}
                      </p>

                      {passed && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <input
                            type="text"
                            value={studentNameInput}
                            onChange={(e) => setStudentNameInput(e.target.value)}
                            placeholder="Enter your full name"
                            className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-warm-800 dark:text-warm-200 placeholder-warm-500 focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors"
                          />
                          <button
                            onClick={() => {
                              if (studentNameInput.trim()) setShowCertificate(true);
                            }}
                            disabled={!studentNameInput.trim()}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#C9A84C] text-gray-950 font-semibold rounded-lg hover:bg-[#E8D48B] transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                          >
                            <IconAward /> Claim Certificate
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </main>
        </div>
      </div>

      {/* ---- Bottom section: Resources & Related Courses ---- */}
      <section className="border-t border-white/5 bg-white/2 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Resources */}
            <div>
              <h3 className="text-xl font-display font-bold gold-text mb-5">Course Resources</h3>
              <div className="dark-glass rounded-xl border border-white/5 p-6 text-center">
                <p className="text-sm text-warm-500 dark:text-warm-400">Downloadable study resources will be available soon.</p>
              </div>
            </div>

            {/* Related Courses */}
            <div>
              <h3 className="text-xl font-display font-bold gold-text mb-5">Related Courses</h3>
              <div className="space-y-3">
                {Object.values(COURSES)
                  .filter((c) => c.id !== courseId)
                  .slice(0, 3)
                  .map((c) => (
                    <Link
                      key={c.id}
                      to={`/learn/course/${c.id}`}
                      className="flex items-center gap-4 px-4 py-3 dark-glass rounded-xl border border-white/5 hover:border-[#C9A84C]/30 transition-colors group"
                    >
                      <span className="w-10 h-10 rounded-lg bg-[#C9A84C]/10 flex items-center justify-center text-[#C9A84C] flex-shrink-0">
                        <IconBook />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-warm-800 dark:text-warm-200 group-hover:text-[#C9A84C] transition-colors truncate">
                          {c.title}
                        </p>
                        <p className="text-xs text-warm-500">
                          {c.lessons.length} lessons &middot; {c.estimatedTime}
                        </p>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certificate Modal */}
      {showCertificate && (
        <Certificate
          course={course}
          studentName={studentNameInput}
          avgScore={
            Object.keys(lessonQuizScores).length > 0
              ? Math.round(Object.values(lessonQuizScores).reduce((a, b) => a + b, 0) / lessons.length)
              : 0
          }
          completionDate={new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
}
