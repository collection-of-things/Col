import { type JSX, splitProps, onMount } from 'solid-js'
import { Collapsible as KobalteCollapsible, type CollapsibleContentProps as KobalteCollapsibleContentProps, type CollapsibleTriggerProps as KobalteCollapsibleTriggerProps } from '@kobalte/core/collapsible'
import { cn } from '../../utilities/classNames'
import { useIcons } from '../../icons'

export const CollapsibleRoot = KobalteCollapsible
export const CollapsibleTrigger = KobalteCollapsible.Trigger
export const CollapsibleContent = KobalteCollapsible.Content

const _KbCollapsibleContent = KobalteCollapsible.Content
const _KbCollapsibleTrigger = KobalteCollapsible.Trigger

export type CollapsibleStyledVariant = 'default' | 'minimal'

const COLLAPSIBLE_STYLE_ID = 'torchui-collapsible-styles'

const collapsibleStyles = `
.collapsible-content[data-expanded] {
	animation: torchui-collapsible-down 200ms ease-out;
}
.collapsible-content[data-closed] {
	animation: torchui-collapsible-up 200ms ease-out;
}
@keyframes torchui-collapsible-down {
	from { height: 0; opacity: 0; }
	to { height: var(--kb-collapsible-content-height); opacity: 1; }
}
@keyframes torchui-collapsible-up {
	from { height: var(--kb-collapsible-content-height); opacity: 1; }
	to { height: 0; opacity: 0; }
}
`

function ensureCollapsibleStyles() {
	if (typeof document === 'undefined') return
	if (document.getElementById(COLLAPSIBLE_STYLE_ID)) return
	const style = document.createElement('style')
	style.id = COLLAPSIBLE_STYLE_ID
	style.textContent = collapsibleStyles
	document.head.appendChild(style)
}

export interface CollapsibleContentProps extends KobalteCollapsibleContentProps {
	variant?: CollapsibleStyledVariant
	class?: string
	children?: JSX.Element
}

export function CollapsibleContentStyled(props: CollapsibleContentProps) {
	const [local, others] = splitProps(props, ['variant', 'class', 'children'])
	onMount(ensureCollapsibleStyles)
	const variant = () => local.variant ?? 'default'
	return (
		<_KbCollapsibleContent
			class={cn(
				'collapsible-content overflow-hidden',
				variant() === 'default' && [
					'data-[expanded]:border data-[expanded]:border-surface-border data-[expanded]:border-t-0',
					'data-[expanded]:rounded-b-lg data-[expanded]:bg-surface-raised',
				],
				local.class,
			)}
			{...others}
		>
			{local.children}
		</_KbCollapsibleContent>
	)
}

export interface CollapsibleTriggerStyledProps extends KobalteCollapsibleTriggerProps {
	variant?: CollapsibleStyledVariant
	class?: string
	children?: JSX.Element
}

export function CollapsibleTriggerStyled(props: CollapsibleTriggerStyledProps) {
	const [local, others] = splitProps(props, ['variant', 'class', 'children'])
	const variant = () => local.variant ?? 'default'
	const icons = useIcons()
	return (
		<_KbCollapsibleTrigger
			class={cn(
				'flex w-full items-center justify-between gap-2 text-left',
				variant() === 'default'
					? [
						'rounded-lg border border-surface-border bg-surface-base px-4 py-3 text-sm font-medium text-ink-800',
						'hover:bg-surface-overlay',
						'data-[expanded]:rounded-b-none data-[expanded]:bg-surface-overlay',
					]
					: [
						'rounded-lg px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-500',
						'hover:bg-transparent hover:text-ink-700',
						'data-[expanded]:text-ink-700',
					],
				'data-[expanded]:[&>svg]:rotate-180',
				variant() === 'default'
					? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
					: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-inset',
				local.class
			)}
			{...others}
		>
			{local.children}
			{icons.chevronDown({ class: 'h-4 w-4 shrink-0 transition-transform duration-200', 'aria-hidden': 'true' })}
		</_KbCollapsibleTrigger>
	)
}

type CollapsibleComponent = typeof CollapsibleRoot & {
	Trigger: typeof CollapsibleTriggerStyled
	Content: typeof CollapsibleContentStyled
}

export const Collapsible: CollapsibleComponent = Object.assign(CollapsibleRoot, {
	Trigger: CollapsibleTriggerStyled,
	Content: CollapsibleContentStyled,
})
