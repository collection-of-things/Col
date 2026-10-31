import { type JSX, splitProps } from 'solid-js'
import { cn } from '../../utilities/classNames'

export type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

export type BadgeSize = 'sm' | 'md' | 'lg'

export interface BadgeProps extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'children'> {
	/** Color variant. Default: neutral. */
	variant?: BadgeVariant
	/** Badge size; scales dot and pill. Default: md. */
	size?: BadgeSize
	/** Optional icon shown inside the badge. Use for icon-only badge. */
	icon?: JSX.Element
	/** Optional count or label shown inside the badge (e.g. "3"). When omitted and no icon, renders as a dot only. */
	children?: JSX.Element
	/** When true (default), badge is hidden from assistive tech. Set false for meaningful status/count badges. */
	decorative?: boolean
}

// Intentionally uses ink-400 as a background for neutral — surface tokens are too
// close to the page background for a status dot to read clearly against it.
const variantClasses: Record<BadgeVariant, string> = {
	neutral: 'bg-ink-400',
	primary: 'bg-primary-500',
	success: 'bg-success-500',
	warning: 'bg-warning-500',
	danger: 'bg-danger-500',
	info: 'bg-info-600',
}

const sizeClasses = {
	sm: { dot: 'size-2.5', pill: 'h-4 min-w-4 px-0.5 text-[10px]', icon: 'h-4 min-w-4 [&>svg]:size-2.5' },
	md: { dot: 'size-3', pill: 'h-5 min-w-5 px-1 text-xs', icon: 'h-5 min-w-5 [&>svg]:size-3' },
	lg: { dot: 'size-4', pill: 'h-6 min-w-6 px-1.5 text-sm', icon: 'h-6 min-w-6 [&>svg]:size-4' },
} as const

/**
 * Small badge for the corner of an avatar (e.g. online status dot or count).
 * Use as the badge prop of Avatar: <Avatar name="Jane" badge={<Badge variant="success" />} />
 */
export function Badge(props: BadgeProps) {
	const [local, others] = splitProps(props, ['variant', 'size', 'icon', 'class', 'children', 'decorative'])
	const variant = () => local.variant ?? 'neutral'
	const size = () => local.size ?? 'md'
	const hasIcon = () => local.icon != null
	const hasContent = () => local.children != null
	const usePill = () => hasIcon() || hasContent()
	const isDecorative = () => local.decorative !== false
	const hasA11yName = () => {
		const o = others as Record<string, unknown>
		return o['aria-label'] != null || o['aria-labelledby'] != null
	}

	return (
		<span
			aria-hidden={isDecorative() && !hasA11yName() ? 'true' : undefined}
			class={cn(
				'inline-flex shrink-0 items-center justify-center rounded-full border-2 border-surface-base font-medium leading-none text-white',
				usePill() && 'shadow-sm',
				hasIcon() && hasContent() && 'gap-0.5',
				variantClasses[variant()],
				usePill()
				? (hasIcon() && !hasContent() ? sizeClasses[size()].icon : sizeClasses[size()].pill)
				: sizeClasses[size()].dot,
				local.class,
			)}
			{...others}
		>
			{local.icon}
			{local.children}
		</span>
	)
}
