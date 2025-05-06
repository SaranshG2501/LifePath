
import { CustomizationOption } from './AvatarTypes';

// Skin tone options
export const SKIN_TONES: CustomizationOption[] = [
  { id: 'default', name: 'Default', value: '#FFDBAC' },
  { id: 'fair', name: 'Fair', value: '#F1C27D' },
  { id: 'medium', name: 'Medium', value: '#E0AC69' },
  { id: 'olive', name: 'Olive', value: '#C68642' },
  { id: 'brown', name: 'Brown', value: '#8D5524' },
  { id: 'dark', name: 'Dark', value: '#603813' },
];

// Hair style options
export const HAIR_STYLES: CustomizationOption[] = [
  { id: 'short', name: 'Short' },
  { id: 'medium', name: 'Medium' },
  { id: 'long', name: 'Long' },
  { id: 'curly', name: 'Curly' },
  { id: 'afro', name: 'Afro' },
  { id: 'buzz', name: 'Buzz Cut' },
];

// Outfit options
export const OUTFITS: CustomizationOption[] = [
  { id: 'casual', name: 'Casual' },
  { id: 'sporty', name: 'Sporty' },
  { id: 'formal', name: 'Formal' },
  { id: 'school', name: 'School' },
  { id: 'creative', name: 'Creative' },
  { id: 'tech', name: 'Tech' },
];

// Accessories options
export const ACCESSORIES: CustomizationOption[] = [
  { id: 'glasses', name: 'Glasses' },
  { id: 'hat', name: 'Hat' },
  { id: 'earrings', name: 'Earrings' },
  { id: 'backpack', name: 'Backpack' },
  { id: 'badge', name: 'Badge' },
  { id: 'watch', name: 'Watch' },
];

// Mood options
export const MOODS: CustomizationOption[] = [
  { id: 'happy', name: 'Happy', emoji: '😄' },
  { id: 'sad', name: 'Sad', emoji: '😢' },
  { id: 'stressed', name: 'Stressed', emoji: '😰' },
  { id: 'excited', name: 'Excited', emoji: '🤩' },
  { id: 'thinking', name: 'Thinking', emoji: '🤔' },
  { id: 'confused', name: 'Confused', emoji: '😕' },
  { id: 'surprised', name: 'Surprised', emoji: '😲' },
  { id: 'neutral', name: 'Neutral', emoji: '😐' },
];

// Pose options
export const POSES: CustomizationOption[] = [
  { id: 'idle', name: 'Idle', emoji: '🧍' },
  { id: 'wave', name: 'Wave', emoji: '👋' },
  { id: 'clap', name: 'Clap', emoji: '👏' },
  { id: 'thumbsUp', name: 'Thumbs Up', emoji: '👍' },
  { id: 'shrug', name: 'Shrug', emoji: '🤷' },
  { id: 'pointing', name: 'Pointing', emoji: '👉' },
  { id: 'crossArms', name: 'Cross Arms', emoji: '🙅' },
  { id: 'facepalm', name: 'Facepalm', emoji: '🤦' },
  { id: 'nod', name: 'Nod', emoji: '🙂' },
];
