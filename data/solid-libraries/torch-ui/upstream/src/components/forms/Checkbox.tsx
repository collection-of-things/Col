import { type JSX, splitProps, Show } from 'solid-js'

import { Checkbox as KobalteCheckbox } from '@kobalte/core/checkbox'

import { cn } from '../../utilities/classNames'

import { useComponentSize } from '../../utilities/componentSizeContext'

import { useIcons } from '../../icons'



export type CheckboxSize = 'sm' | 'md'



export interface CheckboxProps extends Omit<JSX.HTMLAttributes<HTMLInputElement>, 'onChange' | 'onValueChange'> {

	/** Label text (or use children). */

	label?: string

	/** Error message shown below the checkbox. */

	error?: JSX.Element

	/** Hint text below the checkbox. */

	helperText?: JSX.Element

	/** When true, never render label row or error/helper text (checkbox only). */

	bare?: boolean

	/** When true, show as required (e.g. asterisk). */

	required?: boolean

	/** When true, show "optional" on the label row when not required. Default false. */

	optional?: boolean

	/** Controlled checked state. */

	checked?: boolean

	/** Controlled change handler. Receives the new checked boolean. */

	onValueChange?: (checked: boolean) => void

	/** Called when the user interacts with the control while an error is shown, allowing the parent to clear the error. */

	onErrorClear?: () => void

	/** Visual size. */

	size?: CheckboxSize

	/** Indeterminate state (e.g. parent when some children selected). */

	indeterminate?: boolean

	/** Disable the checkbox. */

	disabled?: boolean

	class?: string

	id?: string

	/** Form field name. */

	name?: string

	/** Form field value. */

	value?: string

	children?: JSX.Element

}



const sizeClasses: Record<CheckboxSize, string> = {

	sm: 'h-3.5 w-3.5',

	md: 'h-4 w-4',

}



export function Checkbox(props: CheckboxProps) {

	const icons = useIcons()

	const [local, others] = splitProps(props, [

		'label',

		'error',

		'helperText',

		'bare',

		'required',

		'optional',

		'checked',

		'onValueChange',

		'onErrorClear',

		'size',

		'indeterminate',

		'class',

		'id',

		'disabled',

		'children',

		'name',

		'value',

	])



	if (import.meta.env.DEV && local.bare) {

		if (

			others['aria-label'] == null &&

			others['aria-labelledby'] == null &&

			others['title'] == null

		) {

			console.warn('Checkbox: bare mode requires aria-label, aria-labelledby, or title for accessibility.')

		}

	}



	const contextSize = useComponentSize()

	const hasError = () => !!local.error

	const size = (): CheckboxSize => local.size ?? (contextSize === 'xs' || contextSize === 'sm' ? 'sm' : 'md')

	const iconSize = () => size() === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'



	return (

		<KobalteCheckbox

			checked={local.checked}

			onChange={(v) => {

				if (local.error && local.onErrorClear) local.onErrorClear()

				local.onValueChange?.(v === true)

			}}

			indeterminate={local.indeterminate}

			validationState={hasError() ? 'invalid' : undefined}

			required={local.required}

			disabled={local.disabled}

			name={local.name}

			value={local.value}

			id={local.id}

			class={cn('w-full', local.class)}

		>

			<div

				class={cn(

					'flex items-center select-none',

					size() === 'sm' ? 'gap-1.5' : 'gap-2',

					local.disabled && 'opacity-50',

					hasError() && 'text-danger-600',

				)}

			>

				<KobalteCheckbox.Input {...others} />

				<KobalteCheckbox.Control

					class={cn(

						'relative inline-flex shrink-0 items-center justify-center rounded border cursor-pointer outline-none transition-colors',

						sizeClasses[size()],

						'bg-surface-raised border-surface-border',

						'data-[checked]:border-primary-500 data-[checked]:bg-primary-500',

						'data-[indeterminate]:border-primary-500 data-[indeterminate]:bg-primary-500',

						hasError() && 'border-danger-500',

						hasError()

							? 'data-[focus-visible]:ring-2 data-[focus-visible]:ring-inset data-[focus-visible]:ring-danger-500 data-[focus-visible]:border-transparent'

							: 'data-[focus-visible]:ring-2 data-[focus-visible]:ring-inset data-[focus-visible]:ring-primary-500 data-[focus-visible]:border-transparent',

						local.disabled && '',

					)}

				>

					<KobalteCheckbox.Indicator class="absolute inset-0 flex items-center justify-center text-white">

						<Show

							when={!local.indeterminate}

							fallback={icons.minus({ class: iconSize(), 'aria-hidden': 'true' })}

						>

							{icons.check({ class: iconSize(), 'aria-hidden': 'true' })}

						</Show>

					</KobalteCheckbox.Indicator>

				</KobalteCheckbox.Control>

				<Show

					when={!local.bare && (local.label ?? local.children)}

					fallback={

						<>

							<Show when={!local.bare && local.helperText && !hasError()}>

								<KobalteCheckbox.Description class="mt-1.5 text-sm text-ink-500">

									{local.helperText}

								</KobalteCheckbox.Description>

							</Show>



							<Show when={!local.bare && local.error}>

								<KobalteCheckbox.ErrorMessage class="mt-1.5 text-sm text-danger-600">

									{local.error}

								</KobalteCheckbox.ErrorMessage>

							</Show>

						</>

					}

				>

					<div class="min-w-0">

						<KobalteCheckbox.Label

							class={cn(

								'text-ink-700 cursor-pointer',

								size() === 'sm' ? 'text-xs' : 'text-sm',

								local.disabled && '',

							)}

						>

							{local.label ?? local.children}

							<Show when={local.required}>

								<span class="text-danger-500 ml-0.5" aria-hidden="true">*</span>

							</Show>

							<Show when={!local.required && local.optional}>

								<span class="text-xs text-ink-500 ml-1">optional</span>

							</Show>

						</KobalteCheckbox.Label>



						<Show when={!local.bare && local.helperText && !hasError()}>

							<KobalteCheckbox.Description class="mt-1 text-sm text-ink-500">

								{local.helperText}

							</KobalteCheckbox.Description>

						</Show>



						<Show when={!local.bare && local.error}>

							<KobalteCheckbox.ErrorMessage class="mt-1 text-sm text-danger-600">

								{local.error}

							</KobalteCheckbox.ErrorMessage>

						</Show>

					</div>

				</Show>

			</div>

		</KobalteCheckbox>

	)

}

