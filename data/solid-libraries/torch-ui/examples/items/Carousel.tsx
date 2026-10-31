import { Carousel } from '@torch-ui/solid/data-display';
function Example() { const slides = [1,2,3].map(n => ({ id: String(n), content: <div class="flex h-40 w-full items-center justify-center rounded-xl bg-surface-base border border-surface-border"><span class="text-2xl font-semibold text-ink-400">Slide {n}</span></div> })); return <Carousel slides={slides} autoPlayInterval={0} /> }
import { render } from "solid-js/web";
export default function mount(target) { return render(() => <Example />, target); }
