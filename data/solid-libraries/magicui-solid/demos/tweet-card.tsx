import { MagicTweet, type Tweet } from "@/registry/magicui/client-tweet-card";

const text = "Sample content: explore components with MagicUI Solid.";
const tweet: Tweet = {
  __typename: "Tweet",
  id_str: "0",
  lang: "en",
  created_at: "",
  text,
  display_text_range: [0, text.length],
  entities: { hashtags: [], urls: [], user_mentions: [], symbols: [] },
  user: {
    id_str: "0",
    name: "Sample Author",
    screen_name: "sample",
    profile_image_url_https: "https://avatar.vercel.sh/jane",
    profile_image_shape: "Circle",
    verified: false,
    is_blue_verified: false,
  },
  edit_control: { edit_tweet_ids: [], editable_until_msecs: "0", is_edit_eligible: false, edits_remaining: "0" },
  isEdited: false,
  isStaleEdit: false,
  favorite_count: 0,
  conversation_count: 0,
  news_action_type: "conversation",
  video: {
    aspectRatio: [16, 9],
    contentType: "video/mp4",
    durationMs: 2000,
    mediaAvailability: { status: "available" },
    poster: "",
    variants: [{ type: "video/mp4", src: "https://videos.pexels.com/video-files/27180348/12091515_2560_1440_50fps.mp4" }],
    videoId: { type: "tweet", id: "0" },
    viewCount: 0,
  },
};

export default function TweetCardSample() {
  return (
    <div data-tweet-sample class="flex w-full flex-1 items-center justify-center p-10">
      <style>{"[data-tweet-sample] video { width: 100%; aspect-ratio: 16 / 9; }"}</style>
      <MagicTweet tweet={tweet} />
    </div>
  );
}
