import type { JSX, ParentComponent } from 'solid-js'
import { cn } from '../../utilities/classNames'

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
export type ContainerAlign = 'start' | 'center' | 'end'

export interface ContainerProps {
	/** Max width of the container; default md. full = no max-width constraint. Ignored when fluid is true. */
	size?: ContainerSize
	/** When true, container stretches to fill the width of its parent (no max-width, no centering). */
	fluid?: boolean
	/** Horizontal alignment within parent when not fluid. Default center. */
	align?: ContainerAlign
	/** Additional class for the wrapper. */
	class?: string
	children?: JSX.Element
}

const sizeClasses: Record<ContainerSize, string> = {
	sm: 'max-w-3xl',
	md: 'max-w-5xl',
	lg: 'max-w-6xl',
	xl: 'max-w-7xl',
	'2xl': 'max-w-[90rem]',
	full: 'max-w-full',
}

const alignClasses: Record<ContainerAlign, string> = {
	start: 'ms-0 me-auto',
	center: 'mx-auto',
	end: 'ms-auto me-0',
}

/**
 * Centered layout container with max-width and horizontal padding.
 * No border or background by default—it only confines content (max-width, centering, padding).
 * Use for page content, forms, or reading width. Set fluid to stretch to full parent width.
 */
export const Container: ParentComponent<ContainerProps> = (props) => {
	const size = () => props.size ?? 'md'
	const fluid = () => props.fluid === true
	const align = () => props.align ?? 'center'
	return (
		<div
			class={cn(
				'w-full px-4 sm:px-6 lg:px-8',
				!fluid() && alignClasses[align()],
				!fluid() && size() !== 'full' && sizeClasses[size()],
				props.class
			)}
		>
			{props.children}
		</div>
	)
}
