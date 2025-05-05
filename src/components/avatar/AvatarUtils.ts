
import { CustomizationOption } from './AvatarTypes';

// Skin tone options
export const SKIN_TONES: CustomizationOption[] = [
  { id: 'tone1', name: 'Light', value: '#FFDBAC' },
  { id: 'tone2', name: 'Fair', value: '#F1C27D' },
  { id: 'tone3', name: 'Medium', value: '#E0AC69' },
  { id: 'tone4', name: 'Olive', value: '#C68642' },
  { id: 'tone5', name: 'Brown', value: '#8D5524' },
  { id: 'tone6', name: 'Dark', value: '#603813' },
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
];

// Facial expression parameters (morph targets)
export const EMOTION_PARAMETERS: Record<string, Record<string, number>> = {
  happy: {
    smileLeft: 1,
    smileRight: 1,
    eyesClosed: 0.2,
    eyebrowsRaised: 0.5
  },
  sad: {
    frownLeft: 0.7,
    frownRight: 0.7,
    eyebrowsDown: 0.5
  },
  stressed: {
    eyebrowsDown: 0.8,
    mouthTight: 0.6,
    eyesClosed: 0.3
  },
  excited: {
    smileLeft: 1,
    smileRight: 1,
    eyebrowsRaised: 1,
    mouthOpen: 0.3
  },
  thinking: {
    eyebrowsRaised: 0.3,
    mouthTight: 0.2,
    eyesClosed: 0.1
  },
  confused: {
    eyebrowsRaised: 0.5,
    eyebrowsDown: 0.3,
    frownLeft: 0.3
  },
  surprised: {
    eyebrowsRaised: 1,
    mouthOpen: 0.7,
    eyesWide: 0.8
  },
  neutral: {
    // All values at 0 (default state)
  }
};

// Mapping from pose names to animation names
export const POSE_ANIMATIONS: Record<string, string> = {
  idle: 'Idle',
  wave: 'Wave',
  clap: 'Clapping',
  thumbsUp: 'ThumbsUp',
  shrug: 'Shrug',
  pointing: 'Pointing',
  crossArms: 'CrossArms',
  facepalm: 'Facepalm',
  nod: 'Nodding'
};
