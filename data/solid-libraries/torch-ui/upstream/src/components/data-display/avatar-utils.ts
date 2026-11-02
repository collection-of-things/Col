import type { AvatarShape, SizeKey } from '../../types/avatar-types'

export const shapeClasses: Record<AvatarShape, string> = {
	circle: 'rounded-full',
	rounded: 'rounded-lg',
	square: 'rounded-none',
}

export const avatarSizeClasses: Record<SizeKey, string> = {
	sm: 'h-8 w-8 text-sm',
	md: 'h-10 w-10 text-sm', // intentionally text-sm at md — initials read clearly at this size
	lg: 'h-12 w-12 text-base',
}


export const neutralColorClass = 'bg-ink-200 text-ink-600'

/**
 * Initials from a full name: first letter of first name + first letter of last name.
 * Treats the last word as last name and everything before as first name.
 * "Jenny Lee Smith" → "JS", "Alex" → "A", "Alex Chen" → "AC".
 */
export function getInitials(name: string): string {
	const trimmed = name.trim()
	if (!trimmed) return '?'
	const parts = trimmed.split(/\s+/).filter(Boolean)
	if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
	const first = parts[0].charAt(0)
	const last = parts[parts.length - 1].charAt(0)
	return (first + last).toUpperCase()
}
