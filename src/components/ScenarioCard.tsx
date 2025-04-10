
import React from 'react';
import { Scenario } from '@/types/game';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface ScenarioCardProps {
  scenario: Scenario;
  onStart: (id: string) => void;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onStart }) => {
  return (
    <Card className="scenario-card overflow-hidden h-full flex flex-col animate-fade-in">
      <div className="h-48 overflow-hidden relative">
        <img 
          src={scenario.thumbnail} 
          alt={scenario.title} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-3 left-3 flex gap-2">
          <Badge variant="outline" className="bg-primary/80 text-white border-none">
            {scenario.category}
          </Badge>
          <Badge variant="outline" className="bg-black/50 text-white border-none">
            Ages {scenario.ageGroup}
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{scenario.title}</CardTitle>
        <CardDescription className="line-clamp-2">{scenario.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex gap-2 flex-wrap">
          {Object.entries(scenario.initialMetrics).map(([key, value]) => {
            let bgColor = "";
            switch(key) {
              case "health": bgColor = "bg-green-100 text-green-800"; break;
              case "money": bgColor = "bg-blue-100 text-blue-800"; break;
              case "happiness": bgColor = "bg-yellow-100 text-yellow-800"; break;
              case "knowledge": bgColor = "bg-purple-100 text-purple-800"; break;
              case "relationships": bgColor = "bg-pink-100 text-pink-800"; break;
              default: bgColor = "bg-gray-100 text-gray-800";
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
          className="w-full rounded-xl"
          onClick={() => onStart(scenario.id)}
        >
          <Play className="w-4 h-4 mr-2" /> Start This Adventure
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ScenarioCard;
