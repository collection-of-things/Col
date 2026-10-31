import type { JSX } from 'solid-js'
import { createEffect, createMemo, For, Show, splitProps, onMount } from 'solid-js'
import { Progress as KobalteProgress } from '@kobalte/core/progress'
import { cn } from '../../utilities/classNames'

export type ProgressSize = 'sm' | 'md' | 'lg'
export type ProgressColor =
	| 'default'
	| 'primary'
	| 'secondary'
	| 'success'
	| 'warning'
	| 'danger'
export type ProgressRadius = 'none' | 'sm' | 'md' | 'lg' | 'full'

export interface ProgressClassNames {
	base?: string
	labelWrapper?: string
	label?: string
	track?: string
	value?: string
	indicator?: string
}

export interface ProgressProps {
	/** Current value (between minValue and maxValue) */
	value?: number
	/** Minimum value */
	minValue?: number
	/** Maximum value */
	maxValue?: number
	/** Label above the bar; also used for aria-label when aria-label not set and label is a string */
	label?: JSX.Element | string
	/** Custom value label (e.g. "3/10"). When not set, value is shown as percentage if showValueLabel. */
	valueLabel?: JSX.Element
	/** Size of the track */
	size?: ProgressSize
	/** Color of the indicator */
	color?: ProgressColor
	/** Track and indicator radius */
	radius?: ProgressRadius
	/** Intl.NumberFormat options for default value display (e.g. { style: 'percent' }) */
	formatOptions?: Intl.NumberFormatOptions
	/** Whether to show the value label (default true when determinate and no valueLabel) */
	showValueLabel?: boolean
	/** Indeterminate animation when total progress is unknown */
	isIndeterminate?: boolean
	/** Striped indicator */
	isStriped?: boolean
	/** Disabled state */
	disabled?: boolean
	/** Disable fill animation */
	disableAnimation?: boolean
	/** When set, render as segmented bar (e.g. password strength) */
	segments?: number
	/** Animate from 0 to 100 over this duration (ms). Use for indeterminate-duration progress. */
	durationMs?: number
	/** Accessible label (required when label prop is not provided) */
	'aria-label'?: string
	'aria-labelledby'?: string
	'aria-describedby'?: string
	'aria-valuetext'?: string
	'aria-valuenow'?: number
	'aria-valuemin'?: number
	'aria-valuemax'?: number
	/** Slot class overrides */
	classNames?: ProgressClassNames
	class?: string
	trackClass?: string
	fillClass?: string
}

const ANIMATION_NAME = 'torchui-progress-fill'
const INDETERMINATE_NAME = 'torchui-progress-indeterminate'
const PROGRESS_STYLE_ID = 'torchui-progress-styles'

function ensureProgressStyles() {
	if (typeof document === 'undefined') return
	if (document.getElementById(PROGRESS_STYLE_ID)) return
	const style = document.createElement('style')
	style.id = PROGRESS_STYLE_ID
	style.textContent = `@keyframes ${ANIMATION_NAME} { to { width: 100%; } }
@keyframes ${INDETERMINATE_NAME} {
	0% { transform: translateX(-100%); }
	100% { transform: translateX(400%); }
}
.torchui-progress-stripes {
	position: absolute;
	inset: 0;
	pointer-events: none;
	background-image: repeating-linear-gradient(
		-45deg,
		transparent 0,
		transparent 10px,
		rgba(255,255,255,.25) 10px,
		rgba(255,255,255,.25) 20px
	);
	border-radius: inherit;
}`
	document.head.appendChild(style)
}

const SIZE_CLASSES: Record<ProgressSize, string> = {
	sm: 'h-1',
	md: 'h-1.5',
	lg: 'h-2',
}

const RADIUS_CLASSES: Record<ProgressRadius, string> = {
	none: 'rounded-none',
	sm: 'rounded-sm',
	md: 'rounded-md',
	lg: 'rounded-lg',
	full: 'rounded-full',
}

const EDGE_RADIUS_CLASSES: Record<ProgressRadius, { left: string; right: string }> = {
	none: { left: 'rounded-l-none', right: 'rounded-r-none' },
	sm: { left: 'rounded-l-sm', right: 'rounded-r-sm' },
	md: { left: 'rounded-l-md', right: 'rounded-r-md' },
	lg: { left: 'rounded-l-lg', right: 'rounded-r-lg' },
	full: { left: 'rounded-l-full', right: 'rounded-r-full' },
}

const COLOR_CLASSES: Record<ProgressColor, string> = {
	default: 'bg-ink-500',
	primary: 'bg-primary-500',
	secondary: 'bg-secondary-500',
	success: 'bg-success-500',
	warning: 'bg-warning-500',
	danger: 'bg-danger-500',
}

function getPercent(value: number, min: number, max: number): number {
	if (min >= max) {
		if (import.meta.env.DEV && min > max) {
			console.warn(`Progress: minValue (${min}) is greater than maxValue (${max}).`)
		}
		return 0
	}
	return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
}

/**
 * Progress bar. Supports determinate (value), indeterminate, segmented, or duration-based fill.
 * Aligned with common Progress APIs (label, size, color, radius, valueLabel, isIndeterminate, etc.).
 */
export function Progress(props: ProgressProps): JSX.Element {
	const [local] = splitProps(props, [
		'value',
		'minValue',
		'maxValue',
		'label',
		'valueLabel',
		'size',
		'color',
		'radius',
		'formatOptions',
		'showValueLabel',
		'isIndeterminate',
		'isStriped',
		'disabled',
		'disableAnimation',
		'segments',
		'durationMs',
		'aria-label',
		'aria-labelledby',
		'aria-describedby',
		'aria-valuetext',
		'aria-valuenow',
		'aria-valuemin',
		'aria-valuemax',
		'classNames',
		'class',
		'trackClass',
		'fillClass',
	])

	const min = () => local.minValue ?? 0
	const max = () => local.maxValue ?? 100
	const rawValue = () => local.value ?? 0
	const percent = () => getPercent(rawValue(), min(), max())
	const segments = () => local.segments
	const durationMs = () => local.durationMs
	const size = () => local.size ?? 'md'
	const color = () => local.color ?? 'primary'
	const radius = () => local.radius ?? 'full'
	const isIndeterminate = () => local.isIndeterminate === true
	const showValue = () =>
		local.showValueLabel !== false &&
		local.valueLabel == null &&
		durationMs() == null &&
		!isIndeterminate()
	const ariaLabel = () => local['aria-label'] ?? (typeof local.label === 'string' ? local.label : undefined)
	let warnedLabel = false
	createEffect(() => {
		if (import.meta.env.DEV && !warnedLabel && ariaLabel() == null && local['aria-labelledby'] == null) {
			warnedLabel = true
			console.warn('Progress: provide aria-label, aria-labelledby, or a string label prop for an accessible progress bar.')
		}
	})
	const formatter = createMemo(() =>
		new Intl.NumberFormat(undefined, local.formatOptions ?? { style: 'percent', maximumFractionDigits: 0 })
	)
	const valueDisplay = () => {
		if (local.valueLabel != null) return local.valueLabel
		if (!showValue()) return null
		return formatter().format(percent() / 100)
	}
	const segmentIndexes = createMemo(() =>
		segments() != null ? Array.from({ length: segments()! }, (_, i) => i) : []
	)
	const classNames = () => local.classNames ?? {}

	onMount(ensureProgressStyles)

	return (
		<KobalteProgress
			value={isIndeterminate() || durationMs() != null ? undefined : rawValue()}
			minValue={min()}
			maxValue={max()}
			indeterminate={isIndeterminate() || durationMs() != null}
			getValueLabel={({ value, min, max }) => {
				if (local['aria-valuetext']) return local['aria-valuetext']
				const pct = getPercent(value, min, max)
				return formatter().format(pct / 100)
			}}
			class={cn('w-full', local.class, classNames().base)}
			aria-label={ariaLabel()}
			aria-labelledby={local['aria-labelledby']}
			aria-describedby={local['aria-describedby']}
			aria-disabled={local.disabled ? 'true' : undefined}
		>
			<Show when={local.label != null || valueDisplay() != null}>
				<div
					class={cn(
						'flex items-center justify-between gap-2 mb-1',
						classNames().labelWrapper
					)}
				>
					<Show when={local.label != null}>
						<KobalteProgress.Label class={cn('text-sm font-medium text-ink-700', classNames().label)}>
							{local.label}
						</KobalteProgress.Label>
					</Show>
					<Show when={valueDisplay() != null}>
						<KobalteProgress.ValueLabel class={cn('text-sm text-ink-600', classNames().value)}>
							{valueDisplay()}
						</KobalteProgress.ValueLabel>
					</Show>
				</div>
			</Show>
			<KobalteProgress.Track
				class={cn(
					'w-full overflow-hidden bg-surface-dim',
					SIZE_CLASSES[size()],
					RADIUS_CLASSES[radius()],
					local.trackClass,
					classNames().track
				)}
			>
				{segments() != null ? (
					<div class="h-full w-full flex gap-0.5">
						<For each={segmentIndexes()}>
							{(i) => {
								const count = segments()!
								const filled = () => (percent() / 100) * count > i
								const segRadius = () =>
									i === 0 ? EDGE_RADIUS_CLASSES[radius()].left
									: i === count - 1 ? EDGE_RADIUS_CLASSES[radius()].right
									: 'rounded-none'
								return (
									<div
										class={cn(
											'h-full flex-1 transition-colors duration-200',
											segRadius(),
											filled()
												? local.fillClass ?? COLOR_CLASSES[color()]
												: 'bg-surface-dim',
											classNames().indicator
										)}
									/>
								)
							}}
						</For>
					</div>
				) : (
					<KobalteProgress.Fill
						class={cn(
							'h-full transition-[width] ease-linear relative',
							RADIUS_CLASSES[radius()],
							!durationMs() && !isIndeterminate() && !local.disableAnimation && 'duration-200',
							local.fillClass ?? COLOR_CLASSES[color()],
							classNames().indicator
						)}
						style={
							isIndeterminate()
								? {
										width: '25%',
										animation: local.disableAnimation
											? undefined
											: `${INDETERMINATE_NAME} 1.5s ease-in-out infinite`,
									}
								: durationMs() != null
									? {
											width: '0%',
											animation: `${ANIMATION_NAME} ${durationMs()}ms linear forwards`,
										}
									: { width: 'var(--kb-progress-fill-width)' }
						}
					>
						<Show when={local.isStriped}>
							<div class="torchui-progress-stripes" aria-hidden="true" />
						</Show>
					</KobalteProgress.Fill>
				)}
			</KobalteProgress.Track>
		</KobalteProgress>
	)
}

