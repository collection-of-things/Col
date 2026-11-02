// FilterBuilder.tsx — copy this file into your project.
// This is a recipe, not a @torch-ui/solid export.
// Requires: @torch-ui/solid (Select, Input, Button, useIcons, createSortableDrag), lucide-solid

import { For, Show, createSignal, createEffect, onCleanup } from 'solid-js'
import { Select, Input } from '@torch-ui/solid/forms'
import { Button } from '@torch-ui/solid/actions'
import { useIcons, createSortableDrag } from '@torch-ui/solid'
import X from 'lucide-solid/icons/x';
import Plus from 'lucide-solid/icons/plus';
import RefreshCw from 'lucide-solid/icons/refresh-cw';
import Layers from 'lucide-solid/icons/layers';

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
const uid = (prefix) => prefix + '-' + (++_seq)

export function newGroup(logic = 'and'): FilterGroup {
  return { type: 'group', id: uid('g'), logic, items: [] }
}

export function newRule(fields, getOperators): FilterRule {
  const first = fields[0]
  const ops = getOperators(first)
  return { type: 'rule', id: uid('r'), fieldId: first?.id ?? '', operator: ops[0]?.value ?? 'equals', value: '' }
}

// Immutable tree helpers
function updateGroupItems(root, groupId, updater) {
  if (root.id === groupId) return { ...root, items: updater(root.items) }
  return { ...root, items: root.items.map((item) => item.type === 'group' ? updateGroupItems(item, groupId, updater) : item) }
}

function patchRule(root, ruleId, patch) {
  return { ...root, items: root.items.map((item) => {
    if (item.type === 'rule' && item.id === ruleId) return { ...item, ...patch }
    if (item.type === 'group') return patchRule(item, ruleId, patch)
    return item
  })}
}

function setGroupLogic(root, groupId, logic) {
  if (root.id === groupId) return { ...root, logic }
  return { ...root, items: root.items.map((item) => item.type === 'group' ? setGroupLogic(item, groupId, logic) : item) }
}

// ── RuleRow — one filter condition ─────────────────────────────────────────

function RuleRow(props) {
  const icons = useIcons()
  const field = () => props.fields.find((f) => f.id === props.rule.fieldId)
  const operators = () => props.getOperators(field())
  const needsValue = () => !['is_empty', 'is_not_empty'].includes(props.rule.operator)

  // Local text state avoids remounting on every keystroke — pushes on blur
  const [localText, setLocalText] = createSignal(props.rule.value)
  createEffect(() => setLocalText(props.rule.value))

  return (
    <div class="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-raised p-3">
      <button type="button" onPointerDown={props.onDragHandle}
        class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-ink-400 hover:bg-surface-overlay touch-none cursor-grab">
        {icons.dragHandle({ class: 'h-4 w-4' })}
      </button>
      <div class="flex min-w-0 flex-1 flex-wrap items-end gap-2">
        <div class="min-w-[140px] flex-1">
          <Select label="Field" size="sm"
            options={props.fields.map((f) => ({ value: f.id, label: f.label }))}
            value={props.rule.fieldId}
            onValueChange={(v) => {
              const ops = props.getOperators(props.fields.find((f) => f.id === v))
              props.onRuleChange({ fieldId: v, operator: ops[0]?.value ?? 'equals', value: '' })
            }} />
        </div>
        <div class="min-w-[140px] flex-1">
          <Select label="Operator" size="sm" options={operators()} value={props.rule.operator}
            onValueChange={(v) => props.onRuleChange({ operator: v })} />
        </div>
        <Show when={needsValue() && props.rule.fieldId}>
          <div class="min-w-[140px] flex-1">
            <Show when={field()?.type === 'select'}
              fallback={
                <div onFocusOut={() => props.onRuleChange({ value: localText() })}>
                  <Input label="Value" size="sm" value={localText()} onValueChange={setLocalText} placeholder="Enter value..." />
                </div>
              }>
              <Select label="Value" size="sm" options={field()?.options ?? []} value={props.rule.value}
                onValueChange={(v) => props.onRuleChange({ value: v })} placeholder="Select value..." />
            </Show>
          </div>
        </Show>
      </div>
      <button type="button" onClick={props.onRemove}
        class="mb-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-400 hover:bg-surface-overlay hover:text-ink-700">
        <X class="h-4 w-4" />
      </button>
    </div>
  )
}

// ── FilterGroupBlock — recursive group renderer ────────────────────────────

function FilterGroupBlock(props) {
  const icons = useIcons()
  const hasItems = () => props.group.items.length > 0
  const showLogic = () => props.group.items.length > 1

  const drag = createSortableDrag({
    items: () => props.group.items,
    onReorder: (ids) => {
      const map = new Map(props.group.items.map((i) => [i.id, i]))
      props.onGroupChange({ ...props.group, items: ids.map((id) => map.get(id)).filter(Boolean) })
    },
  })

  const addRule = () => props.onGroupChange(updateGroupItems(props.group, props.group.id, (items) => [...items, newRule(props.fields, props.getOperators)]))
  const addSubGroup = () => props.onGroupChange(updateGroupItems(props.group, props.group.id, (items) => [...items, newGroup('and')]))
  const removeItem = (id) => props.onGroupChange(updateGroupItems(props.group, props.group.id, (items) => items.filter((i) => i.id !== id)))
  const toggleLogic = () => props.onGroupChange(setGroupLogic(props.group, props.group.id, props.group.logic === 'and' ? 'or' : 'and'))

  const isNested = () => props.depth > 0

  return (
    <div class={isNested() ? 'rounded-lg border border-surface-border bg-surface-dim/30 p-3 space-y-2' : 'space-y-2'}>
      <Show when={isNested()}>
        <div class="flex items-center gap-1 mb-1">
          <button type="button" onPointerDown={props.onDragHandle}
            class="inline-flex h-6 w-6 items-center justify-center rounded text-ink-400 hover:bg-surface-overlay touch-none cursor-grab">
            {icons.dragHandle({ class: 'h-3.5 w-3.5' })}
          </button>
          <span class="flex-1 text-xs font-medium text-ink-500 uppercase tracking-wide">Group</span>
          <button type="button" onClick={props.onRemoveSelf}
            class="inline-flex h-6 w-6 items-center justify-center rounded text-ink-400 hover:bg-surface-overlay hover:text-ink-700">
            <X class="h-3.5 w-3.5" />
          </button>
        </div>
      </Show>

      <Show when={showLogic()}>
        <div class="flex items-center gap-2">
          <span class="text-sm text-ink-500">Match</span>
          <button type="button" onClick={toggleLogic}
            class="inline-flex items-center gap-1.5 rounded-lg border border-surface-border bg-surface-raised px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-surface-overlay">
            {props.group.logic === 'and' ? 'All' : 'Any'}
            <RefreshCw class="h-3 w-3 text-ink-400" />
          </button>
          <span class="text-sm text-ink-500">of the following</span>
        </div>
      </Show>

      <div data-sortable-container class="space-y-2">
        <For each={props.group.items}>
          {(item) => {
            const isActive = () => drag.activeId() === item.id
            const startDrag = (e) => { drag.handlePointerDown(item.id, e) }
            return (
              <div data-sortable-id={item.id} style={{
                transform: drag.getTransform(item.id) || undefined,
                transition: drag.isDragging() && !isActive() ? 'transform 200ms ease' : undefined,
                opacity: isActive() && drag.isDragging() ? '0.3' : undefined,
              }}>
                <Show when={item.type === 'rule'}
                  fallback={
                    <FilterGroupBlock group={item} fields={props.fields} getOperators={props.getOperators}
                      depth={props.depth + 1}
                      onGroupChange={(updated) => props.onGroupChange({ ...props.group, items: props.group.items.map((i) => i.id === updated.id ? updated : i) })}
                      onRemoveSelf={() => removeItem(item.id)}
                      onDragHandle={startDrag} />
                  }>
                  <RuleRow rule={item} fields={props.fields} getOperators={props.getOperators}
                    onRuleChange={(patch) => props.onGroupChange(patchRule(props.group, item.id, patch))}
                    onRemove={() => removeItem(item.id)}
                    onDragHandle={startDrag}
                    isDraggingActive={drag.isDragging()} />
                </Show>
              </div>
            )
          }}
        </For>
      </div>

      <Show when={hasItems()}
        fallback={
          <div class="flex flex-col items-center gap-3 rounded-lg border border-dashed border-surface-border py-8 text-center">
            <p class="text-sm text-ink-500">No filters applied. All records are shown.</p>
            <div class="flex items-center gap-2">
              <Button variant="outlined" size="sm" startIcon={<Plus class="h-4 w-4" />} onClick={addRule}>Add condition</Button>
              <Button variant="outlined" size="sm" startIcon={<Layers class="h-4 w-4" />} onClick={addSubGroup}>Add group</Button>
            </div>
          </div>
        }>
        <div class="flex items-center gap-2 pt-1">
          <Button variant="ghost" size="sm" startIcon={<Plus class="h-4 w-4" />} onClick={addRule}>Add condition</Button>
          <Button variant="ghost" size="sm" startIcon={<Layers class="h-4 w-4" />} onClick={addSubGroup}>Add group</Button>
        </div>
      </Show>
    </div>
  )
}

// ── FilterBuilder — main export ────────────────────────────────────────────

export function FilterBuilder(props: FilterBuilderProps) {
  return (
    <FilterGroupBlock group={props.value} fields={props.fields} getOperators={props.getOperators}
      depth={0} onGroupChange={props.onValueChange} />
  )
}
function Example() { const fields=[{id:'name',label:'Name',type:'text'},{id:'status',label:'Status',type:'select',options:[{value:'ready',label:'Ready'}]}]; const operators=()=>[{value:'equals',label:'equals'}]; const [value,setValue]=createSignal(newGroup()); return <FilterBuilder fields={fields} getOperators={operators} value={value()} onValueChange={setValue} /> }
import { render } from "solid-js/web";
export default function mount(target) { return render(() => <Example />, target); }
