import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";

module User {
  public type UserProfile = {
    principal: Principal;
    registeredAt: Int;
  };

  public type Store = HashMap.HashMap<Principal, UserProfile>;

  public func createStore(): Store {
    HashMap.HashMap<Principal, UserProfile>(100, Principal.equal, Principal.hash)
  };

  public func registerUser(store: Store, caller: Principal, timestamp: Int): Text {
    let profile: UserProfile = {
      principal = caller;
      registeredAt = timestamp;
    };
    store.put(caller, profile);
    return "Registered with Internet Identity";
  };

  public func getProfile(store: Store, user: Principal): ?UserProfile {
    store.get(user)
  };

  public func isRegistered(store: Store, user: Principal): Bool {
    switch (store.get(user)) {
      case (?_) true;
      case null false;
    }
  };
}
