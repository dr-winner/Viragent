import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Debug "mo:base/Debug";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Array "mo:base/Array";

module {
  
  public type SecureConfig = {
    owner: Principal;
    encrypted_key: Blob;
    identity_bytes: Blob;
    seed_bytes: Blob;
    provider: Text; // "openai", "github", etc.
    created_at: Int;
    last_used: Int;
  };

  public class SecureConfigManager() {
    
    // Store encrypted API keys securely
    private var configStore = HashMap.HashMap<Text, SecureConfig>(10, Text.equal, Text.hash);
    private var configCounter: Nat = 0;

    /**
     * Store an encrypted API key using vetKeys
     */
    public func storeSecureApiKey(
      owner: Principal,
      encrypted_key: Blob,
      identity_bytes: Blob,
      seed_bytes: Blob,
      provider: Text
    ): Text {
      configCounter += 1;
      let configId = "config_" # Nat.toText(configCounter);
      
      let config: SecureConfig = {
        owner = owner;
        encrypted_key = encrypted_key;
        identity_bytes = identity_bytes;
        seed_bytes = seed_bytes;
        provider = provider;
        created_at = Time.now();
        last_used = Time.now();
      };
      
      configStore.put(configId, config);
      Debug.print("Stored secure API key for provider: " # provider);
      configId
    };

    /**
     * Get encrypted API key for a user and provider
     */
    public func getSecureApiKey(
      caller: Principal,
      provider: Text
    ): ?SecureConfig {
      for ((configId, config) in configStore.entries()) {
        if (config.owner == caller and config.provider == provider) {
          // Update last used timestamp
          let updatedConfig: SecureConfig = {
            owner = config.owner;
            encrypted_key = config.encrypted_key;
            identity_bytes = config.identity_bytes;
            seed_bytes = config.seed_bytes;
            provider = config.provider;
            created_at = config.created_at;
            last_used = Time.now();
          };
          configStore.put(configId, updatedConfig);
          return ?updatedConfig;
        };
      };
      null
    };

    /**
     * Check if user has a secure API key for provider
     */
    public func hasSecureApiKey(
      caller: Principal,
      provider: Text
    ): Bool {
      for ((configId, config) in configStore.entries()) {
        if (config.owner == caller and config.provider == provider) {
          return true;
        };
      };
      false
    };

    /**
     * Remove a secure API key
     */
    public func removeSecureApiKey(
      caller: Principal,
      provider: Text
    ): Bool {
      let entries = Iter.toArray(configStore.entries());
      for ((configId, config) in entries.vals()) {
        if (config.owner == caller and config.provider == provider) {
          configStore.delete(configId);
          Debug.print("Removed secure API key for provider: " # provider);
          return true;
        };
      };
      false
    };

    /**
     * Get user's configured providers
     */
    public func getUserProviders(caller: Principal): [Text] {
      var providers: [Text] = [];
      for ((configId, config) in configStore.entries()) {
        if (config.owner == caller) {
          providers := Array.append(providers, [config.provider]);
        };
      };
      providers
    };

    /**
     * Get system stats for secure configurations
     */
    public func getSecureConfigStats(): {
      total_configs: Nat;
      unique_users: Nat;
      providers: [Text];
    } {
      var uniqueUsers = HashMap.HashMap<Principal, Bool>(10, Principal.equal, Principal.hash);
      var uniqueProviders = HashMap.HashMap<Text, Bool>(10, Text.equal, Text.hash);
      
      for ((configId, config) in configStore.entries()) {
        uniqueUsers.put(config.owner, true);
        uniqueProviders.put(config.provider, true);
      };
      
      let providers = Iter.toArray(uniqueProviders.keys());
      
      {
        total_configs = configStore.size();
        unique_users = uniqueUsers.size();
        providers = providers;
      }
    };
  }
}
