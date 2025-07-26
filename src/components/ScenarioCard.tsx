
import React from 'react';
import { Scenario } from '@/types/game';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Sparkles, CalendarClock, Image, Users, Clock, Star } from 'lucide-react';

interface ScenarioCardProps {
  scenario: Scenario;
  onStart: (id: string) => void;
  onClick?: () => void;
  isTeacherDashboard?: boolean;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ 
  scenario, 
  onStart, 
  onClick, 
  isTeacherDashboard = false 
}) => {
  // Add specific images for different scenarios
  const getScenarioImage = () => {
    switch(scenario.id) {
      case "climate-council":
        return "https://images.unsplash.com/photo-1518495973542-4542c06a5843";
      case "college-choice":
        return "https://images.unsplash.com/photo-1523050854058-8df90110c9f1";
      case "first-job":
        return "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40";
      case "financial-emergency":
        return "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e";
      default:
        return scenario.thumbnail;
    }
  };
  
  const scenarioImage = getScenarioImage();
  const estimatedDuration = Math.ceil(scenario.scenes.length * 2); // Estimate 2 minutes per scene
  
  return (
    <Card className={`overflow-hidden h-full flex flex-col transition-all duration-300 shadow-lg hover:shadow-2xl ${
      isTeacherDashboard 
        ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-600/30 hover:border-indigo-400/50 hover:scale-[1.02]' 
        : 'bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-white/10 backdrop-blur-md hover:border-indigo-300/30'
    }`}>
      <div className="relative h-40 sm:h-48 overflow-hidden group">
        {scenarioImage ? (
          <img 
            src={scenarioImage} 
            alt={scenario.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900/50 to-purple-900/50 flex items-center justify-center">
            <Image className="h-16 w-16 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
        
        {/* Fixed positioning and spacing for badges */}
        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
          <div className="flex flex-wrap gap-1 sm:gap-2 justify-start">
            <Badge variant="outline" className={`${
              isTeacherDashboard 
                ? 'bg-indigo-600/80 text-white border-indigo-400/50' 
                : 'bg-indigo-500/40 text-white border-none'
            } backdrop-blur-sm flex items-center gap-1 text-xs px-2 py-1`}>
              <Sparkles className="h-2 w-2 sm:h-3 sm:w-3" />
              {scenario.category}
            </Badge>
            <Badge variant="outline" className={`${
              isTeacherDashboard 
                ? 'bg-emerald-600/80 text-white border-emerald-400/50' 
                : 'bg-black/60 text-white border-none'
            } backdrop-blur-sm flex items-center gap-1 text-xs px-2 py-1`}>
              <Clock className="h-2 w-2 sm:h-3 sm:w-3" />
              ~{estimatedDuration}min
            </Badge>
          </div>
        </div>
        
        {/* Fixed positioning for age group badge */}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
          <Badge variant="outline" className={`${
            isTeacherDashboard 
              ? 'bg-orange-600/80 text-white border-orange-400/50' 
              : 'bg-black/60 text-white border-none'
          } backdrop-blur-sm flex items-center gap-1 text-xs px-2 py-1`}>
            <CalendarClock className="h-2 w-2 sm:h-3 sm:w-3" />
            Ages {scenario.ageGroup}
          </Badge>
        </div>

        {isTeacherDashboard && (
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
            <Badge className="bg-purple-600/80 text-white border-purple-400/50 backdrop-blur-sm flex items-center gap-1 text-xs px-2 py-1">
              <Users className="h-2 w-2 sm:h-3 sm:w-3" />
              <span className="hidden sm:inline">Classroom Ready</span>
              <span className="sm:hidden">Ready</span>
            </Badge>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2 sm:pb-3 space-y-2 sm:space-y-3 flex-shrink-0 p-4 sm:p-6">
        <CardTitle className={`text-lg sm:text-xl leading-tight ${
          isTeacherDashboard ? 'text-slate-100' : 'text-white'
        }`}>
          {scenario.title}
        </CardTitle>
        <CardDescription className={`line-clamp-3 text-xs sm:text-sm leading-relaxed ${
          isTeacherDashboard ? 'text-slate-300' : 'text-white/70'
        }`}>
          {scenario.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-3 sm:pb-4 pt-0 flex-1 space-y-3 sm:space-y-4 px-4 sm:px-6">
        {/* Metrics badges with better spacing */}
        <div className="flex gap-1 sm:gap-2 flex-wrap">
          {Object.entries(scenario.initialMetrics).map(([key, value]) => {
            if (value === 0) return null;
            
            let bgColor = "";
            let icon = "";
            switch(key) {
              case "health": 
                bgColor = isTeacherDashboard ? "bg-red-600/20 text-red-300 border-red-500/30" : "bg-red-500/20 text-red-300"; 
                icon = "❤️";
                break;
              case "money": 
                bgColor = isTeacherDashboard ? "bg-green-600/20 text-green-300 border-green-500/30" : "bg-green-500/20 text-green-300"; 
                icon = "💰";
                break;
              case "happiness": 
                bgColor = isTeacherDashboard ? "bg-yellow-600/20 text-yellow-300 border-yellow-500/30" : "bg-yellow-500/20 text-yellow-300"; 
                icon = "😊";
                break;
              case "knowledge": 
                bgColor = isTeacherDashboard ? "bg-blue-600/20 text-blue-300 border-blue-500/30" : "bg-blue-500/20 text-blue-300"; 
                icon = "📚";
                break;
              case "relationships": 
                bgColor = isTeacherDashboard ? "bg-purple-600/20 text-purple-300 border-purple-500/30" : "bg-purple-500/20 text-purple-300"; 
                icon = "👥";
                break;
              default: 
                bgColor = isTeacherDashboard ? "bg-slate-600/20 text-slate-300 border-slate-500/30" : "bg-white/10 text-white/80";
                icon = "⭐";
            }
            return (
              <span 
                key={key} 
                className={`text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium flex items-center gap-1 ${bgColor} ${
                  isTeacherDashboard ? 'border' : ''
                }`}
              >
                <span className="text-xs">{icon}</span>
                <span className="capitalize text-xs">{key}</span>
                <span className="text-xs opacity-80">+{value}</span>
              </span>
            );
          })}
        </div>

        {/* Teacher dashboard specific info */}
        {isTeacherDashboard && (
          <div className="pt-3 border-t border-slate-600/30">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 flex items-center gap-1">
                <Star className="h-3 w-3" />
                {scenario.scenes.length} scenes
              </span>
              <span className="text-slate-400">
                Interactive learning
              </span>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 sm:pt-3 flex-shrink-0 px-4 sm:px-6 pb-4 sm:pb-6">
        <Button 
          className={`w-full transition-all duration-300 text-sm sm:text-base py-2 sm:py-3 ${
            isTeacherDashboard 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg'
          }`}
          onClick={() => onStart(scenario.id)}
        >
          <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-2" /> 
          {isTeacherDashboard ? 'Start Live Session' : 'Start Adventure'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ScenarioCard;
