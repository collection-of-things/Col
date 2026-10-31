import { createMemo, createSignal, createEffect, For, Show, onCleanup } from 'solid-js'
import { Portal } from 'solid-js/web'
import { Input } from '../forms/Input'
import { Button } from '../actions/Button'
import { useIcons } from '../../icons'
import { createSortableDrag } from '../../utilities/createSortableDrag'

export interface ViewCustomizerColumn {
	id: string
	label: string
	visible: boolean
	required?: boolean
}

export interface ViewCustomizerProps {
	viewName: string
	onViewNameChange: (name: string) => void
	columns: ViewCustomizerColumn[]
	onColumnsChange: (columns: ViewCustomizerColumn[]) => void
	/** Full pool of available columns — enables the Add column picker. */
	allColumns?: ViewCustomizerColumn[]
	onSave: () => void
	onCancel: () => void
	saveLabel?: string
	cancelLabel?: string
}

export function ViewCustomizer(props: ViewCustomizerProps) {
	const icons = useIcons()
	const [addOpen, setAddOpen] = createSignal(false)
	const [dropdownPos, setDropdownPos] = createSignal<{ top: number; left: number; width: number } | null>(null)
	let addButtonRef: HTMLButtonElement | undefined

	createEffect(() => {
		if (!addOpen()) { setDropdownPos(null); return }
		let rafId: number
		const track = () => {
			if (addButtonRef) {
				const r = addButtonRef.getBoundingClientRect()
				setDropdownPos({ top: r.bottom + 4, left: r.left, width: r.width })
			}
			rafId = requestAnimationFrame(track)
		}
		rafId = requestAnimationFrame(track)
		onCleanup(() => cancelAnimationFrame(rafId))
	})

	const availableToAdd = createMemo(() => {
		if (!props.allColumns) return []
		const activeIds = new Set(props.columns.map((c) => c.id))
		return props.allColumns.filter((c) => !activeIds.has(c.id))
	})

	const drag = createSortableDrag({
		items: () => props.columns,
		onReorder: (ids) => {
			const map = new Map(props.columns.map((c) => [c.id, c]))
			props.onColumnsChange(ids.map((id) => map.get(id)!).filter(Boolean))
		},
	})

	let pointerX = 0
	let pointerY = 0
	let overlayW = 0
	let overlayH = 0

	const removeColumn = (id: string) => {
		props.onColumnsChange(props.columns.filter((c) => c.id !== id))
	}

	const addColumn = (id: string) => {
		const col = props.allColumns?.find((c) => c.id === id)
		if (!col) return
		props.onColumnsChange([...props.columns, { ...col, visible: true }])
		setAddOpen(false)
	}

	return (
		<div class="flex flex-col gap-6">
			<Input
				label="View name"
				value={props.viewName}
				onValueChange={props.onViewNameChange}
				placeholder="e.g. My Custom View"
			/>

			<div>
				<div class="mb-2 flex items-center justify-between">
					<p class="text-sm font-medium text-ink-900">Columns</p>
					<p class="text-xs text-ink-500">{props.columns.length} column{props.columns.length !== 1 ? 's' : ''}</p>
				</div>
				<div data-sortable-container class="divide-y divide-surface-border rounded-lg border border-surface-border overflow-hidden">
					<For each={props.columns}>
						{(col) => {
							const isActive = () => drag.activeId() === col.id
							return (
								<div
									data-sortable-id={col.id}
									class="flex items-center gap-2 px-3 py-2.5 bg-surface-base"
									style={{
										transform: drag.getTransform(col.id) || undefined,
										transition: drag.isDragging() && !isActive() ? 'transform 150ms ease' : undefined,
										opacity: isActive() && drag.isDragging() ? '0' : undefined,
									}}
								>
									<button
										type="button"
										class={`shrink-0 rounded p-1 text-ink-400 hover:bg-surface-overlay touch-none ${drag.isDragging() ? 'cursor-grabbing' : 'cursor-grab'}`}
										aria-label={`Drag ${col.label}`}
										onPointerDown={(e) => {
											pointerX = e.clientX
											pointerY = e.clientY
											const row = (e.currentTarget as HTMLElement).closest('[data-sortable-id]') as HTMLElement | null
											if (row) { const r = row.getBoundingClientRect(); overlayW = r.width; overlayH = r.height }
											drag.handlePointerDown(col.id, e)
										}}
									>
										{icons.dragHandle({ class: 'h-3.5 w-3.5', 'aria-hidden': 'true' })}
									</button>
									<span class="flex-1 text-sm font-medium text-ink-900">{col.label}</span>
									<Show when={col.required}>
										<span class="shrink-0 text-xs text-ink-400">Required</span>
									</Show>
									<Show when={!col.required}>
										<button
											type="button"
											onClick={() => removeColumn(col.id)}
											class="shrink-0 rounded p-1 text-ink-400 hover:bg-surface-overlay hover:text-ink-700"
											aria-label={`Remove ${col.label}`}
										>
											{icons.close({ class: 'h-3.5 w-3.5', 'aria-hidden': 'true' })}
										</button>
									</Show>
								</div>
							)
						}}
					</For>
				</div>

				<Show when={drag.activeId()}>
					{(activeId) => {
						const col = () => props.columns.find((c) => c.id === activeId())
						return (
							<Show when={col()}>
								{(resolved) => {
									let el: HTMLDivElement | undefined
									const onMove = (e: PointerEvent) => {
										if (el) el.style.transform = `translate(${e.clientX - 16}px, ${e.clientY - 16}px)`
									}
									const cleanup = () => document.removeEventListener('pointermove', onMove)
									document.addEventListener('pointermove', onMove)
									document.addEventListener('pointerup', cleanup, { once: true })
									document.addEventListener('pointercancel', cleanup, { once: true })
									onCleanup(cleanup)
									return (
										<div
											ref={el}
											class="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-raised px-3 py-2.5 text-sm shadow-lg select-none"
											style={{
												position: 'fixed',
												top: '0',
												left: '0',
												transform: `translate(${pointerX - 16}px, ${pointerY - 16}px)`,
												width: `${overlayW}px`,
												height: `${overlayH}px`,
												'pointer-events': 'none',
												'z-index': '50',
												'will-change': 'transform',
											}}
										>
											{icons.dragHandle({ class: 'h-3.5 w-3.5 shrink-0 text-ink-400', 'aria-hidden': 'true' })}
											<span class="flex-1 font-medium text-ink-900">{resolved().label}</span>
										</div>
									)
								}}
							</Show>
						)
					}}
				</Show>

				<Show when={props.allColumns && availableToAdd().length > 0}>
					<div class="mt-2">
						<button
							ref={addButtonRef}
							type="button"
							onClick={() => setAddOpen((v) => !v)}
							class="flex w-full items-center gap-1.5 rounded-lg border border-dashed border-surface-border px-3 py-2 text-sm text-ink-500 hover:border-primary-400 hover:text-primary-600"
						>
							<span class="text-base leading-none">+</span> Add column
						</button>
						<Show when={dropdownPos()}>
							{(pos) => (
								<Portal>
									<div
										class="overflow-hidden rounded-lg border border-surface-border bg-surface-raised shadow-lg"
										style={{
											position: 'fixed',
											top: `${pos().top}px`,
											left: `${pos().left}px`,
											width: `${pos().width}px`,
											'z-index': '9999',
										}}
									>
										<For each={availableToAdd()}>
											{(col) => (
												<button
													type="button"
													onClick={() => addColumn(col.id)}
													class="flex w-full items-center px-3 py-2 text-sm text-ink-700 hover:bg-surface-overlay"
												>
													{col.label}
												</button>
											)}
										</For>
									</div>
								</Portal>
							)}
						</Show>
					</div>
				</Show>
			</div>

			<div class="flex justify-end gap-2 border-t border-surface-border pt-4">
				<Button variant="outlined" onClick={props.onCancel}>
					{props.cancelLabel ?? 'Cancel'}
				</Button>
				<Button variant="primary" onClick={props.onSave}>
					{props.saveLabel ?? 'Save view'}
				</Button>
			</div>
		</div>
	)
}
