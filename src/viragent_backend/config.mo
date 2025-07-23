module Config {
  // Configuration for AI providers
  public type AIConfig = {
    githubToken: Text;
    openaiApiKey: Text;
  };

  // Load configuration from environment or defaults
  public func loadConfig(): AIConfig {
    // In a real deployment, this would come from canister init args or environment
    {
      githubToken = "";
      openaiApiKey = "";
    }
  };

  // Validate GitHub token format
  public func isValidGitHubToken(token: Text): Bool {
    token != "" and (token.size() > 20) // Basic validation for GitHub tokens
  };

  // Validate OpenAI API key format
  public func isValidOpenAIKey(key: Text): Bool {
    key != "" and (key.size() > 20) and (key.size() < 200) // Basic validation for OpenAI keys
  };
}
