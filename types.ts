export enum ImageSize {
  YOUTUBE = '1920x1080',
  REELS = '1080x1920',
}

export interface ThumbnailConfig {
  pose: string;
  style: string;
  cameraAngle: string;
  emotion: string;
  lighting: string;
  background: string;
  selectedSize: ImageSize;
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