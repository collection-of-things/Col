import { createSignal, createMemo } from 'solid-js'

import { PasswordStrengthIndicator, type PasswordStrength } from '@torch-ui/solid/feedback'

import { Input } from '@torch-ui/solid/forms'



import { render } from "solid-js/web";
function Example() {

const [password, setPassword] = createSignal('')

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
return (<>
<Input
  type="password"
  label="Password"
  value={password()}
  onValueChange={setPassword}
/>
<PasswordStrengthIndicator 
  strength={analysis().strength}
  score={analysis().score}
  details={analysis().details}
/>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
