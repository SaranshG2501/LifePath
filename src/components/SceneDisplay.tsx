
import React from 'react';
import { Scene, Choice } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronRight, ThumbsUp } from 'lucide-react';

interface SceneDisplayProps {
  scene: Scene;
  onChoiceMade: (choiceId: string) => void;
}

const SceneDisplay: React.FC<SceneDisplayProps> = ({ scene, onChoiceMade }) => {
  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <Card className="mb-8 shadow-lg border-primary/20 overflow-hidden">
        {scene.image && (
          <div className="w-full h-60 overflow-hidden">
            <img src={scene.image} alt={scene.title} className="w-full h-full object-cover" />
          </div>
        )}
        <CardHeader className="pb-2 relative">
          <div className="absolute -top-6 left-6 bg-primary text-white px-4 py-2 rounded-xl shadow-md">
            {scene.title}
          </div>
          <CardTitle className="text-2xl pt-4">{scene.title}</CardTitle>
          <CardDescription className="text-base mt-1">
            {scene.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-2">
          <div className="w-full text-lg font-semibold mb-2 text-center gradient-heading">What will you do?</div>
          <div className="w-full space-y-3">
            {scene.choices.map((choice) => (
              <ChoiceButton 
                key={choice.id} 
                choice={choice} 
                onClick={() => onChoiceMade(choice.id)} 
              />
            ))}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

const ChoiceButton: React.FC<{
  choice: Choice;
  onClick: () => void;
}> = ({ choice, onClick }) => {
  const button = (
    <button
      className="choice-button"
      onClick={onClick}
    >
      <ChevronRight className="text-primary flex-shrink-0" />
      <span>{choice.text}</span>
    </button>
  );

  if (choice.tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent className="bg-black/80 text-white border-none">
            <p>{choice.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
};

export default SceneDisplay;
