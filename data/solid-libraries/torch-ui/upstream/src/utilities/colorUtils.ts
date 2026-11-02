/**
 * Hex parsing/formatting for color picker value (e.g. #3b82f6).
 * Kobalte color components use @internationalized/color; we normalize to hex for the public API.
 */

export function normalizeHex(value: string): string {
	const v = value.trim().replace(/^(#|0x)/, '')
	if (/^[0-9a-fA-F]{6}$/.test(v)) return '#' + v.toLowerCase()
	if (/^[0-9a-fA-F]{8}$/.test(v)) return '#' + v.toLowerCase()
	// 3-digit hex
	if (/^[0-9a-fA-F]{3}$/.test(v)) {
		const r = v[0]! + v[0]
		const g = v[1]! + v[1]
		const b = v[2]! + v[2]
		return ('#' + r + g + b).toLowerCase()
	}
	return ''
}

/** Expects 3, 6, or 8-digit hex (with or without # or 0x). Returns {0,0,0,1} for invalid input. */
export function hexToRgba(hex: string): { r: number; g: number; b: number; a: number } {
	let h = hex.trim().replace(/^(#|0x)/, '')
	if (h.length === 3 && /^[0-9a-fA-F]{3}$/.test(h)) h = h[0]! + h[0] + h[1]! + h[1] + h[2]! + h[2]
	if (!/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(h)) {
		if (import.meta.env.DEV) console.warn(`hexToRgba: invalid hex "${hex}"`)
		return { r: 0, g: 0, b: 0, a: 1 }
	}
	const r = parseInt(h.slice(0, 2), 16)
	const g = parseInt(h.slice(2, 4), 16)
	const b = parseInt(h.slice(4, 6), 16)
	const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1
	return { r, g, b, a }
}

export function rgbaToHex(r: number, g: number, b: number, a: number): string {
	const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0')
	const rr = toHex(r)
	const gg = toHex(g)
	const bb = toHex(b)
	if (a >= 1) return '#' + rr + gg + bb
	return '#' + rr + gg + bb + toHex(a * 255)
}

/** Convert hex to HSL string (CSS Color Level 4 modern syntax, e.g. "hsl(200 50% 50%)" or "hsl(200 50% 50% / 0.5)"). */
export function hexToHslString(hex: string): string {
	const { r, g, b, a } = hexToRgba(hex)
	const rn = r / 255
	const gn = g / 255
	const bn = b / 255
	const max = Math.max(rn, gn, bn)
	const min = Math.min(rn, gn, bn)
	let h = 0
	let s = 0
	const l = (max + min) / 2
	if (max !== min) {
		const d = max - min
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
		switch (max) {
			case rn:
				h = (gn - bn) / d + (gn < bn ? 6 : 0)
				break
			case gn:
				h = (bn - rn) / d + 2
				break
			default:
				h = (rn - gn) / d + 4
		}
		h /= 6
	}
	const hDeg = Math.round(h * 360)
	const sPct = Math.round(s * 100)
	const lPct = Math.round(l * 100)
	if (a >= 1) return `hsl(${hDeg} ${sPct}% ${lPct}%)`
	return `hsl(${hDeg} ${sPct}% ${lPct}% / ${Math.round(a * 100) / 100})`
}
