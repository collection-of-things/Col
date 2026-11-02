import { render } from "solid-js/web";
import Tab from "rocksolidjs/Tab";
import TabsContext from "rocksolidjs/TabsContext";
import TabPanel from "rocksolidjs/TabPanel";
import Tabs from "rocksolidjs/Tabs";

export function Example() {
  const moveVerticalFocus = (event: KeyboardEvent) => {
    if (event.key === "Home" || event.key === "End") event.preventDefault();
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    const tabs = Array.from((event.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('[role="tab"]'))
      .filter(tab => !tab.disabled && tab.getAttribute("aria-disabled") !== "true");
    if (!tabs.length) return;
    event.preventDefault();
    const current = Math.max(tabs.indexOf(document.activeElement as HTMLButtonElement), 0);
    const step = event.key === "ArrowDown" ? 1 : -1;
    tabs[(current + step + tabs.length) % tabs.length].focus();
  };
  return (
    <div dir="rtl" class="max-w-5xl w-full grid grid-cols-[100px_1fr] gap-4">
      <TabsContext defaultValue="home" tabId="orientation">
        <Tabs orientation="vertical" aria-orientation="vertical" onKeyDown={moveVerticalFocus} on:keydown={{ capture: true, handleEvent(event: KeyboardEvent) { if (event.key === "ArrowLeft" || event.key === "ArrowRight") event.stopPropagation(); } }}>
          <Tab label="Home" value="home" />
          <Tab label="Profile" value="profile" />
          <Tab label="Settings" value="settings" />
        </Tabs>
        <div>
          <TabPanel value="home">
            Welcome to the home page.
          </TabPanel>
          <TabPanel value="profile">
            View and manage your profile.
          </TabPanel>
          <TabPanel value="settings">
            Manage your account settings.
          </TabPanel>
        </div>
      </TabsContext>
    </div>
  );
}

export default function mount(target: HTMLElement) { return render(() => <Example />, target); }
