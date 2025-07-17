module Config {
  // Configuration for AI providers
  public type AIConfig = {
    openAIApiKey: Text;
    claudeApiKey: Text;
  };

  // Load configuration from environment or defaults
  public func loadConfig(): AIConfig {
    // In a real deployment, these would come from canister init args or environment
    // For now, we'll use the init method to set them
    {
      openAIApiKey = "";
      claudeApiKey = "";
    }
  };

  // Validate API key format
  public func isValidOpenAIKey(key: Text): Bool {
    key != "" and (key.size() > 20) // Basic validation
  };

  public func isValidClaudeKey(key: Text): Bool {
    key != "" and (key.size() > 20) // Basic validation
  };
}
