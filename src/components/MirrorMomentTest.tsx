
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameContext } from '@/context/GameContext';
import MirrorMoment from './MirrorMoment';

const MirrorMomentTest: React.FC = () => {
  const { 
    mirrorMomentsEnabled,
    toggleMirrorMoments,
    showMirrorMoment,
    setShowMirrorMoment,
    setCurrentMirrorQuestion
  } = useGameContext();

  const testMirrorMoment = () => {
    setCurrentMirrorQuestion("How do you think this decision reflects your values?");
    setShowMirrorMoment(true);
  };

  console.log("Mirror moments enabled:", mirrorMomentsEnabled);
  console.log("Show mirror moment:", showMirrorMoment);

  return (
    <Card className="w-full max-w-md mx-auto bg-black/30 border-primary/20">
      <CardHeader>
        <CardTitle className="text-white">Mirror Moments Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-white">
          Status: {mirrorMomentsEnabled ? 'Enabled' : 'Disabled'}
        </div>
        
        <Button 
          onClick={toggleMirrorMoments}
          variant="outline"
          className="w-full border-white/20 text-white hover:bg-white/10"
        >
          {mirrorMomentsEnabled ? 'Disable' : 'Enable'} Mirror Moments
        </Button>
        
        <Button 
          onClick={testMirrorMoment}
          className="w-full bg-primary"
          disabled={!mirrorMomentsEnabled}
        >
          Test Mirror Moment
        </Button>
        
        {showMirrorMoment && <MirrorMoment />}
      </CardContent>
    </Card>
  );
};

export default MirrorMomentTest;
