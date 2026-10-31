import { EmptyState } from '@torch-ui/solid/data-display'



import { render } from "solid-js/web";
function Example() {

;
return (<div class="w-full max-w-lg rounded-xl border border-ink-200">
  <EmptyState title="No quests available" description="Check the tavern board after the next guild post." />
</div>);
}
export default function mount(target) { return render(() => <Example />, target); }
