
import React from 'react';
import { Scenario } from '@/types/game';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, CalendarClock, Image, Clock, Star } from 'lucide-react';

interface ScenarioCardProps {
  scenario: Scenario;
  onStart: (id: string) => void;
  onClick?: () => void;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ 
  scenario, 
  onStart, 
  onClick
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
    <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 shadow-lg hover:shadow-2xl bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-white/10 backdrop-blur-md hover:border-indigo-300/30">
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
            <Badge variant="outline" className="bg-indigo-500/40 text-white border-none backdrop-blur-sm flex items-center gap-1 text-xs px-2 py-1">
              <Star className="h-2 w-2 sm:h-3 sm:w-3" />
              {scenario.category}
            </Badge>
            <Badge variant="outline" className="bg-black/60 text-white border-none backdrop-blur-sm flex items-center gap-1 text-xs px-2 py-1">
              <Clock className="h-2 w-2 sm:h-3 sm:w-3" />
              ~{estimatedDuration}min
            </Badge>
          </div>
        </div>
        
        {/* Fixed positioning for age group badge */}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
          <Badge variant="outline" className="bg-black/60 text-white border-none backdrop-blur-sm flex items-center gap-1 text-xs px-2 py-1">
            <CalendarClock className="h-2 w-2 sm:h-3 sm:w-3" />
            Ages {scenario.ageGroup}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-2 sm:pb-3 space-y-2 sm:space-y-3 flex-shrink-0 p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl leading-tight text-white">
          {scenario.title}
        </CardTitle>
        <CardDescription className="line-clamp-3 text-xs sm:text-sm leading-relaxed text-white/70">
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
                bgColor = "bg-red-500/20 text-red-300"; 
                icon = "❤️";
                break;
              case "money": 
                bgColor = "bg-green-500/20 text-green-300"; 
                icon = "💰";
                break;
              case "happiness": 
                bgColor = "bg-yellow-500/20 text-yellow-300"; 
                icon = "😊";
                break;
              case "knowledge": 
                bgColor = "bg-blue-500/20 text-blue-300"; 
                icon = "📚";
                break;
              case "relationships": 
                bgColor = "bg-purple-500/20 text-purple-300"; 
                icon = "👥";
                break;
              default: 
                bgColor = "bg-white/10 text-white/80";
                icon = "⭐";
            }
            return (
              <span 
                key={key} 
                className={`text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium flex items-center gap-1 ${bgColor}`}
              >
                <span className="text-xs">{icon}</span>
                <span className="capitalize text-xs">{key}</span>
                <span className="text-xs opacity-80">+{value}</span>
              </span>
            );
          })}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 sm:pt-3 flex-shrink-0 px-4 sm:px-6 pb-4 sm:pb-6">
        <Button 
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg transition-all duration-300 text-sm sm:text-base py-2 sm:py-3"
          onClick={() => onStart(scenario.id)}
        >
          <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-2" /> 
          Start Adventure
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ScenarioCard;
