import { DropdownMenu } from '@torch-ui/solid/navigation';
import { DropdownMenu as KobalteDropdownMenu } from '@kobalte/core/dropdown-menu';
import { Button } from '@torch-ui/solid/actions';
function Example() { return <div class="flex justify-start"><DropdownMenu><KobalteDropdownMenu.Trigger as={Button} variant="secondary" size="sm" class="outline-none focus-visible:ring-2 focus-visible:ring-primary-500">Actions</KobalteDropdownMenu.Trigger><DropdownMenu.Content class="min-w-[140px]"><DropdownMenu.Item onSelect={() => {}}>Inspect</DropdownMenu.Item><DropdownMenu.Item onSelect={() => {}}>Copy Scroll</DropdownMenu.Item><DropdownMenu.Item onSelect={() => {}} class="text-red-600 dark:text-red-400">Discard</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu></div> }
import { render } from "solid-js/web";
export default function mount(target) { return render(() => <Example />, target); }
