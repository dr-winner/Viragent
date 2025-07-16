import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Timer "mo:base/Timer";
import Debug "mo:base/Debug";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Error "mo:base/Error";

import User "./user";
import Media "./media";
import Tone "./tone";
import AIOutput "./ai_output";
import Schedule "./schedule";
import Dispatch "./dispatch";
import Analytics "./analytics";

actor class ViragentBackend() = this {

  // System initialization
  private stable var initialized = false;

  // Data stores
  private var userStore = User.createStore();
  private var mediaStore = Media.createStore();
  private var toneStore = Tone.createStore();
  private var aiOutputStore = AIOutput.createStore();
  private var scheduleStore = Schedule.createStore();
  private var analyticsStore = Analytics.createStore();

  // Initialize the system
  public func init(): async Text {
    if (not initialized) {
      initialized := true;
      Debug.print("Viragent Backend initialized");
      return "System initialized successfully";
    };
    return "System already initialized";
  };

  // User Management
  public shared(msg) func register(email: Text): async Text {
    let caller = msg.caller;
    if (Principal.isAnonymous(caller)) {
      return "Anonymous principals cannot register";
    };
    return User.registerUser(userStore, caller, email);
  };

  public query(msg) func getProfile(): async ?Text {
    User.getEmail(userStore, msg.caller)
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

  // AI Output Management
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
            let result = await Dispatch.postToPlatform(post.platform, content);
            
            // Update post status
            ignore Schedule.updatePostStatus(scheduleStore, post.id, "completed");
            Debug.print("Posted successfully: " # result);
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
}