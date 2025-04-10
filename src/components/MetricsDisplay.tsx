
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
  const metricsConfig = [
    { key: 'health', label: 'Health', icon: Heart, color: 'bg-red-500', textColor: 'text-red-500' },
    { key: 'money', label: 'Money', icon: DollarSign, color: 'bg-green-500', textColor: 'text-green-500' },
    { key: 'happiness', label: 'Happiness', icon: Smile, color: 'bg-yellow-500', textColor: 'text-yellow-500' },
    { key: 'knowledge', label: 'Knowledge', icon: BookOpen, color: 'bg-blue-500', textColor: 'text-blue-500' },
    { key: 'relationships', label: 'Relationships', icon: Users, color: 'bg-purple-500', textColor: 'text-purple-500' },
  ];

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2 justify-center">
        {metricsConfig.map(({ key, icon: Icon, color, textColor }, index) => {
          const value = metrics[key as keyof Metrics];
          const animationDelay = `${index * 0.1}s`;
          
          return (
            <TooltipProvider key={key}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={`stat-badge ${textColor} border-${color.replace('bg-', 'border-')} animate-scale-in`}
                    style={{ animationDelay }}
                  >
                    <Icon size={14} className="animate-pulse-slow" />
                    <span>{value}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900/90 backdrop-blur-md border-white/10">
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {metricsConfig.map(({ key, label, icon: Icon, color }, index) => {
        const value = metrics[key as keyof Metrics];
        const animationDelay = `${index * 0.1}s`;
        
        return (
          <div key={key} className="glassmorphic-card p-3 rounded-lg animate-scale-in" style={{ animationDelay }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={18} className={`${color.replace('bg-', 'text-')} animate-pulse-slow`} />
              <span className="font-medium">{label}</span>
            </div>
            <Progress value={value} className={`h-2 ${color} bg-white/20`} />
            <div className="text-right text-sm mt-1 text-white/70">{value}/100</div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsDisplay;
