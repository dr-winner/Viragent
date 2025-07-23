import Debug "mo:base/Debug";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import HashMap "mo:base/HashMap";

module SocialPlatforms {

    // HTTP Outcalls Types
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
        #put;
        #delete;
    };

    public type HttpResponsePayload = {
        status : Nat;
        headers : [HttpHeader];
        body : [Nat8];
    };

    public type TransformRawResponseFunction = {
        function : shared query TransformRawResponse -> async HttpResponsePayload;
        context : Blob;
    };

    public type TransformRawResponse = {
        status : Nat;
        body : [Nat8];
        headers : [HttpHeader];
        context : Blob;
    };

    // Platform Types
    public type Platform = {
        #Twitter;
        #Instagram;
        #LinkedIn;
        #Facebook;
        #TikTok;
        #Medium;
    };

    public type PlatformConfig = {
        platform : Platform;
        accessToken : Text;
        refreshToken : ?Text;
        userId : Text;
        apiVersion : Text;
        expiresAt : ?Int;
    };

    public type PostContent = {
        caption : Text;
        hashtags : [Text];
        mediaUrls : [Text];
        scheduledTime : ?Int;
        title : ?Text; // For Medium articles
        tags : ?[Text]; // For Medium tags (different from hashtags)
        publishStatus : ?Text; // For Medium: "public", "draft", "unlisted"
    };

    public type PostResult = {
        success : Bool;
        postId : ?Text;
        platformUrl : ?Text;
        error : ?Text;
        engagementData : ?EngagementMetrics;
    };

    public type EngagementMetrics = {
        likes : Nat;
        shares : Nat;
        comments : Nat;
        reach : Nat;
        impressions : Nat;
        clicks : Nat;
        timestamp : Int;
    };

    public type AccountInfo = {
        username : Text;
        displayName : Text;
        followers : Nat;
        following : Nat;
        verified : Bool;
        profileUrl : Text;
    };

    // Twitter API Integration
    public func postToTwitter(
        config : PlatformConfig,
        content : PostContent,
        httpOutcall : shared (HttpRequestArgs) -> async HttpResponsePayload,
    ) : async Result.Result<PostResult, Text> {

        Debug.print("Posting to Twitter...");

        // Build tweet text with hashtags
        let tweetText = content.caption # " " # Text.join(" ", content.hashtags.vals());

        // Twitter API v2 endpoint
        let requestBody = "{" #
        "\"text\": \"" # escapeJsonString(tweetText) # "\"" #
        "}";

        let bodyBytes = Text.encodeUtf8(requestBody);

        let httpRequest : HttpRequestArgs = {
            url = "https://api.twitter.com/2/tweets";
            max_response_bytes = ?2048;
            headers = [
                { name = "Content-Type"; value = "application/json" },
                {
                    name = "Authorization";
                    value = "Bearer " # config.accessToken;
                },
                { name = "User-Agent"; value = "Viragent/1.0" },
            ];
            body = ?Blob.toArray(bodyBytes);
            method = #post;
            transform = null;
        };

        try {
            let response = await httpOutcall(httpRequest);

            if (response.status == 201) {
                let responseText = switch (Text.decodeUtf8(Blob.fromArray(response.body))) {
                    case (?text) text;
                    case null return #err("Failed to decode Twitter response");
                };

                // Extract tweet ID from response (simplified)
                let tweetId = extractTwitterId(responseText);

                #ok({
                    success = true;
                    postId = ?tweetId;
                    platformUrl = ?("https://twitter.com/i/web/status/" # tweetId);
                    error = null;
                    engagementData = null;
                });
            } else {
                let errorMsg = "Twitter API request failed with status: " # Nat.toText(response.status);
                Debug.print(errorMsg);
                #err(errorMsg);
            };
        } catch (error) {
            Debug.print("HTTP request to Twitter failed");
            #err("HTTP request to Twitter failed");
        };
    };

    // Instagram API Integration (Instagram Basic Display API)
    public func postToInstagram(
        config : PlatformConfig,
        content : PostContent,
        httpOutcall : shared (HttpRequestArgs) -> async HttpResponsePayload,
    ) : async Result.Result<PostResult, Text> {

        Debug.print("Posting to Instagram...");

        // Instagram requires media upload first, then publish
        switch (content.mediaUrls.size()) {
            case (0) {
                #err("Instagram posts require at least one media item");
            };
            case (_) {
                // Step 1: Create media container
                let mediaUrl = content.mediaUrls[0];
                let caption = content.caption # " " # Text.join(" ", content.hashtags.vals());

                let containerUrl = "https://graph.instagram.com/v" # config.apiVersion # "/" # config.userId # "/media";
                let containerBody = "image_url=" # encodeURIComponent(mediaUrl) #
                "&caption=" # encodeURIComponent(caption) #
                "&access_token=" # config.accessToken;

                let containerRequest : HttpRequestArgs = {
                    url = containerUrl;
                    max_response_bytes = ?2048;
                    headers = [{
                        name = "Content-Type";
                        value = "application/x-www-form-urlencoded";
                    }];
                    body = ?Blob.toArray(Text.encodeUtf8(containerBody));
                    method = #post;
                    transform = null;
                };

                try {
                    let containerResponse = await httpOutcall(containerRequest);

                    if (containerResponse.status == 200) {
                        let containerResponseText = switch (Text.decodeUtf8(Blob.fromArray(containerResponse.body))) {
                            case (?text) text;
                            case null return #err("Failed to decode Instagram container response");
                        };

                        let containerId = extractInstagramContainerId(containerResponseText);

                        // Step 2: Publish the media
                        await publishInstagramMedia(config, containerId, httpOutcall);
                    } else {
                        let errorMsg = "Instagram container creation failed with status: " # Nat.toText(containerResponse.status);
                        Debug.print(errorMsg);
                        #err(errorMsg);
                    };
                } catch (error) {
                    Debug.print("HTTP request to Instagram failed");
                    #err("HTTP request to Instagram failed");
                };
            };
        };
    };

    // LinkedIn API Integration
    public func postToLinkedIn(
        config : PlatformConfig,
        content : PostContent,
        httpOutcall : shared (HttpRequestArgs) -> async HttpResponsePayload,
    ) : async Result.Result<PostResult, Text> {

        Debug.print("Posting to LinkedIn...");

        let postText = content.caption # "\n\n" # Text.join(" ", content.hashtags.vals());

        // LinkedIn Share API
        let requestBody = "{" #
        "\"author\": \"urn:li:person:" # config.userId # "\"," #
        "\"lifecycleState\": \"PUBLISHED\"," #
        "\"specificContent\": {" #
        "\"com.linkedin.ugc.ShareContent\": {" #
        "\"shareCommentary\": {" #
        "\"text\": \"" # escapeJsonString(postText) # "\"" #
        "}," #
        "\"shareMediaCategory\": \"NONE\"" #
        "}" #
        "}," #
        "\"visibility\": {" #
        "\"com.linkedin.ugc.MemberNetworkVisibility\": \"PUBLIC\"" #
        "}" #
        "}";

        let bodyBytes = Text.encodeUtf8(requestBody);

        let httpRequest : HttpRequestArgs = {
            url = "https://api.linkedin.com/v2/ugcPosts";
            max_response_bytes = ?2048;
            headers = [
                { name = "Content-Type"; value = "application/json" },
                {
                    name = "Authorization";
                    value = "Bearer " # config.accessToken;
                },
                { name = "X-Restli-Protocol-Version"; value = "2.0.0" },
            ];
            body = ?Blob.toArray(bodyBytes);
            method = #post;
            transform = null;
        };

        try {
            let response = await httpOutcall(httpRequest);

            if (response.status == 201) {
                let responseText = switch (Text.decodeUtf8(Blob.fromArray(response.body))) {
                    case (?text) text;
                    case null return #err("Failed to decode LinkedIn response");
                };

                let postId = extractLinkedInId(responseText);

                #ok({
                    success = true;
                    postId = ?postId;
                    platformUrl = ?("https://www.linkedin.com/feed/update/" # postId);
                    error = null;
                    engagementData = null;
                });
            } else {
                let errorMsg = "LinkedIn API request failed with status: " # Nat.toText(response.status);
                Debug.print(errorMsg);
                #err(errorMsg);
            };
        } catch (error) {
            Debug.print("HTTP request to LinkedIn failed");
            #err("HTTP request to LinkedIn failed");
        };
    };

    // Medium API Integration
    public func postToMedium(
        config : PlatformConfig,
        content : PostContent,
        httpOutcall : shared (HttpRequestArgs) -> async HttpResponsePayload,
    ) : async Result.Result<PostResult, Text> {

        Debug.print("Posting to Medium...");

        // First, get the user ID from Medium
        let userResult = await getMediumUserId(config, httpOutcall);
        
        switch (userResult) {
            case (#ok(userId)) {
                // Prepare the article content
                let title = switch (content.title) {
                    case (?t) t;
                    case null "Untitled Article";
                };

                let articleContent = content.caption;
                let tags = switch (content.tags) {
                    case (?t) t;
                    case null [];
                };

                let publishStatus = switch (content.publishStatus) {
                    case (?status) status;
                    case null "draft"; // Default to draft
                };

                // Build Medium article JSON
                let tagsJson = Array.foldLeft<Text, Text>(
                    tags,
                    "",
                    func(acc, tag) = 
                        if (acc == "") "\"" # tag # "\""
                        else acc # ",\"" # tag # "\""
                );

                let requestBody = "{" #
                "\"title\": \"" # escapeJsonString(title) # "\"," #
                "\"contentFormat\": \"html\"," #
                "\"content\": \"" # escapeJsonString(articleContent) # "\"," #
                "\"publishStatus\": \"" # publishStatus # "\"," #
                "\"tags\": [" # tagsJson # "]" #
                "}";

                let bodyBytes = Text.encodeUtf8(requestBody);

                let httpRequest : HttpRequestArgs = {
                    url = "https://api.medium.com/v1/users/" # userId # "/posts";
                    max_response_bytes = ?4096;
                    headers = [
                        { name = "Content-Type"; value = "application/json" },
                        { name = "Authorization"; value = "Bearer " # config.accessToken },
                        { name = "Accept"; value = "application/json" },
                        { name = "Accept-Charset"; value = "utf-8" },
                    ];
                    body = ?Blob.toArray(bodyBytes);
                    method = #post;
                    transform = null;
                };

                try {
                    let response = await httpOutcall(httpRequest);

                    if (response.status == 201) {
                        let responseText = switch (Text.decodeUtf8(Blob.fromArray(response.body))) {
                            case (?text) text;
                            case null return #err("Failed to decode Medium response");
                        };

                        let (postId, articleUrl) = extractMediumInfo(responseText);

                        #ok({
                            success = true;
                            postId = ?postId;
                            platformUrl = ?articleUrl;
                            error = null;
                            engagementData = null;
                        });
                    } else {
                        let errorMsg = "Medium API request failed with status: " # Nat.toText(response.status);
                        Debug.print(errorMsg);
                        
                        // Try to get error details from response
                        let errorDetails = switch (Text.decodeUtf8(Blob.fromArray(response.body))) {
                            case (?text) " - " # text;
                            case null "";
                        };
                        
                        #err(errorMsg # errorDetails);
                    };
                } catch (error) {
                    Debug.print("HTTP request to Medium failed");
                    #err("HTTP request to Medium failed");
                };
            };
            case (#err(error)) {
                #err("Failed to get Medium user ID: " # error);
            };
        };
    };

    // Get engagement metrics for a post
    public func getEngagementMetrics(
        config : PlatformConfig,
        postId : Text,
        httpOutcall : shared (HttpRequestArgs) -> async HttpResponsePayload,
    ) : async Result.Result<EngagementMetrics, Text> {

        switch (config.platform) {
            case (#Twitter) {
                await getTwitterEngagement(config, postId, httpOutcall);
            };
            case (#Instagram) {
                await getInstagramEngagement(config, postId, httpOutcall);
            };
            case (#LinkedIn) {
                await getLinkedInEngagement(config, postId, httpOutcall);
            };
            case (#Medium) {
                // Medium doesn't provide detailed engagement metrics through their API
                // Return basic metrics structure
                #ok({
                    likes = 0;
                    shares = 0;
                    comments = 0;
                    reach = 0;
                    impressions = 0;
                    clicks = 0;
                    timestamp = Time.now();
                });
            };
            case (_) { #err("Platform not supported for engagement metrics") };
        };
    };

    // Get account information
    public func getAccountInfo(
        config : PlatformConfig,
        httpOutcall : shared (HttpRequestArgs) -> async HttpResponsePayload,
    ) : async Result.Result<AccountInfo, Text> {

        switch (config.platform) {
            case (#Twitter) { await getTwitterAccountInfo(config, httpOutcall) };
            case (#Instagram) {
                await getInstagramAccountInfo(config, httpOutcall);
            };
            case (#LinkedIn) {
                await getLinkedInAccountInfo(config, httpOutcall);
            };
            case (#Medium) {
                await getMediumAccountInfo(config, httpOutcall);
            };
            case (_) { #err("Platform not supported for account info") };
        };
    };

    // Helper Functions
    private func publishInstagramMedia(
        config : PlatformConfig,
        containerId : Text,
        httpOutcall : shared (HttpRequestArgs) -> async HttpResponsePayload,
    ) : async Result.Result<PostResult, Text> {

        let publishUrl = "https://graph.instagram.com/v" # config.apiVersion # "/" # config.userId # "/media_publish";
        let publishBody = "creation_id=" # containerId # "&access_token=" # config.accessToken;

        let publishRequest : HttpRequestArgs = {
            url = publishUrl;
            max_response_bytes = ?2048;
            headers = [{
                name = "Content-Type";
                value = "application/x-www-form-urlencoded";
            }];
            body = ?Blob.toArray(Text.encodeUtf8(publishBody));
            method = #post;
            transform = null;
        };

        try {
            let response = await httpOutcall(publishRequest);

            if (response.status == 200) {
                let responseText = switch (Text.decodeUtf8(Blob.fromArray(response.body))) {
                    case (?text) text;
                    case null return #err("Failed to decode Instagram publish response");
                };

                let postId = extractInstagramPostId(responseText);

                #ok({
                    success = true;
                    postId = ?postId;
                    platformUrl = ?("https://www.instagram.com/p/" # postId);
                    error = null;
                    engagementData = null;
                });
            } else {
                let errorMsg = "Instagram publish failed with status: " # Nat.toText(response.status);
                Debug.print(errorMsg);
                #err(errorMsg);
            };
        } catch (error) {
            Debug.print("Instagram publish request failed");
            #err("Instagram publish request failed");
        };
    };

    private func getTwitterEngagement(
        config : PlatformConfig,
        postId : Text,
        httpOutcall : shared (HttpRequestArgs) -> async HttpResponsePayload,
    ) : async Result.Result<EngagementMetrics, Text> {

        let url = "https://api.twitter.com/2/tweets/" # postId # "?tweet.fields=public_metrics";

        let httpRequest : HttpRequestArgs = {
            url = url;
            max_response_bytes = ?2048;
            headers = [{
                name = "Authorization";
                value = "Bearer " # config.accessToken;
            }];
            body = null;
            method = #get;
            transform = null;
        };

        try {
            let response = await httpOutcall(httpRequest);

            if (response.status == 200) {
                let responseText = switch (Text.decodeUtf8(Blob.fromArray(response.body))) {
                    case (?text) text;
                    case null return #err("Failed to decode Twitter engagement response");
                };

                #ok(parseTwitterEngagement(responseText));
            } else {
                #err("Failed to fetch Twitter engagement metrics");
            };
        } catch (error) {
            #err("HTTP request for Twitter engagement failed");
        };
    };

    private func getInstagramEngagement(
        config : PlatformConfig,
        postId : Text,
        httpOutcall : shared (HttpRequestArgs) -> async HttpResponsePayload,
    ) : async Result.Result<EngagementMetrics, Text> {

        let url = "https://graph.instagram.com/v" # config.apiVersion # "/" # postId #
        "?fields=like_count,comments_count&access_token=" # config.accessToken;

        let httpRequest : HttpRequestArgs = {
            url = url;
            max_response_bytes = ?2048;
            headers = [];
            body = null;
            method = #get;
            transform = null;
        };

        try {
            let response = await httpOutcall(httpRequest);

            if (response.status == 200) {
                let responseText = switch (Text.decodeUtf8(Blob.fromArray(response.body))) {
                    case (?text) text;
                    case null return #err("Failed to decode Instagram engagement response");
                };

                #ok(parseInstagramEngagement(responseText));
            } else {
                #err("Failed to fetch Instagram engagement metrics");
            };
        } catch (error) {
            #err("HTTP request for Instagram engagement failed");
        };
    };

    private func getLinkedInEngagement(
        config : PlatformConfig,
        postId : Text,
        httpOutcall : shared (HttpRequestArgs) -> async HttpResponsePayload,
    ) : async Result.Result<EngagementMetrics, Text> {

        let url = "https://api.linkedin.com/v2/socialActions/" # postId;

        let httpRequest : HttpRequestArgs = {
            url = url;
            max_response_bytes = ?2048;
            headers = [{
                name = "Authorization";
                value = "Bearer " # config.accessToken;
            }];
            body = null;
            method = #get;
            transform = null;
        };

        try {
            let response = await httpOutcall(httpRequest);

            if (response.status == 200) {
                let responseText = switch (Text.decodeUtf8(Blob.fromArray(response.body))) {
                    case (?text) text;
                    case null return #err("Failed to decode LinkedIn engagement response");
                };

                #ok(parseLinkedInEngagement(responseText));
            } else {
                #err("Failed to fetch LinkedIn engagement metrics");
            };
        } catch (error) {
            #err("HTTP request for LinkedIn engagement failed");
        };
    };

    private func getTwitterAccountInfo(
        config : PlatformConfig,
        httpOutcall : shared (HttpRequestArgs) -> async HttpResponsePayload,
    ) : async Result.Result<AccountInfo, Text> {

        let url = "https://api.twitter.com/2/users/me?user.fields=public_metrics,verified";

        let httpRequest : HttpRequestArgs = {
            url = url;
            max_response_bytes = ?2048;
            headers = [{
                name = "Authorization";
                value = "Bearer " # config.accessToken;
            }];
            body = null;
            method = #get;
            transform = null;
        };

        try {
            let response = await httpOutcall(httpRequest);

            if (response.status == 200) {
                let responseText = switch (Text.decodeUtf8(Blob.fromArray(response.body))) {
                    case (?text) text;
                    case null return #err("Failed to decode Twitter account response");
                };

                #ok(parseTwitterAccountInfo(responseText));
            } else {
                #err("Failed to fetch Twitter account info");
            };
        } catch (error) {
            #err("HTTP request for Twitter account info failed");
        };
    };

    private func getInstagramAccountInfo(
        config : PlatformConfig,
        httpOutcall : shared (HttpRequestArgs) -> async HttpResponsePayload,
    ) : async Result.Result<AccountInfo, Text> {

        let url = "https://graph.instagram.com/v" # config.apiVersion # "/me?fields=account_type,media_count,followers_count&access_token=" # config.accessToken;

        let httpRequest : HttpRequestArgs = {
            url = url;
            max_response_bytes = ?2048;
            headers = [];
            body = null;
            method = #get;
            transform = null;
        };

        try {
            let response = await httpOutcall(httpRequest);

            if (response.status == 200) {
                let responseText = switch (Text.decodeUtf8(Blob.fromArray(response.body))) {
                    case (?text) text;
                    case null return #err("Failed to decode Instagram account response");
                };

                #ok(parseInstagramAccountInfo(responseText));
            } else {
                #err("Failed to fetch Instagram account info");
            };
        } catch (error) {
            #err("HTTP request for Instagram account info failed");
        };
    };

    private func getLinkedInAccountInfo(
        config : PlatformConfig,
        httpOutcall : shared (HttpRequestArgs) -> async HttpResponsePayload,
    ) : async Result.Result<AccountInfo, Text> {

        let url = "https://api.linkedin.com/v2/people/(id:" # config.userId # ")?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))";

        let httpRequest : HttpRequestArgs = {
            url = url;
            max_response_bytes = ?2048;
            headers = [{
                name = "Authorization";
                value = "Bearer " # config.accessToken;
            }];
            body = null;
            method = #get;
            transform = null;
        };

        try {
            let response = await httpOutcall(httpRequest);

            if (response.status == 200) {
                let responseText = switch (Text.decodeUtf8(Blob.fromArray(response.body))) {
                    case (?text) text;
                    case null return #err("Failed to decode LinkedIn account response");
                };

                #ok(parseLinkedInAccountInfo(responseText));
            } else {
                #err("Failed to fetch LinkedIn account info");
            };
        } catch (error) {
            #err("HTTP request for LinkedIn account info failed");
        };
    };

    // Medium Helper Functions
    private func getMediumUserId(
        config : PlatformConfig,
        httpOutcall : shared (HttpRequestArgs) -> async HttpResponsePayload,
    ) : async Result.Result<Text, Text> {

        let httpRequest : HttpRequestArgs = {
            url = "https://api.medium.com/v1/me";
            max_response_bytes = ?2048;
            headers = [
                { name = "Authorization"; value = "Bearer " # config.accessToken },
                { name = "Accept"; value = "application/json" },
            ];
            body = null;
            method = #get;
            transform = null;
        };

        try {
            let response = await httpOutcall(httpRequest);

            if (response.status == 200) {
                let responseText = switch (Text.decodeUtf8(Blob.fromArray(response.body))) {
                    case (?text) text;
                    case null return #err("Failed to decode Medium user response");
                };

                let userId = extractMediumUserId(responseText);
                #ok(userId);
            } else {
                #err("Failed to get Medium user ID with status: " # Nat.toText(response.status));
            };
        } catch (error) {
            #err("HTTP request for Medium user ID failed");
        };
    };

    private func getMediumAccountInfo(
        config : PlatformConfig,
        httpOutcall : shared (HttpRequestArgs) -> async HttpResponsePayload,
    ) : async Result.Result<AccountInfo, Text> {

        let httpRequest : HttpRequestArgs = {
            url = "https://api.medium.com/v1/me";
            max_response_bytes = ?2048;
            headers = [
                { name = "Authorization"; value = "Bearer " # config.accessToken },
                { name = "Accept"; value = "application/json" },
            ];
            body = null;
            method = #get;
            transform = null;
        };

        try {
            let response = await httpOutcall(httpRequest);

            if (response.status == 200) {
                let responseText = switch (Text.decodeUtf8(Blob.fromArray(response.body))) {
                    case (?text) text;
                    case null return #err("Failed to decode Medium account response");
                };

                #ok(parseMediumAccountInfo(responseText));
            } else {
                #err("Failed to fetch Medium account info");
            };
        } catch (error) {
            #err("HTTP request for Medium account info failed");
        };
    };

    // Parsing Functions (simplified implementations)
    private func extractTwitterId(response : Text) : Text {
        if (Text.contains(response, #text "\"id\":")) {
            "1234567890123456789" // Mock ID for now
        } else {
            "unknown";
        };
    };

    private func extractInstagramContainerId(response : Text) : Text {
        if (Text.contains(response, #text "\"id\":")) {
            "17841234567890123" // Mock container ID
        } else {
            "unknown";
        };
    };

    private func extractInstagramPostId(response : Text) : Text {
        if (Text.contains(response, #text "\"id\":")) {
            "ABC123def456" // Mock post ID
        } else {
            "unknown";
        };
    };

    private func extractLinkedInId(response : Text) : Text {
        if (Text.contains(response, #text "\"id\":")) {
            "urn:li:share:1234567890" // Mock LinkedIn ID
        } else {
            "unknown";
        };
    };

    private func parseTwitterEngagement(response : Text) : EngagementMetrics {
        {
            likes = 150;
            shares = 25;
            comments = 45;
            reach = 2500;
            impressions = 5000;
            clicks = 100;
            timestamp = Time.now();
        };
    };

    private func parseInstagramEngagement(response : Text) : EngagementMetrics {
        {
            likes = 200;
            shares = 30;
            comments = 60;
            reach = 3000;
            impressions = 6000;
            clicks = 120;
            timestamp = Time.now();
        };
    };

    private func parseLinkedInEngagement(response : Text) : EngagementMetrics {
        {
            likes = 80;
            shares = 15;
            comments = 25;
            reach = 1200;
            impressions = 2400;
            clicks = 60;
            timestamp = Time.now();
        };
    };

    private func extractMediumUserId(response : Text) : Text {
        // In a real implementation, you'd parse the JSON properly
        // Medium API returns: {"data":{"id":"1234567890abcdef","username":"username",...}}
        if (Text.contains(response, #text "\"id\":")) {
            "1234567890abcdef" // Mock user ID for now
        } else {
            "unknown";
        };
    };

    private func extractMediumInfo(response : Text) : (Text, Text) {
        // Medium API returns: {"data":{"id":"abc123","url":"https://medium.com/@user/title-abc123",...}}
        if (Text.contains(response, #text "\"id\":") and Text.contains(response, #text "\"url\":")) {
            ("abc123", "https://medium.com/@user/article-abc123") // Mock values
        } else {
            ("unknown", "https://medium.com");
        };
    };

    private func parseMediumAccountInfo(response : Text) : AccountInfo {
        // Medium API returns user data including username, name, etc.
        {
            username = "viragent_user";
            displayName = "Viragent User";
            followers = 0; // Medium API doesn't provide follower count
            following = 0; // Medium API doesn't provide following count
            verified = false;
            profileUrl = "https://medium.com/@viragent_user";
        };
    };

    private func parseTwitterAccountInfo(response : Text) : AccountInfo {
        {
            username = "viragent_user";
            displayName = "Viragent User";
            followers = 1250;
            following = 850;
            verified = false;
            profileUrl = "https://twitter.com/viragent_user";
        };
    };

    private func parseInstagramAccountInfo(response : Text) : AccountInfo {
        {
            username = "viragent_user";
            displayName = "Viragent User";
            followers = 2100;
            following = 950;
            verified = false;
            profileUrl = "https://instagram.com/viragent_user";
        };
    };

    private func parseLinkedInAccountInfo(response : Text) : AccountInfo {
        {
            username = "viragent-user";
            displayName = "Viragent User";
            followers = 850;
            following = 750;
            verified = false;
            profileUrl = "https://linkedin.com/in/viragent-user";
        };
    };

    // Utility Functions
    private func escapeJsonString(str : Text) : Text {
        var result = "";
        for (char in str.chars()) {
            if (char == '\"') {
                result #= "\\\"";
            } else if (char == '\\') {
                result #= "\\\\";
            } else if (char == '\n') {
                result #= "\\n";
            } else if (char == '\r') {
                result #= "\\r";
            } else if (char == '\t') {
                result #= "\\t";
            } else {
                result #= Text.fromChar(char);
            };
        };
        result;
    };

    private func encodeURIComponent(str : Text) : Text {
        // Simplified URL encoding
        var result = "";
        for (char in str.chars()) {
            if (char == ' ') {
                result #= "%20";
            } else if (char == '#') {
                result #= "%23";
            } else if (char == '&') {
                result #= "%26";
            } else if (char == '=') {
                result #= "%3D";
            } else {
                result #= Text.fromChar(char);
            };
        };
        result;
    };
};
