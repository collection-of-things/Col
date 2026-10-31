import { For, createMemo, type JSX, splitProps } from 'solid-js'
import { cn } from '../../utilities/classNames'
import { Avatar } from './Avatar'
import type { AvatarRing } from './Avatar'
import { avatarSizeClasses, shapeClasses, neutralColorClass } from './avatar-utils'
import type { SizeKey, AvatarShape } from '../../types/avatar-types'

export interface AvatarGroupItem {
	name: string
	imageUrl?: string | null
}

export type AvatarStacking = 'first-on-top' | 'last-on-top'

export interface AvatarGroupProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'> {
	/** List of avatars to show. When max is set, only this many are shown plus a "+N" overflow. */
	avatars: AvatarGroupItem[]
	/** Max avatars to show before showing "+N". Omit to show all. */
	max?: number
	/** Size passed to each Avatar. */
	size?: SizeKey
	/** Shape passed to each Avatar. */
	shape?: AvatarShape
	/** Overlap amount: sm = tighter stack, md = default, lg = more overlap. */
	overlap?: 'sm' | 'md' | 'lg'
	/** Z-index stacking order for overlapping avatars. Default: last-on-top (DOM-natural). */
	stacking?: AvatarStacking
}

const overlapClasses = {
	sm: '-space-x-1.5',
	md: '-space-x-2',
	lg: '-space-x-3',
}

const STACK_RING: AvatarRing = { offset: false }

/**
 * Group of avatars stacked horizontally with overlap. Use max to show a "+N" overflow.
 */
export function AvatarGroup(props: AvatarGroupProps) {
	const [local, others] = splitProps(props, [
		'avatars',
		'max',
		'size',
		'shape',
		'overlap',
		'stacking',
		'class',
	])

	const overlap = () => local.overlap ?? 'md'
	const size = () => local.size ?? 'md'
	const shape = () => local.shape ?? 'circle'
	const stacking = () => local.stacking ?? 'last-on-top'

	const displayed = createMemo(() => {
		const list = [...local.avatars]
		const m = local.max
		if (m == null || list.length <= m) return { items: list, overflow: 0 }
		return {
			items: list.slice(0, m),
			overflow: list.length - m,
		}
	})
	const items = createMemo(() => displayed().items)
	const overflow = createMemo(() => displayed().overflow)
	const count = () => items().length

	return (
		<div
			role="group"
			class={cn(
				'inline-flex flex-row items-center',
				overlapClasses[overlap()],
				local.class,
			)}
			{...others}
		>
			<For each={items()}>
				{(item, idx) => {
					const zIndex = () =>
						stacking() === 'first-on-top' ? count() - idx() : idx() + 1
					return (
						<Avatar
							name={item.name}
							imageUrl={item.imageUrl}
							size={size()}
							shape={shape()}
							ring={STACK_RING}
							class="relative"
							style={{ 'z-index': zIndex() }}
						/>
					)
				}}
			</For>
			{overflow() > 0 && (
				<span
					role="img"
					aria-label={`${overflow()} more avatars`}
					class={cn(
						'relative inline-flex shrink-0 items-center justify-center font-medium ring-2 ring-surface-base',
						neutralColorClass,
						shapeClasses[shape()],
						avatarSizeClasses[size()],
					)}
					// In first-on-top mode, the overflow pill gets a z-index of 0, placing it behind all avatars, 
					// consistent with being the rightmost/last element in that stacking direction. 
					// In last-on-top mode, it gets a z-index of count + 1, placing it in front of all avatars.
					style={{ 'z-index': stacking() === 'first-on-top' ? 0 : count() + 1 }}
					title={`+${overflow()} more`}
				>
					+{overflow()}
				</span>
			)}
		</div>
	)
}
