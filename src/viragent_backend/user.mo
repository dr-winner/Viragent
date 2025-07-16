import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";

module User {
  public type Store = HashMap.HashMap<Principal, Text>;

  public func createStore(): Store {
    HashMap.HashMap<Principal, Text>(100, Principal.equal, Principal.hash)
  };

  public func registerUser(store: Store, caller: Principal, email: Text): Text {
    store.put(caller, email);
    return "Registered";
  };

  public func getEmail(store: Store, user: Principal): ?Text {
    store.get(user)
  };

  public func isRegistered(store: Store, user: Principal): Bool {
    switch (store.get(user)) {
      case (?_) true;
      case null false;
    }
  };
}
