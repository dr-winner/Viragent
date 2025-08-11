import { backendService } from '../backend';

export interface TwitterConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface TwitterAuthUrl {
  authUrl: string;
  codeVerifier: string;
  state: string;
}

export interface TwitterTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export interface TwitterUserInfo {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
}

export interface TwitterPostResponse {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  public_metrics?: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
    quote_count: number;
  };
}

export class TwitterService {
  private config: TwitterConfig;
  
  constructor(config: TwitterConfig) {
    this.config = config;
  }

  // Generate Twitter OAuth 2.0 authorization URL with PKCE
  async generateAuthUrl(): Promise<TwitterAuthUrl> {
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    const state = this.generateState();
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: 'tweet.read tweet.write users.read follows.read offline.access',
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });

    const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
    
    return {
      authUrl,
      codeVerifier,
      state
    };
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(
    code: string, 
    codeVerifier: string,
    state: string
  ): Promise<TwitterTokenResponse> {
    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${this.config.clientId}:${this.config.clientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.config.redirectUri,
        code_verifier: codeVerifier,
        client_id: this.config.clientId
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Twitter token exchange failed: ${error}`);
    }

    return response.json();
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<TwitterTokenResponse> {
    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${this.config.clientId}:${this.config.clientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.config.clientId
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Twitter token refresh failed: ${error}`);
    }

    return response.json();
  }

  // Get user information
  async getUserInfo(accessToken: string): Promise<TwitterUserInfo> {
    const response = await fetch('https://api.twitter.com/2/users/me?user.fields=name,username,profile_image_url,public_metrics', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get Twitter user info: ${error}`);
    }

    const data = await response.json();
    return data.data;
  }

  // Post a tweet
  async postTweet(accessToken: string, content: string, mediaIds?: string[]): Promise<TwitterPostResponse> {
    const payload: any = {
      text: content
    };

    if (mediaIds && mediaIds.length > 0) {
      payload.media = {
        media_ids: mediaIds
      };
    }

    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to post tweet: ${error}`);
    }

    const data = await response.json();
    return data.data;
  }

  // Upload media (images, videos) to Twitter
  async uploadMedia(accessToken: string, mediaData: Blob, mediaType: string): Promise<string> {
    const formData = new FormData();
    formData.append('media', mediaData);
    formData.append('media_category', this.getMediaCategory(mediaType));

    const response = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to upload media to Twitter: ${error}`);
    }

    const data = await response.json();
    return data.media_id_string;
  }

  // Schedule a tweet via backend
  async scheduleTweet(
    accessToken: string, 
    content: string, 
    scheduledAt: Date,
    mediaIds?: string[]
  ): Promise<string> {
    try {
      // For now, call the existing schedulePost method with Twitter platform
      const post = {
        id: `twitter_${Date.now()}`,
        mediaId: '', // Will be updated when media integration is complete
        platform: 'twitter',
        scheduledAt: scheduledAt.getTime(),
        status: 'scheduled'
      };

      const result = await backendService.schedulePost(post);

      if (result.success) {
        return result.data;
      } else {
        const errorMsg = 'error' in result ? result.error : 'Failed to schedule tweet';
        throw new Error(errorMsg);
      }
    } catch (error) {
      throw new Error(`Failed to schedule tweet: ${error}`);
    }
  }

  // Helper methods
  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private async generateCodeChallenge(codeVerifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const bytes = new Uint8Array(digest);
    return btoa(String.fromCharCode.apply(null, Array.from(bytes)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private generateState(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)));
  }

  private getMediaCategory(mediaType: string): string {
    if (mediaType.startsWith('image/')) return 'tweet_image';
    if (mediaType.startsWith('video/')) return 'tweet_video';
    if (mediaType.startsWith('audio/')) return 'tweet_gif';
    return 'tweet_image';
  }
}

// Twitter service configuration
export const twitterConfig: TwitterConfig = {
  clientId: import.meta.env.VITE_TWITTER_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_TWITTER_CLIENT_SECRET || '',
  redirectUri: import.meta.env.VITE_TWITTER_REDIRECT_URI || `${window.location.origin}/auth/twitter/callback`
};

export const twitterService = new TwitterService(twitterConfig);
