import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { Gamepad2, LogIn, UserPlus, School, User, ArrowRight, Sparkles } from 'lucide-react';
import { UserRole } from '@/types/game';
import { useGameContext } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
const AuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const {
    setUserRole
  } = useGameContext();
  const {
    login,
    signup,
    userProfile,
    isLoading
  } = useAuth();

  // Check if user is already logged in
  useEffect(() => {
    if (userProfile && !isLoading) {
      navigate('/profile');
    }
  }, [userProfile, isLoading, navigate]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      try {
        await login(email, password);
        setUserRole(role);
        // Since login is asynchronous, we'll navigate from the useEffect when userProfile is updated
      } catch (error) {
        // Error is handled in the auth context
        console.error("Login error:", error);
      }
    } else {
      toast({
        title: "Login failed",
        description: "Please enter your email and password.",
        variant: "destructive"
      });
    }
  };
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password && username) {
      try {
        await signup(email, password, username, role);
        setUserRole(role);
        // Since signup is asynchronous, we'll navigate from the useEffect when userProfile is updated
      } catch (error) {
        // Error is handled in the auth context
        console.error("Signup error:", error);
      }
    } else {
      toast({
        title: "Signup failed",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
    }
  };
  const handleGuestLogin = () => {
    setUserRole('guest');
    toast({
      title: "Guest access granted",
      description: "You're now browsing as a guest. Some features are limited."
    });
    navigate('/');
  };

  // If already logged in, don't show login page
  if (userProfile && !isLoading) {
    return null;
  }
  return <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md border-primary/20 bg-black/30 backdrop-blur-md shadow-xl">
        <CardHeader className="text-center pb-2 my-[15px]">
          <div className="mx-auto flex items-center justify-center mb-4 relative">
            <Gamepad2 className="h-12 w-12 text-primary animate-pulse-slow absolute" />
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-md"></div>
          </div>
          <CardTitle className="text-2xl font-bold gradient-heading inline-flex items-center gap-1 relative">
            <span className="text-white font-semibold text-center mx-[90px]">Welcome to LifePath</span>
            <Sparkles className="h-4 w-4 text-neon-yellow absolute -top-2 -right-6 animate-pulse-slow" />
          </CardTitle>
          <CardDescription className="text-white/80">
            Continue your journey of decision-making
          </CardDescription>
        </CardHeader>

        <Tabs defaultValue="login" value={activeTab} onValueChange={v => setActiveTab(v as 'login' | 'signup')}>
          <TabsList className="grid grid-cols-2 w-[80%] mx-auto mb-4">
            <TabsTrigger value="login" className="data-[state=active]:bg-primary/20">Login</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-primary/20">Sign Up</TabsTrigger>
          </TabsList>

          <CardContent>
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input id="email" type="email" placeholder="yourname@example.com" value={email} onChange={e => setEmail(e.target.value)} className="bg-black/20 border-white/20 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">Password</Label>
                    <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="bg-black/20 border-white/20 text-white" />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-white">Username</Label>
                    <Input id="username" placeholder="Choose a username" value={username} onChange={e => setUsername(e.target.value)} className="bg-black/20 border-white/20 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-signup" className="text-white">Email</Label>
                    <Input id="email-signup" type="email" placeholder="yourname@example.com" value={email} onChange={e => setEmail(e.target.value)} className="bg-black/20 border-white/20 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signup" className="text-white">Password</Label>
                    <Input id="password-signup" type="password" value={password} onChange={e => setPassword(e.target.value)} className="bg-black/20 border-white/20 text-white" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">I am a:</Label>
                    <RadioGroup defaultValue="student" value={role} onValueChange={value => setRole(value as UserRole)} className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="student" id="student" className="text-primary border-white/50" />
                        <Label htmlFor="student" className="flex items-center text-white">
                          <User className="mr-1 h-4 w-4" />
                          Student
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="teacher" id="teacher" className="text-primary border-white/50" />
                        <Label htmlFor="teacher" className="flex items-center text-white">
                          <School className="mr-1 h-4 w-4" />
                          Teacher
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </Button>
                </div>
              </form>
            </TabsContent>
          </CardContent>
        </Tabs>

        <CardFooter className="flex flex-col gap-4 pb-6 my-0">
          <div className="relative flex items-center w-full">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="mx-4 flex-shrink text-white/60 text-sm">or</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>
          
          <Button variant="outline" className="w-full border-white/20 bg-black/20 text-white hover:bg-white/10" onClick={handleGuestLogin}>
            Continue as Guest
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>;
};
export default AuthPage;