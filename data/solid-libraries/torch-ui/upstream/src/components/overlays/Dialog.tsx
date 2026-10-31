import { Show, onMount, type JSX, splitProps, createEffect, createSignal, on, onCleanup } from 'solid-js'
import { Dialog as KobalteDialog } from '@kobalte/core/dialog'
import { cn } from '../../utilities/classNames'
import { useIcons } from '../../icons'

const DEFAULT_DURATION_MS = 200

export type DialogSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

/** Overlay animation. Default fade. */
export type DialogOverlayAnimation = 'fade' | 'none'

/** Panel animation. Default scale. */
export type DialogPanelAnimation = 'fade' | 'scale' | 'slide-up' | 'none'

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

const sizeClasses: Record<DialogSize, string> = {
	xs: 'max-w-xs',
	sm: 'max-w-sm',
	md: 'max-w-md',
	lg: 'max-w-lg',
	xl: 'max-w-xl',
	full: '', // No longer needed - positioning handled conditionally
}

const dialogStyles = `
@keyframes torchui-dialog-fade-in {
	from { opacity: 0; }
	to { opacity: 1; }
}
@keyframes torchui-dialog-fade-out {
	from { opacity: 1; }
	to { opacity: 0; }
}
@keyframes torchui-dialog-scale-in {
	from { opacity: 0; transform: scale(0.96); }
	to { opacity: 1; transform: scale(1); }
}
@keyframes torchui-dialog-scale-out {
	from { opacity: 1; transform: scale(1); }
	to { opacity: 0; transform: scale(0.96); }
}
@keyframes torchui-dialog-slide-up-in {
	from { opacity: 0; transform: translateY(0.5rem); }
	to { opacity: 1; transform: translateY(0); }
}
@keyframes torchui-dialog-slide-up-out {
	from { opacity: 1; transform: translateY(0); }
	to { opacity: 0; transform: translateY(0.5rem); }
}
.torchui-dialog-overlay {
	opacity: 0;
	animation: torchui-dialog-fade-out var(--dialog-exit-duration, 0.16s) ease-in forwards;
}
.torchui-dialog-overlay[data-expanded] {
	opacity: 1;
	animation: torchui-dialog-fade-in var(--dialog-duration, 0.2s) ease-out forwards;
}
.torchui-dialog-content[data-animation="fade"] {
	opacity: 0;
	animation: torchui-dialog-fade-out var(--dialog-exit-duration, 0.16s) ease-in forwards;
}
.torchui-dialog-content[data-animation="fade"][data-expanded] {
	opacity: 1;
	animation: torchui-dialog-fade-in var(--dialog-duration, 0.2s) ease-out forwards;
}
.torchui-dialog-content[data-animation="scale"] {
	opacity: 0;
	animation: torchui-dialog-scale-out var(--dialog-exit-duration, 0.16s) ease-in forwards;
}
.torchui-dialog-content[data-animation="scale"][data-expanded] {
	opacity: 1;
	animation: torchui-dialog-scale-in var(--dialog-duration, 0.2s) ease-out forwards;
}
.torchui-dialog-content[data-animation="slide-up"] {
	opacity: 0;
	animation: torchui-dialog-slide-up-out var(--dialog-exit-duration, 0.16s) ease-in forwards;
}
.torchui-dialog-content[data-animation="slide-up"][data-expanded] {
	opacity: 1;
	animation: torchui-dialog-slide-up-in var(--dialog-duration, 0.2s) ease-out forwards;
}
`

// ID-based DOM guard: prevents duplicate style tags even across multiple module loads
// (e.g., microfrontends, test setups, different bundles)
const STYLE_ID = 'torchui-dialog-styles'
function ensureDialogStyles() {
	if (typeof document === 'undefined') return
	if (document.getElementById(STYLE_ID)) return
	
	const style = document.createElement('style')
	style.id = STYLE_ID
	style.textContent = dialogStyles
	document.head.appendChild(style)
}

export function Dialog(props: DialogProps) {
	const icons = useIcons()
	const [local, others] = splitProps(props, [
		'open',
		'onOpenChange',
		'onClose',
		'size',
		'overlay',
		'closeOnOverlayClick',
		'overlayClass',
		'overlayDim',
		'overlayBlur',
		'showCloseButton',
		'overlayAnimation',
		'panelAnimation',
		'animationDuration',
		'animationExitDuration',
		'onCloseComplete',
		'class',
		'children',
		'header',
		'footer',
	])

	// Dev warning for accessibility
	if (import.meta.env?.DEV) {
		const hasAccessibleNameProp = () =>
			('aria-label' in others) ||
			('aria-labelledby' in others) ||
			('ariaLabel' in others) ||
			('ariaLabelledby' in others)

		createEffect(on(
			() => local.open,
			(open) => {
				if (open && !local.header && !hasAccessibleNameProp()) {
					console.warn('[Dialog] Provide header, aria-label, or aria-labelledby for an accessible name.')
				}
			}
		))
	}

	onMount(ensureDialogStyles)

	const duration = () => local.animationDuration ?? DEFAULT_DURATION_MS
	const exitDuration = () => local.animationExitDuration ?? Math.round((local.animationDuration ?? DEFAULT_DURATION_MS) * 0.8)
	const cssVars = (): JSX.CSSProperties => ({
		'--dialog-duration': `${duration()}ms`,
		'--dialog-exit-duration': `${exitDuration()}ms`,
	})

	// Freeze size for exit animation: only update while open so closing doesn't
	// snap to 'md' before the exit animation completes.
	const [effectiveSize, setEffectiveSize] = createSignal<DialogSize>(local.size ?? 'md')
	createEffect(on(
		() => [local.open, local.size] as const,
		([open, size]) => { if (open) setEffectiveSize(size ?? 'md') }
	))
	// Fire onCloseComplete after exit animation so consumers can defer state cleanup.
	createEffect(on(() => local.open, (isOpen, wasOpen) => {
		if (wasOpen === true && !isOpen) {
			const t = setTimeout(() => local.onCloseComplete?.(), exitDuration())
			onCleanup(() => clearTimeout(t))
		}
	}))
	const sizeClass = () => sizeClasses[effectiveSize()]
	const isFull = () => effectiveSize() === 'full'
	const showOverlay = () => local.overlay !== false
	const closeOnOverlay = () => local.closeOnOverlayClick !== false
	const overlayAnimation = () => local.overlayAnimation ?? 'fade'
	const panelAnimation = () => local.panelAnimation ?? 'scale'
	const hasCloseRow = () => (local.onClose != null || local.onOpenChange != null) && local.showCloseButton !== false
	const hasHeaderRow = () => !!(local.header || hasCloseRow())

	return (
		<KobalteDialog
			open={local.open}
			onOpenChange={(isOpen) => {
				local.onOpenChange?.(isOpen)
				if (!isOpen) local.onClose?.()
			}}
			modal
		>
			<KobalteDialog.Portal>
				<div class="contents" style={cssVars()}>
					<Show when={showOverlay()}>
						<KobalteDialog.Overlay
							class={cn(
								'fixed inset-0 z-[60]',
								overlayAnimation() !== 'none' && 'torchui-dialog-overlay',
								local.overlayDim !== false && 'bg-black/30 dark:bg-black/50',
								local.overlayBlur !== false && 'backdrop-blur-md dark:backdrop-blur-sm',
								local.overlayClass,
							)}
						/>
					</Show>
					{/* Positioning wrapper: centering only, never animated */}
					<div
						class={cn(
							'fixed z-[70] w-full',
							isFull()
								? 'inset-0 p-0' // no centering for full dialogs
								: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-4', // centering for normal dialogs
							!isFull() && sizeClass(),
							local.class,
						)}
					>
						{/* Content: focus trap, role=dialog, aria-modal, escape key, animation */}
						<KobalteDialog.Content
							class={cn(
								panelAnimation() !== 'none' && 'torchui-dialog-content',
								isFull() && 'h-full min-h-0 flex flex-col',
							)}
							data-animation={panelAnimation() !== 'none' ? panelAnimation() : undefined}
							onInteractOutside={(e) => { if (!closeOnOverlay()) e.preventDefault() }}
							{...others}
						>
							{/* Visual panel */}
							<div
								class={cn(
									'bg-surface-raised text-ink-900',
									isFull()
										? 'h-full min-h-0 flex-1 flex flex-col' // Full screen: flex column, no overflow here
										: 'overflow-y-auto max-h-[90vh] rounded-lg border border-surface-border p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,.2)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,.5)]', // Normal dialog
								)}
							>
								{/* Header row — sticky for full-screen, inline for normal */}
								<Show when={hasHeaderRow()}>
									<div
										class={cn(
											'flex items-center justify-between gap-4',
											isFull()
												? 'shrink-0 border-b border-surface-border px-4 py-3'
												: ''
										)}
									>
										<Show when={local.header}>
											<KobalteDialog.Title as="div" class="min-w-0 flex-1">
												{local.header}
											</KobalteDialog.Title>
										</Show>
										<Show when={!local.header}>
											<span />
										</Show>
										<Show when={hasCloseRow()}>
											<KobalteDialog.CloseButton
												aria-label="Close"
												class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-overlay text-ink-500 hover:bg-surface-dim hover:text-ink-700"
											>
												{icons.close({ class: 'h-5 w-5', 'aria-hidden': 'true' })}
											</KobalteDialog.CloseButton>
										</Show>
									</div>
								</Show>
								{/* Body — independently scrollable for full-screen */}
								<div
									class={cn(
										isFull() ? 'flex-1 overflow-y-auto px-4 py-4' : (hasHeaderRow() ? 'mt-7' : '')
									)}
								>
									{local.children}
								</div>
								{/* Footer */}
								<Show when={local.footer}>
									<div
										class={cn(
											isFull()
												? 'shrink-0 border-t border-surface-border px-4 py-4'
												: 'mt-8 border-t border-surface-border pt-5'
										)}
									>
										{local.footer}
									</div>
								</Show>
							</div>
						</KobalteDialog.Content>
					</div>
				</div>
			</KobalteDialog.Portal>
		</KobalteDialog>
	)
}
