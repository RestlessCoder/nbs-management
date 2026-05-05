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