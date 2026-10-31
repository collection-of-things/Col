/**
 * Configurable password strength analysis.
 * 
 * Users can provide custom requirements, scoring logic, and messages.
 */

export type PasswordStrength = 'empty' | 'poor' | 'fair' | 'good' | 'excellent'

export interface PasswordRequirement {
	/** Display name for this requirement (e.g., "Uppercase letter") */
	name: string
	/** Function to test if password meets this requirement */
	test: (password: string) => boolean
	/** Whether this requirement is optional for scoring */
	optional?: boolean
}

export interface PasswordAnalysis {
	/** Number of requirements met (0–5). */
	met: number
	strength: PasswordStrength
	/** 0–8 segment score for smooth progress bar fill. */
	segmentScore: number
	/** Details about which specific requirements passed/failed */
	details: Array<{ name: string; passed: boolean; optional?: boolean }>
}

export interface PasswordStrengthConfig {
	/** Custom requirements to test against */
	requirements?: PasswordRequirement[]
	/** Custom scoring thresholds */
	thresholds?: {
		poor: number
		fair: number
		good: number
	}
	/** Custom segment scoring logic */
	segmentScorer?: (password: string, met: number, details: PasswordAnalysis['details']) => number
	/** Custom strength determination logic */
	strengthCalculator?: (password: string, met: number, segmentScore: number, details: PasswordAnalysis['details']) => PasswordStrength
}

/** Default password requirements */
export const DEFAULT_REQUIREMENTS: PasswordRequirement[] = [
	{ name: 'at least 8 characters', test: (pwd) => pwd.length >= 8 },
	{ name: 'an uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
	{ name: 'a lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
	{ name: 'a number', test: (pwd) => /\d/.test(pwd) },
	{ name: 'a symbol', test: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) },
]

/** Default thresholds */
export const DEFAULT_THRESHOLDS = {
	poor: 3,
	fair: 3,
	good: 4,
}

/**
 * Analyzes password strength with optional custom configuration.
 * 
 * @param password - The password to analyze
 * @param config - Optional custom configuration
 * @returns Password analysis with requirements, strength, and score
 */
export function getPasswordAnalysis(password: string, config?: PasswordStrengthConfig): PasswordAnalysis {
	if (password.length === 0) {
		return {
			met: 0,
			strength: 'empty',
			segmentScore: 0,
			details: [],
		}
	}

	const reqs = config?.requirements ?? DEFAULT_REQUIREMENTS
	const thresholds = config?.thresholds ?? DEFAULT_THRESHOLDS

	// Test all requirements
	const details = reqs.map(req => ({
		name: req.name,
		passed: req.test(password),
		optional: req.optional,
	}))

	// Count non-optional requirements met
	const met = details.filter(d => d.passed && !d.optional).length

	// Calculate segment score
	const segmentScore = config?.segmentScorer 
		? config.segmentScorer(password, met, details)
		: defaultSegmentScorer(password, met, details)

	// Calculate strength
	const strength = config?.strengthCalculator
		? config.strengthCalculator(password, met, segmentScore, details)
		: defaultStrengthCalculator(password, met, segmentScore, details, thresholds)

	return { met, strength, segmentScore, details }
}

/** Default segment scoring logic */
function defaultSegmentScorer(password: string, met: number, details: PasswordAnalysis['details']): number {
	// Import here to avoid circular dependency
	const { isPasswordWeak } = require('./password-validation')
	const weak = isPasswordWeak(password)

	if (weak) {
		return Math.min(2, Math.max(1, met))
	} else if (met <= 2) {
		return met
	} else if (met === 3) {
		return details[0]?.passed && password.length >= 10 ? 4 : 3
	} else if (met === 4) {
		return details[0]?.passed && password.length >= 12 ? 6 : 5
	} else {
		return details[0]?.passed && password.length >= 14 ? 8 : 7
	}
}

/** Default strength calculation logic */
function defaultStrengthCalculator(
	password: string,
	met: number,
	segmentScore: number,
	details: PasswordAnalysis['details'],
	thresholds: typeof DEFAULT_THRESHOLDS
): PasswordStrength {
	// Import here to avoid circular dependency
	const { isPasswordWeak } = require('./password-validation')
	const weak = isPasswordWeak(password)

	return weak || met < thresholds.poor ? 'poor'
		: met === thresholds.fair ? 'fair'
		: met === thresholds.good ? 'good'
		: 'excellent'
}

// Legacy exports for convenience
export function getPasswordStrength(password: string, config?: PasswordStrengthConfig): PasswordStrength {
	return getPasswordAnalysis(password, config).strength
}

export function getPasswordSegmentScore(password: string, config?: PasswordStrengthConfig): number {
	return getPasswordAnalysis(password, config).segmentScore
}
