
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, User, Lock, AlertTriangle } from 'lucide-react';
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

  const handleModeChange = (mode: GameMode) => {
    if (disabled) return;
    if (mode === 'classroom' && isGuest) {
      return; // Prevent guests from switching to classroom mode
    }
    onModeChange(mode);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card 
        className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
          currentMode === 'individual' 
            ? 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-blue-500/20 shadow-lg' 
            : 'border-white/20 hover:border-purple-400/50 bg-gradient-to-br from-slate-800/60 to-slate-700/60'
        } backdrop-blur-sm hover:scale-105`}
        onClick={() => handleModeChange('individual')}
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-white text-lg">
            <div className="p-2 bg-blue-500/30 rounded-lg">
              <User className="h-5 w-5 text-blue-300" />
            </div>
            Individual Play
          </CardTitle>
          <CardDescription className="text-white/70">
            Embark on your personal adventure
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-white/80 leading-relaxed">
            Complete scenarios at your own pace and track your personal journey through life's challenges.
          </p>
        </CardContent>
      </Card>

      <Card 
        className={`transition-all duration-300 border-2 ${
          isGuest 
            ? 'border-gray-500/50 bg-gradient-to-br from-gray-700/40 to-gray-600/40 opacity-70 cursor-not-allowed' 
            : currentMode === 'classroom' 
              ? 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-blue-500/20 shadow-lg cursor-pointer hover:shadow-xl hover:scale-105' 
              : 'border-white/20 hover:border-purple-400/50 bg-gradient-to-br from-slate-800/60 to-slate-700/60 cursor-pointer hover:shadow-xl hover:scale-105'
        } backdrop-blur-sm`}
        onClick={() => !isGuest && handleModeChange('classroom')}
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-white text-lg">
            <div className={`p-2 rounded-lg ${isGuest ? 'bg-gray-500/30' : 'bg-purple-500/30'}`}>
              <Users className={`h-5 w-5 ${isGuest ? 'text-gray-400' : 'text-purple-300'}`} />
            </div>
            Classroom Mode
            {isGuest && <Lock className="h-4 w-4 text-gray-400" />}
          </CardTitle>
          <CardDescription className={isGuest ? 'text-gray-400' : 'text-white/70'}>
            {isGuest ? 'Account required' : 'Collaborate with your class'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <p className={`text-sm leading-relaxed ${isGuest ? 'text-gray-400' : 'text-white/80'}`}>
            {isGuest 
              ? 'Create an account or sign in to access collaborative classroom features and real-time voting.'
              : 'Vote on decisions together with your classmates and see collective results in real-time.'
            }
          </p>
          {isGuest && (
            <div className="mt-4 flex items-center gap-2 text-sm bg-yellow-500/20 text-yellow-300 p-3 rounded-lg border border-yellow-500/30">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>Please create an account to unlock classroom features</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GameModeSelector;
