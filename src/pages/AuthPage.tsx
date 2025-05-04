/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { RiGoogleFill } from '@remixicon/react';

const AuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setUserRole, userRole } = useGameContext();
  const { login, signup, userProfile, isLoading, loginWithGoogle, getUserProfile, createUserProfile } = useAuth();

  // Redirect when userProfile is loaded
  useEffect(() => {
    console.log('User Profile:', userProfile);
    console.log('Is Loading:', isLoading);
    if (userProfile && !isLoading) {
      navigate('/profile');
    }
  }, [userProfile, isLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: 'Login failed',
        description: 'Please enter your email and password.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await login(email, password);
      setUserRole(role);
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: (error as Error).message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !username) {
      toast({
        title: 'Signup failed',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await signup(email, password, username, role);
      setUserRole(role);
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: 'Signup failed',
        description: (error as Error).message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleGuestLogin = () => {
    setUserRole('guest');
    toast({
      title: 'Guest access granted',
      description: "You're now browsing as a guest. Some features are limited.",
    });
    navigate('/');
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await loginWithGoogle();

      if ('needsRoleSelection' in result && result.needsRoleSelection) {
        const desiredRole = prompt('Please enter your role (student or teacher):');
        if (!desiredRole) {
          toast({
            title: 'Role selection required',
            description: 'You must select a valid role: student or teacher.',
            variant: 'destructive',
          });
          return;
        }

        const normalizedRole = desiredRole.trim().toLowerCase();
        if (normalizedRole !== 'student' && normalizedRole !== 'teacher') {
          toast({
            title: 'Role selection required',
            description: 'You must select a valid role: student or teacher.',
            variant: 'destructive',
          });
          return;
        }

        const roleAsUserRole = normalizedRole as UserRole;

        const existingProfile = await getUserProfile(result.uid);
        if (existingProfile) {
          await createUserProfile(result.uid, {
            ...existingProfile,
            role: roleAsUserRole,
          });
        }
        setUserRole(roleAsUserRole);
        navigate('/profile');
      } else if ('profile' in result) {
        const existingRole = result.profile.role?.toLowerCase() || 'student';
        setUserRole(existingRole as UserRole);
        navigate('/profile');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      toast({
        title: 'Google login failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (userProfile && !isLoading) {
    // Already logged in, prevent showing auth page
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md border-primary/20 bg-black/30 backdrop-blur-md shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto flex items-center justify-center mb-4 relative">
            <Gamepad2 className="h-12 w-12 text-primary animate-pulse-slow absolute" />
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-md" />
          </div>
          <CardTitle className="text-2xl font-bold gradient-heading inline-flex items-center gap-1 relative">
            <span className="text-white">Welcome to LifePath</span>
            <Sparkles className="h-4 w-4 text-neon-yellow absolute -top-2 -right-6 animate-pulse-slow" />
          </CardTitle>
          <CardDescription className="text-white/80">
            Continue your journey of decision-making
          </CardDescription>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')}>
          <TabsList className="grid grid-cols-2 w-[80%] mx-auto mb-4">
            <TabsTrigger value="login" className="data-[state=active]:bg-primary/20">Login</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-primary/20">Sign Up</TabsTrigger>
          </TabsList>

          <CardContent>
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <div className="space-y-4">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="yourname@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-black/20 border-white/20 text-white"
                  />

                  <Label htmlFor="password" className="text-white">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-black/20 border-white/20 text-white"
                  />

                  <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </div>
              </form>

              <div className="mt-6 flex flex-col gap-2">
                <Button
                  className="bg-[#DB4437] text-white after:flex-1 hover:bg-[#DB4437]/90"
                  onClick={handleGoogleLogin}
                >
                  <span className="pointer-events-none me-2 flex-1">
                    <RiGoogleFill className="opacity-60" size={16} aria-hidden="true" />
                  </span>
                  Login with Google
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup}>
                <div className="space-y-4">
                  <Label htmlFor="username" className="text-white">Username</Label>
                  <Input
                    id="username"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-black/20 border-white/20 text-white"
                  />

                  <Label htmlFor="email-signup" className="text-white">Email</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="yourname@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-black/20 border-white/20 text-white"
                  />

                  <Label htmlFor="password-signup" className="text-white">Password</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-black/20 border-white/20 text-white"
                  />

                  <Label className="text-white">I am a:</Label>
                  <RadioGroup
                    defaultValue="student"
                    value={role}
                    onValueChange={(value) => setRole(value as UserRole)}
                    className="flex space-x-4"
                  >
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

                  <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </Button>
                </div>
              </form>
            </TabsContent>
          </CardContent>
        </Tabs>

        <CardFooter className="flex flex-col gap-4 pb-6">
          <div className="relative flex items-center w-full">
            <div className="flex-grow border-t border-white/10" />
            <span className="mx-4 flex-shrink text-white/60 text-sm">or</span>
            <div className="flex-grow border-t border-white/10" />
          </div>

          <Button
            variant="outline"
            className="w-full border-white/20 bg-black/20 text-white hover:bg-white/10"
            onClick={handleGuestLogin}
          >
            Continue as Guest
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthPage;
