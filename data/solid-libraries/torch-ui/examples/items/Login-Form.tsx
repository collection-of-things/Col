import { createSignal } from 'solid-js'

import { Card, Divider, Form } from '@torch-ui/solid/layout'

import { Input, Checkbox } from '@torch-ui/solid/forms'

import { Button } from '@torch-ui/solid/actions'



export function LoginForm() {
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [remember, setRemember] = createSignal(false)
  const [loading, setLoading] = createSignal(false)

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setLoading(false)
  }

  return (
    <Card class="w-full max-w-sm mx-auto">
      <Card.Body>
        <div class="mb-6">
          <h2 class="text-xl font-bold text-ink-900">Sign in</h2>
          <p class="mt-1 text-sm text-ink-600">Welcome back. Enter your credentials to continue.</p>
        </div>
        <Form onSubmit={handleSubmit} class="gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email()}
            onValueChange={setEmail}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password()}
            onValueChange={setPassword}
            required
          />
          <div class="flex items-center justify-between">
            <Checkbox
              label="Remember me"
              checked={remember()}
              onValueChange={setRemember}
            />
            <a href="#" class="text-sm text-primary-600 hover:underline">
              Forgot password?
            </a>
          </div>
          <Button type="submit" variant="primary" fullWidth loading={loading()}>
            Sign in
          </Button>
        </Form>
        <Divider label="or continue with" class="my-4" />
        <Button variant="outlined" fullWidth>
          Continue with Google
        </Button>
      </Card.Body>
    </Card>
  )
}
import { render } from "solid-js/web";
export default function mount(target) { return render(() => <LoginForm />, target); }
