
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Lock, Users } from 'lucide-react';
import { Scenario } from '@/types/game';
import { useGameContext } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';

interface ScenarioCardProps {
  scenario: Scenario;
  onStart?: (scenarioId: string) => void;
  onClick?: () => void;
  disabled?: boolean;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ 
  scenario, 
  onStart, 
  onClick, 
  disabled = false 
}) => {
  const { canPlayScenarios, gameMode } = useGameContext();
  const { currentUser } = useAuth();

  const handleClick = () => {
    if (disabled || !canPlayScenarios) {
      return;
    }
    
    if (onClick) {
      onClick();
    } else if (onStart) {
      onStart(scenario.id);
    }
  };

  const isPlayable = canPlayScenarios && !disabled;
  const needsAuth = !currentUser;

  return (
    <Card 
      className={`
        bg-black/30 border-primary/20 hover:border-primary/40 transition-all duration-200 cursor-pointer
        ${!isPlayable ? 'opacity-50' : 'hover:scale-105'}
      `}
      onClick={handleClick}
    >
      <CardHeader className="relative">
        <div className="flex justify-between items-start mb-2">
          <Badge className="bg-primary/20 text-primary border-0">
            {scenario.ageGroup}
          </Badge>
          {gameMode === 'classroom' && (
            <Badge className="bg-blue-500/20 text-blue-300 border-0 text-xs">
              <Users className="w-3 h-3 mr-1" />
              Classroom
            </Badge>
          )}
        </div>
        
        <CardTitle className="text-white text-lg line-clamp-2">
          {scenario.title}
        </CardTitle>
        
        <CardDescription className="text-white/70 line-clamp-3">
          {scenario.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="border-white/20 text-white/80">
            {scenario.category}
          </Badge>
          
          <Button 
            size="sm" 
            disabled={!isPlayable}
            className={`
              ${isPlayable 
                ? 'bg-primary hover:bg-primary/90 text-white' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {needsAuth ? (
              <>
                <Lock className="w-4 h-4 mr-1" />
                Sign In
              </>
            ) : !canPlayScenarios ? (
              <>
                <Lock className="w-4 h-4 mr-1" />
                Restricted
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Play
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScenarioCard;
