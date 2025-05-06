
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AvatarMood, AvatarPose, AvatarSize, AvatarPosition } from './Avatar';
import { AvatarCustomization } from './AvatarTypes';

interface AvatarContextProps {
  mood: AvatarMood;
  pose: AvatarPose;
  size: AvatarSize;
  position: AvatarPosition;
  customization: AvatarCustomization;
  showSpeechBubble: boolean;
  speechText: string;
  setMood: (mood: AvatarMood) => void;
  setPose: (pose: AvatarPose) => void;
  setSize: (size: AvatarSize) => void;
  setPosition: (position: AvatarPosition) => void;
  setCustomization: (customization: AvatarCustomization) => void;
  setSpeechBubble: (show: boolean) => void;
  setSpeechText: (text: string) => void;
  triggerReaction: (mood: AvatarMood, pose: AvatarPose, speech?: string) => void;
  resetAvatar: () => void;
}

const defaultCustomization: AvatarCustomization = {
  skinTone: 'default',
  hairStyle: 'short',
  outfit: 'casual',
  accessories: []
};

const AvatarContext = createContext<AvatarContextProps | undefined>(undefined);

export const AvatarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mood, setMood] = useState<AvatarMood>('neutral');
  const [pose, setPose] = useState<AvatarPose>('idle');
  const [size, setSize] = useState<AvatarSize>('half');
  const [position, setPosition] = useState<AvatarPosition>('left');
  const [customization, setCustomization] = useState<AvatarCustomization>(defaultCustomization);
  const [showSpeechBubble, setSpeechBubble] = useState<boolean>(false);
  const [speechText, setSpeechText] = useState<string>('');

  // Auto reset pose back to idle after certain poses
  useEffect(() => {
    if (pose !== 'idle' && pose !== 'crossArms') {
      const timeout = setTimeout(() => {
        setPose('idle');
      }, 3000); // Reset pose after 3 seconds
      return () => clearTimeout(timeout);
    }
  }, [pose]);

  // Trigger a reaction combining mood, pose and optional speech
  const triggerReaction = (mood: AvatarMood, pose: AvatarPose, speech?: string) => {
    setMood(mood);
    setPose(pose);
    
    if (speech) {
      setSpeechText(speech);
      setSpeechBubble(true);
      
      // Auto-hide speech bubble after a delay based on text length
      const duration = Math.max(3000, speech.length * 50);
      setTimeout(() => {
        setSpeechBubble(false);
      }, duration);
    }
  };

  // Reset avatar to default state
  const resetAvatar = () => {
    setMood('neutral');
    setPose('idle');
    setSize('half');
    setPosition('left');
    setSpeechBubble(false);
    setSpeechText('');
    // Don't reset customization as that's persistent
  };

  return (
    <AvatarContext.Provider
      value={{
        mood,
        pose,
        size,
        position,
        customization,
        showSpeechBubble,
        speechText,
        setMood,
        setPose,
        setSize,
        setPosition,
        setCustomization,
        setSpeechBubble,
        setSpeechText,
        triggerReaction,
        resetAvatar
      }}
    >
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatar = () => {
  const context = useContext(AvatarContext);
  if (context === undefined) {
    throw new Error('useAvatar must be used within an AvatarProvider');
  }
  return context;
};
