import {
  Marker,
  MarkerContent,
  MarkerTyping,
  MarkerDate,
} from "@/components/ui/marker";
const importCode = `import {
  Marker,
  MarkerContent,
  MarkerTyping,
  MarkerDate,
} from "@/components/ui/marker";`;
const defaultCode = `<div class="flex flex-col gap-4 w-full max-w-sm">
  {/* Date Divider Marker */}
  <MarkerDate date="Today, 3:45 PM" />

  {/* System Status Event Marker */}
  <Marker role="status">
    <MarkerContent>
      <span>🚀 Release v1.3.0 deployed to edge servers</span>
    </MarkerContent>
  </Marker>

  {/* Live Typing Indicator Marker */}
  <Marker role="status">
    <MarkerTyping name="Nikala Bot" />
  </Marker>
</div>`;
const typingCode = `<div class="space-y-3 w-full max-w-xs">
  <MarkerTyping name="Giorgi" />
  <MarkerTyping name="Claude Assistant" />
  <MarkerTyping />
</div>`;
export default function Demo() {

return <>
          <div class="flex items-center justify-center p-6 sm:p-10 w-full">
            <div class="flex flex-col gap-4 w-full max-w-sm">
              <MarkerDate date="Today, 3:45 PM" />

              <Marker role="status">
                <MarkerContent>
                  <span>🚀 Release v1.3.0 deployed to edge servers</span>
                </MarkerContent>
              </Marker>

              <Marker role="status">
                <MarkerTyping name="Nikala Bot" />
              </Marker>
            </div>
          </div>
        </>;
}
