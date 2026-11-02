import { type JSX, splitProps } from 'solid-js'
import { HoverCard as KobalteHoverCard, type HoverCardRootProps as KobalteHoverCardRootProps, type HoverCardContentProps as KobalteHoverCardContentProps } from '@kobalte/core/hover-card'
import { cn } from '../../utilities/classNames'

const SIDES = ['top', 'bottom', 'left', 'right'] as const
const ALIGNMENTS = ['start', 'center', 'end'] as const

export type HoverCardSide = (typeof SIDES)[number]
export type HoverCardAlign = (typeof ALIGNMENTS)[number]
type NonCenterAlign = Exclude<HoverCardAlign, 'center'>
type DerivedPlacement = HoverCardSide | `${HoverCardSide}-${NonCenterAlign}`
export type HoverCardPlacement = DerivedPlacement

export interface HoverCardRootProps extends Omit<KobalteHoverCardRootProps, 'placement'> {
	/** Side of the trigger the card appears on. Default 'bottom'. */
	side?: HoverCardSide
	/** Alignment relative to the trigger. Default 'center'. */
	align?: HoverCardAlign
	/** Override placement directly. If not provided, derived from side + align. */
	placement?: HoverCardPlacement
}

export function HoverCardRoot(props: HoverCardRootProps) {
	const [local, others] = splitProps(props, ['align', 'side', 'placement'])

	const side = () => local.side ?? 'bottom'
	const align = () => local.align ?? 'center'

	const placement = (): HoverCardPlacement => {
		if (local.placement) return local.placement
		const s = side()
		const a = align()
		return a === 'center' ? s : `${s}-${a}`
	}

	return (
		<KobalteHoverCard
			{...others}
			placement={placement()}
		/>
	)
}

export const HoverCardTrigger = KobalteHoverCard.Trigger
export const HoverCardPortal = KobalteHoverCard.Portal
export const HoverCardArrow = KobalteHoverCard.Arrow

export interface HoverCardContentProps extends KobalteHoverCardContentProps {
	class?: string
	children?: JSX.Element
	/** Show an arrow pointing to the trigger. Default true. */
	showArrow?: boolean
}

export function HoverCardContent(props: HoverCardContentProps) {
	const [local, others] = splitProps(props, ['class', 'children', 'showArrow'])
	return (
		<KobalteHoverCard.Portal>
			<KobalteHoverCard.Content
				class={cn(
					'z-[80] min-w-[220px] max-w-sm rounded-xl border border-surface-border bg-surface-raised shadow-lg',
					'data-[expanded]:animate-in data-[closed]:animate-out',
					'data-[expanded]:fade-in-0 data-[closed]:fade-out-0',
					'data-[expanded]:zoom-in-95 data-[closed]:zoom-out-95',
					'data-[side=top]:slide-in-from-bottom-2 data-[side=bottom]:slide-in-from-top-2',
					'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
					local.class,
				)}
				{...others}
			>
				{local.children}
				{local.showArrow !== false && (
					<KobalteHoverCard.Arrow class="fill-surface-raised stroke-surface-border" />
				)}
			</KobalteHoverCard.Content>
		</KobalteHoverCard.Portal>
	)
}

/** Convenience sub-components for structured card content */
export function HoverCardHeader(props: { class?: string; children: JSX.Element }) {
	return (
		<div class={cn('px-4 pt-4 pb-2', props.class)}>
			{props.children}
		</div>
	)
}

export function HoverCardBody(props: { class?: string; children: JSX.Element }) {
	return (
		<div class={cn('px-4 py-3', props.class)}>
			{props.children}
		</div>
	)
}

export function HoverCardFooter(props: { class?: string; children: JSX.Element }) {
	return (
		<div class={cn('px-4 pb-4 pt-2 border-t border-surface-border', props.class)}>
			{props.children}
		</div>
	)
}

export function HoverCardSeparator(props: { class?: string }) {
	return <div class={cn('h-px bg-surface-border', props.class)} />
}

type HoverCardComponent = typeof HoverCardRoot & {
	Trigger: typeof HoverCardTrigger
	Content: typeof HoverCardContent
	Header: typeof HoverCardHeader
	Body: typeof HoverCardBody
	Footer: typeof HoverCardFooter
	Separator: typeof HoverCardSeparator
}

export const HoverCard: HoverCardComponent = Object.assign(HoverCardRoot, {
	Trigger: HoverCardTrigger,
	Content: HoverCardContent,
	Header: HoverCardHeader,
	Body: HoverCardBody,
	Footer: HoverCardFooter,
	Separator: HoverCardSeparator,
})
