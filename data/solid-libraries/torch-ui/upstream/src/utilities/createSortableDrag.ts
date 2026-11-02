import { createSignal, createMemo, onCleanup } from 'solid-js'

export interface SortableDragItem {
	id: string
}

export interface SortableDragState {
	/** The id of the item currently being dragged, or null */
	activeId: () => string | null
	/** The id of the item currently being hovered over, or null */
	overId: () => string | null
	/**
	 * For each item id, returns the CSS transform string to apply during drag.
	 * Handles both vertical lists and wrapping 2D grids.
	 */
	getTransform: (id: string) => string
	/** Whether a drag is currently in progress */
	isDragging: () => boolean
	/** Bind to the grip handle element's onPointerDown */
	handlePointerDown: (id: string, e: PointerEvent) => void
}

export interface CreateSortableDragOptions<T extends SortableDragItem> {
	/** Reactive accessor returning the current ordered list */
	items: () => T[]
	/** Called with the new id order when a drag is committed */
	onReorder: (ids: string[]) => void
}

interface ItemRect {
	id: string
	rect: DOMRect
}

export function createSortableDrag<T extends SortableDragItem>(
	options: CreateSortableDragOptions<T>,
): SortableDragState {
	const [activeId, setActiveId] = createSignal<string | null>(null)
	const [overId, setOverId] = createSignal<string | null>(null)

	let itemRects: ItemRect[] = []
	let containerEl: HTMLElement | null = null
	let cleanupListeners: (() => void) | null = null

	const isDragging = () => activeId() !== null

	function getItemEls(): { id: string; el: HTMLElement }[] {
		if (!containerEl) return []
		return Array.from(
			containerEl.querySelectorAll<HTMLElement>('[data-sortable-id]'),
		).map((el) => ({ id: el.dataset.sortableId!, el }))
	}

	function measureRects() {
		itemRects = getItemEls().map(({ id, el }) => ({
			id,
			rect: el.getBoundingClientRect(),
		}))
	}

	function hitTest(x: number, y: number): string | null {
		// Exact rect hit
		for (const { id, rect } of itemRects) {
			if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
				return id
			}
		}
		// Fall back to closest center
		let closest: string | null = null
		let closestDist = Infinity
		for (const { id, rect } of itemRects) {
			const cx = rect.left + rect.width / 2
			const cy = rect.top + rect.height / 2
			const dist = Math.hypot(x - cx, y - cy)
			if (dist < closestDist) {
				closestDist = dist
				closest = id
			}
		}
		return closest
	}

	/**
	 * Compute the translate delta for each item if dragId were moved to dropId's
	 * position in document order. Each displaced item gets a transform equal to
	 * (its original screen position) - (the position it would occupy after reorder),
	 * making it appear to slide into its new slot.
	 */
	function computeDisplacements(
		dragId: string,
		dropId: string,
	): Map<string, { x: number; y: number }> {
		const result = new Map<string, { x: number; y: number }>()
		const items = options.items()
		const dragIndex = items.findIndex((i) => i.id === dragId)
		const dropIndex = items.findIndex((i) => i.id === dropId)
		if (dragIndex === -1 || dropIndex === -1) return result

		// Build reordered id array
		const reordered = items.map((i) => i.id)
		reordered.splice(dropIndex, 0, ...reordered.splice(dragIndex, 1))

		const rectById = new Map(itemRects.map((r) => [r.id, r.rect]))

		for (let newIdx = 0; newIdx < reordered.length; newIdx++) {
			const id = reordered[newIdx]
			if (id === dragId) continue

			const origIdx = items.findIndex((i) => i.id === id)
			if (origIdx === newIdx) continue // didn't move

			const originalRect = rectById.get(id)
			// The slot this item needs to move into is the one currently
			// occupied by whichever item was at newIdx before the reorder
			const targetItemId = items[newIdx]?.id
			const targetRect = targetItemId ? rectById.get(targetItemId) : undefined

			if (!originalRect || !targetRect) continue

			result.set(id, {
				x: targetRect.left - originalRect.left,
				y: targetRect.top - originalRect.top,
			})
		}

		return result
	}

	/** Recomputed once whenever activeId or overId changes — O(N) per drag event, not O(N²). */
	const displacementMap = createMemo<Map<string, { x: number; y: number }>>(() => {
		const dragId = activeId()
		const hoverOverId = overId()
		if (!dragId || !hoverOverId || dragId === hoverOverId) return new Map()
		return computeDisplacements(dragId, hoverOverId)
	})

	function getTransform(id: string): string {
		if (id === activeId()) return ''
		const d = displacementMap().get(id)
		if (!d) return ''
		return `translate(${d.x}px, ${d.y}px)`
	}

	function onPointerMove(e: PointerEvent) {
		const hit = hitTest(e.clientX, e.clientY)
		if (hit) setOverId(hit)
	}

	function onPointerUp() {
		const dragId = activeId()
		const dropId = overId()

		cleanupListeners?.()
		cleanupListeners = null

		if (dragId && dropId && dragId !== dropId) {
			const items = options.items()
			const from = items.findIndex((i) => i.id === dragId)
			const to = items.findIndex((i) => i.id === dropId)
			if (from !== -1 && to !== -1) {
				const next = items.map((i) => i.id)
				next.splice(to, 0, ...next.splice(from, 1))
				options.onReorder(next)
			}
		}

		setActiveId(null)
		setOverId(null)
		itemRects = []
	}

	function onPointerCancel() {
		cleanupListeners?.()
		cleanupListeners = null
		setActiveId(null)
		setOverId(null)
		itemRects = []
	}

	function handlePointerDown(id: string, e: PointerEvent) {
		if (e.button !== 0) return
		e.preventDefault()

		containerEl = (e.currentTarget as HTMLElement).closest(
			'[data-sortable-container]',
		) as HTMLElement | null

		measureRects()
		setActiveId(id)
		setOverId(id)

		const move = (e: PointerEvent) => onPointerMove(e)
		const up = () => onPointerUp()
		const cancel = () => onPointerCancel()

		document.addEventListener('pointermove', move)
		document.addEventListener('pointerup', up)
		document.addEventListener('pointercancel', cancel)

		cleanupListeners = () => {
			document.removeEventListener('pointermove', move)
			document.removeEventListener('pointerup', up)
			document.removeEventListener('pointercancel', cancel)
		}
	}

	onCleanup(() => cleanupListeners?.())

	return { activeId, overId, getTransform, isDragging, handlePointerDown }
}