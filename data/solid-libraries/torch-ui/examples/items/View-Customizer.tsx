// ViewCustomizer.tsx — copy this file into your project.
// This is a recipe, not a @torch-ui/solid export.
// Requires: @torch-ui/solid (Input, Button, useIcons, createSortableDrag), lucide-solid (X)

import { createMemo, createSignal, createEffect, For, Show, onCleanup } from 'solid-js'
import { Portal } from 'solid-js/web'
import { Input } from '@torch-ui/solid/forms'
import { Button } from '@torch-ui/solid/actions'
import { useIcons, createSortableDrag } from '@torch-ui/solid'
import X from 'lucide-solid/icons/x';

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
  /** Provide allColumns to enable the "Add column" picker. */
  allColumns?: ViewCustomizerColumn[]
  onSave?: () => void
  onCancel?: () => void
  saveLabel?: string
  cancelLabel?: string
}

export function ViewCustomizer(props: ViewCustomizerProps) {
  const icons = useIcons()
  const [addOpen, setAddOpen] = createSignal(false)
  const [dropdownPos, setDropdownPos] = createSignal(null)
  let addButtonRef

  // Track add-button position for the portal dropdown
  createEffect(() => {
    if (!addOpen()) { setDropdownPos(null); return }
    let rafId
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

  // Drag-to-reorder via torch-ui's createSortableDrag utility
  const drag = createSortableDrag({
    items: () => props.columns,
    onReorder: (ids) => {
      const map = new Map(props.columns.map((c) => [c.id, c]))
      props.onColumnsChange(ids.map((id) => map.get(id)).filter(Boolean))
    },
  })

  let pointerX = 0, pointerY = 0, overlayW = 0, overlayH = 0

  const removeColumn = (id) =>
    props.onColumnsChange(props.columns.filter((c) => c.id !== id))

  const addColumn = (id) => {
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
          <p class="text-xs text-ink-500">
            {props.columns.length} column{props.columns.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Sortable column list */}
        <div data-sortable-container
          class="divide-y divide-surface-border rounded-lg border border-surface-border overflow-hidden">
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
                  {/* Drag handle */}
                  <button type="button"
                    class="shrink-0 rounded p-1 text-ink-400 hover:bg-surface-overlay touch-none cursor-grab"
                    onPointerDown={(e) => {
                      pointerX = e.clientX; pointerY = e.clientY
                      const row = e.currentTarget.closest('[data-sortable-id]')
                      if (row) { const r = row.getBoundingClientRect(); overlayW = r.width; overlayH = r.height }
                      drag.handlePointerDown(col.id, e)
                    }}
                  >
                    {icons.dragHandle({ class: 'h-3.5 w-3.5' })}
                  </button>

                  <span class="flex-1 text-sm font-medium text-ink-900">{col.label}</span>

                  <Show when={col.required}>
                    <span class="shrink-0 text-xs text-ink-400">Required</span>
                  </Show>
                  <Show when={!col.required}>
                    <button type="button" onClick={() => removeColumn(col.id)}
                      class="shrink-0 rounded p-1 text-ink-400 hover:bg-surface-overlay hover:text-ink-700">
                      <X class="h-3.5 w-3.5" />
                    </button>
                  </Show>
                </div>
              )
            }}
          </For>
        </div>

        {/* Drag overlay (ghost row that follows the pointer) */}
        <Show when={drag.activeId()}>
          {(activeId) => {
            const col = () => props.columns.find((c) => c.id === activeId())
            return (
              <Show when={col()}>
                {(resolved) => {
                  let el
                  const onMove = (e) => { if (el) el.style.transform = 'translate(' + (e.clientX - 16) + 'px,' + (e.clientY - 16) + 'px)' }
                  const cleanup = () => document.removeEventListener('pointermove', onMove)
                  document.addEventListener('pointermove', onMove)
                  document.addEventListener('pointerup', cleanup, { once: true })
                  onCleanup(cleanup)
                  return (
                    <div ref={el} class="fixed top-0 left-0 flex items-center gap-2 rounded-lg border
                      border-surface-border bg-surface-raised px-3 py-2.5 text-sm shadow-lg select-none"
                      style={{ 'pointer-events': 'none', 'z-index': '50',
                        transform: 'translate(' + (pointerX - 16) + 'px,' + (pointerY - 16) + 'px)',
                        width: overlayW + 'px', height: overlayH + 'px' }}
                    >
                      {icons.dragHandle({ class: 'h-3.5 w-3.5 shrink-0 text-ink-400' })}
                      <span class="flex-1 font-medium text-ink-900">{resolved().label}</span>
                    </div>
                  )
                }}
              </Show>
            )
          }}
        </Show>

        {/* Add column picker */}
        <Show when={props.allColumns && availableToAdd().length > 0}>
          <div class="mt-2">
            <button ref={addButtonRef} type="button" onClick={() => setAddOpen((v) => !v)}
              class="flex w-full items-center gap-1.5 rounded-lg border border-dashed
                border-surface-border px-3 py-2 text-sm text-ink-500
                hover:border-primary-400 hover:text-primary-600">
              <span class="text-base leading-none">+</span> Add column
            </button>
            <Show when={dropdownPos()}>
              {(pos) => (
                <Portal>
                  <div class="overflow-hidden rounded-lg border border-surface-border bg-surface-raised shadow-lg"
                    style={{ position: 'fixed', top: pos().top + 'px', left: pos().left + 'px',
                      width: pos().width + 'px', 'z-index': '9999' }}>
                    <For each={availableToAdd()}>
                      {(col) => (
                        <button type="button" onClick={() => addColumn(col.id)}
                          class="flex w-full items-center px-3 py-2 text-sm text-ink-700 hover:bg-surface-overlay">
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

      {/* Optional save/cancel footer */}
      <Show when={props.onSave || props.onCancel}>
        <div class="flex justify-end gap-2 border-t border-surface-border pt-4">
          <Show when={props.onCancel}>
            <Button variant="outlined" onClick={props.onCancel}>
              {props.cancelLabel ?? 'Cancel'}
            </Button>
          </Show>
          <Show when={props.onSave}>
            <Button variant="primary" onClick={props.onSave}>
              {props.saveLabel ?? 'Save view'}
            </Button>
          </Show>
        </div>
      </Show>
    </div>
  )
}
function Example() { const [name,setName]=createSignal('All members'); const [columns,setColumns]=createSignal([{id:'name',label:'Name',visible:true,required:true},{id:'role',label:'Role',visible:true}]); return <ViewCustomizer viewName={name()} onViewNameChange={setName} columns={columns()} onColumnsChange={setColumns} allColumns={[...columns(),{id:'status',label:'Status',visible:true}]} /> }
import { render } from "solid-js/web";
export default function mount(target) { return render(() => <Example />, target); }
