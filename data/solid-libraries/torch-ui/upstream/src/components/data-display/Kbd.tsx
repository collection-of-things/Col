import { type JSX, For, Show, splitProps } from 'solid-js'
import { cn } from '../../utilities/classNames'

export type KbdVariant = 'default' | 'flat'
export type KbdSize = 'sm' | 'md' | 'lg'

export interface KbdProps extends JSX.HTMLAttributes<HTMLElement> {
	/** Visual style. default = raised key with bottom border; flat = simple outlined. Default: default. */
	variant?: KbdVariant
	/** Size. Default: md. */
	size?: KbdSize
	children?: JSX.Element
}

export interface KbdShortcutProps {
	/** Ordered list of key labels to display (e.g. [KEY.Cmd, 'K']). */
	keys: string[]
	/** Passed to each Kbd. Default: default. */
	variant?: KbdVariant
	/** Passed to each Kbd. Default: md. */
	size?: KbdSize
	/** Separator rendered between keys. Default: '+'. */
	separator?: string
	class?: string
}

/** Common special key symbols for use with Kbd and KbdShortcut. */
export const KEY = {
	Cmd: '⌘',
	Shift: '⇧',
	Option: '⌥',
	Alt: '⌥',
	Ctrl: '⌃',
	Enter: '↵',
	Backspace: '⌫',
	Delete: '⌦',
	Escape: 'Esc',
	Tab: '⇥',
	Up: '↑',
	Down: '↓',
	Left: '←',
	Right: '→',
} as const

const variantClasses: Record<KbdVariant, string> = {
	default: [
		'bg-surface-raised border border-surface-border border-b-2',
		'shadow-sm',
	].join(' '),
	flat: 'bg-surface-overlay border border-surface-border',
}

const sizeClasses: Record<KbdSize, string> = {
	sm: 'h-5 min-w-5 px-1 text-[10px] rounded',
	md: 'h-6 min-w-6 px-1.5 text-[11px] rounded',
	lg: 'h-7 min-w-7 px-2 text-xs rounded-md',
}

/**
 * Displays a single keyboard key.
 * Use KbdShortcut for multi-key combinations.
 */
export function Kbd(props: KbdProps) {
	const [local, others] = splitProps(props, ['variant', 'size', 'class', 'children'])
	const variant = () => local.variant ?? 'default'
	const size = () => local.size ?? 'md'

	return (
		<kbd
			class={cn(
				'inline-flex items-center justify-center font-mono font-medium leading-none text-ink-700',
				variantClasses[variant()],
				sizeClasses[size()],
				local.class,
			)}
			{...others}
		>
			{local.children}
		</kbd>
	)
}

/**
 * Displays a keyboard shortcut as a sequence of Kbd keys separated by a delimiter.
 *
 * @example
 * <KbdShortcut keys={[KEY.Cmd, 'K']} />
 * <KbdShortcut keys={['Ctrl', 'Shift', 'P']} separator="+" />
 */
export function KbdShortcut(props: KbdShortcutProps) {
	const sep = () => props.separator ?? '+'

	return (
		<span class={cn('inline-flex items-center gap-0.5', props.class)}>
			<For each={props.keys}>
				{(key, i) => (
					<>
						<Show when={i() > 0}>
							<span
								class="mx-0.5 select-none font-sans text-[10px] text-ink-500"
								aria-hidden="true"
							>
								{sep()}
							</span>
						</Show>
						<Kbd variant={props.variant} size={props.size}>
							{key}
						</Kbd>
					</>
				)}
			</For>
		</span>
	)
}
