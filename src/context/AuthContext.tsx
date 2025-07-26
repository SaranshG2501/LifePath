
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  getUserProfile as getUserProfileFromDB,
  loginUser,
  logoutUser,
  createUser,
  createUserProfile as createUserProfileInDB,
  ScenarioHistory,
} from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useToast } from '@/components/ui/use-toast';
import { UserRole } from '@/types/game';

export interface UserProfileData {
  displayName: string;
  username: string;
  email: string;
  role?: UserRole | null;
  xp: number;
  level: number;
  completedScenarios: string[];
  badges: string[];
  classrooms: string[];
  history: ScenarioHistory[];
  id: string;
}

interface AuthContextType {
  currentUser: any;
  userProfile: UserProfileData | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  getUserProfile: (uid: string) => Promise<UserProfileData | null>;
  createUserProfile: (uid: string, data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const mapToUserProfileData = (data: any): UserProfileData => ({
    username: data.username || data.displayName || '',
    email: data.email || '',
    role: data.role || null,
    xp: data.xp || 0,
    level: data.level || 1,
    completedScenarios: data.completedScenarios || [],
    badges: data.badges || [],
    classrooms: data.classrooms || [],
    history: data.history || [],
    id: data.id || '',
    displayName: data.displayName || data.username || ''
  });

  const getUserProfile = async (uid: string): Promise<UserProfileData | null> => {
    const data = await getUserProfileFromDB(uid);
    if (data) {
      return mapToUserProfileData({ ...data, id: uid });
    }
    return null;
  };

  const createUserProfile = async (uid: string, data: any): Promise<void> => {
    return await createUserProfileInDB(uid, data);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profileData = await getUserProfile(user.uid);
          setUserProfile(profileData);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshUserProfile = async (): Promise<void> => {
    if (currentUser) {
      try {
        // Process any cleanup notifications first
        const { processCleanupNotifications } = await import('@/lib/firebase');
        await processCleanupNotifications(currentUser.uid);
        
        const profileData = await getUserProfile(currentUser.uid);
        setUserProfile(profileData);
      } catch (error) {
        console.error('Error refreshing user profile:', error);
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { user } = await loginUser(email, password);
      
      // Process any cleanup notifications first
      const { processCleanupNotifications } = await import('@/lib/firebase');
      await processCleanupNotifications(user.uid);
      
      const profileData = await getUserProfile(user.uid);
      setUserProfile(profileData);
      toast({
        title: 'Login successful',
        description: `Welcome back, ${profileData?.displayName || ''}!`,
      });
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'Please check your credentials',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, username: string, role: UserRole) => {
    try {
      setIsLoading(true);
      const { user } = await createUser(email, password);

      const userData: UserProfileData = {
        username,
        email,
        role,
        xp: 0,
        level: 1,
        completedScenarios: [],
        badges: [],
        classrooms: [],
        history: [],
        id: user.uid,
        displayName: username
      };

      await createUserProfile(user.uid, userData);
      setUserProfile(userData);
      toast({
        title: 'Account created',
        description: `Welcome to LifePath, ${username}!`,
      });
    } catch (error: any) {
      toast({
        title: 'Signup failed',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await logoutUser();
      setUserProfile(null);
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
    } catch (error: any) {
      toast({
        title: 'Logout failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    isLoading,
    login,
    signup,
    logout,
    refreshUserProfile,
    getUserProfile,
    createUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
