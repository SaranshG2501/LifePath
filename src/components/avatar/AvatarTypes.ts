
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
