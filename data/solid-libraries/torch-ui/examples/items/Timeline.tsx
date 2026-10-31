import { Timeline } from '@torch-ui/solid/data-display'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<Timeline
  items={[
    { title: 'Quest accepted', description: 'Took the goblin raid contract from the Thornwall notice board.', time: 'Dawn', status: 'completed' },
    { title: 'Entered the Greywood', description: 'Tracked the goblin raiding party northward.', time: 'Morning', status: 'completed' },
    { title: 'Combat — goblin camp', description: 'Engaging three goblins and a worg.', time: 'Midday', status: 'active' },
    { title: 'Recover the stolen grain', description: "Search the camp for the farmer's stores.", status: 'pending' },
    { title: 'Return to Thornwall', status: 'pending' },
  ]}
/>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
