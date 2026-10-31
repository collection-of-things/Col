import { type JSX, Show, splitProps, onMount, createContext, useContext } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { NavigationMenu as KobalteNavigationMenu, type NavigationMenuMenuProps } from '@kobalte/core/navigation-menu'
import { cn } from '../../utilities/classNames'
import { useIcons } from '../../icons'

/** ─── Variant context ───────────────────────────────────────────────────────── */
type MenuVariant = 'default' | 'underline' | 'ghost'
const VariantContext = createContext<MenuVariant>('default')
const InvertedContext = createContext(false)

/** ─── Injected styles ───────────────────────────────────────────────────────── */
function injectMegaMenuStyles() {
	document.getElementById('torchui-mega-menu-styles')?.remove()
	document.getElementById('torchui-mega-menu-styles-v2')?.remove()
	const id = 'torchui-mega-menu-styles-v3'
	const el = document.getElementById(id) as HTMLStyleElement | null
	if (el) return
	const style = document.createElement('style')
	style.id = id
	document.head.appendChild(style)
	style.textContent = `
		/* No width transition: animating viewport width reflows text every frame and reads as blurry. */
		.torchui-mm-viewport {
			position: relative;
			transform-origin: var(--kb-menu-content-transform-origin);
			pointer-events: none;
			opacity: 0;
			overflow-x: clip;
			overflow-y: visible;
			outline: none;
			transition: opacity 120ms ease;
		}
		.torchui-mm-viewport[data-expanded] {
			pointer-events: auto;
			opacity: 1;
			transform: none;
		}
		.torchui-mm-arrow {
			color: var(--color-surface-raised);
			transition: transform 200ms ease;
		}
		.torchui-mm-content { 
			position: absolute; 
			top: 0; 
			left: 0; 
			z-index: 1; 
			min-width: max-content;
			animation-duration: 80ms;
			animation-timing-function: ease;
			animation-fill-mode: forwards;
			pointer-events: none;
			outline: none;
		}
		.torchui-mm-viewport[data-fullwidth] .torchui-mm-content { width: 100%; min-width: unset; }
		.torchui-mm-viewport[data-fullwidth] { transform-origin: top left; }
		.torchui-mm-content:not([data-expanded]):not([data-motion]) { opacity: 0; pointer-events: none; }
		.torchui-mm-content[data-expanded]              { pointer-events: auto; z-index: 2; transform: none; }
		.torchui-mm-content[data-motion="from-end"]     { animation-name: torchui-mm-from-end;   z-index: 2; }
		.torchui-mm-content[data-motion="from-start"]   { animation-name: torchui-mm-from-start; z-index: 2; }
		.torchui-mm-content[data-motion="to-end"]       { animation-name: torchui-mm-to-end;     z-index: 1; }
		.torchui-mm-content[data-motion="to-start"]     { animation-name: torchui-mm-to-start;   z-index: 1; }
		@keyframes torchui-mm-from-end   { from { opacity: 0; } to { opacity: 1; } }
		@keyframes torchui-mm-from-start { from { opacity: 0; } to { opacity: 1; } }
		@keyframes torchui-mm-to-end     { from { opacity: 1; } to { opacity: 0; } }
		@keyframes torchui-mm-to-start   { from { opacity: 1; } to { opacity: 0; } }
		.torchui-mm-root { display: flex; gap: 0.25rem; position: relative; height: 100%; align-items: stretch; width: 100%; min-width: max-content; }
		.torchui-mm-root > div { height: 100%; }
		.torchui-mm-root > div > li { height: 100%; display: flex; }
		.torchui-mm-root[data-variant="underline"] { align-items: stretch; }
		.torchui-mm-root[data-variant="default"],
		.torchui-mm-root[data-variant="ghost"]     { align-items: center; }
		.torchui-mm-root ul[role="menubar"]        { display: flex; gap: inherit; align-items: inherit; }
		.torchui-mm-root[data-variant="underline"] button[role="menuitem"],
		.torchui-mm-root[data-variant="underline"] a { padding-top: 2px; }
	`
}

/** ─── MegaMenuBar ───────────────────────────────────────────────────────────── */
export interface MegaMenuBarProps {
	class?: string
	children?: JSX.Element
	/** Visual variant applied to all triggers and bar links. Default: 'default' */
	variant?: MenuVariant
	/** Stretch the dropdown to full viewport width */
	fullWidth?: boolean
	/** Reference to the full nav container element (e.g. the max-w-7xl div) for fullWidth anchor sizing */
	containerRef?: HTMLElement
	/** Horizontal alignment of nav items */
	justify?: 'start' | 'center' | 'end'
	/** Use light (white-based) trigger text for dark backgrounds in light mode */
	inverted?: boolean
	/** Standard Kobalte NavigationMenu props */
	id?: string
	disabled?: boolean
	orientation?: 'horizontal' | 'vertical'
}

export function MegaMenuBar(props: MegaMenuBarProps) {
	const [local, others] = splitProps(props, ['class', 'children', 'variant', 'fullWidth', 'containerRef', 'justify', 'inverted'])
	const variant = () => local.variant ?? 'default'
	const isUnderline = () => variant() === 'underline'
	let wrapperRef!: HTMLDivElement

	onMount(() => { injectMegaMenuStyles() })

	return (
		<div ref={wrapperRef} class={cn(
			'relative flex h-full self-stretch',
			variant() === 'underline' ? 'items-stretch' : 'items-center',
			local.justify === 'center' && 'justify-center',
			local.justify === 'end' && 'justify-end',
			local.justify && 'w-full',
			local.class,
		)}>
			<KobalteNavigationMenu
				data-variant={variant()}
				class="torchui-mm-root"
				getAnchorRect={local.fullWidth ? (() => {
					const el = local.containerRef ?? wrapperRef
					const rect = el.getBoundingClientRect()
					return { x: rect.left, y: rect.bottom, width: rect.width, height: 0 }
				}) : undefined}
				sameWidth={local.fullWidth}
				{...others}
			>
				<VariantContext.Provider value={variant()}>
				<InvertedContext.Provider value={local.inverted ?? false}>
					{local.children}
				</InvertedContext.Provider>
				</VariantContext.Provider>

				{/* Viewport anchor */}
				<div class="z-[9999] pointer-events-none absolute top-full left-0 flex w-full justify-center">
					<KobalteNavigationMenu.Viewport
						data-fullwidth={local.fullWidth ? '' : undefined}
						class={cn(
							'torchui-mm-viewport',
							'relative isolate border border-surface-border bg-surface-raised shadow-lg',
							local.fullWidth ? 'mt-0' : isUnderline() ? 'mt-0' : 'mt-3',
							local.fullWidth
								? 'w-full rounded-b-xl rounded-t-none h-[var(--kb-navigation-menu-viewport-height)]'
								: 'rounded-xl h-[var(--kb-navigation-menu-viewport-height)] w-[var(--kb-navigation-menu-viewport-width)]',
						)}
					>
						<KobalteNavigationMenu.Arrow class="torchui-mm-arrow" />
					</KobalteNavigationMenu.Viewport>
				</div>
			</KobalteNavigationMenu>
		</div>
	)
}

/** ─── MegaMenuMenu ──────────────────────────────────────────────────────────── */
export function MegaMenuMenu(props: NavigationMenuMenuProps & { class?: string }) {
	const [local, others] = splitProps(props, ['class'])
	const variant = useContext(VariantContext)
	return (
		<div class={cn(
			'flex items-stretch',
			variant === 'underline' && 'self-stretch',
			local.class,
		)}>
			<KobalteNavigationMenu.Menu {...others} />
		</div>
	)
}

/** ─── MegaMenuTrigger ───────────────────────────────────────────────────────── */
export interface MegaMenuTriggerProps {
	class?: string
	children?: JSX.Element
	/** Hide the chevron indicator. Also suppressed automatically when iconPosition is 'top' or 'bottom'. */
	noChevron?: boolean
	/** Overrides the bar-level variant for this trigger only */
	variant?: MenuVariant
	/** Optional icon element */
	icon?: JSX.Element
	/** Icon placement relative to label. Default: 'start' */
	iconPosition?: 'start' | 'end' | 'top' | 'bottom'
}

export function MegaMenuTrigger(props: MegaMenuTriggerProps) {
	const [local, others] = splitProps(props, ['class', 'children', 'noChevron', 'variant', 'icon', 'iconPosition'])
	const icons = useIcons()
	const contextVariant = useContext(VariantContext)
	const inv = useContext(InvertedContext)
	const v = () => local.variant ?? contextVariant
	const ip = () => local.iconPosition ?? 'start'
	const isStacked = () => ip() === 'top' || ip() === 'bottom'

	return (
		<KobalteNavigationMenu.Trigger
			class={cn(
				'group relative flex items-center gap-1.5 text-sm font-medium transition-colors',
				inv ? 'text-white/65' : 'text-ink-700',
				'outline-none',
				v() !== 'underline' && (inv
					? 'data-[focus-visible]:ring-2 data-[focus-visible]:ring-white/40'
					: 'data-[focus-visible]:ring-2 data-[focus-visible]:ring-primary-500/50'),
				v() === 'default' && [
					!isStacked() && 'h-9',
					'rounded-md px-3 py-2',
					inv
						? 'hover:bg-white/10 hover:text-white data-[expanded]:bg-white/10 data-[expanded]:text-white'
						: 'hover:bg-surface-overlay hover:text-ink-900 data-[expanded]:bg-surface-overlay data-[expanded]:text-ink-900',
				],
				v() === 'underline' && [
					'h-full rounded-none px-3',
					isStacked() && 'py-2',
					'border-b-2 border-transparent',
					inv
						? 'hover:border-white/60 hover:text-white data-[expanded]:border-white/60 data-[expanded]:text-white'
						: 'hover:border-primary-500 hover:text-primary-600 data-[expanded]:border-primary-500 data-[expanded]:text-primary-600',
				],
				v() === 'ghost' && [
					!isStacked() && 'h-9',
					'rounded-md px-3 py-2',
					inv
						? 'hover:text-white data-[expanded]:text-white'
						: 'hover:text-primary-600 data-[expanded]:text-primary-600',
				],
				local.class,
			)}
			{...others}
		>
			{/* top/bottom: icon+label stacked in a flex-col block, chevron to the right */}
			<Show when={isStacked()}>
				<span class="flex flex-col items-center gap-1 translate-y-1">
					<Show when={local.icon && ip() === 'top'}>
						<span class="flex h-4 w-4 shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full">{local.icon}</span>
					</Show>
					<span class="text-xs leading-none">{local.children}</span>
					<Show when={local.icon && ip() === 'bottom'}>
						<span class="flex h-4 w-4 shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full">{local.icon}</span>
					</Show>
				</span>
			</Show>
			{/* start/end: normal inline layout */}
			<Show when={!isStacked()}>
				<Show when={local.icon && ip() === 'start'}>
					<span class="flex h-4 w-4 shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full">{local.icon}</span>
				</Show>
				<span>{local.children}</span>
				<Show when={local.icon && ip() === 'end'}>
					<span class="flex h-4 w-4 shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full">{local.icon}</span>
				</Show>
			</Show>
			<Show when={!local.noChevron && !isStacked()}>
				{icons.chevronDown({
					class: cn(
						'relative h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-data-[expanded]:rotate-180',
						inv ? 'text-white/40 group-hover:text-white/60' : 'text-ink-400',
					),
					'aria-hidden': 'true',
				})}
			</Show>
		</KobalteNavigationMenu.Trigger>
	)
}

/** ─── MegaMenuContent ───────────────────────────────────────────────────────── */
export interface MegaMenuContentProps {
	class?: string
	children?: JSX.Element
}

export function MegaMenuContent(props: MegaMenuContentProps) {
	const [local, others] = splitProps(props, ['class', 'children'])
	return (
		<KobalteNavigationMenu.Portal>
			{/* `as="div"`: default Kobalte NavigationMenu.Content is `ul`; our panel is divs + buttons. Invalid
			    `ul > div` makes browsers insert implied list boxes, so each extra row looks progressively indented. */}
			<KobalteNavigationMenu.Content
				as="div"
				class={cn('torchui-mm-content', local.class)}
				{...others}
			>
				{local.children}
			</KobalteNavigationMenu.Content>
		</KobalteNavigationMenu.Portal>
	)
}

/** ─── MegaMenuPanel ─────────────────────────────────────────────────────────── */
export interface MegaMenuPanelProps {
	/** Number of columns. Default: 3 */
	columns?: 2 | 3 | 4
	fullWidth?: boolean
	/** Max content width when fullWidth is true. Default: 1280px */
	maxWidth?: string
	class?: string
	children: JSX.Element
}

export function MegaMenuPanel(props: MegaMenuPanelProps) {
	const cols = () => props.columns ?? 3
	const gridClass = () => ({ 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' }[cols()] ?? 'grid-cols-3')

	return props.fullWidth ? (
		<div class={cn('w-full px-6 py-5', props.class)}>
			<div class={cn('mx-auto grid gap-x-8 gap-y-2', gridClass())} style={{ 'max-width': props.maxWidth ?? '1280px' }}>
				{props.children}
			</div>
		</div>
	) : (
		<div class={cn('grid gap-x-6 gap-y-2 p-5', gridClass(), props.class)}>
			{props.children}
		</div>
	)
}

/** ─── MegaMenuColumn ────────────────────────────────────────────────────────── */
export function MegaMenuColumn(props: { class?: string; children: JSX.Element }) {
	return (
		<div class={cn('flex flex-col gap-1', props.class)}>
			{props.children}
		</div>
	)
}

/** ─── MegaMenuSection ───────────────────────────────────────────────────────── */
export function MegaMenuSection(props: { label: string; class?: string; children: JSX.Element }) {
	return (
		<div class={cn('flex flex-col gap-1', props.class)}>
			<div class="px-3 text-[11px] font-semibold uppercase tracking-widest text-ink-400">
				{props.label}
			</div>
			<div class="flex flex-col gap-1">
				{props.children}
			</div>
		</div>
	)
}

/** ─── MegaMenuItem ──────────────────────────────────────────────────────────── */
export interface MegaMenuItemProps {
	href?: string
	icon?: JSX.Element
	label: JSX.Element
	description?: string
	badge?: string
	active?: boolean
	disabled?: boolean
	onClick?: () => void
	class?: string
}

export function MegaMenuItem(props: MegaMenuItemProps) {
	return (
		<Dynamic
			component={props.href && !props.disabled ? 'a' : 'button'}
			href={props.href && !props.disabled ? props.href : undefined}
			type={props.href && !props.disabled ? undefined : 'button'}
			tabIndex={props.disabled ? -1 : undefined}
			onClick={(e: Event) => {
				if (props.disabled) { e.preventDefault(); return }
				props.onClick?.()
			}}
			aria-disabled={props.disabled ? 'true' : undefined}
			class={cn(
				'group flex w-full min-w-0 items-start gap-3 rounded-lg px-3 py-1.5 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-500/50',
				props.active ? 'bg-primary-50' : 'hover:bg-surface-overlay',
				props.disabled && 'pointer-events-none opacity-40',
				props.class,
			)}
		>
			<Show when={props.icon}>
				<span class={cn(
					'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors [&>svg]:h-4 [&>svg]:w-4',
					props.active
						? 'bg-primary-100 text-primary-600'
						: 'bg-surface-overlay text-ink-500 group-hover:bg-surface-dim group-hover:text-ink-700',
				)}>
					{props.icon}
				</span>
			</Show>
			<div class="min-w-0 flex-1">
				<div class="flex items-center gap-2">
					<span class={cn('font-medium leading-none', props.active ? 'text-primary-700' : 'text-ink-900')}>
						{props.label}
					</span>
					<Show when={props.badge}>
						<span class="rounded-full bg-primary-100 px-1.5 py-0.5 text-[10px] font-semibold text-primary-700">
							{props.badge}
						</span>
					</Show>
				</div>
				<Show when={props.description}>
					<div class="mt-0.5 text-xs leading-relaxed text-ink-500">{props.description}</div>
				</Show>
			</div>
		</Dynamic>
	)
}

/** ─── MegaMenuFeatured ──────────────────────────────────────────────────────── */
export interface MegaMenuFeaturedProps {
	href?: string
	title: string
	description?: string
	/** Background color class. Default: primary gradient */
	backgroundClass?: string
	image?: JSX.Element
	/** CTA label. Default: 'Learn more' */
	cta?: string
	class?: string
}

export function MegaMenuFeatured(props: MegaMenuFeaturedProps) {
	const icons = useIcons()
	return (
		<Dynamic
			component={props.href ? 'a' : 'div'}
			href={props.href}
			class={cn(
				'group relative flex h-full flex-col justify-between overflow-hidden rounded-xl p-5 outline-none transition-opacity hover:opacity-90',
				'focus-visible:ring-2 focus-visible:ring-white/70',
				props.backgroundClass ?? 'bg-gradient-to-br from-primary-500 to-primary-600',
				props.class,
			)}
		>
			<Show when={props.image}>
				<div class="pointer-events-none absolute inset-0 opacity-20">{props.image}</div>
			</Show>
			<div class="relative">
				<p class="text-sm font-semibold text-white">{props.title}</p>
				<Show when={props.description}>
					<p class="mt-1 text-xs text-white/70 leading-relaxed" style={{ 'max-width': '160px' }}>{props.description}</p>
				</Show>
			</div>
			<div class="relative mt-4 flex items-center gap-1 text-xs font-semibold text-white">
				{props.cta ?? 'Learn more'}
				{icons.chevronRight({ class: 'h-3 w-3 transition-transform group-hover:translate-x-0.5', 'aria-hidden': 'true' })}
			</div>
		</Dynamic>
	)
}

/** ─── MegaMenuDivider ───────────────────────────────────────────────────────── */
export function MegaMenuDivider(props: { class?: string }) {
	return <div role="separator" aria-orientation="horizontal" class={cn('my-2 h-px bg-surface-border', props.class)} />
}

/** ─── MegaMenuFooter ────────────────────────────────────────────────────────── */
export function MegaMenuFooter(props: {
	class?: string
	children: JSX.Element
	fullWidth?: boolean
	maxWidth?: string
}) {
	return (
		<div class={cn('border-t border-surface-border', props.fullWidth ? 'px-6 py-3' : 'px-5 py-3', props.class)}>
			<div
				class="flex items-center gap-2"
				style={props.fullWidth ? { 'max-width': props.maxWidth ?? '1280px', margin: '0 auto' } : {}}
			>
				{props.children}
			</div>
		</div>
	)
}

/** ─── MegaMenuFooterLink ────────────────────────────────────────────────────── */
export function MegaMenuFooterLink(props: { href?: string; onClick?: () => void; children: JSX.Element; class?: string }) {
	return (
		<Dynamic
			component={props.href ? 'a' : 'button'}
			href={props.href}
			type={props.href ? undefined : 'button'}
			onClick={props.onClick}
			class={cn(
				'text-xs font-medium text-ink-500 hover:text-primary-600 transition-colors',
				'outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
				props.class,
			)}
		>
			{props.children}
		</Dynamic>
	)
}

/** ─── MegaMenuBarLink ───────────────────────────────────────────────────────── */
export interface MegaMenuBarLinkProps {
	href: string
	class?: string
	children?: JSX.Element
	/** Overrides the bar-level variant for this link only */
	variant?: MenuVariant
}

export function MegaMenuBarLink(props: MegaMenuBarLinkProps) {
	const contextVariant = useContext(VariantContext)
	const v = () => props.variant ?? contextVariant

	return (
		<div class={cn('flex items-stretch', v() === 'underline' && 'h-full')}>
			<a
				href={props.href}
				class={cn(
					'flex items-center text-sm font-medium text-ink-700 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
					v() === 'default' && 'h-9 rounded-md px-3 py-2 hover:bg-surface-overlay hover:text-ink-900',
					v() === 'underline' && [
						'h-full rounded-none px-3',
						'border-b-2 border-transparent',
						'hover:border-primary-500 hover:text-primary-600',
					],
					v() === 'ghost' && 'h-9 rounded-md px-3 py-2 hover:text-primary-600',
					props.class,
				)}
			>
				{props.children}
			</a>
		</div>
	)
}

type MegaMenuComponent = typeof MegaMenuBar & {
	Menu: typeof MegaMenuMenu
	Trigger: typeof MegaMenuTrigger
	Content: typeof MegaMenuContent
	Panel: typeof MegaMenuPanel
	Column: typeof MegaMenuColumn
	Section: typeof MegaMenuSection
	Item: typeof MegaMenuItem
	Featured: typeof MegaMenuFeatured
	Divider: typeof MegaMenuDivider
	Footer: typeof MegaMenuFooter
	FooterLink: typeof MegaMenuFooterLink
	BarLink: typeof MegaMenuBarLink
}

export const MegaMenu: MegaMenuComponent = Object.assign(MegaMenuBar, {
	Menu: MegaMenuMenu,
	Trigger: MegaMenuTrigger,
	Content: MegaMenuContent,
	Panel: MegaMenuPanel,
	Column: MegaMenuColumn,
	Section: MegaMenuSection,
	Item: MegaMenuItem,
	Featured: MegaMenuFeatured,
	Divider: MegaMenuDivider,
	Footer: MegaMenuFooter,
	FooterLink: MegaMenuFooterLink,
	BarLink: MegaMenuBarLink,
})