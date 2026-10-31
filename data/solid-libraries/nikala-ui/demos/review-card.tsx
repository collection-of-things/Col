import { Component, For } from "solid-js";
import {
  ReviewCard,
  ReviewHeader,
  ReviewProfile,
  ReviewAvatar,
  ReviewAuthor,
  ReviewRating,
  ReviewBody,
  ReviewFooter,
} from "@/components/ui/review-card";
import { Badge } from "@/components/ui/badge";
const reviews = [
  {
    name: "Alex River",
    username: "@alexriver",
    role: "Staff Engineer at Vercel",
    body: "Nikala UI + SolidJS is the fastest developer experience I have ever had. Fine-grained reactivity just works out of the box.",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    rating: 5,
    date: "2 days ago",
  },
  {
    name: "Sarah Chen",
    username: "@sarahc_dev",
    role: "Frontend Lead",
    body: "Tailwind v4 integration is flawless. Design tokens make dark mode and custom palettes completely seamless.",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    rating: 5,
    date: "1 week ago",
  },
  {
    name: "Davit Kakhidze",
    username: "@davit_k",
    role: "Founder at Studio",
    body: "The copy-paste model gives complete ownership. No locked dependencies, just clean, readable TypeScript components.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    rating: 5,
    date: "2 weeks ago",
  },
];
const importCode = `import {
  ReviewCard,
  ReviewHeader,
  ReviewProfile,
  ReviewAvatar,
  ReviewAuthor,
  ReviewRating,
  ReviewBody,
  ReviewFooter,
} from "@/components/ui/review-card";`;
const defaultCode = `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <For each={reviews}>
    {(review) => (
      <ReviewCard variant="default">
        <ReviewHeader>
          <ReviewProfile>
            <ReviewAvatar src={review.img} alt={review.name} />
            <ReviewAuthor
              name={review.name}
              role={review.role}
              verified={true}
            />
          </ReviewProfile>
          <ReviewRating value={review.rating} />
        </ReviewHeader>

        <ReviewBody>
          "{review.body}"
        </ReviewBody>

        <ReviewFooter>
          <span>Verified Buyer</span>
          <span>{review.date}</span>
        </ReviewFooter>
      </ReviewCard>
    )}
  </For>
</div>`;
const variantsCode = `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* 1. Default Card */}
  <ReviewCard variant="default">
    <ReviewHeader>
      <ReviewProfile>
        <ReviewAvatar fallback="AR" />
        <ReviewAuthor name="Alex River" username="@alexriver" verified />
      </ReviewProfile>
      <ReviewRating value={5} />
    </ReviewHeader>
    <ReviewBody>Default card variant with subtle shadow and border.</ReviewBody>
  </ReviewCard>

  {/* 2. Flat Style */}
  <ReviewCard variant="flat">
    <ReviewHeader>
      <ReviewProfile>
        <ReviewAvatar fallback="SC" />
        <ReviewAuthor name="Sarah Chen" username="@sarahc" verified />
      </ReviewProfile>
      <ReviewRating value={5} />
    </ReviewHeader>
    <ReviewBody>Flat variant with muted background and no outer border.</ReviewBody>
  </ReviewCard>

  {/* 3. Bordered High-Contrast */}
  <ReviewCard variant="bordered">
    <ReviewHeader>
      <ReviewProfile>
        <ReviewAvatar fallback="DK" />
        <ReviewAuthor name="Davit K." username="@davit" verified />
      </ReviewProfile>
      <ReviewRating value={5} />
    </ReviewHeader>
    <ReviewBody>Bordered variant with high contrast border width.</ReviewBody>
  </ReviewCard>
</div>`;
export default function Demo() {

return <>
          <div class="w-full max-w-4xl p-2">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <For each={reviews}>
                {(review) => (
                  <ReviewCard variant="default">
                    <ReviewHeader>
                      <ReviewProfile>
                        <ReviewAvatar src={review.img} alt={review.name} />
                        <ReviewAuthor
                          name={review.name}
                          role={review.role}
                          verified={true}
                        />
                      </ReviewProfile>
                      <ReviewRating value={review.rating} />
                    </ReviewHeader>

                    <ReviewBody>
                      "{review.body}"
                    </ReviewBody>

                    <ReviewFooter>
                      <span class="font-medium text-foreground/80">Verified User</span>
                      <span>{review.date}</span>
                    </ReviewFooter>
                  </ReviewCard>
                )}
              </For>
            </div>
          </div>
        </>;
}
