// statusHelper.ts
type StatusClasses = {
  option: string;
  background: string;
};

const statusClassMap: Record<string, StatusClasses> = {
  contract_on_site: { option: "option--teal", background: "bg--teal" },
  holding_tank: { option: "option--darkorange", background: "bg--darkorange" },
  contract_visit_arranged: { option: "option--mediumseagreen", background: "bg--mediumseagreen" },
  closed_not_as_reported: { option: "option--darkviolet", background: "bg--darkviolet" },
  closed_visited_not_as_reported: { option: "option--darkslateblue", background: "bg--darkslateblue" },
  contractor_finished: { option: "option--slategray", background: "bg--darkslategray" },
  logged_with_nbs: { option: "option--crimson", background: "bg--primary" },
  complete_as_reported: { option: "option--dodgerblue", background: "bg--dodgerblue" },
  complete_not_as_reported: { option: "option--darkslateblue", background: "bg--darkslateblue" },
  job_approved: { option: "option--orange", background: "bg--orange" },
  nbs_awaiting_quotation: { option: "option--hotpink", background: "bg--hotpink" },
};

const getStatusClasses = (status: string): StatusClasses => {
  return statusClassMap[status.toLowerCase()] || { option: "", background: "" };
};

// Get only the option class
export const getOptionClass = (status: string): string => {
  return getStatusClasses(status).option;
};

// Get only the background class
export const getBackgroundClass = (status: string): string => {
  return getStatusClasses(status).background;
};


export const capitalizeString = (str: string) => {
    return str
        .replace(/([A-Z])/g, ' $1')    // Add space before capital letters (camelCase)
        .replace(/[_-]/g, ' ')         // Replace underscores/hyphens with spaces (snake_case)
        .trim()                        // Remove extra spaces
        .replace(/^./, (s) => s.toUpperCase()); // Capitalize first letter
};

export const formatNumber = (num : number) => {
  return Number(num).toLocaleString();
};

export const formatEnum = (value: string) => {
  // Lowercase, replace underscores, then capitalize each word
  return value
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatNumberUK(num: number) {
  return num.toLocaleString("en-GB");
}

export function isWithinLast24Hours(dateString: string) {
    const timestamp = new Date(dateString).getTime();
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    return (now - timestamp) <= oneDay && (now - timestamp) >= 0;
}

