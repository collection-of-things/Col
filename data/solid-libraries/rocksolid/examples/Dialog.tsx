import { render } from "solid-js/web";
import { createEffect, createSignal } from "solid-js";
import Button from "rocksolidjs/Button";
import Dialog from "rocksolidjs/Dialog";
import DialogActions from "rocksolidjs/DialogActions";
import DialogContent from "rocksolidjs/DialogContent";
import DialogTitle from "rocksolidjs/DialogTitle";

function Example() {
  const [open, setOpen] = createSignal(false);

  let openButton!: HTMLButtonElement,
      closeBtn!: HTMLButtonElement;

  createEffect(() => {
    if (open()) {
      closeBtn.focus();
    }
  });

  const handleDialogClose = () => {
    setOpen(false);
    openButton.focus();
  };

  return (
    <>
      <Button
        ref={openButton}
        onClick={() => setOpen(true)}
      >
        Open dialog
      </Button>

      <Dialog
        open={open()}
        aria-labelledby="getting-started-dialog-title"
        onClose={handleDialogClose}
        class="max-w-md"
      >
        <DialogTitle id="getting-started-dialog-title">
          Getting Started
        </DialogTitle>
        <DialogContent>
          Complete the setup to access all available features.
        </DialogContent>
        <DialogActions>
          <Button
            ref={closeBtn}
            onClick={handleDialogClose}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function mount(target: HTMLElement) { return render(() => <Example />, target); }
