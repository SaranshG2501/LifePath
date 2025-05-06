
import React, { useState, useEffect } from 'react';
import Avatar, { AvatarMood, AvatarPose, AvatarSize, AvatarPosition } from '@/components/avatar/Avatar';
import { AvatarControls } from '@/components/avatar/AvatarControls';
import { AvatarCustomization } from '@/components/avatar/AvatarTypes';
import { useAvatar } from '@/components/avatar/AvatarProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare, Settings, Layout, Radio, User, 
  ZoomIn, ZoomOut, MoveLeft, MoveRight, PlayCircle, Book
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const scenarioSteps = [
  {
    title: "Welcome",
    text: "Welcome to LifePath! I'll be your guide on this adventure.",
    mood: "happy" as AvatarMood,
    pose: "wave" as AvatarPose
  },
  {
    title: "Tough Decision",
    text: "You're faced with a difficult choice. What will you do?",
    mood: "thinking" as AvatarMood,
    pose: "idle" as AvatarPose
  },
  {
    title: "Great Choice",
    text: "That was a great decision! Your friends appreciate your help.",
    mood: "excited" as AvatarMood,
    pose: "thumbsUp" as AvatarPose
  },
  {
    title: "Challenge",
    text: "Hmm, this is going to be challenging. Let's think carefully.",
    mood: "confused" as AvatarMood,
    pose: "crossArms" as AvatarPose
  },
  {
    title: "Celebration",
    text: "Congratulations! You've successfully completed the challenge!",
    mood: "happy" as AvatarMood,
    pose: "clap" as AvatarPose
  }
];

const AvatarDemo = () => {
  const { toast } = useToast();
  const {
    mood, setMood,
    pose, setPose,
    size, setSize,
    position, setPosition,
    customization, setCustomization,
    showSpeechBubble, setSpeechBubble,
    speechText, setSpeechText,
    triggerReaction
  } = useAvatar();
  
  const [activeTab, setActiveTab] = useState("interactive");
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [isPlayingScenario, setIsPlayingScenario] = useState(false);

  // Play through scenario steps
  useEffect(() => {
    if (isPlayingScenario) {
      const step = scenarioSteps[scenarioIndex];
      triggerReaction(step.mood, step.pose, step.text);
      
      const timer = setTimeout(() => {
        const nextIndex = scenarioIndex + 1;
        if (nextIndex < scenarioSteps.length) {
          setScenarioIndex(nextIndex);
        } else {
          setIsPlayingScenario(false);
          setScenarioIndex(0);
          toast({
            title: "Demo Complete",
            description: "The scenario demonstration has finished.",
          });
        }
      }, 4000); // 4 seconds per step
      
      return () => clearTimeout(timer);
    }
  }, [isPlayingScenario, scenarioIndex, triggerReaction, toast]);

  const handleAvatarReact = () => {
    toast({
      title: "Avatar Reacted",
      description: `The avatar reacted with mood: ${mood}`,
    });
  };

  const handleSizeChange = (newSize: AvatarSize) => {
    setSize(newSize);
    toast({
      title: "Size Changed",
      description: `Avatar size set to ${newSize}`,
    });
  };

  const handlePositionChange = (newPosition: AvatarPosition) => {
    setPosition(newPosition);
    toast({
      title: "Position Changed",
      description: `Avatar position set to ${newPosition}`,
    });
  };

  const toggleSpeechBubble = () => {
    setSpeechBubble(!showSpeechBubble);
  };
  
  const playScenarioDemo = () => {
    setScenarioIndex(0);
    setIsPlayingScenario(true);
    toast({
      title: "Demo Started",
      description: "Starting avatar scenario demonstration...",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-white/10 rounded-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white flex items-center">
              <User className="h-6 w-6 text-indigo-300 mr-2" />
              3D Avatar System
            </h1>
            <p className="text-white/70">
              A customizable, expressive avatar for the LifePath educational app
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              className="bg-indigo-500/20 border-indigo-300/30"
              onClick={playScenarioDemo}
              disabled={isPlayingScenario}
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              Play Demo Scenario
            </Button>
            
            <Button 
              variant={activeTab === "interactive" ? "default" : "outline"}
              onClick={() => setActiveTab("interactive")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Interactive Mode
            </Button>
            
            <Button 
              variant={activeTab === "examples" ? "default" : "outline"}
              onClick={() => setActiveTab("examples")}
            >
              <Book className="mr-2 h-4 w-4" />
              Examples
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="interactive">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              {/* Avatar Preview */}
              <div className="flex flex-col items-center justify-center order-2 md:order-1">
                <div className="bg-gradient-to-br from-black/40 to-indigo-950/40 p-6 rounded-xl border border-white/5 w-full h-[500px] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={toggleSpeechBubble}
                      className="bg-black/20 border-white/10 hover:bg-black/40 text-white"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {showSpeechBubble ? 'Hide' : 'Show'} Speech
                    </Button>
                  </div>
                  
                  <Avatar
                    mood={mood}
                    pose={pose}
                    size={size}
                    position={position}
                    customization={customization}
                    showSpeechBubble={showSpeechBubble}
                    speechText={speechText}
                    onAvatarReact={handleAvatarReact}
                  />
                </div>
                
                {/* Quick Controls */}
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <div className="bg-black/20 rounded-full p-1 flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`rounded-full px-3 ${size === 'mini' ? 'bg-indigo-500 text-white' : 'text-white/70'}`}
                      onClick={() => handleSizeChange('mini')}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`rounded-full px-3 ${size === 'half' ? 'bg-indigo-500 text-white' : 'text-white/70'}`}
                      onClick={() => handleSizeChange('half')}
                    >
                      <Radio className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`rounded-full px-3 ${size === 'full' ? 'bg-indigo-500 text-white' : 'text-white/70'}`}
                      onClick={() => handleSizeChange('full')}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="bg-black/20 rounded-full p-1 flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`rounded-full px-3 ${position === 'left' ? 'bg-indigo-500 text-white' : 'text-white/70'}`}
                      onClick={() => handlePositionChange('left')}
                    >
                      <MoveLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`rounded-full px-3 ${position === 'center' ? 'bg-indigo-500 text-white' : 'text-white/70'}`}
                      onClick={() => handlePositionChange('center')}
                    >
                      <Layout className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`rounded-full px-3 ${position === 'right' ? 'bg-indigo-500 text-white' : 'text-white/70'}`}
                      onClick={() => handlePositionChange('right')}
                    >
                      <MoveRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Speech Bubble Controls */}
                <div className="mt-4 w-full">
                  <h3 className="text-sm font-medium text-white mb-2">Speech Text</h3>
                  <div className="flex gap-2">
                    <Input
                      value={speechText}
                      onChange={(e) => setSpeechText(e.target.value)}
                      className="bg-black/20 border-white/10 text-white"
                      placeholder="Enter speech text..."
                    />
                    <Button 
                      variant="outline"
                      onClick={() => setSpeechText("Hi there! I'm your life path guide!")}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Avatar Controls */}
              <div className="flex flex-col order-1 md:order-2">
                <AvatarControls
                  customization={customization}
                  onCustomizationChange={setCustomization}
                  onMoodChange={setMood}
                  onPoseChange={setPose}
                  className="h-full"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="examples">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              {/* Examples */}
              <div className="space-y-6">
                <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                  <h3 className="text-white font-medium mb-2">Onboarding Example</h3>
                  <p className="text-white/70 text-sm mb-4">Full-sized avatar as a guide during user onboarding</p>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      size="sm" 
                      onClick={() => triggerReaction('happy', 'wave', 'Welcome to LifePath! I\'m excited to guide you through this adventure!')}
                    >
                      Demo Welcome
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setSize('full');
                        setPosition('center');
                      }}
                    >
                      Set Full Size
                    </Button>
                  </div>
                </div>
                
                <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                  <h3 className="text-white font-medium mb-2">Decision Moment Example</h3>
                  <p className="text-white/70 text-sm mb-4">Avatar reacting to user choices</p>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      size="sm" 
                      onClick={() => triggerReaction('thinking', 'idle', 'You\'re faced with a difficult choice. What will you do?')}
                    >
                      Demo Question
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => triggerReaction('happy', 'thumbsUp', 'That was a great choice!')}
                    >
                      Positive Reaction
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => triggerReaction('sad', 'shrug', 'That choice might have consequences...')}
                    >
                      Negative Reaction
                    </Button>
                  </div>
                </div>
                
                <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                  <h3 className="text-white font-medium mb-2">Summary View Example</h3>
                  <p className="text-white/70 text-sm mb-4">Celebratory avatar for journey completion</p>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      size="sm" 
                      onClick={() => triggerReaction('excited', 'clap', 'Congratulations! You\'ve successfully completed your journey!')}
                    >
                      Success Ending
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => triggerReaction('thinking', 'crossArms', 'Your journey had mixed results. Consider what you\'ve learned for next time.')}
                    >
                      Mixed Results
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setSize('full');
                        setPosition('center');
                      }}
                    >
                      Set Full Size
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-black/40 to-indigo-950/40 p-6 rounded-xl border border-white/5 h-full flex items-center justify-center relative overflow-hidden">
                <Avatar
                  mood={mood}
                  pose={pose}
                  size={size}
                  position={position}
                  customization={customization}
                  showSpeechBubble={showSpeechBubble}
                  speechText={speechText}
                  onAvatarReact={handleAvatarReact}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Documentation */}
      <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 text-white">
          Implementation Guide
        </h2>
        
        <div className="bg-black/30 p-4 rounded-lg mb-6">
          <h3 className="text-white font-medium mb-2">Using the Avatar Component</h3>
          
          <pre className="bg-black/50 p-3 rounded text-xs text-indigo-100 overflow-x-auto">
{`// Basic usage
import Avatar from '@/components/avatar/Avatar';
import { useAvatar } from '@/components/avatar/AvatarProvider';

// In your component
const MyComponent = () => {
  const { 
    mood, pose, size, position, 
    customization, showSpeechBubble, speechText,
    triggerReaction // <- Use this to easily trigger avatar reactions
  } = useAvatar();
  
  return (
    <div>
      <h1>Your Page Content</h1>
      
      {/* Avatar with context values */}
      <Avatar 
        mood={mood}
        pose={pose}
        size={size}
        position={position}
        customization={customization}
        showSpeechBubble={showSpeechBubble}
        speechText={speechText}
      />
      
      {/* Trigger a reaction */}
      <button onClick={() => 
        triggerReaction('happy', 'thumbsUp', 'Great choice!')
      }>
        Make a choice
      </button>
    </div>
  );
};`}
          </pre>
        </div>
        
        <div className="bg-black/30 p-4 rounded-lg">
          <h3 className="text-white font-medium mb-2">Avatar Model Requirements</h3>
          <p className="text-white/70 text-sm mb-4">
            The avatar system requires a GLB model with specific morph targets and animations.
            See the README.md file in the public/models directory for detailed requirements.
          </p>
          
          <Button variant="outline" className="w-full sm:w-auto">
            <a href="https://readyplayer.me/" target="_blank" rel="noopener noreferrer" className="flex items-center">
              Create Custom Avatar
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AvatarDemo;
