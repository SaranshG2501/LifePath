
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Award, BadgeCheck, Medal, Star } from 'lucide-react';

interface AchievementSectionProps {
  userProfile: {
    badges?: Array<{
      id: string;
      title: string;
      awardedAt: any;
    }>;
  };
}

const AchievementSection: React.FC<AchievementSectionProps> = ({ userProfile }) => {
  const badges = userProfile?.badges || [];
  
  // Map badge IDs to icons and descriptions
  const badgeDetails: Record<string, { icon: React.ReactNode; description: string; color: string }> = {
    'first-scenario': {
      icon: <Trophy className="h-5 w-5" />,
      description: 'Completed your first scenario',
      color: 'from-amber-500 to-yellow-500'
    },
    'perfect-score': {
      icon: <Star className="h-5 w-5" />,
      description: 'Achieved a perfect score in a scenario',
      color: 'from-blue-500 to-indigo-500'
    },
    'classroom-joined': {
      icon: <Award className="h-5 w-5" />,
      description: 'Joined a classroom',
      color: 'from-green-500 to-emerald-500'
    },
    'master-student': {
      icon: <Medal className="h-5 w-5" />,
      description: 'Completed 5+ scenarios',
      color: 'from-purple-500 to-pink-500'
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Recently';
    
    try {
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
      }
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString();
      }
      return 'Recently';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Recently';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-white/10 backdrop-blur-md overflow-hidden shadow-lg">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="h-5 w-5 text-indigo-300" />
          Achievements
        </CardTitle>
        <CardDescription className="text-white/70">
          Badges and awards earned
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {badges.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {badges.map((badge, index) => {
              const details = badgeDetails[badge.id] || {
                icon: <BadgeCheck className="h-5 w-5" />,
                description: 'Achievement unlocked',
                color: 'from-gray-500 to-slate-500'
              };
              
              return (
                <div 
                  key={badge.id || index}
                  className="bg-black/20 rounded-lg p-3 flex items-center gap-3"
                >
                  <div className={`rounded-full p-2 bg-gradient-to-r ${details.color}`}>
                    {details.icon}
                  </div>
                  <div>
                    <div className="text-white font-medium">{badge.title}</div>
                    <div className="text-xs text-white/70">{details.description}</div>
                    <div className="text-xs text-white/50 mt-0.5">
                      Awarded {formatDate(badge.awardedAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-black/20 rounded-lg p-6 text-center">
            <Trophy className="mx-auto h-10 w-10 text-white/30 mb-2" />
            <h3 className="text-white font-medium">No Badges Yet</h3>
            <p className="text-white/70 text-sm mt-1">
              Complete scenarios to earn achievements and badges
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AchievementSection;
