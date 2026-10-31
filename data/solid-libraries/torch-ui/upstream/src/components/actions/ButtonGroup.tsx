import {
	type JSX,
	children,
	createContext,
	createEffect,
	createSignal,
	splitProps,
	useContext,
	For,
} from 'solid-js'
import { DropdownMenu as KobalteDropdownMenu, type DropdownMenuRootProps as KobalteDropdownMenuRootProps } from '@kobalte/core/dropdown-menu'
import { ToggleGroup as KobalteToggleGroup } from '@kobalte/core/toggle-group'
import { cn } from '../../utilities/classNames'
import { Button } from './Button'
import type { ButtonProps, ButtonVariant } from './Button'
import { type ComponentSize } from '../../types/component-size'
import { useIcons } from '../../icons'

export interface ToggleGroupOption {
	/** Value passed to `onChange` when this option is selected. */
	value: string
	/** Display text rendered inside the toggle item. */
	label: string
}


type ButtonGroupPropsBase = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange'> &
	Partial<Pick<KobalteDropdownMenuRootProps, 'open' | 'onOpenChange'>> & {
	class?: string
	children?: JSX.Element
	/** Enable split-button mode (main action + dropdown trigger). */
	split?: boolean
	/** Button size inherited by split-mode children. Default: "md" */
	size?: ComponentSize
	/** Button variant inherited by split-mode children. Default: "primary" */
	variant?: ButtonVariant
	/** Use filled-variant child dividers (white/20 instead of ink borders). */
	filled?: boolean
	/** Toggle-group mode: array of selectable options. Requires `value` and `onValueChange`. */
	options?: ToggleGroupOption[]
	/** Toggle-group layout direction. Default: "horizontal" */
	orientation?: 'horizontal' | 'vertical'
	/** Disable all buttons in the group. */
	disabled?: boolean
	/** Split mode: aria-label for the role="group" wrapper. Default: "Split button" */
	splitButtonAriaLabel?: string
}

export type ButtonGroupProps =
	| (ButtonGroupPropsBase & { multiple?: false; value?: string; onValueChange?: (value: string) => void })
	| (ButtonGroupPropsBase & { multiple: true; value?: string[]; onValueChange?: (value: string[]) => void })

const ButtonGroupSplitContext = createContext<{ size: ComponentSize; variant: ButtonVariant; disabled: boolean }>({
	size: 'md',
	variant: 'primary',
	disabled: false,
})

const splitTriggerSizes: Record<ComponentSize, string> = {
	xs: 'h-7 w-7 p-0',
	sm: 'h-8 w-8 p-0',
	md: 'h-9 w-9 p-0',
	lg: 'h-10 w-10 p-0',
	xl: 'h-11 w-11 p-0',
}

const splitTriggerVariants: Record<ButtonVariant, string> = {
	primary:
		'bg-primary-500 text-white border-transparent border-l-white/20 hover:bg-primary-600 active:bg-primary-700',
	'primary-outline':
		'bg-transparent text-primary-500 border-primary-500 border-l-primary-500 hover:bg-primary-500/10 active:bg-primary-500/20',
	secondary:
		'bg-surface-raised text-ink-700 border-surface-border border-l-surface-border hover:bg-surface-overlay active:bg-surface-dim',
	outlined:
		'bg-transparent text-primary-600 border-primary-500 border-l-primary-500 hover:bg-primary-500/10 active:bg-primary-500/20',
	ghost:
		'bg-transparent text-primary-500 border-surface-border hover:bg-primary-500/10 active:bg-primary-500/20',
	link: 'bg-transparent text-primary-500 border-surface-border hover:bg-primary-500/10',
	danger:
		'bg-danger-500 text-white border-transparent border-l-white/20 hover:bg-danger-600 active:bg-danger-700',
	'danger-outline':
		'bg-transparent text-danger-500 border-danger-500 border-l-danger-500 hover:bg-danger-500/10 active:bg-danger-500/20',
	'danger-link':
		'bg-transparent text-danger-500 border-surface-border hover:bg-danger-500/10',
	success:
		'bg-success-500 text-white border-transparent border-l-white/20 hover:bg-success-600 active:bg-success-700',
	'success-outline':
		'bg-transparent text-success-500 border-success-500 border-l-success-500 hover:bg-success-500/10 active:bg-success-500/20',
	warning:
		'bg-warning-500 text-white border-transparent border-l-white/20 hover:bg-warning-600 active:bg-warning-700',
	'warning-outline':
		'bg-transparent text-warning-500 border-warning-500 border-l-warning-500 hover:bg-warning-500/10 active:bg-warning-500/20',
	info:
		'bg-info-500 text-white border-transparent border-l-white/20 hover:bg-info-600 active:bg-info-700',
	'info-outline':
		'bg-transparent text-info-500 border-info-500 border-l-info-500 hover:bg-info-500/10 active:bg-info-500/20',
}

const BUTTON_GROUP_MENU_SYMBOL = Symbol.for('ButtonGroup.Menu')

export interface ButtonGroupMenuSlot {
	[BUTTON_GROUP_MENU_SYMBOL]: true
	render: () => JSX.Element
}

function isMenuSlot(v: unknown): v is ButtonGroupMenuSlot {
	return typeof v === 'object' && v !== null && BUTTON_GROUP_MENU_SYMBOL in v
}

/** Resolve a menu slot, render function, or plain JSX element. */
function resolveSlot(value: unknown): JSX.Element {
	if (isMenuSlot(value)) return value.render()
	if (typeof value === 'function') return (value as () => JSX.Element)()
	return value as JSX.Element
}

function ButtonGroupMenuRenderer(props: { content: unknown }) {
	return <>{resolveSlot(props.content)}</>
}

const groupBaseClasses =
	'inline-flex rounded-lg border border-surface-border [&>*]:!shadow-none'

const splitBaseClasses =
	'inline-flex rounded-lg [&>*]:!shadow-none'

const groupChildClasses =
	'[&>*]:!rounded-none [&>*]:!border-0 [&>*]:!border-r [&>*]:!border-surface-border [&>*:last-child]:!border-r-0 [&>*:first-child]:!rounded-l-lg [&>*:last-child]:!rounded-r-lg'

const groupChildClassesFilled =
	'[&>*]:!rounded-none [&>*]:!border-0 [&>*]:!border-r [&>*]:!border-white/20 [&>*:last-child]:!border-r-0 [&>*:first-child]:!rounded-l-lg [&>*:last-child]:!rounded-r-lg'

const groupChildClassesVertical =
	'flex-col [&>*]:!rounded-none [&>*]:!border-0 [&>*]:!border-b [&>*]:!border-surface-border [&>*:last-child]:!border-b-0 [&>*:first-child]:!rounded-t-lg [&>*:last-child]:!rounded-b-lg'

const toggleItemBaseClass = cn(
	'inline-flex items-center justify-center font-medium transition-colors outline-none',
	'bg-transparent text-ink-700 hover:bg-surface-overlay',
	'data-[pressed]:bg-primary-500 data-[pressed]:text-white',
	'data-[pressed]:hover:bg-primary-600 data-[pressed]:hover:text-white',
	'data-[pressed]:!border-white/20',
	'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500/50',
	'disabled:opacity-50 disabled:cursor-not-allowed',
	'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed'
)

const toggleItemSizeClass: Record<ComponentSize, string> = {
	xs: 'h-[var(--torch-h-xs)] px-2.5 text-xs',
	sm: 'h-[var(--torch-h-sm)] px-3 text-xs',
	md: 'h-[var(--torch-h-md)] px-4 text-sm',
	lg: 'h-[var(--torch-h-lg)] px-5 text-sm',
	xl: 'h-[var(--torch-h-xl)] px-6 text-base',
}

/**
 * Groups buttons into a single visual unit. Supports three modes:
 * default (inline group), split (primary action + dropdown), and
 * toggle (single/multi-select option bar via `options`).
 */
export function ButtonGroupRoot(props: ButtonGroupProps) {
	const [local, others] = splitProps(props, [
		'class',
		'children',
		'split',
		'size',
		'variant',
		'filled',
		'options',
		'value',
		'onValueChange',
		'multiple',
		'orientation',
		'disabled',
		'splitButtonAriaLabel',
		'open',
		'onOpenChange',
	])
	const icons = useIcons()

	const mode: 'toggle' | 'split' | 'default' =
		local.options != null ? 'toggle'
		: local.split === true ? 'split'
		: 'default'

	const [internalOpen, setInternalOpen] = createSignal(false)
	const isControlled = () => local.open !== undefined
	const open = () => (isControlled() ? (local.open as boolean) : internalOpen())
	const setOpen = (next: boolean) => {
		if (local.disabled && next) return
		if (!isControlled()) setInternalOpen(next)
		local.onOpenChange?.(next)
	}

	const resolved = children(() => local.children)
	const list = () => {
		const c = resolved()
		return Array.isArray(c) ? c : c ? [c] : []
	}
	const main = () => list()[0]
	const menuContent = () => list()[1]
	const size = () => (local.size ?? 'md') as ComponentSize
	const variant = () => (local.variant ?? 'primary') as ButtonVariant
	const toggleOrientation = () => local.orientation ?? 'horizontal'
	const toggleRootClass = () =>
		cn(
			groupBaseClasses,
			toggleOrientation() === 'vertical' ? groupChildClassesVertical : groupChildClasses,
			local.class
		)

	if (import.meta.env.DEV) {
		createEffect(() => {
			if (mode !== 'split') return // mode is fixed at creation; skip fast in other modes
			if (list().length < 2) {
				console.warn(
					'ButtonGroup: split mode expects <ButtonGroup.Main> and <ButtonGroup.Menu> as children.'
				)
			}
		})
	}

	if (mode === 'toggle') {
		if (local.multiple) {
			return (
				<KobalteToggleGroup
					value={(local.value as string[] | undefined) ?? []}
					onChange={local.onValueChange as (v: string[]) => void}
					multiple
					orientation={toggleOrientation()}
					disabled={local.disabled}
					class={toggleRootClass()}
				>
					<For each={local.options ?? []}>
						{(opt) => (
							<KobalteToggleGroup.Item value={opt.value} aria-label={opt.label} class={cn(toggleItemBaseClass, toggleItemSizeClass[size()])}>
								{opt.label}
							</KobalteToggleGroup.Item>
						)}
					</For>
				</KobalteToggleGroup>
			)
		}
		return (
			<KobalteToggleGroup
				value={(local.value as string | undefined) ?? null}
				onChange={local.onValueChange as (v: string | null) => void}
				orientation={toggleOrientation()}
				disabled={local.disabled}
				class={toggleRootClass()}
			>
				<For each={local.options ?? []}>
					{(opt) => (
						<KobalteToggleGroup.Item value={opt.value} aria-label={opt.label} class={cn(toggleItemBaseClass, toggleItemSizeClass[size()])}>
							{opt.label}
						</KobalteToggleGroup.Item>
					)}
				</For>
			</KobalteToggleGroup>
		)
	}

	if (mode === 'split') {
		return (
			<ButtonGroupSplitContext.Provider
				value={{ get size() { return size() }, get variant() { return variant() }, get disabled() { return !!local.disabled } }}
			>
				<KobalteDropdownMenu open={open()} onOpenChange={setOpen}>
					<div
						data-torchui="button-group"
						role="group"
						aria-label={local.splitButtonAriaLabel ?? 'Split button'}
						class={cn(splitBaseClasses, local.class)}
						{...others}
					>
						{main()}
						<KobalteDropdownMenu.Trigger
							as="button"
							type="button"
							disabled={local.disabled}
							class={cn(
								'inline-flex shrink-0 items-center justify-center border-2 border-l-2 rounded-none rounded-r-lg',
								'outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500/50',
								splitTriggerVariants[variant()],
								splitTriggerSizes[size()],
								local.disabled && 'opacity-50'
							)}
							aria-label="Open menu"
						>
							{icons.chevronDown({ class: 'h-4 w-4', 'aria-hidden': 'true' })}
						</KobalteDropdownMenu.Trigger>
					</div>
					<KobalteDropdownMenu.Portal>
						<KobalteDropdownMenu.Content
							class={cn(
								'z-[80] min-w-[160px] rounded-lg border border-surface-border bg-surface-raised p-1 shadow-lg'
							)}
						>
							<ButtonGroupMenuRenderer content={menuContent()} />
						</KobalteDropdownMenu.Content>
					</KobalteDropdownMenu.Portal>
				</KobalteDropdownMenu>
			</ButtonGroupSplitContext.Provider>
		)
	}

	const childClasses = () =>
		local.filled ? groupChildClassesFilled : groupChildClasses

	return (
		<div
			data-torchui="button-group"
			role="group"
			class={cn(groupBaseClasses, childClasses(), local.class)}
			{...others}
		>
			{local.children}
		</div>
	)
}

export interface ButtonGroupMainProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
	/** Override the variant inherited from ButtonGroup. */
	variant?: ButtonVariant
	/** Override the size inherited from ButtonGroup. */
	size?: ComponentSize
	class?: string
	children?: JSX.Element
}

/** Primary action button in split mode. Inherits size/variant from the parent ButtonGroup. */
export function ButtonGroupMain(props: ButtonGroupMainProps) {
	const ctx = useContext(ButtonGroupSplitContext)
	// Strip native HTML onChange to prevent it from leaking into Button via {...others}.
	const [local, others] = splitProps(props, ['variant', 'size', 'class', 'children', 'onChange'])
	return (
		<Button
			variant={local.variant ?? ctx.variant}
			size={local.size ?? ctx.size}
			disabled={others.disabled ?? ctx.disabled}
			disableElevation
			class={cn('!rounded-r-none !border-r-0', local.class)}
			{...(others as ButtonProps)}
		>
			{local.children}
		</Button>
	)
}

export interface ButtonGroupMenuProps {
	/** Dropdown content rendered when the split trigger is clicked. Accepts JSX or a render function. */
	children?: JSX.Element | (() => JSX.Element)
}

/** Returns a plain object (slot), not JSX — used as second child of ButtonGroup when split. Cast to JSX.Element so TS accepts <ButtonGroup.Menu> in JSX. */
export function ButtonGroupMenu(props: ButtonGroupMenuProps): JSX.Element {
	const child = props.children
	const render =
		typeof child === 'function'
			? (child as () => JSX.Element)
			: () => (child as JSX.Element) ?? null
	return { [BUTTON_GROUP_MENU_SYMBOL]: true, render } as unknown as JSX.Element
}

export const ButtonGroup = Object.assign(ButtonGroupRoot, {
	Main: ButtonGroupMain,
	Menu: ButtonGroupMenu,
})

