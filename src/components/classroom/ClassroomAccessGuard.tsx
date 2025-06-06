
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ClassroomAccessGuardProps {
  children: React.ReactNode;
}

const ClassroomAccessGuard: React.FC<ClassroomAccessGuardProps> = ({ children }) => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  // Block access for guests or unauthenticated users
  if (!currentUser || !userProfile || userProfile.role === 'guest') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto bg-black/30 border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-red-400" />
            </div>
            <CardTitle className="text-white">Authentication Required</CardTitle>
            <CardDescription className="text-white/70">
              You need to sign in to access classroom features.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            <Button 
              onClick={() => navigate('/auth')}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Allow access for authenticated users
  return <>{children}</>;
};

export default ClassroomAccessGuard;
