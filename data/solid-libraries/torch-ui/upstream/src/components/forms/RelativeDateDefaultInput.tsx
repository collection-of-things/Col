import { createMemo } from 'solid-js'
import { Input, Select } from './'
import { parseRelativeDateDefault, formatRelativeDateDefault } from './relativeDateDefault'
import { Inline } from '../layout'
import { cn } from '../../utilities/classNames'

const SIGN_OPTIONS = [
	{ value: '+', label: '+' },
	{ value: '-', label: '-' },
] as const

export interface RelativeDateDefaultInputProps {
	value: string
	onValueChange: (value: string) => void
	/** Label before the controls (default "Today") */
	prefixLabel?: string
	/** Label after days (default "day(s)") */
	suffixLabel?: string
	class?: string
}

/** Today + sign (+/−) + integer days. Produces stored value like "today+0", "today-7". */
export function RelativeDateDefaultInput(props: RelativeDateDefaultInputProps) {
	const parsed = createMemo(() => parseRelativeDateDefault(props.value))
	const sign = () => parsed().sign
	const days = () => parsed().days

	const setSign = (s: string) => {
		props.onValueChange(formatRelativeDateDefault((s as '+' | '-') || '+', days()))
	}
	const setDaysFromInput = (v: string) => {
		const n = v === '' ? 0 : Math.max(0, parseInt(v, 10) || 0)
		props.onValueChange(formatRelativeDateDefault(sign(), n))
	}
	const daysStr = () => String(days())

	return (
		<Inline class={cn('flex-nowrap', props.class)}>
			<span class="shrink-0 text-sm font-medium text-ink-700">
				{props.prefixLabel ?? 'Today'}
			</span>
			<Select
				value={sign()}
				onValueChange={setSign}
				options={[...SIGN_OPTIONS]}
				class="w-36 min-w-0 rounded-lg"
			/>
			<Input
				bare
				type="number"
				min={0}
				step={1}
				value={daysStr()}
				onValueChange={setDaysFromInput}
				placeholder="0"
				class="w-24 rounded-lg pr-2"
			/>
			<span class="shrink-0 text-sm text-ink-500">{props.suffixLabel ?? 'day(s)'}</span>
		</Inline>
	)
}
