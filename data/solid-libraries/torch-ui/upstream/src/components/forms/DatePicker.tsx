import { type JSX, createSignal, createMemo, Show, For, splitProps, createUniqueId, } from 'solid-js'

import { Popover as KobaltePopover } from '@kobalte/core/popover'

import { cn } from '../../utilities/classNames'

import { type ComponentSize, inputSizeConfig } from '../../types/component-size'

import { useComponentSize } from '../../utilities/componentSizeContext'

import { useIcons } from '../../icons'



/** A preset option shown in the DatePicker sidebar. */

export interface DatePickerPreset {

	label: string

	value: string

}



/** Value is ISO date string YYYY-MM-DD, or YYYY-MM-DDTHH:MM when showTime is true. */

export interface DatePickerProps {

	value?: string

	onValueChange?: (value: string) => void

	/** Called when the user interacts with the control while an error is shown, allowing the parent to clear the error. */

	onErrorClear?: () => void

	placeholder?: string

	disabled?: boolean

	/** Min date YYYY-MM-DD */

	min?: string

	/** Max date YYYY-MM-DD */

	max?: string

	label?: string

	error?: JSX.Element

	helperText?: JSX.Element

	bare?: boolean

	required?: boolean

	/** When true, show "optional" on the label row when not required. Default false. */

	optional?: boolean

	/** Component size. Default 'md'. */

	size?: ComponentSize

	class?: string

	id?: string

	/** Quick-select presets shown in a sidebar. Each has label and value (YYYY-MM-DD). */

	presets?: DatePickerPreset[]

	/** When true, adds HH:MM time selectors in the footer. Value format becomes YYYY-MM-DDTHH:MM. */

	showTime?: boolean

	/** Clock format for time picker. Default '12h'. */

	timeFormat?: '12h' | '24h'

}



const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const MONTH_NAMES = [

	'January', 'February', 'March', 'April', 'May', 'June',

	'July', 'August', 'September', 'October', 'November', 'December',

]



function parseDate(s: string): Date | null {

	if (!s) return null

	const datePart = s.slice(0, 10)

	if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return null

	const d = new Date(datePart + 'T12:00:00')

	return isNaN(d.getTime()) ? null : d

}



function toISODate(d: Date): string {

	const y = d.getFullYear()

	const m = String(d.getMonth() + 1).padStart(2, '0')

	const day = String(d.getDate()).padStart(2, '0')

	return `${y}-${m}-${day}`

}



function formatDisplay(s: string, showTime?: boolean, timeFormat?: '12h' | '24h'): string {

	if (!s) return ''

	const d = parseDate(s)

	if (!d) return ''

	const dateStr = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

	if (!showTime || s.length < 16) return dateStr

	const timePart = s.slice(11, 16)

	const [h, m] = timePart.split(':').map(Number)

	if (isNaN(h) || isNaN(m)) return dateStr

	const mm = String(m).padStart(2, '0')

	if (timeFormat === '24h') return `${dateStr}, ${String(h).padStart(2, '0')}:${mm}`

	const hour12 = h % 12 || 12

	const ampm = h < 12 ? 'AM' : 'PM'

	return `${dateStr}, ${hour12}:${mm} ${ampm}`

}



function getCalendarDays(year: number, month: number): Date[][] {

	const first = new Date(year, month, 1)

	const last = new Date(year, month + 1, 0)

	const startPad = first.getDay()

	const flat: Date[] = []

	for (let i = 0; i < startPad; i++) flat.push(new Date(year, month, 1 - (startPad - i)))

	for (let d = 1; d <= last.getDate(); d++) flat.push(new Date(year, month, d))

	for (let n = 1; flat.length < 42; n++) flat.push(new Date(year, month + 1, n))

	const grid: Date[][] = []

	for (let r = 0; r < 6; r++) grid.push(flat.slice(r * 7, (r + 1) * 7))

	return grid

}



export function DatePicker(props: DatePickerProps) {

	const [local] = splitProps(props, [

		'value', 'onValueChange', 'onErrorClear', 'placeholder', 'disabled',

		'min', 'max', 'label', 'error', 'helperText', 'bare',

		'required', 'optional', 'size', 'class', 'id',

		'presets', 'showTime', 'timeFormat',

	])

	const icons = useIcons()

	const contextSize = useComponentSize()

	const sc = () => inputSizeConfig[local.size ?? contextSize ?? 'md']



	const generatedId = createUniqueId()

	const inputId = () => local.id || `datepicker-${generatedId}`

	const [open, setOpen] = createSignal(false)



	const valueDatePart = () => local.value ? local.value.slice(0, 10) : ''

	const valueDate = () => parseDate(valueDatePart())

	const viewDate = () => valueDate() ?? new Date()



	const [viewMonthYear, setViewMonthYear] = createSignal<{ year: number; month: number } | null>(null)

	const effectiveViewYear = () => viewMonthYear()?.year ?? viewDate().getFullYear()

	const effectiveViewMonth = () => viewMonthYear()?.month ?? viewDate().getMonth()

	const calendarDays = createMemo(() => getCalendarDays(effectiveViewYear(), effectiveViewMonth()))



	type ViewMode = 'calendar' | 'months' | 'years'

	const [viewMode, setViewMode] = createSignal<ViewMode>('calendar')



	const minDate = () => (local.min ? parseDate(local.min) : null)

	const maxDate = () => (local.max ? parseDate(local.max) : null)



	// ── Time state ────────────────────────────────────────────────────────

	const [pendingHour, setPendingHour] = createSignal(0)

	const [pendingMinute, setPendingMinute] = createSignal(0)

	const is12h = () => local.timeFormat !== '24h'

	const displayHour12 = () => { const h = pendingHour(); return h === 0 ? 12 : h > 12 ? h - 12 : h }

	const displayAmPm = () => pendingHour() < 12 ? 'AM' : 'PM'



	function syncTimeFromValue() {

		if (local.value && local.value.length >= 16) {

			const [h, m] = local.value.slice(11, 16).split(':').map(Number)

			if (!isNaN(h) && !isNaN(m)) { setPendingHour(h); setPendingMinute(m); return }

		}

		setPendingHour(0)

		setPendingMinute(0)

	}



	function buildValue(dateStr: string, h: number, m: number): string {

		if (!local.showTime) return dateStr

		return `${dateStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`

	}



	function commitTime(h: number, m: number) {

		setPendingHour(h)

		setPendingMinute(m)

		const dp = valueDatePart()

		if (dp) {

			if (local.error && local.onErrorClear) local.onErrorClear()

			local.onValueChange?.(buildValue(dp, h, m))

		}

	}



	function toggleAmPm() {

		const h = pendingHour()

		commitTime(h < 12 ? h + 12 : h - 12, pendingMinute())

	}



	// ── Year list ─────────────────────────────────────────────────────────

	const yearsList = () => {

		const current = effectiveViewYear()

		const minY = minDate()?.getFullYear() ?? current - 20

		const maxY = maxDate()?.getFullYear() ?? current + 5

		return Array.from({ length: maxY - minY + 1 }, (_, i) => minY + i)

	}



	// ── Date helpers ──────────────────────────────────────────────────────

	function isDisabled(d: Date): boolean {

		const t = d.getTime()

		if (minDate() && t < minDate()!.getTime()) return true

		if (maxDate() && t > maxDate()!.getTime()) return true

		return false

	}



	function isCurrentMonth(d: Date): boolean {

		return d.getMonth() === effectiveViewMonth() && d.getFullYear() === effectiveViewYear()

	}



	function isSelected(d: Date): boolean {

		return !!valueDatePart() && toISODate(d) === valueDatePart()

	}



	function selectDate(d: Date) {

		if (isDisabled(d)) return

		if (local.error && local.onErrorClear) local.onErrorClear()

		const dateStr = toISODate(d)

		local.onValueChange?.(buildValue(dateStr, pendingHour(), pendingMinute()))

		if (!local.showTime) setOpen(false)

	}



	function selectPreset(value: string) {

		if (local.error && local.onErrorClear) local.onErrorClear()

		if (local.showTime) {

			local.onValueChange?.(buildValue(value, pendingHour(), pendingMinute()))

		} else {

			local.onValueChange?.(value)

			setOpen(false)

		}

	}



	const todayISO = () => toISODate(new Date())

	const todayDisabled = () => isDisabled(new Date())



	function selectToday() {

		if (todayDisabled()) return

		if (local.error && local.onErrorClear) local.onErrorClear()

		local.onValueChange?.(buildValue(todayISO(), pendingHour(), pendingMinute()))

		if (!local.showTime) setOpen(false)

	}



	function goPrevMonth() {

		const d = new Date(effectiveViewYear(), effectiveViewMonth() - 1, 1)

		setViewMonthYear({ year: d.getFullYear(), month: d.getMonth() })

	}

	function goNextMonth() {

		const d = new Date(effectiveViewYear(), effectiveViewMonth() + 1, 1)

		setViewMonthYear({ year: d.getFullYear(), month: d.getMonth() })

	}

	function goPrevYear() {

		setViewMonthYear({ year: effectiveViewYear() - 1, month: effectiveViewMonth() })

	}

	function goNextYear() {

		setViewMonthYear({ year: effectiveViewYear() + 1, month: effectiveViewMonth() })

	}

	function setMonth(m: number) {

		setViewMonthYear({ year: effectiveViewYear(), month: m })

		setViewMode('calendar')

	}

	function setYear(y: number) {

		setViewMonthYear({ year: y, month: effectiveViewMonth() })

		setViewMode('calendar')

	}



	const canGoPrevMonth = () => {

		const mn = minDate()

		if (!mn) return true

		return new Date(effectiveViewYear(), effectiveViewMonth(), 0).getTime() >= mn.getTime()

	}

	const canGoNextMonth = () => {

		const mx = maxDate()

		if (!mx) return true

		return new Date(effectiveViewYear(), effectiveViewMonth() + 1, 1).getTime() <= mx.getTime()

	}

	const canGoPrevYear = () => {

		const mn = minDate()

		if (!mn) return true

		return effectiveViewYear() > mn.getFullYear()

	}

	const canGoNextYear = () => {

		const mx = maxDate()

		if (!mx) return true

		return effectiveViewYear() < mx.getFullYear()

	}



	const isMonthDisabled = (m: number) => {

		const y = effectiveViewYear()

		const mn = minDate()

		const mx = maxDate()

		if (mn && new Date(y, m + 1, 0).getTime() < mn.getTime()) return true

		if (mx && new Date(y, m, 1).getTime() > mx.getTime()) return true

		return false

	}



	const displayValue = () => formatDisplay(local.value ?? '', local.showTime, local.timeFormat)

	const hasError = () => !!local.error

	const msgId = () => (local.error || local.helperText) ? `${inputId()}-msg` : undefined

	const hasPresets = () => !!(local.presets && local.presets.length > 0)



	const timeHourDisplay = () => is12h() ? String(displayHour12()) : String(pendingHour()).padStart(2, '0')

	const timeMinuteDisplay = () => String(pendingMinute()).padStart(2, '0')



	// shared Tailwind class strings

	const navBtnSm = 'flex h-7 w-7 items-center justify-center rounded-md hover:bg-surface-overlay transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50'

	const timeBtnSm = 'flex h-6 w-6 items-center justify-center rounded text-ink-500 hover:bg-surface-overlay transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50'

	const timeInputCls = 'w-9 rounded-md border border-surface-border bg-surface-raised py-0.5 text-center text-sm font-medium text-ink-900 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500'



	return (

		<div class={cn('w-full', local.class)}>

			<Show when={!local.bare && local.label}>

				<div class="mb-2 flex items-center justify-between">

					<label

						for={inputId()}

						class={cn(

							'block text-sm font-medium',

							hasError() ? 'text-danger-600' : 'text-ink-700',

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

				onOpenChange={(next) => {

					setOpen(next)

					if (next) {

						const d = valueDate() ?? minDate() ?? new Date()

						setViewMonthYear({ year: d.getFullYear(), month: d.getMonth() })

						syncTimeFromValue()

					}

					setViewMode('calendar')

				}}

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

						{icons.calendar({ class: 'h-4 w-4 shrink-0 text-ink-400', 'aria-hidden': 'true' })}

						<span class={cn('truncate', displayValue() ? 'text-ink-900' : 'text-ink-400')}>

							{displayValue() || (local.placeholder ?? 'Select date')}

						</span>

					</KobaltePopover.Trigger>

					<Show when={displayValue() && !local.disabled}>

						<button

							type="button"

							onClick={(e) => { e.stopPropagation(); local.onValueChange?.('') }}

							class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-400 hover:text-ink-700 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"

							aria-label="Clear date"

						>

							{icons.close({ class: 'h-3.5 w-3.5', 'aria-hidden': 'true' })}

						</button>

					</Show>

				</div>



			<KobaltePopover.Portal>

				<KobaltePopover.Content

					data-kb-top-layer=""

					role="dialog"

						aria-label="Choose date"

						class={cn(

							'z-[80] rounded-xl border border-surface-border bg-surface-raised shadow-xl outline-none',

							'origin-top data-[expanded]:animate-in data-[expanded]:fade-in-0 data-[expanded]:zoom-in-95',

							'data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95',

						)}

					>

						<div class={cn('p-3 flex gap-3')}>



							{/* Presets sidebar */}

							<Show when={hasPresets()}>

								<div class="flex flex-col gap-1 border-r border-surface-border pr-3 min-w-[110px]">

									<For each={local.presets}>

										{(preset) => (

											<button

												type="button"

												onClick={() => selectPreset(preset.value)}

												class={cn(

													'w-full rounded-md px-3 py-1.5 text-left text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',

													valueDatePart() === preset.value

														? 'bg-primary-500 text-white'

														: 'text-ink-700 hover:bg-surface-overlay',

												)}

											>

												{preset.label}

											</button>

										)}

									</For>

								</div>

							</Show>



							{/* Calendar body */}

							<div class="flex-1 min-w-0">



								{/* Header */}

								<div class="flex items-center justify-between gap-2 mb-3">

									{viewMode() !== 'calendar' ? (

										<button

											type="button"

											onClick={() => setViewMode('calendar')}

											class={cn(navBtnSm, 'text-ink-500')}

											aria-label="Back to calendar"

										>

											{icons.chevronLeft({ class: 'h-4 w-4', 'aria-hidden': 'true' })}

										</button>

									) : (

										<button

											type="button"

											onClick={goPrevMonth}

											disabled={!canGoPrevMonth()}

											class={cn(navBtnSm, 'text-ink-500', !canGoPrevMonth() && 'opacity-30 pointer-events-none')}

											aria-label="Previous month"

										>

											{icons.chevronLeft({ class: 'h-4 w-4', 'aria-hidden': 'true' })}

										</button>

									)}



									<div class="flex min-w-[140px] items-center justify-center gap-1">

										{viewMode() === 'calendar' && (

											<>

												<button

													type="button"

													onClick={() => setViewMode('months')}

													class="rounded-md px-2 py-1 text-sm font-semibold text-ink-900 hover:bg-surface-overlay transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"

												>

													{MONTH_NAMES[effectiveViewMonth()]}

												</button>

												<button

													type="button"

													onClick={() => setViewMode('years')}

													class="rounded-md px-2 py-1 text-sm font-semibold text-ink-900 hover:bg-surface-overlay transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"

												>

													{effectiveViewYear()}

												</button>

											</>

										)}

										{viewMode() === 'months' && (

											<>

												<button

													type="button"

													onClick={goPrevYear}

													disabled={!canGoPrevYear()}

													class={cn(navBtnSm, 'text-ink-400', !canGoPrevYear() && 'opacity-30 pointer-events-none')}

													aria-label="Previous year"

												>

													{icons.chevronLeft({ class: 'h-4 w-4', 'aria-hidden': 'true' })}

												</button>

												<button

													type="button"

													onClick={() => setViewMode('years')}

													class="rounded-md px-2 py-1 text-sm font-semibold text-ink-900 hover:bg-surface-overlay transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"

												>

													{effectiveViewYear()}

												</button>

												<button

													type="button"

													onClick={goNextYear}

													disabled={!canGoNextYear()}

													class={cn(navBtnSm, 'text-ink-400', !canGoNextYear() && 'opacity-30 pointer-events-none')}

													aria-label="Next year"

												>

													{icons.chevronRight({ class: 'h-4 w-4', 'aria-hidden': 'true' })}

												</button>

											</>

										)}

										{viewMode() === 'years' && (

											<span class="text-sm font-semibold text-ink-900">Select year</span>

										)}

									</div>



									{viewMode() !== 'calendar' ? (

										<div class="w-7" aria-hidden="true" />

									) : (

										<button

											type="button"

											onClick={goNextMonth}

											disabled={!canGoNextMonth()}

											class={cn(navBtnSm, 'text-ink-500', !canGoNextMonth() && 'opacity-30 pointer-events-none')}

											aria-label="Next month"

										>

											{icons.chevronRight({ class: 'h-4 w-4', 'aria-hidden': 'true' })}

										</button>

									)}

								</div>



								{/* Calendar grid */}

								<Show when={viewMode() === 'calendar'}>

									<div>

										<div class="grid grid-cols-7 mb-2">

											<For each={DAY_NAMES}>

												{(name) => (

													<div class="py-1 text-center text-xs font-medium text-ink-400">{name}</div>

												)}

											</For>

										</div>

										<For each={calendarDays()}>

											{(week) => (

												<div class="grid grid-cols-7">

													<For each={week}>

														{(d) => {

															const disabled = isDisabled(d)

															const currentMonth = isCurrentMonth(d)

															const selected = isSelected(d)

															const isToday = toISODate(d) === todayISO()

															return (

																<div class="relative h-8 flex items-center justify-center">

																	<button

																		type="button"

																		disabled={disabled}

																		onClick={() => selectDate(d)}

																		aria-label={d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

																		aria-current={selected ? 'date' : undefined}

																		class={cn(

																			'relative z-10 h-7 w-7 rounded-full text-xs transition-colors',

																			'outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',

																			selected

																				? 'bg-primary-500 text-white font-semibold hover:bg-primary-600'

																				: !currentMonth

																					? 'text-ink-300 hover:bg-surface-overlay'

																					: isToday

																						? 'text-primary-600 font-semibold hover:bg-surface-overlay'

																						: 'text-ink-800 hover:bg-surface-overlay',

																			disabled && 'opacity-30',

																		)}

																	>

																		{d.getDate()}

																		{isToday && !selected && (

																			<span class="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary-500" />

																		)}

																	</button>

																</div>

															)

														}}

													</For>

												</div>

											)}

										</For>

									</div>

								</Show>



								{/* Month picker */}

								<Show when={viewMode() === 'months'}>

									<div class="grid grid-cols-3 gap-1">

										<For each={MONTH_NAMES}>

											{(name, m) => (

												<button

													type="button"

													onClick={() => setMonth(m())}

													disabled={isMonthDisabled(m())}

													class={cn(

														'rounded-lg py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',

														isMonthDisabled(m())

															? 'text-ink-300 opacity-50'

															: m() === effectiveViewMonth()

																? 'bg-primary-500 text-white'

																: 'text-ink-700 hover:bg-surface-overlay',

													)}

												>

													{name}

												</button>

											)}

										</For>

									</div>

								</Show>



								{/* Year picker */}

								<Show when={viewMode() === 'years'}>

									<div class="grid max-h-48 grid-cols-4 gap-1 overflow-y-auto">

										<For each={yearsList()}>

											{(y) => (

												<button

													type="button"

													onClick={() => setYear(y)}

													class={cn(

														'rounded-lg py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',

														y === effectiveViewYear()

															? 'bg-primary-500 text-white'

															: 'text-ink-700 hover:bg-surface-overlay',

													)}

												>

													{y}

												</button>

											)}

										</For>

									</div>

								</Show>



								{/* Time picker */}

								<Show when={local.showTime}>

									<div class="mt-3 border-t border-surface-border pt-3">

										<div class="flex items-center justify-center gap-1">

											{/* Hour */}

											<div class="flex flex-col items-center gap-0.5">

												<button

													type="button"

													onClick={() => commitTime((pendingHour() + 1) % 24, pendingMinute())}

													class={timeBtnSm}

													aria-label="Increment hour"

												>

													{icons.chevronUp({ class: 'h-3.5 w-3.5', 'aria-hidden': 'true' })}

												</button>

												<input

													type="text"

													inputmode="numeric"

													value={timeHourDisplay()}

													onInput={(e) => {

														const v = parseInt(e.currentTarget.value, 10)

														if (isNaN(v)) return

														if (is12h()) {

															if (v < 1 || v > 12) return

															const isAm = pendingHour() < 12

															commitTime(isAm ? (v === 12 ? 0 : v) : (v === 12 ? 12 : v + 12), pendingMinute())

														} else {

															if (v < 0 || v > 23) return

															commitTime(v, pendingMinute())

														}

													}}

													class={timeInputCls}

													aria-label="Hour"

												/>

												<button

													type="button"

													onClick={() => commitTime((pendingHour() + 23) % 24, pendingMinute())}

													class={timeBtnSm}

													aria-label="Decrement hour"

												>

													{icons.chevronDown({ class: 'h-3.5 w-3.5', 'aria-hidden': 'true' })}

												</button>

											</div>



											<span class="text-sm font-bold text-ink-400 mb-0.5">:</span>



											{/* Minute */}

											<div class="flex flex-col items-center gap-0.5">

												<button

													type="button"

													onClick={() => commitTime(pendingHour(), (pendingMinute() + 1) % 60)}

													class={timeBtnSm}

													aria-label="Increment minute"

												>

													{icons.chevronUp({ class: 'h-3.5 w-3.5', 'aria-hidden': 'true' })}

												</button>

												<input

													type="text"

													inputmode="numeric"

													value={timeMinuteDisplay()}

													onInput={(e) => {

														const v = parseInt(e.currentTarget.value, 10)

														if (isNaN(v) || v < 0 || v > 59) return

														commitTime(pendingHour(), v)

													}}

													class={timeInputCls}

													aria-label="Minute"

												/>

												<button

													type="button"

													onClick={() => commitTime(pendingHour(), (pendingMinute() + 59) % 60)}

													class={timeBtnSm}

													aria-label="Decrement minute"

												>

													{icons.chevronDown({ class: 'h-3.5 w-3.5', 'aria-hidden': 'true' })}

												</button>

											</div>



											{/* AM/PM */}

											<Show when={is12h()}>

												<button

													type="button"

													onClick={toggleAmPm}

													class="ml-1 rounded-md border border-surface-border bg-surface-raised px-2 py-1 text-xs font-medium text-ink-700 hover:bg-surface-overlay transition-colors min-w-[2.5rem] outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"

												>

													{displayAmPm()}

												</button>

											</Show>

										</div>

									</div>

								</Show>



								{/* Footer */}

								<div class="mt-3 flex items-center justify-between border-t border-surface-border pt-3">

									<div class="text-xs text-ink-400">{displayValue() || 'No date selected'}</div>

									<div class="flex gap-2">

										<button

											type="button"

											onClick={() => { local.onValueChange?.(''); if (!local.showTime) setOpen(false) }}

											class={cn(

												'rounded-md px-2 py-1 text-xs text-ink-500 hover:bg-surface-overlay hover:text-ink-700 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',

												!displayValue() && 'invisible',

											)}

										>

											Clear

										</button>

										<Show when={!local.showTime}>

											<button

												type="button"

												disabled={todayDisabled()}

												onClick={selectToday}

												class={cn(

													'rounded-md px-2 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',

													todayDisabled()

														? 'text-ink-300'

														: 'text-primary-600 hover:bg-primary-50',

												)}

											>

												Today

											</button>

										</Show>

										<Show when={local.showTime}>

											<button

												type="button"

												onClick={() => setOpen(false)}

												class="rounded-md px-2 py-1 text-xs font-medium text-white bg-primary-500 hover:bg-primary-600 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"

											>

												Done

											</button>

										</Show>

									</div>

								</div>



							</div>

						</div>

				</KobaltePopover.Content>

			</KobaltePopover.Portal>

			</KobaltePopover>



			<Show when={local.error || local.helperText}>

				<p

					id={msgId()}

					class={cn('mt-1.5 text-xs', hasError() ? 'text-danger-600' : 'text-ink-500')}

				>

					{local.error ?? local.helperText}

				</p>

			</Show>

		</div>

	)

}

