import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Iter "mo:base/Iter";

module Tone {
  public type ToneId = Text;
  public type ToneConfig = {
    id : ToneId;
    name : Text;
    configJson : Text;
  };
  
  public type Store = HashMap.HashMap<ToneId, ToneConfig>;

  public func createStore(): Store {
    HashMap.HashMap<ToneId, ToneConfig>(100, Text.equal, Text.hash)
  };

  public func saveTone(store: Store, tone: ToneConfig): Text {
    store.put(tone.id, tone);
    return "Tone saved";
  };

  public func getTone(store: Store, id: Text): ?ToneConfig {
    store.get(id)
  };

  public func getAllTones(store: Store): [ToneConfig] {
    let items = Iter.toArray(store.entries());
    Array.map<(Text, ToneConfig), ToneConfig>(
      items,
      func((_, tone)) = tone
    )
  };

  public func deleteTone(store: Store, id: Text): Bool {
    switch (store.remove(id)) {
      case (?_) true;
      case null false;
    }
  };
}
