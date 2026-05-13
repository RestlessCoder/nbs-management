export const IGNORED_FIELDS = [
    "id","createdAt", "updatedAt", "siteId", "quickFixes"
]

export const statusOrderData = ["LOGGED_WITH_NBS", "NBS_AWAITING_QUOTATION", "HOLDING_TANK", "JOB_APROVED", 
    "CONTRACT_VISIT_ARRANGED", "CONTRACT_ON_SITE", "COMPLETE_AS_REPORTED", "COMPLETE_NOT_AS_REPORTED", 
    "CLOSED_NOT_AS_REPORTEDs","CONTRACT_FINISHED"];

export const FALLBACK_LOCATIONS = ["Birmingham, England", "London, England", "Manchester, England", "Glasgow, Scotland", 
    "Edinburgh, Scotland", "Cardiff, Wales", "Belfast, Northern Ireland"];

export const FALLBACK_ENTITY = ["KFC UK Ltd", "KFC Wales Ltd", "KFC Scotland Ltd", "SOCSCO Ltd"];

export const FALLBACK_YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

export const FALLBACK_ASSET_TYPES = ["Ceiling", "Lighting","Toiler Roll Holder",
  "Soap Dispenser", "Wall", "Kitchen Extraction Unit", "Security", "Soap Dispenser",
  "Safety", "Cleaning", "Refrigeration", "Washroom", "Waste Management"];

export const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;