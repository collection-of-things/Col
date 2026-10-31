import { type JSX, Show, splitProps, onMount, createSignal, createEffect } from 'solid-js'
import { AlertDialog as KobalteAlertDialog, type AlertDialogRootProps as KobalteAlertDialogRootProps } from '@kobalte/core/alert-dialog'
import { cn } from '../../utilities/classNames'
import { Button } from '../actions'

const DEFAULT_DURATION_MS = 200
const EXIT_DURATION_MS = Math.round(DEFAULT_DURATION_MS * 0.8)

const alertDialogStyles = `
@keyframes torchui-alert-overlay-fade-in {
	from { opacity: 0; }
	to { opacity: 1; }
}
@keyframes torchui-alert-overlay-fade-out {
	from { opacity: 1; }
	to { opacity: 0; }
}
@keyframes torchui-alert-panel-scale-in {
	from { opacity: 0; transform: scale(0.96); }
	to { opacity: 1; transform: scale(1); }
}
@keyframes torchui-alert-panel-scale-out {
	from { opacity: 1; transform: scale(1); }
	to { opacity: 0; transform: scale(0.96); }
}
.torchui-alert-dialog-overlay {
	animation: torchui-alert-overlay-fade-out ${EXIT_DURATION_MS}ms ease-in forwards;
}
.torchui-alert-dialog-overlay[data-expanded] {
	animation: torchui-alert-overlay-fade-in ${DEFAULT_DURATION_MS}ms ease-out forwards;
}
.torchui-alert-dialog-content {
	animation: torchui-alert-panel-scale-out ${EXIT_DURATION_MS}ms ease-in forwards;
}
.torchui-alert-dialog-content[data-expanded] {
	animation: torchui-alert-panel-scale-in ${DEFAULT_DURATION_MS}ms ease-out forwards;
}
`

const STYLE_ID = 'torchui-alert-dialog-styles'
function ensureAlertStyles() {
	if (typeof document === 'undefined') return
	if (document.getElementById(STYLE_ID)) return
	
	const style = document.createElement('style')
	style.id = STYLE_ID
	style.textContent = alertDialogStyles
	document.head.appendChild(style)
}

export interface AlertDialogProps extends Omit<KobalteAlertDialogRootProps, 'open' | 'onOpenChange'> {
	/** Whether the dialog is open */
	open: boolean
	/** Called when open state changes */
	onOpenChange?: (open: boolean) => void
	/** Dialog title */
	title: string
	/** Dialog description */
	description?: JSX.Element
	/** Label for the confirm/action button */
	confirmLabel?: string
	/** Label for the cancel button */
	cancelLabel?: string
	/** Called when user confirms. If it returns a Promise, the dialog stays open until resolved. */
	onConfirm?: () => void | Promise<void>
	/** Called when user cancels */
	onCancel?: () => void
	/** When true, confirm button uses destructive (red) styling */
	destructive?: boolean
	/** Additional class for the content panel */
	class?: string
	/** Additional class for the overlay */
	overlayClass?: string
}

export function AlertDialog(props: AlertDialogProps) {
	const [local] = splitProps(props, [
		'open', 'onOpenChange', 'onCancel', 'title', 'description',
		'confirmLabel', 'cancelLabel', 'onConfirm',
		'destructive', 'class', 'overlayClass',
	])

	onMount(ensureAlertStyles)

	const [pending, setPending] = createSignal(false)
	let closingFromConfirm = false

	if (import.meta.env?.DEV) {
		createEffect(() => {
			if (local.open && !local.onOpenChange) {
				console.warn('[AlertDialog] open is true but onOpenChange is not provided. The dialog cannot be closed by user interaction.')
			}
		})
	}

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			if (!closingFromConfirm) local.onCancel?.()
			closingFromConfirm = false
		}
		local.onOpenChange?.(isOpen)
	}

	const handleConfirm = async () => {
		if (pending()) return
		setPending(true)
		try {
			await local.onConfirm?.()
			closingFromConfirm = true
			handleOpenChange(false)
		} catch {
		} finally {
			setPending(false)
		}
	}

	return (
		<KobalteAlertDialog
			open={local.open}
			onOpenChange={handleOpenChange}
		>
			<KobalteAlertDialog.Portal>
				<KobalteAlertDialog.Overlay
					class={cn(
						'torchui-alert-dialog-overlay fixed inset-0 z-[100]',
						'bg-black/30 dark:bg-black/50 backdrop-blur-md dark:backdrop-blur-sm',
						local.overlayClass,
					)}
				/>
				<div class="fixed left-1/2 top-1/2 z-[101] w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4">
					{/* ARIA alert-dialog: user must choose Cancel or Confirm; outside click should not dismiss. */}
					<KobalteAlertDialog.Content
						class="torchui-alert-dialog-content block w-full"
						onInteractOutside={(e) => e.preventDefault()}
					>
						<div
							class={cn(
								'torchui-alert-dialog-content-panel rounded-2xl border border-surface-border bg-surface-raised p-6 shadow-xl dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,.5)]',
								local.class,
							)}
						>
							<KobalteAlertDialog.Title class="text-lg font-semibold text-ink-900">
								{local.title}
							</KobalteAlertDialog.Title>
							<Show when={local.description}>
								<KobalteAlertDialog.Description class="mt-2 text-sm text-ink-500">
									{local.description}
								</KobalteAlertDialog.Description>
							</Show>
							<div class="mt-6 flex justify-end gap-3">
								<KobalteAlertDialog.CloseButton as={Button} variant="outlined" size="sm">
									{local.cancelLabel ?? 'Cancel'}
								</KobalteAlertDialog.CloseButton>
								<Button
									variant={local.destructive ? 'danger' : 'primary'}
									size="sm"
									disabled={pending()}
									onClick={handleConfirm}
								>
									{local.confirmLabel ?? 'Confirm'}
								</Button>
							</div>
						</div>
					</KobalteAlertDialog.Content>
				</div>
			</KobalteAlertDialog.Portal>
		</KobalteAlertDialog>
	)
}
