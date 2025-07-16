type UserId = Principal;
type MediaId = Text;
type PostId = Text;
type ToneId = Text;

type MediaItem = {
  id : MediaId;
  owner : Principal;
  url : Text;
  mediaType : Text;
  status : Text;
  createdAt : Int;
};

type ToneConfig = {
  id : ToneId;
  name : Text;
  configJson : Text;
};

type ScheduledPost = {
  id : PostId;
  mediaId : MediaId;
  platform : Text;
  scheduledAt : Int;
  status : Text;
};

type AIOutput = {
  mediaId : MediaId;
  caption : Text;
  hashtags : [Text];
  score : Float;
  generatedAt : Int;
};

type EngagementData = {
  postId : PostId;
  likes : Nat;
  shares : Nat;
  comments : Nat;
  reach : Nat;
  sentimentScore : Float;
  timestamp : Int;
};