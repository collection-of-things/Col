import { type JSX, createSignal, createMemo, Show, For, splitProps, createUniqueId, createEffect, on } from 'solid-js'

import { Popover as KobaltePopover } from '@kobalte/core/popover'

import { TimeSelect } from './TimeSelect'

import { cn } from '../../utilities/classNames'

import { type ComponentSize, inputSizeConfig } from '../../types/component-size'

import { useComponentSize } from '../../utilities/componentSizeContext'

import { useIcons } from '../../icons'



export interface DateRangePickerProps {

	/** ISO date string YYYY-MM-DD for range start */

	start?: string

	/** ISO date string YYYY-MM-DD for range end */

	end?: string

	/** Called when range changes. end may be empty string if only start is selected. */

	onValueChange?: (start: string, end: string) => void

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

	optional?: boolean

	/** Show two months side by side. Default: true */

	dualMonth?: boolean

	/** Allow clearing the range. Default: true */

	clearable?: boolean

	/** Component size. Default 'md'. */

	size?: ComponentSize

	/** When true, include HH:MM time pickers for start and end. Value format becomes YYYY-MM-DDTHH:MM. */

	showTime?: boolean

	/** Time display format when showTime is true. Default: '12h'. */

	timeFormat?: '12h' | '24h'

	/** Minute increment for the time picker. Default: 1 (every minute). */

	minuteStep?: number

	class?: string

	id?: string

}



const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const MONTH_NAMES = [

	'January', 'February', 'March', 'April', 'May', 'June',

	'July', 'August', 'September', 'October', 'November', 'December',

]



function parseDate(s: string): Date | null {

	if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null

	const d = new Date(s + 'T12:00:00')

	return isNaN(d.getTime()) ? null : d

}



function toISODate(d: Date): string {

	const y = d.getFullYear()

	const m = String(d.getMonth() + 1).padStart(2, '0')

	const day = String(d.getDate()).padStart(2, '0')

	return `${y}-${m}-${day}`

}



function formatDisplay(s: string): string {

	const d = parseDate(s)

	if (!d) return ''

	return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

}



function sameDay(a: Date, b: Date) {

	return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

}



function getCalendarDays(year: number, month: number): Date[] {

	const first = new Date(year, month, 1)

	const last = new Date(year, month + 1, 0)

	const startPad = first.getDay()

	const flat: Date[] = []

	for (let i = 0; i < startPad; i++) {

		flat.push(new Date(year, month, 1 - (startPad - i)))

	}

	for (let d = 1; d <= last.getDate(); d++) {

		flat.push(new Date(year, month, d))

	}

	while (flat.length < 42) {

		flat.push(new Date(year, month + 1, flat.length - last.getDate() - startPad + 1))

	}

	return flat

}



interface MonthGridProps {

	year: number

	month: number

	start: Date | null

	end: Date | null

	hover: Date | null

	min: Date | null

	max: Date | null

	/** When set, all dates strictly before this date are disabled (used when picking end date). */

	selectableFrom?: Date | null

	onDayClick: (d: Date) => void

	onDayHover: (d: Date | null) => void

}



function MonthGrid(props: MonthGridProps) {

	const days = createMemo(() => getCalendarDays(props.year, props.month))



	const isCurrentMonth = (d: Date) => d.getMonth() === props.month

	const isDisabled = (d: Date) => {

		if (props.min && d < props.min) return true

		if (props.max && d > props.max) return true

		if (props.selectableFrom && d < props.selectableFrom) return true

		return false

	}

	const isStart = (d: Date) => !!props.start && sameDay(d, props.start)



	const effectiveEndDate = () => (!props.end && props.hover) ? props.hover : props.end



	const orderedRange = (): [Date, Date] | null => {

		const s = props.start

		const e = effectiveEndDate()

		if (!s || !e) return null

		return e < s ? [e, s] : [s, e]

	}



	const isInRange = (d: Date) => {

		const range = orderedRange()

		if (!range) return false

		return d > range[0] && d < range[1]

	}



	const isRangeStart = (d: Date) => {

		const range = orderedRange()

		if (!range) return isStart(d)

		return sameDay(d, range[0])

	}



	const isRangeEnd = (d: Date) => {

		const range = orderedRange()

		if (!range) return false

		return sameDay(d, range[1])

	}



	const isToday = (d: Date) => sameDay(d, new Date())



	return (

		<div>

			<div class="grid grid-cols-7 mb-2">

				<For each={DAY_NAMES}>

					{(name) => (

						<div class="py-1 text-center text-xs font-medium text-ink-400">{name}</div>

					)}

				</For>

			</div>

			<div class="grid grid-cols-7 gap-y-1">

				<For each={days()}>

					{(day) => {

						const rangeStart = () => isRangeStart(day)

						const rangeEnd = () => isRangeEnd(day)

						const inRange = () => isInRange(day)

						const disabled = () => isDisabled(day)

						const otherMonth = () => !isCurrentMonth(day)

						const today = () => isToday(day)

						const selected = () => rangeStart() || rangeEnd()



						return (

							<div

								class={cn(

									'relative h-8 flex items-center justify-center',

									inRange() && 'bg-primary-50',

									rangeStart() && 'rounded-l-full',

									rangeEnd() && 'rounded-r-full',

								)}

							>

								<button

									type="button"

									disabled={disabled()}

									onClick={() => !disabled() && props.onDayClick(day)}

									onMouseEnter={() => !disabled() && props.onDayHover(day)}

									onMouseLeave={() => props.onDayHover(null)}

									class={cn(

										'relative z-10 h-7 w-7 rounded-full text-xs transition-colors',

										'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',

										selected()

											? 'bg-primary-500 text-white font-semibold hover:bg-primary-600'

											: inRange()

												? 'text-primary-700 hover:bg-primary-100'

												: otherMonth()

													? 'text-ink-300 hover:bg-surface-overlay'

													: today()

														? 'text-primary-600 font-semibold hover:bg-surface-overlay'

														: 'text-ink-800 hover:bg-surface-overlay',

										disabled() && 'opacity-30',

									)}

								>

									{day.getDate()}

									{today() && !selected() && (

										<span class="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary-500" />

									)}

								</button>

							</div>

						)

					}}

				</For>

			</div>

		</div>

	)

}



type ViewMode = 'calendar' | 'months' | 'years'



export function DateRangePicker(props: DateRangePickerProps) {

	const [local] = splitProps(props, [

		'start', 'end', 'onValueChange', 'onErrorClear', 'placeholder', 'disabled',

		'min', 'max', 'label', 'error', 'helperText', 'bare',

		'required', 'optional', 'dualMonth', 'clearable', 'size', 'class', 'id', 'showTime', 'timeFormat', 'minuteStep',

	])

	const icons = useIcons()

	const contextSize = useComponentSize()

	const sc = () => inputSizeConfig[local.size ?? contextSize ?? 'md']

	const generatedId = createUniqueId()

	const inputId = () => local.id || `drp-${generatedId}`

	const [open, setOpen] = createSignal(false)

	const [hover, setHover] = createSignal<Date | null>(null)

	const [pickingEnd, setPickingEnd] = createSignal(false)

	const [pendingStartHour, setPendingStartHour] = createSignal(0)

	const [pendingStartMinute, setPendingStartMinute] = createSignal(0)

	const [pendingEndHour, setPendingEndHour] = createSignal(23)

	const [pendingEndMinute, setPendingEndMinute] = createSignal(59)



	const is12h = () => local.timeFormat !== '24h'

	const displayStartHour12 = () => { const h = pendingStartHour(); return h === 0 ? 12 : h > 12 ? h - 12 : h }

	const displayStartAmPm = () => pendingStartHour() < 12 ? 'AM' : 'PM'

	const displayEndHour12 = () => { const h = pendingEndHour(); return h === 0 ? 12 : h > 12 ? h - 12 : h }

	const displayEndAmPm = () => pendingEndHour() < 12 ? 'AM' : 'PM'

	function toggleStartAmPm() {

		const h = pendingStartHour()

		handleStartTimeChange(h < 12 ? h + 12 : h - 12, pendingStartMinute())

	}

	function handleStartHour12Change(h12: number) {

		const isAm = pendingStartHour() < 12

		handleStartTimeChange(isAm ? (h12 === 12 ? 0 : h12) : (h12 === 12 ? 12 : h12 + 12), pendingStartMinute())

	}

	function toggleEndAmPm() {

		const h = pendingEndHour()

		handleEndTimeChange(h < 12 ? h + 12 : h - 12, pendingEndMinute())

	}

	function handleEndHour12Change(h12: number) {

		const isAm = pendingEndHour() < 12

		handleEndTimeChange(isAm ? (h12 === 12 ? 0 : h12) : (h12 === 12 ? 12 : h12 + 12), pendingEndMinute())

	}



	function handleStartTimeChange(h: number, m: number) {

		setPendingStartHour(h)

		setPendingStartMinute(m)

		const dateStr = local.start ? local.start.split('T')[0] : ''

		if (dateStr) local.onValueChange?.(

			`${dateStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,

			local.end ?? ''

		)

	}

	function handleEndTimeChange(h: number, m: number) {

		setPendingEndHour(h)

		setPendingEndMinute(m)

		const dateStr = local.end ? local.end.split('T')[0] : ''

		if (dateStr) local.onValueChange?.(

			local.start ?? '',

			`${dateStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`

		)

	}

	const startDate = () => parseDate((local.start ?? '').split('T')[0])

	const endDate = () => parseDate((local.end ?? '').split('T')[0])

	const minDate = () => parseDate(local.min ?? '')

	const maxDate = () => parseDate(local.max ?? '')

	const dual = () => local.dualMonth !== false

	const clearable = () => local.clearable !== false



	const initView = () => {

		const s = startDate()

		const mn = minDate()

		const base = s ?? mn ?? new Date()

		return { year: base.getFullYear(), month: base.getMonth() }

	}

	const initViewRight = () => {

		const { year, month } = initView()

		const next = new Date(year, month + 1, 1)

		return { year: next.getFullYear(), month: next.getMonth() }

	}



	const [viewLeft, _setViewLeft] = createSignal(initView())

	const [viewRight, _setViewRight] = createSignal(initViewRight())

	const [viewModeLeft, setViewModeLeft] = createSignal<ViewMode>('calendar')

	const [viewModeRight, setViewModeRight] = createSignal<ViewMode>('calendar')



	/** Set left view, pushing right forward if it would collide. */

	function setViewLeft(v: { year: number; month: number }) {

		_setViewLeft(v)

		const r = viewRight()

		if (v.year > r.year || (v.year === r.year && v.month >= r.month)) {

			const next = new Date(v.year, v.month + 1, 1)

			_setViewRight({ year: next.getFullYear(), month: next.getMonth() })

		}

	}

	/** Set right view, pulling left back if it would collide. */

	function setViewRight(v: { year: number; month: number }) {

		_setViewRight(v)

		const l = viewLeft()

		if (v.year < l.year || (v.year === l.year && v.month <= l.month)) {

			const prev = new Date(v.year, v.month - 1, 1)

			_setViewLeft({ year: prev.getFullYear(), month: prev.getMonth() })

		}

	}



	createEffect(on(open, (isOpen) => {

		if (isOpen) {

			setViewLeft(initView())

			_setViewRight(initViewRight())

			setViewModeLeft('calendar')

			setViewModeRight('calendar')

			if (local.showTime) {

				if (local.start?.includes('T')) {

					const [, t] = local.start.split('T')

					const [h, m] = t.split(':').map(Number)

					setPendingStartHour(h || 0); setPendingStartMinute(m || 0)

				} else { setPendingStartHour(0); setPendingStartMinute(0) }

				const maxMinute = Math.floor(59 / (local.minuteStep ?? 1)) * (local.minuteStep ?? 1)

				if (local.end?.includes('T')) {

					const [, t] = local.end.split('T')

					const [h, m] = t.split(':').map(Number)

					setPendingEndHour(h || 23); setPendingEndMinute(m || maxMinute)

				} else { setPendingEndHour(23); setPendingEndMinute(maxMinute) }

			}

		} else {

			setPickingEnd(false)

			setHover(null)

		}

	}, { defer: true }))



	function handleDayClick(d: Date) {

		if (local.error && local.onErrorClear) local.onErrorClear()

		if (!pickingEnd()) {

			if (local.showTime) {

				const h = String(pendingStartHour()).padStart(2, '0')

				const m = String(pendingStartMinute()).padStart(2, '0')

				local.onValueChange?.(`${toISODate(d)}T${h}:${m}`, '')

			} else {

				local.onValueChange?.(toISODate(d), '')

			}

			setPickingEnd(true)

		} else {

			const s = startDate()

			if (s && d < s) return

			if (local.showTime) {

				const sh = String(pendingStartHour()).padStart(2, '0')

				const sm = String(pendingStartMinute()).padStart(2, '0')

				const eh = String(pendingEndHour()).padStart(2, '0')

				const em = String(pendingEndMinute()).padStart(2, '0')

				const startStr = local.start ? local.start.split('T')[0] : toISODate(d)

				local.onValueChange?.(`${startStr}T${sh}:${sm}`, `${toISODate(d)}T${eh}:${em}`)

				setPickingEnd(false)

			} else {

				local.onValueChange?.(local.start ?? toISODate(d), toISODate(d))

				setPickingEnd(false)

				setOpen(false)

			}

		}

	}



	function clearRange() {

		local.onValueChange?.('', '')

		setPickingEnd(false)

	}



	// ── Left column navigation ──────────────────────────────────────────

	function prevLeft() {

		const { year, month } = viewLeft()

		const d = new Date(year, month - 1, 1)

		setViewLeft({ year: d.getFullYear(), month: d.getMonth() })

	}

	function nextLeft() {

		const { year, month } = viewLeft()

		const d = new Date(year, month + 1, 1)

		setViewLeft({ year: d.getFullYear(), month: d.getMonth() })

	}

	function setLeftMonth(m: number) {

		setViewLeft({ year: viewLeft().year, month: m })

		setViewModeLeft('calendar')

	}

	function setLeftYear(y: number) {

		setViewLeft({ year: y, month: viewLeft().month })

		setViewModeLeft('calendar')

	}



	// ── Right column navigation ─────────────────────────────────────────

	function prevRight() {

		const { year, month } = viewRight()

		const d = new Date(year, month - 1, 1)

		setViewRight({ year: d.getFullYear(), month: d.getMonth() })

	}

	function nextRight() {

		const { year, month } = viewRight()

		const d = new Date(year, month + 1, 1)

		setViewRight({ year: d.getFullYear(), month: d.getMonth() })

	}

	function setRightMonth(m: number) {

		setViewRight({ year: viewRight().year, month: m })

		setViewModeRight('calendar')

	}

	function setRightYear(y: number) {

		setViewRight({ year: y, month: viewRight().month })

		setViewModeRight('calendar')

	}



	// ── Single-month mode navigation (reused from DatePicker pattern) ───

	function prevMonth() {

		const { year, month } = viewLeft()

		const d = new Date(year, month - 1, 1)

		_setViewLeft({ year: d.getFullYear(), month: d.getMonth() })

	}

	function nextMonth() {

		const { year, month } = viewLeft()

		const d = new Date(year, month + 1, 1)

		_setViewLeft({ year: d.getFullYear(), month: d.getMonth() })

	}



	const isMonthDisabledFor = (viewYear: number, m: number) => {

		const mn = minDate()

		const mx = maxDate()

		if (mn && new Date(viewYear, m + 1, 0).getTime() < mn.getTime()) return true

		if (mx && new Date(viewYear, m, 1).getTime() > mx.getTime()) return true

		return false

	}

	const yearsListFor = (viewYear: number) => {

		const minY = minDate()?.getFullYear() ?? viewYear - 20

		const maxY = maxDate()?.getFullYear() ?? viewYear + 5

		return Array.from({ length: maxY - minY + 1 }, (_, i) => minY + i)

	}



	const navBtnClass = 'flex h-7 w-7 items-center justify-center rounded-md text-ink-500 hover:bg-surface-overlay transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50'

	const monthYearBtnClass = 'rounded-md px-2 py-1 text-sm font-semibold text-ink-900 hover:bg-surface-overlay transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50'



	const formatOne = (raw: string) => {

		if (!raw) return ''

		if (local.showTime && raw.includes('T')) {

			const [datePart, timePart] = raw.split('T')

			const d = parseDate(datePart)

			if (!d) return ''

			const [h, m] = timePart.split(':').map(Number)

			const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

			if (local.timeFormat === '24h') {

				return `${dateStr} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`

			}

			const hour12 = h % 12 || 12

			const ampm = h < 12 ? 'AM' : 'PM'

			return `${dateStr} ${hour12}:${String(m).padStart(2, '0')} ${ampm}`

		}

		return formatDisplay(raw.split('T')[0])

	}

	const displayValue = () => {

		const s = formatOne(local.start ?? '')

		const e = formatOne(local.end ?? '')

		if (s && e) return `${s} – ${e}`

		if (s) return `${s} – …`

		return ''

	}



	const TimeRow = (p: { label: string; hour: () => number; hour12: () => number; ampm: () => string; minute: () => number; onHour24: (h: number) => void; onHour12: (h: number) => void; onMinute: (m: number) => void; onToggleAmPm: () => void }) => (

		<div class="mt-2 pt-2 border-t border-surface-border flex items-center justify-between">

			<span class="text-xs text-ink-500">{p.label}</span>

			<div class="flex items-center gap-2">

				<Show when={is12h()} fallback={

					<TimeSelect value={p.hour()} options={Array.from({ length: 24 }, (_, i) => i)} onChange={p.onHour24} />

				}>

					<TimeSelect value={p.hour12()} options={Array.from({ length: 12 }, (_, i) => i + 1)} onChange={p.onHour12} />

				</Show>

				<span class="text-xs font-medium text-ink-400">:</span>

				<TimeSelect value={p.minute()} options={Array.from({ length: Math.ceil(60 / (local.minuteStep ?? 1)) }, (_, i) => i * (local.minuteStep ?? 1))} onChange={p.onMinute} />

				<Show when={is12h()}>

					<button type="button" onClick={p.onToggleAmPm} class="rounded-md border border-surface-border bg-surface-raised px-2 py-1 text-xs font-medium text-ink-700 hover:bg-surface-overlay transition-colors min-w-[2.5rem] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500/50">{p.ampm()}</button>

				</Show>

			</div>

		</div>

	)



	const hasError = () => !!local.error

	const msgId = () => (local.error || local.helperText) ? `${inputId()}-msg` : undefined



	/** Renders a month/year picker panel for one column. */

	const ColumnPicker = (colProps: {

		viewYear: number

		viewMonth: number

		viewMode: ViewMode

		onSelectMonth: (m: number) => void

		onSelectYear: (y: number) => void

	}) => (

		<>

			<Show when={colProps.viewMode === 'months'}>

				<div class="grid grid-cols-3 gap-1">

					<For each={MONTH_NAMES}>

						{(name, mi) => (

							<button

								type="button"

								onClick={() => colProps.onSelectMonth(mi())}

								disabled={isMonthDisabledFor(colProps.viewYear, mi())}

									class={cn(

										'rounded-lg py-2 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500/50',

										isMonthDisabledFor(colProps.viewYear, mi())

										? 'opacity-30'

										: mi() === colProps.viewMonth

											? 'bg-primary-500 text-white'

											: 'text-ink-700 hover:bg-surface-overlay',

								)}

							>

								{name.slice(0, 3)}

							</button>

						)}

					</For>

				</div>

			</Show>

			<Show when={colProps.viewMode === 'years'}>

				<div class="grid max-h-48 grid-cols-3 gap-1 overflow-y-auto">

					<For each={yearsListFor(colProps.viewYear)}>

						{(y) => (

							<button

								type="button"

								onClick={() => colProps.onSelectYear(y)}

								class={cn(

									'rounded-lg py-2 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500/50',

									y === colProps.viewYear

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

		</>

	)



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

				onOpenChange={(next) => { setOpen(next) }}

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

							sc().h, sc().py, sc().pl, sc().text, sc().pr,

							'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500',

							hasError()

								? 'border-danger-500 bg-surface-raised text-ink-900 hover:border-danger-600'

								: 'border-surface-border bg-surface-raised text-ink-900 hover:border-ink-400',

							local.disabled && 'opacity-50',

							clearable() && (local.start || local.end) && !local.disabled && 'pr-8',

						)}

					>

						{icons.calendar({ class: 'h-4 w-4 shrink-0 text-ink-400', 'aria-hidden': 'true' })}

						<span class={cn('truncate', displayValue() ? 'text-ink-900' : 'text-ink-400')}>

							{displayValue() || (local.placeholder ?? 'Pick a date range')}

						</span>

					</KobaltePopover.Trigger>

					<Show when={clearable() && (local.start || local.end) && !local.disabled}>

						<button

							type="button"

							onClick={(e) => { e.stopPropagation(); clearRange() }}

							class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-400 hover:text-ink-700 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"

							aria-label="Clear date range"

						>

							{icons.close({ class: 'h-3.5 w-3.5', 'aria-hidden': 'true' })}

						</button>

					</Show>

				</div>



				<KobaltePopover.Portal>

					<KobaltePopover.Content

						data-kb-top-layer=""

						class={cn(

							'z-[80] rounded-xl border border-surface-border bg-surface-raised shadow-xl',

							'origin-top data-[expanded]:animate-in data-[expanded]:fade-in-0 data-[expanded]:zoom-in-95',

							'data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95',

						)}

					>

						<div class={cn('p-3', dual() ? 'w-[596px]' : 'w-[268px]')}>



							{/* ── Dual-month layout ──────────────────────────────── */}

							<Show when={dual()}>

								<div class="flex gap-4">

									{/* Left column */}

									<div class="flex-1 min-w-0">

										{/* Left header */}

										<div class="flex items-center justify-between mb-2">

											<button type="button" onClick={prevLeft} class={navBtnClass} aria-label="Previous month">

												{icons.chevronLeft({ class: 'h-4 w-4', 'aria-hidden': 'true' })}

											</button>

											<div class="flex items-center justify-center gap-0.5">

												<button type="button" onClick={() => setViewModeLeft(viewModeLeft() === 'months' ? 'calendar' : 'months')} class={monthYearBtnClass}>

													{MONTH_NAMES[viewLeft().month]}

												</button>

												<button type="button" onClick={() => setViewModeLeft(viewModeLeft() === 'years' ? 'calendar' : 'years')} class={monthYearBtnClass}>

													{viewLeft().year}

												</button>

											</div>

											<button type="button" onClick={nextLeft} class={navBtnClass} aria-label="Next month">

												{icons.chevronRight({ class: 'h-4 w-4', 'aria-hidden': 'true' })}

											</button>

										</div>

										{/* Left content */}

										<Show when={viewModeLeft() === 'calendar'} fallback={

											<ColumnPicker

												viewYear={viewLeft().year}

												viewMonth={viewLeft().month}

												viewMode={viewModeLeft()}

												onSelectMonth={setLeftMonth}

												onSelectYear={setLeftYear}

											/>

										}>

											<MonthGrid

												year={viewLeft().year}

												month={viewLeft().month}

												start={startDate()}

												end={endDate()}

												hover={hover()}

												min={minDate()}

												max={maxDate()}

												selectableFrom={pickingEnd() ? startDate() : null}

												onDayClick={handleDayClick}

												onDayHover={setHover}

											/>

										</Show>

										<Show when={local.showTime}>

											<TimeRow label="Start" hour={pendingStartHour} hour12={displayStartHour12} ampm={displayStartAmPm} minute={pendingStartMinute} onHour24={(h) => handleStartTimeChange(h, pendingStartMinute())} onHour12={handleStartHour12Change} onMinute={(m) => handleStartTimeChange(pendingStartHour(), m)} onToggleAmPm={toggleStartAmPm} />

										</Show>

									</div>



									{/* Divider */}

									<div class="w-px bg-surface-border self-stretch" />



									{/* Right column */}

									<div class="flex-1 min-w-0">

										{/* Right header */}

										<div class="flex items-center justify-between mb-2">

											<button type="button" onClick={prevRight} class={navBtnClass} aria-label="Previous month">

												{icons.chevronLeft({ class: 'h-4 w-4', 'aria-hidden': 'true' })}

											</button>

											<div class="flex items-center justify-center gap-0.5">

												<button type="button" onClick={() => setViewModeRight(viewModeRight() === 'months' ? 'calendar' : 'months')} class={monthYearBtnClass}>

													{MONTH_NAMES[viewRight().month]}

												</button>

												<button type="button" onClick={() => setViewModeRight(viewModeRight() === 'years' ? 'calendar' : 'years')} class={monthYearBtnClass}>

													{viewRight().year}

												</button>

											</div>

											<button type="button" onClick={nextRight} class={navBtnClass} aria-label="Next month">

												{icons.chevronRight({ class: 'h-4 w-4', 'aria-hidden': 'true' })}

											</button>

										</div>

										{/* Right content */}

										<Show when={viewModeRight() === 'calendar'} fallback={

											<ColumnPicker

												viewYear={viewRight().year}

												viewMonth={viewRight().month}

												viewMode={viewModeRight()}

												onSelectMonth={setRightMonth}

												onSelectYear={setRightYear}

											/>

										}>

											<MonthGrid

												year={viewRight().year}

												month={viewRight().month}

												start={startDate()}

												end={endDate()}

												hover={hover()}

												min={minDate()}

												max={maxDate()}

												selectableFrom={pickingEnd() ? startDate() : null}

												onDayClick={handleDayClick}

												onDayHover={setHover}

											/>

										</Show>

										<Show when={local.showTime}>

											<TimeRow label="End" hour={pendingEndHour} hour12={displayEndHour12} ampm={displayEndAmPm} minute={pendingEndMinute} onHour24={(h) => handleEndTimeChange(h, pendingEndMinute())} onHour12={handleEndHour12Change} onMinute={(m) => handleEndTimeChange(pendingEndHour(), m)} onToggleAmPm={toggleEndAmPm} />

										</Show>

									</div>

								</div>

							</Show>



							{/* ── Single-month layout ─────────────────────────────── */}

							<Show when={!dual()}>

								{/* Single header */}

								<div class="flex items-center justify-between mb-2">

									<Show when={viewModeLeft() !== 'calendar'} fallback={

										<button type="button" onClick={prevMonth} class={navBtnClass} aria-label="Previous month">

											{icons.chevronLeft({ class: 'h-4 w-4', 'aria-hidden': 'true' })}

										</button>

									}>

										<button type="button" onClick={() => setViewModeLeft('calendar')} class={navBtnClass} aria-label="Back to calendar">

											{icons.chevronLeft({ class: 'h-4 w-4', 'aria-hidden': 'true' })}

										</button>

									</Show>

									<div class="flex items-center justify-center gap-0.5">

										<button type="button" onClick={() => setViewModeLeft(viewModeLeft() === 'months' ? 'calendar' : 'months')} class={monthYearBtnClass}>

											{MONTH_NAMES[viewLeft().month]}

										</button>

										<button type="button" onClick={() => setViewModeLeft(viewModeLeft() === 'years' ? 'calendar' : 'years')} class={monthYearBtnClass}>

											{viewLeft().year}

										</button>

									</div>

									<Show when={viewModeLeft() === 'calendar'} fallback={<div class="w-7" />}>

										<button type="button" onClick={nextMonth} class={navBtnClass} aria-label="Next month">

											{icons.chevronRight({ class: 'h-4 w-4', 'aria-hidden': 'true' })}

										</button>

									</Show>

								</div>

								{/* Single content */}

								<Show when={viewModeLeft() === 'calendar'} fallback={

									<ColumnPicker

										viewYear={viewLeft().year}

										viewMonth={viewLeft().month}

										viewMode={viewModeLeft()}

										onSelectMonth={(m) => { _setViewLeft({ year: viewLeft().year, month: m }); setViewModeLeft('calendar') }}

										onSelectYear={(y) => { _setViewLeft({ year: y, month: viewLeft().month }); setViewModeLeft('calendar') }}

									/>

								}>

									<MonthGrid

										year={viewLeft().year}

										month={viewLeft().month}

										start={startDate()}

										end={endDate()}

										hover={hover()}

										min={minDate()}

										max={maxDate()}

										selectableFrom={pickingEnd() ? startDate() : null}

										onDayClick={handleDayClick}

										onDayHover={setHover}

									/>

								</Show>

								<Show when={local.showTime}>

									<TimeRow label="Start" hour={pendingStartHour} hour12={displayStartHour12} ampm={displayStartAmPm} minute={pendingStartMinute} onHour24={(h) => handleStartTimeChange(h, pendingStartMinute())} onHour12={handleStartHour12Change} onMinute={(m) => handleStartTimeChange(pendingStartHour(), m)} onToggleAmPm={toggleStartAmPm} />

									<TimeRow label="End" hour={pendingEndHour} hour12={displayEndHour12} ampm={displayEndAmPm} minute={pendingEndMinute} onHour24={(h) => handleEndTimeChange(h, pendingEndMinute())} onHour12={handleEndHour12Change} onMinute={(m) => handleEndTimeChange(pendingEndHour(), m)} onToggleAmPm={toggleEndAmPm} />

								</Show>

							</Show>



							{/* Footer */}

							<div class="mt-3 space-y-2 border-t border-surface-border pt-3">

								<div class="flex items-center justify-between">

									<div class="text-xs text-ink-400">

										{pickingEnd()

											? 'Now select an end date'

											: (local.start && local.end)

												? displayValue()

												: 'Select a start date'}

									</div>

									<div class="flex gap-2">

										<Show when={clearable() && (local.start || local.end)}>

											<button

												type="button"

												onClick={clearRange}

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

						</div>

					</KobaltePopover.Content>

				</KobaltePopover.Portal>

			</KobaltePopover>



			<Show when={local.error || local.helperText}>

				<p

					id={msgId()}

					class={cn(

						'mt-1.5 text-xs',

						hasError() ? 'text-danger-600 dark:text-danger-400' : 'text-ink-500',

					)}

				>

					{local.error ?? local.helperText}

				</p>

			</Show>

		</div>

	)

}

