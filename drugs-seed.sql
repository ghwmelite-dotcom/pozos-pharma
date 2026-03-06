-- Comprehensive Pharmaceutical Database for Ghana
-- drugs-seed.sql - 150+ additional drugs (d11 - d165)
-- Covers antimalarials, antibiotics, antihypertensives, diabetes, cardiovascular,
-- pain/anti-inflammatory, mental health, respiratory, GI, vitamins, women's health,
-- dermatology, eye/ENT, ARVs, antifungals, antihistamines, sickle cell,
-- sedatives/anesthesia, and miscellaneous categories.

-- ============================================================
-- ANTIMALARIALS (d11 - d20)
-- ============================================================

INSERT OR IGNORE INTO drugs (id, generic_name, brand_names, drug_class, uses, side_effects, interactions, dosage_notes, pregnancy_category, otc, controlled)
VALUES ('d11', 'Artesunate', 'Arinate, Artesiane, Arsuamoon, Guilin Artesunate', 'Antimalarial (Artemisinin derivative)', 'Treatment of severe malaria; also used in uncomplicated malaria in combination therapy.', 'Nausea, vomiting, dizziness, delayed hemolytic anemia, neutropenia, elevated liver enzymes', 'Mefloquine (increased seizure risk), anticoagulants (enhanced effect)', 'Adults: IV/IM 2.4 mg/kg at 0, 12, 24 hours then daily. Oral: 4 mg/kg daily for 3 days as part of ACT. Children: same mg/kg dosing.', 'C', 0, 0);

INSERT OR IGNORE INTO drugs (id, generic_name, brand_names, drug_class, uses, side_effects, interactions, dosage_notes, pregnancy_category, otc, controlled)
VALUES ('d12', 'Chloroquine', 'Malarex, Nivaquine, Resochin, Malaquin', 'Antimalarial (4-aminoquinoline)', 'Treatment of non-falciparum malaria; also used in rheumatoid arthritis and lupus. Limited use for P. falciparum due to resistance in Ghana.', 'Nausea, vomiting, headache, pruritus (common in dark-skinned individuals), retinal toxicity with prolonged use, QT prolongation', 'Antacids (reduced absorption), digoxin (increased levels), mefloquine (increased seizure risk), amiodarone (QT prolongation)', 'Adults: 600 mg base initially, then 300 mg at 6, 24, and 48 hours. Children: 10 mg/kg base initially, then 5 mg/kg at 6, 24, 48 hours.', 'C', 0, 0);

INSERT OR IGNORE INTO drugs (id, generic_name, brand_names, drug_class, uses, side_effects, interactions, dosage_notes, pregnancy_category, otc, controlled)
VALUES ('d13', 'Quinine', 'Qualaquin, Quinimax, Quinoctal', 'Antimalarial (Cinchona alkaloid)', 'Treatment of severe and complicated malaria when artesunate is unavailable; treatment of chloroquine-resistant P. falciparum.', 'Cinchonism (tinnitus, hearing loss, blurred vision), hypoglycemia, QT prolongation, thrombocytopenia, nausea, vomiting', 'Digoxin (increased levels), warfarin (enhanced anticoagulation), mefloquine (seizure risk), antiarrhythmics (QT prolongation)', 'Adults: 600 mg salt every 8 hours for 7 days orally; IV 20 mg/kg loading dose then 10 mg/kg every 8 hours. Children: 10 mg/kg every 8 hours for 7 days.', 'C', 0, 0);

INSERT OR IGNORE INTO drugs (id, generic_name, brand_names, drug_class, uses, side_effects, interactions, dosage_notes, pregnancy_category, otc, controlled)
VALUES ('d14', 'Proguanil', 'Paludrine, Malarone (with atovaquone)', 'Antimalarial (Biguanide)', 'Malaria prophylaxis, particularly for travelers to endemic areas.', 'Nausea, diarrhea, mouth ulcers, hair loss (rare), skin rash', 'Warfarin (enhanced anticoagulation), antacids (reduced absorption)', 'Adults: 200 mg daily for prophylaxis, started 1-2 days before travel. Children: 3 mg/kg daily.', 'C', 0, 0);

INSERT OR IGNORE INTO drugs (id, generic_name, brand_names, drug_class, uses, side_effects, interactions, dosage_notes, pregnancy_category, otc, controlled)
VALUES ('d15', 'Mefloquine', 'Lariam, Mephaquin, Mefliam', 'Antimalarial (Quinoline methanol)', 'Malaria prophylaxis and treatment of chloroquine-resistant P. falciparum.', 'Vivid dreams, insomnia, anxiety, dizziness, nausea, vomiting, neuropsychiatric effects (depression, psychosis - rare)', 'Quinine and quinidine (cardiac arrhythmias), halofantrine (fatal QT prolongation), anticonvulsants (reduced seizure threshold), beta-blockers', 'Adults: Prophylaxis 250 mg weekly; Treatment 1250 mg as split dose. Children: Prophylaxis 5 mg/kg weekly. Not for children under 5 kg.', 'C', 0, 0);

INSERT OR IGNORE INTO drugs (id, generic_name, brand_names, drug_class, uses, side_effects, interactions, dosage_notes, pregnancy_category, otc, controlled)
VALUES ('d16', 'Sulfadoxine-Pyrimethamine', 'Fansidar, Laridox, Malafan, Odar', 'Antimalarial (Antifolate combination)', 'Intermittent preventive treatment of malaria in pregnancy (IPTp); treatment of uncomplicated malaria in combination.', 'Skin rash, Stevens-Johnson syndrome (rare), nausea, vomiting, blood dyscrasias, hepatotoxicity', 'Folate antagonists (methotrexate, trimethoprim - increased toxicity), warfarin (enhanced effect)', 'Adults: 3 tablets (1500/75 mg) as single dose. IPTp: 3 tablets at each ANC visit from 2nd trimester, at least 1 month apart. Not for children under 2 months.', 'C', 0, 0);

INSERT OR IGNORE INTO drugs (id, generic_name, brand_names, drug_class, uses, side_effects, interactions, dosage_notes, pregnancy_category, otc, controlled)
VALUES ('d17', 'Atovaquone-Proguanil', 'Malarone, Maloff Protect', 'Antimalarial (Fixed-dose combination)', 'Malaria prophylaxis and treatment of uncomplicated P. falciparum malaria.', 'Abdominal pain, nausea, vomiting, headache, diarrhea, elevated liver enzymes', 'Tetracycline (reduced atovaquone levels), metoclopramide (reduced absorption), rifampicin (reduced atovaquone levels)', 'Adults: Prophylaxis 1 tablet (250/100 mg) daily; Treatment 4 tablets daily for 3 days. Children 11-40 kg: dose adjusted by weight.', 'C', 0, 0);

INSERT OR IGNORE INTO drugs (id, generic_name, brand_names, drug_class, uses, side_effects, interactions, dosage_notes, pregnancy_category, otc, controlled)
VALUES ('d18', 'Primaquine', 'Primaquine Phosphate, Jasoprim', 'Antimalarial (8-aminoquinoline)', 'Radical cure of P. vivax and P. ovale malaria (eliminates liver-stage hypnozoites); gametocidal agent to reduce malaria transmission.', 'Hemolytic anemia (in G6PD deficiency), methemoglobinemia, nausea, abdominal cramps, leukopenia', 'Other hemolytic drugs, myelosuppressive agents, quinacrine (increased toxicity)', 'Adults: Radical cure 15 mg daily for 14 days; Gametocidal single dose 0.25 mg/kg. Must screen for G6PD deficiency before use. Children: 0.25-0.5 mg/kg daily.', 'X', 0, 0);

INSERT OR IGNORE INTO drugs (id, generic_name, brand_names, drug_class, uses, side_effects, interactions, dosage_notes, pregnancy_category, otc, controlled)
VALUES ('d19', 'Dihydroartemisinin-Piperaquine', 'Duo-Cotecxin, Eurartesim, P-Alaxin', 'Antimalarial (ACT - Artemisinin combination)', 'Treatment of uncomplicated P. falciparum malaria.', 'QT prolongation, nausea, vomiting, diarrhea, headache, dizziness, anemia', 'QT-prolonging drugs (avoid combination), CYP3A4 inhibitors (increased piperaquine levels), grapefruit juice', 'Adults (>80 kg): 4 tablets daily for 3 days. Dosed by weight: 36-75 kg 3 tablets daily, <36 kg adjusted. Take on empty stomach. Children: weight-based dosing per manufacturer.', 'C', 0, 0);

INSERT OR IGNORE INTO drugs (id, generic_name, brand_names, drug_class, uses, side_effects, interactions, dosage_notes, pregnancy_category, otc, controlled)
VALUES ('d20', 'Amodiaquine', 'Camoquin, Flavoquine, Basoquin', 'Antimalarial (4-aminoquinoline)', 'Treatment of uncomplicated malaria, usually in combination with artesunate (ASAQ). Used widely in Ghana as ACT.', 'Hepatotoxicity, agranulocytosis (rare with repeated use), pruritus, nausea, vomiting, abdominal pain', 'Efavirenz (increased toxicity), other hepatotoxic drugs, methotrexate', 'Adults: 10 mg/kg daily for 3 days (as part of ASAQ combination). Children: same mg/kg dosing. Available as fixed-dose combo with artesunate (Camosunate, Coarsucam).', 'C', 0, 0);
