import type { JSX } from 'solid-js'
import { splitProps } from 'solid-js'
import { cn } from '../../utilities/classNames'

export interface TablePanelProps extends JSX.HTMLAttributes<HTMLDivElement> {
	header?: JSX.Element
	headerClass?: string
	bodyClass?: string
}

export function TablePanel(props: TablePanelProps) {
	const [local, others] = splitProps(props, ['header', 'headerClass', 'bodyClass', 'class', 'children'])

	return (
		<div class={cn('rounded-2xl border border-surface-border bg-surface-raised shadow-sm', local.class)} {...others}>
			{local.header && (
				<div class={cn('rounded-t-2xl border-b border-surface-border p-4', local.headerClass)}>
					{local.header}
				</div>
			)}
			<div class={cn('p-4', local.bodyClass)}>{local.children}</div>
		</div>
	)
}
