export const IGNORED_FIELDS = [
    "id","createdAt", "updatedAt", "siteId", "quickFixes"
]

export const statusOrderData = ["LOGGED_WITH_NBS", "NBS_AWAITING_QUOTATION", "HOLDING_TANK", "JOB_APROVED", 
    "CONTRACT_VISIT_ARRANGED", "CONTRACT_ON_SITE", "COMPLETE_AS_REPORTED", "COMPLETE_NOT_AS_REPORTED", 
    "CLOSED_NOT_AS_REPORTEDs","CONTRACT_FINISHED"];

export const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;