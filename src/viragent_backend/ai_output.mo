import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Iter "mo:base/Iter";

module AIOutput {
  public type MediaId = Text;
  public type AIOutput = {
    mediaId : MediaId;
    caption : Text;
    hashtags : [Text];
    score : Float;
    generatedAt : Int;
  };
  
  public type Store = HashMap.HashMap<MediaId, AIOutput>;

  public func createStore(): Store {
    HashMap.HashMap<MediaId, AIOutput>(100, Text.equal, Text.hash)
  };

  public func saveOutput(store: Store, output: AIOutput): Text {
    store.put(output.mediaId, output);
    return "AI output saved";
  };

  public func getOutput(store: Store, mediaId: Text): ?AIOutput {
    store.get(mediaId)
  };

  public func getAllOutputs(store: Store): [AIOutput] {
    let items = Iter.toArray(store.entries());
    Array.map<(Text, AIOutput), AIOutput>(
      items,
      func((_, output)) = output
    )
  };

  public func updateOutput(store: Store, mediaId: Text, caption: Text, hashtags: [Text]): Bool {
    switch (store.get(mediaId)) {
      case (?existing) {
        let updated = {
          mediaId = existing.mediaId;
          caption = caption;
          hashtags = hashtags;
          score = existing.score;
          generatedAt = existing.generatedAt;
        };
        store.put(mediaId, updated);
        true
      };
      case null false;
    }
  };

  public func deleteOutput(store: Store, mediaId: Text): Bool {
    switch (store.remove(mediaId)) {
      case (?_) true;
      case null false;
    }
  };
}
