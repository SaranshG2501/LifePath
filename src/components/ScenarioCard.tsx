
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, BookOpen, Star, Zap, Crown, Sparkles } from 'lucide-react';
import { Scenario } from '@/types/game';

interface ScenarioCardProps {
  scenario: Scenario;
  onStartScenario: (id: string) => void;
  disabled?: boolean;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onStartScenario, disabled = false }) => {
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'financial literacy':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'social skills':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'ethics':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'personal growth':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'financial literacy':
        return '💰';
      case 'social skills':
        return '👥';
      case 'ethics':
        return '⚖️';
      case 'personal growth':
        return '🌱';
      default:
        return '📚';
    }
  };

  const getScenarioImage = (scenarioId: string) => {
    // Map scenario IDs to appropriate images
    const imageMap: Record<string, string> = {
      'college-decision': 'photo-1649972904349-6e44c42644a7',
      'first-job': 'photo-1488590528505-98d2b5aba04b',
      'financial-literacy': 'photo-1518770660439-4636190af475',
      'relationship-conflict': 'photo-1461749280684-dccba630e2f6',
      'peer-pressure': 'photo-1486312338219-ce68d2c6f44d',
    };
    
    const imageId = imageMap[scenarioId] || 'photo-1649972904349-6e44c42644a7';
    return `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=400&h=200&q=80`;
  };

  return (
    <Card className="teen-card h-full flex flex-col transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 border-purple-500/30 hover:border-purple-500/50 bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-sm shadow-lg hover:shadow-purple-500/20 rounded-2xl overflow-hidden group">
      
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Scenario Image */}
      <div className="relative h-32 overflow-hidden">
        <img 
          src={getScenarioImage(scenario.id)}
          alt={scenario.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800/80 to-transparent"></div>
        <div className="absolute top-2 right-2">
          <div className="flex items-center gap-1">
            <Crown className="h-3 w-3 text-yellow-400 animate-pulse" />
            <Sparkles className="h-3 w-3 text-pink-400 animate-pulse" />
          </div>
        </div>
      </div>
      
      <CardHeader className="pb-3 relative z-10">        
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-xl border-2 border-purple-500/50 shadow-lg">
            <BookOpen className="h-4 w-4 text-purple-400" />
          </div>
          <Badge className={`px-2 py-1 border text-xs font-bold rounded-lg ${getCategoryColor(scenario.category)}`}>
            {getCategoryIcon(scenario.category)} {scenario.category.toUpperCase()}
          </Badge>
        </div>
        
        <CardTitle className="text-white font-black text-sm mb-2 group-hover:text-purple-400 transition-colors duration-300">
          {scenario.title}
        </CardTitle>
        
        <CardDescription className="text-white/70 text-xs leading-relaxed font-medium">
          {scenario.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between pt-0 relative z-10">
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-purple-400">
              <Users className="h-3 w-3" />
              <span className="font-medium">{scenario.ageGroup}</span>
            </div>
            <div className="flex items-center gap-1 text-pink-400">
              <BookOpen className="h-3 w-3" />
              <span className="font-medium">{scenario.scenes?.length || 0} scenes</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1">
            <Badge 
              variant="outline" 
              className="text-xs px-2 py-0 bg-purple-500/20 text-purple-400 border-purple-500/40 font-medium"
            >
              {scenario.category}
            </Badge>
          </div>
        </div>

        <Button
          onClick={() => onStartScenario(scenario.id)}
          disabled={disabled}
          className="w-full bg-gradient-to-r from-purple-600/80 to-pink-600/80 hover:from-purple-600 hover:to-pink-600 text-white border-2 border-purple-500/60 hover:border-purple-500 font-bold text-xs py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 backdrop-blur-sm group-hover:shadow-xl"
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
