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

  // IC-LLM Canister Actor Interface (replace with actual canister ID and candid interface)
  type ICLLMResult = {
    output: Text;
    status_code: Nat16;
    error: Text;
  };
  type RunUpdateArgs = {
    args: [Text];
  };
  type ICLLM = actor {
    run_update: (RunUpdateArgs) -> async { Ok: ICLLMResult };
  };

  public type AIProvider = {
    #ICLLM
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
    icllmCanister: ICLLM,
    request: AIRequest
  ): async Result.Result<AIResponse, Text> {
    Debug.print("Generating AI content using IC-LLM for: " # request.platform # " with tone: " # request.tone);
    let prompt = buildPrompt(request);
    try {
      let result = await icllmCanister.run_update({ args = [prompt] });
      let output = result.Ok.output;
      // For now, treat the output as the caption, and use dummy hashtags/score
      #ok({ caption = output; hashtags = ["#ICLLM", "#AI"]; score = 90.0 })
    } catch (err) {
      #err("IC-LLM call failed")
    }
  };

  private func buildPrompt(request: AIRequest): Text {
    "Create engaging social media content for " # request.platform #
    " with a " # request.tone # " tone. " #
    "Media type: " # request.mediaType # ". " #
    "User prompt: " # request.prompt # ". " #
    "\n\nRespond with a caption only."
  };
}
