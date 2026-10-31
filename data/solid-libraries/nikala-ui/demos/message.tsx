import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
  MessageFooter,
  MessageActions,
} from "@/components/ui/message";
import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
  BubbleReaction,
} from "@/components/ui/bubble";
import { Marker, MarkerTyping, MarkerDate } from "@/components/ui/marker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Bot, Check } from "lucide-solid";
import { createSignal } from "solid-js";
const importCode = `import {
  Message,
  MessageAvatar,
  MessageHeader,
  MessageContent,
  MessageFooter,
  MessageActions,
} from "@/components/ui/message";
import {
  Bubble,
  BubbleGroup,
  BubbleContent,
  BubbleReactions,
  BubbleReaction,
} from "@/components/ui/bubble";
import { Marker, MarkerTyping, MarkerDate } from "@/components/ui/marker";`;
const defaultCode = `<div class="flex w-full max-w-sm flex-col gap-4 py-6">
  {/* 1. Sent Message (align="end") */}
  <Message align="end">
    <MessageAvatar>
      <Avatar>
        <AvatarImage src="/avatars/01.png" alt="@giorgi" />
        <AvatarFallback>GM</AvatarFallback>
      </Avatar>
    </MessageAvatar>
    <MessageContent>
      <Bubble>
        <BubbleContent>Just upgraded our design tokens to Tailwind CSS v4.</BubbleContent>
      </Bubble>
    </MessageContent>
  </Message>

  {/* 2. Received Message (align="start") */}
  <Message>
    <MessageAvatar>
      <Avatar>
        <AvatarImage src="/avatars/02.png" alt="@sandro" />
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>
    </MessageAvatar>
    <MessageContent>
      <Bubble variant="muted">
        <BubbleContent>Awesome! Did you verify the dark theme contrast ratios?</BubbleContent>
      </Bubble>
    </MessageContent>
  </Message>

  {/* 3. Sent Message with Footer */}
  <Message align="end">
    <MessageAvatar>
      <Avatar>
        <AvatarImage src="/avatars/01.png" alt="@giorgi" />
        <AvatarFallback>GM</AvatarFallback>
      </Avatar>
    </MessageAvatar>
    <MessageContent>
      <Bubble>
        <BubbleContent>All 27 components and primitives pass WCAG AA standards.</BubbleContent>
      </Bubble>
      <MessageFooter>Delivered</MessageFooter>
    </MessageContent>
  </Message>

  {/* 4. Grouped Received Messages with Reactions */}
  <Message>
    <MessageAvatar>
      <Avatar>
        <AvatarImage src="/avatars/02.png" alt="@sandro" />
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>
    </MessageAvatar>
    <MessageContent>
      <BubbleGroup>
        <Bubble variant="muted">
          <BubbleContent>Great work! Let's deploy the preview build to staging.</BubbleContent>
        </Bubble>
        <Bubble variant="muted">
          <BubbleContent>I will review the pull request right away.</BubbleContent>
          <BubbleReactions aria-label="Reactions: thumbs up">
            <BubbleReaction count={2} active>🚀</BubbleReaction>
            <BubbleReaction count={1}>👍</BubbleReaction>
          </BubbleReactions>
        </Bubble>
      </BubbleGroup>
    </MessageContent>
  </Message>

  {/* 5. Live Typing Marker */}
  <Marker role="status">
    <MarkerTyping name="Sandro" />
  </Marker>
</div>`;
const aiChatCode = `<Message>
  <MessageAvatar>
    <Avatar>
      <AvatarFallback class="bg-primary/20 text-primary"><Bot class="size-4" /></AvatarFallback>
    </Avatar>
  </MessageAvatar>
  <MessageContent>
    <MessageHeader>
      <span class="font-bold text-foreground">Nikala AI</span>
      <Badge variant="outline" class="text-[10px] px-1 py-0 border-primary/30 text-primary">Model</Badge>
      <span class="text-[11px]">Just now</span>
    </MessageHeader>
    <Bubble variant="outline" class="p-3.5 space-y-2">
      <BubbleContent>
        SolidJS uses fine-grained reactive primitives that update the DOM directly without virtual DOM reconciliation.
      </BubbleContent>
    </Bubble>
    <MessageActions>
      <Button variant="ghost" size="sm" class="h-6 px-1.5 text-xs"><Copy class="size-3" /></Button>
    </MessageActions>
  </MessageContent>
</Message>`;
export default function Demo() {
const [copied, setCopied] = createSignal(false);
return <>
          <div class="flex items-center justify-center p-6 sm:p-12 w-full">
            <div class="flex w-full max-w-sm flex-col gap-4">
              {/* 1. Sent Message */}
              <Message align="end">
                <MessageAvatar>
                  <Avatar>
                    <AvatarFallback class="bg-primary text-primary-foreground text-xs font-bold">GM</AvatarFallback>
                  </Avatar>
                </MessageAvatar>
                <MessageContent>
                  <Bubble>
                    <BubbleContent>Just upgraded our design tokens to Tailwind CSS v4.</BubbleContent>
                  </Bubble>
                </MessageContent>
              </Message>

              {/* 2. Received Message */}
              <Message>
                <MessageAvatar>
                  <Avatar>
                    <AvatarFallback class="bg-muted text-foreground text-xs font-bold">SM</AvatarFallback>
                  </Avatar>
                </MessageAvatar>
                <MessageContent>
                  <Bubble variant="muted">
                    <BubbleContent>Awesome! Did you verify the dark theme contrast ratios?</BubbleContent>
                  </Bubble>
                </MessageContent>
              </Message>

              {/* 3. Sent Message with Footer */}
              <Message align="end">
                <MessageAvatar>
                  <Avatar>
                    <AvatarFallback class="bg-primary text-primary-foreground text-xs font-bold">GM</AvatarFallback>
                  </Avatar>
                </MessageAvatar>
                <MessageContent>
                  <Bubble>
                    <BubbleContent>All 27 components and primitives pass WCAG AA standards.</BubbleContent>
                  </Bubble>
                  <MessageFooter>Delivered</MessageFooter>
                </MessageContent>
              </Message>

              {/* 4. Grouped Received Messages with Reactions */}
              <Message>
                <MessageAvatar>
                  <Avatar>
                    <AvatarFallback class="bg-muted text-foreground text-xs font-bold">SM</AvatarFallback>
                  </Avatar>
                </MessageAvatar>
                <MessageContent>
                  <BubbleGroup>
                    <Bubble variant="muted">
                      <BubbleContent>Great work! Let's deploy the preview build to staging.</BubbleContent>
                    </Bubble>
                    <Bubble variant="muted">
                      <BubbleContent>I will review the pull request right away.</BubbleContent>
                      <BubbleReactions aria-label="Reactions: thumbs up">
                        <BubbleReaction count={2} active>🚀</BubbleReaction>
                        <BubbleReaction count={1}>👍</BubbleReaction>
                      </BubbleReactions>
                    </Bubble>
                  </BubbleGroup>
                </MessageContent>
              </Message>

              {/* 5. Live Typing Marker */}
              <Marker role="status">
                <MarkerTyping name="Sandro" />
              </Marker>
            </div>
          </div>
        </>;
}
