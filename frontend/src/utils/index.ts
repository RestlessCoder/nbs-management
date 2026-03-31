export const capitalizeString = (str: string) => {
    return str
        .replace(/([A-Z])/g, ' $1')    // Add space before capital letters (camelCase)
        .replace(/[_-]/g, ' ')         // Replace underscores/hyphens with spaces (snake_case)
        .trim()                        // Remove extra spaces
        .replace(/^./, (s) => s.toUpperCase()); // Capitalize first letter
};

