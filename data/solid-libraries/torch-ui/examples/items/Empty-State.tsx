import { StatCard } from '@torch-ui/solid/data-display'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<StatCard
  label="Quests completed"
  value={null}
  emptyText="No quests in progress"
/>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
