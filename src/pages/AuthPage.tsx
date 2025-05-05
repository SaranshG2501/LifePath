import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useGameContext } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { LogIn, UserPlus, AtSign, Github, Mail } from 'lucide-react';
import RoleSelectionDialog from '@/components/auth/RoleSelectionDialog';
import { signInWithGoogle } from '@/lib/firebase';

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [signupData, setSignupData] = useState<{email: string; password: string; displayName: string} | null>(null);
  const [isGoogleSignup, setIsGoogleSignup] = useState(false);
  const [googleUserData, setGoogleUserData] = useState<any>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setGameMode } = useGameContext();
  const { login, signup, currentUser, userProfile, getUserProfile, createUserProfile } = useAuth();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter your email and password.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await login(email, password);
      
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
      
      navigate('/profile');
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignupStart = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !displayName) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    
    // Store the signup data and show the role selection dialog
    setSignupData({ email, password, displayName });
    setIsGoogleSignup(false);
    setShowRoleDialog(true);
  };

  const handleSignupComplete = async (selectedRole: string) => {
    setIsLoading(true);
    
    try {
      if (isGoogleSignup && googleUserData) {
        // Google signup flow
        const uid = googleUserData.uid;
        
        await createUserProfile(uid, {
          displayName: googleUserData.displayName || '',
          email: googleUserData.email || '',
          role: selectedRole
        });
        
        toast({
          title: "Account created",
          description: "Your Google account has been set up successfully.",
        });
        
        if (selectedRole === 'teacher') {
          setGameMode('classroom');
          navigate('/teacher');
        } else {
          navigate('/profile');
        }
      } else if (signupData) {
        // Email/password signup flow
        await signup(signupData.email, signupData.password, signupData.displayName, selectedRole);
        
        toast({
          title: "Account created",
          description: "Your account has been created successfully.",
        });
        
        if (selectedRole === 'teacher') {
          setGameMode('classroom');
          navigate('/teacher');
        } else {
          navigate('/profile');
        }
      }
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowRoleDialog(false);
      setGoogleUserData(null);
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      
      const result = await signInWithGoogle();
      const user = result.user;
      
      // Check if the user already has a profile
      const profile = await getUserProfile(user.uid);
      
      if (!profile || !profile.role) {
        // New user or existing user without role - show role selection dialog
        setGoogleUserData({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email
        });
        setIsGoogleSignup(true);
        setShowRoleDialog(true);
      } else {
        // Existing user - proceed to appropriate page
        toast({
          title: "Welcome!",
          description: `You're logged in as ${profile.displayName || profile.email}`,
        });
        
        if (profile.role === 'teacher') {
          setGameMode('classroom');
          navigate('/teacher');
        } else {
          navigate('/profile');
        }
      }
    } catch (error: any) {
      toast({
        title: "Google login failed",
        description: error.message || "Failed to log in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGuestLogin = async () => {
    // Guest login functionality would go here
    toast({
      title: "Guest Login",
      description: "Guest login is not implemented yet.",
    });
    navigate('/');
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md border-none bg-black/40 backdrop-blur shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-white">Welcome to LifePath</CardTitle>
          <CardDescription className="text-center text-white/70">
            Sign in or create an account to track your progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-black/20 border-white/10">
              <TabsTrigger value="login" className="data-[state=active]:bg-primary/20">Login</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-primary/20">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="login-email" className="text-sm font-medium text-white">Email</label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-2.5 h-5 w-5 text-white/40" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-black/20 border-white/20 text-white placeholder:text-white/30"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password" className="text-sm font-medium text-white">Password</label>
                    <a href="#" className="text-sm text-primary hover:text-primary/80">
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-black/20 border-white/20 text-white placeholder:text-white/30"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignupStart} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="signup-name" className="text-sm font-medium text-white">Display Name</label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Your Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-black/20 border-white/20 text-white placeholder:text-white/30"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="signup-email" className="text-sm font-medium text-white">Email</label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-2.5 h-5 w-5 text-white/40" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-black/20 border-white/20 text-white placeholder:text-white/30"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="signup-password" className="text-sm font-medium text-white">Password</label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-black/20 border-white/20 text-white placeholder:text-white/30"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <div className="relative w-full mb-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-black/70 px-2 text-white/50">or continue with</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button 
              variant="outline" 
              className="border-white/20 text-white bg-black/30 hover:bg-white/10"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" aria-hidden="true">
                <path
                  d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                  fill="#EA4335"
                />
                <path
                  d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                  fill="#4285F4"
                />
                <path
                  d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12.0004 24C15.2404 24 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24 12.0004 24Z"
                  fill="#34A853"
                />
              </svg>
              Google
            </Button>
            <Button 
              variant="outline" 
              className="border-white/20 text-white bg-black/30 hover:bg-white/10"
              onClick={handleGuestLogin}
              disabled={isLoading}
            >
              <Mail className="h-5 w-5 mr-2" />
              Guest
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Role selection dialog */}
      <RoleSelectionDialog 
        open={showRoleDialog} 
        onSelectRole={handleSignupComplete}
        onClose={() => {
          setShowRoleDialog(false);
          setGoogleUserData(null);
        }}
      />
    </div>
  );
};

export default AuthPage;
