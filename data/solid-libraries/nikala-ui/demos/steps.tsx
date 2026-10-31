import { Steps, Step } from "@/components/ui/steps";
import { PackageManagerTabs } from "@/components/ui/package-manager-tabs";
const importCode = `import { Steps, Step } from "@/components/ui/steps";`;
const defaultCode = `<Steps>
  <Step title="Initialize your project">
    <p>Run the initialization wizard to configure Tailwind CSS v4 and paths.</p>
    <PackageManagerTabs command="nikala init" />
  </Step>

  <Step title="Add UI components">
    <p>Choose any component from the registry and install it into your project.</p>
    <PackageManagerTabs command="nikala add button" />
  </Step>

  <Step title="Import and compose">
    <p>Import your components directly and enjoy fine-grained SolidJS reactivity.</p>
  </Step>
</Steps>`;
const horizontalCode = `<Steps orientation="horizontal">
  <Step variant="primary" title="Account">
    <p>Create username</p>
  </Step>

  <Step variant="primary" title="Profile">
    <p>Upload avatar</p>
  </Step>

  <Step variant="info" title="Billing">
    <p>Add payment</p>
  </Step>

  <Step title="Done">
    <p>Ready to go</p>
  </Step>
</Steps>`;
const variantsCode = `<Steps>
  <Step variant="primary" title="Step 1: Install Package">
    <p>Install the core package using your preferred package manager.</p>
  </Step>

  <Step variant="info" title="Step 2: Configure Plugins">
    <p>Add the Nikala UI Tailwind CSS plugin to your build pipeline.</p>
  </Step>

  <Step variant="success" title="Step 3: Verification">
    <p>All dependencies are verified and ready for production.</p>
  </Step>
</Steps>`;
export default function Demo() {

return <>
          <div class="w-full max-w-xl">
            <Steps>
              <Step title="Initialize your project">
                <p class="text-sm text-muted-foreground">
                  Run the initialization wizard to configure Tailwind CSS v4 and path aliases.
                </p>
                <PackageManagerTabs command="nikala init" />
              </Step>

              <Step title="Add UI components">
                <p class="text-sm text-muted-foreground">
                  Choose any component from the registry and install it into your project.
                </p>
                <PackageManagerTabs command="nikala add button" />
              </Step>

              <Step title="Import and compose">
                <p class="text-sm text-muted-foreground">
                  Import your components directly and enjoy fine-grained SolidJS reactivity with zero extra runtime.
                </p>
              </Step>
            </Steps>
          </div>
        </>;
}
