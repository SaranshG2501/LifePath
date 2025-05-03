
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
  // Add a specific image for Climate Council scenario
  const isClimateCouncil = scenario.id === "climate-council" || scenario.title.toLowerCase().includes("climate");
  
  return (
    <Card className="scenario-card overflow-hidden h-full flex flex-col animate-fade-in group">
      <div className="h-48 overflow-hidden relative">
        {scenario.thumbnail ? (
          <img 
            src={scenario.thumbnail} 
            alt={scenario.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : isClimateCouncil ? (
          <div className="w-full h-full bg-gradient-to-br from-emerald-800 to-teal-600 flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1518495973542-4542c06a5843" 
              alt="Climate Council"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90"
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center">
            <Image className="h-16 w-16 text-white/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute bottom-3 left-3 flex gap-2">
          <Badge variant="outline" className="bg-primary/80 text-white border-none">
            {scenario.category}
          </Badge>
          <Badge variant="outline" className="bg-black/60 text-white border-none flex items-center gap-1">
            <CalendarClock className="h-3 w-3" />
            Ages {scenario.ageGroup}
          </Badge>
        </div>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-black/40 p-1 rounded-full backdrop-blur-sm animate-pulse-slow">
            <Sparkles className="h-4 w-4 text-neon-yellow" />
          </div>
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-white">{scenario.title}</CardTitle>
        <CardDescription className="line-clamp-2 text-white/80">{scenario.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex gap-2 flex-wrap">
          {Object.entries(scenario.initialMetrics).map(([key, value]) => {
            let bgColor = "";
            switch(key) {
              case "health": bgColor = "bg-neon-red/20 text-neon-red"; break;
              case "money": bgColor = "bg-neon-green/20 text-neon-green"; break;
              case "happiness": bgColor = "bg-neon-yellow/20 text-neon-yellow"; break;
              case "knowledge": bgColor = "bg-neon-blue/20 text-neon-blue"; break;
              case "relationships": bgColor = "bg-neon-purple/20 text-neon-purple"; break;
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
      <CardFooter>
        <Button 
          className="w-full rounded-xl bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/20 group-hover:scale-105 transition-all"
          onClick={() => onStart(scenario.id)}
        >
          <Play className="w-4 h-4 mr-2" /> Start This Adventure
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ScenarioCard;
