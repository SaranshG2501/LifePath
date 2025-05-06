
export interface AvatarCustomization {
  skinTone?: string;
  hairStyle?: string;
  outfit?: string;
  accessories?: string[];
}

export interface CustomizationOption {
  id: string;
  name: string;
  value?: string;
  emoji?: string;
}

// Add new interfaces for avatar reactions
export interface AvatarReaction {
  mood: string;
  gesture: string;
  text?: string;
}

export interface AvatarConfig {
  stage: 'onboarding' | 'story' | 'reflection';
  size: 'full' | 'half' | 'mini';
  position: 'left' | 'right' | 'center' | 'fullscreen';
}
