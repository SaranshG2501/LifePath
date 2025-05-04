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
const SceneDisplay: React.FC<SceneDisplayProps> = ({
  scene,
  onChoiceMade
}) => {
  const isMobile = useIsMobile();
  return <div className="w-full max-w-4xl mx-auto animate-scale-in">
      <Card className="mb-8 shadow-lg border-indigo-500/20 overflow-hidden bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-md">
        {scene.image && <div className="w-full h-48 sm:h-64 overflow-hidden relative">
            <img src={scene.image} alt={scene.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-gradient-to-r from-indigo-500/80 to-purple-500/80 text-white px-4 py-2 rounded-xl shadow-md inline-block">
                {scene.title}
              </div>
            </div>
          </div>}
        <CardHeader className={`pb-2 relative ${scene.image ? 'pt-4' : 'pt-6'}`}>
          {!scene.image && <div className="absolute -top-6 left-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 rounded-xl shadow-md my-[30px] py-[5px]">
              {scene.title}
            </div>}
          <CardTitle className="text-xl sm:text-2xl pt-4 text-white">{scene.title}</CardTitle>
          <CardDescription className="text-base mt-2 text-white/90">
            {scene.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-2 pb-6">
          <div className="w-full text-lg font-semibold mb-2 text-center flex justify-center items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-300" />
            <span className="text-white">What will you do?</span>
            <Sparkles className="h-5 w-5 text-indigo-300" />
          </div>
          <div className="w-full space-y-3">
            {scene.choices.map((choice, index) => <ChoiceButton key={choice.id} choice={choice} onClick={() => onChoiceMade(choice.id)} delay={index * 0.1} isMobile={isMobile} />)}
          </div>
        </CardFooter>
      </Card>
    </div>;
};
const ChoiceButton: React.FC<{
  choice: Choice;
  onClick: () => void;
  delay: number;
  isMobile: boolean;
}> = ({
  choice,
  onClick,
  delay,
  isMobile
}) => {
  const buttonStyle = {
    animationDelay: `${delay}s`
  };
  const button = <button className="w-full text-left px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border border-white/10 hover:border-indigo-300/30 hover:bg-indigo-800/30 transition-all duration-300 flex items-center gap-3 animate-fade-in shadow-md hover:shadow-indigo-500/10" onClick={onClick} style={buttonStyle}>
      {isMobile ? <ArrowRight className="text-indigo-300 flex-shrink-0 h-5 w-5 transition-transform" /> : <ChevronRight className="text-indigo-300 flex-shrink-0 h-5 w-5 transition-transform" />}
      <span className="text-white">{choice.text}</span>
    </button>;
  if (choice.tooltip) {
    return <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent className="bg-black/90 text-white border-indigo-300/30 shadow-lg shadow-indigo-500/20">
            <p>{choice.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>;
  }
  return button;
};
export default SceneDisplay;