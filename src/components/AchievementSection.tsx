
import React, { useState } from 'react';
import AchievementBadge, { AchievementType } from './AchievementBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, ChevronDown, ChevronUp } from 'lucide-react';

interface AchievementSectionProps {
  earnedAchievements: AchievementType[];
}

const ALL_ACHIEVEMENTS: AchievementType[] = [
  'first-scenario',
  'five-scenarios',
  'ten-scenarios',
  'knowledge-master',
  'health-guru',
  'money-manager',
  'happiness-expert',
  'relationships-pro',
  'classroom-joined',
  'classroom-active'
];

const AchievementSection: React.FC<AchievementSectionProps> = ({ earnedAchievements = [] }) => {
  const [showAll, setShowAll] = useState(false);
  const progress = Math.round((earnedAchievements.length / ALL_ACHIEVEMENTS.length) * 100);
  
  return (
    <Card className="bg-black/30 border-primary/20 mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Achievements
          </CardTitle>
          <div className="text-white/70 text-sm">
            {earnedAchievements.length}/{ALL_ACHIEVEMENTS.length} Earned
          </div>
        </div>
        <CardDescription className="text-white/70">
          Track your progress through various life challenges
        </CardDescription>
        
        {/* Progress bar */}
        <div className="mt-2">
          <div className="h-2 bg-black/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-right text-xs text-white/50 mt-1">{progress}% complete</p>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {ALL_ACHIEVEMENTS
            .slice(0, showAll ? ALL_ACHIEVEMENTS.length : 6)
            .map(achievement => (
              <AchievementBadge
                key={achievement}
                type={achievement}
                earned={earnedAchievements.includes(achievement)}
              />
            ))}
        </div>
        
        {ALL_ACHIEVEMENTS.length > 6 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-4 text-primary w-full hover:bg-white/10"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? (
              <><ChevronUp className="h-4 w-4 mr-1" /> Show Less</>
            ) : (
              <><ChevronDown className="h-4 w-4 mr-1" /> Show All Achievements</>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default AchievementSection;
