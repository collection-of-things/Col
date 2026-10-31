import { createSignal } from "solid-js";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  HoverCardArrow,
} from "@/components/ui/hover-card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
const importCode = `import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  HoverCardArrow,
} from "@/components/ui/hover-card";`;
export default function Demo() {
const [isFollowing, setIsFollowing] = createSignal(false);
return <>
          <div class="flex items-center justify-center py-8">
            <HoverCard>
              <HoverCardTrigger href="https://github.com/magradze" target="_blank">
                @magradze
              </HoverCardTrigger>
              <HoverCardContent class="w-80">
                <HoverCardArrow />
                <div class="flex justify-between space-x-4">
                  <Avatar class="h-10 w-10">
                    <AvatarImage src="https://github.com/magradze.png" alt="Magradze" />
                    <AvatarFallback>NM</AvatarFallback>
                  </Avatar>
                  <div class="space-y-1 text-left flex-1">
                    <div class="flex items-center justify-between">
                      <h4 class="text-sm font-semibold">Giorgi Magradze</h4>
                      <Button
                        size="sm"
                        variant={isFollowing() ? "outline" : "default"}
                        onClick={() => setIsFollowing(!isFollowing())}
                        class="h-7 px-2.5 text-xs"
                      >
                        {isFollowing() ? "Following" : "Follow"}
                      </Button>
                    </div>
                    <p class="text-xs text-muted-foreground">
                      Creator of Nikala UI. Building elegant SolidJS UI primitives.
                    </p>
                    <div class="flex items-center pt-2 gap-4 text-xs text-muted-foreground">
                      <span><strong class="text-foreground">1.2k</strong> Followers</span>
                      <span><strong class="text-foreground">180</strong> Following</span>
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </>;
}
