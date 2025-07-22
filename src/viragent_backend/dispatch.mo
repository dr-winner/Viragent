import Debug "mo:base/Debug";
import Array "mo:base/Array";
import Text "mo:base/Text";

module Dispatch {
  /*
  public func postToPlatform(platform: Text, content: Text, accessToken: ?Text): async Text {
    Debug.print("Dispatching to " # platform # ": " # content);
    switch (platform) {
      case ("twitter") {
        switch (accessToken) {
          case (?token) {
            let httpRequest: HttpRequestArgs = {
              url = "https://api.twitter.com/2/tweets";
              max_response_bytes = ?2048;
              headers = [
                { name = "Authorization"; value = "Bearer " # token },
                { name = "Content-Type"; value = "application/json" }
              ];
              body = ?Text.encodeUtf8("{\"text\": \"" # content # "\"}");
              method = #post;
              transform = null;
            };
            let ic : ManagementCanister = actor ("aaaaa-aa");
            let response = await ic.http_request(httpRequest);
            if (response.status == 201 or response.status == 200) {
              "Tweet posted successfully"
            } else {
              "Failed to post tweet: " # Nat.toText(response.status)
            }
          };
          case null {
            return "Error: Twitter access token required.";
          }
        }
      };
      case ("instagram") {
        // TODO: Integrate with Instagram API
        return "Error: Real Instagram API integration required.";
      };
      case ("linkedin") {
        // TODO: Integrate with LinkedIn API
        return "Error: Real LinkedIn API integration required.";
      };
      case ("facebook") {
        // TODO: Integrate with Facebook API
        return "Error: Real Facebook API integration required.";
      };
      case (_) {
        return "Unsupported platform: " # platform;
      };
    }
  };
  */

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
