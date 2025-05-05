
import React, { useState } from 'react';
import Avatar, { AvatarMood, AvatarPose, AvatarSize, AvatarPosition } from '@/components/avatar/Avatar';
import { AvatarControls } from '@/components/avatar/AvatarControls';
import { AvatarCustomization } from '@/components/avatar/AvatarTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, Settings, Layout, Radio, User, ChevronRight, 
  ChevronLeft, ZoomIn, ZoomOut, MoveLeft, MoveRight
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const AvatarDemo = () => {
  const { toast } = useToast();
  const [mood, setMood] = useState<AvatarMood>('neutral');
  const [pose, setPose] = useState<AvatarPose>('idle');
  const [size, setSize] = useState<AvatarSize>('half');
  const [position, setPosition] = useState<AvatarPosition>('left');
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [speechText, setSpeechText] = useState("Hi there! I'm your life path guide!");
  const [customization, setCustomization] = useState<AvatarCustomization>({
    skinTone: '#FFDBAC',
    hairStyle: 'short',
    outfit: 'casual',
    accessories: []
  });

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
    setShowSpeechBubble(!showSpeechBubble);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-white/10 rounded-xl p-6 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white flex items-center">
          <User className="h-6 w-6 text-indigo-300 mr-2" />
          3D Avatar System
        </h1>
        <p className="text-white/70 mb-4">
          A customizable, expressive avatar component for teenagers in web applications
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center justify-center">
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
            {showSpeechBubble && (
              <div className="mt-4 w-full">
                <h3 className="text-sm font-medium text-white mb-2">Speech Text</h3>
                <div className="flex gap-2">
                  <Input
                    value={speechText}
                    onChange={(e) => setSpeechText(e.target.value)}
                    className="bg-black/20 border-white/10 text-white"
                    placeholder="Enter speech text..."
                  />
                  <Button onClick={() => setSpeechText("Hi there! I'm your life path guide!")}>
                    Reset
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Avatar Controls */}
          <div className="flex flex-col">
            <AvatarControls
              customization={customization}
              onCustomizationChange={setCustomization}
              onMoodChange={setMood}
              onPoseChange={setPose}
              className="h-full"
            />
          </div>
        </div>
      </div>
      
      {/* Implementation Examples */}
      <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 text-white flex items-center">
          <Settings className="h-5 w-5 text-indigo-300 mr-2" />
          Implementation Examples
        </h2>
        
        <Tabs defaultValue="onboarding" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
            <TabsTrigger value="storytelling">Storytelling</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="onboarding">
            <div className="bg-black/20 p-4 rounded-lg border border-white/10 mb-4">
              <h3 className="text-white font-medium mb-2">Onboarding Screen Example</h3>
              <p className="text-white/70 text-sm mb-4">Full-sized avatar with speech bubble as a guide</p>
              
              <pre className="bg-black/30 p-3 rounded text-xs text-indigo-100 overflow-x-auto">
{`<div className="onboarding-screen">
  <h1>Welcome to LifePath!</h1>
  
  <Avatar
    mood="excited"
    pose="wave"
    size="full"
    position="center"
    showSpeechBubble={true}
    speechText="Welcome! I'm your guide through this adventure!"
    customization={{
      skinTone: '#F1C27D',
      hairStyle: 'medium',
      outfit: 'casual'
    }}
  />
  
  <Button>Get Started</Button>
</div>`}
              </pre>
            </div>
          </TabsContent>
          
          <TabsContent value="storytelling">
            <div className="bg-black/20 p-4 rounded-lg border border-white/10 mb-4">
              <h3 className="text-white font-medium mb-2">Storytelling UI Example</h3>
              <p className="text-white/70 text-sm mb-4">Half-sized avatar in corner reacting to story</p>
              
              <pre className="bg-black/30 p-3 rounded text-xs text-indigo-100 overflow-x-auto">
{`<div className="story-screen">
  <div className="story-content">
    <p>You're faced with a difficult decision...</p>
    <div className="choices">
      <Button onClick={() => {
        // Make choice
        setAvatarMood('thinking');
      }}>
        Choice A
      </Button>
      <Button>Choice B</Button>
    </div>
  </div>
  
  <Avatar
    mood={avatarMood}
    pose="idle"
    size="half"
    position="left"
    showSpeechBubble={showReaction}
    speechText="Hmm, this is a tough one..."
  />
</div>`}
              </pre>
            </div>
          </TabsContent>
          
          <TabsContent value="summary">
            <div className="bg-black/20 p-4 rounded-lg border border-white/10 mb-4">
              <h3 className="text-white font-medium mb-2">Summary View Example</h3>
              <p className="text-white/70 text-sm mb-4">Avatar reacting to user's choices</p>
              
              <pre className="bg-black/30 p-3 rounded text-xs text-indigo-100 overflow-x-auto">
{`<div className="summary-screen">
  <h1>Your Journey Summary</h1>
  
  <div className="stats">
    {/* Stats display */}
  </div>
  
  <Avatar
    mood={goodChoices > badChoices ? "happy" : "thinking"}
    pose={goodChoices > badChoices ? "thumbsUp" : "shrug"}
    size="full"
    position="center"
    showSpeechBubble={true}
    speechText={
      goodChoices > badChoices 
        ? "Great job! You made some excellent choices!" 
        : "Interesting choices... what do you think about the outcomes?"
    }
    onAvatarReact={() => {
      // Track reactions for analytics
    }}
  />
  
  <Button>Continue</Button>
</div>`}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AvatarDemo;
