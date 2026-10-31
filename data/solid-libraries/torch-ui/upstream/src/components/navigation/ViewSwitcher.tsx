import { type JSX, For, Show, createEffect, createMemo, createSignal, onCleanup, onMount, splitProps } from 'solid-js'
import { cn } from '../../utilities/classNames'
import { DropdownMenuContent, DropdownMenuItem } from './DropdownMenu'
import { DropdownMenu as KobalteDropdownMenu } from '@kobalte/core/dropdown-menu'
import { useIcons } from '../../icons'
import { Button } from '../actions'

export type ViewScope = 'user' | 'tenant'

export interface ViewSwitcherItem {
	id: string
	label: string
	count?: number
	scope?: ViewScope
	pinned?: boolean
}

export interface ViewSwitcherProps {
	views: ViewSwitcherItem[]
	activeId: string
	onValueChange: (id: string) => void
	onAdd?: () => void
	addIcon?: JSX.Element
	maxVisible?: number
	moreLabel?: string
	variant?: 'standalone' | 'embedded'
	/** Accessible label for the view switcher group. Default: "Views". */
	ariaLabel?: string
	class?: string
}

const DIVIDER_WIDTH = 1
const ESTIMATED_TAB_WIDTH = 80
const OVERFLOW_TRIGGER_WIDTH = 100
const ADD_BUTTON_WIDTH = 40

/** View switcher with overflow dropdown (e.g. table views). Single use case: switch between views with optional count and overflow. */
export function ViewSwitcher(props: ViewSwitcherProps) {
	const [local] = splitProps(props, [
		'views', 'activeId', 'onValueChange', 'onAdd', 'addIcon',
		'maxVisible', 'moreLabel', 'variant', 'ariaLabel', 'class',
	])
	const icons = useIcons()

	const [dynamicMax, setDynamicMax] = createSignal<number | null>(null)
	let containerRef: HTMLDivElement | undefined
	// Component lifetime: persists for the duration the component is mounted.
	const widthCache = new Map<string, number>()
	let lastContainerWidth = 0

	const isEmbedded = () => local.variant === 'embedded'
	const dividerWidth = () => (isEmbedded() ? DIVIDER_WIDTH : 0)

	const maxVisible = () => {
		if (local.maxVisible != null) return Math.max(local.maxVisible, 1)
		const d = dynamicMax()
		return d != null ? Math.max(d, 1) : local.views.length
	}

	// Pinned-first order for measurement (no active swap to avoid dynamicMax feedback loop).
	const measureViews = createMemo(() => {
		const pinned = local.views.filter((v) => v.pinned)
		const unpinned = local.views.filter((v) => !v.pinned)
		return [...pinned, ...unpinned]
	})

	// Sort pinned views first, then ensure the active view is visible.
	// Measurement uses measureViews (pinned-first, no swap) to avoid dynamicMax feedback loop.
	const renderViews = createMemo(() => {
		const sorted = measureViews()
		const max = maxVisible()
		if (max <= 0) return sorted
		const activeIdx = sorted.findIndex((v) => v.id === local.activeId)
		if (activeIdx < 0 || activeIdx < max) return sorted
		const result = [...sorted]
		;[result[max - 1], result[activeIdx]] = [result[activeIdx], result[max - 1]]
		return result
	})
	const visibleAndOverflow = createMemo(() => {
		const all = renderViews()
		const max = Math.min(maxVisible(), all.length)
		return { visible: all.slice(0, max), overflow: all.slice(max) }
	})
	const visibleViews = createMemo(() => visibleAndOverflow().visible)
	const overflowViews = createMemo(() => visibleAndOverflow().overflow)

	/** Count how many views fit in the available width using cached widths. */
	const fitCount = (views: ViewSwitcherItem[], available: number, reserved: number) => {
		const divW = dividerWidth()
		let total = 0
		let count = 0
		for (const view of views) {
			const w = widthCache.get(view.id) ?? ESTIMATED_TAB_WIDTH
			const nextDividers = count * divW // dividers between tabs (count tabs → count dividers)
			if (total + w + nextDividers + reserved > available && count > 0) break
			total += w
			count++
		}
		return count
	}

	const measure = (force = false) => {
		if (!containerRef) return
		// Use Math.ceil for consistency with tab width measurements
		const containerWidth = Math.ceil(containerRef.getBoundingClientRect().width)
		if (containerWidth <= 0) return
		if (!force && containerWidth === lastContainerWidth) return
		lastContainerWidth = containerWidth

		// Width cache is keyed by view id, so render order (including active swap) doesn't matter.
		const tabElements = containerRef.querySelectorAll<HTMLElement>('[data-view-tab]')
		for (const el of tabElements) {
			const id = el.dataset.viewId
			if (id) {
				// Ceil to avoid subpixel flicker at certain zoom levels
				const width = Math.ceil(el.getBoundingClientRect().width) || el.offsetWidth
				widthCache.set(id, width)
			}
		}

		const views = measureViews()
		const addReserve = local.onAdd ? ADD_BUTTON_WIDTH : 0

		// First pass: assume no overflow trigger needed
		let count = fitCount(views, containerWidth, addReserve)

		// If that creates overflow, re-fit accounting for the overflow trigger
		if (count < views.length) {
			count = fitCount(views, containerWidth, addReserve + OVERFLOW_TRIGGER_WIDTH)
		}

		const next = Math.max(count, 1)
		setDynamicMax((prev) => (prev !== next ? next : prev))
	}

	let raf = 0
	const scheduleMeasure = (force = false) => {
		cancelAnimationFrame(raf)
		raf = requestAnimationFrame(() => measure(force))
	}

	onMount(() => {
		if (local.maxVisible != null) return
		if (!containerRef) return

		const ro = new ResizeObserver(() => scheduleMeasure(false))
		ro.observe(containerRef)

		// First paint: force measure
		scheduleMeasure(true)

		// Fonts can shift widths without resizing the container
		let cancelled = false
		const fontsReady = typeof document !== 'undefined' ? document.fonts?.ready : undefined
		fontsReady?.then(() => { if (!cancelled) scheduleMeasure(true) })

		onCleanup(() => {
			cancelled = true
			cancelAnimationFrame(raf)
			ro.disconnect()
		})
	})

	createEffect(() => {
		if (local.maxVisible != null) return
		// Cheap hash-ish signature without allocating huge strings
		let acc = local.views.length
		for (const v of local.views) {
			acc = (acc * 31 + v.id.length + v.label.length + (v.count ?? 0) + (v.pinned ? 1 : 0)) | 0
		}
		void acc
		scheduleMeasure(true)
	})

	// Prune stale cache entries when views change
	createEffect(() => {
		const ids = new Set(local.views.map((v) => v.id))
		for (const key of widthCache.keys()) {
			if (!ids.has(key)) widthCache.delete(key)
		}
	})

	// Automatic activation: arrow keys move focus and select (view switcher pattern).
	const onTabKeyDown: JSX.EventHandlerUnion<HTMLButtonElement, KeyboardEvent> = (e) => {
		const key = e.key
		if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return
		e.preventDefault()
		const tabs = containerRef?.querySelectorAll<HTMLButtonElement>('[data-view-tab]')
		if (!tabs || tabs.length === 0) return
		const idx = Array.prototype.indexOf.call(tabs, e.currentTarget)
		let next = idx
		if (key === 'ArrowLeft') next = Math.max(0, idx - 1)
		if (key === 'ArrowRight') next = Math.min(tabs.length - 1, idx + 1)
		if (key === 'Home') next = 0
		if (key === 'End') next = tabs.length - 1
		tabs[next]?.focus()
		const nextId = tabs[next]?.dataset.viewId
		if (nextId) local.onValueChange(nextId)
	}

	const containerClass = () =>
		isEmbedded()
			? 'flex min-w-0 w-full items-stretch gap-0 overflow-hidden rounded-t-2xl'
			: 'inline-flex w-full max-w-full items-center gap-1.5 overflow-hidden rounded-xl border border-surface-border bg-surface-dim px-2 py-1.5'

	return (
		<div
			ref={(el) => (containerRef = el)}
			role="group"
			aria-label={local.ariaLabel ?? 'Views'}
			class={cn(containerClass(), local.class)}
		>
			{(() => {
				const vis = visibleViews()
				const ov = overflowViews()
				return (
					<>
						<For each={vis}>
							{(view, i) => {
								const isActive = () => view.id === local.activeId
								const isFirst = () => i() === 0
								const isLastVisible = () => i() === vis.length - 1
								const hideDivider = () => {
									const next = vis[i() + 1]
									return isActive() || next?.id === local.activeId
								}
								return (
									<>
										<button
											type="button"
											data-view-tab
											data-view-id={view.id}
											class={cn(
												'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors',
												isEmbedded() &&
													'max-w-[200px] shrink-0 rounded-t-2xl rounded-b-none border border-transparent border-b-0',
												isEmbedded() && isFirst() && 'rounded-tl-2xl',
												isEmbedded() && isLastVisible() && 'rounded-tr-2xl',
												isEmbedded() &&
													(isActive()
														? 'relative z-10 -mx-px -mt-px bg-surface-raised text-ink-900 border border-surface-border border-b-transparent'
														: 'bg-transparent text-ink-500 hover:text-ink-700'),
												!isEmbedded() &&
													(isActive()
														? 'rounded-lg border border-surface-border bg-surface-raised text-ink-900 shadow-sm'
														: 'rounded-lg border border-transparent text-ink-500 hover:text-ink-700 hover:bg-surface-overlay'),
											)}
											aria-current={isActive() ? 'page' : undefined}
											tabIndex={isActive() ? 0 : -1}
											onKeyDown={onTabKeyDown}
											onClick={() => local.onValueChange(view.id)}
										>
											<Show when={view.pinned}>
												{icons.pin({ width: 12, height: 12, class: 'shrink-0 text-ink-400', 'aria-hidden': 'true' })}
											</Show>
											<span class="min-w-0 truncate">{view.label}</span>
											<Show when={typeof view.count === 'number'}>
												<span class="shrink-0 rounded-full bg-surface-overlay/80 px-2 py-0.5 text-xs font-semibold text-ink-600">
													{view.count}
												</span>
											</Show>
										</button>
										<Show when={isEmbedded() && !isLastVisible() && !hideDivider()}>
											<span class="w-px bg-surface-border" role="presentation" aria-hidden="true" />
										</Show>
									</>
								)
							}}
						</For>
						<Show when={ov.length > 0}>
							<KobalteDropdownMenu>
								<KobalteDropdownMenu.Trigger as="button" type="button" class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-600 hover:bg-surface-raised hover:text-ink-900">
									{local.moreLabel ?? 'More'}
									<span class="rounded-full bg-surface-overlay px-2 py-0.5 text-xs font-semibold text-ink-600">
										{ov.length}
									</span>
								</KobalteDropdownMenu.Trigger>
								<DropdownMenuContent>
									<For each={ov}>
										{(view) => (
											<DropdownMenuItem onSelect={() => local.onValueChange(view.id)}>
												<div class="flex w-full items-center justify-between gap-3">
													<div class="flex min-w-0 flex-1 items-center gap-2">
														<Show when={view.pinned}>
															{icons.pin({ width: 12, height: 12, class: 'shrink-0 text-ink-400', 'aria-hidden': 'true' })}
														</Show>
														<span class="truncate">{view.label}</span>
													</div>
													<Show when={typeof view.count === 'number'}>
														<span class="shrink-0 rounded-full bg-surface-overlay px-2 py-0.5 text-xs font-semibold text-ink-600">
															{view.count}
														</span>
													</Show>
												</div>
											</DropdownMenuItem>
										)}
									</For>
								</DropdownMenuContent>
							</KobalteDropdownMenu>
						</Show>
					</>
				)
			})()}
			<Show when={local.onAdd}>
				<Button
					iconOnly
					variant="ghost"
					size="xs"
					icon={local.addIcon}
					label="Add view"
					onClick={local.onAdd}
					class="ml-2 self-center h-7 w-7 hover:bg-surface-raised hover:text-ink-900"
				/>
			</Show>
		</div>
	)
}
