import { createSignal, createEffect, on, Show, For, Index, type JSX, splitProps, onMount, onCleanup } from 'solid-js'
import { Dialog as KobalteDialog } from '@kobalte/core/dialog'
import { cn } from '../../utilities/classNames'
import { useIcons } from '../../icons'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface SearchPaletteCategory {
	key: string
	label: string
	icon?: JSX.Element | (() => JSX.Element)
}

export interface SearchPaletteItem {
	key: string
	label: string
	description?: string
	icon?: JSX.Element | (() => JSX.Element)
	category?: string
	trailing?: JSX.Element | (() => JSX.Element)
}

export interface SearchPaletteGroup {
	title: string
	items: SearchPaletteItem[]
	/** Optional "See all" link at the bottom of the group. */
	seeAll?: { label: string; onClick: () => void }
}

export interface SearchPaletteProps {
	/** Whether the palette is open. */
	open: boolean
	/** Called when the open state changes. */
	onOpenChange: (open: boolean) => void
	/** Current search query (controlled). */
	query: string
	/** Called when the query changes. */
	onQueryChange: (query: string) => void
	/** Optional category chips for filtering. */
	categories?: SearchPaletteCategory[]
	/** Currently selected category keys. */
	selectedCategories?: string[]
	/** Called when category selection changes. */
	onCategoryChange?: (categories: string[]) => void
	/** Grouped result items to display. */
	groups: SearchPaletteGroup[]
	/** Called when the user selects an item. */
	onSelect: (item: SearchPaletteItem) => void
	/** Input placeholder text. Default: "Search…" */
	placeholder?: string
	/** Text shown when no results match. Default: "No results found." */
	emptyMessage?: string
	/** Category chips label. Default: "I'm Searching…" */
	categoriesLabel?: string
	/** Show keyboard hint bar at the bottom. Default: true. */
	showKeyboardHints?: boolean
	class?: string
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SearchPalette(props: SearchPaletteProps) {
	const [local, others] = splitProps(props, [
		'open', 'onOpenChange', 'query', 'onQueryChange',
		'categories', 'selectedCategories', 'onCategoryChange',
		'groups', 'onSelect', 'placeholder', 'emptyMessage',
		'categoriesLabel', 'showKeyboardHints', 'class',
	])
	const icons = useIcons()

	let inputRef: HTMLInputElement | undefined
	const [activeIndex, setActiveIndex] = createSignal(-1)

	// Flatten all visible items for keyboard navigation
	const flatItems = () => {
		const items: SearchPaletteItem[] = []
		for (const group of local.groups) {
			for (const item of group.items) {
				items.push(item)
			}
		}
		return items
	}

	// Reset active index when groups change
	createEffect(on(() => local.groups, () => setActiveIndex(-1)))

	// Focus input when opened
	createEffect(on(() => local.open, (open) => {
		if (open) {
			setActiveIndex(-1)
			requestAnimationFrame(() => inputRef?.focus())
		}
	}))

	// Global Cmd+K / Ctrl+K listener
	const handleGlobalKeyDown = (e: KeyboardEvent) => {
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault()
			local.onOpenChange(!local.open)
		}
	}

	onMount(() => {
		document.addEventListener('keydown', handleGlobalKeyDown)
	})
	onCleanup(() => {
		document.removeEventListener('keydown', handleGlobalKeyDown)
	})

	function handleKeyDown(e: KeyboardEvent) {
		const items = flatItems()
		const count = items.length

		if (count === 0) return

		if (e.key === 'ArrowDown') {
			e.preventDefault()
			setActiveIndex((i) => (i + 1) % count)
		} else if (e.key === 'ArrowUp') {
			e.preventDefault()
			setActiveIndex((i) => (i <= 0 ? count - 1 : i - 1))
		} else if (e.key === 'Enter') {
			e.preventDefault()
			const idx = activeIndex()
			if (idx >= 0 && idx < count) {
				local.onSelect(items[idx])
			}
		}
	}

	function toggleCategory(key: string) {
		const current = local.selectedCategories ?? []
		const next = current.includes(key)
			? current.filter((k) => k !== key)
			: [...current, key]
		local.onCategoryChange?.(next)
	}

	const totalItems = () => {
		let n = 0
		for (const g of local.groups) n += g.items.length
		return n
	}

	// Compute flat index for an item given its group and item position
	const flatIndex = (groupIdx: number, itemIdx: number) => {
		let idx = 0
		for (let g = 0; g < groupIdx; g++) {
			idx += local.groups[g].items.length
		}
		return idx + itemIdx
	}

	// Resolve icon/trailing which may be a pre-created element or a factory function
	const resolveContent = (value: JSX.Element | (() => JSX.Element)): JSX.Element =>
		typeof value === 'function' ? (value as () => JSX.Element)() : value

	return (
		<KobalteDialog open={local.open} onOpenChange={local.onOpenChange}>
			<KobalteDialog.Portal>
				<KobalteDialog.Overlay
					class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
				/>
				<div class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
					<KobalteDialog.Content
						class={cn(
							'w-full max-w-lg rounded-xl bg-surface-raised shadow-2xl border border-surface-border',
							'flex flex-col max-h-[60vh]',
							local.class,
						)}
						onKeyDown={handleKeyDown}
					>
						{/* Search input */}
						<div class="flex items-center gap-3 border-b border-surface-border px-4 py-3">
							{icons.search({ class: 'h-5 w-5 shrink-0 text-ink-400', 'aria-hidden': 'true' })}
							<input
								ref={inputRef}
								type="text"
								value={local.query}
								onInput={(e) => local.onQueryChange(e.currentTarget.value)}
								placeholder={local.placeholder ?? 'Search…'}
								class="flex-1 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 outline-none"
							/>
							<Show when={local.query.length > 0}>
								<button
									type="button"
									onClick={() => {
										local.onQueryChange('')
										inputRef?.focus()
									}}
									class="shrink-0 rounded p-0.5 text-ink-400 hover:text-ink-600 outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
									aria-label="Clear search"
								>
									{icons.close({ class: 'h-4 w-4', 'aria-hidden': 'true' })}
								</button>
							</Show>
						</div>

						{/* Categories */}
						<Show when={local.categories && local.categories.length > 0}>
							<div class="border-b border-surface-border px-4 py-3">
								<p class="mb-2 text-xs font-medium text-ink-500">
									{local.categoriesLabel ?? "I'm Searching…"}
								</p>
								<div class="flex flex-wrap gap-1.5">
									<For each={local.categories}>
										{(cat) => {
											const isSelected = () =>
												(local.selectedCategories ?? []).includes(cat.key)
											return (
												<button
													type="button"
													onClick={() => toggleCategory(cat.key)}
													class={cn(
														'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors',
														'outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
														isSelected()
															? 'border-primary-500 bg-primary-50 text-primary-600'
															: 'border-surface-border bg-surface-raised text-ink-600 hover:bg-surface-overlay',
													)}
												>
													<Show when={cat.icon}>
														<span class="h-3.5 w-3.5">{resolveContent(cat.icon!)}</span>
													</Show>
													{cat.label}
												</button>
											)
										}}
									</For>
								</div>
							</div>
						</Show>

						{/* Results */}
						<div class="flex-1 overflow-y-auto" role="listbox">
							<Show
								when={totalItems() > 0}
								fallback={
									<div class="px-4 py-8 text-center text-sm text-ink-500">
										{local.emptyMessage ?? 'No results found.'}
									</div>
								}
							>
								<Index each={local.groups}>
									{(group, gi) => (
										<div class="py-2">
											<p class="px-4 pb-1 text-xs font-medium text-ink-500">
												{group().title}
											</p>
											<For each={group().items}>
												{(item, ii) => {
													const idx = () => flatIndex(gi, ii())
													return (
														<button
															type="button"
															role="option"
															aria-selected={activeIndex() === idx() ? 'true' : 'false'}
															onClick={() => local.onSelect(item)}
															onMouseEnter={() => setActiveIndex(idx())}
															class={cn(
																'flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors',
																'outline-none',
																activeIndex() === idx()
																	? 'bg-surface-overlay text-ink-900'
																	: 'text-ink-700 hover:bg-surface-overlay',
															)}
														>
															<Show when={item.icon}>
																<span class="flex h-5 w-5 shrink-0 items-center justify-center text-ink-400">
																	{resolveContent(item.icon!)}
																</span>
															</Show>
															<span class="min-w-0 flex-1">
																<span class="block truncate">{item.label}</span>
																<Show when={item.description}>
																	<span class="block truncate text-xs text-ink-400 mt-0.5">{item.description}</span>
																</Show>
															</span>
															<Show when={item.trailing}>
																<span class="shrink-0">{resolveContent(item.trailing!)}</span>
															</Show>
														</button>
													)
												}}
											</For>
											<Show when={group().seeAll}>
												<button
													type="button"
													onClick={() => group().seeAll!.onClick()}
													class="px-4 py-1.5 text-xs font-medium text-primary-500 hover:text-primary-600 outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
												>
													{group().seeAll!.label}
												</button>
											</Show>
										</div>
									)}
								</Index>
							</Show>
						</div>

						{/* Keyboard hints */}
						<Show when={local.showKeyboardHints !== false}>
							<div class="flex items-center gap-4 border-t border-surface-border px-4 py-2 text-xs text-ink-400">
								<span class="inline-flex items-center gap-1">
									<kbd class="rounded border border-surface-border bg-surface-overlay px-1 py-0.5 font-mono text-[10px] text-ink-700">↑</kbd>
									<kbd class="rounded border border-surface-border bg-surface-overlay px-1 py-0.5 font-mono text-[10px] text-ink-700">↓</kbd>
									To navigate
								</span>
								<span class="inline-flex items-center gap-1">
									<kbd class="rounded border border-surface-border bg-surface-overlay px-1 py-0.5 font-mono text-[10px] text-ink-700">↵</kbd>
									To select
								</span>
								<span class="inline-flex items-center gap-1">
									<kbd class="rounded border border-surface-border bg-surface-overlay px-1 py-0.5 font-mono text-[10px] text-ink-700">esc</kbd>
									To close
								</span>
							</div>
						</Show>
					</KobalteDialog.Content>
				</div>
			</KobalteDialog.Portal>
		</KobalteDialog>
	)
}
