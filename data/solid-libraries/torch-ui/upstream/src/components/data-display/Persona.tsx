import { type JSX, splitProps, createMemo } from 'solid-js'
import { cn } from '../../utilities/classNames'
import { Avatar } from './Avatar'
import type { SizeKey, AvatarShape, AvatarColor } from '../../types/avatar-types'

export interface PersonaProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'> {
	/** Display name (primary text); also used for avatar initials. */
	name: string
	/** Optional image URL for the avatar. */
	imageUrl?: string | null
	/** Optional secondary line (e.g. role, email). */
	secondary?: string
	/** Avatar and text size. Default: md. */
	size?: SizeKey
	/** Avatar shape passed through to Avatar. Default: circle. */
	shape?: AvatarShape
	/** Avatar color passed through to Avatar. Default: neutral. */
	color?: AvatarColor
	/** Optional content after the text block (e.g. actions). */
	children?: JSX.Element
}

const sizeStyles: Record<SizeKey, { gap: string; name: string; secondary: string }> = {
	sm: { gap: 'gap-2', name: 'text-sm', secondary: 'text-xs' },
	md: { gap: 'gap-3', name: 'text-sm', secondary: 'text-sm' },
	lg: { gap: 'gap-4', name: 'text-base', secondary: 'text-sm' },
}

/**
 * A row combining Avatar with primary name and optional secondary text.
 * Use in lists, dropdowns, or cards for a compact user/profile display.
 */
export function Persona(props: PersonaProps) {
	const [local, others] = splitProps(props, [
		'name',
		'imageUrl',
		'secondary',
		'size',
		'shape',
		'color',
		'class',
		'children',
	])

	const size = () => local.size ?? 'md'
	const styles = createMemo(() => sizeStyles[size()])

	return (
		<div
			class={cn(
				'flex items-center min-w-0',
				styles().gap,
				local.class,
			)}
			{...others}
		>
			<Avatar
				decorative
				name={local.name}
				imageUrl={local.imageUrl}
				size={size()}
				shape={local.shape}
				color={local.color}
			/>
			<div class="min-w-0 flex-1">
				<div class={cn('font-medium text-ink-900 truncate', styles().name)}>
					{local.name}
				</div>
				{local.secondary && (
					<div class={cn('text-ink-500 truncate', styles().secondary)}>
						{local.secondary}
					</div>
				)}
			</div>
			{local.children}
		</div>
	)
}
