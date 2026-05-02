import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { jwtDecode } from "jwt-decode";
import { UserProfile } from '../types';
import { ENDPOINTS } from '../constants';
import { useToast } from './ToastContext';

interface AuthContextType {
    user: UserProfile | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (token: string, refreshToken: string | null, user: UserProfile) => void;
    logout: () => void;
    checkAuthStatus: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('chinchin_token');
        localStorage.removeItem('chinchin_user');
        localStorage.removeItem('chinchin_refresh_token');
        // Call backend logout endpoint if needed, but don't block UI
        fetch(ENDPOINTS.AUTH.LOGOUT, { method: 'POST' }).catch(() => { });
    }, []);

    const login = useCallback((token: string, refreshToken: string | null, userData: UserProfile) => {
        localStorage.setItem('chinchin_token', token);
        if (refreshToken) localStorage.setItem('chinchin_refresh_token', refreshToken);
        localStorage.setItem('chinchin_user', JSON.stringify(userData));
        setUser(userData);
    }, []);

    const checkAuthStatus = useCallback(() => {
        const savedUser = localStorage.getItem('chinchin_user');
        const token = localStorage.getItem('chinchin_token');

        if (savedUser && token) {
            try {
                const decoded: any = jwtDecode(token);
                const currentTime = Date.now() / 1000;

                if (decoded.exp && decoded.exp < currentTime) {
                    logout();
                    addToast("Phiên đăng nhập đã hết hạn.", "info");
                } else {
                    setUser(JSON.parse(savedUser));
                }
            } catch (e) {
                logout();
            }
        } else {
            setUser(null);
        }
        setLoading(false);
    }, [logout, addToast]);

    // Initial check
    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    // Listen for 401 events from backend.ts
    useEffect(() => {
        const handleRequireAuth = () => {
            logout();
            addToast("Phiên đăng nhập đã hết hạn.", "info");
        };

        window.addEventListener('chinchin-require-auth', handleRequireAuth);
        return () => window.removeEventListener('chinchin-require-auth', handleRequireAuth);
    }, [logout, addToast]);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout, checkAuthStatus }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
