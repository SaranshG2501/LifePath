
import React from 'react';
import { Scene, Choice } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SceneDisplayProps {
  scene: Scene;
  onChoiceMade: (choiceId: string) => void;
}

const SceneDisplay: React.FC<SceneDisplayProps> = ({ scene, onChoiceMade }) => {
  const isMobile = useIsMobile();

  return (
    <div className="w-full max-w-4xl mx-auto animate-scale-in">
      <Card className="mb-8 shadow-lg border-primary/20 overflow-hidden bg-black/30 backdrop-blur-md">
        {scene.image && (
          <div className="w-full h-48 sm:h-64 overflow-hidden relative">
            <img 
              src={scene.image} 
              alt={scene.title} 
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-gradient-to-r from-primary/80 to-secondary/80 text-white px-4 py-2 rounded-xl shadow-md inline-block">
                {scene.title}
              </div>
            </div>
          </div>
        )}
        <CardHeader className={`pb-2 relative ${scene.image ? 'pt-4' : 'pt-6'}`}>
          {!scene.image && (
            <div className="absolute -top-6 left-6 bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-xl shadow-md animate-float">
              {scene.title}
            </div>
          )}
          <CardTitle className="text-xl sm:text-2xl pt-4 text-white">{scene.title}</CardTitle>
          <CardDescription className="text-base mt-2 text-white/90">
            {scene.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-2 pb-6">
          <div className="w-full text-lg font-semibold mb-2 text-center gradient-heading flex justify-center items-center gap-2 animate-pulse-slow">
            <Sparkles className="h-5 w-5 text-primary animate-pulse-slow" />
            What will you do?
            <Sparkles className="h-5 w-5 text-primary animate-pulse-slow" />
          </div>
          <div className="w-full space-y-3">
            {scene.choices.map((choice, index) => (
              <ChoiceButton 
                key={choice.id} 
                choice={choice} 
                onClick={() => onChoiceMade(choice.id)} 
                delay={index * 0.1}
                isMobile={isMobile}
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
  delay: number;
  isMobile: boolean;
}> = ({ choice, onClick, delay, isMobile }) => {
  const buttonStyle = {
    animationDelay: `${delay}s`
  };

  const button = (
    <button
      className="choice-button animate-slide-up group"
      onClick={onClick}
      style={buttonStyle}
    >
      {isMobile ? (
        <ArrowRight className="text-primary flex-shrink-0 h-5 w-5 group-hover:translate-x-1 transition-transform" />
      ) : (
        <ChevronRight className="text-primary flex-shrink-0 h-5 w-5 group-hover:translate-x-1 transition-transform" />
      )}
      <span className="text-white">{choice.text}</span>
    </button>
  );

  if (choice.tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent className="bg-black/90 text-white border-primary/30 shadow-lg shadow-primary/20">
            <p>{choice.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
};

export default SceneDisplay;
