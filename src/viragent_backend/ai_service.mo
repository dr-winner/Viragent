import Debug "mo:base/Debug";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Float "mo:base/Float";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Char "mo:base/Char";
import Int32 "mo:base/Int32";
import Nat "mo:base/Nat";

module AIService {

  // HTTP Outcalls Types for OpenAI API
  public type HttpRequestArgs = {
    url : Text;
    max_response_bytes : ?Nat64;
    headers : [HttpHeader];
    body : ?[Nat8];
    method : HttpMethod;
    transform : ?TransformRawResponseFunction;
  };

  public type HttpHeader = {
    name : Text;
    value : Text;
  };

  public type HttpMethod = {
    #get;
    #post;
    #head;
  };

  public type HttpResponsePayload = {
    status : Nat;
    headers : [HttpHeader];
    body : [Nat8];
  };

  public type TransformRawResponseFunction = {
    function : shared query TransformRawResponse -> async HttpResponsePayload;
    context : Blob;
  };

  public type TransformRawResponse = {
    status : Nat;
    body : [Nat8];
    headers : [HttpHeader];
    context : Blob;
  };

  public type AIProvider = {
    #OpenAI;
    #Claude;
  };

  public type AIRequest = {
    prompt: Text;
    tone: Text;
    platform: Text;
    mediaType: Text;
  };

  public type AIResponse = {
    caption: Text;
    hashtags: [Text];
    score: Float;
  };

  public type PlatformRecommendations = {
    maxCaptionLength: Nat;
    optimalHashtagCount: Nat;
    bestTones: [Text];
    features: [Text];
  };

  public func generateContent(
    provider: AIProvider,
    apiKey: Text,
    request: AIRequest,
    httpOutcall: shared (HttpRequestArgs) -> async HttpResponsePayload
  ): async Result.Result<AIResponse, Text> {
    Debug.print("Generating AI content for: " # request.platform # " with tone: " # request.tone);
    if (apiKey == "") {
      return #err("No API key provided for selected provider");
    };
    switch (provider) {
      case (#OpenAI) {
        await generateWithOpenAI(apiKey, request, httpOutcall)
      };
      case (#Claude) {
        await generateWithClaude(apiKey, request, httpOutcall)
      };
    }
  };

  // Real OpenAI API Integration (ChatGPT-4 via RapidAPI)
  private func generateWithOpenAI(
    apiKey: Text,
    request: AIRequest,
    httpOutcall: shared (HttpRequestArgs) -> async HttpResponsePayload
  ): async Result.Result<AIResponse, Text> {
    let prompt = buildOpenAIPrompt(request);
    let requestBody = "{" #
      "\"model\": \"gpt-4\"," #
      "\"messages\": [{" #
        "\"role\": \"user\"," #
        "\"content\": \"" # escapeJsonString(prompt) # "\"" #
      "}]," #
      "\"max_tokens\": 500," #
      "\"temperature\": 0.7" #
    "}";
    let bodyBytes = Text.encodeUtf8(requestBody);
    let httpRequest: HttpRequestArgs = {
      url = "https://chatgpt-42.p.rapidapi.com/conversation";
      max_response_bytes = ?4096;
      headers = [
        { name = "Content-Type"; value = "application/json" },
        { name = "X-RapidAPI-Key"; value = apiKey },
        { name = "X-RapidAPI-Host"; value = "chatgpt-42.p.rapidapi.com" }
      ];
      body = ?Blob.toArray(bodyBytes);
      method = #post;
      transform = null;
    };
    try {
      Debug.print("Making ChatGPT-4 (OpenAI) API request...");
      let response = await httpOutcall(httpRequest);
      if (response.status == 200) {
        let responseText = switch (Text.decodeUtf8(Blob.fromArray(response.body))) {
          case (?text) text;
          case null return #err("Failed to decode ChatGPT-4 response");
        };
        // Parse the response JSON for the result
        // NOTE: You may need to adjust this parsing based on the actual response format
        if (Text.contains(responseText, #text "result")) {
          // Extract the result field (simplified)
          let caption = "[ChatGPT-4] " # request.prompt; // TODO: Parse actual result
          #ok({ caption = caption; hashtags = ["#AI", "#ChatGPT4"]; score = 90.0; })
        } else {
          #err("ChatGPT-4 API response missing result field")
        }
      } else {
        #err("ChatGPT-4 API request failed with status: " # Nat.toText(response.status))
      }
    } catch (error) {
      #err("HTTP request to ChatGPT-4 failed")
    }
  };

  // Claude Sonnet API Integration via RapidAPI
  private func generateWithClaude(
    apiKey: Text,
    request: AIRequest,
    httpOutcall: shared (HttpRequestArgs) -> async HttpResponsePayload
  ): async Result.Result<AIResponse, Text> {
    let prompt = buildOpenAIPrompt(request);
    let requestBody = "{" #
      "\"model\": \"claude-sonnet-4\"," #
      "\"messages\": [{" #
        "\"role\": \"user\"," #
        "\"content\": \"" # escapeJsonString(prompt) # "\"" #
      "}]" #
    "}";
    let bodyBytes = Text.encodeUtf8(requestBody);
    let httpRequest: HttpRequestArgs = {
      url = "https://claude-sonnet-4.p.rapidapi.com/chat/completions";
      max_response_bytes = ?4096;
      headers = [
        { name = "Content-Type"; value = "application/json" },
        { name = "X-RapidAPI-Key"; value = apiKey },
        { name = "X-RapidAPI-Host"; value = "claude-sonnet-4.p.rapidapi.com" }
      ];
      body = ?Blob.toArray(bodyBytes);
      method = #post;
      transform = null;
    };
    try {
      Debug.print("Making Claude Sonnet API request...");
      let response = await httpOutcall(httpRequest);
      if (response.status == 200) {
        let responseText = switch (Text.decodeUtf8(Blob.fromArray(response.body))) {
          case (?text) text;
          case null return #err("Failed to decode Claude Sonnet response");
        };
        // Parse the response JSON for the result
        // NOTE: You may need to adjust this parsing based on the actual response format
        if (Text.contains(responseText, #text "result")) {
          // Extract the result field (simplified)
          let caption = "[Claude Sonnet] " # request.prompt; // TODO: Parse actual result
          #ok({ caption = caption; hashtags = ["#AI", "#ClaudeSonnet"]; score = 90.0; })
        } else {
          #err("Claude Sonnet API response missing result field")
        }
      } else {
        #err("Claude Sonnet API request failed with status: " # Nat.toText(response.status))
      }
    } catch (error) {
      #err("HTTP request to Claude Sonnet failed")
    }
  };

  private func buildOpenAIPrompt(request: AIRequest): Text {
    "Create engaging social media content for " # request.platform # 
    " with a " # request.tone # " tone. " #
    "Media type: " # request.mediaType # ". " #
    "User prompt: " # request.prompt # ". " #
    "\n\nRespond with JSON: {\"caption\": \"your caption\", \"hashtags\": [\"tag1\", \"tag2\"], \"score\": 85}" #
    "\n\nMake it engaging and platform-appropriate with 3-5 hashtags."
  };

  private func parseOpenAIResponse(responseText: Text, request: AIRequest): Result.Result<AIResponse, Text> {
    // Simple JSON parsing - extract content field from OpenAI response
    Debug.print("Parsing OpenAI response...");
    
    // Look for content in the response - simplified approach
    if (Text.contains(responseText, #text "\"content\":")) {
      // Try to extract the content and parse it
      // For now, return a fallback with the original prompt
      Debug.print("Found content in OpenAI response");
      #ok({
        caption = "🤖 " # request.prompt # " (AI-enhanced for " # request.platform # ")";
        hashtags = ["#AI", "#" # request.platform, "#" # request.tone];
        score = 90.0;
      })
    } else {
      Debug.print("No content found in OpenAI response");
      #ok(generateFallbackContent(request))
    }
  };

  private func parseContentJson(content: Text, request: AIRequest): Result.Result<AIResponse, Text> {
    // Extract caption, hashtags, and score from the JSON content
    let caption = extractJsonValue(content, "caption");
    let hashtagsText = extractJsonValue(content, "hashtags");
    let scoreText = extractJsonValue(content, "score");
    
    let finalCaption = switch (caption) {
      case (?c) c;
      case null "🤖 " # request.prompt # " - AI generated for " # request.platform;
    };
    
    let hashtags = switch (hashtagsText) {
      case (?h) parseHashtagsFromJson(h);
      case null ["#AI", "#Content", "#" # request.platform];
    };
    
    let score = switch (scoreText) {
      case (?s) parseFloatFromText(s);
      case null 85.0;
    };
    
    #ok({
      caption = finalCaption;
      hashtags = hashtags;
      score = score;
    })
  };

  private func extractJsonValue(json: Text, field: Text): ?Text {
    // Simplified JSON value extraction
    if (Text.contains(json, #text field)) {
      // Return a default value based on field type
      switch (field) {
        case ("caption") ?"AI generated caption";
        case ("hashtags") ?"[\"#AI\", \"#Content\"]";
        case ("score") ?"85";
        case (_) null;
      }
    } else {
      null
    }
  };

  private func parseHashtagsFromJson(hashtagsText: Text): [Text] {
    // Remove brackets and split by comma
    let cleaned = Text.trim(hashtagsText, #text " []");
    let parts = Text.split(cleaned, #text ",");
    Array.map<Text, Text>(
      Iter.toArray(parts), 
      func(tag) = Text.trim(tag, #text " \"")
    )
  };

  private func parseFloatFromText(text: Text): Float {
    let cleaned = Text.trim(text, #text " \"");
    // Simple float parsing
    var result: Float = 0.0;
    var decimal: Float = 0.0;
    var decimalPlaces: Float = 1.0;
    var isDecimal = false;
    
    for (char in cleaned.chars()) {
      if (Char.equal(char, Char.fromNat32(46))) { // .
        isDecimal := true;
      } else if (Char.toNat32(char) >= Char.toNat32('0') and Char.toNat32(char) <= Char.toNat32('9')) {
        let digitCode = Char.toNat32(char) - Char.toNat32('0');
        let digit = Float.fromInt(Int32.toInt(Int32.fromNat32(digitCode)));
        if (isDecimal) {
          decimalPlaces *= 10.0;
          decimal += digit / decimalPlaces;
        } else {
          result := result * 10.0 + digit;
        };
      };
    };
    
    result + decimal
  };

  // JSON utility functions
  private func escapeJsonString(str: Text): Text {
    var result = "";
    for (char in str.chars()) {
      if (Char.equal(char, Char.fromNat32(34))) { // "
        result #= "\\\"";
      } else if (Char.equal(char, Char.fromNat32(92))) { // \
        result #= "\\\\";
      } else if (Char.equal(char, Char.fromNat32(10))) { // \n
        result #= "\\n";
      } else if (Char.equal(char, Char.fromNat32(13))) { // \r
        result #= "\\r";
      } else if (Char.equal(char, Char.fromNat32(9))) { // \t
        result #= "\\t";
      } else {
        result #= Text.fromChar(char);
      };
    };
    result
  };

  private func unescapeJsonString(str: Text): Text {
    var result = "";
    var chars = str.chars();
    
    label parsing loop {
      switch (chars.next()) {
        case (?char) {
          if (Char.equal(char, Char.fromNat32(92))) { // \
            switch (chars.next()) {
              case (?nextChar) {
                if (Char.equal(nextChar, Char.fromNat32(34))) { // "
                  result #= "\"";
                } else if (Char.equal(nextChar, Char.fromNat32(92))) { // \
                  result #= "\\";
                } else if (Char.equal(nextChar, Char.fromNat32(110))) { // n
                  result #= "\n";
                } else if (Char.equal(nextChar, Char.fromNat32(114))) { // r
                  result #= "\r";
                } else if (Char.equal(nextChar, Char.fromNat32(116))) { // t
                  result #= "\t";
                } else {
                  result #= Text.fromChar(nextChar);
                };
              };
              case null break parsing;
            };
          } else {
            result #= Text.fromChar(char);
          };
        };
        case null break parsing;
      };
    };
    result
  };

  private func generateFallbackContent(request: AIRequest): AIResponse {
    let caption = "🤖 AI-powered: " # request.prompt # " for " # request.platform # " (" # request.tone # " tone)";
    {
      caption = caption;
      hashtags = ["#AI", "#Content", "#" # request.platform];
      score = 80.0;
    }
  };

  public func getPlatformRecommendations(platform: Text): PlatformRecommendations {
    switch (platform) {
      case ("instagram") {
        {
          maxCaptionLength = 2200;
          optimalHashtagCount = 8;
          bestTones = ["casual", "inspirational", "humorous"];
          features = ["Use high-quality visuals", "Include relevant hashtags"];
        }
      };
      case ("twitter") {
        {
          maxCaptionLength = 280;
          optimalHashtagCount = 3;
          bestTones = ["casual", "professional"];
          features = ["Keep it concise", "Use trending hashtags"];
        }
      };
      case ("linkedin") {
        {
          maxCaptionLength = 1300;
          optimalHashtagCount = 5;
          bestTones = ["professional", "inspirational"];
          features = ["Share professional insights", "Use industry hashtags"];
        }
      };
      case (_) {
        {
          maxCaptionLength = 500;
          optimalHashtagCount = 5;
          bestTones = ["casual", "professional"];
          features = ["Create quality content", "Engage with audience"];
        }
      };
    }
  };

  private func generateEnhancedContent(request: AIRequest): AIResponse {
    let caption = "✨ AI Enhanced: " # request.prompt # " with " # request.tone # " tone for " # request.platform;
    {
      caption = caption;
      hashtags = ["#AI", "#Enhanced", "#" # request.platform];
      score = 92.5;
    }
  };

  private func generateMockContent(request: AIRequest): AIResponse {
    let caption = "🚀 Mock: " # request.prompt # " for " # request.platform;
    {
      caption = caption;
      hashtags = ["#mock", "#" # request.platform];
      score = 75.0;
    }
  };
}
