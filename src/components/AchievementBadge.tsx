
import React from 'react';
import { Medal, Trophy, Star, CheckCircle, BookOpen, Brain, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type AchievementType = 
  | 'first-scenario'
  | 'five-scenarios' 
  | 'ten-scenarios' 
  | 'knowledge-master'
  | 'health-guru'
  | 'money-manager'
  | 'happiness-expert'
  | 'relationships-pro'
  | 'classroom-joined'
  | 'classroom-active';

interface AchievementBadgeProps {
  type: AchievementType;
  earned?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const getAchievementDetails = (type: AchievementType) => {
  const achievements = {
    'first-scenario': {
      name: 'First Steps',
      description: 'Completed your first life scenario',
      icon: CheckCircle,
      color: 'bg-green-500/20 text-green-400 border-green-500/30'
    },
    'five-scenarios': {
      name: 'Explorer',
      description: 'Completed five different scenarios',
      icon: Star,
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    },
    'ten-scenarios': {
      name: 'Life Master',
      description: 'Completed ten different scenarios',
      icon: Trophy,
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    },
    'knowledge-master': {
      name: 'Knowledge Master',
      description: 'Reached high knowledge metrics in a scenario',
      icon: BookOpen,
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    },
    'health-guru': {
      name: 'Health Guru',
      description: 'Maintained excellent health through a scenario',
      icon: Heart,
      color: 'bg-red-500/20 text-red-400 border-red-500/30'
    },
    'money-manager': {
      name: 'Money Manager',
      description: 'Accumulated significant wealth in a scenario',
      icon: Medal,
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    },
    'happiness-expert': {
      name: 'Happiness Expert',
      description: 'Achieved peak happiness in a scenario',
      icon: Heart,
      color: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
    },
    'relationships-pro': {
      name: 'Relationships Pro',
      description: 'Built strong relationships in a scenario',
      icon: Brain,
      color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
    },
    'classroom-joined': {
      name: 'Class Participant',
      description: 'Joined your first classroom',
      icon: CheckCircle,
      color: 'bg-teal-500/20 text-teal-400 border-teal-500/30'
    },
    'classroom-active': {
      name: 'Active Learner',
      description: 'Participated in a classroom activity',
      icon: Star,
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    }
  };
  
  return achievements[type];
};

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ 
  type, 
  earned = true, 
  size = 'md',
  showTooltip = true
}) => {
  const achievement = getAchievementDetails(type);
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1',
    lg: 'px-4 py-1.5 text-md'
  };
  
  const IconComponent = achievement.icon;
  
  const badge = (
    <Badge 
      className={`
        font-medium inline-flex items-center gap-1
        ${sizeClasses[size]} 
        ${earned ? achievement.color : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}
        ${!earned ? 'opacity-40' : ''}
      `}
    >
      <IconComponent className={`h-${size === 'sm' ? 3 : size === 'md' ? 4 : 5} w-${size === 'sm' ? 3 : size === 'md' ? 4 : 5}`} />
      {achievement.name}
    </Badge>
  );
  
  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent className="bg-black/80 border-white/20 p-3">
            <div className="text-center">
              <h4 className="font-semibold">{achievement.name}</h4>
              <p className="text-sm opacity-80">{achievement.description}</p>
              {!earned && <p className="text-xs text-gray-400 mt-1">Not yet earned</p>}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return badge;
};

export default AchievementBadge;
