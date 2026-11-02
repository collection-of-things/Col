import { type JSX, For, splitProps, Show } from 'solid-js'

import { RadioGroup as KobalteRadioGroup } from '@kobalte/core/radio-group'

import { cn } from '../../utilities/classNames'

import { type ComponentSize } from '../../types/component-size'



export interface RadioGroupOption {

	value: string

	label: string

	/** Optional description for the option. */

	description?: string

}



export interface RadioGroupProps {

	/** Group label (e.g. "Choose one"). */

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

	/** Options to display (value + label, optional description). */

	options: RadioGroupOption[]

	/** Selected value (controlled). */

	value?: string

	/** Called when selection changes. */

	onValueChange?: (value: string) => void

	/** Called when the user interacts with the control while an error is shown, allowing the parent to clear the error. */

	onErrorClear?: () => void

	/** Disables all options. */

	disabled?: boolean

	/** Form name. */

	name?: string

	/** Layout: vertical list (default) or horizontal. */

	orientation?: 'vertical' | 'horizontal'

	/** Component size. Default 'md'. */

	size?: ComponentSize

	/** Removes item padding and tightens gap — for dense UIs like filter/sort drawers. */

	compact?: boolean

	/** Additional class for the root. */

	class?: string

}



export function RadioGroup(props: RadioGroupProps) {

	const [local, others] = splitProps(props, [

		'label',

		'helperText',

		'error',

		'bare',

		'required',

		'optional',

		'options',

		'value',

		'onValueChange',

		'onErrorClear',

		'disabled',

		'name',

		'orientation',

		'size',

		'compact',

		'class',

	])



	const hasError = () => !!local.error



	return (

		<div class={cn('w-full', local.class)}>

			<KobalteRadioGroup

				value={local.value}

				onChange={(v) => {

					if (local.error && local.onErrorClear) local.onErrorClear()

					local.onValueChange?.(v)

				}}

				disabled={local.disabled}

				validationState={hasError() ? 'invalid' : undefined}

				name={local.name}

				orientation={local.orientation ?? 'vertical'}

				{...others}

			>

				<Show when={local.label}>

					<div class="flex items-center justify-between mb-2">

						<KobalteRadioGroup.Label

							class={cn(

								'block text-sm font-medium',

								hasError() ? 'text-danger-600' : 'text-ink-700',

								local.disabled && 'opacity-50'

							)}

						>

							{local.label}

							{local.required && <span class="text-danger-500 ml-0.5" aria-hidden="true">*</span>}

						</KobalteRadioGroup.Label>

						{!local.required && local.optional && (

							<span class="text-xs text-ink-500">optional</span>

						)}

					</div>

				</Show>

				<div

					role="presentation"

					class={cn(

						'flex',

						local.compact ? 'gap-0' : local.size === 'sm' ? 'gap-1' : 'gap-3',

						local.orientation === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col',

						local.disabled && 'opacity-50 pointer-events-none'

					)}

				>

					<For each={local.options}>

						{(opt) => (

							<KobalteRadioGroup.Item

								value={opt.value}

								class={cn(

									local.compact ? 'inline-flex gap-2 cursor-pointer select-none rounded border border-transparent px-1 py-1 transition-colors outline-none' : local.size === 'sm' ? 'inline-flex gap-2 cursor-pointer select-none rounded-md border border-transparent px-2 py-1.5 transition-colors outline-none' : 'inline-flex gap-3 cursor-pointer select-none rounded-lg border border-transparent p-3 transition-colors outline-none',

									opt.description ? 'items-start' : 'items-center',

									'data-[disabled]:cursor-not-allowed',

									'data-[highlighted]:bg-surface-overlay',

									hasError()

										? 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-danger-500'

										: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500'

								)}

							>

								<KobalteRadioGroup.ItemInput class="sr-only" />

								<KobalteRadioGroup.ItemControl

									class={cn(

										'h-4 w-4 shrink-0 rounded-full flex items-center justify-center transition-colors box-border',

										opt.description && 'mt-0.5',

										// Unselected: gray ring, transparent interior

										'border-2 border-surface-border bg-transparent',

										// Selected: primary ring, transparent interior; dot is the ItemIndicator

										'data-[checked]:border-primary-500 data-[checked]:bg-transparent',

										'data-[disabled]:border-surface-border'

									)}

								>

									<KobalteRadioGroup.ItemIndicator class="h-2 w-2 rounded-full bg-primary-500 shrink-0 pointer-events-none" />

								</KobalteRadioGroup.ItemControl>

								<span class="flex flex-col gap-0.5">

									<KobalteRadioGroup.ItemLabel class="text-sm font-medium text-ink-900">

										{opt.label}

									</KobalteRadioGroup.ItemLabel>

									<Show when={opt.description}>

										<KobalteRadioGroup.ItemDescription class="text-xs text-ink-500">

											{opt.description}

										</KobalteRadioGroup.ItemDescription>

									</Show>

								</span>

							</KobalteRadioGroup.Item>

						)}

					</For>

				</div>

				<Show when={local.helperText && !hasError()}>

					<KobalteRadioGroup.Description class="mt-2 text-sm text-ink-500">

						{local.helperText}

					</KobalteRadioGroup.Description>

				</Show>

				<Show when={hasError()}>

					<KobalteRadioGroup.ErrorMessage class="mt-2 text-sm text-danger-600">

						{local.error}

					</KobalteRadioGroup.ErrorMessage>

				</Show>

			</KobalteRadioGroup>

		</div>

	)

}

