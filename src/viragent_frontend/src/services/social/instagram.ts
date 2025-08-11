import { backendService } from '../backend';

export interface InstagramConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface InstagramAuthUrl {
  authUrl: string;
  state: string;
}

export interface InstagramTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface InstagramUserInfo {
  id: string;
  username: string;
  media_count: number;
  followers_count: number;
  follows_count: number;
  profile_picture_url?: string;
  biography?: string;
  website?: string;
}

export interface InstagramMediaResponse {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  permalink: string;
  caption?: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

export interface InstagramPostResponse {
  id: string;
  media_type: string;
}

export class InstagramService {
  private config: InstagramConfig;
  
  constructor(config: InstagramConfig) {
    this.config = config;
  }

  // Generate Instagram OAuth authorization URL
  generateAuthUrl(): InstagramAuthUrl {
    const state = this.generateState();
    
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: 'user_profile,user_media,instagram_basic,instagram_content_publish',
      response_type: 'code',
      state: state
    });

    const authUrl = `https://api.instagram.com/oauth/authorize?${params.toString()}`;
    
    return {
      authUrl,
      state
    };
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string): Promise<InstagramTokenResponse> {
    const formData = new FormData();
    formData.append('client_id', this.config.clientId);
    formData.append('client_secret', this.config.clientSecret);
    formData.append('grant_type', 'authorization_code');
    formData.append('redirect_uri', this.config.redirectUri);
    formData.append('code', code);

    const response = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Instagram token exchange failed: ${error}`);
    }

    return response.json();
  }

  // Exchange short-lived token for long-lived token
  async getLongLivedToken(accessToken: string): Promise<InstagramTokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'ig_exchange_token',
      client_secret: this.config.clientSecret,
      access_token: accessToken
    });

    const response = await fetch(`https://graph.instagram.com/access_token?${params.toString()}`);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Instagram long-lived token exchange failed: ${error}`);
    }

    return response.json();
  }

  // Get user information
  async getUserInfo(accessToken: string): Promise<InstagramUserInfo> {
    const fields = 'id,username,media_count,followers_count,follows_count,profile_picture_url,biography,website';
    const response = await fetch(`https://graph.instagram.com/me?fields=${fields}&access_token=${accessToken}`);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get Instagram user info: ${error}`);
    }

    return response.json();
  }

  // Upload media to Instagram (single image or video)
  async uploadMedia(
    accessToken: string, 
    mediaUrl: string, 
    caption?: string,
    mediaType: 'IMAGE' | 'VIDEO' = 'IMAGE'
  ): Promise<string> {
    const params = new URLSearchParams({
      access_token: accessToken,
      image_url: mediaType === 'IMAGE' ? mediaUrl : undefined,
      video_url: mediaType === 'VIDEO' ? mediaUrl : undefined,
      media_type: mediaType,
      caption: caption || ''
    } as any);

    // Remove undefined values
    Object.keys(params).forEach(key => {
      if (params.get(key) === 'undefined') {
        params.delete(key);
      }
    });

    const response = await fetch('https://graph.instagram.com/me/media', {
      method: 'POST',
      body: params
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to upload media to Instagram: ${error}`);
    }

    const data = await response.json();
    return data.id; // Container ID
  }

  // Publish uploaded media
  async publishMedia(accessToken: string, containerId: string): Promise<InstagramPostResponse> {
    const params = new URLSearchParams({
      access_token: accessToken,
      creation_id: containerId
    });

    const response = await fetch('https://graph.instagram.com/me/media_publish', {
      method: 'POST',
      body: params
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to publish Instagram media: ${error}`);
    }

    return response.json();
  }

  // Create and publish Instagram post in one step
  async createPost(
    accessToken: string, 
    mediaUrl: string, 
    caption?: string,
    mediaType: 'IMAGE' | 'VIDEO' = 'IMAGE'
  ): Promise<InstagramPostResponse> {
    try {
      // Step 1: Upload media and get container ID
      const containerId = await this.uploadMedia(accessToken, mediaUrl, caption, mediaType);
      
      // Step 2: Publish the media
      return await this.publishMedia(accessToken, containerId);
    } catch (error) {
      throw new Error(`Failed to create Instagram post: ${error}`);
    }
  }

  // Get user's media
  async getUserMedia(accessToken: string, limit: number = 25): Promise<InstagramMediaResponse[]> {
    const fields = 'id,media_type,media_url,permalink,caption,timestamp,like_count,comments_count';
    const params = new URLSearchParams({
      fields: fields,
      limit: limit.toString(),
      access_token: accessToken
    });

    const response = await fetch(`https://graph.instagram.com/me/media?${params.toString()}`);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get Instagram user media: ${error}`);
    }

    const data = await response.json();
    return data.data;
  }

  // Schedule an Instagram post via backend
  async schedulePost(
    accessToken: string, 
    mediaUrl: string,
    caption: string,
    scheduledAt: Date,
    mediaType: 'IMAGE' | 'VIDEO' = 'IMAGE'
  ): Promise<string> {
    try {
      const post = {
        id: `instagram_${Date.now()}`,
        mediaId: '', // Will be updated when media integration is complete
        platform: 'instagram',
        scheduledAt: scheduledAt.getTime(),
        status: 'scheduled'
      };

      const result = await backendService.schedulePost(post);

      if (result.success) {
        return result.data;
      } else {
        const errorMsg = 'error' in result ? result.error : 'Failed to schedule Instagram post';
        throw new Error(errorMsg);
      }
    } catch (error) {
      throw new Error(`Failed to schedule Instagram post: ${error}`);
    }
  }

  // Helper method to generate state
  private generateState(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)));
  }

  // Validate Instagram media URL
  validateMediaUrl(url: string, mediaType: 'IMAGE' | 'VIDEO'): boolean {
    if (!url || typeof url !== 'string') return false;
    
    try {
      new URL(url); // Validate URL format
    } catch {
      return false;
    }

    if (mediaType === 'IMAGE') {
      return /\.(jpg|jpeg|png|webp)$/i.test(url);
    } else if (mediaType === 'VIDEO') {
      return /\.(mp4|mov|avi)$/i.test(url);
    }

    return false;
  }

  // Check Instagram content guidelines
  checkContentGuidelines(caption: string): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    if (caption.length > 2200) {
      warnings.push('Caption exceeds Instagram\'s 2,200 character limit');
    }

    const hashtagCount = (caption.match(/#\w+/g) || []).length;
    if (hashtagCount > 30) {
      warnings.push('Instagram recommends using no more than 30 hashtags per post');
    }

    // Add more content guidelines as needed
    const spamWords = ['follow4follow', 'like4like', 'f4f', 'l4l'];
    const hasSpamWords = spamWords.some(word => 
      caption.toLowerCase().includes(word.toLowerCase())
    );
    
    if (hasSpamWords) {
      warnings.push('Caption contains words that might be flagged as spam');
    }

    return {
      valid: warnings.length === 0,
      warnings
    };
  }
}

// Instagram service configuration
export const instagramConfig: InstagramConfig = {
  clientId: import.meta.env.VITE_INSTAGRAM_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_INSTAGRAM_CLIENT_SECRET || '',
  redirectUri: import.meta.env.VITE_INSTAGRAM_REDIRECT_URI || `${window.location.origin}/auth/instagram/callback`
};

export const instagramService = new InstagramService(instagramConfig);
