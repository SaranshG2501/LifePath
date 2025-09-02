
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, ArrowRight } from 'lucide-react';
import { useGameContext } from '@/context/GameContext';
import { motion } from 'framer-motion';

const MirrorMoment: React.FC = () => {
  const { currentMirrorQuestion, setShowMirrorMoment, makeChoice, gameState } = useGameContext();
  const [reflection, setReflection] = useState('');
  
  const handleContinue = () => {
    // In a full implementation, this would save the reflection
    // For now, just proceed with the previously selected choice
    if (gameState.currentScene && gameState.currentScene.choices.length > 0) {
      const lastChoice = gameState.currentScene.choices[0].id;
      setShowMirrorMoment(false);
      makeChoice(lastChoice);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full max-w-lg mx-auto"
    >
      <Card className="bg-black/40 border-primary/20 backdrop-blur-lg shadow-xl">
        <CardHeader className="relative pb-2">
          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-white p-3 rounded-full shadow-glow">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <CardTitle className="text-xl text-center pt-5 text-white">Mirror Moment</CardTitle>
          <CardDescription className="text-center text-white/80">Take a moment to reflect</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-medium text-center my-4 text-white">
            <span className="relative">
              {currentMirrorQuestion}
            </span>
          </div>
          <Textarea
            placeholder="Write your thoughts here..."
            className="min-h-24 mt-4 bg-black/20 border-primary/30 text-white"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
          />
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white"
            onClick={handleContinue}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default MirrorMoment;
