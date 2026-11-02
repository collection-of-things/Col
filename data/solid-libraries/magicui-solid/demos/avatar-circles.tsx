import { AvatarCircles } from "@/registry/magicui/avatar-circles";

const avatars = [
  "https://avatar.vercel.sh/jack",
  "https://avatar.vercel.sh/james",
  "https://avatar.vercel.sh/jane",
  "https://avatar.vercel.sh/jenny",
  "https://avatar.vercel.sh/jill",
  "https://avatar.vercel.sh/john",
].map(imageUrl => ({
  imageUrl,
  profileUrl: "#",
}));

export default function AvatarCirclesSample() {
  return <AvatarCircles numPeople={99} avatarUrls={avatars} />;
}
