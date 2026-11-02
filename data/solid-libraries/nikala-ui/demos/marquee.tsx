import { Component, For } from "solid-js";
import { Marquee } from "@/components/ui/marquee";
import {
  ReviewCard,
  ReviewHeader,
  ReviewProfile,
  ReviewAvatar,
  ReviewAuthor,
  ReviewBody,
} from "@/components/ui/review-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Sparkles,
  Zap,
  Globe,
  Terminal,
  Shield,
  Layers,
  Cpu,
  Star,
} from "lucide-solid";
const reviews = [
  {
    name: "Alex River",
    username: "@alexriver",
    body: "Nikala UI + SolidJS is the fastest developer experience I have ever had. Fine-grained reactivity just works.",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  },
  {
    name: "Sarah Chen",
    username: "@sarahc_dev",
    body: "Tailwind v4 integration is flawless. Design tokens make dark mode seamless across the entire app.",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
  },
  {
    name: "Davit Kakhidze",
    username: "@davit_k",
    body: "The copy-paste model gives complete ownership. No locked dependencies, just clean TypeScript.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
  },
  {
    name: "Elena Rostova",
    username: "@elena_ux",
    body: "The AI MCP Server integration saved us hours when scaffolding new UI sections and dashboard layouts.",
    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
  },
];
const logos = [
  { name: "SolidJS", icon: Zap },
  { name: "Tailwind CSS", icon: Layers },
  { name: "TypeScript", icon: Terminal },
  { name: "Turborepo", icon: Cpu },
  { name: "Vite", icon: Sparkles },
  { name: "Kobalte UI", icon: Shield },
];
const importCode = `import { Marquee } from "@/components/ui/marquee";`;
const defaultCode = `<Marquee pauseOnHover fadeEdges duration="30s" class="py-4">
  <For each={reviews}>
    {(review) => (
      <ReviewCard class="w-72 shrink-0">
        <ReviewHeader>
          <ReviewProfile>
            <ReviewAvatar src={review.img} alt={review.name} />
            <ReviewAuthor name={review.name} username={review.username} />
          </ReviewProfile>
        </ReviewHeader>
        <ReviewBody class="line-clamp-2">
          "{review.body}"
        </ReviewBody>
      </ReviewCard>
    )}
  </For>
</Marquee>`;
const logosCode = `<Marquee pauseOnHover fadeEdges duration="25s" gap="2rem" class="py-6 border-y border-border/50 bg-muted/20">
  <For each={logos}>
    {(logo) => (
      <div class="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-md hover:bg-muted">
        <logo.icon class="size-5 text-primary" />
        <span>{logo.name}</span>
      </div>
    )}
  </For>
</Marquee>`;
const dualCode = `<div class="space-y-4">
  {/* Forward Row */}
  <Marquee pauseOnHover fadeEdges duration="35s">
    <For each={reviews}>
      {(review) => (
        <div class="w-64 shrink-0 rounded-lg border border-border bg-card p-3 shadow-2xs">
          <p class="text-xs text-muted-foreground">{review.body}</p>
        </div>
      )}
    </For>
  </Marquee>

  {/* Reverse Opposing Row */}
  <Marquee reverse pauseOnHover fadeEdges duration="35s">
    <For each={reviews}>
      {(review) => (
        <div class="w-64 shrink-0 rounded-lg border border-border bg-card p-3 shadow-2xs">
          <p class="text-xs text-muted-foreground">{review.body}</p>
        </div>
      )}
    </For>
  </Marquee>
</div>`;
const verticalCode = `<div class="h-80 overflow-hidden border border-border rounded-lg bg-card/40 p-4">
  <Marquee vertical pauseOnHover fadeEdges duration="20s" gap="1rem" class="h-full">
    <For each={reviews}>
      {(review) => (
        <div class="w-full rounded-lg border border-border bg-card p-3 shadow-2xs">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-semibold">{review.name}</span>
            <span class="text-[11px] text-muted-foreground">{review.username}</span>
          </div>
          <p class="text-xs text-muted-foreground">{review.body}</p>
        </div>
      )}
    </For>
  </Marquee>
</div>`;
export default function Demo() {

return <>
          <div class="w-full max-w-4xl overflow-hidden py-4">
            <Marquee pauseOnHover fadeEdges duration="30s">
              <For each={reviews}>
                {(review) => (
                  <ReviewCard class="w-72 shrink-0">
                    <ReviewHeader>
                      <ReviewProfile>
                        <ReviewAvatar src={review.img} alt={review.name} />
                        <ReviewAuthor name={review.name} username={review.username} />
                      </ReviewProfile>
                    </ReviewHeader>
                    <ReviewBody class="line-clamp-2">
                      "{review.body}"
                    </ReviewBody>
                  </ReviewCard>
                )}
              </For>
            </Marquee>
          </div>
        </>;
}
