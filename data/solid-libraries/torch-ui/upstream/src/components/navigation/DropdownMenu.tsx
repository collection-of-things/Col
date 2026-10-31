import { type JSX, splitProps } from 'solid-js'
import { DropdownMenu as KobalteDropdownMenu } from '@kobalte/core/dropdown-menu'
import type { 
	DropdownMenuContentProps as KobalteDropdownMenuContentProps, 
	DropdownMenuItemProps as KobalteDropdownMenuItemProps, 
	DropdownMenuSeparatorProps as KobalteDropdownMenuSeparatorProps,
	DropdownMenuTriggerProps as KobalteDropdownMenuTriggerProps 
} from '@kobalte/core/dropdown-menu'
import { cn } from '../../utilities/classNames'

const _KbContent = KobalteDropdownMenu.Content
const _KbItem = KobalteDropdownMenu.Item
const _KbSeparator = KobalteDropdownMenu.Separator
const _KbTrigger = KobalteDropdownMenu.Trigger

export interface DropdownMenuContentProps extends KobalteDropdownMenuContentProps {
	class?: string
	children: JSX.Element
}

export function DropdownMenuContent(props: DropdownMenuContentProps) {
	const [local, others] = splitProps(props, ['class', 'children'])
	return (
		<KobalteDropdownMenu.Portal>
			<_KbContent
				class={cn(
					'z-[80] min-w-[160px] rounded-lg border border-surface-border bg-surface-raised p-1 shadow-lg outline-none',
					local.class,
				)}
				{...others}
			>
				{local.children}
			</_KbContent>
		</KobalteDropdownMenu.Portal>
	)
}

export interface DropdownMenuItemProps extends KobalteDropdownMenuItemProps {
	class?: string
	children: JSX.Element
}

export function DropdownMenuItem(props: DropdownMenuItemProps) {
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

export interface DropdownMenuSeparatorProps extends KobalteDropdownMenuSeparatorProps {
	class?: string
}

export function DropdownMenuSeparator(props: DropdownMenuSeparatorProps) {
	const [local, others] = splitProps(props, ['class'])
	return (
		<_KbSeparator
			class={cn('my-1 h-px border-none bg-surface-border', local.class)}
			{...others}
		/>
	)
}

export interface DropdownMenuTriggerProps extends Omit<KobalteDropdownMenuTriggerProps, 'class' | 'children'> {
	class?: string
	children: JSX.Element
}

export function DropdownMenuTrigger(props: DropdownMenuTriggerProps) {
	const [local, others] = splitProps(props, ['class', 'children'])
	return (
		<_KbTrigger
			class={cn(local.class)}
			{...others}
		>
			{local.children}
		</_KbTrigger>
	)
}

type DropdownMenuComponent = typeof KobalteDropdownMenu & {
	Trigger: typeof DropdownMenuTrigger
	Content: typeof DropdownMenuContent
	Item: typeof DropdownMenuItem
	Separator: typeof DropdownMenuSeparator
}

export const DropdownMenu: DropdownMenuComponent = Object.assign(KobalteDropdownMenu, {
	Trigger: DropdownMenuTrigger,
	Content: DropdownMenuContent,
	Item: DropdownMenuItem,
	Separator: DropdownMenuSeparator,
})
