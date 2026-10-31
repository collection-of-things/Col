import { createContext, createSignal, useContext, splitProps, Show, type JSX } from 'solid-js'
import { cn } from '../../utilities/classNames'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BoardMoveEvent {
	/** ID of the card that was moved. */
	cardId: string
	/** Column the card came from. */
	fromColumnId: string
	/** Column the card was dropped onto. */
	toColumnId: string
	/**
	 * The card the dragged card was dropped near.
	 * Null means dropped at the end of the column with no adjacent card.
	 */
	nearCardId: string | null
	/** Whether the card was dropped before or after `nearCardId`. */
	nearPosition: 'before' | 'after' | null
}

export interface BoardProps {
	/** Called when a card is dropped (cross-column move or same-column reorder). */
	onCardMove?: (event: BoardMoveEvent) => void
	class?: string
	children?: JSX.Element
}

export interface BoardColumnProps {
	/** Unique identifier for this column — used in `BoardMoveEvent`. */
	id: string
	title: string
	/** Badge count shown in the column header. */
	count?: number
	/** CSS color value for the indicator dot. */
	color?: string
	class?: string
	children?: JSX.Element
}

export interface BoardCardProps {
	/** Unique identifier for this card — used in `BoardMoveEvent`. */
	id: string
	/** Prevents drag interaction when true. */
	disabled?: boolean
	class?: string
	children?: JSX.Element
}

interface AdjacentCards { prev: string | null; next: string | null }

interface BoardCtx {
	draggingCardId: () => string | null
	draggingFromColumnId: () => string | null
	draggingCardHeight: () => number
	draggingAdjacent: () => AdjacentCards
	overColumnId: () => string | null
	overCardId: () => string | null
	overCardPosition: () => 'before' | 'after' | null
	setDraggingCardId: (id: string | null) => void
	setDraggingFromColumnId: (id: string | null) => void
	setDraggingCardHeight: (h: number) => void
	setDraggingAdjacent: (a: AdjacentCards) => void
	setOverColumnId: (id: string | null) => void
	setOverCardId: (id: string | null) => void
	setOverCardPosition: (pos: 'before' | 'after' | null) => void
	onCardMove?: (event: BoardMoveEvent) => void
}

const BoardContext = createContext<BoardCtx>()

function useBoardCtx() {
	const ctx = useContext(BoardContext)
	if (!ctx) throw new Error('Board.Column / Board.Card must be used inside <Board>')
	return ctx
}

const ColumnContext = createContext<{ columnId: string }>()

function BoardRoot(props: BoardProps) {
	const [local, rest] = splitProps(props, ['onCardMove', 'class', 'children'])
	const [draggingCardId,       setDraggingCardId]       = createSignal<string | null>(null)
	const [draggingFromColumnId, setDraggingFromColumnId] = createSignal<string | null>(null)
	const [draggingCardHeight,   setDraggingCardHeight]   = createSignal<number>(60)
	const [draggingAdjacent,     setDraggingAdjacent]     = createSignal<AdjacentCards>({ prev: null, next: null })
	const [overColumnId,         setOverColumnId]         = createSignal<string | null>(null)
	const [overCardId,           setOverCardId]           = createSignal<string | null>(null)
	const [overCardPosition,     setOverCardPosition]     = createSignal<'before' | 'after' | null>(null)

	return (
		<BoardContext.Provider value={{
			draggingCardId,
			draggingFromColumnId,
			draggingCardHeight,
			draggingAdjacent,
			overColumnId,
			overCardId,
			overCardPosition,
			setDraggingCardId,
			setDraggingFromColumnId,
			setDraggingCardHeight,
			setDraggingAdjacent,
			setOverColumnId,
			setOverCardId,
			setOverCardPosition,
			onCardMove: local.onCardMove,
		}}>
			<div
				class={cn('flex gap-4 pb-4 items-start', local.class)}
				{...rest}
			>
				{local.children}
			</div>
		</BoardContext.Provider>
	)
}

function BoardColumn(props: BoardColumnProps) {
	const [local, rest] = splitProps(props, ['id', 'title', 'count', 'color', 'class', 'children'])
	const ctx = useBoardCtx()

	const isOver         = () => ctx.overColumnId() === local.id
	const isDraggingFrom = () => ctx.draggingFromColumnId() === local.id

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault()
		ctx.setOverColumnId(local.id)
	}

	const handleDragLeave = (e: DragEvent) => {
		const related = e.relatedTarget as HTMLElement | null
		if (related && (e.currentTarget as HTMLElement).contains(related)) return
		if (ctx.overColumnId() === local.id) {
			ctx.setOverColumnId(null)
			ctx.setOverCardId(null)
			ctx.setOverCardPosition(null)
		}
	}

	const handleDrop = (e: DragEvent) => {
		e.preventDefault()
		const cardId       = ctx.draggingCardId()
		const fromColumnId = ctx.draggingFromColumnId()
		if (!cardId || !fromColumnId) return

		const nearCardId   = ctx.overCardId() !== cardId ? ctx.overCardId() : null
		const nearPosition = nearCardId ? ctx.overCardPosition() : null

		// Fire for cross-column moves AND same-column reorders
		if (fromColumnId !== local.id || nearCardId) {
			ctx.onCardMove?.({ cardId, fromColumnId, toColumnId: local.id, nearCardId, nearPosition })
		}

		ctx.setOverColumnId(null)
		ctx.setOverCardId(null)
		ctx.setOverCardPosition(null)
	}

	return (
		<ColumnContext.Provider value={{ columnId: local.id }}>
			<div
				class={cn(
					'flex min-h-32 min-w-40 flex-1 flex-col rounded-xl border border-surface-border bg-surface-raised transition-colors',
					isOver() && !isDraggingFrom() && 'border-primary-400 bg-primary-50/20',
					local.class
				)}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				{...rest}
			>
				{/* Header */}
				<div class="flex items-center justify-between border-b border-surface-border/60 px-4 py-3">
					<div class="flex items-center gap-2">
						<Show when={local.color}>
							<span class="h-2 w-2 shrink-0 rounded-full" style={{ background: local.color }} />
						</Show>
						<span class="text-sm font-semibold text-ink-900">{local.title}</span>
					</div>
					<Show when={local.count !== undefined}>
						<span class="flex h-5 min-w-5 items-center justify-center rounded-full bg-surface-overlay px-1.5 text-xs font-medium text-ink-500">
							{local.count}
						</span>
					</Show>
				</div>

				{/* Cards area */}
				<div class="flex flex-1 flex-col p-3">
					{local.children}
				</div>
			</div>
		</ColumnContext.Provider>
	)
}

// ─── Drop zone placeholder ────────────────────────────────────────────────────

function DropZone(props: { height: number }) {
	return (
		<div
			class="mb-2 rounded-lg border-2 border-dashed border-primary-400 bg-primary-50/25 transition-all duration-150"
			style={{ height: `${props.height}px` }}
		/>
	)
}

// ─── Board.Card ───────────────────────────────────────────────────────────────

function BoardCard(props: BoardCardProps) {
	const [local, rest] = splitProps(props, ['id', 'disabled', 'class', 'children'])
	const ctx       = useBoardCtx()
	const columnCtx = useContext(ColumnContext)

	const isDragging   = () => ctx.draggingCardId() === local.id
	// Suppress drop zone when this position is no-op (card is already adjacent to dragged card)
	const isOverBefore = () =>
		ctx.overCardId() === local.id &&
		ctx.overCardPosition() === 'before' &&
		!isDragging() &&
		ctx.draggingAdjacent().next !== local.id
	const isOverAfter  = () =>
		ctx.overCardId() === local.id &&
		ctx.overCardPosition() === 'after' &&
		!isDragging() &&
		ctx.draggingAdjacent().prev !== local.id

	const handleDragStart = (e: DragEvent) => {
		if (local.disabled) { e.preventDefault(); return }
		e.dataTransfer?.setData('text/plain', local.id)
		const el = e.currentTarget as HTMLElement
		ctx.setDraggingCardHeight(el.offsetHeight)
		// Find adjacent card IDs via data attribute on sibling wrappers
		const wrapper = el.closest('[data-board-card]') as HTMLElement | null
		const area = wrapper?.parentElement
		if (area) {
			const wrappers = Array.from(area.querySelectorAll<HTMLElement>(':scope > [data-board-card]'))
			const idx = wrappers.indexOf(wrapper!)
			ctx.setDraggingAdjacent({
				prev: idx > 0 ? (wrappers[idx - 1].dataset.boardCard ?? null) : null,
				next: idx < wrappers.length - 1 ? (wrappers[idx + 1].dataset.boardCard ?? null) : null,
			})
		}
		ctx.setDraggingCardId(local.id)
		ctx.setDraggingFromColumnId(columnCtx?.columnId ?? null)
	}

	const handleDragEnd = () => {
		ctx.setDraggingCardId(null)
		ctx.setDraggingFromColumnId(null)
		ctx.setOverColumnId(null)
		ctx.setOverCardId(null)
		ctx.setOverCardPosition(null)
	}

	const handleDragOver = (e: DragEvent) => {
		e.stopPropagation()
		e.preventDefault()
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
		const pos: 'before' | 'after' = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after'
		ctx.setOverColumnId(columnCtx?.columnId ?? null)
		ctx.setOverCardId(local.id)
		ctx.setOverCardPosition(pos)
	}

	return (
		<div class="flex flex-col" data-board-card={local.id}>
			<Show when={isOverBefore()}>
				<DropZone height={ctx.draggingCardHeight()} />
			</Show>
			<div
				draggable={!local.disabled}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				onDragOver={handleDragOver}
				class={cn(
					'mb-2 rounded-lg border border-surface-border bg-surface-base shadow-sm transition-all duration-150',
					!local.disabled && 'cursor-grab select-none active:cursor-grabbing hover:shadow-md',
					isDragging() && 'opacity-40 scale-[0.97]',
					local.class
				)}
				{...rest}
			>
				{local.children}
			</div>
			<Show when={isOverAfter()}>
				<DropZone height={ctx.draggingCardHeight()} />
			</Show>
		</div>
	)
}

type BoardComponent = typeof BoardRoot & {
	Column: typeof BoardColumn
	Card:   typeof BoardCard
}

export const Board: BoardComponent = Object.assign(BoardRoot, {
	Column: BoardColumn,
	Card:   BoardCard,
})
