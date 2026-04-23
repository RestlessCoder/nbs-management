import type { AccessControlProvider } from "@refinedev/core";

export const accessControlProvider: AccessControlProvider = {
    can: async ({ resource, action }) => {
        const user = localStorage.getItem("user_role") ? JSON.parse(localStorage.getItem("user_role") as string) : null;
        
        if (!user) return { can: false };

        // Admin can access everything
        if (user === "ADMIN") {
            return { can: true };
        }

       if (user === "USER") {
            if (resource === "users") return { can: false };
            if (resource === "register") return { can: false };

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