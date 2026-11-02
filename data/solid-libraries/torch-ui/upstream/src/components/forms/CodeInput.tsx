import { createEffect, on, type JSX, splitProps, createUniqueId } from 'solid-js'

import { cn } from '../../utilities/classNames'

import { type ComponentSize } from '../../types/component-size'

import { mergeRefs } from '../../utilities/mergeRefs'



export interface CodeInputProps

	extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type' | 'maxLength'> {

	/** 'single' = one input; 'digits' = one input per digit with paste/keyboard nav (e.g. verification code) */

	variant?: 'single' | 'digits'

	label?: string

	error?: JSX.Element

	helperText?: JSX.Element

	/** When true, never render label row or error/helper text (control only). */

	bare?: boolean

	/** When true, show required indicator on label. */

	required?: boolean

	/** When true, show "optional" on the label row when not required. Default false. */

	optional?: boolean

	/** Length of code (default 6) */

	length?: number

	value?: string

	onValueChange?: (value: string) => void

	onErrorClear?: () => void

	/** Component size. Default 'md'. */

	size?: ComponentSize

}



export function CodeInput(props: CodeInputProps) {

	const variant = () => props.variant ?? 'single'

	if (variant() === 'digits') {

		return <CodeInputDigits {...props} />

	}

	return <CodeInputSingle {...props} />

}



function CodeInputSingle(props: CodeInputProps) {

	const [local, others] = splitProps(props, [

		'variant',

		'label',

		'error',

		'helperText',

		'bare',

		'required',

		'optional',

		'length',

		'value',

		'onValueChange',

		'onErrorClear',

		'class',

		'id',

		'onInput',

		'disabled',

		'size',

	])



	const length = () => local.length ?? 6

	const generatedId = createUniqueId()

	const inputId = () => local.id ?? `code-input-${generatedId}`

	const hasError = () => !!local.error

	const msgId = () => (local.error || local.helperText) ? `${inputId()}-msg` : undefined

	const describedBy = () => {

		const user = (others as Record<string, unknown>)['aria-describedby'] as string | undefined

		const own = msgId()

		return user && own ? `${user} ${own}` : (user ?? own)

	}



	const handleInput = (e: InputEvent) => {

		const input = e.target as HTMLInputElement

		const raw = input.value.replace(/\D/g, '').slice(0, length())

		input.value = raw

		if (local.error && local.onErrorClear) local.onErrorClear()

		local.onValueChange?.(raw)

		if (local.onInput) (local.onInput as (e: InputEvent) => void)(e)

	}



	return (

		<div class="w-full">

			{!local.bare && local.label && (

				<div class="mb-1.5 flex items-center justify-between gap-2">

					<label

						for={inputId()}

						class={cn(

							'block text-sm font-medium',

							hasError() ? 'text-danger-600' : 'text-ink-700'

						)}

					>

						{local.label}

						{local.required && <span class="text-danger-500 ml-0.5" aria-hidden="true">*</span>}

					</label>

					{!local.required && local.optional && (

						<span class="text-xs text-ink-500">optional</span>

					)}

				</div>

			)}

			<input

				id={inputId()}

				type="text"

				inputMode="numeric"

				autocomplete="one-time-code"

				pattern="[0-9]*"

				maxLength={length()}

				value={local.value}

				onInput={handleInput}

				disabled={local.disabled}

				aria-invalid={hasError() ? 'true' : undefined}

				aria-describedby={describedBy()}

				class={cn(

					'w-full px-4 py-3 rounded-lg transition-all outline-none text-center text-xl tracking-[0.25em] font-mono',

					'text-ink-900 placeholder:text-ink-400 placeholder:tracking-normal',

					'bg-surface-raised border',

					hasError()

						? 'border-danger-500 focus:ring-2 focus:ring-inset focus:ring-danger-500 focus:border-transparent'

						: 'border-surface-border focus:ring-2 focus:ring-inset focus:ring-primary-500 focus:border-transparent',

					'disabled:bg-surface-dim disabled:text-ink-500 disabled:cursor-not-allowed',

					local.class

				)}

				{...others}

			/>

			{(local.error || local.helperText) && (

				<p

					id={msgId()}

					role={local.error ? 'alert' : undefined}

					class={cn('mt-2 text-sm', hasError() ? 'text-danger-600' : 'text-ink-500')}

				>

					{local.error || local.helperText}

				</p>

			)}

		</div>

	)

}



function CodeInputDigits(props: CodeInputProps) {

	const length = () => props.length ?? 6

	const inputRefs: (HTMLInputElement | undefined)[] = []

	createEffect(on(length, (l) => { inputRefs.length = l }))



	const emit = (next: string) => {

		if (props.error && props.onErrorClear) props.onErrorClear()

		props.onValueChange?.(next)

	}



	createEffect(() => {

		const val = (props.value ?? '').replace(/\D/g, '').slice(0, length())

		if (val !== (props.value ?? '')) emit(val)

	})



	const onInput = (index: number, e: InputEvent) => {

		const target = e.currentTarget as HTMLInputElement

		const raw = (target.value ?? '').replace(/\D/g, '')

		const val = props.value ?? ''

		if (!raw) {

			// Imperatively reset the DOM input so non-digit characters don't
			// stick visually when the controlled value hasn't changed.
			target.value = val[index] ?? ''

			emit((val.slice(0, index) + val.slice(index + 1)).slice(0, length()))

			return

		}

		const rest = raw.slice(0, length() - index)

		const next = (val.slice(0, index) + rest).slice(0, length())

		emit(next)

		requestAnimationFrame(() =>

			inputRefs[Math.min(index + rest.length, length() - 1)]?.focus()

		)

	}



	const onKeyDown = (index: number, e: KeyboardEvent) => {

		const val = props.value ?? ''

		if (e.key === 'Backspace' && !val[index] && index > 0) {

			e.preventDefault()

			emit(val.slice(0, index - 1) + val.slice(index))

			requestAnimationFrame(() => inputRefs[index - 1]?.focus())

		} else if (e.key === 'Backspace' && val[index]) {

			e.preventDefault()

			emit(val.slice(0, index) + val.slice(index + 1))

			requestAnimationFrame(() => inputRefs[Math.max(index - 1, 0)]?.focus())

		} else if (e.key === 'ArrowLeft' && index > 0) {

			e.preventDefault()

			inputRefs[index - 1]?.focus()

		} else if (e.key === 'ArrowRight' && index < length() - 1) {

			e.preventDefault()

			inputRefs[index + 1]?.focus()

		}

	}



	const onPaste = (e: ClipboardEvent) => {

		e.preventDefault()

		const pasted = (e.clipboardData?.getData('text') ?? '')

			.replace(/\D/g, '')

			.slice(0, length())

		if (!pasted) return

		emit(pasted)

		requestAnimationFrame(() =>

			inputRefs[Math.min(pasted.length, length() - 1)]?.focus()

		)

	}



	const generatedId = createUniqueId()

	const firstId = () => props.id ?? `code-digits-${generatedId}`

	const hasError = () => !!props.error



	return (

		<div class={cn('w-full', props.class)}>

			{!props.bare && props.label && (

				<div class="mb-2 flex items-center justify-between gap-2">

					<label

						for={firstId()}

						class={cn(

							'block text-sm font-medium',

							hasError() ? 'text-danger-600' : 'text-ink-700'

						)}

					>

						{props.label}

						{props.required && <span class="text-danger-500 ml-0.5" aria-hidden="true">*</span>}

					</label>

					{!props.required && props.optional && (

						<span class="text-xs text-ink-500">optional</span>

					)}

				</div>

			)}

			<div

				class="flex gap-2 justify-center"

				role="group"

				aria-label="Verification code digits"

			>

				{Array.from({ length: length() }, (_, i) => (

					<input

						ref={i === 0 ? mergeRefs((el: HTMLInputElement) => (inputRefs[i] = el), props.ref) : (el: HTMLInputElement) => (inputRefs[i] = el)}

						id={i === 0 ? firstId() : undefined}

						type="text"

						inputMode="numeric"

						autocomplete={i === 0 ? 'one-time-code' : 'off'}

						maxLength={1}

						value={(props.value ?? '')[i] ?? ''}

						onInput={(e) => onInput(i, e)}

						onKeyDown={(e) => onKeyDown(i, e)}

						onPaste={onPaste}

						disabled={props.disabled}

						class={cn(

							'w-11 h-12 rounded-lg border text-center text-xl font-semibold font-mono tabular-nums outline-none transition-colors',

							'text-ink-900 bg-surface-raised',

							hasError()

								? 'border-danger-500 focus:ring-2 focus:ring-inset focus:ring-danger-500 focus:border-transparent'

								: 'border-surface-border focus:ring-2 focus:ring-inset focus:ring-primary-500 focus:border-transparent',

							'disabled:bg-surface-dim disabled:text-ink-500 disabled:cursor-not-allowed'

						)}

						aria-label={`Digit ${i + 1}`}

						aria-invalid={hasError() ? 'true' : undefined}

					/>

				))}

			</div>

			{(props.error || props.helperText) && (

				<p

					class={cn(

						'mt-1.5 text-sm',

						hasError() ? 'text-danger-600' : 'text-ink-500'

					)}

					role={props.error ? 'alert' : undefined}

				>

					{props.error || props.helperText}

				</p>

			)}

		</div>

	)

}

