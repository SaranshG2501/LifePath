
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smile, User, Palette, Brush, Shirt, Package, 
  ChevronRight, ChevronLeft, Check
} from 'lucide-react';
import { AvatarCustomization } from './AvatarTypes';
import { 
  SKIN_TONES, HAIR_STYLES, OUTFITS, ACCESSORIES,
  MOODS, POSES
} from './AvatarUtils';
import { AvatarMood, AvatarPose } from './Avatar';

interface AvatarControlsProps {
  customization: AvatarCustomization;
  onCustomizationChange: (customization: AvatarCustomization) => void;
  onMoodChange: (mood: AvatarMood) => void;
  onPoseChange: (pose: AvatarPose) => void;
  className?: string;
}

export const AvatarControls: React.FC<AvatarControlsProps> = ({
  customization,
  onCustomizationChange,
  onMoodChange,
  onPoseChange,
  className
}) => {
  const [activeTab, setActiveTab] = useState("appearance");
  
  const updateCustomization = (field: keyof AvatarCustomization, value: any) => {
    onCustomizationChange({ ...customization, [field]: value });
  };
  
  const toggleAccessory = (accessory: string) => {
    const accessories = customization.accessories || [];
    const newAccessories = accessories.includes(accessory) 
      ? accessories.filter(a => a !== accessory)
      : [...accessories, accessory];
      
    updateCustomization('accessories', newAccessories);
  };
  
  return (
    <div className={`bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-white/10 p-4 rounded-lg ${className || ''}`}>
      <Tabs defaultValue="appearance" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Look</span>
          </TabsTrigger>
          <TabsTrigger value="mood" className="flex items-center gap-2">
            <Smile className="h-4 w-4" />
            <span className="hidden sm:inline">Mood</span>
          </TabsTrigger>
          <TabsTrigger value="pose" className="flex items-center gap-2">
            <Brush className="h-4 w-4" />
            <span className="hidden sm:inline">Pose</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="appearance" className="space-y-4">
          {/* Skin Tone */}
          <div>
            <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              <Palette className="h-4 w-4" /> Skin Tone
            </h3>
            <div className="flex flex-wrap gap-2">
              {SKIN_TONES.map(tone => (
                <button
                  key={tone.value}
                  className={`h-8 w-8 rounded-full border-2 ${
                    customization.skinTone === tone.value
                      ? 'border-white scale-110'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: tone.value }}
                  onClick={() => updateCustomization('skinTone', tone.value)}
                  title={tone.name}
                />
              ))}
            </div>
          </div>
          
          {/* Hair Style */}
          <div>
            <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              <Brush className="h-4 w-4" /> Hair Style
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {HAIR_STYLES.map(style => (
                <button
                  key={style.id}
                  className={`p-2 text-xs text-center rounded ${
                    customization.hairStyle === style.id
                      ? 'bg-indigo-500 text-white'
                      : 'bg-black/20 text-white/70 hover:bg-black/30'
                  }`}
                  onClick={() => updateCustomization('hairStyle', style.id)}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Outfit */}
          <div>
            <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              <Shirt className="h-4 w-4" /> Outfit
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {OUTFITS.map(outfit => (
                <button
                  key={outfit.id}
                  className={`p-2 text-xs text-center rounded ${
                    customization.outfit === outfit.id
                      ? 'bg-indigo-500 text-white'
                      : 'bg-black/20 text-white/70 hover:bg-black/30'
                  }`}
                  onClick={() => updateCustomization('outfit', outfit.id)}
                >
                  {outfit.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Accessories */}
          <div>
            <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              <Package className="h-4 w-4" /> Accessories
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {ACCESSORIES.map(accessory => (
                <button
                  key={accessory.id}
                  className={`p-2 text-xs text-center rounded ${
                    customization.accessories?.includes(accessory.id)
                      ? 'bg-indigo-500 text-white'
                      : 'bg-black/20 text-white/70 hover:bg-black/30'
                  }`}
                  onClick={() => toggleAccessory(accessory.id)}
                >
                  {accessory.name} {customization.accessories?.includes(accessory.id) && <Check className="h-3 w-3 inline" />}
                </button>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="mood" className="space-y-4">
          <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
            <Smile className="h-4 w-4" /> Expression
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {MOODS.map(mood => (
              <Button
                key={mood.id}
                variant={mood.id === 'neutral' ? 'default' : 'outline'}
                className="h-auto py-2"
                onClick={() => onMoodChange(mood.id as AvatarMood)}
              >
                <span className="mr-2">{mood.emoji}</span> {mood.name}
              </Button>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="pose" className="space-y-4">
          <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
            <Brush className="h-4 w-4" /> Pose
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {POSES.map(pose => (
              <Button
                key={pose.id}
                variant={pose.id === 'idle' ? 'default' : 'outline'}
                className="h-auto py-2"
                onClick={() => onPoseChange(pose.id as AvatarPose)}
              >
                <span className="mr-2">{pose.emoji}</span> {pose.name}
              </Button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
