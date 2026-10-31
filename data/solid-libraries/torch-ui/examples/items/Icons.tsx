import { useIcons } from '@torch-ui/solid';
function Example() { const icons = useIcons(); return <div class="flex items-center gap-4">{icons.check({ class: 'h-6 w-6 text-success-600', 'aria-hidden': 'true' })}{icons.close({ class: 'h-6 w-6 text-danger-600', 'aria-hidden': 'true' })}{icons.search({ class: 'h-6 w-6 text-ink-500', 'aria-hidden': 'true' })}{icons.calendar({ class: 'h-6 w-6 text-ink-500', 'aria-hidden': 'true' })}{icons.chevronRight({ class: 'h-6 w-6 text-ink-400', 'aria-hidden': 'true' })}</div> }
import { render } from "solid-js/web";
export default function mount(target) { return render(() => <Example />, target); }
