import { type JSX, splitProps } from 'solid-js'
import { ContextMenu as KobalteContextMenu, type ContextMenuContentProps as KobalteContextMenuContentProps, type ContextMenuItemProps as KobalteContextMenuItemProps, type ContextMenuSeparatorProps as KobalteContextMenuSeparatorProps } from '@kobalte/core/context-menu'
import { cn } from '../../utilities/classNames'

const _KbContent = KobalteContextMenu.Content
const _KbItem = KobalteContextMenu.Item
const _KbSeparator = KobalteContextMenu.Separator

/** Pass-through to Kobalte's ContextMenu.Root. See Kobalte docs for available props (e.g. onOpenChange). */
export const ContextMenuRoot = KobalteContextMenu
/** Pass-through to Kobalte's ContextMenu.Trigger. Renders as the element that responds to right-click. */
export const ContextMenuTrigger = KobalteContextMenu.Trigger

export interface ContextMenuContentProps extends KobalteContextMenuContentProps {
	class?: string
	children?: JSX.Element
}

export function ContextMenuContent(props: ContextMenuContentProps) {
	const [local, others] = splitProps(props, ['class', 'children'])
	return (
		<KobalteContextMenu.Portal>
			<_KbContent
				class={cn(
					'z-[80] min-w-[160px] rounded-lg border border-surface-border bg-surface-raised p-1 shadow-lg outline-none',
					local.class
				)}
				{...others}
			>
				{local.children}
			</_KbContent>
		</KobalteContextMenu.Portal>
	)
}

export interface ContextMenuItemProps extends KobalteContextMenuItemProps {
	class?: string
	children: JSX.Element
}

export function ContextMenuItem(props: ContextMenuItemProps) {
	const [local, others] = splitProps(props, ['class', 'children'])
	return (
		<_KbItem
			class={cn(
				'flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm text-ink-700 outline-none',
				'data-[highlighted]:bg-surface-overlay data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
				local.class,
			)}
			{...others}
		>
			{local.children}
		</_KbItem>
	)
}

export interface ContextMenuSeparatorProps extends KobalteContextMenuSeparatorProps {
	class?: string
}

export function ContextMenuSeparator(props: ContextMenuSeparatorProps) {
	const [local, others] = splitProps(props, ['class'])
	return (
		<_KbSeparator
			class={cn('my-1 h-px border-none bg-surface-border', local.class)}
			{...others}
		/>
	)
}

type ContextMenuComponent = typeof ContextMenuRoot & {
	Trigger: typeof ContextMenuTrigger
	Content: typeof ContextMenuContent
	Item: typeof ContextMenuItem
	Separator: typeof ContextMenuSeparator
}

export const ContextMenu: ContextMenuComponent = Object.assign(ContextMenuRoot, {
	Trigger: ContextMenuTrigger,
	Content: ContextMenuContent,
	Item: ContextMenuItem,
	Separator: ContextMenuSeparator,
})
