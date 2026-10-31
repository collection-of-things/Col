import { type JSX, splitProps, Show, onMount } from 'solid-js'
import { Menubar as KobalteMenuBar } from "@kobalte/core/menubar";
import { cn } from '../../utilities/classNames'
import { useIcons } from '../../icons'

function injectMenuBarStyles() {
	const id = 'torchui-menu-bar-styles'
	if (typeof document === 'undefined') return
	let el = document.getElementById(id) as HTMLStyleElement | null
	if (!el) {
		el = document.createElement('style')
		el.id = id
		document.head.appendChild(el)
	}

	el.textContent = `
    @keyframes torchui-menu-in  { from { opacity: 0; transform: scale(0.96) } to { opacity: 1; transform: scale(1) } }
    @keyframes torchui-menu-out { from { opacity: 1; transform: scale(1) } to { opacity: 0; transform: scale(0.96) } }
    .torchui-menubar-content {
        transform-origin: var(--kb-menu-content-transform-origin);
        animation: torchui-menu-out 150ms ease-in forwards;
    }
    .torchui-menubar-content[data-expanded] {
        animation: torchui-menu-in 150ms ease-out;
    }
`
}

export interface MenuBarTriggerProps {
	class?: string
	children?: JSX.Element
	/** Hide the default chevron icon */
	noChevron?: boolean
	/** Visual style variant */
	variant?: 'default' | 'underline' | 'ghost'
	/** Optional icon element */
	icon?: JSX.Element
	/** Icon placement relative to label */
	iconPosition?: 'start' | 'end' | 'top' | 'bottom'
}

export function MenuBarTrigger(props: MenuBarTriggerProps) {
	const [local, others] = splitProps(props, ['class', 'children', 'noChevron', 'variant', 'icon', 'iconPosition'])
	const icons = useIcons()
	const v = () => local.variant ?? 'default'
	const ip = () => local.iconPosition ?? 'start'
	const isStacked = () => ip() === 'top' || ip() === 'bottom'
	return (
		<KobalteMenuBar.Trigger
			class={cn(
				'group relative inline-flex text-sm font-medium text-ink-700 transition-colors',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
				isStacked() ? 'flex-col items-center justify-center gap-1 px-3 py-2' : 'flex-row items-center gap-1.5',
				v() === 'default' && [
					!isStacked() && 'h-9',
					'rounded-md px-3 py-2',
					'hover:bg-surface-overlay hover:text-ink-900',
					'data-[expanded]:bg-surface-overlay data-[expanded]:text-ink-900',
				],
				v() === 'underline' && [
					!isStacked() && 'h-full',
					'rounded-none px-4',
					'hover:text-primary-600 data-[expanded]:text-primary-600',
				],
				v() === 'ghost' && [
					!isStacked() && 'h-9',
					'rounded-md px-3 py-2',
					'hover:text-primary-600 data-[expanded]:text-primary-600',
				],
				local.class,
			)}
			{...others}
		>
			<Show when={local.icon && (ip() === 'start' || ip() === 'top')}>
				<span class="flex h-4 w-4 shrink-0 items-center justify-center">{local.icon}</span>
			</Show>
			<span class={cn(isStacked() && 'text-xs leading-none')}>{local.children}</span>
			<Show when={local.icon && (ip() === 'end' || ip() === 'bottom')}>
				<span class="flex h-4 w-4 shrink-0 items-center justify-center">{local.icon}</span>
			</Show>
			<Show when={!local.noChevron && !isStacked()}>
				{icons.chevronDown({
					class: 'relative h-3.5 w-3.5 shrink-0 text-ink-400 transition-transform duration-200 group-data-[expanded]:rotate-180',
					'aria-hidden': 'true',
				})}
			</Show>
			<Show when={v() === 'underline'}>
				<span
					aria-hidden="true"
					class="absolute inset-x-0 bottom-0 h-[2px] origin-center scale-x-0 bg-primary-500 transition-transform duration-200 group-hover:scale-x-100 group-data-[expanded]:scale-x-100"
				/>
			</Show>
		</KobalteMenuBar.Trigger>
	)
}

export interface MenuBarContentProps {
	class?: string
	children?: JSX.Element
}

export function MenuBarContent(props: MenuBarContentProps) {
	const [local, others] = splitProps(props, ['class', 'children'])
	return (
		<KobalteMenuBar.Portal>
			<KobalteMenuBar.Content
				class={cn(
					'torchui-menubar-content',
					'z-[9999] mt-2 rounded-xl border border-surface-border bg-surface-raised shadow-lg p-2 outline-none',
					local.class,
				)}
				{...others}
			>
				{local.children}
			</KobalteMenuBar.Content>
		</KobalteMenuBar.Portal>
	)
}

export interface MenuBarItemProps {
	class?: string
	children?: JSX.Element
	/** Leading icon */
	icon?: JSX.Element
	/** Short description text below the label */
	description?: string
	/** Icon placement relative to text */
	iconPosition?: 'start' | 'end' | 'top' | 'bottom'
}

export function MenuBarItem(props: MenuBarItemProps) {
	const [local, others] = splitProps(props, ['class', 'children', 'icon', 'description', 'iconPosition'])
	const ip = () => local.iconPosition ?? 'start'
	return (
		<KobalteMenuBar.Item
			class={cn(
				'relative flex cursor-default select-none rounded-lg px-3 py-2 text-sm outline-none transition-colors',
				'text-ink-700 hover:bg-surface-overlay hover:text-ink-900',
				'focus-visible:bg-surface-overlay focus-visible:text-ink-900',
				'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
				(ip() === 'start' || ip() === 'end') ? 'items-start gap-2.5' : 'flex-col items-center text-center gap-1.5',
				ip() === 'end' && 'flex-row-reverse',
				ip() === 'bottom' && 'flex-col-reverse',
				local.class,
			)}
			{...others}
		>
			<Show when={local.icon}>
				<span class={cn(
					'flex shrink-0 items-center justify-center text-ink-500',
					(ip() === 'start' || ip() === 'end') ? 'mt-0.5 h-5 w-5' : 'h-5 w-5',
				)}>
					{local.icon}
				</span>
			</Show>
			<div class={cn('min-w-0', (ip() === 'start' || ip() === 'end') && 'flex-1')}>
				<div class="font-medium text-ink-900">{local.children}</div>
				<Show when={local.description}>
					<div class="mt-0.5 text-xs text-ink-500 leading-relaxed">{local.description}</div>
				</Show>
			</div>
		</KobalteMenuBar.Item>
	)
}

export function MenuBarLabel(props: { class?: string; children: JSX.Element }) {
	return (
		<div class={cn('px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400', props.class)}>
			{props.children}
		</div>
	)
}

export function MenuBarDivider(props: { class?: string }) {
	return <div role="separator" aria-orientation="horizontal" class={cn('-mx-2 my-1 h-px bg-surface-border', props.class)} />
}

export interface MenuBarLinkProps {
	href: string
	class?: string
	children?: JSX.Element
	icon?: JSX.Element
	description?: string
	active?: boolean
	/** Visual style variant */
	variant?: 'default' | 'underline' | 'ghost'
	/** Icon placement relative to text */
	iconPosition?: 'start' | 'end' | 'top' | 'bottom'
	/**
	 * Disabled state. Sets aria-disabled + tabIndex=-1 and prevents navigation.
	 * Note: plain anchors don't participate in Menubar roving focus — if full
	 * keyboard nav is needed, render via KobalteMenuBar.Item with asChild.
	 */
	disabled?: boolean
}

export function MenuBarLink(props: MenuBarLinkProps) {
	const v = () => props.variant ?? 'default'
	const ip = () => props.iconPosition ?? 'start'
	return (
		<a
			href={props.disabled ? undefined : props.href}
			aria-disabled={props.disabled ? 'true' : undefined}
			tabIndex={props.disabled ? -1 : undefined}
			onClick={props.disabled ? (e: Event) => e.preventDefault() : undefined}
			class={cn(
				'relative flex select-none text-sm outline-none transition-colors',
				(ip() === 'start' || ip() === 'end') ? 'items-start gap-2.5' : 'flex-col items-center text-center gap-1.5',
				ip() === 'end' && 'flex-row-reverse',
				ip() === 'bottom' && 'flex-col-reverse',
				v() === 'default' && [
					'rounded-lg px-3 py-2',
					props.active
						? 'bg-primary-50 text-primary-700'
						: 'text-ink-700 hover:bg-surface-overlay hover:text-ink-900',
				],
				v() === 'underline' && [
					'rounded-lg px-3 py-2',
					props.active
						? 'text-primary-700 underline underline-offset-2'
						: 'text-ink-700 hover:text-ink-900 hover:underline hover:underline-offset-2',
				],
				v() === 'ghost' && [
					'rounded-lg px-3 py-2',
					props.active
						? 'text-primary-700'
						: 'text-ink-500 hover:text-ink-900',
				],
				props.class,
			)}
		>
			<Show when={props.icon}>
				<span class={cn(
					'flex shrink-0 items-center justify-center',
					(ip() === 'start' || ip() === 'end') ? 'mt-0.5 h-5 w-5' : 'h-5 w-5',
					props.active ? 'text-primary-500' : 'text-ink-500',
				)}>
					{props.icon}
				</span>
			</Show>
			<div class={cn('min-w-0', (ip() === 'start' || ip() === 'end') && 'flex-1')}>
				<div class={cn('font-medium', props.active ? 'text-primary-700' : 'text-ink-900')}>
					{props.children}
				</div>
				<Show when={props.description}>
					<div class="mt-0.5 text-xs text-ink-500 leading-relaxed">{props.description}</div>
				</Show>
			</div>
		</a>
	)
}

export interface MenuBarProps {
	class?: string
	children?: JSX.Element
	/** Horizontal alignment of the nav items */
	justify?: 'start' | 'center' | 'end'
}

function MenuBarRoot(props: MenuBarProps) {
	const [local, others] = splitProps(props, ['class', 'children', 'justify'])
	onMount(injectMenuBarStyles)
	return (
		<KobalteMenuBar
			class={cn(
				'flex h-full items-center gap-1',
				local.justify === 'center' && 'justify-center',
				local.justify === 'end' && 'justify-end',
				local.class,
			)}
			{...others}
		>
			{local.children}
		</KobalteMenuBar>
	)
}

export function MenuBarMenu(props: { children?: JSX.Element }) {
	return <KobalteMenuBar.Menu {...props} />
}


export function MenuBarNavLink(props: MenuBarLinkProps) {
	const v = () => props.variant ?? 'default'
	return (
		<a
			href={props.disabled ? undefined : props.href}
			aria-disabled={props.disabled ? 'true' : undefined}
			tabIndex={props.disabled ? -1 : undefined}
			onClick={props.disabled ? (e: Event) => e.preventDefault() : undefined}
			class={cn(
				'group relative inline-flex h-full items-center text-sm font-medium text-ink-700 transition-colors',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
				v() === 'default' && 'h-9 rounded-md px-3 py-2 hover:bg-surface-overlay hover:text-ink-900',
				v() === 'underline' && 'rounded-none px-4 hover:text-primary-600',
				v() === 'ghost' && 'h-9 rounded-md px-3 py-2 hover:text-primary-600',
				props.class,
			)}
		>
			{props.children}
			<Show when={v() === 'underline'}>
				<span
					aria-hidden="true"
					class="absolute inset-x-0 bottom-0 h-[2px] origin-center scale-x-0 bg-primary-500 transition-transform duration-200 group-hover:scale-x-100"
				/>
			</Show>
		</a>
	)
}

type MenuBarComponent = typeof MenuBarRoot & {
	Menu: typeof MenuBarMenu
	Trigger: typeof MenuBarTrigger
	Content: typeof MenuBarContent
	Item: typeof MenuBarItem
	NavLink: typeof MenuBarNavLink
	Label: typeof MenuBarLabel
	Divider: typeof MenuBarDivider
	Link: typeof MenuBarLink
}

export const MenuBar: MenuBarComponent = Object.assign(MenuBarRoot, {
	Menu: MenuBarMenu,
	Trigger: MenuBarTrigger,
	Content: MenuBarContent,
	Item: MenuBarItem,
	NavLink: MenuBarNavLink,
	Label: MenuBarLabel,
	Divider: MenuBarDivider,
	Link: MenuBarLink,
})
