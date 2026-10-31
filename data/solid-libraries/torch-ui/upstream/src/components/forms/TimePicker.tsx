import { type JSX, createSignal, Show, splitProps, createUniqueId } from 'solid-js'

import { Popover as KobaltePopover } from '@kobalte/core/popover'

import { TimeSelect } from './TimeSelect'

import { cn } from '../../utilities/classNames'

import { type ComponentSize, inputSizeConfig } from '../../types/component-size'

import { useComponentSize } from '../../utilities/componentSizeContext'

import { useIcons } from '../../icons'



/** Value is "HH:MM" in 24-hour format, or empty string. */

export interface TimePickerProps {

	value?: string

	onValueChange?: (value: string) => void

	/** Called when the user interacts with the control while an error is shown. */

	onErrorClear?: () => void

	placeholder?: string

	disabled?: boolean

	/** Time display format. Default: '12h'. */

	timeFormat?: '12h' | '24h'

	/** Minute increment. Default: 1 (every minute). */

	minuteStep?: number

	label?: string

	error?: JSX.Element

	helperText?: JSX.Element

	/** When true, renders without label/error chrome. */

	bare?: boolean

	required?: boolean

	/** Show "optional" badge when not required. */

	optional?: boolean

	size?: ComponentSize

	class?: string

	id?: string

}



export function TimePicker(props: TimePickerProps) {

	const [local] = splitProps(props, [

		'value', 'onValueChange', 'onErrorClear', 'placeholder', 'disabled',

		'label', 'error', 'helperText', 'bare', 'required', 'optional',

		'size', 'class', 'id', 'timeFormat', 'minuteStep',

	])



	const icons = useIcons()

	const contextSize = useComponentSize()

	const sc = () => inputSizeConfig[local.size ?? contextSize ?? 'md']

	const generatedId = createUniqueId()

	const inputId = () => local.id || `timepicker-${generatedId}`

	const [open, setOpen] = createSignal(false)



	const is12h = () => local.timeFormat !== '24h'

	const step = () => local.minuteStep ?? 1

	const maxMinute = () => Math.floor(59 / step()) * step()



	// ── Pending hour/minute (synced from value on open) ─────────────────

	const parseValue = () => {

		if (!local.value) return null

		const [h, m] = local.value.split(':').map(Number)

		if (isNaN(h) || isNaN(m)) return null

		return { h, m }

	}



	const [pendingHour, setPendingHour] = createSignal(0)

	const [pendingMinute, setPendingMinute] = createSignal(0)



	// ── 12h display helpers ──────────────────────────────────────────────

	const displayHour12 = () => { const h = pendingHour(); return h === 0 ? 12 : h > 12 ? h - 12 : h }

	const displayAmPm = () => pendingHour() < 12 ? 'AM' : 'PM'



	function toggleAmPm() {

		const h = pendingHour()

		const next = h < 12 ? h + 12 : h - 12

		commit(next, pendingMinute())

	}



	function handleHour12Change(h12: number) {

		const isAm = pendingHour() < 12

		const next24 = isAm ? (h12 === 12 ? 0 : h12) : (h12 === 12 ? 12 : h12 + 12)

		commit(next24, pendingMinute())

	}



	// ── Commit helpers ───────────────────────────────────────────────────

	function commit(h: number, m: number) {

		setPendingHour(h)

		setPendingMinute(m)

		if (local.error && local.onErrorClear) local.onErrorClear()

		local.onValueChange?.(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)

	}



	function clearValue() {

		if (local.error && local.onErrorClear) local.onErrorClear()

		local.onValueChange?.('')

	}



	// ── Display value ────────────────────────────────────────────────────

	const displayValue = () => {

		const parsed = parseValue()

		if (!parsed) return ''

		const { h, m } = parsed

		const mm = String(m).padStart(2, '0')

		if (local.timeFormat === '24h') return `${String(h).padStart(2, '0')}:${mm}`

		const hour12 = h % 12 || 12

		const ampm = h < 12 ? 'AM' : 'PM'

		return `${hour12}:${mm} ${ampm}`

	}



	// ── Sync pending state when popover opens ────────────────────────────

	function onOpenChange(next: boolean) {

		if (next) {

			const parsed = parseValue()

			if (parsed) {

				setPendingHour(parsed.h)

				setPendingMinute(parsed.m)

			} else {

				setPendingHour(0)

				setPendingMinute(0)

			}

		}

		setOpen(next)

	}



	const hasError = () => !!local.error

	const msgId = () => (local.error || local.helperText) ? `${inputId()}-msg` : undefined



	const ampmClass = 'rounded-md border border-surface-border bg-surface-raised px-2 py-1 text-xs font-medium text-ink-700 hover:bg-surface-overlay transition-colors min-w-[2.5rem] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500/50'



	return (

		<div class={cn('w-full', local.class)}>

			<Show when={!local.bare && local.label}>

				<div class="mb-2 flex items-center justify-between">

					<label

						for={inputId()}

						class={cn(

							'block text-sm font-medium',

							hasError() ? 'text-danger-600 dark:text-danger-400' : 'text-ink-700',

						)}

					>

						{local.label}

						{local.required && <span class="text-danger-500 ml-0.5" aria-hidden="true">*</span>}

					</label>

					<Show when={!local.required && local.optional}>

						<span class="text-xs text-ink-400">optional</span>

					</Show>

				</div>

			</Show>



			<KobaltePopover

				open={open()}

				onOpenChange={onOpenChange}

				gutter={8}

			>

				<div class="relative">

					<KobaltePopover.Trigger

						as="button"

						type="button"

						id={inputId()}

						disabled={local.disabled}

						aria-describedby={msgId()}

						aria-invalid={hasError() ? 'true' : undefined}

						class={cn(

							'inline-flex w-full items-center gap-2 rounded-lg border transition-colors',

							sc().h, sc().py, sc().pl, sc().text,

							displayValue() && !local.disabled ? 'pr-8' : sc().pr,

							hasError()

								? 'border-danger-500 bg-surface-raised text-ink-900 hover:border-danger-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-danger-500 focus-visible:border-transparent'

								: 'border-surface-border bg-surface-raised text-ink-900 hover:border-ink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 focus-visible:border-transparent',

							local.disabled && 'opacity-50',

						)}

					>

						{icons.clock({ class: 'h-4 w-4 shrink-0 text-ink-400', 'aria-hidden': 'true' })}

						<span class={cn('truncate', displayValue() ? 'text-ink-900' : 'text-ink-400')}>

							{displayValue() || (local.placeholder ?? 'Select time')}

						</span>

					</KobaltePopover.Trigger>

					<Show when={displayValue() && !local.disabled}>

						<button

							type="button"

							onClick={(e) => { e.stopPropagation(); clearValue() }}

							class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-400 hover:text-ink-700 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"

							aria-label="Clear time"

						>

							{icons.close({ class: 'h-3.5 w-3.5', 'aria-hidden': 'true' })}

						</button>

					</Show>

				</div>



				<KobaltePopover.Portal>

					<KobaltePopover.Content

						data-kb-top-layer=""

						role="dialog"

						aria-label="Choose time"

						class={cn(

							'z-[80] rounded-xl border border-surface-border bg-surface-raised shadow-xl outline-none',

							'origin-top data-[expanded]:animate-in data-[expanded]:fade-in-0 data-[expanded]:zoom-in-95',

							'data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95',

						)}

					>

						<div class="w-[220px] p-4">

							{/* Time selectors */}

							<div class="flex items-center justify-center gap-2">

								{/* Hour */}

								<Show when={is12h()} fallback={

									<TimeSelect value={pendingHour()} options={Array.from({ length: 24 }, (_, i) => i)} onChange={(v) => commit(v, pendingMinute())} />

								}>

									<TimeSelect value={displayHour12()} options={Array.from({ length: 12 }, (_, i) => i + 1)} onChange={handleHour12Change} />

								</Show>



								<span class="text-sm font-semibold text-ink-400">:</span>



								{/* Minute */}

								<TimeSelect value={pendingMinute()} options={Array.from({ length: Math.ceil(60 / step()) }, (_, i) => i * step())} onChange={(v) => commit(pendingHour(), v)} />



								{/* AM/PM */}

								<Show when={is12h()}>

									<button type="button" onClick={toggleAmPm} class={ampmClass}>

										{displayAmPm()}

									</button>

								</Show>

							</div>



							{/* Footer */}

							<div class="mt-3 flex items-center justify-between border-t border-surface-border pt-3">

								<div class="text-xs text-ink-400">{displayValue() || 'No time selected'}</div>

								<div class="flex gap-2">

									<Show when={displayValue()}>

										<button

											type="button"

											onClick={() => { clearValue(); setOpen(false) }}

											class="rounded-md px-2 py-1 text-xs text-ink-500 hover:bg-surface-overlay hover:text-ink-700 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"

										>

											Clear

										</button>

									</Show>

									<button

										type="button"

										onClick={() => setOpen(false)}

										class="rounded-md px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"

									>

										Done

									</button>

								</div>

							</div>

						</div>

					</KobaltePopover.Content>

				</KobaltePopover.Portal>

			</KobaltePopover>



			<Show when={local.error || local.helperText}>

				<p

					id={msgId()}

					class={cn('mt-1.5 text-xs', hasError() ? 'text-danger-600 dark:text-danger-400' : 'text-ink-500')}

				>

					{local.error ?? local.helperText}

				</p>

			</Show>

		</div>

	)

}

