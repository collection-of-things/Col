import type { JSX } from 'solid-js'
import { splitProps, Show, For } from 'solid-js'
import { Slider as KobalteSlider } from '@kobalte/core/slider'
import { cn } from '../../utilities/classNames'

export type SliderSize = 'sm' | 'md' | 'lg'

export interface SliderProps {
	/** Label for the slider. */
	label?: string
	/** Hint text below the control. */
	helperText?: JSX.Element
	/** Error message and invalid styling. */
	error?: JSX.Element
	/** When true, never render label row or error/helper text (control only). */
	bare?: boolean
	/** When true, show required indicator on label. */
	required?: boolean
	/** When true, show "optional" on the label row when not required. Default false. */
	optional?: boolean
	/** Controlled value(s). Single thumb: [number], range: [min, max]. */
	value?: number[]
	/** Default value(s) when uncontrolled. */
	defaultValue?: number[]
	/** Called when value changes. */
	onValueChange?: (value: number[]) => void
	/** Called when user finishes dragging. */
	onValueChangeEnd?: (value: number[]) => void
	/** Called when the user interacts with the control while an error is shown, allowing the parent to clear the error. */
	onErrorClear?: () => void
	/** Minimum value. Default 0. */
	minValue?: number
	/** Maximum value. Default 100. */
	maxValue?: number
	/** Step. Default 1. */
	step?: number
	/** Minimum steps between thumbs (for range). */
	minStepsBetweenThumbs?: number
	/** Custom accessible value label. */
	getValueLabel?: (params: { values: number[] }) => string
	/** Orientation. */
	orientation?: 'horizontal' | 'vertical'
	/** Content before the track (e.g. icon or min label). */
	startContent?: JSX.Element
	/** Content after the track (e.g. icon or max label). */
	endContent?: JSX.Element
	/** Track thickness (height for horizontal, width for vertical). Default sm. Length is controlled by container. */
	size?: SliderSize
	/** Track and thumb color. Default primary (theme). */
	color?: 'primary' | 'indigo' | 'rose'
	/** Optional marks (e.g. [0, 25, 50, 75, 100]) shown below the track, aligned with step positions. */
	marks?: number[]
	/** Disabled. */
	disabled?: boolean
	/** Name for form submission. */
	name?: string
	/** Root class. */
	class?: string
}

export function Slider(props: SliderProps) {
	const [local, others] = splitProps(props, [
		'label',
		'helperText',
		'error',
		'bare',
		'required',
		'optional',
		'value',
		'defaultValue',
		'onValueChange',
		'onValueChangeEnd',
		'onErrorClear',
		'minValue',
		'maxValue',
		'step',
		'minStepsBetweenThumbs',
		'getValueLabel',
		'orientation',
		'startContent',
		'endContent',
		'size',
		'color',
		'marks',
		'disabled',
		'name',
		'class',
	])
	const hasError = () => !!local.error
	const thumbCount = () => {
		const v = local.value ?? local.defaultValue ?? [50]
		return Math.max(1, Math.min(v.length, 2))
	}

	const orientation = () => local.orientation ?? 'horizontal'
	const isHorizontal = () => orientation() === 'horizontal'
	const size = () => local.size ?? 'sm'

	const trackSizeClass = () =>
		isHorizontal()
			? size() === 'sm'
				? 'h-2'
				: size() === 'lg'
					? 'h-4'
					: 'h-3'
			: size() === 'sm'
				? 'w-2'
				: size() === 'lg'
					? 'w-4'
					: 'w-3'
	const thumbSizeClass = () =>
		size() === 'sm' ? 'h-4 w-4' : size() === 'lg' ? 'h-6 w-6' : 'h-5 w-5'

	const color = () => local.color ?? 'primary'
	const trackBgClass = () =>
		color() === 'indigo'
			? 'bg-indigo-300/80'
			: color() === 'rose'
				? 'bg-rose-300/80'
				: 'bg-primary-300/80'
	const fillThumbClass = () =>
		color() === 'indigo'
			? 'bg-indigo-500'
			: color() === 'rose'
				? 'bg-rose-500'
				: 'bg-primary-500'
	const focusRingClass = () =>
		color() === 'indigo'
			? 'focus-visible:ring-indigo-400'
			: color() === 'rose'
				? 'focus-visible:ring-rose-400'
				: 'focus-visible:ring-primary-400'

	const thumbCenterStyle = (): Record<string, string> =>
		isHorizontal()
			? { top: '50%', transform: 'translate(-50%, -50%)' }
			: { left: '50%', transform: 'translate(-50%, 50%)' }

	return (
		<KobalteSlider
			value={local.value}
			defaultValue={local.defaultValue ?? [50]}
			onChange={(v) => {
				if (local.error && local.onErrorClear) local.onErrorClear()
				local.onValueChange?.(v)
			}}
			onChangeEnd={local.onValueChangeEnd}
			minValue={local.minValue ?? 0}
			maxValue={local.maxValue ?? 100}
			step={local.step ?? 1}
			minStepsBetweenThumbs={local.minStepsBetweenThumbs}
			getValueLabel={local.getValueLabel}
			orientation={orientation()}
			disabled={local.disabled}
			name={local.name}
			validationState={hasError() ? 'invalid' : undefined}
			class={cn(
				'group/slider flex flex-col gap-1.5',
				isHorizontal() ? 'w-full' : 'h-full w-fit min-h-0 flex-col items-center',
				local.disabled && 'is-disabled',
				local.class
			)}
		>
			<Show when={local.label && isHorizontal()}>
				<div class="flex items-center justify-between gap-2 min-w-0">
					<div class="flex items-center gap-1 min-w-0">
						<KobalteSlider.Label
							class={cn(
								'text-sm font-medium text-ink-700 shrink-0',
								hasError() && 'text-danger-600'
							)}
						>
							{local.label}
							{local.required && <span class="text-danger-500 ml-0.5" aria-hidden="true">*</span>}
						</KobalteSlider.Label>
						{!local.required && local.optional && (
							<span class="text-xs text-ink-500">optional</span>
						)}
					</div>
					<KobalteSlider.ValueLabel class="text-sm text-ink-500 shrink-0 min-w-[2.5rem] text-right tabular-nums" />
				</div>
			</Show>
			<Show when={local.label && !isHorizontal()}>
				<KobalteSlider.Label
					class={cn(
						'text-sm font-medium text-ink-700 mb-2',
						hasError() && 'text-danger-600'
					)}
				>
					{local.label}
					{local.required && <span class="text-danger-500 ml-0.5" aria-hidden="true">*</span>}
				</KobalteSlider.Label>
				{!local.required && local.optional && (
					<span class="text-xs text-ink-500 mb-2">optional</span>
				)}
			</Show>
			<div
				class={cn(
					'flex min-w-0',
					isHorizontal() ? 'w-full flex-row items-center gap-2' : 'h-full min-h-0 w-fit flex-col items-center gap-2'
				)}
			>
				<Show when={local.startContent}>
					<div class="shrink-0 text-ink-500 [&>svg]:h-4 [&>svg]:w-4">
						{local.startContent}
					</div>
				</Show>
				<div class={cn('flex min-w-0 flex-col gap-1', isHorizontal() ? 'flex-1' : 'min-h-0 flex-1')}>
					<KobalteSlider.Track
						class={cn(
							'relative shrink-0 overflow-visible rounded-full transition-colors',
							trackBgClass(),
							'group-[.is-disabled]/slider:bg-surface-dim',
							trackSizeClass(),
							isHorizontal() ? 'w-full min-w-0' : 'h-full min-h-0'
						)}
					>
						<KobalteSlider.Fill
							class={cn(
								'absolute rounded-full transition-colors',
								isHorizontal() ? 'inset-y-0 left-0' : 'inset-x-0',
								fillThumbClass(),
								'group-[.is-disabled]/slider:bg-surface-border'
							)}
						/>
						<For each={Array.from({ length: thumbCount() })}>
							{() => (
								<KobalteSlider.Thumb
									style={thumbCenterStyle()}
									class={cn(
										'relative z-10 block rounded-full border-0 outline-none transition cursor-pointer touch-none',
										thumbSizeClass(),
										fillThumbClass(),
										'shadow-[0_1px_3px_rgba(0,0,0,0.12)]',
										'ring-0 hover:ring-0 focus-visible:ring-2',
										focusRingClass(),
										'group-[.is-disabled]/slider:bg-surface-border group-[.is-disabled]/slider:group-[.is-disabled]/slider:shadow-none'
									)}
								>
									<KobalteSlider.Input />
								</KobalteSlider.Thumb>
							)}
						</For>
					</KobalteSlider.Track>
					<Show when={local.marks && local.marks.length > 0 && isHorizontal()}>
						<div class="relative min-h-[1.25rem] w-full min-w-0 pt-0.5 text-xs text-ink-500">
							<For each={local.marks!}>
								{(m) => {
									const min = local.minValue ?? 0
									const max = local.maxValue ?? 100
									const range = max - min
									const pct = range === 0 ? 0 : ((m - min) / range) * 100
									return (
										<span
											class="absolute -translate-x-1/2"
											style={{ left: `${pct}%` }}
										>
											{m}
										</span>
									)
								}}
							</For>
						</div>
					</Show>
				</div>
				<Show when={local.endContent}>
					<div class="shrink-0 text-ink-500 [&>svg]:h-4 [&>svg]:w-4">
						{local.endContent}
					</div>
				</Show>
			</div>
			<Show when={local.label && !isHorizontal()}>
				<KobalteSlider.ValueLabel class="text-sm text-ink-500 text-center tabular-nums mt-2" />
			</Show>
			<Show when={local.helperText}>
				<KobalteSlider.Description class="mt-1 text-xs text-ink-500">
					{local.helperText}
				</KobalteSlider.Description>
			</Show>
			<Show when={local.error}>
				<KobalteSlider.ErrorMessage class="mt-1 text-xs text-danger-600">
					{local.error}
				</KobalteSlider.ErrorMessage>
			</Show>
		</KobalteSlider>
	)
}
