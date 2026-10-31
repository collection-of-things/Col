import { For, Show, createSignal, createEffect, onCleanup } from 'solid-js'
import { Select } from './Select'
import { Input } from './Input'
import { Button } from '../actions/Button'
import { useIcons } from '../../icons'
import { createSortableDrag } from '../../utilities/createSortableDrag'

// ── Types ──────────────────────────────────────────────────────────────────

export type FieldType = 'text' | 'select'

export interface FilterField {
	id: string
	label: string
	type: FieldType
	options?: { value: string; label: string }[]
}

export interface FilterOperator {
	value: string
	label: string
}

export type FilterLogic = 'and' | 'or'

export interface FilterRule {
	type: 'rule'
	id: string
	fieldId: string
	operator: string
	value: string
}

export interface FilterGroup {
	type: 'group'
	id: string
	logic: FilterLogic
	items: (FilterRule | FilterGroup)[]
}

export interface FilterBuilderProps {
	fields: FilterField[]
	getOperators: (field: FilterField | undefined) => FilterOperator[]
	value: FilterGroup
	onValueChange: (group: FilterGroup) => void
}

// ── Helpers ────────────────────────────────────────────────────────────────

let _seq = 0
const uid = (prefix: string) => `${prefix}-${++_seq}`

const [activeCrossDrag, setActiveCrossDrag] = createSignal<{ itemId: string; fromGroupId: string } | null>(null)

export function newGroup(logic: FilterLogic = 'and'): FilterGroup {
	return { type: 'group', id: uid('g'), logic, items: [] }
}

export function newRule(fields: FilterField[], getOperators: FilterBuilderProps['getOperators']): FilterRule {
	const first = fields[0]
	const ops = getOperators(first)
	return { type: 'rule', id: uid('r'), fieldId: first?.id ?? '', operator: ops[0]?.value ?? 'equals', value: '' }
}

function updateGroupItems(
	root: FilterGroup,
	groupId: string,
	updater: (items: (FilterRule | FilterGroup)[]) => (FilterRule | FilterGroup)[],
): FilterGroup {
	if (root.id === groupId) return { ...root, items: updater(root.items) }
	return {
		...root,
		items: root.items.map((item) =>
			item.type === 'group' ? updateGroupItems(item, groupId, updater) : item,
		),
	}
}

function updateRule(root: FilterGroup, ruleId: string, patch: Partial<FilterRule>): FilterGroup {
	return {
		...root,
		items: root.items.map((item) => {
			if (item.type === 'rule' && item.id === ruleId) return { ...item, ...patch }
			if (item.type === 'group') return updateRule(item, ruleId, patch)
			return item
		}),
	}
}

function extractItem(root: FilterGroup, itemId: string): { root: FilterGroup; item: FilterRule | FilterGroup | null } {
	for (const item of root.items) {
		if (item.id === itemId) {
			return { root: { ...root, items: root.items.filter((i) => i.id !== itemId) }, item }
		}
		if (item.type === 'group') {
			const result = extractItem(item, itemId)
			if (result.item) {
				return {
					root: { ...root, items: root.items.map((i) => (i.id === item.id ? result.root : i)) },
					item: result.item,
				}
			}
		}
	}
	return { root, item: null }
}

function insertIntoGroup(root: FilterGroup, groupId: string, item: FilterRule | FilterGroup): FilterGroup {
	if (root.id === groupId) return { ...root, items: [...root.items, item] }
	return {
		...root,
		items: root.items.map((i) => (i.type === 'group' ? insertIntoGroup(i, groupId, item) : i)),
	}
}

function setGroupLogic(root: FilterGroup, groupId: string, logic: FilterLogic): FilterGroup {
	if (root.id === groupId) return { ...root, logic }
	return {
		...root,
		items: root.items.map((item) =>
			item.type === 'group' ? setGroupLogic(item, groupId, logic) : item,
		),
	}
}

// ── Drag overlay ───────────────────────────────────────────────────────────

function FilterDragOverlay(props: { label: string; startX: number; startY: number; width: number; height: number }) {
	const icons = useIcons()
	let el: HTMLDivElement | undefined

	const onMove = (e: PointerEvent) => { if (el) el.style.transform = `translate(${e.clientX - 16}px, ${e.clientY - 16}px)` }
	const cleanup = () => document.removeEventListener('pointermove', onMove)
	document.addEventListener('pointermove', onMove)
	document.addEventListener('pointerup', cleanup, { once: true })
	document.addEventListener('pointercancel', cleanup, { once: true })
	onCleanup(cleanup)

	return (
		<div
			ref={el!}
			style={{
				position: 'fixed', top: '0', left: '0',
				transform: `translate(${props.startX - 16}px, ${props.startY - 16}px)`,
				width: props.width ? `${props.width}px` : undefined,
				height: props.height ? `${props.height}px` : undefined,
				'pointer-events': 'none', 'z-index': '50', 'will-change': 'transform',
			}}
			class="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-raised px-3 py-3 text-sm shadow-xl select-none text-ink-700"
		>
			{icons.dragHandle({ class: 'h-4 w-4 shrink-0 text-ink-400', 'aria-hidden': 'true' })}
			<span class="truncate">{props.label}</span>
		</div>
	)
}

// ── Rule row ───────────────────────────────────────────────────────────────

interface RuleRowProps {
	rule: FilterRule
	fields: FilterField[]
	getOperators: FilterBuilderProps['getOperators']
	onRuleChange: (patch: Partial<FilterRule>) => void
	onRemove: () => void
	onDragHandle: (e: PointerEvent) => void
	isDraggingActive: boolean
}

function RuleRow(props: RuleRowProps) {
	const icons = useIcons()
	const field = () => props.fields.find((f) => f.id === props.rule.fieldId)
	const operators = () => props.getOperators(field())
	const needsValue = () => !['is_empty', 'is_not_empty'].includes(props.rule.operator)
	const isSelect = () => field()?.type === 'select'

	const [localText, setLocalText] = createSignal(props.rule.value)
	createEffect(() => setLocalText(props.rule.value))

	return (
		<div class="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-raised p-3">
			<button
				type="button"
				class={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-ink-400 hover:bg-surface-overlay touch-none self-center ${props.isDraggingActive ? 'cursor-grabbing' : 'cursor-grab'}`}
				aria-label="Drag to reorder"
				onPointerDown={(e) => props.onDragHandle(e)}
			>
				{icons.dragHandle({ class: 'h-4 w-4', 'aria-hidden': 'true' })}
			</button>
			<div class="flex min-w-0 flex-1 flex-wrap items-end gap-2">
				<div class="min-w-[140px] flex-1">
					<Select
						label="Field"
						size="sm"
						options={props.fields.map((f) => ({ value: f.id, label: f.label }))}
						value={props.rule.fieldId}
						onValueChange={(v) => {
							const newField = props.fields.find((f) => f.id === v)
							const ops = props.getOperators(newField)
							props.onRuleChange({ fieldId: v, operator: ops[0]?.value ?? 'equals', value: '' })
						}}
						placeholder="Select field…"
					/>
				</div>
				<div class="min-w-[140px] flex-1">
					<Select
						label="Operator"
						size="sm"
						options={operators()}
						value={props.rule.operator}
						onValueChange={(v) => props.onRuleChange({ operator: v })}
					/>
				</div>
				<Show when={needsValue() && props.rule.fieldId}>
					<div class="min-w-[140px] flex-1">
						<Show
							when={isSelect()}
							fallback={
								<div onFocusOut={() => props.onRuleChange({ value: localText() })}>
									<Input
										label="Value"
										size="sm"
										value={localText()}
										onValueChange={setLocalText}
										placeholder="Enter value…"
									/>
								</div>
							}
						>
							<Select
								label="Value"
								size="sm"
								options={field()?.options ?? []}
								value={props.rule.value}
								onValueChange={(v) => props.onRuleChange({ value: v })}
								placeholder="Select value…"
							/>
						</Show>
					</div>
				</Show>
			</div>
			<button
				type="button"
				onClick={props.onRemove}
				class="mb-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-400 hover:bg-surface-overlay hover:text-ink-700"
				aria-label="Remove condition"
			>
				{icons.close({ class: 'h-4 w-4', 'aria-hidden': 'true' })}
			</button>
		</div>
	)
}

// ── Group block ────────────────────────────────────────────────────────────

/** Inline SVG for group/layers icon (no lucide-solid dep in torch-ui). */
function LayersIcon(props: { class?: string }) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={props.class} aria-hidden="true">
			<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
			<path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
			<path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
		</svg>
	)
}

interface GroupBlockProps {
	group: FilterGroup
	fields: FilterField[]
	getOperators: FilterBuilderProps['getOperators']
	depth: number
	onGroupChange: (updated: FilterGroup) => void
	onRemoveSelf?: () => void
	onDragHandle?: (e: PointerEvent) => void
	isDraggingActive?: boolean
	onTransferItem?: (itemId: string, toGroupId: string) => void
}

function FilterGroupBlock(props: GroupBlockProps) {
	const icons = useIcons()
	const hasItems = () => props.group.items.length > 0
	const showLogic = () => props.group.items.length > 1

	let overlayStartX = 0, overlayStartY = 0, overlayWidth = 0, overlayHeight = 0

	const [dropHover, setDropHover] = createSignal(false)
	const isCrossDropTarget = () => {
		const cd = activeCrossDrag()
		return cd !== null && cd.fromGroupId !== props.group.id
	}

	const drag = createSortableDrag({
		items: () => props.group.items,
		onReorder: (ids) => {
			const map = new Map(props.group.items.map((i) => [i.id, i]))
			const reordered = ids.map((id) => map.get(id)).filter(Boolean) as (FilterRule | FilterGroup)[]
			props.onGroupChange({ ...props.group, items: reordered })
		},
	})

	const addRule = () => {
		const rule = newRule(props.fields, props.getOperators)
		props.onGroupChange(updateGroupItems(props.group, props.group.id, (items) => [...items, rule]))
	}

	const addSubGroup = () => {
		const sub = newGroup('and')
		props.onGroupChange(updateGroupItems(props.group, props.group.id, (items) => [...items, sub]))
	}

	const removeItem = (id: string) => {
		props.onGroupChange(updateGroupItems(props.group, props.group.id, (items) => items.filter((i) => i.id !== id)))
	}

	const toggleLogic = () => {
		props.onGroupChange(setGroupLogic(props.group, props.group.id, props.group.logic === 'and' ? 'or' : 'and'))
	}

	const handleRuleChange = (ruleId: string, patch: Partial<FilterRule>) => {
		props.onGroupChange(updateRule(props.group, ruleId, patch))
	}

	const handleSubGroupChange = (updated: FilterGroup) => {
		props.onGroupChange({ ...props.group, items: props.group.items.map((i) => (i.id === updated.id ? updated : i)) })
	}

	const isNested = () => props.depth > 0

	return (
		<div class={isNested() ? 'rounded-lg border border-surface-border bg-surface-dim/30 p-3 space-y-2' : 'space-y-2'}>
			<Show when={isNested()}>
				<div class="flex items-center gap-1 mb-1">
					<button
						type="button"
						class={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-ink-400 hover:bg-surface-overlay touch-none ${drag.isDragging() ? 'cursor-grabbing' : 'cursor-grab'}`}
						aria-label="Drag group"
						onPointerDown={(e) => props.onDragHandle?.(e)}
					>
						{icons.dragHandle({ class: 'h-3.5 w-3.5', 'aria-hidden': 'true' })}
					</button>
					<span class="flex-1 text-xs font-medium text-ink-500 uppercase tracking-wide">Group</span>
					<button
						type="button"
						onClick={props.onRemoveSelf}
						class="inline-flex h-6 w-6 items-center justify-center rounded text-ink-400 hover:bg-surface-overlay hover:text-ink-700"
						aria-label="Remove group"
					>
						{icons.close({ class: 'h-3.5 w-3.5', 'aria-hidden': 'true' })}
					</button>
				</div>
			</Show>

			<Show when={showLogic()}>
				<div class="flex items-center gap-2">
					<span class="text-sm text-ink-500">Match</span>
					<button
						type="button"
						onClick={toggleLogic}
						class="inline-flex items-center gap-1.5 rounded-lg border border-surface-border bg-surface-raised px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-surface-overlay"
					>
						{props.group.logic === 'and' ? 'All' : 'Any'}
						{icons.refresh({ class: 'h-3 w-3 text-ink-400', 'aria-hidden': 'true' })}
					</button>
					<span class="text-sm text-ink-500">of the following</span>
				</div>
			</Show>

			<div data-sortable-container class="space-y-2">
				<For each={props.group.items}>
					{(item) => {
						const isActive = () => drag.activeId() === item.id
						const transform = () => item.type === 'group' && activeCrossDrag() ? '' : drag.getTransform(item.id)
						const startDrag = (e: PointerEvent) => {
							overlayStartX = e.clientX; overlayStartY = e.clientY
							const row = (e.target as HTMLElement).closest<HTMLElement>('[data-sortable-id]')
							if (row) { const r = row.getBoundingClientRect(); overlayWidth = r.width; overlayHeight = r.height }
							setActiveCrossDrag({ itemId: item.id, fromGroupId: props.group.id })
							const clearCross = () => setActiveCrossDrag(null)
							document.addEventListener('pointerup', clearCross, { once: true })
							document.addEventListener('pointercancel', clearCross, { once: true })
							drag.handlePointerDown(item.id, e)
						}
						return (
							<div
								data-sortable-id={item.id}
								style={{
									transform: transform() || undefined,
									transition: drag.isDragging() && !isActive() ? 'transform 200ms ease' : undefined,
									opacity: isActive() && drag.isDragging() ? '0.3' : undefined,
									'pointer-events': isActive() && drag.isDragging() ? 'none' : undefined,
								}}
							>
								<Show
									when={item.type === 'rule'}
									fallback={
										<FilterGroupBlock
											group={item as FilterGroup}
											fields={props.fields}
											getOperators={props.getOperators}
											depth={props.depth + 1}
											onGroupChange={handleSubGroupChange}
											onRemoveSelf={() => removeItem(item.id)}
											onDragHandle={startDrag}
											isDraggingActive={drag.isDragging()}
											onTransferItem={props.onTransferItem}
										/>
									}
								>
									<RuleRow
										rule={item as FilterRule}
										fields={props.fields}
										getOperators={props.getOperators}
										onRuleChange={(patch) => handleRuleChange(item.id, patch)}
										onRemove={() => removeItem(item.id)}
										onDragHandle={startDrag}
										isDraggingActive={drag.isDragging()}
									/>
								</Show>
							</div>
						)
					}}
				</For>
			</div>

			<Show when={isCrossDropTarget()}>
				<div
					class={`rounded-lg border-2 border-dashed px-3 py-4 text-center text-sm transition-colors cursor-copy ${dropHover() ? 'border-primary-400 bg-primary-50/20 text-primary-600' : 'border-surface-border text-ink-400'}`}
					onPointerEnter={() => setDropHover(true)}
					onPointerLeave={() => setDropHover(false)}
					onPointerUp={() => {
						const cd = activeCrossDrag()
						if (cd) props.onTransferItem?.(cd.itemId, props.group.id)
						setDropHover(false)
					}}
				>
					Drop into this group
				</div>
			</Show>

			<Show when={drag.activeId()}>
				{(activeId) => {
					const found = () => props.group.items.find((i) => i.id === activeId())
					const label = () => {
						const item = found()
						if (!item) return ''
						if (item.type === 'rule') return props.fields.find((f) => f.id === item.fieldId)?.label ?? item.fieldId
						return `Group (${item.items.length} condition${item.items.length !== 1 ? 's' : ''})`
					}
					return (
						<Show when={found()}>
							<FilterDragOverlay label={label()} startX={overlayStartX} startY={overlayStartY} width={overlayWidth} height={overlayHeight} />
						</Show>
					)
				}}
			</Show>

			<Show
				when={hasItems()}
				fallback={
					<div class="flex flex-col items-center gap-3 rounded-lg border border-dashed border-surface-border py-8 text-center">
						<p class="text-sm text-ink-500">No filters applied. All records are shown.</p>
						<div class="flex items-center gap-2">
							<Button variant="outlined" size="sm" icon={icons.plus({ class: 'h-4 w-4' })} onClick={addRule}>Add condition</Button>
							<Button variant="outlined" size="sm" icon={<LayersIcon class="h-4 w-4" />} onClick={addSubGroup}>Add group</Button>
						</div>
					</div>
				}
			>
				<div class="flex items-center gap-2 pt-1">
					<Button variant="ghost" size="sm" icon={icons.plus({ class: 'h-4 w-4' })} onClick={addRule}>Add condition</Button>
					<Button variant="ghost" size="sm" icon={<LayersIcon class="h-4 w-4" />} onClick={addSubGroup}>Add group</Button>
				</div>
			</Show>
		</div>
	)
}

// ── Utilities ──────────────────────────────────────────────────────────────

function ruleToExpr(rule: FilterRule, fields: FilterField[]): string {
	const fieldLabel = fields.find((f) => f.id === rule.fieldId)?.label ?? rule.fieldId
	const op = rule.operator.replace(/_/g, ' ')
	if (['is_empty', 'is_not_empty'].includes(rule.operator)) return `${fieldLabel} ${op}`
	return `${fieldLabel} ${op} ${rule.value ? `"${rule.value}"` : '…'}`
}

function groupToExpr(group: FilterGroup, fields: FilterField[], depth: number): string {
	if (group.items.length === 0) return '(empty)'
	const sep = ` ${group.logic.toUpperCase()} `
	const parts = group.items.map((item) =>
		item.type === 'rule' ? ruleToExpr(item, fields) : groupToExpr(item, fields, depth + 1),
	)
	const expr = parts.join(sep)
	return depth > 0 ? `(${expr})` : expr
}

export function filterGroupToExpression(group: FilterGroup, fields: FilterField[]): string {
	return groupToExpr(group, fields, 0)
}

// ── Main export ────────────────────────────────────────────────────────────

export function FilterBuilder(props: FilterBuilderProps) {
	const handleTransfer = (itemId: string, toGroupId: string) => {
		const { root, item } = extractItem(props.value, itemId)
		if (!item) return
		props.onValueChange(insertIntoGroup(root, toGroupId, item))
	}

	return (
		<FilterGroupBlock
			group={props.value}
			fields={props.fields}
			getOperators={props.getOperators}
			depth={0}
			onGroupChange={props.onValueChange}
			onTransferItem={handleTransfer}
		/>
	)
}
