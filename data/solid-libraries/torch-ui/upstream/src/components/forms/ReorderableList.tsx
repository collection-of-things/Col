import { For, Show, type JSX, splitProps, onCleanup } from 'solid-js'

import { cn } from '../../utilities/classNames'

import { createSortableDrag } from '../../utilities/createSortableDrag'

import { useIcons } from '../../icons'

import { Button } from '../actions'



export interface ReorderableListItem {

  id: string

  label: string

}



export interface ReorderableListProps extends JSX.HTMLAttributes<HTMLDivElement> {

  items: ReorderableListItem[]

  onReorder: (ids: string[]) => void

  showMoveButtons?: boolean

  onRemove?: (id: string) => void

  class?: string

}



function ReorderableListDragOverlay(props: {

  item: ReorderableListItem

  startX: number

  startY: number

  width?: number

  height?: number

}) {

  const icons = useIcons()

  let el: HTMLDivElement | undefined



  const onMove = (e: PointerEvent) => {

    if (!el) return

    el.style.transform = `translate(${e.clientX - 16}px, ${e.clientY - 16}px)`

  }



  const cleanup = () => document.removeEventListener('pointermove', onMove)



  document.addEventListener('pointermove', onMove)

  document.addEventListener('pointerup', cleanup, { once: true })

  document.addEventListener('pointercancel', cleanup, { once: true })

  onCleanup(cleanup)



  return (

    <div

      ref={el}

      style={{

        position: 'fixed',

        top: '0',

        left: '0',

        transform: `translate(${props.startX - 16}px, ${props.startY - 16}px)`,

        width: props.width != null ? `${props.width}px` : undefined,

        height: props.height != null ? `${props.height}px` : undefined,

        'pointer-events': 'none',

        'z-index': '50',

        'will-change': 'transform',

      }}

      class="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-raised px-4 py-3 text-sm shadow-lg select-none text-ink-700"

    >

      {icons.dragHandle({ class: 'h-4 w-4 text-ink-400', 'aria-hidden': 'true' })}

      <span>{props.item.label}</span>

    </div>

  )

}



export function ReorderableList(props: ReorderableListProps) {

  const [local, others] = splitProps(props, [

    'items',

    'onReorder',

    'onRemove',

    'showMoveButtons',

    'class',

  ])

  const icons = useIcons()



  const drag = createSortableDrag({

    items: () => local.items,

    onReorder: local.onReorder,

  })



  const showMoveButtons = () => local.showMoveButtons === true



  const move = (id: string, direction: 'up' | 'down') => {

    const ids = local.items.map((i) => i.id)

    const index = ids.indexOf(id)

    const nextIndex = direction === 'up' ? index - 1 : index + 1

    if (index === -1 || nextIndex < 0 || nextIndex >= ids.length) return

    const next = [...ids]

    const [moved] = next.splice(index, 1)

    next.splice(nextIndex, 0, moved)

    local.onReorder(next)

  }



  let pointerX = 0

  let pointerY = 0

  let overlayW = 0

  let overlayH = 0



  return (

    <div

      role="list"

      data-sortable-container

      class={cn('space-y-2 w-full', local.class)}

      {...others}

    >

      <For each={local.items}>

        {(item, index) => {

          const isActive = () => drag.activeId() === item.id

          const transform = () => drag.getTransform(item.id)

          const canMoveUp = () => index() > 0

          const canMoveDown = () => index() < local.items.length - 1



          return (

            <div

              role="listitem"

              data-sortable-id={item.id}

              style={{

                transform: transform() || undefined,

                transition:

                  drag.isDragging() && !isActive()

                    ? 'transform 200ms ease'

                    : undefined,

                opacity: isActive() && drag.isDragging() ? '0' : undefined,

                'pointer-events': isActive() && drag.isDragging() ? 'none' : undefined,

              }}

              class="flex items-center justify-between rounded-lg border border-surface-border bg-surface-raised px-4 py-3 text-sm select-none"

            >

              <div class="flex items-center gap-2 text-ink-700">

                <button

                  type="button"

                  class={cn(

                    'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-400 hover:bg-surface-overlay touch-none',

                    drag.isDragging() ? 'cursor-grabbing' : 'cursor-grab',

                  )}

                  aria-label={`Drag to reorder ${item.label}`}

                  onKeyDown={(e: KeyboardEvent) => {

                    if (e.key === 'ArrowUp') {

                      e.preventDefault()

                      move(item.id, 'up')

                    } else if (e.key === 'ArrowDown') {

                      e.preventDefault()

                      move(item.id, 'down')

                    }

                  }}

                  onPointerDown={(e) => {

                    pointerX = e.clientX

                    pointerY = e.clientY

                    const row = (e.currentTarget as HTMLElement).closest(

                      '[data-sortable-id]',

                    ) as HTMLElement | null

                    if (row) {

                      const r = row.getBoundingClientRect()

                      overlayW = r.width

                      overlayH = r.height

                    }

                    drag.handlePointerDown(item.id, e)

                  }}

                >

                  {icons.dragHandle({ class: 'h-4 w-4', 'aria-hidden': 'true' })}

                </button>

                <span>{item.label}</span>

              </div>

              <div class="flex shrink-0 items-center gap-1">

                <Show when={showMoveButtons()}>

                  <Button

                    iconOnly

                    variant="ghost"

                    size="xs"

                    icon={icons.chevronUp({ class: 'h-4 w-4', 'aria-hidden': 'true' })}

                    label={`Move ${item.label} up`}

                    disabled={!canMoveUp()}

                    onClick={() => move(item.id, 'up')}

                  />

                  <Button

                    iconOnly

                    variant="ghost"

                    size="xs"

                    icon={icons.chevronDown({ class: 'h-4 w-4', 'aria-hidden': 'true' })}

                    label={`Move ${item.label} down`}

                    disabled={!canMoveDown()}

                    onClick={() => move(item.id, 'down')}

                  />

                </Show>

                <Show when={local.onRemove}>

                  <Button

                    iconOnly

                    variant="ghost"

                    size="xs"

                    icon={icons.close({ class: 'h-4 w-4', 'aria-hidden': 'true' })}

                    label={`Remove ${item.label}`}

                    onClick={() => local.onRemove?.(item.id)}

                  />

                </Show>

              </div>

            </div>

          )

        }}

      </For>



			<Show when={drag.activeId()}>

				{(activeId) => {

					const item = () => local.items.find((i) => i.id === activeId())

					return (

						<Show when={item()}>

							{(resolved) => (

								<ReorderableListDragOverlay

									item={resolved()}

									startX={pointerX}

									startY={pointerY}

									width={overlayW}

									height={overlayH}

								/>

							)}

						</Show>

					)

				}}

			</Show>

		</div>

	)

}