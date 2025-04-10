
import React from 'react';
import { Scenario } from '@/types/game';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ScenarioCardProps {
  scenario: Scenario;
  onStart: (id: string) => void;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onStart }) => {
  return (
    <Card className="scenario-card overflow-hidden h-full flex flex-col animate-fade-in">
      <div className="h-40 overflow-hidden">
        <img 
          src={scenario.thumbnail} 
          alt={scenario.title} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            {scenario.category}
          </Badge>
          <Badge variant="outline" className="bg-secondary/10 text-secondary">
            Ages {scenario.ageGroup}
          </Badge>
        </div>
        <CardTitle>{scenario.title}</CardTitle>
        <CardDescription className="line-clamp-2">{scenario.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-sm text-muted-foreground">
          {/* Additional details could go here */}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => onStart(scenario.id)}
        >
          Start Scenario
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ScenarioCard;
