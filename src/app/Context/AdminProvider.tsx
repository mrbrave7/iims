"use client"
import { IAdmin } from "@/models/admin.model";
import { Types } from "mongoose";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useLayoutEffect, useState } from "react";
import { createContext } from "react";
import { usePopupContext } from "./ToastProvider";

interface AdminSignupInput {
    username: string;
    password: string;
    email: string;
    // Add more fields if needed
}
interface AdminContextType {
    adminId: Types.ObjectId | string | null;
    theme: string;
    admin: IAdmin | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signInAdmin: (username: string, password: string) => Promise<boolean>;
    signOutAdmin: () => Promise<void>;
    themeToggle: () => void;
    verifySession: () => Promise<boolean>;
    signUpAdmin: (data: AdminSignupInput) => Promise<boolean>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
    const [adminId, setAdminId] = useState<Types.ObjectId | string | null>(null);
    const [theme, setTheme] = useState<string>('light');
    const [admin, setAdmin] = useState<IAdmin | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);


    const router = useRouter();
    const { Popup } = usePopupContext();
    const toast = Popup();


    const clearAuthState = useCallback(() => {
        setAdminId(null);
        setAdmin(null);
        setIsAuthenticated(false);
        localStorage.removeItem('ITTMS_Theme');
    }, []);


    useEffect(() => {
      const initialize = async () => {
        const savedTheme = localStorage.getItem('ITTMS_Theme') || 'light';
        setTheme(savedTheme);
        
        const isValidSession = await verifySession();
        if (!isValidSession) {
          await refreshAccessToken();
        }
      };
      
      initialize();
    }, []);


    const refreshAccessToken = useCallback(async (): Promise<boolean> => {
      try {
        const response = await fetch("/api/admin/refresh-token", {
          credentials: "include",
        });
        if (!response.ok) {
          clearAuthState();
          router.push("/admins/signin");
          toast.error('Session expired. Please sign in again');
          return false;
        }
        const { id } = await response.json();
        setAdminId(id);
        setIsAuthenticated(true);
        return true;
      } catch (error) {
        clearAuthState();
        toast.error('Failed to refresh session');
        return false;
      }
    }, []);


    const verifySession = useCallback(async (): Promise<boolean> => {
      try {
        const response = await fetch('/api/admin/verify-session', {
          credentials: 'include',
        });
        if (!response.ok) return false;
        
        const { admin, isValid } = await response.json();
        if (isValid) {
          setAdminId(admin?._id);
          setIsAuthenticated(true);
          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    }, []);

    const fetchAdmin = useCallback(async () => {
        if (!adminId) return;

        try {
            setIsLoading(true);
            const response = await fetch(`/api/admin/${adminId}`, {
                credentials: 'include',
            });

            if (response.status === 401) {
                const refreshed = await refreshAccessToken();
                if (!refreshed) return;
                await fetchAdmin(); // Retry after refresh
                return;
            }

            if (response.ok) {
                const data = await response.json();
                setAdmin(data.admin);
            }
        } catch (error) {
            toast.error('Failed to load admin data');
        } finally {
            setIsLoading(false);
        }
    }, [adminId]);


    useEffect(() => {
        if (isAuthenticated && adminId) {
            fetchAdmin();
        }
    }, [isAuthenticated, adminId]);

    // Auth actions
    const signInAdmin = async (username: string, password: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/admin/signin', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.error || 'Sign in failed');
                return false;
            }

            const data = await response.json();
            setAdminId(data.id);
            setIsAuthenticated(true);
            router.push('/');
            return true;
        } catch (error) {
            toast.error('Sign in failed');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const signOutAdmin = async () => {
        try {
            setIsLoading(true);
            await fetch('/api/admin/signout', {
                method: 'POST',
                credentials: 'include',
            });
            clearAuthState();
            router.push('/admins/signin');
        } finally {
            setIsLoading(false);
        }
    };

    // Theme management
    useLayoutEffect(() => {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
        localStorage.setItem('ITTMS_Theme', theme);
    }, [theme]);

    const signUpAdmin = async (data: AdminSignupInput): Promise<boolean> => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/admin/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Sign up failed');
            }

            const result = await response.json();
            router.push(`/admin/unverified/${result.username}`);
            return true;
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Sign up failed');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const themeToggle = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    const contextValue: AdminContextType = {
        adminId,
        theme,
        admin,
        isLoading,
        isAuthenticated,
        signInAdmin,
        signOutAdmin,
        themeToggle,
        verifySession,
        signUpAdmin
    };

    return (
        <AdminContext.Provider value={contextValue}>
            {children}
        </AdminContext.Provider>
    );

}

export function useAdminContext() {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdminContext must be used within an AdminProvider');
    }
    return context;
}