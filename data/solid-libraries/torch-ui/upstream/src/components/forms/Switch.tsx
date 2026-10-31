import type { JSX } from 'solid-js'

import { createEffect, createSignal, splitProps, Show, on } from 'solid-js'

import { Switch as KobalteSwitch } from '@kobalte/core/switch'

import { cn } from '../../utilities/classNames'

import { type ComponentSize } from '../../types/component-size'



export interface SwitchProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children' | 'onChange' | 'onValueChange'> {

	/** Label text. */

	label?: string

	/** Visual style variant. */

	variant?: 'default' | 'icon'

	/** Icon to render inside the thumb when unchecked (icon variant). */

	thumbOffIcon?: JSX.Element

	/** Icon to render inside the thumb when checked (icon variant). */

	thumbOnIcon?: JSX.Element

	/** Track color when unchecked. Accepts any CSS color string (e.g. 'rebeccapurple', '#fff', 'var(--color-surface-dim)'). */

	trackColor?: string

	/** Track color when checked. Accepts any CSS color string (e.g. 'var(--color-primary-500)'). */

	trackCheckedColor?: string

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

	/** Controlled checked state. */

	checked?: boolean

	/** Default checked (uncontrolled). */

	defaultChecked?: boolean

	/** Called when checked state changes. */

	onValueChange?: (checked: boolean) => void

	/** Called when the user interacts with the control while an error is shown, allowing the parent to clear the error. */

	onErrorClear?: () => void

	/** Disables the switch. */

	disabled?: boolean

	/** For form submission when checked (e.g. "on"). */

	value?: string

	/** Form name. */

	name?: string

	/** Component size. Default 'md'. */

	size?: ComponentSize

	/** When true, the root wrapper uses full width. Default true. */

	fullWidth?: boolean

	/** Additional class for the root wrapper. */

	class?: string

	/** Additional class for the control (track). */

	controlClass?: string

	/** Ref forwarded to the root wrapper div. */

	ref?: (el: HTMLDivElement) => void

}



const SIZE_MAP: Record<NonNullable<SwitchProps['size']>, { track: string; thumb: string; checked: string; top: string }> = {

	xs: { track: 'h-4 w-8',  thumb: 'h-3 w-3',  checked: 'group-data-[checked]:translate-x-4', top: '1px' },

	sm: { track: 'h-5 w-9',  thumb: 'h-4 w-4',  checked: 'group-data-[checked]:translate-x-4', top: '1px' },

	md: { track: 'h-6 w-11', thumb: 'h-5 w-5',  checked: 'group-data-[checked]:translate-x-5', top: '1px' },

	lg: { track: 'h-8 w-14', thumb: 'h-6 w-6',  checked: 'group-data-[checked]:translate-x-7', top: '3px' },

	xl: { track: 'h-9 w-16', thumb: 'h-7 w-7',  checked: 'group-data-[checked]:translate-x-8', top: '3px' },

}



/** Shared control (input + track + thumb) used in both label and bare layouts. */

function SwitchControl(props: {

	trackStyle: () => JSX.CSSProperties | undefined

	sz: () => { track: string; thumb: string; checked: string; top: string }

	iconVariant: () => boolean

	controlClass: string | undefined

	hasError: () => boolean

	thumbOffIcon: JSX.Element | undefined

	thumbOnIcon: JSX.Element | undefined

}) {

	return (

		<>

			<KobalteSwitch.Input class="peer sr-only" />

			<KobalteSwitch.Control

				style={props.trackStyle()}

				class={cn(

					'group relative inline-flex shrink-0 cursor-pointer rounded-full border border-surface-border transition-colors',

					props.sz().track,

					'outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-primary-500',

					'data-[disabled]:opacity-50',

					'bg-surface-dim data-[checked]:bg-success-500 data-[checked]:border-success-500',

					props.hasError() &&

						'border-danger-500 peer-focus-visible:ring-danger-500 data-[checked]:border-danger-500',

					props.controlClass

				)}

			>

				<KobalteSwitch.Thumb

					style={{

						top: props.sz().top,

						left: '1px',

					}}

					class={cn(

						'pointer-events-none absolute flex items-center justify-center rounded-full bg-surface-base shadow ring-0 transition-transform',

						props.sz().thumb,

						'translate-x-0', props.sz().checked,

					)}

				>

					{props.iconVariant() && (props.thumbOffIcon || props.thumbOnIcon) ? (

						<>

							<span class={cn('block', 'group-data-[checked]:hidden')}>

								{props.thumbOffIcon}

							</span>

							<span class={cn('hidden', 'group-data-[checked]:block')}>

								{props.thumbOnIcon}

							</span>

						</>

					) : null}

				</KobalteSwitch.Thumb>

			</KobalteSwitch.Control>

		</>

	)

}



/** Shared helper text and error message with configurable margin. */

function SwitchHelperError(props: {

	descMargin: string

	hasError: () => boolean

	helperText: JSX.Element | undefined

	error: JSX.Element | undefined

}) {

	return (

		<>

			<Show when={props.helperText && !props.hasError()}>

				<KobalteSwitch.Description class={cn(props.descMargin, 'text-sm text-ink-500')}>

					{props.helperText}

				</KobalteSwitch.Description>

			</Show>

			<Show when={props.hasError()}>

				<KobalteSwitch.ErrorMessage class={cn(props.descMargin, 'text-sm text-danger-600')}>

					{props.error}

				</KobalteSwitch.ErrorMessage>

			</Show>

		</>

	)

}



export function Switch(props: SwitchProps) {

	const [local, others] = splitProps(props, [

		'label',

		'variant',

		'thumbOffIcon',

		'thumbOnIcon',

		'trackColor',

		'trackCheckedColor',

		'helperText',

		'error',

		'bare',

		'required',

		'optional',

		'checked',

		'defaultChecked',

		'onValueChange',

		'onErrorClear',

		'disabled',

		'value',

		'name',

		'size',

		'fullWidth',

		'class',

		'controlClass',

		'ref',

	])



	const hasError = () => !!local.error

	const iconVariant = () => local.variant === 'icon'

	const sz = () => SIZE_MAP[local.size ?? 'md']

	const [isChecked, setIsChecked] = createSignal(!!(local.checked ?? local.defaultChecked))



	// Keep internal state in sync with controlled usage.

	// defer: true — skip initial run since the signal is already initialized above.

	createEffect(on(() => local.checked, (checked) => {

		if (checked !== undefined) setIsChecked(!!checked)

	}, { defer: true }))



	const trackStyle = () => {

		if (!local.trackColor && !local.trackCheckedColor) return undefined

		const bg = isChecked() ? (local.trackCheckedColor ?? local.trackColor) : local.trackColor

		return bg ? ({ 'background-color': bg } satisfies JSX.CSSProperties) : undefined

	}



	// If there's no visible label, the switch still needs a name.

	const a11yNameOk = () =>

		local.label != null ||

		(others['aria-label'] as string | undefined) != null ||

		(others['aria-labelledby'] as string | undefined) != null ||

		(others['title'] as string | undefined) != null



	if (import.meta.env.DEV && !a11yNameOk()) {

		console.warn('Switch: when label is omitted, provide aria-label, aria-labelledby, or title for accessibility.')

	}



	// Forward "naming" attributes to the actual switch root (not just the wrapper div).

	const switchA11yProps = () => ({

		'aria-label': local.label ? undefined : (others['aria-label'] as string | undefined),

		'aria-labelledby': local.label ? undefined : (others['aria-labelledby'] as string | undefined),

		title: local.label ? undefined : (others['title'] as string | undefined),

	})



	return (

		<div

			ref={local.ref}

			class={cn(local.fullWidth === false ? 'w-auto' : 'w-full', local.class)}

			{...others}

		>

			<KobalteSwitch

				class={!local.label ? 'flex items-center' : undefined}

				{...switchA11yProps()}

				checked={local.checked}

				defaultChecked={local.defaultChecked}

				onChange={(checked) => {

					if (local.error && local.onErrorClear) local.onErrorClear()

					setIsChecked(!!checked)

					local.onValueChange?.(!!checked)

				}}

				disabled={local.disabled}

				validationState={hasError() ? 'invalid' : undefined}

				name={local.name}

				value={local.value ?? 'on'}

			>

				<Show

				when={local.label}

				fallback={

					<>

						<div class="flex items-center gap-2">

							<SwitchControl

								trackStyle={trackStyle}

								sz={sz}

								iconVariant={iconVariant}

								controlClass={local.controlClass}

								hasError={hasError}

								thumbOffIcon={local.thumbOffIcon}

								thumbOnIcon={local.thumbOnIcon}

							/>

						</div>

						<SwitchHelperError descMargin="mt-1.5" hasError={hasError} helperText={local.helperText} error={local.error} />

					</>

				}

			>

				<div class="flex items-start justify-between gap-3">

					<div class="min-w-0">

						<KobalteSwitch.Label

							class={cn(

								'text-sm font-medium cursor-pointer select-none',

								hasError() ? 'text-danger-600' : 'text-ink-700',

								local.disabled && 'opacity-50'

							)}

						>

							{local.label}

							<Show when={local.required}>

								<span class="text-danger-500 ml-0.5" aria-hidden="true">*</span>

							</Show>

							<Show when={!local.required && local.optional}>

								<span class="text-xs text-ink-400 ml-1">optional</span>

							</Show>

						</KobalteSwitch.Label>



						<SwitchHelperError descMargin="mt-1" hasError={hasError} helperText={local.helperText} error={local.error} />

					</div>



					<div class="shrink-0">

						<SwitchControl

							trackStyle={trackStyle}

							sz={sz}

							iconVariant={iconVariant}

							controlClass={local.controlClass}

							hasError={hasError}

							thumbOffIcon={local.thumbOffIcon}

							thumbOnIcon={local.thumbOnIcon}

						/>

					</div>

				</div>

			</Show>

		</KobalteSwitch>

	</div>

	)

}

