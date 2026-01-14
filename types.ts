export enum ImageSize {
  YOUTUBE = '1920x1080',
  REELS = '1080x1920',
}

export enum GenerationTab {
  YOUTUBE = 'YOUTUBE',
  REELS_PRO = 'REELS_PRO',
}

export interface ThumbnailConfig {
  pose: string;
  style: string;
  cameraAngle: string;
  emotion: string;
  lighting: string;
  background: string;
  selectedSize: ImageSize;
  icons?: string; // New field for the Reel Pro tab
}

export interface GeneratedImage {
  id: string;
  url: string;
  size: ImageSize;
  prompt: string;
  timestamp: number;
}

export interface ReferenceImage {
  id: string;
  data: string; // Base64
  mimeType: string;
}