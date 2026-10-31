import { type JSX, splitProps } from 'solid-js'
import { Popover as KobaltePopover, type PopoverRootProps as KobaltePopoverRootProps, type PopoverContentProps as KobaltePopoverContentProps } from '@kobalte/core/popover'
import { cn } from '../../utilities/classNames'

const SIDES = ['top', 'bottom', 'left', 'right'] as const
const ALIGNMENTS = ['start', 'center', 'end'] as const

export type PopoverSide = (typeof SIDES)[number]
export type PopoverAlign = (typeof ALIGNMENTS)[number]
type NonCenterAlign = Exclude<PopoverAlign, 'center'>
type DerivedPlacement = PopoverSide | `${PopoverSide}-${NonCenterAlign}`

// Valid placement combinations derived from SIDES and ALIGNMENTS
export type PopoverPlacement = DerivedPlacement

export interface PopoverRootProps extends Omit<KobaltePopoverRootProps, 'placement'> {
	/** Horizontal alignment relative to trigger. Use 'end' to right-align panel to trigger. Ignored if placement is set. */
	align?: PopoverAlign
	/** Side of the trigger the panel appears on. Ignored if placement is set. Default 'bottom'. */
	side?: PopoverSide
	/** Override placement. If not provided, derived from side + align. */
	placement?: PopoverPlacement
}

/** Root with align/side support; placement is derived as side + align (e.g. bottom-end). */
export function PopoverRoot(props: PopoverRootProps) {
	const [local, others] = splitProps(props, ['align', 'side', 'placement'])

	const side = () => local.side ?? 'bottom'
	const align = () => local.align ?? 'center'

	const placement = (): PopoverPlacement => {
		if (local.placement) return local.placement
		const s = side()
		const a = align()
		return a === 'center' ? s : `${s}-${a}`
	}

	return (
		<KobaltePopover
			{...others}
			placement={placement()}
		/>
	)
}

export const PopoverTrigger = KobaltePopover.Trigger
export const PopoverAnchor = KobaltePopover.Anchor
export const PopoverPortal = KobaltePopover.Portal
export const PopoverContentPrimitive = KobaltePopover.Content
export const PopoverArrow = KobaltePopover.Arrow
export const PopoverCloseButton = KobaltePopover.CloseButton

export interface PopoverContentProps extends KobaltePopoverContentProps {
	class?: string
	children?: JSX.Element
}

export function PopoverContent(props: PopoverContentProps) {
	const [local, others] = splitProps(props, ['class', 'children'])
	return (
		<KobaltePopover.Portal>
			<KobaltePopover.Content
				class={cn(
					'z-[80] min-w-[180px] rounded-lg border border-surface-border bg-surface-raised p-2 shadow-lg',
					local.class
				)}
				{...others}
			>
				{local.children}
			</KobaltePopover.Content>
		</KobaltePopover.Portal>
	)
}

type PopoverComponent = typeof PopoverRoot & {
	Trigger: typeof PopoverTrigger
	Content: typeof PopoverContent
	CloseButton: typeof PopoverCloseButton
}

export const Popover: PopoverComponent = Object.assign(PopoverRoot, {
	Trigger: PopoverTrigger,
	Content: PopoverContent,
	CloseButton: PopoverCloseButton,
})
