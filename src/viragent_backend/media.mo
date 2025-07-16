import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Iter "mo:base/Iter";

module Media {
  public type MediaId = Text;
  public type MediaItem = {
    id : MediaId;
    owner : Principal;
    url : Text;
    mediaType : Text;
    status : Text;
    createdAt : Int;
  };
  
  public type Store = HashMap.HashMap<MediaId, MediaItem>;

  public func createStore(): Store {
    HashMap.HashMap<MediaId, MediaItem>(100, Text.equal, Text.hash)
  };

  public func addMedia(store: Store, item: MediaItem): Text {
    store.put(item.id, item);
    return "Media saved";
  };

  public func getMedia(store: Store, id: Text): ?MediaItem {
    store.get(id)
  };

  public func getUserMedia(store: Store, owner: Principal): [MediaItem] {
    let items = Iter.toArray(store.entries());
    let filtered = Array.filter<(Text, MediaItem)>(
      items,
      func((_, item)) = item.owner == owner
    );
    Array.map<(Text, MediaItem), MediaItem>(
      filtered,
      func((_, item)) = item
    )
  };

  public func updateMediaStatus(store: Store, id: Text, status: Text): Bool {
    switch (store.get(id)) {
      case (?item) {
        let updatedItem = {
          id = item.id;
          owner = item.owner;
          url = item.url;
          mediaType = item.mediaType;
          status = status;
          createdAt = item.createdAt;
        };
        store.put(id, updatedItem);
        true
      };
      case null false;
    }
  };
}
