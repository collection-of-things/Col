import { onCleanup } from "solid-js";
import { HeroVideoDialog } from "@/registry/magicui/hero-video-dialog";

const thumbnail = "https://images.unsplash.com/photo-1736606355698-5efdb410fe93?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const sampleVideo = "https://videos.pexels.com/video-files/27180348/12091515_2560_1440_50fps.mp4";

export default function HeroVideoDialogSample() {
  const player = `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{height:100%;margin:0;background:#000}video{width:100%;height:100%}</style><video controls playsinline src="${sampleVideo}"></video>`;
  const video = URL.createObjectURL(new Blob([player], { type: "text/html" }));
  onCleanup(() => URL.revokeObjectURL(video));
  return (
    <div class="relative">
      <HeroVideoDialog class="block dark:hidden" animationStyle="from-center" videoSrc={video} thumbnailSrc={thumbnail} thumbnailAlt="Sample video thumbnail" />
      <HeroVideoDialog class="hidden dark:block" animationStyle="from-center" videoSrc={video} thumbnailSrc={thumbnail} thumbnailAlt="Sample video thumbnail" />
    </div>
  );
}
