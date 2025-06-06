
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db, signInWithGoogle } from '@/lib/firebase';
import { User, Chrome } from 'lucide-react';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | 'guest'>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Success!",
        description: "You have successfully signed in with Google.",
      });
      navigate('/');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast({
        title: "Sign In Failed",
        description: error.message || "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async () => {
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update profile with display name
      if (displayName) {
        await updateProfile(firebaseUser, { displayName });
      }

      // Create user profile in Firestore
      const userProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: displayName || firebaseUser.email?.split('@')[0] || 'User',
        photoURL: firebaseUser.photoURL || '',
        role: selectedRole,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        xp: 0,
        level: 1,
        badges: [],
        completedScenarios: [],
        history: [],
        classrooms: []
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);

      toast({
        title: "Account created!",
        description: `Welcome to LifePath as a ${selectedRole}!`,
      });

      navigate('/');
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: "Sign Up Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async () => {
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);

      toast({
        title: "Signed in!",
        description: "You have successfully signed in.",
      });

      navigate('/');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Sign In Failed",
        description: error.message || "Failed to sign in. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-black/30 border-primary/20 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <User className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-white text-2xl">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-white/70">
            {isSignUp ? 'Join LifePath to start your journey' : 'Sign in to continue your journey'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 border"
          >
            <Chrome className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-white/70">Or continue with email</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">Email</Label>
            <Input 
              type="email" 
              id="email" 
              placeholder="Enter your email" 
              className="bg-black/20 border-white/20 text-white placeholder:text-white/50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/80">Password</Label>
            <Input 
              type="password" 
              id="password" 
              placeholder="Enter your password" 
              className="bg-black/20 border-white/20 text-white placeholder:text-white/50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {isSignUp && (
            <>
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-white/80">Display Name</Label>
                <Input 
                  type="text" 
                  id="displayName" 
                  placeholder="Enter your display name" 
                  className="bg-black/20 border-white/20 text-white placeholder:text-white/50"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role" className="text-white/80">Role</Label>
                <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as 'student' | 'teacher' | 'guest')}>
                  <SelectTrigger className="bg-black/20 border-white/20 text-white">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/20">
                    <SelectItem value="student" className="text-white">Student</SelectItem>
                    <SelectItem value="teacher" className="text-white">Teacher</SelectItem>
                    <SelectItem value="guest" className="text-white">Guest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-white"
            onClick={isSignUp ? signUp : signIn}
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </Button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:text-primary/80 text-sm"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
