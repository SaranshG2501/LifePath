
import React from 'react';
import { Award, Star, Medal, TrendingUp, BookOpen, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AchievementProps {
  badges: {
    id: string;
    title: string;
    awardedAt: any; // Firestore timestamp
  }[];
  className?: string;
}

const AchievementDisplay: React.FC<AchievementProps> = ({ badges, className }) => {
  const getBadgeIcon = (badgeId: string) => {
    switch (badgeId) {
      case 'first-scenario':
        return <Star className="h-3 w-3 text-yellow-300" />;
      case 'classroom-joined':
        return <BookOpen className="h-3 w-3 text-blue-300" />;
      case 'level-up':
        return <TrendingUp className="h-3 w-3 text-green-300" />;
      case 'perfect-score':
        return <Medal className="h-3 w-3 text-amber-300" />;
      case 'engagement':
        return <Zap className="h-3 w-3 text-purple-300" />;
      default:
        return <Award className="h-3 w-3 text-primary" />;
    }
  };
  
  const getBadgeColor = (badgeId: string) => {
    switch (badgeId) {
      case 'first-scenario':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'classroom-joined':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'level-up':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'perfect-score':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';  
      case 'engagement':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-primary/20 text-primary/90 border-primary/30';
    }
  };

  if (!badges || badges.length === 0) {
    return (
      <div className={`text-center text-sm text-muted-foreground py-1 ${className}`}>
        No badges earned yet
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {badges.map((badge, index) => (
        <Badge 
          key={`${badge.id}-${index}`}
          className={`${getBadgeColor(badge.id)} border py-1 px-2`}
        >
          <span className="flex items-center gap-1.5">
            {getBadgeIcon(badge.id)}
            {badge.title}
          </span>
        </Badge>
      ))}
    </div>
  );
};

export default AchievementDisplay;
