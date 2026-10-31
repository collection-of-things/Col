import { createSignal, createEffect, onCleanup, onMount, Show } from 'solid-js'
import { cn } from '../../utilities/classNames'
import { Button } from './Button'
import { Switch } from '../forms'
import { useIcons } from '../../icons'

export type ColorScheme = 'light' | 'dark'

export interface DarkModeToggleProps {
	variant?: 'icon' | 'switch'
	/** Controlled value. When provided, internal state is bypassed. */
	value?: ColorScheme
	/** Called when the user toggles. Use with `value` for controlled mode. */
	onValueChange?: (scheme: ColorScheme) => void
	/** Element to toggle the `dark` class on. Default: `document.documentElement`. */
	target?: () => HTMLElement
	/** localStorage key for persistence. Set to `false` to disable. Default `'torch-theme'`. */
	storageKey?: string | false
	/** Set `data-switching-theme` on body during toggle to suppress CSS transitions. Default: true. */
	suppressTransitions?: boolean
	class?: string
}

export function DarkModeToggle(props: DarkModeToggleProps) {
	const [scheme, setScheme] = createSignal<ColorScheme>('light')
	const icons = useIcons()
	const dark = () => scheme() === 'dark'
	const key = () => props.storageKey ?? 'torch-theme'
	const el = () => props.target?.() ?? document.documentElement

	let clearSuppressTimeout: number | undefined

	onCleanup(() => {
		if (clearSuppressTimeout !== undefined) {
			window.clearTimeout(clearSuppressTimeout)
			document.body.removeAttribute('data-switching-theme')
		}
	})

	createEffect(() => {
		if (props.value !== undefined) {
			setScheme(props.value)
			const target = props.target?.() ?? document.documentElement
			if (target) target.classList.toggle('dark', props.value === 'dark')
		}
	})

	onMount(() => {
		if (props.value !== undefined) {
			setScheme(props.value)
			el().classList.toggle('dark', props.value === 'dark')
			return
		}
		const k = key()
		const stored = k !== false ? localStorage.getItem(k) : null
		const mq = window.matchMedia('(prefers-color-scheme: dark)')
		const initial: ColorScheme = stored ? (stored === 'dark' ? 'dark' : 'light') : mq.matches ? 'dark' : 'light'
		setScheme(initial)
		el().classList.toggle('dark', initial === 'dark')

		const handleChange = (e: MediaQueryListEvent) => {
			const currentStored = key() !== false ? localStorage.getItem(key() as string) : null
			if (!currentStored && props.value === undefined) {
				setScheme(e.matches ? 'dark' : 'light')
				el().classList.toggle('dark', e.matches)
			}
		}
		mq.addEventListener('change', handleChange)
		onCleanup(() => mq.removeEventListener('change', handleChange))

		const handleExternalScheme = (e: Event) => {
			if (props.value !== undefined) return
			const next = (e as CustomEvent<ColorScheme>).detail
			setScheme(next)
		}
		window.addEventListener('torch:scheme', handleExternalScheme)
		onCleanup(() => window.removeEventListener('torch:scheme', handleExternalScheme))
	})

	function applyScheme(next: ColorScheme) {
		const suppress = props.suppressTransitions !== false
		if (suppress) {
			document.body.setAttribute('data-switching-theme', '')
			if (clearSuppressTimeout !== undefined) window.clearTimeout(clearSuppressTimeout)
			clearSuppressTimeout = window.setTimeout(() => {
				document.body.removeAttribute('data-switching-theme')
				clearSuppressTimeout = undefined
			}, 100)
		}
		if (props.value === undefined) {
			setScheme(next)
			el().classList.toggle('dark', next === 'dark')
			const k = key()
			if (k !== false) localStorage.setItem(k, next)
		}
		props.onValueChange?.(next)
		window.dispatchEvent(new CustomEvent('torch:scheme', { detail: next }))
	}

	function toggle() {
		applyScheme(dark() ? 'light' : 'dark')
	}

	const variant = () => props.variant ?? 'icon'

	return (
		<Show
			when={variant() === 'switch'}
			fallback={
				<Button
					variant="ghost"
					size="sm"
					iconOnly
					icon={dark()
						? icons.sun({ class: 'h-4 w-4', 'aria-hidden': 'true' })
						: icons.moon({ class: 'h-4 w-4', 'aria-hidden': 'true' })}
					label={dark() ? 'Switch to Light mode' : 'Switch to Dark mode'}
					aria-pressed={dark() ? 'true' : 'false'}
					onClick={toggle}
					class={props.class}
				/>
			}
		>
			<Switch
				data-theme-toggle=""
				fullWidth={false}
				class="flex h-9 w-auto items-center"
				controlClass={cn(props.class, 'data-[checked]:border-surface-border')}
				variant="icon"
				trackColor="var(--surface-dim)"
				trackCheckedColor="var(--surface-dim)"
				checked={dark()}
				onValueChange={(checked) => applyScheme(checked ? 'dark' : 'light')}
				aria-label={dark() ? 'Switch to Light mode' : 'Switch to Dark mode'}
				thumbOffIcon={icons.sun({ class: 'h-2.5 w-2.5 text-ink-700', 'aria-hidden': 'true' })}
				thumbOnIcon={icons.moon({ class: 'h-2.5 w-2.5 text-ink-700', 'aria-hidden': 'true' })}
			/>
		</Show>
	)
}
