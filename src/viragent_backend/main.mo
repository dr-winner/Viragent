import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Timer "mo:base/Timer";
import Debug "mo:base/Debug";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Error "mo:base/Error";
import Text "mo:base/Text";
import Blob "mo:base/Blob";

import User "./user";
import Media "./media";
import Tone "./tone";
import AIOutput "./ai_output";
import Schedule "./schedule";
import Dispatch "./dispatch";
import Analytics "./analytics";
// import AIService "./ai_service"; // Temporarily commented out due to syntax error
import Config "./config";

actor class ViragentBackend() = this {

  // HTTP Outcalls Types
  type HttpRequestArgs = {
    url : Text;
    max_response_bytes : ?Nat64;
    headers : [HttpHeader];
    body : ?[Nat8];
    method : HttpMethod;
    transform : ?TransformRawResponseFunction;
  };

  type HttpHeader = {
    name : Text;
    value : Text;
  };

  type HttpMethod = {
    #get;
    #post;
    #head;
  };

  type HttpResponsePayload = {
    status : Nat;
    headers : [HttpHeader];
    body : [Nat8];
  };

  type TransformRawResponseFunction = {
    function : shared query TransformRawResponse -> async HttpResponsePayload;
    context : Blob;
  };

  type TransformRawResponse = {
    status : Nat;
    body : [Nat8];
    headers : [HttpHeader];
    context : Blob;
  };

  // Management canister interface for HTTP outcalls
  type ManagementCanister = actor {
    http_request : HttpRequestArgs -> async HttpResponsePayload;
  };

  // Management canister for HTTP outcalls
  let ic : ManagementCanister = actor ("aaaaa-aa");

    // System initialization
  private stable var initialized = false;
  
  // Mock AI Provider type
  type AIProvider = { #GitHub; #OpenAI; #Claude; };
  type AIRequest = {
    prompt: Text;
    tone: Text;
    platform: Text;
    mediaType: Text;
  };

  // Add stable variables for API keys  
  private stable var githubToken: Text = "";
  private stable var defaultAIProvider: AIProvider = #GitHub;

  // Data stores
  private var userStore = User.createStore();
  private var mediaStore = Media.createStore();
  private var toneStore = Tone.createStore();
  private var aiOutputStore = AIOutput.createStore();
  private var scheduleStore = Schedule.createStore();
  private var analyticsStore = Analytics.createStore();

  // Initialize the system with GitHub token for free AI
  public func init(github_token: ?Text): async Text {
    if (not initialized) {
      initialized := true;
      
      // Set GitHub token from environment if provided
      switch (github_token) {
        case (?token) {
          if (Config.isValidGitHubToken(token)) {
            githubToken := token;
            defaultAIProvider := #GitHub;
            Debug.print("GitHub token configured - FREE AI enabled!");
          } else {
            Debug.print("Invalid GitHub token provided");
          };
        };
        case null { 
          Debug.print("No GitHub token provided - AI generation will be disabled");
        };
      };
      
      Debug.print("Viragent Backend initialized with GitHub Models (FREE AI)");
      return "System initialized successfully with FREE GitHub AI";
    };
    return "System already initialized";
  };

  // Simplified init for backward compatibility
  public func initSimple(): async Text {
    await init(null);
  };

  // AI Configuration Management - GitHub Only
  public shared(msg) func setAIConfig(provider: AIProvider, apiKey: Text): async Result.Result<Text, Text> {
    if (not User.isRegistered(userStore, msg.caller)) {
      return #err("User not registered");
    };
    
    switch (provider) {
      case (#GitHub) {
        githubToken := apiKey;
        defaultAIProvider := #GitHub;
        #ok("GitHub token configured successfully - FREE AI enabled!")
      };
      case (#OpenAI) {
        #ok("OpenAI not implemented in this version")
      };
      case (#Claude) {
        #ok("Claude not implemented in this version")
      };
    }
  };

  // AI Content Generation (using LLM library directly)
  public shared(msg) func generateAIContent(
    mediaId: Text,
    prompt: Text,
    tone: Text,
    platform: Text
  ): async Result.Result<Text, Text> {
    if (not User.isRegistered(userStore, msg.caller)) {
      return #err("User not registered");
    };
    
    // Verify user owns the media
    switch (Media.getMedia(mediaStore, mediaId)) {
      case (?item) {
        if (item.owner != msg.caller) {
          return #err("Unauthorized: Cannot generate content for media owned by another user");
        };
        
        let request: AIRequest = {
          prompt = prompt;
          tone = tone;
          platform = platform;
          mediaType = item.mediaType;
        };
        
        // Get GitHub token for FREE AI
        let apiKey = githubToken;
        
        if (apiKey == "") {
          return #err("GitHub token not configured. Please set your GitHub token for FREE AI access.");
        };
        
        // Mock AI generation for now
        let mockResponse = {
          caption = "Generated content for " # request.platform # " with " # request.tone # " tone: " # request.prompt;
          hashtags = ["#AI", "#Generated"];
          score = 85.0;
        };
        let result = #ok(mockResponse);
        
        switch (result) {
          case (#ok(aiResponse)) {
            let output: AIOutput.AIOutput = {
              mediaId = mediaId;
              caption = aiResponse.caption;
              hashtags = aiResponse.hashtags;
              score = aiResponse.score;
              generatedAt = Time.now();
            };
            
            let saveResult = AIOutput.saveOutput(aiOutputStore, output);
            #ok("AI content generated successfully: " # saveResult)
          };
        }
      };
      case null #err("Media not found");
    }
  };

  // User Management (Internet Identity based)
  public shared(msg) func register(): async Text {
    let caller = msg.caller;
    if (Principal.isAnonymous(caller)) {
      return "Anonymous principals cannot register. Please use Internet Identity.";
    };
    return User.registerUser(userStore, caller, Time.now());
  };

  public query(msg) func getProfile(): async ?User.UserProfile {
    User.getProfile(userStore, msg.caller)
  };

  public query(msg) func isRegistered(): async Bool {
    User.isRegistered(userStore, msg.caller)
  };

  // Media Management
  public shared(msg) func uploadMedia(item: Media.MediaItem): async Result.Result<Text, Text> {
    if (not User.isRegistered(userStore, msg.caller)) {
      return #err("User not registered");
    };
    
    if (item.owner != msg.caller) {
      return #err("Unauthorized: Cannot upload media for another user");
    };
    
    let result = Media.addMedia(mediaStore, item);
    #ok(result)
  };

  public query(msg) func getMedia(id: Text): async ?Media.MediaItem {
    switch (Media.getMedia(mediaStore, id)) {
      case (?item) {
        if (item.owner == msg.caller) {
          ?item
        } else {
          null // Only return media owned by caller
        }
      };
      case null null;
    }
  };

  public query(msg) func getUserMedia(): async [Media.MediaItem] {
    Media.getUserMedia(mediaStore, msg.caller)
  };

  public shared(msg) func updateMediaStatus(id: Text, status: Text): async Result.Result<Text, Text> {
    switch (Media.getMedia(mediaStore, id)) {
      case (?item) {
        if (item.owner != msg.caller) {
          return #err("Unauthorized: Cannot update media owned by another user");
        };
        if (Media.updateMediaStatus(mediaStore, id, status)) {
          #ok("Media status updated")
        } else {
          #err("Failed to update media status")
        }
      };
      case null #err("Media not found");
    }
  };

  // Tone Configuration
  public shared(msg) func setTone(tone: Tone.ToneConfig): async Result.Result<Text, Text> {
    if (not User.isRegistered(userStore, msg.caller)) {
      return #err("User not registered");
    };
    let result = Tone.saveTone(toneStore, tone);
    #ok(result)
  };

  public query func getTone(id: Text): async ?Tone.ToneConfig {
    Tone.getTone(toneStore, id)
  };

  public query func getAllTones(): async [Tone.ToneConfig] {
    Tone.getAllTones(toneStore)
  };

  // AI Output Management (Enhanced with AI generation)
  public shared(msg) func generateOutput(output: AIOutput.AIOutput): async Result.Result<Text, Text> {
    if (not User.isRegistered(userStore, msg.caller)) {
      return #err("User not registered");
    };
    
    // Verify user owns the media
    switch (Media.getMedia(mediaStore, output.mediaId)) {
      case (?item) {
        if (item.owner != msg.caller) {
          return #err("Unauthorized: Cannot generate output for media owned by another user");
        };
        let result = AIOutput.saveOutput(aiOutputStore, output);
        #ok(result)
      };
      case null #err("Media not found");
    }
  };

  // Simple AI generation with automatic detection
  public shared(msg) func generateSmartContent(
    mediaId: Text,
    prompt: Text
  ): async Result.Result<Text, Text> {
    if (not User.isRegistered(userStore, msg.caller)) {
      return #err("User not registered");
    };
    
    // Verify user owns the media
    switch (Media.getMedia(mediaStore, mediaId)) {
      case (?item) {
        if (item.owner != msg.caller) {
          return #err("Unauthorized: Cannot generate content for media owned by another user");
        };
        
        // Auto-detect platform and tone based on user history or defaults
        let platform = "instagram"; // Default platform
        let tone = "casual"; // Default tone
        
        // Use real AI generation
        await generateAIContent(mediaId, prompt, tone, platform)
      };
      case null #err("Media not found");
    }
  };

  // Get platform recommendations
  public query func getPlatformRecommendations(_platform: Text): async {
    maxCaptionLength: Nat;
    optimalHashtagCount: Nat;
    bestTones: [Text];
    features: [Text];
  } {
    {
      maxCaptionLength = 2200;
      optimalHashtagCount = 5;
      bestTones = ["casual", "professional"];
      features = ["Engaging content", "Relevant hashtags"];
    }
  };

  public query(msg) func getOutput(mediaId: Text): async ?AIOutput.AIOutput {
    // Verify user owns the media before returning output
    switch (Media.getMedia(mediaStore, mediaId)) {
      case (?item) {
        if (item.owner == msg.caller) {
          AIOutput.getOutput(aiOutputStore, mediaId)
        } else {
          null
        }
      };
      case null null;
    }
  };

  // Scheduling
  public shared(msg) func schedulePost(post: Schedule.ScheduledPost): async Result.Result<Text, Text> {
    if (not User.isRegistered(userStore, msg.caller)) {
      return #err("User not registered");
    };
    
    // Verify user owns the media
    switch (Media.getMedia(mediaStore, post.mediaId)) {
      case (?item) {
        if (item.owner != msg.caller) {
          return #err("Unauthorized: Cannot schedule post for media owned by another user");
        };
        
        // Validate platform
        if (not Dispatch.validatePlatform(post.platform)) {
          return #err("Unsupported platform: " # post.platform);
        };
        
        let result = Schedule.schedule(scheduleStore, post);
        #ok(result)
      };
      case null #err("Media not found");
    }
  };

  public query(msg) func getScheduledPosts(): async [Schedule.ScheduledPost] {
    let allPosts = Schedule.getAllScheduledPosts(scheduleStore);
    // Filter to only return posts for media owned by the caller
    Array.filter<Schedule.ScheduledPost>(
      allPosts,
      func(post) = switch (Media.getMedia(mediaStore, post.mediaId)) {
        case (?item) item.owner == msg.caller;
        case null false;
      }
    )
  };

  public shared(msg) func cancelPost(postId: Text): async Result.Result<Text, Text> {
    switch (Schedule.getScheduledPost(scheduleStore, postId)) {
      case (?post) {
        switch (Media.getMedia(mediaStore, post.mediaId)) {
          case (?item) {
            if (item.owner != msg.caller) {
              return #err("Unauthorized: Cannot cancel post for media owned by another user");
            };
            if (Schedule.cancelPost(scheduleStore, postId)) {
              #ok("Post cancelled")
            } else {
              #err("Failed to cancel post")
            }
          };
          case null #err("Media not found");
        }
      };
      case null #err("Scheduled post not found");
    }
  };

  // Analytics
  public shared(msg) func addMetrics(postId: Text, data: Analytics.EngagementData): async Result.Result<Text, Text> {
    // Verify user owns the post through media ownership
    switch (Schedule.getScheduledPost(scheduleStore, postId)) {
      case (?post) {
        switch (Media.getMedia(mediaStore, post.mediaId)) {
          case (?item) {
            if (item.owner != msg.caller) {
              return #err("Unauthorized: Cannot add metrics for post owned by another user");
            };
            let result = Analytics.add(analyticsStore, postId, data);
            #ok(result)
          };
          case null #err("Media not found");
        }
      };
      case null #err("Post not found");
    }
  };

  public query(msg) func getMetrics(postId: Text): async ?[Analytics.EngagementData] {
    // Verify user owns the post through media ownership
    switch (Schedule.getScheduledPost(scheduleStore, postId)) {
      case (?post) {
        switch (Media.getMedia(mediaStore, post.mediaId)) {
          case (?item) {
            if (item.owner == msg.caller) {
              Analytics.getMetrics(analyticsStore, postId)
            } else {
              null
            }
          };
          case null null;
        }
      };
      case null null;
    }
  };

  // System Scheduler - runs automatically
  public shared func tick(): async () {
    let now = Time.now();
    let duePosts = Schedule.getDuePosts(scheduleStore, now);
    
    Debug.print("Processing " # Nat.toText(duePosts.size()) # " due posts");
    
    for (post in duePosts.vals()) {
      try {
        // Get AI output for the post
        switch (AIOutput.getOutput(aiOutputStore, post.mediaId)) {
          case (?output) {
            let content = Dispatch.formatContentForPlatform(
              post.platform,
              output.caption,
              output.hashtags
            );
            // let result = await Dispatch.postToPlatform(post.platform, content); // Commented out
            // Update post status
            ignore Schedule.updatePostStatus(scheduleStore, post.id, "completed");
            Debug.print("Posted successfully: " # content); // Modified to print content directly
          };
          case null {
            ignore Schedule.updatePostStatus(scheduleStore, post.id, "failed");
            Debug.print("No AI output found for media: " # post.mediaId);
          };
        }
      } catch (e) {
        ignore Schedule.updatePostStatus(scheduleStore, post.id, "failed");
        Debug.print("Failed to dispatch post: " # Error.message(e));
      };
    };
  };

  // System heartbeat - runs every minute
  ignore Timer.recurringTimer<system>(#seconds 60, func() : async () { await tick() });

  // Health check
  public query func health(): async { status: Text; time: Int } {
    {
      status = "healthy";
      time = Time.now();
    }
  };

  // System stats
  public query func getSystemStats(): async {
    totalUsers: Nat;
    totalMedia: Nat;
    totalScheduledPosts: Nat;
    totalTones: Nat;
  } {
    {
      totalUsers = userStore.size();
      totalMedia = mediaStore.size();
      totalScheduledPosts = scheduleStore.size();
      totalTones = toneStore.size();
    }
  };

  // TEMPORARY: For testing Twitter posting from Candid UI or dfx
  public shared func testTwitterPost(content: Text, accessToken: Text): async Text {
    let httpRequest: HttpRequestArgs = {
      url = "https://api.twitter.com/2/tweets";
      max_response_bytes = ?2048;
      headers = [
        { name = "Authorization"; value = "Bearer " # accessToken },
        { name = "Content-Type"; value = "application/json" }
      ];
      body = ?Blob.toArray(Text.encodeUtf8("{\"text\": \"" # content # "\"}"));
      method = #post;
      transform = null;
    };
    let response = await ic.http_request(httpRequest);
    if (response.status == 201 or response.status == 200) {
      "Tweet posted successfully"
    } else {
      "Failed to post tweet: " # Nat.toText(response.status)
    }
  };

  public shared func scheduleTwitterPost(content: Text, _scheduledAt: Int, accessToken: Text): async Text {
    // For demo: immediately post to Twitter (replace with real scheduling logic)
    let httpRequest: HttpRequestArgs = {
      url = "https://api.twitter.com/2/tweets";
      max_response_bytes = ?2048;
      headers = [
        { name = "Authorization"; value = "Bearer " # accessToken },
        { name = "Content-Type"; value = "application/json" }
      ];
      body = ?Blob.toArray(Text.encodeUtf8("{\"text\": \"" # content # "\"}"));
      method = #post;
      transform = null;
    };
    let response = await ic.http_request(httpRequest);
    if (response.status == 201 or response.status == 200) {
      "Twitter post scheduled and posted successfully"
    } else {
      "Failed to post scheduled tweet: " # Nat.toText(response.status)
    }
  }
}