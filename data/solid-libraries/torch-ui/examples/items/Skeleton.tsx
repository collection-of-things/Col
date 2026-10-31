import { createSignal } from 'solid-js'

import { Skeleton } from '@torch-ui/solid/feedback'

import { Card } from '@torch-ui/solid/layout'

import { Button } from '@torch-ui/solid/actions'



import { render } from "solid-js/web";
function Example() {

const [loaded, setLoaded] = createSignal(false);
return (<>
<Card>
  <Card.AvatarTitle
    name="Grog Strongjaw"
    loading={!loaded()}
  />
  <Card.Body>
    <Skeleton loaded={loaded()} block>
      <p class="text-sm text-ink-600">Content...</p>
    </Skeleton>
  </Card.Body>
</Card>
<Button onClick={() => setLoaded(v => !v)}>
  {loaded() ? 'Show skeleton' : 'Load it'}
</Button>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
