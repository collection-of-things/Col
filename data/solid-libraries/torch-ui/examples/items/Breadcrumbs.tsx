import { Breadcrumbs } from '@torch-ui/solid/navigation'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<Breadcrumbs
  items={[
    { label: 'Realm', href: '/' },
    { label: 'Guild Hall', href: '/guild' },
    { label: 'Adventurer' },
  ]}
/>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
