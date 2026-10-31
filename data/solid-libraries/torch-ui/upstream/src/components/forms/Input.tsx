import { type JSX, splitProps, Show, createSignal } from 'solid-js'
import { TextField as KobalteTextField } from '@kobalte/core/text-field'
import { cn } from '../../utilities/classNames'
import { type ComponentSize, inputSizeConfig } from '../../types/component-size'
import { useIcons } from '../../icons'
import { useComponentSize } from '../../utilities/componentSizeContext'

export interface InputProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
	label?: string
	/** Optional content on the label row (e.g. "Forgot password?" link) */
	labelTrailing?: JSX.Element
	error?: JSX.Element
	helperText?: JSX.Element
	/** When true, never render label row or error/helper text (input only; error still affects border) */
	bare?: boolean
	/** When true, native required on input and required indicator (asterisk) on label. */
	required?: boolean
	/** When true, show "optional" on the label row when the field is not required. Default false. */
	optional?: boolean
	/** Input size. Controls height, text size, and padding. Default: md (36px). */
	size?: ComponentSize
	/** When true and type is "password", show a show/hide toggle (eye icon) to reveal the password. Default false. */
	revealable?: boolean
	/** Content at the start of the input (e.g. "$", a currency label, or an icon). */
	startAdornment?: JSX.Element
	/** Content at the end of the input (e.g. "USD", a unit label, or an icon). */
	endAdornment?: JSX.Element
	/** Fixed text/content segment at the start, separated by a border (e.g. "https://"). Renders outside the text area so it cannot be overwritten. */
	prefix?: JSX.Element
	/** Fixed text/content segment at the end, separated by a border (e.g. ".com"). Renders outside the text area so it cannot be overwritten. */
	suffix?: JSX.Element
	/** @deprecated Use startAdornment. */
	leftIcon?: JSX.Element
	/** @deprecated Use endAdornment. */
	rightIcon?: JSX.Element
	/** Applied to the native input element when you need to style the control itself. */
	inputClass?: string
	onValueChange?: (value: string) => void
	onErrorClear?: () => void
}

export function Input(props: InputProps) {
	const [local, others] = splitProps(props, [
		'label',
		'labelTrailing',
		'error',
		'helperText',
		'bare',
		'required',
		'optional',
		'size',
		'revealable',
		'type',
		'startAdornment',
		'endAdornment',
		'prefix',
		'suffix',
		'leftIcon',
		'rightIcon',
		'onValueChange',
		'onErrorClear',
		'class',
		'inputClass',
		'id',
		'value',
		'onInput',
		'ref',
		'disabled',
	])
	const icons = useIcons()
	const contextSize = useComponentSize()

	const hasError = () => !!local.error
	const sc = () => inputSizeConfig[local.size ?? contextSize ?? 'md']

	const handleChange = (val: string) => {
		if (local.error && local.onErrorClear) {
			local.onErrorClear()
		}
		local.onValueChange?.(val)
	}

	const handleInput = (e: InputEvent) => {
		if (local.onInput) {
			;(local.onInput as (e: InputEvent) => void)(e)
		}
	}

	const startContent = () => local.startAdornment ?? local.leftIcon
	const isPasswordRevealable = () => local.type === 'password' && local.revealable === true
	const [showPassword, setShowPassword] = createSignal(false)
	const effectiveType = () =>
		isPasswordRevealable() && showPassword() ? 'text' : (local.type ?? 'text')
	const endContent = () => {
		if (isPasswordRevealable()) return null
		return local.endAdornment ?? local.rightIcon
	}
	const hasStart = () => !!startContent()
	const hasEnd = () => !!endContent() || isPasswordRevealable()
	const hasAffix = () => !!local.prefix || !!local.suffix
	const adornmentClass = 'absolute top-1/2 -translate-y-1/2 flex items-center justify-center text-ink-500 pointer-events-none z-10'

	return (
		<KobalteTextField
			value={local.value != null ? String(local.value) : undefined}
			onChange={handleChange}
			validationState={hasError() ? 'invalid' : undefined}
			required={local.required}
			disabled={local.disabled}
			class={cn('w-full', local.class)}
		>
			<Show when={!local.bare && (local.label || local.labelTrailing)}>
				<div class="flex items-center justify-between gap-2 mb-1.5">
					<Show when={local.label}>
						<KobalteTextField.Label
							class={cn(
								'block text-sm font-medium',
								hasError() ? 'text-danger-600' : 'text-ink-700'
							)}
						>
							{local.label}
							<Show when={local.required}>
								<span class="text-danger-500 dark:text-danger-400 ml-0.5" aria-hidden="true">*</span>
							</Show>
						</KobalteTextField.Label>
					</Show>
					<Show when={!local.label}>
						<span />
					</Show>
					<div class="flex items-center gap-2 flex-shrink-0">
						<Show when={local.labelTrailing}>{local.labelTrailing}</Show>
						<Show when={local.label && !local.required && local.optional}>
							<span class="text-xs text-ink-500">optional</span>
						</Show>
					</div>
				</div>
			</Show>

			<div class={cn(
				'flex items-center',
				hasAffix() && [
					'rounded-lg border overflow-hidden bg-surface-raised',
					hasError()
						? 'border-danger-500 focus-within:ring-2 focus-within:ring-inset focus-within:ring-danger-500'
						: 'border-surface-border focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500',
					local.disabled && 'bg-surface-dim',
				],
				!hasAffix() && 'relative',
			)}>
				{/* Prefix segment */}
				<Show when={local.prefix}>
					<div class={cn(
						'flex items-center self-stretch shrink-0 border-r border-surface-border bg-surface-overlay text-ink-500',
						sc().text, sc().pl, sc().pr,
					)} aria-hidden="true">
						{local.prefix}
					</div>
				</Show>

				{/* Input area */}
				<div class={cn('relative', hasAffix() ? 'flex-1 min-w-0' : 'w-full')}>
					<Show when={startContent()}>
						<div
							class={cn(adornmentClass, sc().text, sc().adornStart)}
							aria-hidden="true"
						>
							{startContent()}
						</div>
					</Show>

					<KobalteTextField.Input
						ref={local.ref}
						id={local.id}
						type={effectiveType()}
						onInput={handleInput}
						class={cn(
							'w-full transition-all outline-none text-ink-900 placeholder:text-ink-400',
							sc().h, sc().py, sc().text,
							hasStart() ? sc().plAdorn : sc().pl,
							hasEnd() ? sc().prAdorn : sc().pr,
							hasAffix()
								? 'bg-surface-raised border-none ring-0 disabled:bg-surface-dim disabled:text-ink-500 disabled:cursor-not-allowed'
								: cn(
										'rounded-lg border bg-surface-raised',
										hasError()
											? 'border-danger-500 focus:ring-2 focus:ring-inset focus:ring-danger-500 focus:border-transparent'
											: 'border-surface-border focus:ring-2 focus:ring-inset focus:ring-primary-500 focus:border-transparent',
										'disabled:bg-surface-dim disabled:text-ink-500 disabled:cursor-not-allowed'
								  ),
							local.inputClass
						)}
						{...others}
					/>

					<Show when={endContent()}>
						<div
							class={cn(adornmentClass, sc().text, sc().adornEnd)}
							aria-hidden="true"
						>
							{endContent()}
						</div>
					</Show>
					<Show when={isPasswordRevealable()}>
						<button
							type="button"
							onClick={() => setShowPassword((v) => !v)}
							class={cn(
								'absolute top-1/2 -translate-y-1/2 flex items-center justify-center rounded p-1 z-10 text-ink-500 hover:text-ink-700 hover:bg-surface-overlay',
								sc().adornEnd, sc().text
							)}
							aria-label={showPassword() ? 'Hide password' : 'Show password'}
						>
							{showPassword()
								? icons.eyeOff({ class: 'h-4 w-4', 'aria-hidden': 'true' })
								: icons.eye({ class: 'h-4 w-4', 'aria-hidden': 'true' })}
						</button>
					</Show>
				</div>

				{/* Suffix segment */}
				<Show when={local.suffix}>
					<div class={cn(
						'flex items-center self-stretch shrink-0 border-l border-surface-border bg-surface-overlay text-ink-500',
						sc().text, sc().pl, sc().pr,
					)} aria-hidden="true">
						{local.suffix}
					</div>
				</Show>
			</div>

			<Show when={!local.bare && local.helperText && !hasError()}>
				<KobalteTextField.Description class="mt-2 text-sm text-ink-500">
					{local.helperText}
				</KobalteTextField.Description>
			</Show>

			<Show when={!local.bare}>
				<KobalteTextField.ErrorMessage class="mt-2 text-sm text-danger-600">
					{local.error}
				</KobalteTextField.ErrorMessage>
			</Show>
		</KobalteTextField>
	)
}
