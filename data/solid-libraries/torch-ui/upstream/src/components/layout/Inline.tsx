import type { JSX } from 'solid-js'
import { splitProps } from 'solid-js'
import { cn } from '../../utilities/classNames'

export interface InlineProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class'> {
	/** Optional class for the inline container */
	class?: string
	children: JSX.Element
}

export function Inline(props: InlineProps): JSX.Element {
	const [local, others] = splitProps(props, ['class', 'children'])
	return (
		<div class={cn('flex items-center gap-2', local.class)} {...others}>
			{local.children}
		</div>
	)
}
