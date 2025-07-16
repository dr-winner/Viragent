import Debug "mo:base/Debug";
import Array "mo:base/Array";
import Text "mo:base/Text";

module Dispatch {
  public func postToPlatform(platform: Text, content: Text): async Text {
    // Log the dispatch attempt
    Debug.print("Dispatching to " # platform # ": " # content);
    
    // Simulate platform-specific logic
    switch (platform) {
      case ("twitter") {
        // Twitter API call would go here
        return "Post sent to Twitter successfully";
      };
      case ("instagram") {
        // Instagram API call would go here
        return "Post sent to Instagram successfully";
      };
      case ("linkedin") {
        // LinkedIn API call would go here
        return "Post sent to LinkedIn successfully";
      };
      case ("facebook") {
        // Facebook API call would go here
        return "Post sent to Facebook successfully";
      };
      case (_) {
        return "Unsupported platform: " # platform;
      };
    }
  };

  public func validatePlatform(platform: Text): Bool {
    switch (platform) {
      case ("twitter" or "instagram" or "linkedin" or "facebook") true;
      case (_) false;
    }
  };

  public func formatContentForPlatform(platform: Text, caption: Text, hashtags: [Text]): Text {
    let hashtagText = Array.foldLeft<Text, Text>(
      hashtags,
      "",
      func(acc, tag) = acc # " #" # tag
    );
    
    switch (platform) {
      case ("twitter") {
        // Twitter has character limits - simple check
        let totalLength = caption.size() + hashtagText.size();
        if (totalLength > 280) {
          caption # " [truncated]" # hashtagText
        } else {
          caption # hashtagText
        }
      };
      case ("instagram") {
        // Instagram allows longer captions
        caption # "\n" # hashtagText
      };
      case ("linkedin") {
        // LinkedIn professional format
        caption # "\n\n" # hashtagText
      };
      case ("facebook") {
        // Facebook format
        caption # "\n" # hashtagText
      };
      case (_) {
        caption # hashtagText
      };
    }
  };
}
