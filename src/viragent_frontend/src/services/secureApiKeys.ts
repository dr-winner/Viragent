/**
 * Secure API Key Management Service
 * 
 * This service handles client-side encryption of API keys using vetKeys
 * before storing them securely in the backend canister.
 */

import { ViragentCrypto } from './vetkeys';
import { backendService } from './backend';
import { Principal } from '@dfinity/principal';

export interface SecureApiKeyConfig {
  provider: 'openai' | 'github' | 'claude';
  apiKey: string;
}

export interface EncryptedApiKeyConfig {
  encrypted_key: Uint8Array;
  identity_bytes: Uint8Array;
  seed_bytes: Uint8Array;
  provider: string;
}

export class SecureApiKeyService {
  private crypto: ViragentCrypto;

  constructor() {
    this.crypto = new ViragentCrypto();
  }

  /**
   * Encrypt and store an API key securely
   */
  async storeSecureApiKey(
    config: SecureApiKeyConfig,
    userPrincipal: Principal
  ): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      // Encrypt the API key using vetKeys
      const encrypted = await this.crypto.encryptForUser(
        config.apiKey,
        userPrincipal
      );

      // Store the encrypted key in the backend
      const result = await backendService.storeSecureApiKey(
        encrypted.encryptedData,
        encrypted.identity,
        encrypted.seed,
        config.provider
      );

      if (result.success) {
        return {
          success: true,
          data: `Secure API key stored for ${config.provider}`
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to store secure API key'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Encryption failed: ${error}`
      };
    }
  }

  /**
   * Retrieve and decrypt an API key
   * NOTE: This is a simplified implementation for demonstration
   */
  async getSecureApiKey(
    provider: string,
    userPrincipal: Principal
  ): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      // Get encrypted key from backend
      const result = await backendService.getSecureApiKey(provider);

      if (!result.success || !result.data) {
        return {
          success: false,
          error: 'No secure API key found for this provider'
        };
      }

      // For demonstration purposes, we'll return a placeholder
      // In production, this would use the full vetKeys decryption
      return {
        success: true,
        data: `[ENCRYPTED_${provider.toUpperCase()}_KEY]`
      };
    } catch (error) {
      return {
        success: false,
        error: `Decryption failed: ${error}`
      };
    }
  }

  /**
   * Check if user has a secure API key for provider
   */
  async hasSecureApiKey(provider: string): Promise<boolean> {
    try {
      const result = await backendService.hasSecureApiKey(provider);
      return result.success ? result.data || false : false;
    } catch (error) {
      console.error('Error checking secure API key:', error);
      return false;
    }
  }

  /**
   * Remove a secure API key
   */
  async removeSecureApiKey(provider: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await backendService.removeSecureApiKey(provider);
      return {
        success: result.success && (result.data || false)
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to remove secure API key: ${error}`
      };
    }
  }

  /**
   * Get all configured providers for user
   */
  async getUserApiProviders(): Promise<string[]> {
    try {
      const result = await backendService.getUserApiProviders();
      return result.success ? result.data || [] : [];
    } catch (error) {
      console.error('Error getting user API providers:', error);
      return [];
    }
  }

  /**
   * Enhanced AI configuration with automatic encryption
   */
  async setSecureAIConfig(
    provider: 'github' | 'openai' | 'claude',
    apiKey: string,
    userPrincipal: Principal
  ): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      // Encrypt the API key
      const encrypted = await this.crypto.encryptForUser(
        apiKey,
        userPrincipal
      );

      // Map provider to backend enum
      const providerEnum = provider === 'github' ? { GitHub: null } :
                          provider === 'openai' ? { OpenAI: null } :
                          { Claude: null };

      // Store using the enhanced backend function
      const result = await backendService.setSecureAIConfig(
        providerEnum,
        encrypted.encryptedData,
        encrypted.identity,
        encrypted.seed
      );

      return result;
    } catch (error) {
      return {
        success: false,
        error: `Failed to set secure AI config: ${error}`
      };
    }
  }

  /**
   * Get system statistics for secure configurations
   */
  async getSecureConfigStats(): Promise<{
    total_configs: number;
    unique_users: number;
    providers: string[];
  } | null> {
    try {
      const result = await backendService.getSecureConfigStats();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Error getting secure config stats:', error);
      return null;
    }
  }
}

// Export singleton instance
export const secureApiKeyService = new SecureApiKeyService();
