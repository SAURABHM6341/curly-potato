/**
 * Government Schemes Data
 * Defines all available schemes with their forms and requirements
 */

import { FaGraduationCap, FaTruck, FaBriefcase, FaUserAlt, FaHome } from 'react-icons/fa';

export const SCHEMES = [
  {
    id: "scheme_1",
    name: "Education Grant Scheme",
    icon: FaGraduationCap,
    description: "Provides financial assistance to students under DBT program for educational expenses including tuition fees, books, and study materials.",
    category: "education",
    benefits: "Up to ₹50,000 financial assistance for tuition and study materials",
    eligibility: "Students aged 18-25 years with family income below ₹2.5 lakhs per annum",
    maxAmount: 50000,
    requiredDocs: ["Aadhaar Card", "Income Certificate", "Bonafide Certificate", "Bank Passbook"],
    fields: [
      { label: "Full Name", type: "text", name: "name", required: true, placeholder: "Enter your full name" },
      { label: "Date of Birth", type: "date", name: "dob", required: true },
      { label: "Institute Name", type: "text", name: "institute", required: true, placeholder: "Name of your institution" },
      { label: "Course Name", type: "text", name: "course", required: true, placeholder: "e.g., B.Tech Computer Science" },
      { label: "Year of Study", type: "select", name: "year", required: true, options: ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"] },
      { label: "Family Annual Income (₹)", type: "number", name: "income", required: true, placeholder: "Enter annual income" },
      { label: "Bank Account Number", type: "text", name: "accountNumber", required: true, placeholder: "Enter your account number" },
      { label: "IFSC Code", type: "text", name: "ifsc", required: true, placeholder: "e.g., SBIN0001234" },
      { label: "Purpose of Grant", type: "textarea", name: "purpose", required: true, placeholder: "Describe how you will use the grant" }
    ]
  },
  {
    id: "scheme_2",
    name: "Agriculture Equipment Subsidy",
    icon: FaTruck,
    description: "Subsidy for farmers purchasing approved agricultural equipment to enhance farming productivity and modernization.",
    category: "agriculture",
    benefits: "Up to ₹1,00,000 subsidy on approved agricultural equipment",
    eligibility: "Registered farmers with agricultural land ownership",
    maxAmount: 100000,
    requiredDocs: ["Aadhaar Card", "Land Ownership Certificate", "Purchase Invoice", "Bank Passbook"],
    fields: [
      { label: "Farmer Name", type: "text", name: "name", required: true, placeholder: "Enter your full name" },
      { label: "Land Survey Number", type: "text", name: "surveyNumber", required: true, placeholder: "Enter survey number" },
      { label: "Land Area (acres)", type: "number", name: "landArea", required: true, placeholder: "Total land area" },
      { label: "Equipment Type", type: "select", name: "equipment", required: true, options: ["Tractor", "Harvester", "Water Pump", "Sprayer", "Thresher", "Cultivator"] },
      { label: "Equipment Cost (₹)", type: "number", name: "cost", required: true, placeholder: "Enter equipment cost" },
      { label: "Vendor Name", type: "text", name: "vendor", required: true, placeholder: "Name of equipment supplier" },
      { label: "Bank Account Number", type: "text", name: "accountNumber", required: true, placeholder: "For subsidy transfer" },
      { label: "IFSC Code", type: "text", name: "ifsc", required: true, placeholder: "e.g., HDFC0001234" }
    ]
  },
  {
    id: "scheme_3",
    name: "Women Entrepreneurship Support",
    icon: FaBriefcase,
    description: "Financial support and training for women entrepreneurs starting or expanding small businesses.",
    category: "women welfare",
    benefits: "Up to ₹2,00,000 for business setup and training programs",
    eligibility: "Women aged 21-55 years with valid business plan",
    maxAmount: 200000,
    requiredDocs: ["Aadhaar Card", "Business Plan", "Address Proof", "Bank Passbook", "GST Certificate (if applicable)"],
    fields: [
      { label: "Full Name", type: "text", name: "name", required: true, placeholder: "Enter your full name" },
      { label: "Date of Birth", type: "date", name: "dob", required: true },
      { label: "Business Name", type: "text", name: "businessName", required: true, placeholder: "Your business name" },
      { label: "Business Type", type: "select", name: "businessType", required: true, options: ["Manufacturing", "Trading", "Services", "Handicrafts", "Food Processing", "Other"] },
      { label: "Business Start Date", type: "date", name: "startDate", required: false },
      { label: "Investment Required (₹)", type: "number", name: "investment", required: true, placeholder: "Total investment needed" },
      { label: "Business Description", type: "textarea", name: "description", required: true, placeholder: "Describe your business plan" },
      { label: "Bank Account Number", type: "text", name: "accountNumber", required: true },
      { label: "IFSC Code", type: "text", name: "ifsc", required: true }
    ]
  },
  {
    id: "scheme_4",
    name: "Senior Citizen Pension Scheme",
    icon: FaUserAlt,
    description: "Monthly pension support for senior citizens below poverty line to ensure financial security.",
    category: "social welfare",
    benefits: "₹1,000 per month pension support",
    eligibility: "Senior citizens aged 60+ with income below poverty line",
    maxAmount: 12000, // Annual
    requiredDocs: ["Aadhaar Card", "Age Proof", "Income Certificate", "Bank Passbook"],
    fields: [
      { label: "Full Name", type: "text", name: "name", required: true, placeholder: "Enter your full name" },
      { label: "Date of Birth", type: "date", name: "dob", required: true },
      { label: "Gender", type: "select", name: "gender", required: true, options: ["Male", "Female", "Other"] },
      { label: "Monthly Income (₹)", type: "number", name: "income", required: true, placeholder: "Current monthly income" },
      { label: "Bank Account Number", type: "text", name: "accountNumber", required: true },
      { label: "IFSC Code", type: "text", name: "ifsc", required: true },
      { label: "Contact Number", type: "tel", name: "phone", required: true, placeholder: "+91XXXXXXXXXX" },
      { label: "Guardian Name (if applicable)", type: "text", name: "guardian", required: false, placeholder: "Name of caretaker" }
    ]
  },
  {
    id: "scheme_5",
    name: "Housing Assistance Program",
    icon: FaHome,
    description: "Financial assistance for construction or renovation of houses for economically weaker sections.",
    category: "housing",
    benefits: "Up to ₹3,00,000 for house construction or renovation",
    eligibility: "Families with annual income below ₹3 lakhs and own land",
    maxAmount: 300000,
    requiredDocs: ["Aadhaar Card", "Income Certificate", "Land Documents", "Construction Estimate", "Bank Passbook"],
    fields: [
      { label: "Applicant Name", type: "text", name: "name", required: true, placeholder: "Enter your full name" },
      { label: "Family Size", type: "number", name: "familySize", required: true, placeholder: "Number of family members" },
      { label: "Annual Family Income (₹)", type: "number", name: "income", required: true },
      { label: "Plot Size (sq ft)", type: "number", name: "plotSize", required: true },
      { label: "Construction Type", type: "select", name: "constructionType", required: true, options: ["New Construction", "Renovation", "Extension"] },
      { label: "Estimated Cost (₹)", type: "number", name: "cost", required: true, placeholder: "Total construction cost" },
      { label: "Bank Account Number", type: "text", name: "accountNumber", required: true },
      { label: "IFSC Code", type: "text", name: "ifsc", required: true }
    ]
  }
];

// Helper functions
export const getSchemeById = (id) => {
  return SCHEMES.find(scheme => scheme.id === id);
};

export const getSchemesByCategory = (category) => {
  return SCHEMES.filter(scheme => scheme.category === category);
};

export const getAllCategories = () => {
  return [...new Set(SCHEMES.map(scheme => scheme.category))];
};
