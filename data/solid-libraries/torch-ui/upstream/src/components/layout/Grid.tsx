import type { JSX, ParentComponent } from 'solid-js'
import { cn } from '../../utilities/classNames'

export type GridCols = 1 | 2 | 3 | 4 | 5 | 6
export type GridGap = 'none' | 'sm' | 'md' | 'lg' | 'xl'

export interface GridProps {
	/** Number of columns (1–6). Default 1. */
	cols?: GridCols
	/** Gap between items. Default md. */
	gap?: GridGap
	/** Additional class for the grid wrapper. */
	class?: string
	children?: JSX.Element
}

const colsClasses: Record<GridCols, string> = {
	1: 'grid-cols-1',
	2: 'grid-cols-2',
	3: 'grid-cols-3',
	4: 'grid-cols-4',
	5: 'grid-cols-5',
	6: 'grid-cols-6',
}

const gapClasses: Record<GridGap, string> = {
	none: 'gap-0',
	sm: 'gap-2',
	md: 'gap-4',
	lg: 'gap-6',
	xl: 'gap-8',
}

/**
 * CSS grid layout with configurable columns and gap.
 * Use for card grids, form layouts, or equal-width columns.
 */
export const Grid: ParentComponent<GridProps> = (props) => {
	const cols = () => props.cols ?? 1
	const gap = () => props.gap ?? 'md'
	return (
		<div
			class={cn(
				'grid',
				colsClasses[cols()],
				gapClasses[gap()],
				props.class
			)}
		>
			{props.children}
		</div>
	)
}
