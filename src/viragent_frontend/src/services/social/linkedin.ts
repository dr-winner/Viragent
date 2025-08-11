import { backendService } from '../backend';

export interface LinkedInConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface LinkedInAuthUrl {
  authUrl: string;
  state: string;
}

export interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope: string;
}

export interface LinkedInUserInfo {
  id: string;
  localizedFirstName: string;
  localizedLastName: string;
  profilePicture?: {
    displayImage: string;
  };
  emailAddress?: string;
}

export interface LinkedInCompanyInfo {
  id: string;
  localizedName: string;
  description: {
    localized: Record<string, string>;
  };
  logoV2?: {
    original: string;
  };
  followersCount?: number;
}

export interface LinkedInPostResponse {
  id: string;
  lifecycleState: string;
  created: {
    time: number;
  };
}

export interface LinkedInMediaUploadResponse {
  value: {
    uploadMechanism: {
      'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest': {
        uploadUrl: string;
        headers: Record<string, string>;
      };
    };
    mediaArtifact: string;
    asset: string;
  };
}

export class LinkedInService {
  private config: LinkedInConfig;
  
  constructor(config: LinkedInConfig) {
    this.config = config;
  }

  // Generate LinkedIn OAuth authorization URL
  generateAuthUrl(): LinkedInAuthUrl {
    const state = this.generateState();
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      state: state,
      scope: 'w_member_social,r_liteprofile,r_emailaddress'
    });

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
    
    return {
      authUrl,
      state
    };
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string): Promise<LinkedInTokenResponse> {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LinkedIn token exchange failed: ${error}`);
    }

    return response.json();
  }

  // Get user profile information
  async getUserInfo(accessToken: string): Promise<LinkedInUserInfo> {
    const response = await fetch('https://api.linkedin.com/v2/people/~:(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get LinkedIn user info: ${error}`);
    }

    return response.json();
  }

  // Get user's email address
  async getUserEmail(accessToken: string): Promise<string> {
    const response = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get LinkedIn user email: ${error}`);
    }

    const data = await response.json();
    return data.elements[0]['handle~'].emailAddress;
  }

  // Create a text post on LinkedIn
  async createTextPost(
    accessToken: string, 
    text: string, 
    userUrn: string
  ): Promise<LinkedInPostResponse> {
    const payload = {
      author: userUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: text
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create LinkedIn post: ${error}`);
    }

    return response.json();
  }

  // Upload image to LinkedIn
  async uploadImage(accessToken: string, imageBlob: Blob, userUrn: string): Promise<string> {
    // Step 1: Register upload
    const registerPayload = {
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        owner: userUrn,
        serviceRelationships: [
          {
            relationshipType: 'OWNER',
            identifier: 'urn:li:userGeneratedContent'
          }
        ]
      }
    };

    const registerResponse = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registerPayload)
    });

    if (!registerResponse.ok) {
      const error = await registerResponse.text();
      throw new Error(`Failed to register LinkedIn image upload: ${error}`);
    }

    const registerData: LinkedInMediaUploadResponse = await registerResponse.json();
    const uploadUrl = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
    const assetUrn = registerData.value.asset;

    // Step 2: Upload image
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: imageBlob
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload image to LinkedIn');
    }

    return assetUrn;
  }

  // Create a post with image on LinkedIn
  async createImagePost(
    accessToken: string, 
    text: string, 
    imageBlob: Blob,
    userUrn: string
  ): Promise<LinkedInPostResponse> {
    try {
      // Upload image first
      const assetUrn = await this.uploadImage(accessToken, imageBlob, userUrn);

      const payload = {
        author: userUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: text
            },
            shareMediaCategory: 'IMAGE',
            media: [
              {
                status: 'READY',
                description: {
                  text: 'Image description'
                },
                media: assetUrn,
                title: {
                  text: 'Image'
                }
              }
            ]
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create LinkedIn image post: ${error}`);
      }

      return response.json();
    } catch (error) {
      throw new Error(`Failed to create LinkedIn image post: ${error}`);
    }
  }

  // Get user's posts
  async getUserPosts(accessToken: string, userUrn: string, count: number = 20): Promise<any[]> {
    const params = new URLSearchParams({
      q: 'authors',
      authors: userUrn,
      count: count.toString(),
      sortBy: 'CREATED'
    });

    const response = await fetch(`https://api.linkedin.com/v2/ugcPosts?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get LinkedIn user posts: ${error}`);
    }

    const data = await response.json();
    return data.elements;
  }

  // Schedule a LinkedIn post via backend
  async schedulePost(
    accessToken: string, 
    text: string,
    scheduledAt: Date,
    imageBlob?: Blob
  ): Promise<string> {
    try {
      const post = {
        id: `linkedin_${Date.now()}`,
        mediaId: '', // Will be updated when media integration is complete
        platform: 'linkedin',
        scheduledAt: scheduledAt.getTime(),
        status: 'scheduled'
      };

      const result = await backendService.schedulePost(post);

      if (result.success) {
        return result.data;
      } else {
        const errorMsg = 'error' in result ? result.error : 'Failed to schedule LinkedIn post';
        throw new Error(errorMsg);
      }
    } catch (error) {
      throw new Error(`Failed to schedule LinkedIn post: ${error}`);
    }
  }

  // Helper method to get user URN format
  getUserUrn(userId: string): string {
    return `urn:li:person:${userId}`;
  }

  // Helper method to generate state
  private generateState(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)));
  }

  // Validate LinkedIn post content
  validatePostContent(text: string): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    if (text.length > 3000) {
      warnings.push('Post exceeds LinkedIn\'s 3,000 character limit');
    }

    if (text.length < 10) {
      warnings.push('Post is too short - LinkedIn posts should be at least 10 characters');
    }

    // Check for excessive hashtags
    const hashtagCount = (text.match(/#\w+/g) || []).length;
    if (hashtagCount > 5) {
      warnings.push('LinkedIn posts perform better with 3-5 hashtags maximum');
    }

    // Check for professional tone (basic check)
    const unprofessionalWords = ['amazing', 'awesome', 'killer', 'insane'];
    const hasUnprofessionalWords = unprofessionalWords.some(word => 
      text.toLowerCase().includes(word.toLowerCase())
    );
    
    if (hasUnprofessionalWords) {
      warnings.push('Consider using more professional language for LinkedIn');
    }

    return {
      valid: warnings.length === 0,
      warnings
    };
  }

  // Get optimal posting times for LinkedIn
  getOptimalPostingTimes(): { day: string; times: string[] }[] {
    return [
      { day: 'Tuesday', times: ['10:00', '11:00', '14:00'] },
      { day: 'Wednesday', times: ['09:00', '10:00', '15:00'] },
      { day: 'Thursday', times: ['10:00', '11:00', '13:00'] },
      { day: 'Friday', times: ['09:00', '11:00'] }
    ];
  }
}

// LinkedIn service configuration
export const linkedinConfig: LinkedInConfig = {
  clientId: import.meta.env.VITE_LINKEDIN_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_LINKEDIN_CLIENT_SECRET || '',
  redirectUri: import.meta.env.VITE_LINKEDIN_REDIRECT_URI || `${window.location.origin}/auth/linkedin/callback`
};

export const linkedinService = new LinkedInService(linkedinConfig);
