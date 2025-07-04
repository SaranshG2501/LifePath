
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, ArrowRight, Sparkles } from 'lucide-react';
import { useGameContext } from '@/context/GameContext';
import { motion } from 'framer-motion';

const MirrorMoment: React.FC = () => {
  const { 
    currentMirrorQuestion, 
    setShowMirrorMoment, 
    gameState,
    sceneHistory
  } = useGameContext();
  
  const [reflection, setReflection] = useState('');
  
  const handleContinue = () => {
    console.log("Mirror moment completed with reflection:", reflection);
    
    // Save the reflection (in a full implementation, this would be stored)
    if (reflection.trim()) {
      console.log("Saving reflection:", reflection);
      // Here you could save to localStorage or send to backend
      localStorage.setItem('lastMirrorReflection', reflection);
    }
    
    // Close the mirror moment
    setShowMirrorMoment(false);
    
    // Continue with the game flow - the parent component should handle the next step
    console.log("Mirror moment closed, game should continue");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <Card className="bg-black/90 border-primary/30 backdrop-blur-lg shadow-2xl w-full max-w-lg">
        <CardHeader className="relative pb-2">
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-white p-4 rounded-full shadow-lg">
            <Brain className="w-8 h-8 animate-pulse" />
          </div>
          <CardTitle className="text-2xl text-center pt-6 text-white">Mirror Moment</CardTitle>
          <CardDescription className="text-center text-white/80 text-lg">Take a moment to reflect</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-lg font-medium text-center p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20 text-white">
            <span className="relative">
              {currentMirrorQuestion || "How do you think this decision reflects your values?"}
              <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-2 -right-6 animate-pulse" />
            </span>
          </div>
          <Textarea
            placeholder="Write your thoughts here... What did you learn? How do you feel about your choice?"
            className="min-h-32 bg-black/30 border-primary/30 text-white placeholder:text-white/50 text-base"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
          />
        </CardContent>
        <CardFooter className="flex justify-center pt-4">
          <Button 
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold py-3 text-base"
            onClick={handleContinue}
          >
            Continue Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default MirrorMoment;
