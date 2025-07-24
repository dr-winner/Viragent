import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { AuthClient } from '@dfinity/auth-client';
import { viragentCrypto } from './vetkeys';

// Import the backend canister interface
import { 
  canisterId as backendCanisterId, 
  createActor as createBackendActor,
  viragent_backend
} from '../../../declarations/viragent_backend';

class ViragentBackendVetKeys {
  private backendActor: typeof viragent_backend | null = null;
  private authClient: AuthClient | null = null;
  
  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      this.authClient = await AuthClient.create();
      await this.createActor();
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    }
  }

  private async createActor() {
    if (!this.authClient) return;

    const agent = new HttpAgent({
      host: process.env.NODE_ENV === 'development' ? 'http://localhost:4943' : 'https://ic0.app',
      identity: this.authClient.getIdentity(),
    });

    // Fetch root key for certificate validation in development
    if (process.env.NODE_ENV === 'development') {
      await agent.fetchRootKey();
    }

    this.backendActor = createBackendActor(backendCanisterId, {
      agent,
    });
  }

  /**
   * Encrypt and store content securely on the IC
   */
  async storeSecureContent(
    content: string, 
    recipientPrincipal: Principal,
    contentType: string = 'post',
    metadata?: string
  ): Promise<string> {
    if (!this.backendActor) {
      throw new Error('Backend actor not initialized');
    }

    try {
      // Encrypt content using vetKeys
      const encryptedContent = await viragentCrypto.encryptForUser(content, recipientPrincipal);
      
      // Store encrypted content on IC
      const contentId = await this.backendActor.storeEncryptedContent(
        encryptedContent.encryptedData,
        encryptedContent.identity,
        encryptedContent.seed,
        contentType,
        metadata
      );
      
      console.log(`Secure content stored with ID: ${contentId}`);
      return contentId;
    } catch (error) {
      console.error('Failed to store secure content:', error);
      throw error;
    }
  }

  /**
   * Create and store time-locked content
   */
  async createTimeLockedPost(
    content: string,
    unlockTime: Date,
    metadata?: string
  ): Promise<string> {
    if (!this.backendActor) {
      throw new Error('Backend actor not initialized');
    }

    try {
      // Create time-locked encrypted content
      const timeLockedContent = await viragentCrypto.createTimeLockedContent(content, unlockTime);
      
      // Store on IC with unlock time
      const contentId = await this.backendActor.storeTimeLockedContent(
        timeLockedContent.encryptedData,
        timeLockedContent.identity,
        timeLockedContent.seed,
        BigInt(unlockTime.getTime())
      );
      
      console.log(`Time-locked content created with ID: ${contentId}, unlocks at: ${unlockTime}`);
      return contentId;
    } catch (error) {
      console.error('Failed to create time-locked content:', error);
      throw error;
    }
  }

  /**
   * Send secure encrypted message between users
   */
  async sendEncryptedMessage(
    content: string,
    fromPrincipal: Principal,
    toPrincipal: Principal
  ): Promise<string> {
    if (!this.backendActor) {
      throw new Error('Backend actor not initialized');
    }

    try {
      // Create secure message
      const secureMessage = await viragentCrypto.createSecureMessage(
        content, 
        fromPrincipal, 
        toPrincipal
      );
      
      // Store on IC
      const messageId = await this.backendActor.sendSecureMessage(
        toPrincipal,
        secureMessage.encryptedContent,
        secureMessage.identity,
        secureMessage.seed
      );
      
      console.log(`Secure message sent with ID: ${messageId}`);
      return messageId;
    } catch (error) {
      console.error('Failed to send secure message:', error);
      throw error;
    }
  }

  /**
   * Create premium content with access control
   */
  async createPremiumPost(
    content: string,
    accessLevel: string = 'premium',
    price?: number
  ): Promise<string> {
    if (!this.backendActor) {
      throw new Error('Backend actor not initialized');
    }

    try {
      // Generate unique content ID
      const contentId = `premium_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate access key
      const accessKey = await viragentCrypto.generatePremiumAccessKey(contentId, accessLevel);
      
      // Encrypt content for premium access
      const currentUser = this.authClient?.getIdentity()?.getPrincipal();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      const encryptedContent = await viragentCrypto.encryptForUser(content, currentUser);
      
      // Store premium content on IC
      const premiumContentId = await this.backendActor.createPremiumContent(
        encryptedContent.encryptedData,
        accessLevel,
        accessKey,
        price ? BigInt(price) : undefined
      );
      
      console.log(`Premium content created with ID: ${premiumContentId}`);
      return premiumContentId;
    } catch (error) {
      console.error('Failed to create premium content:', error);
      throw error;
    }
  }

  /**
   * Get user's encrypted content
   */
  async getUserContent(contentType?: string) {
    if (!this.backendActor) {
      throw new Error('Backend actor not initialized');
    }

    try {
      const content = await this.backendActor.getUserEncryptedContent(contentType);
      return content.map(item => ({
        ...item,
        created_at: Number(item.created_at),
        encrypted_data: Array.from(item.encrypted_data),
        identity_bytes: Array.from(item.identity_bytes),
        seed_bytes: Array.from(item.seed_bytes)
      }));
    } catch (error) {
      console.error('Failed to get user content:', error);
      throw error;
    }
  }

  /**
   * Get unlockable time-locked content
   */
  async getUnlockableContent() {
    if (!this.backendActor) {
      throw new Error('Backend actor not initialized');
    }

    try {
      const content = await this.backendActor.getUnlockableContent();
      return content.map(item => ({
        ...item,
        unlock_time: Number(item.unlock_time),
        created_at: Number(item.created_at),
        encrypted_data: Array.from(item.encrypted_data),
        identity_bytes: Array.from(item.identity_bytes),
        seed_bytes: Array.from(item.seed_bytes)
      }));
    } catch (error) {
      console.error('Failed to get unlockable content:', error);
      throw error;
    }
  }

  /**
   * Get user's secure messages
   */
  async getUserMessages(asSender: boolean = false) {
    if (!this.backendActor) {
      throw new Error('Backend actor not initialized');
    }

    try {
      const messages = await this.backendActor.getUserSecureMessages(asSender);
      return messages.map(msg => ({
        ...msg,
        timestamp: Number(msg.timestamp),
        encrypted_data: Array.from(msg.encrypted_data),
        identity_bytes: Array.from(msg.identity_bytes),
        seed_bytes: Array.from(msg.seed_bytes)
      }));
    } catch (error) {
      console.error('Failed to get user messages:', error);
      throw error;
    }
  }

  /**
   * Subscribe to premium content
   */
  async subscribeToPremium(contentId: string): Promise<boolean> {
    if (!this.backendActor) {
      throw new Error('Backend actor not initialized');
    }

    try {
      const result = await this.backendActor.subscribeToPremiumContent(contentId);
      if ('ok' in result) {
        console.log('Successfully subscribed to premium content:', result.ok);
        return true;
      } else {
        console.error('Failed to subscribe:', result.err);
        return false;
      }
    } catch (error) {
      console.error('Failed to subscribe to premium content:', error);
      throw error;
    }
  }

  /**
   * Get system statistics
   */
  async getSystemStats() {
    if (!this.backendActor) {
      throw new Error('Backend actor not initialized');
    }

    try {
      const stats = await this.backendActor.getVetKeysSystemStats();
      return {
        encrypted_contents_count: Number(stats.encrypted_contents_count),
        timelock_contents_count: Number(stats.timelock_contents_count),
        secure_messages_count: Number(stats.secure_messages_count),
        premium_contents_count: Number(stats.premium_contents_count)
      };
    } catch (error) {
      console.error('Failed to get system stats:', error);
      throw error;
    }
  }

  /**
   * Check if time-locked content can be unlocked
   */
  async canUnlockContent(contentId: string): Promise<boolean> {
    if (!this.backendActor) {
      throw new Error('Backend actor not initialized');
    }

    try {
      const result = await this.backendActor.canUnlockTimeLockedContent(contentId);
      return result === true;
    } catch (error) {
      console.error('Failed to check unlock status:', error);
      return false;
    }
  }

  /**
   * Get the current authenticated user's principal
   */
  getCurrentUser(): Principal | null {
    return this.authClient?.getIdentity()?.getPrincipal() || null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authClient?.isAuthenticated() || false;
  }
}

// Export singleton instance
export const backendVetKeys = new ViragentBackendVetKeys();

// Export types
export type {
  BackendVetKeysService
};
