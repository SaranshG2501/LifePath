
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, User, Lock } from 'lucide-react';
import { GameMode } from '@/types/game';
import { useAuth } from '@/context/AuthContext';

interface GameModeSelectorProps {
  currentMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  disabled?: boolean;
}

const GameModeSelector: React.FC<GameModeSelectorProps> = ({
  currentMode,
  onModeChange,
  disabled = false
}) => {
  const { currentUser } = useAuth();
  const isGuest = !currentUser;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card 
        className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
          currentMode === 'individual' 
            ? 'border-primary bg-primary/10' 
            : 'border-white/20 hover:border-primary/50'
        }`}
        onClick={() => !disabled && onModeChange('individual')}
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-white">
            <User className="h-5 w-5" />
            Individual Play
          </CardTitle>
          <CardDescription className="text-white/70">
            Play scenarios at your own pace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-white/80">
            Complete scenarios independently and track your personal progress.
          </p>
        </CardContent>
      </Card>

      <Card 
        className={`transition-all border-2 ${
          isGuest 
            ? 'border-gray-500 bg-gray-500/10 opacity-60 cursor-not-allowed' 
            : currentMode === 'classroom' 
              ? 'border-primary bg-primary/10 cursor-pointer hover:shadow-lg' 
              : 'border-white/20 hover:border-primary/50 cursor-pointer hover:shadow-lg'
        }`}
        onClick={() => !disabled && !isGuest && onModeChange('classroom')}
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5" />
            Classroom Mode
            {isGuest && <Lock className="h-4 w-4 text-gray-400" />}
          </CardTitle>
          <CardDescription className="text-white/70">
            {isGuest ? 'Login required' : 'Collaborate with your class'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-white/80">
            {isGuest 
              ? 'Sign in or create an account to access classroom features.'
              : 'Vote on decisions together and see class results in real-time.'
            }
          </p>
          {isGuest && (
            <div className="mt-2 text-xs text-yellow-400 bg-yellow-400/10 p-2 rounded">
              Please log in to access classroom mode
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GameModeSelector;
