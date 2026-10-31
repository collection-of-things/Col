import {
	type JSX,
	splitProps,
	Show,
	createEffect,
	onMount,
	onCleanup,
	createUniqueId,
} from 'solid-js'
import { TextField as KobalteTextField } from '@kobalte/core/text-field'
import { cn } from '../../utilities/classNames'
import { mergeRefs } from '../../utilities/mergeRefs'

export type TextAreaResize = 'none' | 'vertical' | 'horizontal' | 'both'

export interface TextAreaProps extends JSX.TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string
	error?: JSX.Element
	helperText?: JSX.Element
	/** When true, never render label row or error/helper text (textarea only) */
	bare?: boolean
	required?: boolean
	optional?: boolean
	resize?: TextAreaResize
	maxLength?: number
	autoresize?: boolean
	inputClass?: string
	onValueChange?: (value: string) => void
	onErrorClear?: () => void
}

const resizeClasses: Record<TextAreaResize, string> = {
	none: 'resize-none',
	vertical: 'resize-y',
	horizontal: 'resize-x',
	both: 'resize',
}

export function TextArea(props: TextAreaProps) {
	const [local, others] = splitProps(props, [
		'label',
		'error',
		'helperText',
		'bare',
		'required',
		'optional',
		'resize',
		'maxLength',
		'autoresize',
		'onValueChange',
		'onErrorClear',
		'class',
		'inputClass',
		'id',
		'value',
		'onInput',
		'rows',
		'ref',
		'disabled',
	])

	// ✅ bare mode should still be named
	if (import.meta.env.DEV && local.bare) {
		if (
			(others['aria-label'] as string | undefined) == null &&
			(others['aria-labelledby'] as string | undefined) == null &&
			(others['title'] as string | undefined) == null
		) {
			console.warn('TextArea: bare mode requires aria-label, aria-labelledby, or title for accessibility.')
		}
	}

	const hasError = () => !!local.error

	const valueString = () =>
		typeof local.value === 'string' ? local.value : local.value == null ? '' : String(local.value)

	const currentLength = () => valueString().length
	const maxLen = () => local.maxLength ?? 0
	const atOrOverLimit = () => maxLen() > 0 && currentLength() >= maxLen()
	const nearLimit = () => maxLen() > 0 && currentLength() >= maxLen() * 0.9 && currentLength() < maxLen()
	const hasMaxLengthError = () => atOrOverLimit()
	const countColorClass = () =>
		atOrOverLimit()
			? 'text-danger-600 dark:text-danger-400'
			: nearLimit()
				? 'text-warning-600 dark:text-warning-400'
				: 'text-ink-500'

	let textareaRef: HTMLTextAreaElement | undefined
	const resizeIfAutoresize = () => {
		const el = textareaRef
		if (!el || !local.autoresize) return
		el.style.height = 'auto'
		el.style.height = `${el.scrollHeight}px`
	}

	createEffect(() => {
		if (!local.autoresize) return
		valueString()
		queueMicrotask(resizeIfAutoresize)
	})
	onMount(() => {
		if (local.autoresize) queueMicrotask(resizeIfAutoresize)
	})
	onCleanup(() => {
		if (textareaRef && local.autoresize) textareaRef.style.height = ''
	})

	const handleChange = (val: string) => {
		if (local.error && local.onErrorClear) local.onErrorClear()
		local.onValueChange?.(val)
	}

	const handleInput = (e: InputEvent) => {
		if (local.onInput) (local.onInput as (e: InputEvent) => void)(e)
	}

	const resizeClass = () =>
		local.autoresize ? 'resize-none' : resizeClasses[local.resize ?? 'vertical']

	// ✅ link helper/error text to textarea (merges with any user aria-describedby)
	const uid = createUniqueId()
	const helperId = () => (!local.bare && local.helperText && !hasError() ? `ta-${uid}-help` : undefined)
	const errorId = () => (!local.bare && local.error ? `ta-${uid}-error` : undefined)
	const describedBy = () => {
		const user = (others['aria-describedby'] as string | undefined)
		const own = [helperId(), errorId()].filter(Boolean).join(' ')
		return user && own ? `${user} ${own}` : (user ?? (own || undefined))
	}

	return (
		<KobalteTextField
			value={local.value != null ? valueString() : undefined}
			onChange={handleChange}
			validationState={hasError() ? 'invalid' : undefined}
			required={local.required}
			disabled={local.disabled}
			class={cn('w-full', local.class)}
		>
			<Show when={!local.bare && local.label}>
				<div class="flex items-center justify-between gap-2 mb-1.5">
					<KobalteTextField.Label class={cn('block text-sm font-medium', hasError() ? 'text-danger-600' : 'text-ink-700')}>
						{local.label}
						<Show when={local.required}>
							<span class="text-danger-500 ml-0.5" aria-hidden="true">*</span>
						</Show>
					</KobalteTextField.Label>
					<Show when={local.label && !local.required && local.optional}>
						<span class="text-xs text-ink-500">optional</span>
					</Show>
				</div>
			</Show>

			<KobalteTextField.TextArea
				ref={mergeRefs((el: HTMLTextAreaElement) => (textareaRef = el), local.ref)}
				id={local.id}
				onInput={handleInput}
				rows={local.rows ?? 3}
				maxLength={local.maxLength}
				aria-invalid={hasError() || hasMaxLengthError() ? 'true' : undefined}
				aria-describedby={describedBy()}
				aria-errormessage={hasError() ? errorId() : undefined}
				class={cn(
					'w-full py-3 px-4 rounded-lg transition-all outline-none border text-base text-ink-900 placeholder:text-ink-400 min-h-[80px] bg-surface-raised',
					resizeClass(),
					hasError() || hasMaxLengthError()
						? 'border-danger-500 focus:ring-2 focus:ring-inset focus:ring-danger-500 focus:border-transparent'
						: 'border-surface-border focus:ring-2 focus:ring-inset focus:ring-primary-500 focus:border-transparent',
					'disabled:bg-surface-dim disabled:text-ink-500 disabled:cursor-not-allowed',
					local.inputClass,
				)}
				{...others}
			/>

			<Show when={!local.bare && local.maxLength != null && local.maxLength > 0}>
				<div class="mt-1.5 flex items-center justify-between gap-2">
					<span />
					<span class={cn('text-xs tabular-nums', countColorClass())}>
						{currentLength()}/{local.maxLength}
					</span>
				</div>
			</Show>

			<Show when={!local.bare && local.helperText && !hasError()}>
				<KobalteTextField.Description id={helperId()} class="mt-2 text-sm text-ink-500">
					{local.helperText}
				</KobalteTextField.Description>
			</Show>

			<Show when={!local.bare && local.error}>
				<KobalteTextField.ErrorMessage id={errorId()} class="mt-2 text-sm text-danger-600">
					{local.error}
				</KobalteTextField.ErrorMessage>
			</Show>
		</KobalteTextField>
	)
}
