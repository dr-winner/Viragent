import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Float "mo:base/Float";
import Int "mo:base/Int";
import Iter "mo:base/Iter";

module Analytics {
  public type PostId = Text;
  public type EngagementData = {
    postId : PostId;
    likes : Nat;
    shares : Nat;
    comments : Nat;
    reach : Nat;
    sentimentScore : Float;
    timestamp : Int;
  };
  
  public type Store = HashMap.HashMap<PostId, [EngagementData]>;

  public func createStore(): Store {
    HashMap.HashMap<PostId, [EngagementData]>(100, Text.equal, Text.hash)
  };

  public func add(store: Store, postId: Text, entry: EngagementData): Text {
    let existing = switch (store.get(postId)) {
      case (?entries) entries;
      case null [];
    };
    store.put(postId, Array.append(existing, [entry]));
    return "Engagement logged";
  };

  public func getMetrics(store: Store, postId: Text): ?[EngagementData] {
    store.get(postId)
  };

  public func getLatestMetrics(store: Store, postId: Text): ?EngagementData {
    switch (store.get(postId)) {
      case (?entries) {
        if (entries.size() > 0) {
          ?entries[entries.size() - 1]
        } else {
          null
        }
      };
      case null null;
    }
  };

  public func getAllMetrics(store: Store): [(Text, [EngagementData])] {
    Iter.toArray(store.entries())
  };

  public func calculateAverageEngagement(store: Store, postId: Text): ?Float {
    switch (store.get(postId)) {
      case (?entries) {
        if (entries.size() == 0) return null;
        
        let totalEngagement = Array.foldLeft<EngagementData, Float>(
          entries,
          0.0,
          func(acc, data) = acc + Float.fromInt(data.likes + data.shares + data.comments)
        );
        
        ?(totalEngagement / Float.fromInt(entries.size()))
      };
      case null null;
    }
  };

  public func getTotalReach(store: Store, postId: Text): ?Nat {
    switch (store.get(postId)) {
      case (?entries) {
        if (entries.size() == 0) return null;
        
        let latest = entries[entries.size() - 1];
        ?latest.reach
      };
      case null null;
    }
  };
}
