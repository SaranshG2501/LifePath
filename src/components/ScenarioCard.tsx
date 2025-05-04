
import React from 'react';
import { Scenario } from '@/types/game';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Sparkles, CalendarClock, Image } from 'lucide-react';

interface ScenarioCardProps {
  scenario: Scenario;
  onStart: (id: string) => void;
  onClick?: () => void;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onStart, onClick }) => {
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
  
  // Get scenario image
  const scenarioImage = getScenarioImage();
  
  return (
    <Card className="overflow-hidden h-full flex flex-col bg-black/30 border-white/10 backdrop-blur-md hover:border-primary/30 transition-all duration-300">
      <div className="relative h-44 overflow-hidden">
        {scenarioImage ? (
          <img 
            src={scenarioImage} 
            alt={scenario.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-black/40 flex items-center justify-center">
            <Image className="h-12 w-12 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
        <div className="absolute bottom-3 left-3 flex gap-2">
          <Badge variant="outline" className="bg-primary/20 text-primary border-none">
            {scenario.category}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className="bg-black/60 text-white border-none flex items-center gap-1">
            <CalendarClock className="h-3 w-3" />
            Ages {scenario.ageGroup}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-2 space-y-1">
        <CardTitle className="text-xl text-white flex items-center">
          {scenario.title}
          <Sparkles className="h-3 w-3 text-primary ml-2" />
        </CardTitle>
        <CardDescription className="line-clamp-2 text-white/70">{scenario.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-4 pt-0">
        <div className="flex gap-2 flex-wrap">
          {Object.entries(scenario.initialMetrics).map(([key, value]) => {
            if (value === 0) return null; // Don't show metrics that start at 0
            
            let bgColor = "";
            switch(key) {
              case "health": bgColor = "bg-red-500/20 text-red-300"; break;
              case "money": bgColor = "bg-green-500/20 text-green-300"; break;
              case "happiness": bgColor = "bg-yellow-500/20 text-yellow-300"; break;
              case "knowledge": bgColor = "bg-blue-500/20 text-blue-300"; break;
              case "relationships": bgColor = "bg-purple-500/20 text-purple-300"; break;
              default: bgColor = "bg-white/10 text-white/80";
            }
            return (
              <span key={key} className={`text-xs px-2 py-1 rounded-full ${bgColor} capitalize`}>
                {key}
              </span>
            );
          })}
        </div>
      </CardContent>
      
      <CardFooter className="mt-auto">
        <Button 
          className="w-full bg-black/40 hover:bg-primary/20 text-white border border-primary/30 hover:border-primary transition-all"
          onClick={() => onStart(scenario.id)}
        >
          <Play className="w-4 h-4 mr-2" /> Start Adventure
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ScenarioCard;
