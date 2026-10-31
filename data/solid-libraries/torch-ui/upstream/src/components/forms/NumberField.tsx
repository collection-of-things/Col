import type { JSX } from 'solid-js'

import { splitProps, Show } from 'solid-js'

import { NumberField as KobalteNumberField } from '@kobalte/core/number-field'

import { cn } from '../../utilities/classNames'

import { type ComponentSize, inputSizeConfig } from '../../types/component-size'

import { useIcons } from '../../icons'

import { useComponentSize } from '../../utilities/componentSizeContext'



export interface NumberFieldProps {

	/** Label above the input. */

	label?: string

	/** Error message and invalid styling. */

	error?: JSX.Element

	/** Hint text below the input. */

	helperText?: JSX.Element

	/** When true, never render label row or error/helper text (control only). */

	bare?: boolean

	/** When true, show required indicator on label. */

	required?: boolean

	/** When true, show "optional" on the label row when not required. Default false. */

	optional?: boolean

	/** Controlled value (number). */

	value?: number

	/** Called when value changes. */

	onValueChange?: (value: number | undefined) => void

	/** Called when the user interacts with the control while an error is shown, allowing the parent to clear the error. */

	onErrorClear?: () => void

	/** Minimum value. */

	minValue?: number

	/** Maximum value. */

	maxValue?: number

	/** Step for increment/decrement. */

	step?: number

	/** Disables the input and steppers. */

	disabled?: boolean

	/** Placeholder when empty. */

	placeholder?: string

	/** Input size. Controls height, text size, and padding. Default: md (36px). */

	size?: ComponentSize

	/** When true, show increment/decrement buttons. */

	showStepper?: boolean

	/** Stepper layout when showStepper is true. Default: "compact". */

	stepperVariant?: 'compact' | 'inlineLabel'

	/** Additional class for the root. */

	class?: string

	/** Ref forwarded to the number input element. */

	ref?: (el: HTMLInputElement) => void

}



export function NumberField(props: NumberFieldProps) {

	const [local, others] = splitProps(props, [

		'label',

		'error',

		'helperText',

		'bare',

		'required',

		'optional',

		'value',

		'onValueChange',

		'onErrorClear',

		'minValue',

		'maxValue',

		'step',

		'disabled',

		'placeholder',

		'size',

		'showStepper',

		'stepperVariant',

		'class',

		'ref',

	])

	const icons = useIcons()

	const contextSize = useComponentSize()

	const effectiveSize = () => local.size ?? contextSize ?? 'md'



	const hasError = () => !!local.error

	const sc = () => inputSizeConfig[effectiveSize()]

	const stepperButtonW = () => {

		switch (effectiveSize()) {

			case 'xs':

				return 'w-7'

			case 'sm':

				return 'w-8'

			case 'lg':

				return 'w-10'

			case 'xl':

				return 'w-11'

			case 'md':

			default:

				return 'w-9'

		}

	}

	const stepperIconClass = () =>

		(effectiveSize() === 'xs' || effectiveSize() === 'sm') ? 'h-3.5 w-3.5' : 'h-4 w-4'

	const stepperIconButtonBox = () => {

		switch (effectiveSize()) {

			case 'xs':

				return 'h-5 w-5'

			case 'sm':

				return 'h-6 w-6'

			case 'lg':

				return 'h-8 w-8'

			case 'xl':

				return 'h-9 w-9'

			case 'md':

			default:

				return 'h-7 w-7'

		}

	}

	const effectiveStepperVariant = () => local.stepperVariant ?? 'compact'

	const showInline = () => local.showStepper && effectiveStepperVariant() === 'inlineLabel'



	const handleRawValueChange = (v: number | undefined) => {

		if (local.error && local.onErrorClear) local.onErrorClear()

		local.onValueChange?.(v)

	}



	return (

		<div class={cn('w-full', local.class)}>

			<KobalteNumberField

				rawValue={local.value}

				onRawValueChange={handleRawValueChange}

				minValue={local.minValue}

				maxValue={local.maxValue}

				step={local.step}

				disabled={local.disabled}

				validationState={hasError() ? 'invalid' : undefined}

				{...others}

			>

				<Show when={!local.bare && local.label && !showInline()}>

					<div class="flex items-center justify-between mb-1.5">

						<KobalteNumberField.Label

							class={cn(

								'block text-sm font-medium',

								hasError() ? 'text-danger-600' : 'text-ink-700'

							)}

						>

							{local.label}

							{local.required && (

								<span class="text-danger-500 ml-0.5" aria-hidden="true">*</span>

							)}

						</KobalteNumberField.Label>

						{local.label && !local.required && local.optional && (

							<span class="text-xs text-ink-500">optional</span>

						)}

					</div>

				</Show>

				<Show

					when={local.showStepper}

					fallback={

						<KobalteNumberField.Input

							ref={local.ref}

							placeholder={local.placeholder}

							class={cn(

								'w-full rounded-lg transition-all outline-none border text-ink-900 placeholder:text-ink-400 bg-surface-raised',

								sc().h,

								sc().py,

								sc().text,

								sc().pl,

								sc().pr,

								hasError()

									? 'border-danger-500 focus:ring-2 focus:ring-inset focus:ring-danger-500 focus:border-transparent'

									: 'border-surface-border focus:ring-2 focus:ring-inset focus:ring-primary-500 focus:border-transparent',

								'disabled:bg-surface-dim disabled:text-ink-500 disabled:cursor-not-allowed'

							)}

						/>

					}

				>

					<div

						class={cn(

							'relative flex items-stretch gap-1 px-1 overflow-hidden rounded-lg border transition-all',

							local.disabled ? 'bg-surface-dim' : 'bg-surface-raised',

							hasError()

								? 'border-danger-500 focus-within:ring-2 focus-within:ring-inset focus-within:ring-danger-500'

								: 'border-surface-border focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500'

						)}

					>

						<Show when={effectiveStepperVariant() === 'inlineLabel' && local.label}>

							<div

								class={cn(

									'flex-1 min-w-0 flex items-center truncate text-ink-700',

									sc().text,

									sc().pl,

									'pr-4',

									sc().h

								)}

							>

								{local.label}

							</div>

						</Show>



						<KobalteNumberField.DecrementTrigger

							class={cn(

								'flex-none flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500/50 rounded-md group',

								stepperButtonW(),

								'disabled:bg-surface-dim disabled:text-ink-500 disabled:cursor-not-allowed'

							)}

							aria-label="Decrease"

						>

							<span

								class={cn(

									'flex items-center justify-center rounded-md text-ink-600',

									stepperIconButtonBox(),

									!local.disabled && 'group-hover:bg-surface-overlay'

								)}

							>

								{icons.minus({ class: stepperIconClass(), 'aria-hidden': 'true' })}

							</span>

						</KobalteNumberField.DecrementTrigger>



						<KobalteNumberField.Input

							ref={local.ref}

							placeholder={local.placeholder}

							class={cn(

								effectiveStepperVariant() === 'inlineLabel'

									? 'flex-none w-14 min-w-0 bg-transparent outline-none text-center tabular-nums'

									: 'flex-1 min-w-0 bg-transparent outline-none text-center tabular-nums',

								sc().h,

								sc().py,

								sc().text,

								'px-2 text-ink-900 placeholder:text-ink-400',

								'disabled:bg-surface-dim disabled:text-ink-500 disabled:cursor-not-allowed'

							)}

							aria-label={local.label}

						/>



						<KobalteNumberField.IncrementTrigger

							class={cn(

								'flex-none flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500/50 rounded-md group',

								stepperButtonW(),

								'disabled:bg-surface-dim disabled:text-ink-500 disabled:cursor-not-allowed'

							)}

							aria-label="Increase"

						>

							<span

								class={cn(

									'flex items-center justify-center rounded-md text-ink-600',

									stepperIconButtonBox(),

									!local.disabled && 'group-hover:bg-surface-overlay'

								)}

							>

								{icons.plus({ class: stepperIconClass(), 'aria-hidden': 'true' })}

							</span>

						</KobalteNumberField.IncrementTrigger>

					</div>

				</Show>

				<Show when={!local.bare && !hasError() && local.helperText}>

					<KobalteNumberField.Description class="mt-2 text-sm text-ink-500">

						{local.helperText}

					</KobalteNumberField.Description>

				</Show>

				<Show when={!local.bare && hasError()}>

					<KobalteNumberField.ErrorMessage class="mt-2 text-sm text-danger-600">

						{local.error}

					</KobalteNumberField.ErrorMessage>

				</Show>

			</KobalteNumberField>

		</div>

	)

}

