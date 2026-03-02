export const BIOMARKER_CATEGORIES = {
  GENERAL_HEALTH: "General Health",
  SLEEP_STATUS: "Sleep Status",
  INFLAMMATION_STATUS: "Inflammation Status",
  HEART_HEALTH: "Heart Health",
  FATIGUE: "Fatigue",
  GLUCOSE_REGULATION: "Glucose Regulation",
  HAIR_HEALTH: "Hair Health",
  HORMONE_HEALTH: "Hormone Health",
  CHOLESTEROL_ASSESSMENT: "Cholesterol Assessment",
  DETOX_PANEL: "Detox Panel",
  MICRONUTRIENTS: "Micronutrients",
  KIDNEY_HEALTH: "Kidney Health",
  RISK_ASSESSMENT_MARKERS: "Risk Assessment Markers",
  COMPLETE_BLOOD_HEALTH: "Complete Blood Health"
};

export const BIOMARKER_RANGES = {
  vitamin_b12: {
    unit: "pg/mL",
    categories: [
      BIOMARKER_CATEGORIES.GENERAL_HEALTH,
      BIOMARKER_CATEGORIES.FATIGUE,
      BIOMARKER_CATEGORIES.HAIR_HEALTH,
      BIOMARKER_CATEGORIES.HORMONE_HEALTH,
      BIOMARKER_CATEGORIES.MICRONUTRIENTS
    ],
    simpleRange: [211, 911],
    notes: "Essential for nerve function and red blood cell formation"
  },

  vitamin_d: {
    unit: "ng/mL",
    categories: [
      BIOMARKER_CATEGORIES.GENERAL_HEALTH,
      BIOMARKER_CATEGORIES.SLEEP_STATUS,
      BIOMARKER_CATEGORIES.FATIGUE,
      BIOMARKER_CATEGORIES.HAIR_HEALTH,
      BIOMARKER_CATEGORIES.HORMONE_HEALTH,
      BIOMARKER_CATEGORIES.MICRONUTRIENTS
    ],
    simpleRange: [30, 100],
    notes: "Supports bone health, immunity, hormone regulation, and sleep quality; optimal >40 ng/mL"
  },

  hs_crp: {
    unit: "mg/L",
    categories: [
      BIOMARKER_CATEGORIES.GENERAL_HEALTH,
      BIOMARKER_CATEGORIES.SLEEP_STATUS,
      BIOMARKER_CATEGORIES.INFLAMMATION_STATUS,
      BIOMARKER_CATEGORIES.HEART_HEALTH,
      BIOMARKER_CATEGORIES.HAIR_HEALTH
    ],
    categoricalRange: {
      ranges: [
        { min: 0, max: 1.0, label: "Low risk" },
        { min: 1.0, max: 3.0, label: "Moderate risk" },
        { min: 3.0, max: Infinity, label: "High risk" }
      ]
    },
    notes: "Marker of systemic inflammation affecting cardiovascular and sleep health"
  },

  homocysteine: {
    unit: "µmol/L",
    categories: [
      BIOMARKER_CATEGORIES.GENERAL_HEALTH,
      BIOMARKER_CATEGORIES.INFLAMMATION_STATUS,
      BIOMARKER_CATEGORIES.HEART_HEALTH
    ],
    simpleRange: [5, 15],
    notes: "Elevated levels increase cardiovascular and stroke risk"
  },

  hba1c: {
    unit: "%",
    categories: [
      BIOMARKER_CATEGORIES.GENERAL_HEALTH,
      BIOMARKER_CATEGORIES.SLEEP_STATUS,
      BIOMARKER_CATEGORIES.FATIGUE,
      BIOMARKER_CATEGORIES.GLUCOSE_REGULATION
    ],
    categoricalRange: {
      ranges: [
        { min: 4.0, max: 5.6, label: "Normal" },
        { min: 5.7, max: 6.4, label: "Prediabetes" },
        { min: 6.5, max: Infinity, label: "Diabetes" }
      ]
    },
    notes: "Reflects long-term blood glucose control which impacts sleep quality"
  },

  cortisol: {
    unit: "mcg/dL",
    categories: [
      BIOMARKER_CATEGORIES.GENERAL_HEALTH,
      BIOMARKER_CATEGORIES.SLEEP_STATUS,
      BIOMARKER_CATEGORIES.FATIGUE,
      BIOMARKER_CATEGORIES.HORMONE_HEALTH
    ],
    timeRange: {
      am: [6.2, 19.4],
      pm: [2.3, 11.9]
    },
    notes: "Primary stress hormone; elevated night levels disrupt sleep"
  },

  serum_creatinine: {
    unit: "mg/dL",
    categories: [
      BIOMARKER_CATEGORIES.GENERAL_HEALTH,
      BIOMARKER_CATEGORIES.KIDNEY_HEALTH
    ],
    genderRange: {
      male: [0.7, 1.3],
      female: [0.6, 1.1]
    },
    notes: "Indicator of kidney function and muscle metabolism"
  },

  uric_acid: {
    unit: "mg/dL",
    categories: [
      BIOMARKER_CATEGORIES.GENERAL_HEALTH,
      BIOMARKER_CATEGORIES.INFLAMMATION_STATUS,
      BIOMARKER_CATEGORIES.KIDNEY_HEALTH
    ],
    genderRange: {
      male: [3.5, 7.2],
      female: [2.6, 6.0]
    },
    notes: "High levels associated with gout, kidney stones, and metabolic risk"
  },

  calcium: {
    unit: "mg/dL",
    categories: [
      BIOMARKER_CATEGORIES.GENERAL_HEALTH,
      BIOMARKER_CATEGORIES.MICRONUTRIENTS
    ],
    simpleRange: [8.5, 10.5],
    notes: "Critical for bone strength, muscle contraction, and nerve signaling"
  },

  ferritin: {
    unit: "ng/mL",
    categories: [
      BIOMARKER_CATEGORIES.GENERAL_HEALTH,
      BIOMARKER_CATEGORIES.SLEEP_STATUS,
      BIOMARKER_CATEGORIES.INFLAMMATION_STATUS,
      BIOMARKER_CATEGORIES.FATIGUE,
      BIOMARKER_CATEGORIES.HAIR_HEALTH
    ],
    genderRange: {
      male: [30, 400],
      female: [13, 150]
    },
    notes: "Iron storage marker; low levels may cause fatigue and poor sleep"
  },

  magnesium: {
    unit: "mg/dL",
    categories: [
      BIOMARKER_CATEGORIES.GENERAL_HEALTH,
      BIOMARKER_CATEGORIES.SLEEP_STATUS,
      BIOMARKER_CATEGORIES.MICRONUTRIENTS
    ],
    simpleRange: [1.7, 2.2],
    notes: "Supports muscle relaxation, nervous system balance, and sleep quality"
  },

  iron: {
    unit: "µg/dL",
    categories: [
      BIOMARKER_CATEGORIES.GENERAL_HEALTH,
      BIOMARKER_CATEGORIES.SLEEP_STATUS,
      BIOMARKER_CATEGORIES.FATIGUE,
      BIOMARKER_CATEGORIES.HAIR_HEALTH,
      BIOMARKER_CATEGORIES.MICRONUTRIENTS
    ],
    genderRange: {
      male: [65, 175],
      female: [50, 170]
    },
    notes: "Required for oxygen transport; deficiency impacts energy and sleep"
  },

  fasting_glucose: {
    unit: "mg/dL",
    categories: [
      BIOMARKER_CATEGORIES.SLEEP_STATUS,
      BIOMARKER_CATEGORIES.FATIGUE,
      BIOMARKER_CATEGORIES.GLUCOSE_REGULATION
    ],
    simpleRange: [70, 100],
    notes: "Elevated levels are associated with poor sleep and metabolic stress"
  },

  tsh: {
    unit: "µIU/mL",
    categories: [
      BIOMARKER_CATEGORIES.SLEEP_STATUS,
      BIOMARKER_CATEGORIES.FATIGUE,
      BIOMARKER_CATEGORIES.HAIR_HEALTH
    ],
    simpleRange: [0.4, 4.0],
    notes: "Thyroid imbalance can disrupt sleep duration and quality"
  },

  free_t3: {
    unit: "pg/mL",
    categories: [
      BIOMARKER_CATEGORIES.SLEEP_STATUS,
      BIOMARKER_CATEGORIES.FATIGUE,
      BIOMARKER_CATEGORIES.HAIR_HEALTH,
      BIOMARKER_CATEGORIES.HORMONE_HEALTH
    ],
    simpleRange: [2.0, 4.4],
    notes: "Active thyroid hormone influencing metabolism and sleep regulation"
  },

  hemoglobin: {
    unit: "g/dL",
    categories: [
      BIOMARKER_CATEGORIES.SLEEP_STATUS,
      BIOMARKER_CATEGORIES.FATIGUE,
      BIOMARKER_CATEGORIES.COMPLETE_BLOOD_HEALTH
    ],
    genderRange: {
      male: [13, 17],
      female: [12, 16]
    },
    notes: "Low levels reduce oxygen delivery and negatively affect sleep"
  },

  red_blood_cell_count: {
    unit: "million/mm³",
    categories: [BIOMARKER_CATEGORIES.SLEEP_STATUS, BIOMARKER_CATEGORIES.FATIGUE, BIOMARKER_CATEGORIES.COMPLETE_BLOOD_HEALTH],
    genderRange: {
      male: [4.5, 5.5],
      female: [4.0, 5.0]
    },
    notes: "Reflects oxygen-carrying capacity influencing sleep health"
  },

  // Category 3: Inflammation Status
  esr: {
    unit: "mm/hr",
    categories: [BIOMARKER_CATEGORIES.INFLAMMATION_STATUS, BIOMARKER_CATEGORIES.COMPLETE_BLOOD_HEALTH],
    genderRange: {
      male: [0, 15],
      female: [0, 20]
    },
    notes: "Erythrocyte sedimentation rate; marker of inflammation"
  },

  fasting_insulin: {
    unit: "µIU/mL",
    categories: [BIOMARKER_CATEGORIES.INFLAMMATION_STATUS, BIOMARKER_CATEGORIES.FATIGUE, BIOMARKER_CATEGORIES.GLUCOSE_REGULATION],
    simpleRange: [2.0, 25.0],
    notes: "Insulin levels; elevated indicates insulin resistance"
  },

  immunoglobulin_e: {
    unit: "KUI/L",
    categories: [BIOMARKER_CATEGORIES.INFLAMMATION_STATUS],
    simpleRange: [0, 100],
    notes: "IgE levels; elevated in allergic conditions"
  },

  white_blood_cell_count: {
    unit: "cells/mm³",
    categories: [BIOMARKER_CATEGORIES.INFLAMMATION_STATUS, BIOMARKER_CATEGORIES.COMPLETE_BLOOD_HEALTH],
    simpleRange: [4000, 11000],
    notes: "WBC count; elevated in infection or inflammation"
  },

  // Category 4: Heart Health
  apolipoprotein_a1: {
    unit: "mg/dL",
    categories: [BIOMARKER_CATEGORIES.HEART_HEALTH],
    genderRange: {
      male: [120, Infinity],
      female: [140, Infinity]
    },
    notes: "Protective lipoprotein; higher is better"
  },

  apolipoprotein_b: {
    unit: "mg/dL",
    categories: [BIOMARKER_CATEGORIES.HEART_HEALTH, BIOMARKER_CATEGORIES.CHOLESTEROL_ASSESSMENT],
    categoricalRange: {
      ranges: [
        { min: 0, max: 100, label: "Optimal" },
        { min: 100, max: 130, label: "Desirable" },
        { min: 130, max: Infinity, label: "High risk" }
      ]
    },
    notes: "Atherogenic lipoprotein; lower is better"
  },

  lipoprotein_a: {
    unit: "mg/dL",
    categories: [BIOMARKER_CATEGORIES.HEART_HEALTH],
    simpleRange: [0, 30],
    notes: "Independent cardiovascular risk factor"
  },

  triglycerides: {
    unit: "mg/dL",
    categories: [BIOMARKER_CATEGORIES.HEART_HEALTH, BIOMARKER_CATEGORIES.GLUCOSE_REGULATION, BIOMARKER_CATEGORIES.CHOLESTEROL_ASSESSMENT],
    categoricalRange: {
      ranges: [
        { min: 0, max: 150, label: "Normal" },
        { min: 150, max: 199, label: "Borderline high" },
        { min: 199, max: Infinity, label: "High" }
      ]
    },
    notes: "Blood fat levels; elevated increases cardiovascular risk"
  },

  ldl_cholesterol: {
    unit: "mg/dL",
    categories: [BIOMARKER_CATEGORIES.HEART_HEALTH, BIOMARKER_CATEGORIES.GLUCOSE_REGULATION, BIOMARKER_CATEGORIES.CHOLESTEROL_ASSESSMENT],
    categoricalRange: {
      ranges: [
        { min: 0, max: 100, label: "Optimal" },
        { min: 100, max: 129, label: "Near optimal" },
        { min: 130, max: 159, label: "Borderline high" },
        { min: 159, max: Infinity, label: "High" }
      ]
    },
    notes: "Bad cholesterol; lower is better"
  },

  vldl_cholesterol: {
    unit: "mg/dL",
    categories: [BIOMARKER_CATEGORIES.HEART_HEALTH, BIOMARKER_CATEGORIES.GLUCOSE_REGULATION, BIOMARKER_CATEGORIES.CHOLESTEROL_ASSESSMENT],
    simpleRange: [5, 40],
    notes: "Very low-density lipoprotein cholesterol"
  },

  hdl_cholesterol: {
    unit: "mg/dL",
    categories: [BIOMARKER_CATEGORIES.HEART_HEALTH, BIOMARKER_CATEGORIES.GLUCOSE_REGULATION, BIOMARKER_CATEGORIES.CHOLESTEROL_ASSESSMENT],
    genderRange: {
      male: [40, Infinity],
      female: [50, Infinity]
    },
    notes: "Good cholesterol; higher is better (optimal >60)"
  },

  // Category 5: Fatigue (most already defined, adding missing ones)
  free_t4: {
    unit: "ng/dL",
    categories: [BIOMARKER_CATEGORIES.FATIGUE, BIOMARKER_CATEGORIES.HAIR_HEALTH, BIOMARKER_CATEGORIES.HORMONE_HEALTH],
    simpleRange: [0.8, 1.8],
    notes: "Free thyroxine; thyroid hormone affecting metabolism"
  },

  sodium: {
    unit: "mmol/L",
    categories: [BIOMARKER_CATEGORIES.FATIGUE, BIOMARKER_CATEGORIES.KIDNEY_HEALTH],
    simpleRange: [135, 145],
    notes: "Electrolyte balance; affects hydration and energy"
  },

  potassium: {
    unit: "mmol/L",
    categories: [BIOMARKER_CATEGORIES.FATIGUE, BIOMARKER_CATEGORIES.KIDNEY_HEALTH],
    simpleRange: [3.5, 5.0],
    notes: "Electrolyte balance; critical for muscle and nerve function"
  },

  chloride: {
    unit: "mmol/L",
    categories: [BIOMARKER_CATEGORIES.FATIGUE, BIOMARKER_CATEGORIES.KIDNEY_HEALTH],
    simpleRange: [96, 106],
    notes: "Electrolyte balance; maintains fluid balance"
  },

  // Category 6: Glucose Regulation
  homa_ir: {
    unit: "%",
    categories: [BIOMARKER_CATEGORIES.GLUCOSE_REGULATION],
    categoricalRange: {
      ranges: [
        { min: 0, max: 1.9, label: "Insulin sensitive" },
        { min: 1.9, max: 2.9, label: "Early resistance" },
        { min: 2.9, max: Infinity, label: "Significant resistance" }
      ]
    },
    notes: "Calculated insulin resistance index"
  },

  // Category 7: Hair Health
  testosterone_free: {
    unit: "ng/dL",
    categories: [BIOMARKER_CATEGORIES.HAIR_HEALTH, BIOMARKER_CATEGORIES.HORMONE_HEALTH],
    genderRange: {
      male: [50, 210],
      female: [1.0, 8.5]
    },
    notes: "Free testosterone; affects hair growth and health"
  },

  testosterone_total: {
    unit: "ng/dL",
    categories: [BIOMARKER_CATEGORIES.HAIR_HEALTH, BIOMARKER_CATEGORIES.HORMONE_HEALTH],
    genderRange: {
      male: [300, 1000],
      female: [15, 70]
    },
    notes: "Total testosterone; affects hair, muscle, and energy"
  },

  dihydrotestosterone: {
    unit: "pg/mL",
    categories: [BIOMARKER_CATEGORIES.HAIR_HEALTH],
    genderRange: {
      male: [30, 85],
      female: [4, 22]
    },
    notes: "DHT; high levels associated with hair loss"
  },

  estradiol: {
    unit: "pg/mL",
    categories: [BIOMARKER_CATEGORIES.HAIR_HEALTH, BIOMARKER_CATEGORIES.HORMONE_HEALTH],
    genderRange: {
      male: [10, 40],
      female: [30, 400]
    },
    notes: "Primary estrogen; varies with menstrual cycle in females"
  },

  // Category 8: Hormone Health
  shbg: {
    unit: "nmol/L",
    categories: [BIOMARKER_CATEGORIES.HORMONE_HEALTH],
    genderRange: {
      male: [10, 57],
      female: [18, 114]
    },
    notes: "Sex hormone binding globulin; regulates hormone availability"
  },

  prostate_specific_antigen: {
    unit: "ng/mL",
    categories: [BIOMARKER_CATEGORIES.HORMONE_HEALTH],
    simpleRange: [0, 4.0],
    notes: "PSA; prostate health marker for men >50 years"
  },

  dhea_s: {
    unit: "µg/dL",
    categories: [BIOMARKER_CATEGORIES.HORMONE_HEALTH],
    genderRange: {
      male: [80, 560],
      female: [35, 430]
    },
    notes: "DHEA-sulfate; adrenal hormone (varies with age)"
  },

  prolactin: {
    unit: "ng/mL",
    categories: [BIOMARKER_CATEGORIES.HORMONE_HEALTH],
    genderRange: {
      male: [2, 18],
      female: [2, 29]
    },
    notes: "Pituitary hormone; affects reproduction and lactation"
  },

  anti_mullerian_hormone: {
    unit: "ng/mL",
    categories: [BIOMARKER_CATEGORIES.HORMONE_HEALTH],
    simpleRange: [1.0, 4.0],
    notes: "AMH; fertility marker (varies by age, primarily for females)"
  },

  // Category 9: Cholesterol Assessment
  total_cholesterol: {
    unit: "mg/dL",
    categories: [BIOMARKER_CATEGORIES.CHOLESTEROL_ASSESSMENT],
    categoricalRange: {
      ranges: [
        { min: 0, max: 200, label: "Desirable" },
        { min: 200, max: 239, label: "Borderline high" },
        { min: 239, max: Infinity, label: "High" }
      ]
    },
    notes: "Total cholesterol; sum of HDL, LDL, and VLDL"
  },

  // Category 10: Detox Panel
  albumin: {
    unit: "g/dL",
    categories: [BIOMARKER_CATEGORIES.DETOX_PANEL],
    simpleRange: [3.5, 5.5],
    notes: "Liver protein; indicates liver function and nutrition"
  },

  alkaline_phosphatase: {
    unit: "U/L",
    categories: [BIOMARKER_CATEGORIES.DETOX_PANEL],
    simpleRange: [44, 147],
    notes: "ALP; liver and bone enzyme"
  },

  direct_bilirubin: {
    unit: "mg/dL",
    categories: [BIOMARKER_CATEGORIES.DETOX_PANEL],
    simpleRange: [0.0, 0.3],
    notes: "Conjugated bilirubin; liver function marker"
  },

  ggt: {
    unit: "U/L",
    categories: [BIOMARKER_CATEGORIES.DETOX_PANEL],
    genderRange: {
      male: [10, 71],
      female: [6, 42]
    },
    notes: "Gamma-glutamyl transferase; liver enzyme"
  },

  globulin: {
    unit: "g/dL",
    categories: [BIOMARKER_CATEGORIES.DETOX_PANEL],
    simpleRange: [2.0, 3.5],
    notes: "Blood protein; immune function marker"
  },

  indirect_bilirubin: {
    unit: "mg/dL",
    categories: [BIOMARKER_CATEGORIES.DETOX_PANEL],
    simpleRange: [0.2, 0.8],
    notes: "Unconjugated bilirubin; liver function marker"
  },

  sgot_ast: {
    unit: "U/L",
    categories: [BIOMARKER_CATEGORIES.DETOX_PANEL],
    genderRange: {
      male: [15, 40],
      female: [13, 35]
    },
    notes: "Aspartate aminotransferase; liver enzyme"
  },

  sgpt_alt: {
    unit: "U/L",
    categories: [BIOMARKER_CATEGORIES.DETOX_PANEL],
    genderRange: {
      male: [10, 40],
      female: [7, 35]
    },
    notes: "Alanine aminotransferase; liver enzyme"
  },

  total_bilirubin: {
    unit: "mg/dL",
    categories: [BIOMARKER_CATEGORIES.DETOX_PANEL],
    simpleRange: [0.3, 1.2],
    notes: "Total bilirubin; liver function and hemolysis marker"
  },

  // Category 11: Micronutrients
  vitamin_b9_folate: {
    unit: "ng/mL",
    categories: [BIOMARKER_CATEGORIES.MICRONUTRIENTS],
    simpleRange: [2.7, 17.0],
    notes: "Folate; essential for DNA synthesis and cell division"
  },

  // Category 12: Kidney Health
  blood_urea: {
    unit: "mg/dL",
    categories: [BIOMARKER_CATEGORIES.KIDNEY_HEALTH],
    simpleRange: [7, 20],
    notes: "Blood urea; kidney function marker"
  },

  blood_urea_nitrogen: {
    unit: "mg/dL",
    categories: [BIOMARKER_CATEGORIES.KIDNEY_HEALTH],
    simpleRange: [7, 20],
    notes: "BUN; kidney function marker"
  },

  egfr: {
    unit: "mL/min/1.73 sq.m",
    categories: [BIOMARKER_CATEGORIES.KIDNEY_HEALTH],
    categoricalRange: {
      ranges: [
        { min: 90, max: Infinity, label: "Normal" },
        { min: 60, max: 89, label: "Mildly decreased" },
        { min: 0, max: 60, label: "Moderate-severe" }
      ]
    },
    notes: "Estimated glomerular filtration rate; calculated kidney function"
  },

  // Category 13: Risk Assessment Markers
  ldh: {
    unit: "IU/L",
    categories: [BIOMARKER_CATEGORIES.RISK_ASSESSMENT_MARKERS],
    simpleRange: [140, 280],
    notes: "Lactate dehydrogenase; tissue damage marker"
  },

  cpk: {
    unit: "U/L",
    categories: [BIOMARKER_CATEGORIES.RISK_ASSESSMENT_MARKERS],
    genderRange: {
      male: [39, 308],
      female: [26, 192]
    },
    notes: "Creatine phosphokinase; muscle damage marker"
  },

  ra_factor: {
    unit: "IU/mL",
    categories: [BIOMARKER_CATEGORIES.RISK_ASSESSMENT_MARKERS],
    simpleRange: [0, 15],
    notes: "Rheumatoid arthritis factor; autoimmune marker"
  },

  il_6: {
    unit: "pg/mL",
    categories: [BIOMARKER_CATEGORIES.RISK_ASSESSMENT_MARKERS],
    simpleRange: [0, 5],
    notes: "Interleukin-6; inflammation cytokine"
  },

  transferrin_saturation: {
    unit: "%",
    categories: [BIOMARKER_CATEGORIES.RISK_ASSESSMENT_MARKERS],
    genderRange: {
      male: [20, 50],
      female: [15, 50]
    },
    notes: "Iron saturation; iron metabolism marker"
  },

  unbound_iron_binding_capacity: {
    unit: "µg/dL",
    categories: [BIOMARKER_CATEGORIES.RISK_ASSESSMENT_MARKERS],
    simpleRange: [155, 355],
    notes: "UIBC; iron binding capacity"
  },

  total_iron_binding_capacity: {
    unit: "µg/dL",
    categories: [BIOMARKER_CATEGORIES.RISK_ASSESSMENT_MARKERS],
    simpleRange: [250, 450],
    notes: "TIBC; total iron binding capacity"
  },

  hbsag: {
    unit: "N/A",
    categories: [BIOMARKER_CATEGORIES.RISK_ASSESSMENT_MARKERS],
    categoricalRange: {
      ranges: [
        { min: 0, max: 0, label: "Non-reactive" },
        { min: 1, max: Infinity, label: "Reactive" }
      ]
    },
    notes: "Hepatitis B surface antigen; screening test"
  },

  hcv_antibody: {
    unit: "N/A",
    categories: [BIOMARKER_CATEGORIES.RISK_ASSESSMENT_MARKERS],
    categoricalRange: {
      ranges: [
        { min: 0, max: 0, label: "Non-reactive" },
        { min: 1, max: Infinity, label: "Reactive" }
      ]
    },
    notes: "Hepatitis C antibody; screening test"
  },

  lithium: {
    unit: "mmol/L",
    categories: [BIOMARKER_CATEGORIES.RISK_ASSESSMENT_MARKERS],
    simpleRange: [0.6, 1.2],
    notes: "Therapeutic lithium level for patients on lithium therapy"
  },

  // Category 14: Complete Blood Health (CBC)
  basophils: {
    unit: "%",
    categories: [BIOMARKER_CATEGORIES.COMPLETE_BLOOD_HEALTH],
    simpleRange: [0, 1],
    notes: "Basophil percentage; white blood cell type"
  },

  eosinophils: {
    unit: "%",
    categories: [BIOMARKER_CATEGORIES.COMPLETE_BLOOD_HEALTH],
    simpleRange: [1, 6],
    notes: "Eosinophil percentage; allergic response marker"
  },

  hematocrit: {
    unit: "%",
    categories: [BIOMARKER_CATEGORIES.COMPLETE_BLOOD_HEALTH],
    genderRange: {
      male: [40, 54],
      female: [36, 48]
    },
    notes: "Hematocrit; percentage of blood volume that is red blood cells"
  },

  lymphocytes: {
    unit: "%",
    categories: [BIOMARKER_CATEGORIES.COMPLETE_BLOOD_HEALTH],
    simpleRange: [20, 40],
    notes: "Lymphocyte percentage; immune cell type"
  },

  mean_corpuscular_hemoglobin: {
    unit: "pg",
    categories: [BIOMARKER_CATEGORIES.COMPLETE_BLOOD_HEALTH],
    simpleRange: [27, 32],
    notes: "MCH; average hemoglobin per red blood cell"
  },

  monocytes: {
    unit: "%",
    categories: [BIOMARKER_CATEGORIES.COMPLETE_BLOOD_HEALTH],
    simpleRange: [2, 10],
    notes: "Monocyte percentage; white blood cell type"
  },

  neutrophils: {
    unit: "%",
    categories: [BIOMARKER_CATEGORIES.COMPLETE_BLOOD_HEALTH],
    simpleRange: [40, 75],
    notes: "Neutrophil percentage; primary infection fighter"
  },

  platelet_count: {
    unit: "per µL",
    categories: [BIOMARKER_CATEGORIES.COMPLETE_BLOOD_HEALTH],
    simpleRange: [150000, 450000],
    notes: "Platelet count; blood clotting cells"
  },

  mean_platelet_volume: {
    unit: "fL",
    categories: [BIOMARKER_CATEGORIES.COMPLETE_BLOOD_HEALTH],
    simpleRange: [7.5, 11.5],
    notes: "MPV; average platelet size"
  },

  mean_corpuscular_volume: {
    unit: "fL",
    categories: [BIOMARKER_CATEGORIES.COMPLETE_BLOOD_HEALTH],
    simpleRange: [80, 100],
    notes: "MCV; average red blood cell size"
  },

  mean_corpuscular_hemoglobin_concentration: {
    unit: "%",
    categories: [BIOMARKER_CATEGORIES.COMPLETE_BLOOD_HEALTH],
    simpleRange: [32, 36],
    notes: "MCHC; average hemoglobin concentration in red blood cells"
  },

  red_cell_distribution_width: {
    unit: "%",
    categories: [BIOMARKER_CATEGORIES.COMPLETE_BLOOD_HEALTH],
    simpleRange: [11.5, 14.5],
    notes: "RDW; variation in red blood cell size"
  },

  mentzer_index: {
    unit: "N/A",
    categories: [BIOMARKER_CATEGORIES.COMPLETE_BLOOD_HEALTH],
    categoricalRange: {
      ranges: [
        { min: 13, max: Infinity, label: "Normal" },
        { min: 0, max: 13, label: "Possible thalassemia" }
      ]
    },
    notes: "Calculated: MCV/RBC; screening for thalassemia"
  }
};



/**
 * Normalize biomarker name to match reference keys
 * Handles various naming conventions from PDF parsing
 */
export function normalizeBiomarkerName(name) {
  if (!name) return null;

  const normalized = name
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

  // Handle common variations
  const variations = {
    "vitamin_b12": ["b12", "vitb12", "cobalamin"],
    "vitamin_d": ["vitd", "25_oh_vitamin_d", "25ohd"],
    "hs_crp": ["hs_c_reactive_protein", "high_sensitivity_crp", "c_reactive_protein", "crp"],
    "hba1c": ["hb_a1c", "glycated_hemoglobin", "a1c"],
    "fasting_glucose": ["glucose_fasting", "fbs", "fasting_blood_sugar"],
    "post_prandial_glucose": ["ppbs", "glucose_pp", "postprandial_glucose"],
    "serum_creatinine": ["creatinine", "s_creatinine"],
    "white_blood_cell_count": ["wbc", "white_blood_cells", "total_wbc"],
    "red_blood_cell_count": ["rbc", "red_blood_cells", "total_rbc"],
    "fasting_insulin": ["insulin_fasting", "insulin"],
    "esr": ["erythrocyte_sedimentation_rate", "sed_rate"],
    "immunoglobulin_e": ["ige", "total_ige"],
    "apolipoprotein_a1": ["apo_a1", "apoa1"],
    "apolipoprotein_b": ["apo_b", "apob"],
    "lipoprotein_a": ["lp_a", "lpa"],
    "triglycerides": ["tg", "trigs"],
    "ldl_cholesterol": ["ldl", "ldl_c", "low_density_lipoprotein"],
    "vldl_cholesterol": ["vldl", "vldl_c"],
    "hdl_cholesterol": ["hdl", "hdl_c", "high_density_lipoprotein"],
    "total_cholesterol": ["cholesterol", "total_chol"],
    "free_t4": ["ft4", "free_thyroxine"],
    "free_t3": ["ft3", "free_triiodothyronine"],
    "tsh": ["thyroid_stimulating_hormone"],
    "sodium": ["na", "serum_sodium"],
    "potassium": ["k", "serum_potassium"],
    "chloride": ["cl", "serum_chloride"],
    "homa_ir": ["homa", "insulin_resistance"],
    "testosterone_free": ["free_testosterone"],
    "testosterone_total": ["total_testosterone", "testosterone"],
    "dihydrotestosterone": ["dht"],
    "estradiol": ["e2", "estrogen"],
    "shbg": ["sex_hormone_binding_globulin"],
    "prostate_specific_antigen": ["psa"],
    "dhea_s": ["dhea_sulfate", "dheas"],
    "prolactin": ["prl"],
    "anti_mullerian_hormone": ["amh"],
    "albumin": ["serum_albumin"],
    "alkaline_phosphatase": ["alp", "alk_phos"],
    "direct_bilirubin": ["conjugated_bilirubin"],
    "ggt": ["gamma_gt", "gamma_glutamyl_transferase"],
    "globulin": ["serum_globulin"],
    "indirect_bilirubin": ["unconjugated_bilirubin"],
    "sgot_ast": ["ast", "sgot", "aspartate_aminotransferase"],
    "sgpt_alt": ["alt", "sgpt", "alanine_aminotransferase"],
    "total_bilirubin": ["bilirubin", "total_bili"],
    "vitamin_b9_folate": ["folate", "folic_acid", "vitamin_b9"],
    "blood_urea": ["urea"],
    "blood_urea_nitrogen": ["bun"],
    "egfr": ["estimated_gfr", "gfr"],
    "ldh": ["lactate_dehydrogenase"],
    "cpk": ["creatine_phosphokinase", "ck"],
    "ra_factor": ["rheumatoid_factor", "rf"],
    "il_6": ["interleukin_6"],
    "transferrin_saturation": ["tsat"],
    "unbound_iron_binding_capacity": ["uibc"],
    "total_iron_binding_capacity": ["tibc"],
    "basophils": ["baso"],
    "eosinophils": ["eos", "eosin"],
    "hematocrit": ["hct", "pcv"],
    "lymphocytes": ["lymph"],
    "mean_corpuscular_hemoglobin": ["mch"],
    "monocytes": ["mono"],
    "neutrophils": ["neut"],
    "platelet_count": ["platelets", "plt"],
    "mean_platelet_volume": ["mpv"],
    "mean_corpuscular_volume": ["mcv"],
    "mean_corpuscular_hemoglobin_concentration": ["mchc"],
    "red_cell_distribution_width": ["rdw"],
    "hbsag": ["hepatitis_b_surface_antigen", "hbs_ag"],
    "hcv_antibody": ["hepatitis_c_antibody", "hcv_ab", "anti_hcv"],
    "lithium": ["li", "serum_lithium"],
    "mentzer_index": ["mentzer"]
  };

  for (const [key, aliases] of Object.entries(variations)) {
    if (aliases.some(alias => normalized.includes(alias) || alias.includes(normalized))) {
      return key;
    }
  }

  return normalized;
}

/**
 * Get biomarker range based on gender and time
 */
export function getBiomarkerRange(biomarkerKey, gender = null, timeOfDay = null) {
  const biomarker = BIOMARKER_RANGES[biomarkerKey];
  if (!biomarker) return null;

  if (biomarker.timeRange && timeOfDay) {
    const timeKey = timeOfDay.toLowerCase();
    if (biomarker.timeRange[timeKey]) {
      return biomarker.timeRange[timeKey];
    }
  }

  if (biomarker.genderRange && gender) {
    const genderKey = gender.toLowerCase();
    if (biomarker.genderRange[genderKey]) {
      return biomarker.genderRange[genderKey];
    }
  }

  if (biomarker.simpleRange) {
    return biomarker.simpleRange;
  }

  return null;
}

/**
 * Check if biomarker value is within range
 */
export function checkBiomarkerStatus(biomarkerKey, value, gender = null, timeOfDay = null) {
  if (value == null || value === undefined) {
    return { status: "bad", reason: "Value not available" };
  }

  const biomarker = BIOMARKER_RANGES[biomarkerKey];
  if (!biomarker) {
    return { status: "bad", reason: "Biomarker not in reference" };
  }

  // Handle categorical ranges (like HbA1c, Hs-CRP)
  if (biomarker.categoricalRange) {
    const ranges = biomarker.categoricalRange.ranges;
    for (const range of ranges) {
      if (value >= range.min && value <= range.max) {
        // For some categorical ranges, "bad" might be certain categories
        // For now, we'll consider Normal/Low risk as "good"
        const isGood = range.label.toLowerCase().includes("normal") ||
          range.label.toLowerCase().includes("low");
        return {
          status: isGood ? "good" : "bad",
          category: range.label,
          reason: range.label
        };
      }
    }
    return { status: "bad", reason: "Value outside all defined ranges" };
  }

  // Handle simple and gender-specific ranges
  const range = getBiomarkerRange(biomarkerKey, gender, timeOfDay);
  if (!range) {
    return { status: "bad", reason: "Range not available" };
  }

  const [min, max] = range;
  const isGood = value >= min && value <= max;

  return {
    status: isGood ? "good" : "bad",
    reason: isGood ? "Within normal range" : `Outside normal range (${min}-${max})`
  };
}

/**
 * Process raw biomarkers from microservice and categorize them
 */
// export function processBiomarkers(rawBiomarkers, gender = null, timeOfDay = null) {
//   const categorized = {};
//   const processed = {};

//   // Initialize categories
//   Object.values(BIOMARKER_CATEGORIES).forEach(category => {
//     categorized[category] = {};
//   });

//   // Process each biomarker
//   for (const [key, value] of Object.entries(rawBiomarkers)) {
//     const normalizedKey = normalizeBiomarkerName(key);
//     const biomarker = BIOMARKER_RANGES[normalizedKey];

//     if (biomarker) {
//       const statusResult = checkBiomarkerStatus(normalizedKey, value, gender, timeOfDay);

//       const biomarkerData = {
//         value: value,
//         status: statusResult.status,
//         unit: biomarker.unit,
//         category: biomarker.category,
//         reason: statusResult.reason || null,
//         categoryLabel: statusResult.category || null
//       };

//       processed[normalizedKey] = biomarkerData;

//       // Add to category
//       if (!categorized[biomarker.category]) {
//         categorized[biomarker.category] = {};
//       }
//       categorized[biomarker.category][normalizedKey] = biomarkerData;
//     } else {
//       // Unknown biomarker - store with status "bad"
//       processed[normalizedKey] = {
//         value: value,
//         status: "bad",
//         unit: null,
//         category: null,
//         reason: "Biomarker not in reference database"
//       };
//     }
//   }

//   return {
//     all: processed,
//     byCategory: categorized
//   };
// }



export function processBiomarkers(rawBiomarkers, gender = null, timeOfDay = null) {
  const categorized = {};
  const processed = {};

  // Initialize all categories
  Object.values(BIOMARKER_CATEGORIES).forEach(category => {
    categorized[category] = {};
  });

  for (const [key, value] of Object.entries(rawBiomarkers)) {
    const normalizedKey = normalizeBiomarkerName(key);
    const biomarker = BIOMARKER_RANGES[normalizedKey];

    // If biomarker not in reference DB
    if (!biomarker) {
      processed[normalizedKey] = {
        value,
        isAvailable: value !== null,
        status: "unknown",
        unit: null,
        categories: [],
        reason: "Biomarker not in reference database",
        categoryLabel: null
      };
      continue;
    }

    // Handle availability
    const isAvailable = value !== null && value !== undefined;

    let statusResult;
    if (!isAvailable) {
      statusResult = {
        status: "unavailable",
        reason: "Not tested",
        category: null
      };
    } else {
      statusResult = checkBiomarkerStatus(
        normalizedKey,
        value,
        gender,
        timeOfDay
      );
    }

    const biomarkerData = {
      value: isAvailable ? value : null,
      isAvailable,
      status: statusResult.status,
      unit: biomarker.unit,
      categories: biomarker.categories,
      reason: statusResult.reason || null,
      categoryLabel: statusResult.category || null
    };

    processed[normalizedKey] = biomarkerData;

    biomarker.categories.forEach(category => {
      categorized[category][normalizedKey] = biomarkerData;
    });
  }

  return {
    all: processed,
    byCategory: categorized
  };
}
