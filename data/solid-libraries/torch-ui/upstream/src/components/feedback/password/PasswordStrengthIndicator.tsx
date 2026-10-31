/**
 * Password strength indicator - visual component only.
 * 
 * This component handles the visual presentation of password strength.
 * The analysis logic is left to the user to implement.
 * 
 * Usage:
 * <PasswordStrengthIndicator 
 *   strength="good" 
 *   score={75} 
 *   details={[
 *     { name: '8+ characters', passed: true },
 *     { name: 'Uppercase', passed: true },
 *     { name: 'Number', passed: false }
 *   ]}
 * />
 */
import { createMemo, createUniqueId, Show, splitProps } from 'solid-js'
import { cn } from '../../../utilities/classNames'
import { Progress } from '../Progress'

export type PasswordStrength = 'empty' | 'poor' | 'fair' | 'good' | 'excellent'

export interface PasswordStrengthDetail {
	name: string
	passed: boolean
	optional?: boolean
}

export interface PasswordStrengthMessages {
	empty?: { label?: string; helperText?: string }
	poor?: { label?: string; helperText?: string }
	fair?: { label?: string; helperText?: string }
	good?: { label?: string; helperText?: string }
	excellent?: { label?: string; helperText?: string }
}

export interface PasswordStrengthIndicatorProps {
	/** Current strength level */
	strength: PasswordStrength
	/** Score for the progress bar (0-100) */
	score?: number
	/** Optional details about what passed/failed */
	details?: PasswordStrengthDetail[]
	class?: string
	/** Show helper text below the bar. Default: true. */
	showHelperText?: boolean
	/** Custom labels and helper text for each strength level */
	messages?: PasswordStrengthMessages
	/** Custom title for the indicator */
	title?: string
	/** Number of segments for the progress bar. Default: 8 */
	segments?: number
}

/** Default messages for each strength level */
const DEFAULT_MESSAGES: Required<PasswordStrengthMessages> = {
	empty: { label: '', helperText: 'Enter a password to see strength.' },
	poor: { label: 'Poor', helperText: 'Your password is easily guessable. You can do better.' },
	fair: { label: 'Average', helperText: 'Getting there, but could be stronger.' },
	good: { label: 'Strong', helperText: 'Your password is great. Nice work!' },
	excellent: { label: 'Very Strong', helperText: 'Excellent password. Nice work!' },
}

/** Default color configuration */
const DEFAULT_COLORS: Record<PasswordStrength, { bg: string; textColor: string }> = {
	empty: { bg: '', textColor: 'text-ink-500' },
	poor: { bg: 'bg-danger-500', textColor: 'text-danger-600' },
	fair: { bg: 'bg-amber-500', textColor: 'text-amber-600' },
	good: { bg: 'bg-success-500', textColor: 'text-success-600' },
	excellent: { bg: 'bg-success-500', textColor: 'text-success-600' },
}

export function PasswordStrengthIndicator(props: PasswordStrengthIndicatorProps) {
	const [local] = splitProps(props, [
		'strength', 
		'score', 
		'details', 
		'class', 
		'showHelperText', 
		'messages', 
		'title',
		'segments'
	])

	const helperId = `psi-helper-${createUniqueId()}`
	const segmentCount = () => local.segments ?? 8
	
	// Merge default messages with custom ones
	const messages = createMemo(() => {
		const msgs = { ...DEFAULT_MESSAGES }
		if (local.messages) {
			Object.entries(local.messages).forEach(([key, value]) => {
				if (value) {
					msgs[key as PasswordStrength] = { ...msgs[key as PasswordStrength], ...value }
				}
			})
		}
		return msgs
	})
	
	const cfg = createMemo(() => messages()[local.strength])
	const colors = createMemo(() => DEFAULT_COLORS[local.strength])

	// Generate helper text based on failed requirements
	const helperText = createMemo(() => {
		if (local.strength === 'empty') return cfg().helperText
		
		const customHelper = cfg().helperText
		if (customHelper && !customHelper.includes('requirements')) {
			return customHelper
		}
		
		// Show failed requirements for poor/fair passwords if details provided
		if ((local.strength === 'poor' || local.strength === 'fair') && local.details) {
			const failed = local.details.filter(d => !d.passed && !d.optional)
			if (failed.length === 0) return customHelper
			if (failed.length === 1) return `Must contain ${failed[0].name}.`
			return `Must contain ${failed.slice(0, -1).map(d => d.name).join(', ')}, and ${failed[failed.length - 1].name}.`
		}
		
		return customHelper
	})

	const isEmpty = () => local.strength === 'empty'
	const title = () => local.title ?? 'Password Strength'
	const score = () => local.score ?? 0

	return (
		<div class={cn('mt-1.5', local.class)}>
			<div class="flex items-center justify-between mb-1.5">
				<span class="text-sm font-medium text-ink-700">{title()}</span>
				<Show when={cfg().label}>
					<span class={cn('text-sm font-medium', colors().textColor)}>{cfg().label}</span>
				</Show>
			</div>
			<Progress
				value={score()}
				segments={segmentCount()}
				fillClass={colors().bg}
				trackClass="bg-transparent"
				showValueLabel={false}
				aria-label={isEmpty() ? 'Password strength: not set' : `Password strength: ${cfg().label}`}
				aria-describedby={local.showHelperText !== false ? helperId : undefined}
			/>
			<Show when={local.showHelperText !== false && helperText()}>
				<p
					id={helperId}
					class={cn(
						'mt-1.5 text-sm',
						(local.strength === 'poor' || local.strength === 'fair') ? 'text-ink-600' : 'text-ink-500'
					)}
				>
					{helperText()}
				</p>
			</Show>
		</div>
	)
}
