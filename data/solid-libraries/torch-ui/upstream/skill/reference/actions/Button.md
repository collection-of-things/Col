# Button

**Category:** actions
**Import:** `@torch-ui/solid/actions`
**Source:** `src/components/actions/Button.tsx`

## Exports

```ts
import {
  Button,
  type ButtonVariant,
  type ButtonProps
} from "@torch-ui/solid/actions";
```

## Props

```ts
export interface ButtonProps
	extends Omit<
		JSX.ButtonHTMLAttributes<HTMLButtonElement> & JSX.AnchorHTMLAttributes<HTMLAnchorElement>,
		'children' | 'onChange' | 'shape'
	> {
	/** Visual style of the button. Default: "primary" */
	variant?: ButtonVariant
	/** Button size. Default: "md" */
	size?: ComponentSize
	/** Stretch to fill the parent width. */
	fullWidth?: boolean
	/** Show a spinner and disable interaction. */
	loading?: boolean
	/** Remove the subtle box-shadow on filled variants. */
	disableElevation?: boolean
	/** Render as a square icon-only button (uses `icon` or `startIcon`). */
	iconOnly?: boolean
	/** Corner radius. Default: "rounded" (or "circle" when iconOnly). */
	radius?: 'circle' | 'rounded' | 'square'
	/** Icon element for icon-only mode. Falls back to `startIcon`. */
	icon?: JSX.Element
	/** Icon placed before the label. */
	startIcon?: JSX.Element
	/** Icon placed after the label. */
	endIcon?: JSX.Element
	/** Text label. When set, takes priority over `children`. */
	label?: string
	/** When set, renders as an anchor (`<a>`) with button styling. */
	href?: string
	/** Controlled pressed state for toggle mode (requires `onValueChange`). */
	pressed?: boolean
	/** Toggle callback. Setting both `pressed` and `onValueChange` enables toggle mode. */
	onValueChange?: (pressed: boolean) => void
	children?: JSX.Element
}
```

```ts
export type ButtonVariant =
	| 'primary'
	| 'primary-outline'
	| 'secondary'
	| 'outlined'
	| 'ghost'
	| 'link'
	| 'danger'
	| 'danger-outline'
	| 'danger-link'
	| 'success'
	| 'success-outline'
	| 'warning'
	| 'warning-outline'
	| 'info'
	| 'info-outline'
```
