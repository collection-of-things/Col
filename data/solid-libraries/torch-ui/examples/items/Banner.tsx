import { Banner } from '@torch-ui/solid/feedback'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<Banner>
  The Arcane Compendium v2.0 is live — expanded spellbooks, new races, and fully customizable character sheets.
</Banner>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
