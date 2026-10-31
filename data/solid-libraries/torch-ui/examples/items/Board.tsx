import { Board } from '@torch-ui/solid/data-display'



import { render } from "solid-js/web";
function Example() {

;
return (<div role="region" aria-label="Board, scroll horizontally" tabIndex={0} style={{ "max-width": "100%", "overflow-x": "auto" }}>
<Board>
  <Board.Column id="open" title="Open" count={2} color="#3b82f6">
    <Board.Card id="card-1">
      <p class="text-sm font-medium">Slay the Goblin King</p>
    </Board.Card>
    <Board.Card id="card-2">
      <p class="text-sm font-medium">Map the Greywood</p>
    </Board.Card>
  </Board.Column>
  <Board.Column id="active" title="In Progress" count={1} color="#f59e0b">
    <Board.Card id="card-3">
      <p class="text-sm font-medium">Recover the stolen grain</p>
    </Board.Card>
  </Board.Column>
  <Board.Column id="done" title="Completed" count={0} color="#22c55e" />
</Board>
</div>);
}
export default function mount(target) { return render(() => <Example />, target); }
