import { type JSX, splitProps } from 'solid-js'
import { Separator as KobalteSeparator } from '@kobalte/core/separator'
import { cn } from '../../utilities/classNames'

export type DividerStyle = 'solid' | 'dotted' | 'dashed'
export type DividerWeight = 'thin' | 'medium' | 'thick'

export interface DividerProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** Optional label shown in the center (e.g. "or continue with") */
	label?: string
	/** Line style: solid (default), dotted, or dashed */
	lineStyle?: DividerStyle
	/** Line thickness: thin (1px), medium (2px), or thick (4px). Default thin. */
	weight?: DividerWeight
}

const weightClasses: Record<DividerWeight, string> = {
	thin: 'border-t',
	medium: 'border-t-2',
	thick: 'border-t-4',
}

const styleClasses: Record<DividerStyle, string> = {
	solid: 'border-solid',
	dotted: 'border-dotted',
	dashed: 'border-dashed',
}

const lineBase = 'min-h-0 flex-1 shrink-0 border-surface-border'

export function Divider(props: DividerProps) {
	const [local, others] = splitProps(props, ['label', 'lineStyle', 'weight', 'class'])

	const lineStyle = () => local.lineStyle ?? 'solid'
	const weight = () => local.weight ?? 'thin'

	const lineClass = () =>
		cn(lineBase, weightClasses[weight()], styleClasses[lineStyle()])

	return (
		<KobalteSeparator
			as="div"
			orientation="horizontal"
			class={cn(
				'w-full my-6',
				local.label ? 'flex items-center gap-4' : '',
				local.class,
			)}
			{...others}
		>
			{local.label ? (
				<>
					<span class={lineClass()} />
					<span class="shrink-0 whitespace-nowrap text-sm font-medium text-ink-500">
						{local.label}
					</span>
					<span class={lineClass()} />
				</>
			) : (
				<span class={cn(lineClass(), 'block w-full')} />
			)}
		</KobalteSeparator>
	)
}
