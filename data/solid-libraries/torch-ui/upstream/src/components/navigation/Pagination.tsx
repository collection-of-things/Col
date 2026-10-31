import { type JSX, Show, For, splitProps, createEffect, on, createSignal, createUniqueId, onMount, onCleanup } from 'solid-js'
import { cn } from '../../utilities/classNames'
import { Button } from '../actions'
import { Select } from '../forms'
import { useIcons } from '../../icons'

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50]

export interface PaginationProps extends JSX.HTMLAttributes<HTMLElement> {
	/** Current 1-based page. */
	page: number
	/** Total number of pages. */
	totalPages: number
	/** Called when page changes. */
	onPageChange: (page: number) => void
	/** Max page-number buttons to show (excluding prev/next). Default: 5. Set 0 to hide page numbers. */
	maxPages?: number
	/** Show first/last page buttons (double chevrons). Default: false. */
	showFirstLast?: boolean
	/** Total item count. When set, renders "Showing X–Y of Z" info text. */
	totalItems?: number
	/** Current page size. When set alongside onPageSizeChange, renders per-page selector. */
	pageSize?: number
	/** Called when page size changes. Required alongside pageSize for the per-page selector to render. */
	onPageSizeChange?: (size: number) => void
	/** Options for per-page selector. Default: [10, 25, 50]. */
	pageSizeOptions?: number[]
	/** Optional id for the per-page select element (for label association). */
	selectId?: string
}

/** Inclusive integer range. */
function range(start: number, end: number): number[] {
	return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

/**
 * Unified pagination: page-number buttons with prev/next, optional "Showing X–Y of Z" info,
 * and optional per-page size selector. Replaces both standalone Pagination and TablePaginationFooter.
 */
export function Pagination(props: PaginationProps) {
	const [local, others] = splitProps(props, [
		'page', 'totalPages', 'onPageChange', 'maxPages', 'showFirstLast',
		'totalItems', 'pageSize', 'onPageSizeChange', 'pageSizeOptions',
		'selectId', 'class',
	])
	const icons = useIcons()

	const total = () => Math.max(1, local.totalPages)
	/** Clamped page — always valid even if consumer state is stale. */
	const page = () => Math.max(1, Math.min(local.page, total()))
	const userMaxPages = () => local.maxPages ?? 5

	const hasInfo = () => local.totalItems != null
	const hasPageSize = () => local.pageSize != null && local.onPageSizeChange != null
	const showNav = () => total() > 1

	// --- Responsive: measure fixed elements and available space ---
	let navEl!: HTMLElement
	let fixedEl!: HTMLDivElement
	const [navWidth, setNavWidth] = createSignal(0)
	const [fixedWidth, setFixedWidth] = createSignal(0)
	// Fallback 40px breaks the circular dep: no buttons → no measurement → fallback → buttons render → measured.
	const [btnWidth, setBtnWidth] = createSignal(40)

	let ro: ResizeObserver | undefined

	onMount(() => {
		// Ensure refs are set before measuring
		if (!navEl || !fixedEl) {
			console.warn('Pagination refs not set in onMount')
			return
		}
		// Synchronous initial read — eliminates flash since first reactive computation has real values.
		setNavWidth(navEl.clientWidth)
		setFixedWidth(fixedEl.scrollWidth)

		ro = new ResizeObserver((entries) => {
			for (const entry of entries) {
				if (entry.target === navEl) setNavWidth(entry.contentRect.width)
				if (entry.target === fixedEl) setFixedWidth(entry.contentRect.width)
			}
			const btn = navEl.querySelector('button[data-page-btns]') as HTMLElement | null
			if (btn) setBtnWidth(btn.offsetWidth + 4) // + gap-1
		})
		ro.observe(navEl)
		ro.observe(fixedEl)
	})

	onCleanup(() => ro?.disconnect())

	// Count icon buttons: prev/next always, first/last conditional
	const iconBtnCount = () => 2 + (local.showFirstLast ? 2 : 0)
	// Each icon button ≈ 36px + gap-1 (4px)
	const iconBtnsWidth = () => iconBtnCount() * 40

	/** Compute how many page buttons fit in the remaining space after fixed elements. */
	const effectiveMaxPages = (): number => {
		const m = userMaxPages()
		if (m === 0) return 0
		const nw = navWidth()
		if (nw === 0) return m // pre-measurement fallback; observer corrects within 1 frame
		// Available = nav - info/perpage - gap - icon buttons - rounding buffer
		const gap = fixedWidth() > 0 ? 16 : 0 // gap-4 between fixedEl and btnGroup
		const available = nw - fixedWidth() - gap - iconBtnsWidth() - 16
		// Deduct 1 slot to reserve space for up to 2 ellipsis (~22px each < 1 button width)
		const fits = Math.floor(available / btnWidth()) - 1
		if (fits < 3) return 0
		return Math.min(m, fits)
	}

	const showPageNumbers = () => effectiveMaxPages() > 0

	/** Sync consumer state when clamp kicks in (e.g. page-size change shrinks totalPages below current page). */
	createEffect(on([() => local.page, total], ([currentPage, totalPages]) => {
		const clamped = Math.max(1, Math.min(currentPage, totalPages))
		if (clamped !== currentPage) local.onPageChange(clamped)
	}))

	// --- Info text ---
	const pageSizeVal = () => local.pageSize ?? 10
	const start = () => (page() - 1) * pageSizeVal()
	const end = () => Math.min(start() + pageSizeVal(), local.totalItems ?? 0)

	// --- Per-page selector ---
	const pageSizeOptions = () => local.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS
	const pageSizeSelectOptions = () =>
		pageSizeOptions().map((n) => ({ value: String(n), label: String(n) }))
	const uniqueId = createUniqueId()
	const selectElId = () => local.selectId ?? `pagination-page-size-${uniqueId}`

	// --- Page number buttons ---
	/** Build page buttons. maxPages = exact max number of numbered buttons (including first/last). */
	const pageRange = (): (number | '...')[] => {
		const t = total()
		const c = page()
		const m = effectiveMaxPages()
		if (!showPageNumbers() || t <= 1) return []
		if (t <= m) return range(1, t)

		const result: (number | '...')[] = []
		// Always show first page
		result.push(1)
		// Window budget: m minus first and last
		const windowSize = Math.max(0, m - 2)
		if (windowSize === 0) {
			// Only first and last
			if (t > 2) result.push('...')
			result.push(t)
			return result
		}
		// Center window around current page
		const half = Math.floor(windowSize / 2)
		let wStart = Math.max(2, c - half)
		let wEnd = Math.min(t - 1, wStart + windowSize - 1)
		wStart = Math.max(2, wEnd - windowSize + 1)

		if (wStart > 2) result.push('...')
		for (let i = wStart; i <= wEnd; i++) result.push(i)
		if (wEnd < t - 1) result.push('...')
		result.push(t)
		return result
	}

	const canPrev = () => page() > 1
	const canNext = () => page() < total()

	function handlePageSizeChange(v: string) {
		local.onPageSizeChange?.(Number(v))
		local.onPageChange(1)
	}

	return (
		<nav
			ref={(el) => (navEl = el)}
			role="navigation"
			aria-label="Pagination"
			{...others}
			class={cn(
				'flex w-full items-center gap-4',
				(hasInfo() || hasPageSize()) ? '' : 'justify-center',
				local.class,
			)}
		>
			{/* Info + per-page selector. Measured by ResizeObserver for available-width calc. */}
			<div ref={(el) => (fixedEl = el)} class="flex shrink-0 items-center gap-4">
				<Show when={hasInfo()}>
					<p class="shrink-0 text-sm text-ink-600">
						Showing{' '}
						{(local.totalItems ?? 0) === 0 ? (
							<>
								<span class="font-medium text-ink-900">0</span> of{' '}
								<span class="font-medium text-ink-900">0</span>
							</>
						) : (
							<>
								<span class="font-medium text-ink-900">{start() + 1}</span>–
								<span class="font-medium text-ink-900">{end()}</span> of{' '}
								<span class="font-medium text-ink-900">{local.totalItems}</span>
							</>
						)}
					</p>
				</Show>
				<Show when={hasPageSize()}>
					<div class="flex shrink-0 items-center gap-2">
						<label for={selectElId()} class="whitespace-nowrap text-sm text-ink-500">
							Per page
						</label>
						<Select
							id={selectElId()}
							value={String(pageSizeVal())}
							onValueChange={handlePageSizeChange}
							options={pageSizeSelectOptions()}
						/>
					</div>
				</Show>
			</div>
			{/* All nav buttons in one gap-1 cluster: «first ‹prev [pages] next› last» */}
			<Show when={showNav()}>
				<div class={cn('flex items-center gap-1', (hasInfo() || hasPageSize()) && 'ml-auto')}>
					<Show when={local.showFirstLast}>
						<Button
							type="button"
							variant="outlined"
							size="sm"
							iconOnly
							icon={icons.chevronsLeft({ class: 'h-4 w-4', 'aria-hidden': 'true' })}
							aria-label="First page"
							disabled={!canPrev()}
							onClick={() => local.onPageChange(1)}
							class="rounded-lg"
						/>
					</Show>
					<Button
						type="button"
						variant="outlined"
						size="sm"
						iconOnly
						icon={icons.chevronLeft({ class: 'h-4 w-4', 'aria-hidden': 'true' })}
						aria-label="Previous page"
						disabled={!canPrev()}
						onClick={() => local.onPageChange(page() - 1)}
						class="rounded-lg"
					/>
					<Show when={showPageNumbers()}>
						<For each={pageRange()}>
							{(p) =>
								typeof p === 'number' ? (
									<Button
										type="button"
										variant={p === page() ? 'primary' : 'outlined'}
										size="sm"
										aria-label={p === page() ? `Page ${p}` : `Go to page ${p}`}
										aria-current={p === page() ? 'page' : undefined}
										onClick={() => local.onPageChange(p)}
										class="min-w-[2.25rem] rounded-lg"
										data-page-btns
									>
										{p}
									</Button>
								) : (
									<span class="px-1 text-ink-400" aria-hidden="true">
										…
									</span>
								)
							}
						</For>
					</Show>
					<Button
						type="button"
						variant="outlined"
						size="sm"
						iconOnly
						icon={icons.chevronRight({ class: 'h-4 w-4', 'aria-hidden': 'true' })}
						aria-label="Next page"
						disabled={!canNext()}
						onClick={() => local.onPageChange(page() + 1)}
						class="rounded-lg"
					/>
					<Show when={local.showFirstLast}>
						<Button
							type="button"
							variant="outlined"
							size="sm"
							iconOnly
							icon={icons.chevronsRight({ class: 'h-4 w-4', 'aria-hidden': 'true' })}
							aria-label="Last page"
							disabled={!canNext()}
							onClick={() => local.onPageChange(total())}
							class="rounded-lg"
						/>
					</Show>
				</div>
			</Show>
		</nav>
	)
}
