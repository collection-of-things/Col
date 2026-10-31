import type { JSX } from 'solid-js'
import { splitProps } from 'solid-js'
import { cn } from '../../utilities/classNames'
import { useIcons } from '../../icons'

export type AlertStatus = 'error' | 'success' | 'warning' | 'info'

export type AlertAppearance = 'subtle' | 'solid' | 'outline' | 'transparent'

export interface AlertProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
	/** Semantic status: error, success, warning, or info. Ignored when colorClass is set. */
	status?: AlertStatus
	/** Visual style: subtle (default), solid, outline, or transparent. */
	appearance?: AlertAppearance
	/** Optional icon shown at the start. */
	icon?: JSX.Element
	/** When true, shows a close button and calls onClose when clicked. */
	closeable?: boolean
	/** Called when the close button is clicked. Required when closeable is true. */
	onClose?: () => void
	/** Override default status colors. Provide Tailwind classes for border, background, and text (include dark: variants). */
	colorClass?: string
	/** Controls the ARIA live region behavior. 'assertive' → role="alert" (interrupts SR), 'polite' → role="status" (queued), 'off' → no role. Default 'polite'. */
	ariaLive?: 'polite' | 'assertive' | 'off'
	/** Optional CTAs (e.g. Resend, Upgrade) rendered at the end of the alert. */
	actions?: JSX.Element
	/** Optional heading (e.g. "Error" or "Session expired") shown above the message. */
	title?: JSX.Element
	class?: string
	children?: JSX.Element
}

type StatusAppearanceMap = Record<AlertStatus, Record<AlertAppearance, string>>

const statusAppearanceClasses: StatusAppearanceMap = {
	error: {
		subtle:
			'border-danger-500 bg-danger-50 text-danger-700',
		solid:
			'border-danger-500 bg-danger-500 text-white',
		outline:
			'border-danger-500 bg-transparent text-danger-700',
		transparent:
			'border-transparent bg-danger-50 text-danger-800',
	},
	success: {
		subtle:
			'border-success-500 bg-success-50 text-success-700',
		solid:
			'border-success-500 bg-success-500 text-white',
		outline:
			'border-success-500 bg-transparent text-success-700',
		transparent:
			'border-transparent bg-success-50 text-success-800',
	},
	warning: {
		subtle:
			'border-warning-500 bg-warning-50 text-warning-700',
		solid:
			'border-warning-500 bg-warning-500 text-white',
		outline:
			'border-warning-500 bg-transparent text-warning-700',
		transparent:
			'border-transparent bg-warning-50 text-warning-800',
	},
	info: {
		subtle:
			'border-info-500 bg-info-50 text-info-700',
		solid:
			'border-info-500 bg-info-500 text-white',
		outline:
			'border-info-500 bg-transparent text-info-700',
		transparent:
			'border-transparent bg-info-50 text-info-800',
	},
}

/** Inline alert banner with status, appearance, optional icon, close, and CTAs. */
export function Alert(props: AlertProps): JSX.Element {
	const icons = useIcons()
	const [local, others] = splitProps(props, [
		'status',
		'appearance',
		'icon',
		'closeable',
		'onClose',
		'ariaLive',
		'role',
		'colorClass',
		'actions',
		'title',
		'class',
		'children',
		'ref',
	])
	const status = () => local.status ?? 'error'
	const appearance = () => local.appearance ?? 'subtle'
	const colorClasses = () =>
		local.colorClass ?? statusAppearanceClasses[status()][appearance()]

	if (import.meta.env.DEV && local.closeable && !local.onClose) {
		console.warn('Alert: closeable is true but onClose is not provided.')
	}

	const liveMode = () => local.ariaLive ?? 'polite'
	const roleAttr = () => {
		const m = liveMode()
		return m === 'assertive' ? 'alert' : m === 'polite' ? 'status' : undefined
	}
	const role = () => local.role ?? roleAttr()
	const ariaLiveAttr = () => liveMode() === 'off' ? undefined : liveMode()
	const showClose = () => local.closeable === true && local.onClose != null
	const hasActions = () => showClose() || local.actions != null

	return (
		<div
			ref={local.ref}
			class={cn(
				'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-sm',
				colorClasses(),
				local.class,
			)}
			{...others}
			role={role()}
			aria-live={ariaLiveAttr()}
		>
			{local.icon != null && (
				<span class="shrink-0 [&>svg]:size-4" aria-hidden="true">
					{local.icon}
				</span>
			)}
			<div class="min-w-0 flex-1">
				{local.title != null && (
					<div class="font-semibold">{local.title}</div>
				)}
				{local.title != null && local.children != null && <div class="mt-0.5" />}
				{local.children}
			</div>
			{hasActions() && (
				<div class="flex shrink-0 items-center gap-2">
					{local.actions}
					{showClose() && (
						<button
							type="button"
							onClick={local.onClose}
							class="rounded p-1 opacity-70 hover:opacity-100 outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-inset"
							aria-label="Close"
						>
							{icons.close({ class: 'size-4', 'aria-hidden': 'true' })}
						</button>
					)}
				</div>
			)}
		</div>
	)
}
