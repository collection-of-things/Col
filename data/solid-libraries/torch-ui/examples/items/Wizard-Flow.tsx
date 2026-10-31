import { createSignal, Show } from 'solid-js'

import { Card, Form, WizardStepper } from '@torch-ui/solid/layout'

import { Input, Select, Checkbox } from '@torch-ui/solid/forms'

import { Button } from '@torch-ui/solid/actions'



const STEP_LABELS = ['Account', 'Organization', 'Review']

const ROLE_OPTIONS = [
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'manager', label: 'Manager' },
  { value: 'executive', label: 'Executive' },
  { value: 'other', label: 'Other' },
]

const TEAM_SIZE_OPTIONS = [
  { value: '1', label: 'Just me' },
  { value: '2-10', label: '2–10 people' },
  { value: '11-50', label: '11–50 people' },
  { value: '51-200', label: '51–200 people' },
  { value: '200+', label: '200+ people' },
]

export function WizardFlow() {
  const [step, setStep] = createSignal(1)
  const [submitting, setSubmitting] = createSignal(false)
  const [done, setDone] = createSignal(false)

  const [name, setName] = createSignal('')
  const [email, setEmail] = createSignal('')
  const [role, setRole] = createSignal('developer')
  const [orgName, setOrgName] = createSignal('')
  const [teamSize, setTeamSize] = createSignal('2-10')
  const [acceptUpdates, setAcceptUpdates] = createSignal(true)

  async function handleFinish(e: SubmitEvent) {
    e.preventDefault()
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1200))
    setSubmitting(false)
    setDone(true)
  }

  if (done()) {
    return (
      <Card class="w-full max-w-lg mx-auto text-center">
        <Card.Body class="py-12">
          <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <svg class="h-7 w-7 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="text-xl font-bold text-ink-900">You're all set!</h2>
          <p class="mt-2 text-sm text-ink-600">Welcome, {name()}. Your workspace <strong>{orgName()}</strong> is ready.</p>
        </Card.Body>
      </Card>
    )
  }

  return (
    <Card class="w-full max-w-lg mx-auto">
      <Card.Body>
        <WizardStepper step={step()} totalSteps={STEP_LABELS.length} stepLabels={STEP_LABELS} variant="pills" class="mb-6" />

        <Show when={step() === 1}>
          <Form onSubmit={(e) => { e.preventDefault(); setStep(2) }} class="gap-4">
            <div>
              <h2 class="text-lg font-semibold text-ink-900">Your account</h2>
              <p class="mt-1 text-sm text-ink-600">Tell us a little about yourself.</p>
            </div>
            <Input label="Full name" placeholder="Caelan Torchward" value={name()} onValueChange={setName} required />
            <Input label="Work email" type="email" placeholder="you@company.com" value={email()} onValueChange={setEmail} required />
            <Select label="Your role" options={ROLE_OPTIONS} value={role()} onValueChange={setRole} />
            <div class="flex justify-end">
              <Button type="submit" variant="primary">Next</Button>
            </div>
          </Form>
        </Show>

        <Show when={step() === 2}>
          <Form onSubmit={(e) => { e.preventDefault(); setStep(3) }} class="gap-4">
            <div>
              <h2 class="text-lg font-semibold text-ink-900">Your organization</h2>
              <p class="mt-1 text-sm text-ink-600">Set up your team workspace.</p>
            </div>
            <Input label="Organization name" placeholder="Acme Corp" value={orgName()} onValueChange={setOrgName} required />
            <Select label="Team size" options={TEAM_SIZE_OPTIONS} value={teamSize()} onValueChange={setTeamSize} />
            <Checkbox label="Send me product updates and tips" checked={acceptUpdates()} onValueChange={setAcceptUpdates} />
            <div class="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button type="submit" variant="primary">Next</Button>
            </div>
          </Form>
        </Show>

        <Show when={step() === 3}>
          <Form onSubmit={handleFinish} class="gap-4">
            <div>
              <h2 class="text-lg font-semibold text-ink-900">Review &amp; confirm</h2>
              <p class="mt-1 text-sm text-ink-600">Everything look right?</p>
            </div>
            <Card variant="flat" class="divide-y divide-surface-border">
              <div class="flex justify-between px-4 py-2.5 text-sm">
                <span class="text-ink-500">Name</span>
                <span class="font-medium text-ink-900">{name()}</span>
              </div>
              <div class="flex justify-between px-4 py-2.5 text-sm">
                <span class="text-ink-500">Email</span>
                <span class="font-medium text-ink-900">{email()}</span>
              </div>
              <div class="flex justify-between px-4 py-2.5 text-sm">
                <span class="text-ink-500">Organization</span>
                <span class="font-medium text-ink-900">{orgName()}</span>
              </div>
            </Card>
            <div class="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
              <Button type="submit" variant="primary" loading={submitting()}>Finish setup</Button>
            </div>
          </Form>
        </Show>
      </Card.Body>
    </Card>
  )
}
import { render } from "solid-js/web";
export default function mount(target) { return render(() => <WizardFlow />, target); }
