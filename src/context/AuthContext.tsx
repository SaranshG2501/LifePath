
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  createUserProfile, 
  getUserProfile, 
  loginUser, 
  logoutUser,
  createUser
} from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useToast } from '@/components/ui/use-toast';
import { UserRole } from '@/types/game';

interface AuthContextType {
  currentUser: any;
  userProfile: any;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshUserProfile = async () => {
    if (currentUser) {
      try {
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error("Error refreshing user profile:", error);
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { user } = await loginUser(email, password);
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
      toast({
        title: "Login successful",
        description: `Welcome back, ${profile?.username || ''}!`,
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signup = async (email: string, password: string, username: string, role: UserRole) => {
    try {
      const { user } = await createUser(email, password);
      
      // Create user profile
      const userData = {
        username,
        email,
        role,
      };
      
      await createUserProfile(user.uid, userData);
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
      
      toast({
        title: "Account created",
        description: `Welcome to LifePath, ${username}!`,
      });
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUserProfile(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
      throw error;
    }
  };

  const value = {
    currentUser,
    userProfile,
    isLoading,
    login,
    signup,
    logout,
    refreshUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
