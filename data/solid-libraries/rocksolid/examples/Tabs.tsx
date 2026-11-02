import { render } from "solid-js/web";
import Tab from "rocksolidjs/Tab";
import TabsContext from "rocksolidjs/TabsContext";
import TabPanel from "rocksolidjs/TabPanel";
import Tabs from "rocksolidjs/Tabs";

function Example() {
  return (
    <div dir="rtl" class="max-w-5xl w-full grid grid-cols-[100px_1fr] gap-4">
      <TabsContext defaultValue="home" tabId="orientation">
        <Tabs orientation="vertical">
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
