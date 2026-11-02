import { createSignal, Show } from 'solid-js'

import { Card, Form, Section } from '@torch-ui/solid/layout'

import { Input, Switch, Select } from '@torch-ui/solid/forms'

import { Button } from '@torch-ui/solid/actions'

import { Tabs } from '@torch-ui/solid/navigation'

import { Alert } from '@torch-ui/solid/feedback'



const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'security', label: 'Security' },
  { id: 'notifications', label: 'Notifications' },
]

const TIMEZONE_OPTIONS = [
  { value: 'utc', label: 'UTC' },
  { value: 'america-new-york', label: 'America/New York' },
  { value: 'america-los-angeles', label: 'America/Los Angeles' },
  { value: 'europe-london', label: 'Europe/London' },
  { value: 'europe-paris', label: 'Europe/Paris' },
  { value: 'asia-tokyo', label: 'Asia/Tokyo' },
]

export function SettingsForm() {
  const [tab, setTab] = createSignal('profile')
  const [saved, setSaved] = createSignal(false)

  const [name, setName] = createSignal('Caelan Torchward')
  const [email, setEmail] = createSignal('caelan@torchui.dev')
  const [timezone, setTimezone] = createSignal('america-new-york')

  const [currentPassword, setCurrentPassword] = createSignal('')
  const [newPassword, setNewPassword] = createSignal('')
  const [confirmPassword, setConfirmPassword] = createSignal('')

  const [emailNotifs, setEmailNotifs] = createSignal(true)
  const [slackNotifs, setSlackNotifs] = createSignal(false)
  const [weeklyDigest, setWeeklyDigest] = createSignal(true)
  const [mentions, setMentions] = createSignal(true)

  async function handleSave(e: SubmitEvent) {
    e.preventDefault()
    await new Promise((r) => setTimeout(r, 800))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div class="w-full max-w-2xl mx-auto">
      <Tabs tabs={TABS} value={tab()} onValueChange={setTab} />

      <Show when={saved()}>
        <Alert status="success" class="mb-4">Settings saved successfully.</Alert>
      </Show>

      <Show when={tab() === 'profile'}>
        <Form onSubmit={handleSave}>
          <Section title="Personal Information" titleClass="text-base font-semibold text-ink-900">
            <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Full name" value={name()} onValueChange={setName} required />
              <Input label="Email" type="email" value={email()} onValueChange={setEmail} required />
            </div>
            <div class="mt-4">
              <Select label="Timezone" options={TIMEZONE_OPTIONS} value={timezone()} onValueChange={setTimezone} />
            </div>
          </Section>
          <div class="flex justify-end">
            <Button type="submit" variant="primary">Save changes</Button>
          </div>
        </Form>
      </Show>

      <Show when={tab() === 'security'}>
        <Form onSubmit={handleSave}>
          <Section title="Change Password" titleClass="text-base font-semibold text-ink-900">
            <div class="mt-4 flex flex-col gap-4">
              <Input label="Current password" type="password" autoComplete="current-password" placeholder="••••••••" value={currentPassword()} onValueChange={setCurrentPassword} required />
              <Input label="New password" type="password" autoComplete="new-password" placeholder="Choose a strong password" value={newPassword()} onValueChange={setNewPassword} required />
              <Input label="Confirm new password" type="password" autoComplete="new-password" placeholder="Repeat new password" value={confirmPassword()} onValueChange={setConfirmPassword} required />
            </div>
          </Section>
          <div class="flex justify-end">
            <Button type="submit" variant="primary">Update password</Button>
          </div>
        </Form>
      </Show>

      <Show when={tab() === 'notifications'}>
        <Form onSubmit={handleSave}>
          <Section title="Notification Preferences" titleClass="text-base font-semibold text-ink-900">
            <Card variant="flat" class="mt-4 divide-y divide-surface-border">
              <div class="flex items-center justify-between px-4 py-3">
                <div>
                  <p class="text-sm font-medium text-ink-900">Email notifications</p>
                  <p class="text-xs text-ink-500">Receive updates to your inbox</p>
                </div>
                <Switch checked={emailNotifs()} onValueChange={setEmailNotifs} />
              </div>
              <div class="flex items-center justify-between px-4 py-3">
                <div>
                  <p class="text-sm font-medium text-ink-900">Slack notifications</p>
                  <p class="text-xs text-ink-500">Get pinged in your Slack workspace</p>
                </div>
                <Switch checked={slackNotifs()} onValueChange={setSlackNotifs} />
              </div>
              <div class="flex items-center justify-between px-4 py-3">
                <div>
                  <p class="text-sm font-medium text-ink-900">Weekly digest</p>
                  <p class="text-xs text-ink-500">A summary of activity every Monday</p>
                </div>
                <Switch checked={weeklyDigest()} onValueChange={setWeeklyDigest} />
              </div>
              <div class="flex items-center justify-between px-4 py-3">
                <div>
                  <p class="text-sm font-medium text-ink-900">@mentions</p>
                  <p class="text-xs text-ink-500">Notify me when I am mentioned</p>
                </div>
                <Switch checked={mentions()} onValueChange={setMentions} />
              </div>
            </Card>
          </Section>
          <div class="flex justify-end">
            <Button type="submit" variant="primary">Save preferences</Button>
          </div>
        </Form>
      </Show>
    </div>
  )
}
import { render } from "solid-js/web";
export default function mount(target) { return render(() => <SettingsForm />, target); }
