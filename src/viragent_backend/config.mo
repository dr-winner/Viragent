module Config {
  // Configuration for GitHub Models (Free AI)
  public type AIConfig = {
    githubToken: Text;
  };

  // Load configuration from environment or defaults
  public func loadConfig(): AIConfig {
    // In a real deployment, this would come from canister init args or environment
    {
      githubToken = "";
    }
  };

  // Validate GitHub token format
  public func isValidGitHubToken(token: Text): Bool {
    token != "" and (token.size() > 20) // Basic validation for GitHub tokens
  };
}
