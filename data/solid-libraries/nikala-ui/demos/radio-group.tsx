import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemLabel,
} from "@/components/ui/radio-group";
const importCode = `import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemLabel,
} from "@/components/ui/radio-group";`;
const defaultCode = `<RadioGroup defaultValue="comfortable">
  <RadioGroupItem value="default">
    <RadioGroupItemLabel>Default</RadioGroupItemLabel>
  </RadioGroupItem>
  <RadioGroupItem value="comfortable">
    <RadioGroupItemLabel>Comfortable</RadioGroupItemLabel>
  </RadioGroupItem>
  <RadioGroupItem value="compact">
    <RadioGroupItemLabel>Compact</RadioGroupItemLabel>
  </RadioGroupItem>
</RadioGroup>`;
const horizontalCode = `<RadioGroup orientation="horizontal" defaultValue="card">
  <RadioGroupItem value="card">
    <RadioGroupItemLabel>Card Payment</RadioGroupItemLabel>
  </RadioGroupItem>
  <RadioGroupItem value="paypal">
    <RadioGroupItemLabel>PayPal</RadioGroupItemLabel>
  </RadioGroupItem>
  <RadioGroupItem value="apple">
    <RadioGroupItemLabel>Apple Pay</RadioGroupItemLabel>
  </RadioGroupItem>
</RadioGroup>`;
const disabledCode = `<RadioGroup defaultValue="option-1">
  <RadioGroupItem value="option-1">
    <RadioGroupItemLabel>Active Option</RadioGroupItemLabel>
  </RadioGroupItem>
  <RadioGroupItem value="option-2" disabled>
    <RadioGroupItemLabel>Disabled Option</RadioGroupItemLabel>
  </RadioGroupItem>
</RadioGroup>`;
export default function Demo() {

return <>
          <RadioGroup defaultValue="comfortable">
            <RadioGroupItem value="default">
              <RadioGroupItemLabel>Default</RadioGroupItemLabel>
            </RadioGroupItem>
            <RadioGroupItem value="comfortable">
              <RadioGroupItemLabel>Comfortable</RadioGroupItemLabel>
            </RadioGroupItem>
            <RadioGroupItem value="compact">
              <RadioGroupItemLabel>Compact</RadioGroupItemLabel>
            </RadioGroupItem>
          </RadioGroup>
        </>;
}
