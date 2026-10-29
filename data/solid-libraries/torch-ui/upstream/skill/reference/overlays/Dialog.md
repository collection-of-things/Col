# Dialog

**Category:** overlays
**Import:** `@torch-ui/solid/overlays`
**Source:** `src/components/overlays/Dialog.tsx`

## Exports

```ts
import {
  Dialog,
  type DialogSize,
  type DialogOverlayAnimation,
  type DialogPanelAnimation,
  type DialogProps
} from "@torch-ui/solid/overlays";
```

## Props

```ts
export interface DialogProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** Whether the dialog is open */
	open: boolean
	/** Called when open state changes */
	onOpenChange?: (open: boolean) => void
	/** Called when dialog closes (alias for onOpenChange with false) */
	onClose?: () => void
	/** Header content (e.g. title text or heading element). Rendered in a row alongside the close button. Referenced by aria-labelledby for screen readers. 
	 * If not provided, consider passing aria-label or aria-labelledby for accessibility. */
	header?: JSX.Element
	/** Optional footer content (e.g. action buttons). Rendered below the body with a top border and padding. */
	footer?: JSX.Element
	/** Dialog size */
	size?: DialogSize
	/** Show overlay */
	overlay?: boolean
	/** Close on overlay click */
	closeOnOverlayClick?: boolean
	/** Custom overlay class */
	overlayClass?: string
	/** Dark semi-transparent overlay; default true. Set false to keep background visible (e.g. reference data). */
	overlayDim?: boolean
	/** Backdrop blur on overlay; default true. Set false for no blur. */
	overlayBlur?: boolean
	/** Show a circular close (X) button in the top-right when onClose or onOpenChange is provided */
	showCloseButton?: boolean
	/** Overlay animation. Default fade. */
	overlayAnimation?: DialogOverlayAnimation
	/** Panel animation. Default scale. */
	panelAnimation?: DialogPanelAnimation
	/** Duration in ms for enter animation. Default 200. */
	animationDuration?: number
	/** Duration in ms for exit animation. Default 80% of animationDuration. */
	animationExitDuration?: number
	/** Called after the exit animation completes. Use this instead of onClose to defer clearing state so content doesn't change mid-animation. */
	onCloseComplete?: () => void
}
```

```ts
export type DialogSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
```

```ts
export type DialogOverlayAnimation = 'fade' | 'none'
```

```ts
export type DialogPanelAnimation = 'fade' | 'scale' | 'slide-up' | 'none'
```
