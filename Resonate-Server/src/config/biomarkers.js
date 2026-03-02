/**
 * Biomarkers configuration - List of all biomarkers to extract from blood reports.
 * 
 * Organized by category for maintainability.
 */

// Vitamins & Minerals
const VITAMINS_MINERALS = [
    "Vitamin B12",
    "Vitamin D",
    "Calcium",
    "Magnesium",
    "Iron",
    "Ferritin",
    "Vitamin B9",
    "Folate",
];

// Inflammation Markers
const INFLAMMATION = [
    "HS-CRP",
    "C-Reactive Protein",
    "Homocysteine",
    "ESR",
    "Erythrocyte Sedimentation Rate",
    "Immunoglobulin E",
    "IgE",
];

// Glucose & Insulin
const GLUCOSE_INSULIN = [
    "HbA1c",
    "Fasting Glucose",
    "Fasting Insulin",
    "HOMA-IR",
];

// Hormones
const HORMONES = [
    "TSH",
    "Free T3",
    "Free T4",
    "Cortisol",
    "Testosterone Free",
    "Free Testosterone",
    "Testosterone Total",
    "Total Testosterone",
    "Dihydrotestosterone",
    "DHT",
    "Estradiol",
    "SHBG",
    "Sex Hormone Binding Globulin",
    "Prostate Specific Antigen",
    "PSA",
    "DHEA-S",
    "Prolactin",
    "Anti Mullerian Hormone",
    "AMH",
];

// Lipid Panel
const LIPID_PANEL = [
    "Total Cholesterol",
    "HDL Cholesterol",
    "LDL Cholesterol",
    "VLDL Cholesterol",
    "Triglycerides",
    "Apolipoprotein A1",
    "Apolipoprotein B",
    "Lipoprotein(a)",
];

// Liver Function
const LIVER_FUNCTION = [
    "Albumin",
    "Globulin",
    "Total Bilirubin",
    "Direct Bilirubin",
    "Indirect Bilirubin",
    "SGOT",
    "AST",
    "SGPT",
    "ALT",
    "Alkaline Phosphatase",
    "ALP",
    "GGT",
    "Gamma GT",
];

// Kidney Function
const KIDNEY_FUNCTION = [
    "Serum Creatinine",
    "Blood Urea",
    "Blood Urea Nitrogen",
    "BUN",
    "Uric Acid",
    "eGFR",
    "Sodium",
    "Potassium",
    "Chloride",
];

// Complete Blood Count
const CBC = [
    "Hemoglobin",
    "Hematocrit",
    "Red Blood Cell Count",
    "RBC Count",
    "White Blood Cell Count",
    "WBC Count",
    "Platelet Count",
    "Mean Corpuscular Volume",
    "MCV",
    "Mean Corpuscular Hemoglobin",
    "MCH",
    "Mean Corpuscular Hemoglobin Concentration",
    "MCHC",
    "Red Cell Distribution Width",
    "RDW",
    "Mean Platelet Volume",
    "MPV",
    "Neutrophils",
    "Lymphocytes",
    "Monocytes",
    "Eosinophils",
    "Basophils",
    "Mentzer Index",
];

// Other Markers
const OTHER = [
    "LDH",
    "Lactate Dehydrogenase",
    "CPK",
    "Creatine Phosphokinase",
    "RA Factor",
    "Rheumatoid Factor",
    "IL-6",
    "Interleukin-6",
    "HBsAg",
    "Hepatitis B Surface Antigen",
    "HCV Antibody",
    "Anti-HCV",
    "Lithium",
    "Transferrin Saturation",
    "TIBC",
    "Total Iron Binding Capacity",
    "UIBC",
    "Unbound Iron Binding Capacity",
];

/**
 * Complete list of all biomarkers to extract from blood reports.
 */
export const BIOMARKERS_LIST = [
    ...VITAMINS_MINERALS,
    ...INFLAMMATION,
    ...GLUCOSE_INSULIN,
    ...HORMONES,
    ...LIPID_PANEL,
    ...LIVER_FUNCTION,
    ...KIDNEY_FUNCTION,
    ...CBC,
    ...OTHER,
];

/**
 * Biomarkers organized by category (for reference/display).
 */
export const BIOMARKERS_BY_CATEGORY = {
    vitamins_minerals: VITAMINS_MINERALS,
    inflammation: INFLAMMATION,
    glucose_insulin: GLUCOSE_INSULIN,
    hormones: HORMONES,
    lipid_panel: LIPID_PANEL,
    liver_function: LIVER_FUNCTION,
    kidney_function: KIDNEY_FUNCTION,
    cbc: CBC,
    other: OTHER,
};
