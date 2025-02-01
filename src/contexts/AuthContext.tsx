import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AuthState } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

const SESSION_TIMEOUT = import.meta.env.VITE_APP_SESSION_TIMEOUT ? 
  parseInt(import.meta.env.VITE_APP_SESSION_TIMEOUT, 10) * 60 * 1000 : 1 * 60 * 1000;


interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const storedUser = localStorage.getItem('user');
    return {
      user: storedUser ? JSON.parse(storedUser) : null,
      isAuthenticated: !!storedUser,
    };
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = () => {
      const user = authState.user;
      if (user) {
        console.log('Checking session...', {
          currentTime: Date.now(),
          lastActivity: user.lastActivity,
          timeSinceLastActivity: Date.now() - user.lastActivity,
          sessionTimeout: SESSION_TIMEOUT
        });
        
        if (Date.now() - user.lastActivity > SESSION_TIMEOUT) {
          console.log('Session expired, logging out...');
          logout();
          toast({
            title: "Session Expired",
            description: "You have been logged out due to inactivity",
            variant: "destructive",
          });
        }
      }
    };

    // Check session every 30 seconds instead of every second
    const interval = setInterval(checkSession, 30000);
    return () => clearInterval(interval);
  }, [authState.user]);

  // Update last activity whenever there's user interaction
  useEffect(() => {
    const updateLastActivity = () => {
      if (authState.user) {
        const updatedUser = { ...authState.user, lastActivity: Date.now() };
        setAuthState(prev => ({ ...prev, user: updatedUser }));
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('Activity detected, updating lastActivity:', updatedUser.lastActivity);
      }
    };

    window.addEventListener('mousemove', updateLastActivity);
    window.addEventListener('keydown', updateLastActivity);
    window.addEventListener('click', updateLastActivity);
    window.addEventListener('scroll', updateLastActivity);

    return () => {
      window.removeEventListener('mousemove', updateLastActivity);
      window.removeEventListener('keydown', updateLastActivity);
      window.removeEventListener('click', updateLastActivity);
      window.removeEventListener('scroll', updateLastActivity);
    };
  }, [authState.user]);

  const login = async (email: string, password: string) => {
    // Simulate API call
    console.log('Login attempt:', { email });
    
    // In a real app, this would be validated against a backend
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      lastActivity: Date.now(),
    };
    
    setAuthState({ user, isAuthenticated: true });
    localStorage.setItem('user', JSON.stringify(user));
    toast({
      title: "Success",
      description: "Logged in successfully",
    });
    navigate('/dashboard');
  };

  const register = async (email: string, password: string) => {
    // Simulate API call
    console.log('Register attempt:', { email });
    
    // In a real app, this would create a user in the backend
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      lastActivity: Date.now(),
    };
    
    setAuthState({ user, isAuthenticated: true });
    localStorage.setItem('user', JSON.stringify(user));
    toast({
      title: "Success",
      description: "Registered successfully",
    });
    navigate('/dashboard');
  };

  const logout = () => {
    setAuthState({ user: null, isAuthenticated: false });
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};