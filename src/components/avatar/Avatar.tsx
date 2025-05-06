
import React, { useEffect, useState } from 'react';
import { SpeechBubble } from './SpeechBubble';
import { AvatarCustomization } from './AvatarTypes';
import { cn } from '@/lib/utils';

export type AvatarMood = 'happy' | 'sad' | 'stressed' | 'excited' | 'thinking' | 'confused' | 'surprised' | 'neutral';
export type AvatarPose = 'clap' | 'nod' | 'thumbsUp' | 'shrug' | 'facepalm' | 'crossArms' | 'idle' | 'wave' | 'pointing';
export type AvatarSize = 'full' | 'half' | 'mini';
export type AvatarPosition = 'left' | 'right' | 'center';

export interface AvatarProps {
  mood?: AvatarMood;
  pose?: AvatarPose;
  size?: AvatarSize;
  position?: AvatarPosition;
  showSpeechBubble?: boolean;
  speechText?: string;
  customization?: AvatarCustomization;
  onAvatarReact?: () => void;
  className?: string;
  fallback?: React.ReactNode;
}

const Avatar: React.FC<AvatarProps> = ({
  mood = 'neutral',
  pose = 'idle',
  size = 'half',
  position = 'left',
  showSpeechBubble = false,
  speechText = '',
  customization,
  onAvatarReact,
  className,
  fallback,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [animationClass, setAnimationClass] = useState<string>('');

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Apply animation based on pose
    switch (pose) {
      case 'clap':
        setAnimationClass('animate-clap');
        break;
      case 'nod':
        setAnimationClass('animate-nod');
        break;
      case 'thumbsUp':
        setAnimationClass('animate-thumbs-up');
        break;
      case 'shrug':
        setAnimationClass('animate-shrug');
        break;
      case 'facepalm':
        setAnimationClass('animate-facepalm');
        break;
      case 'crossArms':
        setAnimationClass('animate-cross-arms');
        break;
      case 'wave':
        setAnimationClass('animate-wave');
        break;
      case 'pointing':
        setAnimationClass('animate-pointing');
        break;
      default:
        setAnimationClass('animate-idle');
    }

    if (onAvatarReact) {
      onAvatarReact();
    }
  }, [pose, onAvatarReact]);

  // Calculate avatar dimensions based on size prop
  const getDimensions = () => {
    switch (size) {
      case 'full':
        return { height: '500px', width: '300px' };
      case 'half':
        return { height: '300px', width: '200px' };
      case 'mini':
        return { height: '150px', width: '100px' };
      default:
        return { height: '300px', width: '200px' };
    }
  };

  // Calculate position styles
  const getPositionStyles = () => {
    const baseStyles = {
      position: 'relative' as const,
      zIndex: 10,
    };

    switch (position) {
      case 'left':
        return { ...baseStyles, alignSelf: 'flex-start' };
      case 'right':
        return { ...baseStyles, alignSelf: 'flex-end' };
      case 'center':
        return { ...baseStyles, alignSelf: 'center' };
      default:
        return { ...baseStyles, alignSelf: 'flex-start' };
    }
  };

  const dimensions = getDimensions();
  const positionStyles = getPositionStyles();

  // Get the avatar image based on mood and customization
  const getAvatarImage = () => {
    const moodPrefix = mood || 'neutral';
    const skinTone = customization?.skinTone || 'default';
    const hairStyle = customization?.hairStyle || 'default';
    
    return `/images/avatars/${moodPrefix}_${skinTone}_${hairStyle}.png`;
  };

  // Fallback placeholder if image doesn't exist
  const renderPlaceholderAvatar = () => (
    <div className={cn(
      "flex flex-col items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-4",
      {
        "w-24 h-24": size === 'mini',
        "w-32 h-32": size === 'half',
        "w-40 h-40": size === 'full',
      }
    )}>
      <span className="text-2xl mb-1">
        {mood === 'happy' && "😄"}
        {mood === 'sad' && "😢"}
        {mood === 'stressed' && "😰"}
        {mood === 'excited' && "🤩"}
        {mood === 'thinking' && "🤔"}
        {mood === 'confused' && "😕"}
        {mood === 'surprised' && "😲"}
        {(mood === 'neutral' || !mood) && "😐"}
      </span>
      <span className="text-xs text-center">Avatar</span>
    </div>
  );

  if (isLoading) {
    return (
      <div style={{ ...dimensions, ...positionStyles }} className={className}>
        <div className="w-full h-full flex items-center justify-center rounded-lg bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-white/10">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-10 w-10 rounded-full bg-indigo-500/30 flex items-center justify-center mb-2">
              <div className="h-6 w-6 rounded-full bg-indigo-500 animate-bounce" />
            </div>
            <div className="text-white text-sm">Loading avatar...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="avatar-container" style={{ ...dimensions, ...positionStyles }}>
      <div 
        className={cn(
          "relative w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-white/10",
          className
        )}
      >
        <div className={cn("w-full h-full flex items-center justify-center", animationClass)}>
          {renderPlaceholderAvatar()}
        </div>
        
        {showSpeechBubble && speechText && !isLoading && (
          <SpeechBubble text={speechText} position={position} />
        )}
      </div>
    </div>
  );
};

export default Avatar;
