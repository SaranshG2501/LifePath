
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
    console.log("Testing mirror moment...");
    setCurrentMirrorQuestion("How do you think this decision reflects your personal values and goals?");
    setShowMirrorMoment(true);
    console.log("Mirror moment should now be visible");
  };

  const testDifferentQuestion = () => {
    console.log("Testing different mirror moment question...");
    setCurrentMirrorQuestion("What emotions did you experience when making this choice, and why?");
    setShowMirrorMoment(true);
  };

  console.log("Mirror moments enabled:", mirrorMomentsEnabled);
  console.log("Show mirror moment:", showMirrorMoment);

  return (
    <>
      <Card className="w-full max-w-md mx-auto bg-black/30 border-primary/20">
        <CardHeader>
          <CardTitle className="text-white">Mirror Moments Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-white">
            <div>Status: <span className={mirrorMomentsEnabled ? 'text-green-400' : 'text-red-400'}>{mirrorMomentsEnabled ? 'Enabled' : 'Disabled'}</span></div>
            <div>Currently Showing: <span className={showMirrorMoment ? 'text-green-400' : 'text-gray-400'}>{showMirrorMoment ? 'Yes' : 'No'}</span></div>
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
            className="w-full bg-primary hover:bg-primary/90"
            disabled={!mirrorMomentsEnabled}
          >
            Test Mirror Moment (Values)
          </Button>
          
          <Button 
            onClick={testDifferentQuestion}
            className="w-full bg-secondary hover:bg-secondary/90"
            disabled={!mirrorMomentsEnabled}
          >
            Test Mirror Moment (Emotions)
          </Button>
          
          {showMirrorMoment && (
            <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded">
              <p className="text-green-300 text-sm">✓ Mirror moment is currently active</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {showMirrorMoment && <MirrorMoment />}
    </>
  );
};

export default MirrorMomentTest;
