import type { AccessControlProvider } from "@refinedev/core";

export const accessControlProvider: AccessControlProvider = {
    can: async ({ resource, action, params }) => {
        const userRole = localStorage.getItem("user_role") ? JSON.parse(localStorage.getItem("user_role") as string) : null;
        const userId = localStorage.getItem("user_id") ? JSON.parse(localStorage.getItem("user_id") as string) : null;

        if (!userRole) return { can: false };
        
        // Admin can access everything
        if (userRole === "ADMIN") {
            return { can: true };
        }

       if (userRole === "USER") {
            
            if (resource === "users" && action === "edit") {
                // Check if the ID of the record matches the logged-in User ID
                if (params?.id !== undefined && String(params.id) === String(userId)) {
                    return { can: true };
                }
            }
           
            if (resource === "register") return { can: false };
            if (resource === "forgot-password") return { can: false };

            // Example: allow read-only
            if (action === "list" || action === "show") {
                return { can: true };
            }

            // block create/edit/delete
            return { can: false };
        }

        return { can: false };
    },
};