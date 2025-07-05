
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, BookOpen, Star, Zap, Crown, Sparkles } from 'lucide-react';
import { Scenario } from '@/types/game';

interface ScenarioCardProps {
  scenario: Scenario;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onSelect, disabled = false }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return '🌟';
      case 'medium':
        return '⚡';
      case 'hard':
        return '🔥';
      default:
        return '⭐';
    }
  };

  return (
    <Card className="teen-card h-full flex flex-col transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 border-neon-blue/30 hover:border-neon-blue/50 bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-sm shadow-lg hover:shadow-neon-blue/20 rounded-2xl overflow-hidden group">
      
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 via-neon-purple/5 to-neon-pink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-neon-purple/20 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 rounded-xl border-2 border-neon-blue/50 shadow-lg">
              <BookOpen className="h-4 w-4 text-neon-blue" />
            </div>
            <Badge className={`px-2 py-1 border text-xs font-bold rounded-lg ${getDifficultyColor(scenario.difficulty)}`}>
              {getDifficultyIcon(scenario.difficulty)} {scenario.difficulty.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Crown className="h-3 w-3 text-neon-yellow animate-pulse" />
            <Sparkles className="h-3 w-3 text-neon-pink animate-pulse" />
          </div>
        </div>
        
        <CardTitle className="text-white font-black text-base mb-2 group-hover:text-neon-blue transition-colors duration-300">
          {scenario.title}
        </CardTitle>
        
        <CardDescription className="text-white/70 text-xs leading-relaxed font-medium">
          {scenario.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between pt-0 relative z-10">
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-neon-blue">
              <Clock className="h-3 w-3" />
              <span className="font-medium">{scenario.estimatedTime}</span>
            </div>
            <div className="flex items-center gap-1 text-neon-purple">
              <Users className="h-3 w-3" />
              <span className="font-medium">{scenario.scenes?.length || 0} scenes</span>
            </div>
          </div>
          
          {scenario.tags && (
            <div className="flex flex-wrap gap-1">
              {scenario.tags.slice(0, 3).map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs px-2 py-0 bg-neon-cyan/20 text-neon-cyan border-neon-cyan/40 font-medium"
                >
                  {tag}
                </Badge>
              ))}
              {scenario.tags.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-0 bg-white/10 text-white/60 border-white/20">
                  +{scenario.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>

        <Button
          onClick={() => onSelect(scenario.id)}
          disabled={disabled}
          className="w-full bg-gradient-to-r from-neon-purple/80 to-neon-pink/80 hover:from-neon-purple hover:to-neon-pink text-white border-2 border-neon-purple/60 hover:border-neon-purple font-bold text-sm py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-neon-purple/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 backdrop-blur-sm group-hover:shadow-xl"
        >
          <Zap className="h-4 w-4 mr-2 animate-pulse" />
          Start Epic Quest
          <Star className="h-4 w-4 ml-2 animate-bounce-light" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default ScenarioCard;
