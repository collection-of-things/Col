import { Component } from "solid-js";
import {
  Stat,
  StatGroup,
  StatHeader,
  StatLabel,
  StatIcon,
  StatValue,
  StatUnit,
  StatTrend,
  StatHelpText,
} from "@/components/ui/stat";
import {
  DollarSign,
  Users,
  CreditCard,
  Activity,
  Zap,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-solid";
const importCode = `import {
  Stat,
  StatGroup,
  StatHeader,
  StatLabel,
  StatIcon,
  StatValue,
  StatUnit,
  StatTrend,
  StatHelpText,
} from "@/components/ui/stat";`;
const defaultCode = `<StatGroup columns={4}>
  <Stat>
    <StatHeader>
      <StatLabel>Total Revenue</StatLabel>
      <StatIcon>
        <DollarSign class="size-4" />
      </StatIcon>
    </StatHeader>
    <StatValue>
      <StatUnit>$</StatUnit>
      <span>45,231.89</span>
    </StatValue>
    <StatHelpText>
      <StatTrend type="up">+20.1%</StatTrend>
      <span>vs last month</span>
    </StatHelpText>
  </Stat>

  <Stat>
    <StatHeader>
      <StatLabel>Subscriptions</StatLabel>
      <StatIcon>
        <Users class="size-4" />
      </StatIcon>
    </StatHeader>
    <StatValue>+2,350</StatValue>
    <StatHelpText>
      <StatTrend type="up">+180.1%</StatTrend>
      <span>vs last month</span>
    </StatHelpText>
  </Stat>

  <Stat>
    <StatHeader>
      <StatLabel>Sales Count</StatLabel>
      <StatIcon>
        <CreditCard class="size-4" />
      </StatIcon>
    </StatHeader>
    <StatValue>12,234</StatValue>
    <StatHelpText>
      <StatTrend type="up">+19%</StatTrend>
      <span>vs last month</span>
    </StatHelpText>
  </Stat>

  <Stat>
    <StatHeader>
      <StatLabel>Active Now</StatLabel>
      <StatIcon>
        <Activity class="size-4" />
      </StatIcon>
    </StatHeader>
    <StatValue>+573</StatValue>
    <StatHelpText>
      <StatTrend type="down">-4.2%</StatTrend>
      <span>vs last hour</span>
    </StatHelpText>
  </Stat>
</StatGroup>`;
const heroStatsCode = `<div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center p-8 rounded-lg border border-border bg-card">
  <Stat variant="ghost" class="items-center">
    <StatValue class="text-3xl sm:text-4xl text-primary font-extrabold">100k+</StatValue>
    <StatLabel class="text-sm font-medium mt-1">Active Developers</StatLabel>
    <div class="text-xs text-muted-foreground mt-0.5">Worldwide community</div>
  </Stat>

  <Stat variant="ghost" class="items-center">
    <StatValue class="text-3xl sm:text-4xl text-primary font-extrabold">99.99%</StatValue>
    <StatLabel class="text-sm font-medium mt-1">Uptime SLA</StatLabel>
    <div class="text-xs text-muted-foreground mt-0.5">Enterprise reliability</div>
  </Stat>

  <Stat variant="ghost" class="items-center">
    <StatValue class="text-3xl sm:text-4xl text-primary font-extrabold">40+</StatValue>
    <StatLabel class="text-sm font-medium mt-1">Reactive Hooks</StatLabel>
    <div class="text-xs text-muted-foreground mt-0.5">SolidJS fine-grained</div>
  </Stat>

  <Stat variant="ghost" class="items-center">
    <StatValue class="text-3xl sm:text-4xl text-primary font-extrabold">&lt; 1ms</StatValue>
    <StatLabel class="text-sm font-medium mt-1">Signal Latency</StatLabel>
    <div class="text-xs text-muted-foreground mt-0.5">Zero VDOM overhead</div>
  </Stat>
</div>`;
const variantsCode = `<StatGroup columns={3}>
  {/* 1. Default Card */}
  <Stat variant="default">
    <StatHeader>
      <StatLabel>Monthly Active</StatLabel>
      <StatIcon><Users class="size-4" /></StatIcon>
    </StatHeader>
    <StatValue>84,200</StatValue>
    <StatHelpText>
      <StatTrend type="up">+14.2%</StatTrend>
      <span>Default card style</span>
    </StatHelpText>
  </Stat>

  {/* 2. Flat Style */}
  <Stat variant="flat">
    <StatHeader>
      <StatLabel>API Requests</StatLabel>
      <StatIcon><Zap class="size-4" /></StatIcon>
    </StatHeader>
    <StatValue>1.4M</StatValue>
    <StatHelpText>
      <StatTrend type="neutral">0.0%</StatTrend>
      <span>Flat muted background</span>
    </StatHelpText>
  </Stat>

  {/* 3. Bordered Style */}
  <Stat variant="bordered">
    <StatHeader>
      <StatLabel>Error Rate</StatLabel>
      <StatIcon><ShieldCheck class="size-4" /></StatIcon>
    </StatHeader>
    <StatValue>
      <span>0.02</span>
      <StatUnit>%</StatUnit>
    </StatValue>
    <StatHelpText>
      <StatTrend type="down">-0.8%</StatTrend>
      <span>Bordered high-contrast</span>
    </StatHelpText>
  </Stat>
</StatGroup>`;
export default function Demo() {

return <>
          <div class="w-full max-w-4xl p-2">
            <StatGroup columns={4}>
              <Stat>
                <StatHeader>
                  <StatLabel>Total Revenue</StatLabel>
                  <StatIcon>
                    <DollarSign class="size-4" />
                  </StatIcon>
                </StatHeader>
                <StatValue>
                  <StatUnit>$</StatUnit>
                  <span>45,231.89</span>
                </StatValue>
                <StatHelpText>
                  <StatTrend type="up">+20.1%</StatTrend>
                  <span>vs last month</span>
                </StatHelpText>
              </Stat>

              <Stat>
                <StatHeader>
                  <StatLabel>Subscriptions</StatLabel>
                  <StatIcon>
                    <Users class="size-4" />
                  </StatIcon>
                </StatHeader>
                <StatValue>+2,350</StatValue>
                <StatHelpText>
                  <StatTrend type="up">+180.1%</StatTrend>
                  <span>vs last month</span>
                </StatHelpText>
              </Stat>

              <Stat>
                <StatHeader>
                  <StatLabel>Sales Count</StatLabel>
                  <StatIcon>
                    <CreditCard class="size-4" />
                  </StatIcon>
                </StatHeader>
                <StatValue>12,234</StatValue>
                <StatHelpText>
                  <StatTrend type="up">+19%</StatTrend>
                  <span>vs last month</span>
                </StatHelpText>
              </Stat>

              <Stat>
                <StatHeader>
                  <StatLabel>Active Now</StatLabel>
                  <StatIcon>
                    <Activity class="size-4" />
                  </StatIcon>
                </StatHeader>
                <StatValue>+573</StatValue>
                <StatHelpText>
                  <StatTrend type="down">-4.2%</StatTrend>
                  <span>vs last hour</span>
                </StatHelpText>
              </Stat>
            </StatGroup>
          </div>
        </>;
}
