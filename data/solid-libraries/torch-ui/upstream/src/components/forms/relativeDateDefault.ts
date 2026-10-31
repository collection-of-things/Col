const RELATIVE_REGEX = /^today([+-])(\d+)$/

/** Parse stored relative date (e.g. "today+0", "today-7") to sign and days. Defaults to +0. */
export function parseRelativeDateDefault(stored: string): { sign: '+' | '-'; days: number } {
	const m = stored.trim().match(RELATIVE_REGEX)
	if (m) return { sign: m[1] as '+' | '-', days: Math.max(0, parseInt(m[2], 10)) }
	return { sign: '+', days: 0 }
}

/** Format sign + days to stored value. Normalizes to "today+0" when days is 0. */
export function formatRelativeDateDefault(sign: '+' | '-', days: number): string {
	const d = Math.max(0, Math.floor(days))
	return `today${d === 0 ? '+' : sign}${d}`
}
