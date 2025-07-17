import { Actor, HttpAgent, Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { 
  _SERVICE as BackendService,
  idlFactory,
  MediaItem as BackendMediaItem,
  ToneConfig as BackendToneConfig,
  ScheduledPost as BackendScheduledPost,
  AIOutput as BackendAIOutput,
  EngagementData as BackendEngagementData,
} from '../../../declarations/viragent_backend';
import { 
  MediaItem, 
  ToneConfig, 
  ScheduledPost, 
  AIOutput, 
  EngagementData, 
  SystemStats, 
  HealthStatus,
  ApiResult 
} from '../types/backend';

class ViragentBackendService {
  private actor: BackendService | null = null;
  private agent: HttpAgent | null = null;

  // Initialize the service with identity
  async init(identity: Identity): Promise<void> {
    const host = process.env.NODE_ENV === 'production' 
      ? 'https://ic0.app' 
      : 'http://localhost:4943';

    this.agent = new HttpAgent({ 
      host,
      identity 
    });

    // Fetch root key for local development
    if (process.env.NODE_ENV === 'development') {
      await this.agent.fetchRootKey();
    }

    // Get the canister ID from environment or dfx
    const canisterId = process.env.VITE_VIRAGENT_BACKEND_CANISTER_ID || 
                      process.env.CANISTER_ID_VIRAGENT_BACKEND ||
                      'rrkah-fqaaa-aaaaa-aaaaq-cai'; // default local canister ID

    this.actor = Actor.createActor<BackendService>(idlFactory, {
      agent: this.agent,
      canisterId,
    });
  }

  private ensureActor(): BackendService {
    if (!this.actor) {
      throw new Error('Backend service not initialized. Call init() first.');
    }
    return this.actor;
  }

  // Helper function to convert BigInt to number
  private bigIntToNumber(value: bigint): number {
    return Number(value);
  }

  // Helper function to convert backend types to frontend types
  private convertMediaItem(item: BackendMediaItem): MediaItem {
    return {
      id: item.id,
      owner: item.owner.toString(),
      url: item.url,
      mediaType: item.mediaType,
      status: item.status,
      createdAt: this.bigIntToNumber(item.createdAt),
    };
  }

  private convertScheduledPost(post: BackendScheduledPost): ScheduledPost {
    return {
      id: post.id,
      mediaId: post.mediaId,
      platform: post.platform,
      scheduledAt: this.bigIntToNumber(post.scheduledAt),
      status: post.status,
    };
  }

  private convertAIOutput(output: BackendAIOutput): AIOutput {
    return {
      mediaId: output.mediaId,
      caption: output.caption,
      hashtags: output.hashtags,
      score: output.score,
      generatedAt: this.bigIntToNumber(output.generatedAt),
    };
  }

  private convertEngagementData(data: BackendEngagementData): EngagementData {
    return {
      postId: data.postId,
      likes: this.bigIntToNumber(data.likes),
      shares: this.bigIntToNumber(data.shares),
      comments: this.bigIntToNumber(data.comments),
      reach: this.bigIntToNumber(data.reach),
      sentimentScore: data.sentimentScore,
      timestamp: this.bigIntToNumber(data.timestamp),
    };
  }

  // Convert frontend types to backend types
  private convertToBackendMediaItem(item: MediaItem): BackendMediaItem {
    return {
      id: item.id,
      owner: Principal.fromText(item.owner),
      url: item.url,
      mediaType: item.mediaType,
      status: item.status,
      createdAt: BigInt(item.createdAt),
    };
  }

  private convertToBackendScheduledPost(post: ScheduledPost): BackendScheduledPost {
    return {
      id: post.id,
      mediaId: post.mediaId,
      platform: post.platform,
      scheduledAt: BigInt(post.scheduledAt),
      status: post.status,
    };
  }

  private convertToBackendAIOutput(output: AIOutput): BackendAIOutput {
    return {
      mediaId: output.mediaId,
      caption: output.caption,
      hashtags: output.hashtags,
      score: output.score,
      generatedAt: BigInt(output.generatedAt),
    };
  }

  private convertToBackendEngagementData(data: EngagementData): BackendEngagementData {
    return {
      postId: data.postId,
      likes: BigInt(data.likes),
      shares: BigInt(data.shares),
      comments: BigInt(data.comments),
      reach: BigInt(data.reach),
      sentimentScore: data.sentimentScore,
      timestamp: BigInt(data.timestamp),
    };
  }

  // API Methods

  // User Management
  // Auto-register user with Internet Identity (no email required)
  async autoRegister(): Promise<ApiResult<string>> {
    try {
      const actor = this.getActor();
      const result = await actor.register();
      return { success: true, data: result };
    } catch (error) {
      console.error('Auto-registration failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Auto-registration failed' };
    }
  }

  // Legacy register method for backward compatibility
  async register(): Promise<ApiResult<string>> {
    return this.autoRegister();
  }

  async getProfile(): Promise<ApiResult<string | null>> {
    try {
      const actor = this.ensureActor();
      const result = await actor.getProfile();
      return { success: true, data: result.length > 0 ? result[0] : null };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async isRegistered(): Promise<ApiResult<boolean>> {
    try {
      const actor = this.ensureActor();
      const result = await actor.isRegistered();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // Media Management
  async uploadMedia(item: MediaItem): Promise<ApiResult<string>> {
    try {
      const actor = this.ensureActor();
      const backendItem = this.convertToBackendMediaItem(item);
      const result = await actor.uploadMedia(backendItem);
      
      if ('ok' in result) {
        return { success: true, data: result.ok };
      } else {
        return { success: false, error: result.err };
      }
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getMedia(id: string): Promise<ApiResult<MediaItem | null>> {
    try {
      const actor = this.ensureActor();
      const result = await actor.getMedia(id);
      const data = result.length > 0 ? this.convertMediaItem(result[0]) : null;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getUserMedia(): Promise<ApiResult<MediaItem[]>> {
    try {
      const actor = this.ensureActor();
      const result = await actor.getUserMedia();
      const data = result.map(item => this.convertMediaItem(item));
      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async updateMediaStatus(id: string, status: string): Promise<ApiResult<string>> {
    try {
      const actor = this.ensureActor();
      const result = await actor.updateMediaStatus(id, status);
      
      if ('ok' in result) {
        return { success: true, data: result.ok };
      } else {
        return { success: false, error: result.err };
      }
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // Tone Configuration
  async setTone(tone: ToneConfig): Promise<ApiResult<string>> {
    try {
      const actor = this.ensureActor();
      const result = await actor.setTone(tone);
      
      if ('ok' in result) {
        return { success: true, data: result.ok };
      } else {
        return { success: false, error: result.err };
      }
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getTone(id: string): Promise<ApiResult<ToneConfig | null>> {
    try {
      const actor = this.ensureActor();
      const result = await actor.getTone(id);
      const data = result.length > 0 ? result[0] : null;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getAllTones(): Promise<ApiResult<ToneConfig[]>> {
    try {
      const actor = this.ensureActor();
      const result = await actor.getAllTones();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // AI Output Management
  async generateOutput(output: AIOutput): Promise<ApiResult<string>> {
    try {
      const actor = this.ensureActor();
      const backendOutput = this.convertToBackendAIOutput(output);
      const result = await actor.generateOutput(backendOutput);
      
      if ('ok' in result) {
        return { success: true, data: result.ok };
      } else {
        return { success: false, error: result.err };
      }
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getOutput(mediaId: string): Promise<ApiResult<AIOutput | null>> {
    try {
      const actor = this.ensureActor();
      const result = await actor.getOutput(mediaId);
      const data = result.length > 0 ? this.convertAIOutput(result[0]) : null;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // Scheduling
  async schedulePost(post: ScheduledPost): Promise<ApiResult<string>> {
    try {
      const actor = this.ensureActor();
      const backendPost = this.convertToBackendScheduledPost(post);
      const result = await actor.schedulePost(backendPost);
      
      if ('ok' in result) {
        return { success: true, data: result.ok };
      } else {
        return { success: false, error: result.err };
      }
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getScheduledPosts(): Promise<ApiResult<ScheduledPost[]>> {
    try {
      const actor = this.ensureActor();
      const result = await actor.getScheduledPosts();
      const data = result.map(post => this.convertScheduledPost(post));
      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async cancelPost(postId: string): Promise<ApiResult<string>> {
    try {
      const actor = this.ensureActor();
      const result = await actor.cancelPost(postId);
      
      if ('ok' in result) {
        return { success: true, data: result.ok };
      } else {
        return { success: false, error: result.err };
      }
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // Analytics
  async addMetrics(postId: string, data: EngagementData): Promise<ApiResult<string>> {
    try {
      const actor = this.ensureActor();
      const backendData = this.convertToBackendEngagementData(data);
      const result = await actor.addMetrics(postId, backendData);
      
      if ('ok' in result) {
        return { success: true, data: result.ok };
      } else {
        return { success: false, error: result.err };
      }
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getMetrics(postId: string): Promise<ApiResult<EngagementData[] | null>> {
    try {
      const actor = this.ensureActor();
      const result = await actor.getMetrics(postId);
      const data = result.length > 0 ? result[0].map(item => this.convertEngagementData(item)) : null;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // System
  async getSystemStats(): Promise<ApiResult<SystemStats>> {
    try {
      const actor = this.ensureActor();
      const result = await actor.getSystemStats();
      const data: SystemStats = {
        totalUsers: this.bigIntToNumber(result.totalUsers),
        totalMedia: this.bigIntToNumber(result.totalMedia),
        totalScheduledPosts: this.bigIntToNumber(result.totalScheduledPosts),
        totalTones: this.bigIntToNumber(result.totalTones),
      };
      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getHealth(): Promise<ApiResult<HealthStatus>> {
    try {
      const actor = this.ensureActor();
      const result = await actor.health();
      const data: HealthStatus = {
        status: result.status,
        time: this.bigIntToNumber(result.time),
      };
      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async initBackend(): Promise<ApiResult<string>> {
    try {
      const actor = this.ensureActor();
      const result = await actor.init();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}

// Export singleton instance
export const backendService = new ViragentBackendService();
