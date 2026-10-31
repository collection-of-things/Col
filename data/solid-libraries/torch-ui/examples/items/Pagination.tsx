import { createSignal } from 'solid-js';import { Pagination } from '@torch-ui/solid/navigation'



import { render } from "solid-js/web";
function Example() {

const [page, setPage] = createSignal(1);
return (<>
<Pagination page={page()} totalPages={10} onPageChange={setPage} />
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
