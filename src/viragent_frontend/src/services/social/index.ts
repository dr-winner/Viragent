import { twitterService, TwitterService } from './twitter';
import { instagramService, InstagramService } from './instagram';
import { linkedinService, LinkedInService } from './linkedin';

export interface SocialPlatform {
  id: string;
  name: string;
  displayName: string;
  color: string;
  icon: string;
  isConnected: boolean;
  service: TwitterService | InstagramService | LinkedInService;
  config: {
    maxTextLength: number;
    supportsImages: boolean;
    supportsVideos: boolean;
    maxHashtags: number;
    optimalHashtags: number;
  };
}

export interface ConnectionStatus {
  platform: string;
  connected: boolean;
  accessToken?: string;
  expiresAt?: number;
  userInfo?: any;
  error?: string;
}

export interface PostContent {
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  hashtags?: string[];
  platform: string;
}

export interface ScheduledPost {
  id: string;
  content: PostContent;
  scheduledAt: Date;
  status: 'scheduled' | 'published' | 'failed';
  platforms: string[];
  error?: string;
}

export class SocialMediaManager {
  private platforms: Map<string, SocialPlatform> = new Map();
  private connections: Map<string, ConnectionStatus> = new Map();

  constructor() {
    this.initializePlatforms();
    this.loadConnectionStatuses();
  }

  private initializePlatforms(): void {
    const platformConfigs: SocialPlatform[] = [
      {
        id: 'twitter',
        name: 'twitter',
        displayName: 'Twitter/X',
        color: '#1DA1F2',
        icon: '🐦',
        isConnected: false,
        service: twitterService,
        config: {
          maxTextLength: 280,
          supportsImages: true,
          supportsVideos: true,
          maxHashtags: 10,
          optimalHashtags: 2
        }
      },
      {
        id: 'instagram',
        name: 'instagram',
        displayName: 'Instagram',
        color: '#E4405F',
        icon: '📷',
        isConnected: false,
        service: instagramService,
        config: {
          maxTextLength: 2200,
          supportsImages: true,
          supportsVideos: true,
          maxHashtags: 30,
          optimalHashtags: 11
        }
      },
      {
        id: 'linkedin',
        name: 'linkedin',
        displayName: 'LinkedIn',
        color: '#0077B5',
        icon: '💼',
        isConnected: false,
        service: linkedinService,
        config: {
          maxTextLength: 3000,
          supportsImages: true,
          supportsVideos: true,
          maxHashtags: 5,
          optimalHashtags: 3
        }
      }
    ];

    platformConfigs.forEach(platform => {
      this.platforms.set(platform.id, platform);
    });
  }

  private loadConnectionStatuses(): void {
    this.platforms.forEach((platform, platformId) => {
      const accessToken = localStorage.getItem(`${platformId}_access_token`);
      const expiresAt = localStorage.getItem(`${platformId}_expires_at`);
      const userInfo = localStorage.getItem(`${platformId}_user_info`);

      const connectionStatus: ConnectionStatus = {
        platform: platformId,
        connected: !!accessToken && (!expiresAt || Date.now() < parseInt(expiresAt)),
        accessToken: accessToken || undefined,
        expiresAt: expiresAt ? parseInt(expiresAt) : undefined,
        userInfo: userInfo ? JSON.parse(userInfo) : undefined
      };

      this.connections.set(platformId, connectionStatus);
      platform.isConnected = connectionStatus.connected;
    });
  }

  // Get all available platforms
  getPlatforms(): SocialPlatform[] {
    return Array.from(this.platforms.values());
  }

  // Get connected platforms only
  getConnectedPlatforms(): SocialPlatform[] {
    return Array.from(this.platforms.values()).filter(p => p.isConnected);
  }

  // Get platform by ID
  getPlatform(platformId: string): SocialPlatform | undefined {
    return this.platforms.get(platformId);
  }

  // Get connection status for a platform
  getConnectionStatus(platformId: string): ConnectionStatus | undefined {
    return this.connections.get(platformId);
  }

  // Initiate OAuth flow for a platform
  async initiateConnection(platformId: string): Promise<string> {
    const platform = this.platforms.get(platformId);
    if (!platform) {
      throw new Error(`Platform ${platformId} not supported`);
    }

    try {
      switch (platformId) {
        case 'twitter':
          const twitterAuth = await (platform.service as TwitterService).generateAuthUrl();
          // Store code verifier and state for later use
          localStorage.setItem('twitter_code_verifier', twitterAuth.codeVerifier);
          localStorage.setItem('twitter_state', twitterAuth.state);
          return twitterAuth.authUrl;

        case 'instagram':
          const instagramAuth = (platform.service as InstagramService).generateAuthUrl();
          localStorage.setItem('instagram_state', instagramAuth.state);
          return instagramAuth.authUrl;

        case 'linkedin':
          const linkedinAuth = (platform.service as LinkedInService).generateAuthUrl();
          localStorage.setItem('linkedin_state', linkedinAuth.state);
          return linkedinAuth.authUrl;

        default:
          throw new Error(`OAuth not implemented for ${platformId}`);
      }
    } catch (error) {
      throw new Error(`Failed to initiate ${platformId} connection: ${error}`);
    }
  }

  // Complete OAuth flow and store credentials
  async completeConnection(
    platformId: string, 
    code: string, 
    state: string
  ): Promise<ConnectionStatus> {
    const platform = this.platforms.get(platformId);
    if (!platform) {
      throw new Error(`Platform ${platformId} not supported`);
    }

    try {
      let tokenResponse: any;
      let userInfo: any;

      switch (platformId) {
        case 'twitter':
          const storedState = localStorage.getItem('twitter_state');
          const codeVerifier = localStorage.getItem('twitter_code_verifier');
          
          if (state !== storedState) {
            throw new Error('Invalid state parameter');
          }
          if (!codeVerifier) {
            throw new Error('Code verifier not found');
          }

          const twitterService = platform.service as TwitterService;
          tokenResponse = await twitterService.exchangeCodeForToken(code, codeVerifier, state);
          userInfo = await twitterService.getUserInfo(tokenResponse.access_token);
          break;

        case 'instagram':
          const instagramState = localStorage.getItem('instagram_state');
          if (state !== instagramState) {
            throw new Error('Invalid state parameter');
          }

          const instagramService = platform.service as InstagramService;
          tokenResponse = await instagramService.exchangeCodeForToken(code);
          // Get long-lived token
          const longLivedToken = await instagramService.getLongLivedToken(tokenResponse.access_token);
          tokenResponse = longLivedToken;
          userInfo = await instagramService.getUserInfo(tokenResponse.access_token);
          break;

        case 'linkedin':
          const linkedinState = localStorage.getItem('linkedin_state');
          if (state !== linkedinState) {
            throw new Error('Invalid state parameter');
          }

          const linkedinService = platform.service as LinkedInService;
          tokenResponse = await linkedinService.exchangeCodeForToken(code);
          userInfo = await linkedinService.getUserInfo(tokenResponse.access_token);
          break;

        default:
          throw new Error(`OAuth completion not implemented for ${platformId}`);
      }

      // Store credentials and user info
      const expiresAt = Date.now() + (tokenResponse.expires_in * 1000);
      
      localStorage.setItem(`${platformId}_access_token`, tokenResponse.access_token);
      localStorage.setItem(`${platformId}_expires_at`, expiresAt.toString());
      localStorage.setItem(`${platformId}_user_info`, JSON.stringify(userInfo));

      if (tokenResponse.refresh_token) {
        localStorage.setItem(`${platformId}_refresh_token`, tokenResponse.refresh_token);
      }

      // Update connection status
      const connectionStatus: ConnectionStatus = {
        platform: platformId,
        connected: true,
        accessToken: tokenResponse.access_token,
        expiresAt: expiresAt,
        userInfo: userInfo
      };

      this.connections.set(platformId, connectionStatus);
      platform.isConnected = true;

      // Clear temporary storage
      localStorage.removeItem(`${platformId}_state`);
      localStorage.removeItem(`${platformId}_code_verifier`);

      return connectionStatus;

    } catch (error) {
      const errorStatus: ConnectionStatus = {
        platform: platformId,
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      this.connections.set(platformId, errorStatus);
      platform.isConnected = false;

      throw new Error(`Failed to complete ${platformId} connection: ${error}`);
    }
  }

  // Disconnect a platform
  async disconnect(platformId: string): Promise<void> {
    const platform = this.platforms.get(platformId);
    if (!platform) {
      throw new Error(`Platform ${platformId} not supported`);
    }

    // Clear stored credentials
    localStorage.removeItem(`${platformId}_access_token`);
    localStorage.removeItem(`${platformId}_refresh_token`);
    localStorage.removeItem(`${platformId}_expires_at`);
    localStorage.removeItem(`${platformId}_user_info`);

    // Update status
    const connectionStatus: ConnectionStatus = {
      platform: platformId,
      connected: false
    };

    this.connections.set(platformId, connectionStatus);
    platform.isConnected = false;
  }

  // Post to a single platform
  async postToPlatform(
    platformId: string, 
    content: PostContent
  ): Promise<any> {
    const platform = this.platforms.get(platformId);
    const connection = this.connections.get(platformId);

    if (!platform || !connection?.connected || !connection.accessToken) {
      throw new Error(`Platform ${platformId} is not connected`);
    }

    try {
      switch (platformId) {
        case 'twitter':
          const twitterService = platform.service as TwitterService;
          return await twitterService.postTweet(connection.accessToken, content.text);

        case 'instagram':
          if (!content.mediaUrl) {
            throw new Error('Instagram posts require media');
          }
          const instagramService = platform.service as InstagramService;
          return await instagramService.createPost(
            connection.accessToken,
            content.mediaUrl,
            content.text,
            content.mediaType === 'video' ? 'VIDEO' : 'IMAGE'
          );

        case 'linkedin':
          const linkedinService = platform.service as LinkedInService;
          const userUrn = linkedinService.getUserUrn(connection.userInfo.id);
          
          if (content.mediaUrl && content.mediaType === 'image') {
            // Convert media URL to blob (simplified - in real app you'd fetch the image)
            const response = await fetch(content.mediaUrl);
            const imageBlob = await response.blob();
            return await linkedinService.createImagePost(
              connection.accessToken,
              content.text,
              imageBlob,
              userUrn
            );
          } else {
            return await linkedinService.createTextPost(
              connection.accessToken,
              content.text,
              userUrn
            );
          }

        default:
          throw new Error(`Posting not implemented for ${platformId}`);
      }
    } catch (error) {
      throw new Error(`Failed to post to ${platformId}: ${error}`);
    }
  }

  // Post to multiple platforms
  async postToMultiplePlatforms(
    platformIds: string[], 
    content: PostContent
  ): Promise<{ platform: string; success: boolean; result?: any; error?: string }[]> {
    const results = await Promise.allSettled(
      platformIds.map(async (platformId) => {
        try {
          const result = await this.postToPlatform(platformId, { ...content, platform: platformId });
          return { platform: platformId, success: true, result };
        } catch (error) {
          return { 
            platform: platformId, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          };
        }
      })
    );

    return results.map((result) => 
      result.status === 'fulfilled' ? result.value : result.value
    );
  }

  // Schedule posts to multiple platforms
  async schedulePosts(
    platformIds: string[],
    content: PostContent,
    scheduledAt: Date
  ): Promise<{ platform: string; success: boolean; result?: any; error?: string }[]> {
    const results = await Promise.allSettled(
      platformIds.map(async (platformId) => {
        try {
          const platform = this.platforms.get(platformId);
          const connection = this.connections.get(platformId);

          if (!platform || !connection?.connected || !connection.accessToken) {
            throw new Error(`Platform ${platformId} is not connected`);
          }

          let result: string;
          switch (platformId) {
            case 'twitter':
              result = await (platform.service as TwitterService).scheduleTweet(
                connection.accessToken,
                content.text,
                scheduledAt
              );
              break;

            case 'instagram':
              if (!content.mediaUrl) {
                throw new Error('Instagram posts require media');
              }
              result = await (platform.service as InstagramService).schedulePost(
                connection.accessToken,
                content.mediaUrl,
                content.text,
                scheduledAt,
                content.mediaType === 'video' ? 'VIDEO' : 'IMAGE'
              );
              break;

            case 'linkedin':
              result = await (platform.service as LinkedInService).schedulePost(
                connection.accessToken,
                content.text,
                scheduledAt
              );
              break;

            default:
              throw new Error(`Scheduling not implemented for ${platformId}`);
          }

          return { platform: platformId, success: true, result };
        } catch (error) {
          return { 
            platform: platformId, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          };
        }
      })
    );

    return results.map((result) => 
      result.status === 'fulfilled' ? result.value : result.value
    );
  }

  // Validate content for platform
  validateContent(platformId: string, content: PostContent): { valid: boolean; warnings: string[]; errors: string[] } {
    const platform = this.platforms.get(platformId);
    if (!platform) {
      return { valid: false, warnings: [], errors: [`Platform ${platformId} not supported`] };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Text length validation
    if (content.text.length > platform.config.maxTextLength) {
      errors.push(`Text exceeds maximum length of ${platform.config.maxTextLength} characters`);
    }

    if (content.text.length === 0) {
      errors.push('Text content cannot be empty');
    }

    // Media validation
    if (platformId === 'instagram' && !content.mediaUrl) {
      errors.push('Instagram posts require media (image or video)');
    }

    if (content.mediaUrl && content.mediaType === 'image' && !platform.config.supportsImages) {
      errors.push(`${platform.displayName} does not support images`);
    }

    if (content.mediaUrl && content.mediaType === 'video' && !platform.config.supportsVideos) {
      errors.push(`${platform.displayName} does not support videos`);
    }

    // Hashtag validation
    const hashtagCount = (content.text.match(/#\w+/g) || []).length;
    if (hashtagCount > platform.config.maxHashtags) {
      errors.push(`Too many hashtags (${hashtagCount}). Maximum allowed: ${platform.config.maxHashtags}`);
    }

    if (hashtagCount > platform.config.optimalHashtags) {
      warnings.push(`Consider reducing hashtags to ${platform.config.optimalHashtags} for optimal engagement`);
    }

    // Platform-specific validations
    if (platformId === 'linkedin') {
      const linkedinService = platform.service as LinkedInService;
      const validation = linkedinService.validatePostContent(content.text);
      warnings.push(...validation.warnings);
    }

    if (platformId === 'instagram') {
      const instagramService = platform.service as InstagramService;
      const validation = instagramService.checkContentGuidelines(content.text);
      warnings.push(...validation.warnings);
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors
    };
  }

  // Get platform-specific recommendations
  getPlatformRecommendations(platformId: string): any {
    const platform = this.platforms.get(platformId);
    if (!platform) {
      return null;
    }

    const baseRecommendations = {
      platform: platform.displayName,
      maxLength: platform.config.maxTextLength,
      optimalHashtags: platform.config.optimalHashtags,
      supportsMedia: platform.config.supportsImages || platform.config.supportsVideos
    };

    switch (platformId) {
      case 'linkedin':
        return {
          ...baseRecommendations,
          tone: 'Professional and informative',
          bestTimes: (platform.service as LinkedInService).getOptimalPostingTimes(),
          tips: [
            'Use industry-relevant hashtags',
            'Include a call-to-action',
            'Share insights or ask questions',
            'Tag relevant people or companies'
          ]
        };

      case 'instagram':
        return {
          ...baseRecommendations,
          tone: 'Visual and engaging',
          tips: [
            'High-quality visuals are essential',
            'Use a mix of popular and niche hashtags',
            'Include location tags when relevant',
            'Post consistently at optimal times'
          ]
        };

      case 'twitter':
        return {
          ...baseRecommendations,
          tone: 'Conversational and timely',
          tips: [
            'Keep it concise and punchy',
            'Use relevant trending hashtags',
            'Include visuals when possible',
            'Engage with replies quickly'
          ]
        };

      default:
        return baseRecommendations;
    }
  }
}

// Export singleton instance
export const socialMediaManager = new SocialMediaManager();
