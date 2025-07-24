import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Error "mo:base/Error";
import Int "mo:base/Int";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Result "mo:base/Result";

module {
    // VetKeys Management canister ID (this would be the actual IC management canister in production)
    // Using a placeholder for development - in production this would be the real IC management canister
    private let VETKD_SYSTEM_API = actor("aaaaa-aa") : actor {
        vetkd_public_key : (request : VetkdPublicKeyRequest) -> async VetkdPublicKeyResponse;
        vetkd_derive_encrypted_key : (request : VetkdDeriveEncryptedKeyRequest) -> async VetkdDeriveEncryptedKeyResponse;
    };

    // VetKD types for IC management canister integration
    public type VetkdPublicKeyRequest = {
        canister_id : ?Principal;
        derivation_path : [Blob];
        key_id : VetkdKeyId;
    };

    public type VetkdPublicKeyResponse = {
        public_key : Blob;
    };

    public type VetkdDeriveEncryptedKeyRequest = {
        public_key_derivation_path : [Blob];
        derivation_id : Blob;
        key_id : VetkdKeyId;
        encryption_public_key : Blob;
    };

    public type VetkdDeriveEncryptedKeyResponse = {
        encrypted_key : Blob;
    };

    public type VetkdKeyId = {
        #test_key_1;
        #production_key_1;
    };

    // Encrypted content storage
    public type EncryptedContent = {
        owner : Principal;
        encrypted_data : Blob;
        identity_bytes : Blob;
        seed_bytes : Blob;
        content_type : Text; // "post", "message", "premium", "timelock"
        created_at : Int;
        metadata : ?Text;
    };

    // Time-locked content with unlock conditions
    public type TimeLockedContent = {
        content_id : Text;
        encrypted_data : Blob;
        identity_bytes : Blob;
        seed_bytes : Blob;
        unlock_time : Int;
        creator : Principal;
        is_unlocked : Bool;
        created_at : Int;
    };

    // Secure messaging between users
    public type SecureMessage = {
        message_id : Text;
        from_principal : Principal;
        to_principal : Principal;
        encrypted_data : Blob;
        identity_bytes : Blob;
        seed_bytes : Blob;
        timestamp : Int;
        is_read : Bool;
    };

    // Premium content access control
    public type PremiumContent = {
        content_id : Text;
        creator : Principal;
        access_level : Text; // "basic", "premium", "vip"
        encrypted_data : Blob;
        access_key : Blob;
        price : ?Nat; // Optional pricing in cycles/tokens
        subscribers : [Principal];
        created_at : Int;
    };

    public class VetKeysManager() {
        // Storage for different types of encrypted content
        private var encrypted_contents : [EncryptedContent] = [];
        private var timelock_contents : [TimeLockedContent] = [];
        private var secure_messages : [SecureMessage] = [];
        private var premium_contents : [PremiumContent] = [];
        
        // Content counters for unique IDs
        private var content_counter : Nat = 0;
        private var message_counter : Nat = 0;

        /**
         * Get the public key for IBE encryption
         * @param derivation_path - Context for key derivation
         * @returns The public key for encryption
         */
        public func get_public_key(derivation_path : [Blob]) : async Result.Result<Blob, Text> {
            try {
                let request : VetkdPublicKeyRequest = {
                    canister_id = null; // Use calling canister ID
                    derivation_path = derivation_path;
                    key_id = #test_key_1; // Use production_key_1 for mainnet
                };
                
                let response = await VETKD_SYSTEM_API.vetkd_public_key(request);
                #ok(response.public_key)
            } catch (error) {
                #err("Failed to get public key: " # Error.message(error))
            }
        };

        /**
         * Get an encrypted VetKey for decryption
         * @param derivation_path - Context for key derivation
         * @param encryption_public_key - Transport public key
         * @returns Encrypted VetKey
         */
        public func get_encrypted_key(
            derivation_path : [Blob], 
            encryption_public_key : Blob
        ) : async Result.Result<Blob, Text> {
            try {
                let derivation_id = Text.encodeUtf8("viragent-" # Int.toText(Time.now()));
                
                let request : VetkdDeriveEncryptedKeyRequest = {
                    public_key_derivation_path = derivation_path;
                    derivation_id = derivation_id;
                    key_id = #test_key_1;
                    encryption_public_key = encryption_public_key;
                };
                
                let response = await VETKD_SYSTEM_API.vetkd_derive_encrypted_key(request);
                #ok(response.encrypted_key)
            } catch (error) {
                #err("Failed to derive encrypted key: " # Error.message(error))
            }
        };

        /**
         * Store encrypted content
         * @param owner - Owner of the content
         * @param encrypted_data - The encrypted content
         * @param identity_bytes - IBE identity used for encryption
         * @param seed_bytes - Random seed used for encryption
         * @param content_type - Type of content
         * @param metadata - Optional metadata
         */
        public func store_encrypted_content(
            owner : Principal,
            encrypted_data : Blob,
            identity_bytes : Blob,
            seed_bytes : Blob,
            content_type : Text,
            metadata : ?Text
        ) : Text {
            content_counter += 1;
            let content_id = "content_" # Int.toText(content_counter);
            
            let new_content : EncryptedContent = {
                owner = owner;
                encrypted_data = encrypted_data;
                identity_bytes = identity_bytes;
                seed_bytes = seed_bytes;
                content_type = content_type;
                created_at = Time.now();
                metadata = metadata;
            };
            
            encrypted_contents := Array.append(encrypted_contents, [new_content]);
            content_id
        };

        /**
         * Get encrypted content for a user
         * @param owner - Owner of the content
         * @param content_type - Optional filter by content type
         * @returns Array of encrypted content
         */
        public func get_user_content(
            owner : Principal, 
            content_type : ?Text
        ) : [EncryptedContent] {
            let filtered = Array.filter<EncryptedContent>(encrypted_contents, func(content) {
                let owner_match = content.owner == owner;
                let type_match = switch (content_type) {
                    case null { true };
                    case (?t) { content.content_type == t };
                };
                owner_match and type_match
            });
            filtered
        };

        /**
         * Store time-locked content
         * @param creator - Creator of the content
         * @param encrypted_data - The encrypted content
         * @param identity_bytes - IBE identity for time-lock
         * @param seed_bytes - Random seed
         * @param unlock_time - When content can be unlocked
         * @returns Content ID
         */
        public func store_timelock_content(
            creator : Principal,
            encrypted_data : Blob,
            identity_bytes : Blob,
            seed_bytes : Blob,
            unlock_time : Int
        ) : Text {
            content_counter += 1;
            let content_id = "timelock_" # Int.toText(content_counter);
            
            let timelock_content : TimeLockedContent = {
                content_id = content_id;
                encrypted_data = encrypted_data;
                identity_bytes = identity_bytes;
                seed_bytes = seed_bytes;
                unlock_time = unlock_time;
                creator = creator;
                is_unlocked = false;
                created_at = Time.now();
            };
            
            timelock_contents := Array.append(timelock_contents, [timelock_content]);
            content_id
        };

        /**
         * Check if time-locked content can be unlocked
         * @param content_id - ID of the time-locked content
         * @returns Whether content can be unlocked
         */
        public func can_unlock_content(content_id : Text) : ?Bool {
            let found = Array.find<TimeLockedContent>(timelock_contents, func(content) {
                content.content_id == content_id
            });
            
            switch (found) {
                case null { null };
                case (?content) { ?(Time.now() >= content.unlock_time) };
            }
        };

        /**
         * Get time-locked content that's ready to be unlocked
         * @param requester - Principal requesting the content
         * @returns Array of unlockable content
         */
        public func get_unlockable_content(requester : Principal) : [TimeLockedContent] {
            let current_time = Time.now();
            Array.filter<TimeLockedContent>(timelock_contents, func(content) {
                (content.creator == requester or not content.is_unlocked) and 
                current_time >= content.unlock_time
            })
        };

        /**
         * Send a secure message between users
         * @param from_principal - Sender
         * @param to_principal - Recipient
         * @param encrypted_data - Encrypted message
         * @param identity_bytes - IBE identity
         * @param seed_bytes - Random seed
         * @returns Message ID
         */
        public func send_secure_message(
            from_principal : Principal,
            to_principal : Principal,
            encrypted_data : Blob,
            identity_bytes : Blob,
            seed_bytes : Blob
        ) : Text {
            message_counter += 1;
            let message_id = "msg_" # Int.toText(message_counter);
            
            let secure_message : SecureMessage = {
                message_id = message_id;
                from_principal = from_principal;
                to_principal = to_principal;
                encrypted_data = encrypted_data;
                identity_bytes = identity_bytes;
                seed_bytes = seed_bytes;
                timestamp = Time.now();
                is_read = false;
            };
            
            secure_messages := Array.append(secure_messages, [secure_message]);
            message_id
        };

        /**
         * Get secure messages for a user
         * @param user_principal - User to get messages for
         * @param as_sender - If true, get sent messages; if false, get received messages
         * @returns Array of secure messages
         */
        public func get_user_messages(
            user_principal : Principal, 
            as_sender : Bool
        ) : [SecureMessage] {
            Array.filter<SecureMessage>(secure_messages, func(message) {
                if (as_sender) {
                    message.from_principal == user_principal
                } else {
                    message.to_principal == user_principal
                }
            })
        };

        /**
         * Create premium content with access control
         * @param creator - Creator of the content
         * @param encrypted_data - The encrypted premium content
         * @param access_level - Access level required
         * @param access_key - Key for premium access
         * @param price - Optional price for access
         * @returns Content ID
         */
        public func create_premium_content(
            creator : Principal,
            encrypted_data : Blob,
            access_level : Text,
            access_key : Blob,
            price : ?Nat
        ) : Text {
            content_counter += 1;
            let content_id = "premium_" # Int.toText(content_counter);
            
            let premium_content : PremiumContent = {
                content_id = content_id;
                creator = creator;
                access_level = access_level;
                encrypted_data = encrypted_data;
                access_key = access_key;
                price = price;
                subscribers = [];
                created_at = Time.now();
            };
            
            premium_contents := Array.append(premium_contents, [premium_content]);
            content_id
        };

        /**
         * Subscribe to premium content
         * @param user_principal - User subscribing
         * @param content_id - ID of premium content
         * @returns Success or error message
         */
        public func subscribe_to_premium(
            user_principal : Principal, 
            content_id : Text
        ) : Result.Result<Text, Text> {
            // Find the premium content
            var found_index : ?Nat = null;
            var i = 0;
            for (content in premium_contents.vals()) {
                if (content.content_id == content_id) {
                    found_index := ?i;
                };
                i += 1;
            };
            
            switch (found_index) {
                case null { #err("Premium content not found") };
                case (?index) {
                    let content = premium_contents[index];
                    
                    // Check if already subscribed
                    let already_subscribed = Array.find<Principal>(content.subscribers, func(p) {
                        p == user_principal
                    });
                    
                    switch (already_subscribed) {
                        case (?_) { #err("Already subscribed") };
                        case null {
                            // Add subscriber
                            let updated_content = {
                                content with 
                                subscribers = Array.append(content.subscribers, [user_principal])
                            };
                            
                            // Update the array (in production, use stable storage)
                            let updated_contents = Array.tabulate<PremiumContent>(
                                premium_contents.size(),
                                func(idx) {
                                    if (idx == index) { updated_content } else { premium_contents[idx] }
                                }
                            );
                            premium_contents := updated_contents;
                            
                            #ok("Successfully subscribed to premium content")
                        };
                    }
                };
            }
        };

        /**
         * Get premium content for subscribed users
         * @param user_principal - User requesting content
         * @param content_id - ID of premium content
         * @returns Premium content if user has access
         */
        public func get_premium_content(
            user_principal : Principal, 
            content_id : Text
        ) : ?PremiumContent {
            let found = Array.find<PremiumContent>(premium_contents, func(content) {
                content.content_id == content_id and
                (content.creator == user_principal or 
                 Array.find<Principal>(content.subscribers, func(p) { p == user_principal }) != null)
            });
            found
        };

        /**
         * Get system statistics for admin purposes
         */
        public func get_system_stats() : {
            encrypted_contents_count : Nat;
            timelock_contents_count : Nat;
            secure_messages_count : Nat;
            premium_contents_count : Nat;
        } {
            {
                encrypted_contents_count = encrypted_contents.size();
                timelock_contents_count = timelock_contents.size();
                secure_messages_count = secure_messages.size();
                premium_contents_count = premium_contents.size();
            }
        };
    }
}
