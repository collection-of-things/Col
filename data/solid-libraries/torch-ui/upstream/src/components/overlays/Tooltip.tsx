import { type JSX, splitProps } from 'solid-js'
import { Tooltip as KobalteTooltip, type TooltipContentProps as KobalteTooltipContentProps } from '@kobalte/core/tooltip'
import { cn } from '../../utilities/classNames'

export const TooltipRoot = KobalteTooltip
export const TooltipTrigger = KobalteTooltip.Trigger
export const TooltipPortal = KobalteTooltip.Portal
export const TooltipContentPrimitive = KobalteTooltip.Content
export const TooltipArrow = KobalteTooltip.Arrow

const _KbContent = KobalteTooltip.Content

export interface TooltipContentProps extends KobalteTooltipContentProps {
	class?: string
	children?: JSX.Element
}

export function TooltipContent(props: TooltipContentProps) {
	const [local, others] = splitProps(props, ['class', 'children'])
	return (
		<KobalteTooltip.Portal>
			<_KbContent
				class={cn(
					'z-[80] max-w-xs rounded-md border border-surface-border bg-surface-raised px-3 py-2 text-sm text-ink-900 shadow-md',
					local.class
				)}
				{...others}
			>
				{local.children}
			</_KbContent>
		</KobalteTooltip.Portal>
	)
}

type TooltipComponent = typeof TooltipRoot & {
	Trigger: typeof TooltipTrigger
	Content: typeof TooltipContent
}

export const Tooltip: TooltipComponent = Object.assign(TooltipRoot, {
	Trigger: TooltipTrigger,
	Content: TooltipContent,
})
