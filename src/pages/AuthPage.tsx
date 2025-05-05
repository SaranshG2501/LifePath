
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useGameContext } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { LogIn, UserPlus, AtSign } from 'lucide-react';
import RoleSelectionDialog from '@/components/auth/RoleSelectionDialog';

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [signupData, setSignupData] = useState<{email: string; password: string; displayName: string} | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loginWithEmailAndPassword, signupWithEmailAndPassword, loginAsGuest } = useAuth();
  const { setGameMode } = useGameContext();
  
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
      await loginWithEmailAndPassword(email, password);
      
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
    setShowRoleDialog(true);
  };

  const handleSignupComplete = async (selectedRole: string) => {
    if (!signupData) return;
    
    try {
      setIsLoading(true);
      await signupWithEmailAndPassword(signupData.email, signupData.password, signupData.displayName, selectedRole);
      
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
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowRoleDialog(false);
    }
  };
  
  const handleGuestLogin = async () => {
    try {
      setIsLoading(true);
      await loginAsGuest();
      
      toast({
        title: "Welcome, Guest!",
        description: "You're now using LifePath as a guest.",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to continue as guest. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
        <CardFooter className="flex flex-col">
          <div className="relative w-full mb-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-black/70 px-2 text-white/50">or</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full border-white/20 text-white bg-black/30 hover:bg-white/10"
            onClick={handleGuestLogin}
            disabled={isLoading}
          >
            Continue as Guest
          </Button>
        </CardFooter>
      </Card>

      {/* Role selection dialog */}
      <RoleSelectionDialog 
        open={showRoleDialog} 
        onSelectRole={handleSignupComplete}
        onClose={() => setShowRoleDialog(false)}
      />
    </div>
  );
};

export default AuthPage;
