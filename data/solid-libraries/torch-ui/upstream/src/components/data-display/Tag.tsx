import { type JSX, splitProps, mergeProps, Show, createMemo } from 'solid-js'
import { cn } from '../../utilities/classNames'

export type TagVariant =
	| 'neutral'
	| 'primary'
	| 'success'
	| 'warning'
	| 'danger'
	| 'info'

export type TagStyle = 'default' | 'solid'

export type TagSize = 'sm' | 'md' | 'lg' | 'xl'

export interface TagProps extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'color'> {
	/** Semantic color variant. Ignored when color is set. Default: neutral. */
	variant?: TagVariant
	/** Tag size. Default: md. */
	size?: TagSize
	/** Visual style: default (light background) or solid (surface background). Default: default. */
	visualStyle?: TagStyle
	/** CSS color for a status indicator dot before children (e.g. "#22c55e"). */
	statusColor?: string
	/** Accessible label for the status dot (e.g. "Active"). Rendered as sr-only text. When omitted, the dot is purely decorative. */
	statusLabel?: string
	/** Arbitrary CSS color for a fully custom tag. Sets bg (10% opacity), border (25% opacity), and text color. Overrides variant. */
	color?: string
	/** Icon rendered before the label. */
	iconStart?: JSX.Element
	/** Icon rendered after the label. */
	iconEnd?: JSX.Element
}

const tagVariants: Record<TagVariant, string> = {
	neutral:
		'bg-surface-raised text-ink-600 border-surface-border',
	primary:
		'bg-primary-50 text-primary-700 border-primary-100',
	success:
		'bg-success-50 text-success-700 border-success-100',
	warning:
		'bg-warning-50 text-warning-700 border-warning-100',
	danger:
		'bg-danger-50 text-danger-700 border-danger-100',
	info:
		'bg-info-50 text-info-700 border-info-100',
}

const tagSolidVariants: Record<TagVariant, string> = {
	neutral:
		'bg-surface-base text-ink-900 border-surface-border',
	primary:
		'bg-primary-500 text-white border-primary-600',
	success:
		'bg-success-500 text-white border-success-600',
	warning:
		'bg-warning-500 text-white border-warning-600',
	danger:
		'bg-danger-500 text-white border-danger-600',
	info:
		'bg-info-500 text-white border-info-600',
}

const tagStyles: Record<TagStyle, string> = {
	default: '',
	solid: '',
}

const tagSizes: Record<TagSize, string> = {
	sm: 'px-2 py-0.5 text-[11px]',
	md: 'px-2.5 py-0.5 text-xs',
	lg: 'px-3 py-1 text-sm',
	xl: 'px-3.5 py-1.5 text-base',
}

export function Tag(rawProps: TagProps) {
	const props = mergeProps({ variant: 'neutral' as TagVariant, size: 'md' as TagSize, visualStyle: 'default' as TagStyle }, rawProps)
	const [local, others] = splitProps(props, ['variant', 'size', 'statusColor', 'statusLabel', 'color', 'visualStyle', 'style', 'class', 'children', 'iconStart', 'iconEnd'])
	const variant = () => local.variant
	const size = () => local.size
	const tagStyle = () => local.visualStyle

	const customStyle = createMemo((): JSX.CSSProperties => {
		const c = local.color
		if (!c) return {}
		return {
			'background-color': `color-mix(in srgb, ${c} 10%, transparent)`,
			'border-color': `color-mix(in srgb, ${c} 25%, transparent)`,
			color: c,
		}
	})

	const mergedStyle = createMemo((): JSX.CSSProperties => {
		const base = customStyle()
		const inlineStyle = local.style
		return typeof inlineStyle === 'object' && inlineStyle != null ? { ...base, ...inlineStyle } as JSX.CSSProperties : base
	})

	return (
		<span
			class={cn(
				'inline-flex items-center gap-1 rounded-full border font-medium',
				!local.color && (tagStyle() === 'solid' ? tagSolidVariants[variant()] : tagVariants[variant()]),
				tagSizes[size()],
				local.class,
			)}
			style={mergedStyle()}
			{...others}
		>
			<Show when={local.statusColor}>
				<span
					class="size-2 shrink-0 rounded-full ring-1 ring-surface-border"
					style={{ 'background-color': local.statusColor }}
					aria-hidden={local.statusLabel ? undefined : 'true'}
					role={local.statusLabel ? 'img' : undefined}
					aria-label={local.statusLabel}
				/>
			</Show>
			<Show when={local.iconStart}>{local.iconStart}</Show>
			{local.children}
			<Show when={local.iconEnd}>{local.iconEnd}</Show>
		</span>
	)
}
