import { Show, type JSX, splitProps, createSignal, createEffect, createMemo, on } from 'solid-js'
import { cn } from '../../utilities/classNames'
import { Skeleton } from '../feedback/Skeleton'
import {
	type AvatarShape,
	type AvatarColor,
	type SizeKey,
} from '../../types/avatar-types'
import { 
	shapeClasses, 
	avatarSizeClasses, 
	neutralColorClass, 
	getInitials 
} from './avatar-utils'

export type { AvatarShape, AvatarColor, SizeKey }

export type AvatarRing = true | { color?: string; /** When false, ring sits on the avatar edge (no gap). Use for stacks. Default true. */ offset?: boolean }

export type AvatarBadgePlacement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export interface AvatarProps extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'children'> {
	/** Display name: used for title and for initials. Initials = first letter of first name + first letter of last name (last word = last name, rest = first name). Single word → one letter. */
	name: string
	/** Optional image URL; when set, shows image instead of initials. */
	imageUrl?: string | null
	/** Size: sm = 32px, md = 40px, lg = 48px. */
	size?: SizeKey
	/** Shape: circle (default), rounded (rounded-lg), or square. */
	shape?: AvatarShape
	/** Ring outline around the avatar. true = default ring with offset; or { color?, offset?: boolean } for custom or no-offset (e.g. ring={{ offset: false }} for stack cutout). */
	ring?: AvatarRing
	/** Background and text color when showing initials. Ignored when imageUrl is set. */
	color?: AvatarColor
	/** Optional badge (e.g. Badge) overlaid on a corner. Use badgePlacement to choose which corner (default bottom-right). */
	badge?: JSX.Element
	/** When true, badge receives pointer events (e.g. for clickable status menus). Default false (decorative). */
	badgeInteractive?: boolean
	/** Pass the same size as your Badge so placement is correct. Default: same as avatar size. */
	badgeSize?: SizeKey
	/** Dot = status dot only; content = icon or count badge (larger dimensions). Content uses a larger base offset for proper placement. Default: dot. */
	badgeKind?: 'dot' | 'content'
	/** Where the badge sits on the avatar. Default: bottom-right. */
	badgePlacement?: AvatarBadgePlacement
	/** When true, avatar is purely decorative: aria-hidden, no role/label. Use when visible name text is adjacent (e.g. inside Persona). */
	decorative?: boolean
}

const colorClasses: Record<AvatarColor, string> = {
	neutral: neutralColorClass,
	primary: 'bg-primary-100 text-primary-700',
	success: 'bg-success-100 text-success-700',
	warning: 'bg-warning-100 text-warning-700',
	danger: 'bg-danger-100 text-danger-700',
	info: 'bg-info-100 text-info-700',
}

const badgePlacementClasses: Record<AvatarBadgePlacement, string> = {
	'bottom-right': 'bottom-0 right-0',
	'bottom-left': 'bottom-0 left-0',
	'top-right': 'top-0 right-0',
	'top-left': 'top-0 left-0',
}

const SIZE_IDX: Record<SizeKey, number> = { sm: 0, md: 1, lg: 2 }

/** Sign multipliers per placement: translate pushes the badge outward from the
 *  avatar corner. x: +1 = right, −1 = left. y: +1 = down, −1 = up. */
const BADGE_SIGNS: Record<AvatarBadgePlacement, [x: number, y: number]> = {
	'bottom-right': [1, 1],
	'bottom-left': [-1, 1],
	'top-right': [1, -1],
	'top-left': [-1, -1],
}

/** Compute the badge translate as an inline CSS transform string.
 *  offset = (badgeSize − avatarSize) × 10 + base, applied with placement-dependent signs. */
function badgeTransform(
	placement: AvatarBadgePlacement,
	avatarSize: SizeKey,
	badgeSize: SizeKey,
	kind: 'dot' | 'content',
): string {
	const base = kind === 'content' ? 20 : 5
	const offset = (SIZE_IDX[badgeSize] - SIZE_IDX[avatarSize]) * 10 + base
	const [xSign, ySign] = BADGE_SIGNS[placement]
	return `translate(${offset * xSign}%, ${offset * ySign}%)`
}

/**
 * Avatar with initials or image, optional ring, badge overlay, and multiple shapes/colors.
 * Use as a standalone avatar or compose with Badge for status indicators.
 *
 * <Avatar name="Jane" badge={<Badge variant="success" />} />
 */
export function Avatar(props: AvatarProps) {
	const [local, others] = splitProps(props, [
		'name',
		'imageUrl',
		'size',
		'shape',
		'ring',
		'color',
		'badge',
		'badgeSize',
		'badgeKind',
		'badgePlacement',
		'badgeInteractive',
		'decorative',
		'class',
		'style',
	])

	const size = () => local.size ?? 'md'
	const badgeSize = () => local.badgeSize ?? size()
	const badgeKind = () => local.badgeKind ?? 'dot'
	const shape = () => local.shape ?? 'circle'
	const color = () => local.color ?? 'neutral'
	const badgePlacement = () => local.badgePlacement ?? 'bottom-right'
	const sizeClass = () => avatarSizeClasses[size()]
	const ringClass = createMemo((): string => {
		const r = local.ring
		if (!r) return ''
		const ringColor = r === true ? 'ring-surface-base' : (r.color ?? 'ring-surface-base')
		const useOffset = r === true || (typeof r === 'object' && r.offset !== false)
		return cn(
			'ring-2',
			useOffset && 'ring-offset-2 ring-offset-surface-base',
			ringColor,
		)
	})
	const initials = () => getInitials(local.name)
	const hasBadge = () => local.badge != null
	const badgeIsInteractive = () => !local.decorative && local.badgeInteractive === true
	const badgeTransformStyle = createMemo(() => ({
		transform: badgeTransform(badgePlacement(), size(), badgeSize(), badgeKind()),
	}))

	const [imageError, setImageError] = createSignal(false)
	const [imageLoaded, setImageLoaded] = createSignal(false)
	const [imageStartedLoading, setImageStartedLoading] = createSignal(false)
	
	createEffect(on(() => local.imageUrl, () => {
		setImageError(false)
		setImageLoaded(false)
		setImageStartedLoading(false)
	}))

	return (
		<span
			{...others}
			role={local.decorative ? undefined : 'img'}
			aria-label={local.decorative ? undefined : local.name}
			aria-hidden={local.decorative ? 'true' : undefined}
			class={cn('inline-flex shrink-0', hasBadge() && 'relative overflow-visible', local.class)}
			style={local.style}
		>
			<span
				class={cn(
					'relative inline-flex items-center justify-center overflow-hidden font-medium',
					colorClasses[color()],
					shapeClasses[shape()],
					sizeClass(),
					ringClass(),
				)}
				title={local.decorative ? undefined : local.name}
			>
				<Show
					when={local.imageUrl && !imageError()}
					fallback={<span aria-hidden="true">{initials()}</span>}
				>
					<>
						<img
							src={local.imageUrl!}
							alt=""
							class={cn('h-full w-full object-cover', !imageLoaded() && 'opacity-0')}
							onError={() => setImageError(true)}
							onLoad={() => setImageLoaded(true)}
							onLoadStart={() => setImageStartedLoading(true)}
						/>
						{imageStartedLoading() && !imageLoaded() && (
							<Skeleton
								class="absolute inset-0"
								round={shape() === 'circle' ? 'full' : shape() === 'square' ? 'none' : 'lg'}
							/>
						)}
					</>
				</Show>
			</span>
			{hasBadge() && (
				<span
					class={cn(
						'absolute z-10 flex',
						!badgeIsInteractive() && 'pointer-events-none',
						badgePlacementClasses[badgePlacement()],
					)}
					style={badgeTransformStyle()}
				>
					{local.badge}
				</span>
			)}
		</span>
	)
}
