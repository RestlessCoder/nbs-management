import type { AuthProvider } from "@refinedev/core";

const API_URL = import.meta.env.VITE_BACKEND_BASE_URL;

export const authProvider: AuthProvider = {
   
  login: async ({ email, password }: { email: string; password: string }) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });


    if (!res.ok) {
      const error = await res.json();

      // Log the error from server
      return {
        success: false,
        error: { 
          message: error?.message || "Login failed",
          statusCode: res.status,
        },
      };
    }

    // If login is successful, we can set a flag in localStorage
    if (res.ok && res.status === 200) {
      const user = await res.json();

      localStorage.setItem("is_logged_in", "true");
      localStorage.setItem("user_role", JSON.stringify(user.user?.role) || "USER"); // Store user role for access controlsss

    }
    return {
      success: true,
      redirectTo: "/",
    };
  },

  register: async ({ email, password, name, gender, siteId }: { email: string; password: string; name: string; gender: string, siteId: number }) => {
    const user = JSON.parse(localStorage.getItem("user_role") || "null");
    
    // Block non-admin users from registering new users
    if (user !== "ADMIN") {
      return {
        success: false,
        error: { 
          message: "Only admins can register new users",
          statusCode: 403,
        },
      };
    }
    
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, gender, siteId }),
    });

    if (!res.ok) {
      const error = await res.json();
      return {
        success: false,
        error: { message: error?.message || "Registration failed", statusCode: res.status },
      };
    }

    if (user === "ADMIN") {
      return {
          success: true,
          successNotification: {
            message: "User registered successfully",
            description: "The new account has been created",
            type: "success",
          },
      } // Admins can stay on the same page after registering a new user
    } else {
      return { 
        success: true, 
        redirectTo: "/login?registered=true", 
        successNotification: {
            message: "Registration successful",
            description: "Please log in with your account",
            type: "success",
        },
      };
    }
  },

  logout: async () => {
    localStorage.removeItem("is_logged_in");
    localStorage.removeItem("user_role");

    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    return {
      success: true,
      redirectTo: "/login",
    };
  },

  check: async () => {
    // First check if we have a hint that the user is logged in (to avoid unnecessary API calls)
    const isLoggedHint = localStorage.getItem("is_logged_in");

    if (!isLoggedHint) {
      return { authenticated: false, redirectTo: "/login" };
    }

    const res = await fetch(`${API_URL}/auth/me`, {
      credentials: "include",
    });

    const user = await res.json();

     localStorage.setItem("user_role", JSON.stringify(user.user?.role) || "USER"); 

    if (res.ok) {
      return { authenticated: true };
    }
  
    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },

  getIdentity: async () => {
    const res = await fetch(`${API_URL}/auth/me`, {
      credentials: "include",
    });

    if (!res.ok) return null;

    const data = await res.json();

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
    };
  },

  onError: async (error: any) => {
    if (error?.status === 401 || error?.statusCode === 401) {
      return { 
        logout: true, 
        redirectTo: "/login",
        error: new Error("Session expired. Please login again.") 
      };
    }

    return { error };
  },
};