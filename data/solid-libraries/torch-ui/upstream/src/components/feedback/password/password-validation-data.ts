/**
 * Pattern data for password validation (common words, keyboard walks, sequential).
 * Edit this file to add or remove patterns; used by password-validation.ts.
 *
 * Matching uses `includes()`, so longer entries implicitly cover shorter substrings.
 * Only add a new entry when it is NOT a substring of an existing one in the same list.
 */

export const COMMON_WORDS = [
	'password',
	'admin',
	'welcome',
	'letmein',
	'welcome1',
	'monkey',
	'dragon',
	'master',
	'sunshine',
	'princess',
	'football',
	'iloveyou',
	'admin123',
	'root',
	'pass',
	'passw0rd',
	'password1',
	'qwerty123',
	'abc123',
	'admin1',
	'welcome123',
] as const

export const KEYBOARD_WALKS = [
	'qwertyuiop',
	'asdfghjkl',
	'qazwsx',
	'1qaz2wsx',
	'qweasd',
	'123qwe',
	'qwe123',
	'poiuyt',
	'lkjhgf',
	'mnbvcx',
	'1q2w3e4r',
	'q1w2e3r4',
	'zaq1wsx',
	'xsw2zaq',
] as const

export const SEQUENTIAL_DIGITS = [
	'0123456789',
	'1234567890',
	'9876543210',
	'0987654321',
] as const

// Full forward + reverse covers all shorter subsequences (e.g. 'abc', 'abcdef', 'cba', 'fedcba').
export const SEQUENTIAL_LETTERS = [
	'abcdefghijklmnopqrstuvwxyz',
	'zyxwvutsrqponmlkjihgfedcba',
] as const
