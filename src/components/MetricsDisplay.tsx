
import React from 'react';
import { Metrics } from '@/types/game';
import { Heart, DollarSign, Smile, BookOpen, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MetricsDisplayProps {
  metrics: Metrics;
  compact?: boolean;
}

const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ metrics, compact = false }) => {
  // Safety check for metrics
  if (!metrics) {
    console.warn('MetricsDisplay: metrics prop is undefined');
    return null;
  }

  const metricsConfig = [
    { key: 'health', label: 'Health', icon: Heart, color: 'bg-neon-red', textColor: 'text-neon-red', bgColor: 'bg-neon-red/20' },
    { key: 'money', label: 'Money', icon: DollarSign, color: 'bg-neon-green', textColor: 'text-neon-green', bgColor: 'bg-neon-green/20' },
    { key: 'happiness', label: 'Happiness', icon: Smile, color: 'bg-neon-yellow', textColor: 'text-neon-yellow', bgColor: 'bg-neon-yellow/20' },
    { key: 'knowledge', label: 'Knowledge', icon: BookOpen, color: 'bg-neon-blue', textColor: 'text-neon-blue', bgColor: 'bg-neon-blue/20' },
    { key: 'relationships', label: 'Relationships', icon: Users, color: 'bg-neon-purple', textColor: 'text-neon-purple', bgColor: 'bg-neon-purple/20' },
  ];

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2 justify-center">
        {metricsConfig.map(({ key, icon: Icon, color, textColor, bgColor }, index) => {
          const value = metrics[key as keyof Metrics] || 0;
          const animationDelay = `${index * 0.1}s`;
          
          return (
            <TooltipProvider key={key}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={`stat-badge ${bgColor} ${textColor} animate-scale-in`}
                    style={{ animationDelay }}
                  >
                    <Icon size={14} className="animate-pulse-slow" />
                    <span>{value}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-black/80 backdrop-blur-md border-white/10 shadow-lg shadow-primary/10">
                  <p>{key.charAt(0).toUpperCase() + key.slice(1)}: {value}/100</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {metricsConfig.map(({ key, label, icon: Icon, color, bgColor }, index) => {
        const value = metrics[key as keyof Metrics] || 0;
        const animationDelay = `${index * 0.1}s`;
        
        return (
          <div key={key} className="glassmorphic-card p-3 rounded-lg animate-scale-in" style={{ animationDelay }}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`${bgColor} p-1 rounded-full`}>
                <Icon size={16} className={`${color.replace('bg-', 'text-')} animate-pulse-slow`} />
              </div>
              <span className="font-medium text-white">{label}</span>
            </div>
            <Progress value={value} className={`h-2 ${color} bg-white/10`} />
            <div className="text-right text-sm mt-1 text-white/70">{value}/100</div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsDisplay;
