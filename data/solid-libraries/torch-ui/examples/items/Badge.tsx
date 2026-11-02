import { Avatar, Badge } from '@torch-ui/solid/data-display'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<Avatar name="Lyra Dawnseeker" badge={<Badge variant="success" />} />
<Avatar name="Theron" badge={<Badge variant="warning" />} />
<Avatar name="Guild" badge={<Badge variant="primary">3</Badge>} badgeKind="content" badgeSize="md" />
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
