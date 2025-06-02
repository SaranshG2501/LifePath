
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Target } from 'lucide-react';
import { Scenario } from '@/types/game';
import { useNavigate } from 'react-router-dom';

interface ScenarioCompleteProps {
  scenario: Scenario;
}

const ScenarioComplete: React.FC<ScenarioCompleteProps> = ({ scenario }) => {
  const navigate = useNavigate();

  const handleReturnHome = () => {
    navigate('/');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-black/40 border-primary/20 backdrop-blur-lg shadow-xl">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Trophy className="h-16 w-16 text-yellow-400" />
        </div>
        <CardTitle className="text-3xl text-white mb-4">Scenario Complete!</CardTitle>
        <div className="flex justify-center gap-2 mb-4">
          <Badge className="bg-green-500/20 text-green-300 border-0">
            <Star className="h-3 w-3 mr-1" />
            Completed
          </Badge>
          <Badge className="bg-blue-500/20 text-blue-300 border-0">
            <Target className="h-3 w-3 mr-1" />
            {scenario.title}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="text-center">
        <p className="text-white/90 text-lg mb-6">
          You've successfully completed "{scenario.title}". Your choices have been recorded and your metrics updated.
        </p>
        
        <div className="space-y-4">
          <Button
            onClick={handleReturnHome}
            className="bg-primary hover:bg-primary/80 text-white px-8 py-3 text-lg"
          >
            Return to Home
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScenarioComplete;
