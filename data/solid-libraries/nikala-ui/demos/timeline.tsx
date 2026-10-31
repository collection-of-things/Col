import { createSignal, For, Show } from "solid-js";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelinePoint,
  TimelineConnector,
  TimelineContent,
  TimelineOppositeContent,
  TimelineTitle,
  TimelineDescription,
  TimelineTime,
} from "@/components/ui/timeline";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Package,
  Truck,
  CreditCard,
  Home,
  GitCommit,
  GitBranch,
  Rocket,
  AlertTriangle,
  Clock,
  Sparkles,
} from "lucide-solid";
const importCode = `import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelinePoint,
  TimelineConnector,
  TimelineContent,
  TimelineOppositeContent,
  TimelineTitle,
  TimelineDescription,
  TimelineTime,
} from "@/components/ui/timeline";`;
const defaultCode = `<Timeline>
  {/* Step 1: Completed */}
  <TimelineItem>
    <TimelineSeparator>
      <TimelinePoint status="success">
        <Check class="size-4" />
      </TimelinePoint>
      <TimelineConnector />
    </TimelineSeparator>
    <TimelineContent>
      <div class="flex items-center justify-between gap-2">
        <TimelineTitle>Order Placed</TimelineTitle>
        <TimelineTime>Oct 14, 09:30 AM</TimelineTime>
      </div>
      <TimelineDescription>Your order #NK-9281 has been received and logged.</TimelineDescription>
    </TimelineContent>
  </TimelineItem>

  {/* Step 2: Completed */}
  <TimelineItem>
    <TimelineSeparator>
      <TimelinePoint status="success">
        <CreditCard class="size-4" />
      </TimelinePoint>
      <TimelineConnector />
    </TimelineSeparator>
    <TimelineContent>
      <div class="flex items-center justify-between gap-2">
        <TimelineTitle>Payment Confirmed</TimelineTitle>
        <TimelineTime>Oct 14, 09:32 AM</TimelineTime>
      </div>
      <TimelineDescription>Payment of $149.00 processed via Stripe.</TimelineDescription>
    </TimelineContent>
  </TimelineItem>

  {/* Step 3: In Progress */}
  <TimelineItem>
    <TimelineSeparator>
      <TimelinePoint status="primary">
        <Package class="size-4" />
      </TimelinePoint>
      <TimelineConnector dashed />
    </TimelineSeparator>
    <TimelineContent>
      <div class="flex items-center justify-between gap-2">
        <TimelineTitle class="text-primary">Fulfillment & Packaging</TimelineTitle>
        <TimelineTime>In Progress</TimelineTime>
      </div>
      <TimelineDescription>Items packed at Tbilisi Logistics Hub.</TimelineDescription>
    </TimelineContent>
  </TimelineItem>

  {/* Step 4: Pending */}
  <TimelineItem>
    <TimelineSeparator>
      <TimelinePoint status="muted">
        <Truck class="size-4" />
      </TimelinePoint>
    </TimelineSeparator>
    <TimelineContent>
      <div class="flex items-center justify-between gap-2">
        <TimelineTitle class="text-muted-foreground">Out for Delivery</TimelineTitle>
        <TimelineTime>Pending</TimelineTime>
      </div>
      <TimelineDescription>Courier dispatch scheduled for tomorrow.</TimelineDescription>
    </TimelineContent>
  </TimelineItem>
</Timeline>`;
const alternateCode = `<Timeline align="alternate">
  <TimelineItem>
    <TimelineOppositeContent>
      <TimelineTime>Q1 2026</TimelineTime>
    </TimelineOppositeContent>
    <TimelineSeparator>
      <TimelinePoint status="success">
        <Rocket class="size-4" />
      </TimelinePoint>
      <TimelineConnector />
    </TimelineSeparator>
    <TimelineContent>
      <TimelineTitle>Nikala UI v1.0 Launch</TimelineTitle>
      <TimelineDescription>Official public release with 40+ primitives and Tailwind CSS v4 support.</TimelineDescription>
    </TimelineContent>
  </TimelineItem>

  <TimelineItem>
    <TimelineOppositeContent>
      <TimelineTime>Q2 2026</TimelineTime>
    </TimelineOppositeContent>
    <TimelineSeparator>
      <TimelinePoint status="primary">
        <Sparkles class="size-4" />
      </TimelinePoint>
      <TimelineConnector />
    </TimelineSeparator>
    <TimelineContent>
      <TimelineTitle>AI MCP Server Integration</TimelineTitle>
      <TimelineDescription>Context-aware Model Context Protocol tools for Cursor, Windsurf, and Claude.</TimelineDescription>
    </TimelineContent>
  </TimelineItem>

  <TimelineItem>
    <TimelineOppositeContent>
      <TimelineTime>Q3 2026</TimelineTime>
    </TimelineOppositeContent>
    <TimelineSeparator>
      <TimelinePoint status="muted">
        <GitBranch class="size-4" />
      </TimelinePoint>
    </TimelineSeparator>
    <TimelineContent>
      <TimelineTitle>Enterprise Template Suite</TimelineTitle>
      <TimelineDescription>Full-stack dashboard boilerplates with SSR authentication and TanStack table presets.</TimelineDescription>
    </TimelineContent>
  </TimelineItem>
</Timeline>`;
const horizontalCode = `<Timeline orientation="horizontal">
  <TimelineItem>
    <TimelineSeparator>
      <TimelinePoint status="success"><Check class="size-3.5" /></TimelinePoint>
      <TimelineConnector />
    </TimelineSeparator>
    <TimelineContent>
      <TimelineTitle class="text-xs">1. Build</TimelineTitle>
      <TimelineTime>24s</TimelineTime>
    </TimelineContent>
  </TimelineItem>

  <TimelineItem>
    <TimelineSeparator>
      <TimelinePoint status="success"><Check class="size-3.5" /></TimelinePoint>
      <TimelineConnector />
    </TimelineSeparator>
    <TimelineContent>
      <TimelineTitle class="text-xs">2. Unit Tests</TimelineTitle>
      <TimelineTime>12s</TimelineTime>
    </TimelineContent>
  </TimelineItem>

  <TimelineItem>
    <TimelineSeparator>
      <TimelinePoint status="primary"><Clock class="size-3.5" /></TimelinePoint>
      <TimelineConnector dashed />
    </TimelineSeparator>
    <TimelineContent>
      <TimelineTitle class="text-xs text-primary">3. Deploy</TimelineTitle>
      <TimelineTime>Running...</TimelineTime>
    </TimelineContent>
  </TimelineItem>

  <TimelineItem>
    <TimelineSeparator>
      <TimelinePoint status="muted"><Home class="size-3.5" /></TimelinePoint>
    </TimelineSeparator>
    <TimelineContent>
      <TimelineTitle class="text-xs text-muted-foreground">4. Production</TimelineTitle>
      <TimelineTime>Queued</TimelineTime>
    </TimelineContent>
  </TimelineItem>
</Timeline>`;
export function TimelineHeroDemo() {
  return (
    <div class="w-full max-w-lg p-2">
      <Timeline>
        <TimelineItem>
          <TimelineSeparator>
            <TimelinePoint status="success">
              <Check class="size-4" />
            </TimelinePoint>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <div class="flex items-center justify-between gap-2">
              <TimelineTitle>Order Placed</TimelineTitle>
              <TimelineTime>Oct 14, 09:30 AM</TimelineTime>
            </div>
            <TimelineDescription>Your order #NK-9281 has been received and logged.</TimelineDescription>
          </TimelineContent>
        </TimelineItem>

        <TimelineItem>
          <TimelineSeparator>
            <TimelinePoint status="success">
              <CreditCard class="size-4" />
            </TimelinePoint>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <div class="flex items-center justify-between gap-2">
              <TimelineTitle>Payment Confirmed</TimelineTitle>
              <TimelineTime>Oct 14, 09:32 AM</TimelineTime>
            </div>
            <TimelineDescription>Payment of $149.00 processed via Stripe.</TimelineDescription>
          </TimelineContent>
        </TimelineItem>

        <TimelineItem>
          <TimelineSeparator>
            <TimelinePoint status="primary">
              <Package class="size-4" />
            </TimelinePoint>
            <TimelineConnector dashed />
          </TimelineSeparator>
          <TimelineContent>
            <div class="flex items-center justify-between gap-2">
              <TimelineTitle class="text-primary">Fulfillment & Packaging</TimelineTitle>
              <Badge variant="outline" class="text-[10px] h-5">In Progress</Badge>
            </div>
            <TimelineDescription>Items packed at Tbilisi Logistics Hub.</TimelineDescription>
          </TimelineContent>
        </TimelineItem>

        <TimelineItem>
          <TimelineSeparator>
            <TimelinePoint status="muted">
              <Truck class="size-4" />
            </TimelinePoint>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <div class="flex items-center justify-between gap-2">
              <TimelineTitle class="text-muted-foreground">Out for Delivery</TimelineTitle>
              <TimelineTime>Pending</TimelineTime>
            </div>
            <TimelineDescription>Courier dispatch scheduled for tomorrow morning.</TimelineDescription>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </div>
  );
}
export function TimelineAlternateDemo() {
  return (
    <div class="w-full max-w-2xl p-2">
      <Timeline align="alternate">
        <TimelineItem>
          <TimelineOppositeContent>
            <TimelineTime>Q1 2026</TimelineTime>
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelinePoint status="success">
              <Rocket class="size-4" />
            </TimelinePoint>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <TimelineTitle>Nikala UI v1.0 Launch</TimelineTitle>
            <TimelineDescription>Official public release with 40+ primitives and Tailwind CSS v4 support.</TimelineDescription>
          </TimelineContent>
        </TimelineItem>

        <TimelineItem>
          <TimelineOppositeContent>
            <TimelineTime>Q2 2026</TimelineTime>
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelinePoint status="primary">
              <Sparkles class="size-4" />
            </TimelinePoint>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <TimelineTitle>AI MCP Server Integration</TimelineTitle>
            <TimelineDescription>Context-aware Model Context Protocol tools for Cursor, Windsurf, and Claude.</TimelineDescription>
          </TimelineContent>
        </TimelineItem>

        <TimelineItem>
          <TimelineOppositeContent>
            <TimelineTime>Q3 2026</TimelineTime>
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelinePoint status="muted">
              <GitBranch class="size-4" />
            </TimelinePoint>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <TimelineTitle>Enterprise Template Suite</TimelineTitle>
            <TimelineDescription>Full-stack dashboard boilerplates with SSR authentication and TanStack table presets.</TimelineDescription>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </div>
  );
}
export default function Demo() {

return <>
          <TimelineHeroDemo />
        </>;
}
