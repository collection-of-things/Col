import { createSignal, createMemo } from 'solid-js'

import { Card, Form } from '@torch-ui/solid/layout'

import { Input, Checkbox } from '@torch-ui/solid/forms'

import { Button } from '@torch-ui/solid/actions'

import { PasswordStrengthIndicator, type PasswordStrength } from '@torch-ui/solid/feedback'



export function RegisterForm() {
  const [name, setName] = createSignal('')
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [agreed, setAgreed] = createSignal(false)
  const [loading, setLoading] = createSignal(false)

  // User implements their own analysis logic
  const analysis = createMemo(() => {
    const pwd = password()
    if (!pwd) return { strength: 'empty' as PasswordStrength, score: 0, details: [] }
    
    const hasLength = pwd.length >= 8
    const hasUpper = /[A-Z]/.test(pwd)
    const hasLower = /[a-z]/.test(pwd)
    const hasNumber = /\d/.test(pwd)
    const hasSymbol = /[!@#$%^&*]/.test(pwd)
    
    const met = [hasLength, hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length
    const score = (met / 5) * 100
    
    let strength: PasswordStrength = 'poor'
    if (met >= 4) strength = 'excellent'
    else if (met >= 3) strength = 'good'
    else if (met >= 2) strength = 'fair'
    
    return {
      strength,
      score,
      details: [
        { name: '8+ characters', passed: hasLength },
        { name: 'Uppercase', passed: hasUpper },
        { name: 'Lowercase', passed: hasLower },
        { name: 'Number', passed: hasNumber },
        { name: 'Symbol', passed: hasSymbol },
      ]
    }
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    if (!agreed()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setLoading(false)
  }

  return (
    <Card class="w-full max-w-sm mx-auto">
      <Card.Body>
        <div class="mb-6">
          <h2 class="text-xl font-bold text-ink-900">Create an account</h2>
          <p class="mt-1 text-sm text-ink-600">Get started for free. No credit card required.</p>
        </div>
        <Form onSubmit={handleSubmit} class="gap-4">
          <Input
            label="Full name"
            placeholder="Caelan Torchward"
            value={name()}
            onValueChange={setName}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email()}
            onValueChange={setEmail}
            required
          />
          <div class="flex flex-col gap-1.5">
            <Input
              label="Password"
              type="password"
              placeholder="Choose a strong password"
              value={password()}
              onValueChange={setPassword}
              required
            />
            <PasswordStrengthIndicator strength={analysis().strength} score={analysis().score} details={analysis().details} />
          </div>
          <Checkbox
            label="I agree to the Terms of Service and Privacy Policy"
            checked={agreed()}
            onValueChange={setAgreed}
          />
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading()}
            disabled={!agreed()}
          >
            Create account
          </Button>
        </Form>
        <p class="mt-4 text-center text-sm text-ink-500">
          Already have an account?{' '}
          <a href="#" class="text-primary-600 hover:underline">Sign in</a>
        </p>
      </Card.Body>
    </Card>
  )
}
import { render } from "solid-js/web";
export default function mount(target) { return render(() => <RegisterForm />, target); }
