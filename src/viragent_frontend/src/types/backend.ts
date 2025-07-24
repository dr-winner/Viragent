// Frontend types that mirror the backend types
export type MediaId = string;
export type PostId = string;
export type ToneId = string;

export interface MediaItem {
  id: MediaId;
  owner: string; // Principal as string
  url: string;
  mediaType: string;
  status: string;
  createdAt: number; // Convert from bigint
}

export interface ToneConfig {
  id: ToneId;
  name: string;
  configJson: string;
}

export interface ScheduledPost {
  id: PostId;
  mediaId: MediaId;
  platform: string;
  scheduledAt: number; // Convert from bigint
  status: string;
}

export interface AIOutput {
  mediaId: MediaId;
  caption: string;
  hashtags: string[];
  score: number;
  generatedAt: number; // Convert from bigint
}

export interface EngagementData {
  postId: PostId;
  likes: number; // Convert from bigint
  shares: number; // Convert from bigint
  comments: number; // Convert from bigint
  reach: number; // Convert from bigint
  sentimentScore: number;
  timestamp: number; // Convert from bigint
}

export interface UserProfile {
  principal: string; // Principal as string
  registeredAt: number; // Convert from bigint
}

export type AIProvider = 'OpenAI' | 'GitHub' | 'Claude';

export interface PlatformRecommendations {
  maxCaptionLength: number;
  optimalHashtagCount: number;
  bestTones: string[];
  features: string[];
}

export interface SystemStats {
  totalUsers: number;
  totalMedia: number;
  totalScheduledPosts: number;
  totalTones: number;
}

export interface HealthStatus {
  status: string;
  time: number;
}

// API Response types
export type ApiResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};
