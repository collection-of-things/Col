import type { JSX } from 'solid-js'
import { splitProps, Show } from 'solid-js'
import { cn } from '../../utilities/classNames'

const STANDALONE_CLASS =
	'inline-block bg-ink-200 animate-pulse'

export interface SkeletonProps {
	/** Extra class for the wrapper (or the standalone block). */
	class?: string
	/** Use "full" for circular (e.g. avatar), "lg" for large radius, or omit for default. Matches the wrapped child's shape when you pass the same as the child (e.g. round="full" for rounded-full). */
	round?: 'full' | 'lg' | 'md' | 'sm' | 'none'
	/** Use block layout instead of inline-block. Needed when wrapping children that depend on parent width (w-full, flex-1, %-based). Default: false. */
	block?: boolean
	/** When true, children are revealed directly (loading complete). When false/undefined, shimmer is shown over the children's shape.
	 * Pair with children to wrap real content: <Skeleton loaded={isLoaded} round="full"><Avatar /></Skeleton> */
	loaded?: boolean
	/** Wrap content to take its shape; omit for a standalone block you size with class.
	 * Note: wrap mode works best with intrinsic-size children. For layout-dependent children
	 * (w-full, flex-1, %-widths), set block={true} so the wrapper participates in flow layout.
	 * Skeleton is always aria-hidden — pair with a Loading status region for screen reader announcements. */
	children?: JSX.Element
}

const ROUND_CLASS: Record<NonNullable<SkeletonProps['round']>, string> = {
	full: 'rounded-full',
	lg: 'rounded-lg',
	md: 'rounded-md',
	sm: 'rounded-sm',
	none: 'rounded-none',
}

/**
 * Skeleton takes the shape of its children by default (wrap mode), or use as a standalone
 * block by omitting children and sizing with class. Use the round prop to match your
 * child (e.g. round="full" for avatars so the skeleton is a circle).
 */
export function Skeleton(props: SkeletonProps): JSX.Element {
	const [local] = splitProps(props, ['class', 'round', 'block', 'loaded', 'children'])

	const roundClass = local.round ? ROUND_CLASS[local.round] : 'rounded'

	if (local.children == null) {
		return (
			<div
				class={cn(STANDALONE_CLASS, roundClass, local.class)}
				aria-hidden="true"
			/>
		)
	}

	return (
		<Show
			when={!local.loaded}
			fallback={<>{local.children}</>}
		>
			<div
				class={cn('relative', local.block ? 'block' : 'inline-block', roundClass, local.class)}
				aria-hidden="true"
			>
				<div class="invisible">
					{local.children}
				</div>
				<div
					class={cn('absolute inset-0', roundClass, STANDALONE_CLASS)}
				/>
			</div>
		</Show>
	)
}
