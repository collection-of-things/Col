/**
 * Password validation: blocks weak patterns and returns human-readable errors.
 * Inlined for TorchUI standalone; patterns: sequential, keyboard walks, repetitive, common words.
 *
 * Note: common-word check uses substring matching (`includes`), so short words like
 * "pass" or "root" may cause false positives on longer passwords. This is intentional —
 * passwords that embed common words are weaker even in a longer context.
 */
import {
	COMMON_WORDS,
	KEYBOARD_WALKS,
	SEQUENTIAL_DIGITS,
	SEQUENTIAL_LETTERS,
} from './password-validation-data'

export interface PasswordValidationResult {
	valid: boolean
	error?: string
}

/**
 * Checks the (already-trimmed) password against blocked patterns.
 * Returns a human-readable error string if a pattern is found, or `null` if clean.
 */
function containsBlockedPattern(trimmed: string): string | null {
	const lower = trimmed.toLowerCase()

	for (const word of COMMON_WORDS) {
		if (lower === word || lower.includes(word)) {
			return 'Password contains a common word. Choose something more unique.'
		}
	}

	for (const walk of KEYBOARD_WALKS) {
		if (lower.includes(walk)) {
			return 'Password contains a common keyboard pattern.'
		}
	}

	for (const seq of SEQUENTIAL_DIGITS) {
		if (lower.includes(seq)) {
			return 'Password contains sequential numbers.'
		}
	}

	for (const seq of SEQUENTIAL_LETTERS) {
		if (lower.includes(seq)) {
			return 'Password contains sequential letters.'
		}
	}

	if (/(.)\1{2,}/.test(trimmed)) {
		return 'Password contains too many repeated characters.'
	}

	if (trimmed.length >= 6) {
		for (let len = 1; len <= 3; len++) {
			const pattern = lower.slice(0, len)
			let repeats = 1
			for (let i = len; i < lower.length; i += len) {
				if (lower.slice(i, i + len) === pattern) repeats++
				else break
			}
			if (repeats >= 3 && repeats * len >= 6) {
				return 'Password is too repetitive.'
			}
		}
	}

	return null
}

/** Validate a password for form submission. Checks minimum length (8) and blocked patterns. */
export function validatePassword(password: string): PasswordValidationResult {
	const p = password.trim()
	if (p.length < 8) {
		return { valid: false, error: 'Password must be at least 8 characters' }
	}
	const error = containsBlockedPattern(p)
	return error ? { valid: false, error } : { valid: true }
}

/**
 * Check if a password contains blocked patterns (sequential, keyboard walks, etc.).
 * Does NOT check length — use this for strength indicators, not form validation.
 */
export function isPasswordWeak(password: string): boolean {
	const p = password.trim()
	if (!p) return false // Empty is not "weak", just empty
	return containsBlockedPattern(p) !== null
}
