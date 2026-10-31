import {
  Bubble,
  BubbleGroup,
  BubbleContent,
  BubbleReactions,
  BubbleReaction,
} from "@/components/ui/bubble";
import { createSignal } from "solid-js";
const importCode = `import {
  Bubble,
  BubbleGroup,
  BubbleContent,
  BubbleReactions,
  BubbleReaction,
} from "@/components/ui/bubble";`;
const defaultCode = `<div class="flex flex-col gap-3 w-full max-w-sm">
  {/* Primary Bubble (Sent) */}
  <div class="flex justify-end">
    <Bubble variant="default">
      <BubbleContent>Have you benchmarked the new createChatScroll hook?</BubbleContent>
    </Bubble>
  </div>

  {/* Muted Bubble (Received) */}
  <div class="flex justify-start">
    <Bubble variant="muted">
      <BubbleContent>Yes! Zero hydration overhead and buttery smooth 60fps scrolling.</BubbleContent>
      <BubbleReactions>
        <BubbleReaction count={4} active>⚡</BubbleReaction>
        <BubbleReaction count={2}>🔥</BubbleReaction>
      </BubbleReactions>
    </Bubble>
  </div>
</div>`;
const variantsCode = `<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
  <Bubble variant="default">
    <BubbleContent>Primary / Sent Message</BubbleContent>
  </Bubble>

  <Bubble variant="muted">
    <BubbleContent>Muted / Received Message</BubbleContent>
  </Bubble>

  <Bubble variant="outline">
    <BubbleContent>Outline / Card Message</BubbleContent>
  </Bubble>

  <Bubble variant="ghost">
    <BubbleContent>Ghost / Minimal Message</BubbleContent>
  </Bubble>
</div>`;
export default function Demo() {
const [activeReaction, setActiveReaction] = createSignal(true);
const [reactionCount, setReactionCount] = createSignal(4);
const toggleReaction = () => {
    if (activeReaction()) {
      setActiveReaction(false);
      setReactionCount((c) => c - 1);
    } else {
      setActiveReaction(true);
      setReactionCount((c) => c + 1);
    }
  };
return <>
          <div class="flex items-center justify-center p-6 sm:p-10 w-full">
            <div class="flex flex-col gap-4 w-full max-w-sm">
              <div class="flex justify-end">
                <Bubble variant="default">
                  <BubbleContent>Have you benchmarked the new createChatScroll hook?</BubbleContent>
                </Bubble>
              </div>

              <div class="flex justify-start">
                <Bubble variant="muted">
                  <BubbleContent>Yes! Zero hydration overhead and buttery smooth 60fps scrolling.</BubbleContent>
                  <BubbleReactions>
                    <BubbleReaction
                      count={reactionCount()}
                      active={activeReaction()}
                      onClick={toggleReaction}
                    >
                      ⚡
                    </BubbleReaction>
                    <BubbleReaction count={2}>🔥</BubbleReaction>
                  </BubbleReactions>
                </Bubble>
              </div>
            </div>
          </div>
        </>;
}
