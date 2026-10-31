import { createSignal } from 'solid-js'

import { Drawer, Form } from '@torch-ui/solid/layout'

import { Input, TextArea, Select, MultiSelect } from '@torch-ui/solid/forms'

import { Button } from '@torch-ui/solid/actions'



const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending review' },
]

const TAG_OPTIONS = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'design', label: 'Design' },
  { value: 'devops', label: 'DevOps' },
  { value: 'data', label: 'Data' },
]

export function FormDrawer() {
  const [open, setOpen] = createSignal(false)
  const [loading, setLoading] = createSignal(false)

  const [projectName, setProjectName] = createSignal('')
  const [summary, setSummary] = createSignal('')
  const [status, setStatus] = createSignal('active')
  const [tags, setTags] = createSignal<string[]>([])

  function reset() {
    setProjectName('')
    setSummary('')
    setStatus('active')
    setTags([])
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
      <Button variant="primary" onClick={() => setOpen(true)}>New project</Button>

      <Drawer
        open={open()}
        onClose={() => setOpen(false)}
        onCloseComplete={reset}
        side="end"
        size="md"
        showCloseButton
      >
        <div class="flex h-full flex-col">
          <div class="border-b border-surface-border px-6 py-4">
            <h2 class="text-base font-semibold text-ink-900">New project</h2>
            <p class="mt-0.5 text-sm text-ink-500">Fill in the details to create a new project.</p>
          </div>
          <div class="flex-1 overflow-y-auto px-6 py-6">
            <Form onSubmit={handleSubmit} id="project-form">
              <Input label="Project name" placeholder="e.g. Website Redesign" value={projectName()} onValueChange={setProjectName} required />
              <TextArea label="Summary" placeholder="Brief description of the project goals" value={summary()} onValueChange={setSummary} rows={4} />
              <Select label="Status" options={STATUS_OPTIONS} value={status()} onValueChange={setStatus} />
              <MultiSelect label="Tags" options={TAG_OPTIONS} value={tags()} onValueChange={setTags} />
            </Form>
          </div>
          <div class="border-t border-surface-border px-6 py-4">
            <div class="flex justify-end gap-2">
              <Button variant="outlined" onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="primary" loading={loading()} type="submit" form="project-form">
                Create project
              </Button>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  )
}
import { render } from "solid-js/web";
export default function mount(target) { return render(() => <FormDrawer />, target); }
