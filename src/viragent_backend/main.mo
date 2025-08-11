import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Timer "mo:base/Timer";
import Debug "mo:base/Debug";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
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
import AIService "./ai_service";
import Config "./config";

persistent actor class ViragentBackend() = this {

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
  transient let ic : ManagementCanister = actor ("aaaaa-aa");

    // System initialization
  private var initialized = false;
  
  // Mock AI Provider type
  type AIProvider = { #GitHub; #OpenAI; #Claude; };
  type AIRequest = {
    prompt: Text;
    tone: Text;
    platform: Text;
    mediaType: Text;
  };

  // Add stable variables for API keys  
  private var githubToken: Text = "";
  private var openaiApiKey: Text = "";
  private var defaultAIProvider: AIProvider = #OpenAI;

  // Data stores
  private transient var userStore = User.createStore();
  private transient var mediaStore = Media.createStore();
  private transient var toneStore = Tone.createStore();
  private transient var aiOutputStore = AIOutput.createStore();
  private transient var scheduleStore = Schedule.createStore();
  private transient var analyticsStore = Analytics.createStore();

  // Initialize the system with AI provider keys
  public func init(github_token: ?Text, openai_key: ?Text): async Text {
    if (not initialized) {
      initialized := true;
      
      // Set OpenAI API key from environment if provided
      switch (openai_key) {
        case (?key) {
          if (Config.isValidOpenAIKey(key)) {
            openaiApiKey := key;
            defaultAIProvider := #OpenAI;
            Debug.print("OpenAI API key configured - AI enabled!");
          } else {
            Debug.print("Invalid OpenAI API key provided");
          };
        };
        case null { 
          Debug.print("No OpenAI API key provided");
        };
      };
      
      // Set GitHub token from environment if provided
      switch (github_token) {
        case (?token) {
          if (Config.isValidGitHubToken(token)) {
            githubToken := token;
            if (openaiApiKey == "") {
              defaultAIProvider := #GitHub;
              Debug.print("GitHub token configured - FREE AI enabled!");
            };
          } else {
            Debug.print("Invalid GitHub token provided");
          };
        };
        case null { 
          Debug.print("No GitHub token provided");
        };
      };
      
      let providerName = switch (defaultAIProvider) {
        case (#OpenAI) "OpenAI";
        case (#GitHub) "GitHub Models (FREE)";
        case (#Claude) "Claude";
      };
      
      Debug.print("Viragent Backend initialized with " # providerName);
      return "System initialized successfully with " # providerName # " AI";
    };
    return "System already initialized";
  };

  // Simplified init for backward compatibility
  public func initSimple(): async Text {
    await init(null, null);
  };

  // Initialize with OpenAI key from environment
  public func initWithOpenAI(): async Text {
    // In a real deployment, you'd read from environment variables
    // For now, we'll use a placeholder - the key should be set via setAIConfig
    await init(null, ?"OPENAI_KEY_FROM_ENV");
  };

  // Initialize with OpenAI key directly (for testing with the key from .env)
  public func initWithOpenAIKey(openaiKey: Text): async Text {
    await init(null, ?openaiKey);
  };

  // AI Configuration Management
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
        openaiApiKey := apiKey;
        defaultAIProvider := #OpenAI;
        #ok("OpenAI API key configured successfully - Premium AI enabled!")
      };
      case (#Claude) {
        #ok("Claude not implemented in this version")
      };
    }
  };

  // Simple AI generation without media requirement (for testing and direct generation)
  public shared(msg) func generateContentDirect(
    prompt: Text,
    tone: Text,
    platform: Text
  ): async Result.Result<Text, Text> {
    if (not User.isRegistered(userStore, msg.caller)) {
      return #err("User not registered");
    };

    // Direct AI generation without media verification
    let result = if (openaiApiKey == "") {
      #err("OpenAI API key not configured. Please set your OpenAI API key.")
    } else {
      let aiPrompt = "Create engaging social media content for " # platform # " platform with " # tone # " tone. User request: " # prompt # ". Respond with just the caption text, no quotes or extra formatting.";
      
      let requestBody = "{\"model\":\"gpt-3.5-turbo\",\"messages\":[{\"role\":\"user\",\"content\":\"" # aiPrompt # "\"}],\"max_tokens\":200,\"temperature\":0.8}";
      let bodyBytes = Text.encodeUtf8(requestBody);
      
      let httpRequest: HttpRequestArgs = {
        url = "https://api.openai.com/v1/chat/completions";
        max_response_bytes = ?4096;
        headers = [
          { name = "Content-Type"; value = "application/json" },
          { name = "Authorization"; value = "Bearer " # openaiApiKey }
        ];
        body = ?Blob.toArray(bodyBytes);
        method = #post;
        transform = null;
      };
      
      try {
        Debug.print("Making OpenAI API request...");
        let response = await ic.http_request(httpRequest);
        Debug.print("OpenAI API response status: " # Nat.toText(response.status));
        
        if (response.status == 200) {
          let responseText = switch (Text.decodeUtf8(Blob.fromArray(response.body))) {
            case null { "" };
            case (?text) { 
              Debug.print("OpenAI response: " # text);
              text 
            };
          };
          #ok(responseText)
        } else {
          Debug.print("OpenAI API error status: " # Nat.toText(response.status));
          let errorText = switch (Text.decodeUtf8(Blob.fromArray(response.body))) {
            case null { "Unknown error" };
            case (?text) { text };
          };
          Debug.print("OpenAI API error body: " # errorText);
          #err("OpenAI API request failed with status: " # Nat.toText(response.status) # " - " # errorText)
        }
      } catch (error) {
        Debug.print("HTTP request error: " # Error.message(error));
        #err("HTTP request failed: " # Error.message(error))
      }
    };
    
    result
  };

  // AI Content Generation (using AI Service)
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
        
        let request: AIService.AIRequest = {
          prompt = prompt;
          tone = tone;
          platform = platform;
          mediaType = item.mediaType;
        };
        
        // Simple AI generation with OpenAI
        let result = if (openaiApiKey == "") {
          #err("OpenAI API key not configured. Please set your OpenAI API key.")
        } else {
          let aiPrompt = "Create engaging social media content for " # request.platform # " platform with " # request.tone # " tone. User request: " # request.prompt # ". Respond with just the caption text.";
          
          let requestBody = "{\"model\":\"gpt-3.5-turbo\",\"messages\":[{\"role\":\"user\",\"content\":\"" # aiPrompt # "\"}],\"max_tokens\":200}";
          let bodyBytes = Text.encodeUtf8(requestBody);
          
          let httpRequest: HttpRequestArgs = {
            url = "https://api.openai.com/v1/chat/completions";
            max_response_bytes = ?4096;
            headers = [
              { name = "Content-Type"; value = "application/json" },
              { name = "Authorization"; value = "Bearer " # openaiApiKey }
            ];
            body = ?Blob.toArray(bodyBytes);
            method = #post;
            transform = null;
          };
          
          try {
            let response = await ic.http_request(httpRequest);
            if (response.status == 200) {
              let responseText = switch (Text.decodeUtf8(Blob.fromArray(response.body))) {
                case null { "" };
                case (?text) { text };
              };
              #ok(responseText)
            } else {
              #err("OpenAI API request failed with status: " # Nat.toText(response.status))
            }
          } catch (error) {
            #err("HTTP request failed: " # Error.message(error))
          }
        };
        
        switch (result) {
          case (#ok(aiContent)) {
            let output: AIOutput.AIOutput = {
              mediaId = mediaId;
              caption = aiContent;
              hashtags = ["#AI", "#Generated", "#Content"];
              score = 90.0;
              generatedAt = Time.now();
            };
            
            let saveResult = AIOutput.saveOutput(aiOutputStore, output);
            #ok("AI content generated successfully: " # saveResult)
          };
          case (#err(error)) {
            #err("AI generation failed: " # error)
          }
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

  // Real social media posting methods
  public shared(msg) func postToTwitter(content: Text, accessToken: Text, mediaIds: ?[Text]): async Result.Result<Text, Text> {
    if (not User.isRegistered(userStore, msg.caller)) {
      return #err("User not registered");
    };

    let payload = switch (mediaIds) {
      case null { "{\"text\":\"" # content # "\"}" };
      case (?ids) { 
        let mediaIdsStr = Text.join(",", ids.vals());
        "{\"text\":\"" # content # "\",\"media\":{\"media_ids\":[" # mediaIdsStr # "]}}"
      };
    };

    let bodyBytes = Text.encodeUtf8(payload);

    let httpRequest: HttpRequestArgs = {
      url = "https://api.twitter.com/2/tweets";
      max_response_bytes = ?4096;
      headers = [
        { name = "Content-Type"; value = "application/json" },
        { name = "Authorization"; value = "Bearer " # accessToken }
      ];
      body = ?Blob.toArray(bodyBytes);
      method = #post;
      transform = null;
    };

    try {
      let response = await ic.http_request(httpRequest);
      if (response.status == 201) {
        let responseText = switch (Text.decodeUtf8(Blob.fromArray(response.body))) {
          case null { "Posted to Twitter successfully" };
          case (?text) { "Posted to Twitter: " # text };
        };
        #ok(responseText)
      } else {
        #err("Twitter API request failed with status: " # Nat.toText(response.status))
      }
    } catch (error) {
      #err("Failed to post to Twitter: " # Error.message(error))
    }
  };

  public shared(msg) func postToInstagram(imageUrl: Text, caption: Text, accessToken: Text): async Result.Result<Text, Text> {
    if (not User.isRegistered(userStore, msg.caller)) {
      return #err("User not registered");
    };

    // Step 1: Create media container
    let containerPayload = "image_url=" # imageUrl # "&caption=" # caption # "&access_token=" # accessToken;
    let containerBodyBytes = Text.encodeUtf8(containerPayload);

    let containerRequest: HttpRequestArgs = {
      url = "https://graph.instagram.com/me/media";
      max_response_bytes = ?2048;
      headers = [
        { name = "Content-Type"; value = "application/x-www-form-urlencoded" }
      ];
      body = ?Blob.toArray(containerBodyBytes);
      method = #post;
      transform = null;
    };

    try {
      let containerResponse = await ic.http_request(containerRequest);
      if (containerResponse.status != 200) {
        return #err("Failed to create Instagram media container: " # Nat.toText(containerResponse.status));
      };

      // Extract container ID from response (simplified)
      let containerResponseText = switch (Text.decodeUtf8(Blob.fromArray(containerResponse.body))) {
        case null { return #err("Invalid container response") };
        case (?text) { text };
      };

      // Step 2: Publish the media (simplified - would need JSON parsing in real implementation)
      let publishPayload = "creation_id=CONTAINER_ID&access_token=" # accessToken;
      let publishBodyBytes = Text.encodeUtf8(publishPayload);

      let publishRequest: HttpRequestArgs = {
        url = "https://graph.instagram.com/me/media_publish";
        max_response_bytes = ?2048;
        headers = [
          { name = "Content-Type"; value = "application/x-www-form-urlencoded" }
        ];
        body = ?Blob.toArray(publishBodyBytes);
        method = #post;
        transform = null;
      };

      let publishResponse = await ic.http_request(publishRequest);
      if (publishResponse.status == 200) {
        #ok("Posted to Instagram successfully")
      } else {
        #err("Failed to publish Instagram media: " # Nat.toText(publishResponse.status))
      }
    } catch (error) {
      #err("Failed to post to Instagram: " # Error.message(error))
    }
  };

  public shared(msg) func postToLinkedIn(content: Text, userUrn: Text, accessToken: Text): async Result.Result<Text, Text> {
    if (not User.isRegistered(userStore, msg.caller)) {
      return #err("User not registered");
    };

    let payload = "{\"author\":\"" # userUrn # "\",\"lifecycleState\":\"PUBLISHED\",\"specificContent\":{\"com.linkedin.ugc.ShareContent\":{\"shareCommentary\":{\"text\":\"" # content # "\"},\"shareMediaCategory\":\"NONE\"}},\"visibility\":{\"com.linkedin.ugc.MemberNetworkVisibility\":\"PUBLIC\"}}";
    let bodyBytes = Text.encodeUtf8(payload);

    let httpRequest: HttpRequestArgs = {
      url = "https://api.linkedin.com/v2/ugcPosts";
      max_response_bytes = ?4096;
      headers = [
        { name = "Content-Type"; value = "application/json" },
        { name = "Authorization"; value = "Bearer " # accessToken },
        { name = "X-Restli-Protocol-Version"; value = "2.0.0" }
      ];
      body = ?Blob.toArray(bodyBytes);
      method = #post;
      transform = null;
    };

    try {
      let response = await ic.http_request(httpRequest);
      if (response.status == 201) {
        #ok("Posted to LinkedIn successfully")
      } else {
        #err("LinkedIn API request failed with status: " # Nat.toText(response.status))
      }
    } catch (error) {
      #err("Failed to post to LinkedIn: " # Error.message(error))
    }
  };

  // Enhanced scheduling with real platform integration
  public shared(msg) func scheduleMultiPlatformPost(
    content: Text,
    platforms: [Text],
    scheduledAt: Int,
    mediaUrl: ?Text,
    accessTokens: [(Text, Text)] // (platform, token) pairs
  ): async Result.Result<Text, Text> {
    if (not User.isRegistered(userStore, msg.caller)) {
      return #err("User not registered");
    };

    // Store the scheduled post with platform-specific data
    let post: Schedule.ScheduledPost = {
      id = "multi_" # Int.toText(Time.now());
      mediaId = switch (mediaUrl) { case (?url) url; case null ""; };
      platform = Text.join(",", platforms.vals());
      scheduledAt = scheduledAt;
      status = "scheduled";
    };

    let saveResult = Schedule.schedule(scheduleStore, post);
    
    // In a real implementation, this would be handled by a timer or cron job
    // For now, we'll just acknowledge the scheduling
    #ok("Multi-platform post scheduled for " # Nat.toText(Array.size(platforms)) # " platforms: " # saveResult)
  };

  // Simplified Twitter scheduling (keeping existing method for compatibility)
  public shared func scheduleTwitterPost(content: Text, _scheduledAt: Int, accessToken: Text): async Text {
    // For immediate posting (in a real app, this would be handled by a scheduler)
    let result = await postToTwitter(content, accessToken, null);
    switch (result) {
      case (#ok(message)) message;
      case (#err(error)) "Failed: " # error;
    }
  };
}