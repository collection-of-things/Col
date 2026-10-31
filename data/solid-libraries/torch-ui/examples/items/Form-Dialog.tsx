import { createSignal } from 'solid-js'

import { Dialog, Form } from '@torch-ui/solid/layout'

import { Input, TextArea, Select } from '@torch-ui/solid/forms'

import { Button } from '@torch-ui/solid/actions'



const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export function FormDialog() {
  const [open, setOpen] = createSignal(false)
  const [loading, setLoading] = createSignal(false)

  const [title, setTitle] = createSignal('')
  const [description, setDescription] = createSignal('')
  const [priority, setPriority] = createSignal('medium')

  function reset() {
    setTitle('')
    setDescription('')
    setPriority('medium')
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    setOpen(false)
    reset()
  }

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Create task
      </Button>

      <Dialog
        open={open()}
        onClose={() => setOpen(false)}
        onCloseComplete={reset}
        size="sm"
        showCloseButton
        header={<span class="text-base font-semibold text-ink-900">Create task</span>}
        footer={
          <div class="flex justify-end gap-2">
            <Button variant="outlined" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              loading={loading()}
              onClick={() => {
                const form = document.querySelector('[data-task-form]') as HTMLFormElement
                form?.requestSubmit()
              }}
            >
              Create task
            </Button>
          </div>
        }
      >
        <Form data-task-form onSubmit={handleSubmit} class="gap-4">
          <Input label="Title" placeholder="Short, descriptive task name" value={title()} onValueChange={setTitle} required />
          <TextArea label="Description" placeholder="What needs to be done?" value={description()} onValueChange={setDescription} rows={3} />
          <Select label="Priority" options={PRIORITY_OPTIONS} value={priority()} onValueChange={setPriority} />
        </Form>
      </Dialog>
    </>
  )
}
import { render } from "solid-js/web";
export default function mount(target) { return render(() => <FormDialog />, target); }
