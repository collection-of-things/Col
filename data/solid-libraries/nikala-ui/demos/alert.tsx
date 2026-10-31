import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Terminal, CircleCheck, Info, TriangleAlert, CircleAlert } from "lucide-solid";
const importCode = `import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";`;
const defaultCode = `<Alert class="max-w-md">
  <Terminal class="h-4 w-4" />
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can add components to your app using the nikala CLI tool.
  </AlertDescription>
</Alert>`;
const variantsCode = `<div class="flex flex-col gap-4 max-w-md w-full">
  <Alert variant="default">
    <Info class="h-4 w-4" />
    <AlertTitle>Default Alert</AlertTitle>
    <AlertDescription>Standard system notification banner.</AlertDescription>
  </Alert>

  <Alert variant="info">
    <Info class="h-4 w-4" />
    <AlertTitle>Information</AlertTitle>
    <AlertDescription>New update available for installation.</AlertDescription>
  </Alert>

  <Alert variant="success">
    <CheckCircle class="h-4 w-4" />
    <AlertTitle>Success</AlertTitle>
    <AlertDescription>Component added to your project successfully.</AlertDescription>
  </Alert>

  <Alert variant="warning">
    <AlertTriangle class="h-4 w-4" />
    <AlertTitle>Warning</AlertTitle>
    <AlertDescription>Your session is about to expire in 5 minutes.</AlertDescription>
  </Alert>

  <Alert variant="destructive">
    <AlertCircle class="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
  </Alert>
</div>`;
const closableCode = `<Alert variant="warning" closable={true} class="max-w-md">
  <AlertTriangle class="h-4 w-4" />
  <AlertTitle>Dismissible Alert</AlertTitle>
  <AlertDescription>
    Click the X button on the top right to dismiss this banner.
  </AlertDescription>
</Alert>`;
export default function Demo() {

return <>
          <div class="w-full max-w-md">
            <Alert>
              <Terminal class="h-4 w-4" />
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>
                You can add components to your app using the nikala CLI tool.
              </AlertDescription>
            </Alert>
          </div>
        </>;
}
