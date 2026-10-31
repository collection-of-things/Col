import { Button } from "@/components/ui/button";
import { showToast, ToastRegion, ToastList } from "@/components/ui/toast";
const importCode = `import { showToast, ToastRegion, ToastList } from "@/components/ui/toast";`;
const setupCode = `// Add ToastRegion to your root App layout (e.g., App.tsx or root layout)
export default function App() {
  return (
    <>
      <MainContent />
      <ToastRegion>
        <ToastList />
      </ToastRegion>
    </>
  );
}`;
const defaultCode = `showToast({
  title: "Event created",
  description: "Monday, January 3rd at 6:00pm",
});`;
const successCode = `showToast({
  title: "Changes saved",
  description: "Your profile preferences were updated successfully.",
  variant: "success",
});`;
const destructiveCode = `showToast({
  title: "Error occurred",
  description: "Could not connect to the remote database.",
  variant: "destructive",
});`;
export default function Demo() {

return <>
          <Button
            onClick={() =>
              showToast({
                title: "Event created",
                description: "Monday, January 3rd at 6:00pm",
              })
            }
          >
            Show Default Toast
          </Button>
        </>;
}
