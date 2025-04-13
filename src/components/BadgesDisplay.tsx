
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Award, Brain, Heart, TrendingUp, Shield, Zap, Scale, Sparkles } from 'lucide-react';

interface BadgesDisplayProps {
  earnedBadges?: string[];
}

const BadgesDisplay: React.FC<BadgesDisplayProps> = ({ earnedBadges = [] }) => {
  // All available badges
  const badges = [
    { 
      id: 'empath', 
      name: 'Empath', 
      icon: <Heart className="h-5 w-5 text-red-400" />,
      description: "Show understanding of others' perspectives in your decisions",
      criteria: 'Make 5 decisions that prioritize relationships'
    },
    { 
      id: 'strategist', 
      name: 'Strategist', 
      icon: <TrendingUp className="h-5 w-5 text-blue-400" />,
      description: 'Make financially sound decisions that benefit you long-term',
      criteria: 'Reach 75+ money score in any scenario'
    },
    { 
      id: 'risk-taker', 
      name: 'Risk-Taker', 
      icon: <Zap className="h-5 w-5 text-yellow-400" />,
      description: 'Not afraid to take chances when the reward is worth it',
      criteria: 'Choose the risky option in 3 different scenarios'
    },
    { 
      id: 'balanced', 
      name: 'Balanced', 
      icon: <Scale className="h-5 w-5 text-purple-400" />,
      description: 'Maintain a healthy balance across all life aspects',
      criteria: 'Finish a scenario with all metrics above 60'
    },
    { 
      id: 'wise', 
      name: 'Wise', 
      icon: <Brain className="h-5 w-5 text-green-400" />,
      description: 'Consistently make knowledge-based decisions',
      criteria: 'Reach 80+ knowledge score in any scenario'
    },
    { 
      id: 'guardian', 
      name: 'Guardian', 
      icon: <Shield className="h-5 w-5 text-indigo-400" />,
      description: 'Prioritize safety and wellbeing in difficult situations',
      criteria: 'Maintain 70+ health score across 3 scenarios'
    }
  ];

  return (
    <Card className="w-full bg-black/30 border-primary/20 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Award className="h-5 w-5 text-primary" />
          Achievement Badges
        </CardTitle>
        <CardDescription className="text-white/70">
          Earn badges by completing scenarios and making certain types of decisions
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {badges.map((badge) => {
            const isEarned = earnedBadges.includes(badge.id);
            
            return (
              <HoverCard key={badge.id}>
                <HoverCardTrigger asChild>
                  <div 
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center p-4 cursor-pointer transition-all ${
                      isEarned 
                        ? 'bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30' 
                        : 'bg-black/20 border border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="relative">
                      {badge.icon}
                      {isEarned && (
                        <Sparkles className="absolute -top-2 -right-2 h-3 w-3 text-yellow-300 animate-pulse" />
                      )}
                    </div>
                    <p className={`mt-2 text-center text-sm font-medium ${isEarned ? 'text-white' : 'text-white/70'}`}>
                      {badge.name}
                    </p>
                    {!isEarned && (
                      <div className="mt-1 text-[10px] text-white/50">Locked</div>
                    )}
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 bg-black/90 border-primary/30 text-white">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {badge.icon}
                      <h4 className="font-medium">{badge.name}</h4>
                    </div>
                    {isEarned ? (
                      <div className="text-xs font-medium px-2 py-1 bg-green-500/20 text-green-300 rounded-full">
                        Earned
                      </div>
                    ) : (
                      <div className="text-xs font-medium px-2 py-1 bg-white/10 text-white/70 rounded-full">
                        Locked
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-white/80 mt-2">{badge.description}</p>
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs font-medium text-white/70">To earn this badge:</p>
                    <p className="text-sm mt-1">{badge.criteria}</p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default BadgesDisplay;
