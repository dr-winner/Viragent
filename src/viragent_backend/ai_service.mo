import Debug "mo:base/Debug";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Float "mo:base/Float";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Error "mo:base/Error";

module AIService {

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
    function : shared query TransformRawResponse -> async TransformRawResponse;
    context : Blob;
  };

  public type TransformRawResponse = {
    status : Nat;
    body : [Nat8];
    headers : [HttpHeader];
  };

  public type AIProvider = {
    #OpenAI;  // OpenAI GPT API
    #GitHub;  // GitHub Models - Free AI for everyone!
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

  public func generateContent(
    provider: AIProvider,
    apiKey: Text,
    request: AIRequest,
    httpOutcall: shared (HttpRequestArgs) -> async HttpResponsePayload
  ): async Result.Result<AIResponse, Text> {
    Debug.print("Generating AI content for: " # request.platform # " with tone: " # request.tone);
    if (apiKey == "") {
      return #err("No API key provided");
    };
    switch (provider) {
      case (#OpenAI) {
        await generateWithOpenAI(apiKey, request, httpOutcall)
      };
      case (#GitHub) {
        await generateWithGitHub(apiKey, request, httpOutcall)
      };
    }
  };

  // OpenAI API Integration
  private func generateWithOpenAI(
    apiKey: Text,
    request: AIRequest,
    httpOutcall: shared (HttpRequestArgs) -> async HttpResponsePayload
  ): async Result.Result<AIResponse, Text> {
    let prompt = buildPrompt(request);
    let systemPrompt = "You are a social media content expert. Create engaging, viral-worthy content. Return only the caption text without hashtags.";
    
    let requestBody = "{" #
      "\"model\": \"gpt-3.5-turbo\"," #
      "\"messages\": [{" #
        "\"role\": \"system\"," #
        "\"content\": \"" # escapeJsonString(systemPrompt) # "\"" #
      "},{" #
        "\"role\": \"user\"," #
        "\"content\": \"" # escapeJsonString(prompt) # "\"" #
      "}]," #
      "\"temperature\": 0.7," #
      "\"max_tokens\": 200" #
    "}";
    
    let bodyBytes = Text.encodeUtf8(requestBody);
    
    let httpRequest: HttpRequestArgs = {
      url = "https://api.openai.com/v1/chat/completions";
      max_response_bytes = ?4096;
      headers = [
        { name = "Content-Type"; value = "application/json" },
        { name = "Authorization"; value = "Bearer " # apiKey }
      ];
      body = ?Blob.toArray(bodyBytes);
      method = #post;
      transform = null;
    };
    
    try {
      Debug.print("Making OpenAI API request...");
      let response = await httpOutcall<system>(httpRequest);
      Debug.print("Response status: " # Nat.toText(response.status));
      if (response.status == 200) {
        let responseText = switch (Text.decodeUtf8(Blob.fromArray(response.body))) {
          case null { "" };
          case (?text) { text };
        };
        Debug.print("OpenAI API response: " # responseText);
        
        // Parse OpenAI response
        await parseOpenAIResponse(responseText, request)
      } else {
        let responseText = switch (Text.decodeUtf8(Blob.fromArray(response.body))) {
          case null { "" };
          case (?text) { text };
        };
        #err("OpenAI API request failed with status: " # Nat.toText(response.status) # ", response: " # responseText)
      }
    } catch (error) {
      #err("HTTP request to OpenAI failed: " # Error.message(error))
    }
  };

  // GitHub Models API Integration (Free AI models via GitHub)
  private func generateWithGitHub(
    apiKey: Text,
    request: AIRequest,
    httpOutcall: shared (HttpRequestArgs) -> async HttpResponsePayload
  ): async Result.Result<AIResponse, Text> {
    let prompt = buildPrompt(request);
    let requestBody = "{" #
      "\"messages\": [{" #
        "\"role\": \"system\"," #
        "\"content\": \"You are a social media content expert. Create engaging, viral-worthy content with relevant hashtags.\"" #
      "},{" #
        "\"role\": \"user\"," #
        "\"content\": \"" # escapeJsonString(prompt) # "\"" #
      "}]," #
      "\"model\": \"openai/gpt-4.1\"," #
      "\"temperature\": 0.7," #
      "\"max_tokens\": 500" #
    "}";
    let bodyBytes = Text.encodeUtf8(requestBody);
    
    let httpRequest: HttpRequestArgs = {
      url = "https://models.github.ai/inference";
      max_response_bytes = ?4096;
      headers = [
        { name = "Content-Type"; value = "application/json" },
        { name = "Authorization"; value = "Bearer " # apiKey },
        { name = "User-Agent"; value = "Viragent/1.0" }
      ];
      body = ?Blob.toArray(bodyBytes);
      method = #post;
      transform = null;
    };
    
    try {
      Debug.print("Making GitHub Models API request...");
      let response = await httpOutcall<system>(httpRequest);
      Debug.print("Response status: " # Nat.toText(response.status));
      if (response.status == 200) {
        let responseText = switch (Text.decodeUtf8(Blob.fromArray(response.body))) {
          case null { "" };
          case (?text) { text };
        };
        Debug.print("GitHub Models API response: " # responseText);
        
        // Parse GitHub Models response (OpenAI-compatible format)
        await parseGitHubResponse(responseText, request)
      } else {
        let responseText = switch (Text.decodeUtf8(Blob.fromArray(response.body))) {
          case null { "" };
          case (?text) { text };
        };
        #err("GitHub Models API request failed with status: " # Nat.toText(response.status) # ", response: " # responseText)
      }
    } catch (error) {
      #err("HTTP request to GitHub Models failed: " # Error.message(error))
    }
  };

  private func parseOpenAIResponse(responseText: Text, request: AIRequest): async Result.Result<AIResponse, Text> {
    // OpenAI response format parsing
    if (Text.contains(responseText, #text "choices")) {
      // Extract content from choices array
      let content = extractContentFromChoices(responseText);
      if (content != "") {
        let cleanContent = Text.trim(content, #char ' ');
        let hashtags = generateDefaultHashtags(request.platform, request.tone);
        
        #ok({ 
          caption = cleanContent; 
          hashtags = hashtags; 
          score = 92.0; // OpenAI provides high-quality content
        })
      } else {
        #err("OpenAI API response missing content")
      }
    } else {
      #err("OpenAI API response format invalid: " # responseText)
    }
  };

  private func parseGitHubResponse(responseText: Text, request: AIRequest): async Result.Result<AIResponse, Text> {
    // GitHub Models uses OpenAI-compatible format
    if (Text.contains(responseText, #text "choices")) {
      // Extract content from choices array
      let content = extractContentFromChoices(responseText);
      if (content != "") {
        // Parse the AI-generated content
        let lines = Text.split(content, #char '\n');
        let linesArray = Iter.toArray(lines);
        
        var caption = "";
        var hashtags: [Text] = [];
        
        for (line in linesArray.vals()) {
          let trimmedLine = Text.trim(line, #char ' ');
          if (Text.startsWith(trimmedLine, #text "#")) {
            // This line contains hashtags
            let hashtagsText = Text.split(trimmedLine, #char ' ');
            hashtags := Array.append(hashtags, Iter.toArray(hashtagsText));
          } else if (trimmedLine != "" and not Text.startsWith(trimmedLine, #text "Hashtags:")) {
            // This is part of the caption
            if (caption == "") {
              caption := trimmedLine;
            } else {
              caption := caption # " " # trimmedLine;
            }
          }
        };
        
        // If no specific hashtags found, generate some based on platform and tone
        if (hashtags.size() == 0) {
          hashtags := generateDefaultHashtags(request.platform, request.tone);
        };
        
        #ok({ 
          caption = caption; 
          hashtags = hashtags; 
          score = 95.0; // GitHub Models typically provides high-quality content
        })
      } else {
        #err("GitHub Models API response missing content")
      }
    } else {
      #err("GitHub Models API response format invalid: " # responseText)
    }
  };

  private func extractContentFromChoices(responseText: Text): Text {
    // Simple extraction of content from OpenAI-format response
    // Look for content field in the response
    if (Text.contains(responseText, #text "\"content\":")) {
      // For now, return a simplified extracted content
      // This is a basic implementation - in production you'd want proper JSON parsing
      let parts = Text.split(responseText, #text "\"content\":");
      let partsArray = Iter.toArray(parts);
      if (partsArray.size() > 1) {
        let contentPart = partsArray[1];
        let quoteParts = Text.split(contentPart, #text "\"");
        let quoteArray = Iter.toArray(quoteParts);
        if (quoteArray.size() > 1) {
          return unescapeJsonString(quoteArray[1]); // Return the content between quotes
        }
      }
    };
    ""
  };

  private func generateDefaultHashtags(platform: Text, tone: Text): [Text] {
    var hashtags: [Text] = ["#" # platform];
    
    switch (tone) {
      case ("professional") { hashtags := Array.append(hashtags, ["#business", "#professional"]) };
      case ("casual") { hashtags := Array.append(hashtags, ["#lifestyle", "#casual"]) };
      case ("funny") { hashtags := Array.append(hashtags, ["#funny", "#humor", "#lol"]) };
      case ("inspirational") { hashtags := Array.append(hashtags, ["#motivation", "#inspiration"]) };
      case (_) { hashtags := Array.append(hashtags, ["#socialmedia", "#content"]) };
    };
    
    hashtags
  };

  private func escapeJsonString(text: Text): Text {
    // Simple implementation: replace problematic characters
    var result = Text.replace(text, #text "\"", "\\\"");
    result := Text.replace(result, #text "\\", "\\\\");
    result := Text.replace(result, #text "\n", "\\n");
    result := Text.replace(result, #text "\r", "\\r");
    result := Text.replace(result, #text "\t", "\\t");
    result
  };

  private func unescapeJsonString(text: Text): Text {
    // Basic unescaping for JSON strings
    let result = Text.replace(text, #text "\\\"", "\"");
    let result2 = Text.replace(result, #text "\\\\", "\\");
    let result3 = Text.replace(result2, #text "\\n", "\n");
    let result4 = Text.replace(result3, #text "\\r", "\r");
    Text.replace(result4, #text "\\t", "\t")
  };

  private func buildPrompt(request: AIRequest): Text {
    "Create engaging social media content for " # request.platform # 
    " with a " # request.tone # " tone. " #
    "Media type: " # request.mediaType # ". " #
    "User prompt: " # request.prompt # ". " #
    "\n\nRespond with a caption only."
  };
}
