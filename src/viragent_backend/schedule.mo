import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Iter "mo:base/Iter";

module Schedule {
  public type PostId = Text;
  public type MediaId = Text;
  public type ScheduledPost = {
    id : PostId;
    mediaId : MediaId;
    platform : Text;
    scheduledAt : Int;
    status : Text;
  };
  
  public type Store = HashMap.HashMap<PostId, ScheduledPost>;

  public func createStore(): Store {
    HashMap.HashMap<PostId, ScheduledPost>(100, Text.equal, Text.hash)
  };

  public func schedule(store: Store, post: ScheduledPost): Text {
    store.put(post.id, post);
    return "Post scheduled";
  };

  public func getScheduledPost(store: Store, postId: Text): ?ScheduledPost {
    store.get(postId)
  };

  public func getDuePosts(store: Store, now: Int): [ScheduledPost] {
    let items = Iter.toArray(store.entries());
    let filtered = Array.filter<(Text, ScheduledPost)>(
      items,
      func((_, post)) = post.scheduledAt <= now and post.status == "pending"
    );
    Array.map<(Text, ScheduledPost), ScheduledPost>(
      filtered,
      func((_, post)) = post
    )
  };

  public func updatePostStatus(store: Store, postId: Text, status: Text): Bool {
    switch (store.get(postId)) {
      case (?post) {
        let updated = {
          id = post.id;
          mediaId = post.mediaId;
          platform = post.platform;
          scheduledAt = post.scheduledAt;
          status = status;
        };
        store.put(postId, updated);
        true
      };
      case null false;
    }
  };

  public func getAllScheduledPosts(store: Store): [ScheduledPost] {
    let items = Iter.toArray(store.entries());
    Array.map<(Text, ScheduledPost), ScheduledPost>(
      items,
      func((_, post)) = post
    )
  };

  public func cancelPost(store: Store, postId: Text): Bool {
    updatePostStatus(store, postId, "cancelled")
  };
}
