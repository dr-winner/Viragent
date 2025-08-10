import Debug "mo:base/Debug";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Float "mo:base/Float";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Error "mo:base/Error";
import Char "mo:base/Char";

module AIService {
    // Very simple extraction - just find content between quotes after "content":
    let parts = Text.split(responseText, #text "content");
    let partsArray = Iter.toArray(parts);
    
    if (partsArray.size() > 1) {
      let contentPart = partsArray[1];
      let contentLines = Text.split(contentPart, #text "\"");
      let contentArray = Iter.toArray(contentLines);
      
      if (contentArray.size() > 1) {
        return contentArray[1];
      }
    };
    
    ""
  };se/Iter";
import Nat "mo:base/Nat";
import Error "mo:base/Error";
import Char "mo:base/Char";

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
    #OpenAI;  // OpenAI GPT API only
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

  public func generateAIContent(
    provider: AIProvider,
    apiKey: Text,
    request: AIRequest,
    httpOutcall: shared (HttpRequestArgs) -> async HttpResponsePayload
  ): async Result.Result<Text, Text> {
    Debug.print("Generating AI content for: " # request.platform # " with tone: " # request.tone);
    if (apiKey == "") {
      return #err("No API key provided");
    };
    switch (provider) {
      case (#OpenAI) {
        await generateWithOpenAI(apiKey, request, httpOutcall)
      };
    }
  };

  // OpenAI API Integration
  private func generateWithOpenAI(
    apiKey: Text,
    request: AIRequest,
    httpOutcall: shared (HttpRequestArgs) -> async HttpResponsePayload
  ): async Result.Result<Text, Text> {
    let prompt = buildPrompt(request);
    let systemPrompt = "You are a social media content expert. Create engaging, viral-worthy content. Return only the caption text without hashtags.";
    
    let requestBody = "{" #
      "\"model\": \"gpt-3.5-turbo\"," #
      "\"messages\": [{" #
        "\"role\": \"system\"," #
        "\"content\": \"" # systemPrompt # "\"" #
      "},{" #
        "\"role\": \"user\"," #
        "\"content\": \"" # prompt # "\"" #
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
      let response = await httpOutcall(httpRequest);
      Debug.print("Response status: " # Nat.toText(response.status));
      if (response.status == 200) {
        let responseText = switch (Text.decodeUtf8(Blob.fromArray(response.body))) {
          case null { "" };
          case (?text) { text };
        };
        Debug.print("OpenAI API response: " # responseText);
        
        // Parse OpenAI response and return just the text content
        parseOpenAIResponseSimple(responseText)
      } else {
        let responseText = switch (Text.decodeUtf8(Blob.fromArray(response.body))) {
          case null { "" };
          case (?text) { text };
        };
        #err("AI generation failed: OpenAI API request failed with status: " # Nat.toText(response.status) # ", response: " # responseText)
      }
    } catch (error) {
      #err("HTTP request to OpenAI failed: " # Error.message(error))
    }
  };

  private func parseOpenAIResponseSimple(responseText: Text): Result.Result<Text, Text> {
    // Extract content from OpenAI response
    if (Text.contains(responseText, #text "choices")) {
      let content = extractContentFromChoices(responseText);
      if (content != "") {
        #ok(Text.trim(content, #char ' '))
      } else {
        #err("OpenAI API response missing content")
      }
    } else {
      #err("OpenAI API response format invalid: " # responseText)
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

  private func extractContentFromChoices(responseText: Text): Text {
    // Very simple extraction - just find content between quotes after "content":
    let parts = Text.split(responseText, #text ""content":");
    let partsArray = Iter.toArray(parts);
    
    if (partsArray.size() > 1) {
      let contentPart = partsArray[1];
      let contentLines = Text.split(contentPart, #text """);
      let contentArray = Iter.toArray(contentLines);
      
      if (contentArray.size() > 1) {
        return contentArray[1];
      }
    };
    
    ""
  };
}

  private func escapeJsonString(text: Text): Text {
    // Simple implementation: just remove problematic characters
    text
  };

  private func unescapeJsonString(text: Text): Text {
    // Basic unescaping - just return as is for simplicity
    text
  };

  private func buildPrompt(request: AIRequest): Text {
    "Create engaging social media content for " # request.platform # 
    " with a " # request.tone # " tone. " #
    "Media type: " # request.mediaType # ". " #
    "User prompt: " # request.prompt # ". " #
    "Respond with a caption only."
  };
}
