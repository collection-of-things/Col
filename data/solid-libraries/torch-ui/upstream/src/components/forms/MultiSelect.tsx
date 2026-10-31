import type { JSX } from 'solid-js'

import { createMemo, createSignal, createUniqueId, For, Show, splitProps, onMount, onCleanup } from 'solid-js'

import { Select as KobalteSelect } from '@kobalte/core/select'

import { cn } from '../../utilities/classNames'

import { type ComponentSize, inputSizeConfig } from '../../types/component-size'

import { createSortableDrag } from '../../utilities/createSortableDrag'

import { useIcons } from '../../icons'

import { useComponentSize } from '../../utilities/componentSizeContext'



export interface MultiSelectOption {

	value: string

	label: string

	icon?: JSX.Element

}



export interface MultiSelectProps {



	label?: string

	helperText?: JSX.Element

	error?: JSX.Element

	bare?: boolean

	required?: boolean

	optional?: boolean

	options: MultiSelectOption[]

	value: string[]

	onValueChange: (value: string[]) => void

	onErrorClear?: () => void

	placeholder?: string

	class?: string

	reorderable?: boolean

	searchable?: boolean

	disabled?: boolean

	size?: ComponentSize

	ref?: (el: HTMLDivElement) => void

}



// ─── Drag overlay ghost chip ──────────────────────────────────────────────────



function ChipDragOverlay(props: {

	label: string

	icon?: JSX.Element

	startX: number

	startY: number

	width?: number

	height?: number

	size: ComponentSize

}) {

	const icons = useIcons()

	const contextSize = useComponentSize()

	const effectiveSize = () => props.size ?? contextSize ?? 'md'

	let el: HTMLSpanElement | undefined



	const onMove = (e: PointerEvent) => {

		if (!el) return

		el.style.transform = `translate(${e.clientX - 12}px, ${e.clientY - 12}px)`

	}



	const cleanup = () => document.removeEventListener('pointermove', onMove)



	onMount(() => {

		document.addEventListener('pointermove', onMove)

		document.addEventListener('pointerup', cleanup, { once: true })

		document.addEventListener('pointercancel', cleanup, { once: true })

	})

	onCleanup(cleanup)



	return (

		<span

			ref={(e) => (el = e)}



			style={{

				position: 'fixed',

				top: '0',

				left: '0',

				transform: `translate(${props.startX - 12}px, ${props.startY - 12}px)`,

				width: props.width != null ? `${props.width}px` : undefined,

				height: props.height != null ? `${props.height}px` : undefined,

				'pointer-events': 'none',

				'z-index': '50',

				'will-change': 'transform',

			}}



			class={cn(

				'inline-flex shrink-0 items-center gap-1.5 rounded-md font-medium bg-ink-100 text-ink-700 shadow-md select-none',

				props.width == null && 'max-w-[200px]',

				effectiveSize() === 'xs' && 'px-1.5 py-0.5 text-xs',

				effectiveSize() === 'sm' && 'px-1.5 py-0.5 text-xs',

				(effectiveSize() === 'md' || effectiveSize() === 'lg' || effectiveSize() === 'xl') &&

					'px-2 py-1 text-sm',

			)}

		>

			{icons.dragHandle({ class: 'h-3.5 w-3.5 text-ink-400', 'aria-hidden': 'true' })}

			<Show when={props.icon}>

				<span class="shrink-0 text-current opacity-70">{props.icon}</span>

			</Show>

			<span class="min-w-0 truncate">{props.label}</span>

		</span>

	)

}



// ─── Individual chip ──────────────────────────────────────────────────────────



function ChipContent(props: {

	opt: MultiSelectOption

	onRemove: (opt: MultiSelectOption) => void

	showGrip?: boolean

	onGripPointerDown?: (e: PointerEvent) => void

	isActive?: () => boolean

	isDragging?: () => boolean

	size: ComponentSize

}) {

	const icons = useIcons()

	const isActive = () => props.isActive?.() === true

	const isDragging = () => props.isDragging?.() === true

	return (

		<span

			data-sortable-id={props.opt.value}



			style={{

				transition: undefined,

				opacity: isActive() && isDragging() ? '0' : undefined,

				visibility: isActive() && isDragging() ? 'hidden' : undefined,

				'pointer-events': isActive() && isDragging() ? 'none' : undefined,

			}}

			class={cn(

				'inline-flex shrink-0 items-center gap-1.5 rounded-md font-medium bg-ink-100 text-ink-700',

				'max-w-[200px]',

				props.size === 'xs' && 'px-1.5 py-0.5 text-xs',

				props.size === 'sm' && 'px-1.5 py-0.5 text-xs',

				(props.size === 'md' || props.size === 'lg' || props.size === 'xl') &&

					'px-2 py-1 text-sm',

			)}

		>

			<Show when={props.showGrip}>

				<button

					type="button"

					class={cn(

						'shrink-0 text-ink-400 outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 rounded',

						isDragging() ? 'cursor-grabbing' : 'cursor-grab',

					)}

					aria-label="Drag to reorder"

					onPointerDown={props.onGripPointerDown}

				>

					{icons.dragHandle({ class: 'h-3.5 w-3.5', 'aria-hidden': 'true' })}

				</button>

			</Show>

			<Show when={props.opt.icon}>

				<span class="shrink-0 text-current opacity-70">{props.opt.icon}</span>

			</Show>

			<span class="min-w-0 truncate">{props.opt.label}</span>

			<button

				type="button"

				onClick={(e) => {

					e.stopPropagation()

					e.preventDefault()

					props.onRemove(props.opt)

				}}

				onPointerDown={(e) => e.stopPropagation()}

				class="rounded p-0.5 hover:bg-surface-overlay outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"

				aria-label={`Remove ${props.opt.label}`}

			>

				{icons.close({ class: 'h-3.5 w-3.5', 'aria-hidden': 'true' })}

			</button>

		</span>

	)

}



// ─── Chips list ───────────────────────────────────────────────────────────────



function ChipsList(props: {

	selectedOptions: MultiSelectOption[]

	onRemove: (opt: MultiSelectOption) => void

	reorderable: boolean

	onReorder: (newOrder: string[]) => void

	size: ComponentSize

}) {

	const drag = createSortableDrag({

		items: () => props.selectedOptions.map((o) => ({ id: o.value })),

		onReorder: props.onReorder,

	})



	const previewOptions = createMemo(() => {

		const active = drag.activeId()

		const over = drag.overId()

		const opts = props.selectedOptions

		if (!active || !over || active === over) return opts

		const from = opts.findIndex((o) => o.value === active)

		const to = opts.findIndex((o) => o.value === over)

		if (from === -1 || to === -1) return opts

		const next = opts.slice()

		const [moved] = next.splice(from, 1)

		next.splice(to, 0, moved)

		return next

	})



	let pointerX = 0

	let pointerY = 0

	let overlayW = 0

	let overlayH = 0



	return (

		<span data-sortable-container class="inline-flex flex-wrap items-center gap-2">

			<For each={previewOptions()}>

				{(opt) => (

					<ChipContent

						opt={opt}

						onRemove={props.onRemove}

						showGrip={props.reorderable}

						size={props.size}

						isActive={() => drag.activeId() === opt.value}

						isDragging={drag.isDragging}

						onGripPointerDown={

							props.reorderable

								? (e) => {

										pointerX = e.clientX

										pointerY = e.clientY

										const chip = (e.currentTarget as HTMLElement).closest('[data-sortable-id]') as HTMLElement | null

										if (chip) {

											const r = chip.getBoundingClientRect()

											overlayW = r.width

											overlayH = r.height

										}

										drag.handlePointerDown(opt.value, e)

									}

								: undefined

						}

					/>

				)}

			</For>



			<Show when={drag.activeId()}>

				{(activeId) => {

					const opt = () => props.selectedOptions.find((o) => o.value === activeId())

					return (

						<Show when={opt()}>

							{(resolved) => (

								<ChipDragOverlay

									label={resolved().label}

									icon={resolved().icon}

									startX={pointerX}

									startY={pointerY}

									width={overlayW}

									height={overlayH}

									size={props.size}

								/>

							)}

						</Show>

					)

				}}

			</Show>

		</span>

	)

}



// ─── MultiSelect ──────────────────────────────────────────────────────────────



export function MultiSelect(props: MultiSelectProps) {



	const [local] = splitProps(props, [

		'label',

		'helperText',

		'error',

		'bare',

		'required',

		'optional',

		'options',

		'value',

		'onValueChange',

		'onErrorClear',

		'placeholder',

		'class',

		'reorderable',

		'searchable',

		'disabled',

		'size',

		'ref',

	])

	const icons = useIcons()

	const contextSize = useComponentSize()



	const sc = () => inputSizeConfig[local.size ?? contextSize ?? 'md']

	const size = () => local.size ?? contextSize ?? 'md'



	const minH = () => {

		const s = size()

		if (s === 'xs') return 'min-h-7'

		if (s === 'sm') return 'min-h-8'

		if (s === 'md') return 'min-h-9'

		if (s === 'lg') return 'min-h-10'

		return 'min-h-11'

	}



	const uid = createUniqueId()

	const helperId = () => (local.helperText ? `ms-${uid}-help` : undefined)

	const errorId = () => (local.error ? `ms-${uid}-error` : undefined)

	const describedBy = () =>

		[helperId(), errorId()].filter(Boolean).join(' ') || undefined

	const [searchQuery, setSearchQuery] = createSignal('')

	const normalizedSearchQuery = createMemo(() => searchQuery().trim().toLowerCase())



	const selectedOptions = createMemo<MultiSelectOption[]>(() => {

		const base = local.options.filter((o) => local.value.includes(o.value))

		const missing = local.value

			.filter((v) => !local.options.some((o) => o.value === v))

			.map((v) => ({ value: v, label: v }))

		return missing.length ? [...missing, ...base] : base

	})



	const optionsForSelect = () => local.options



	const handleChange = (opts: MultiSelectOption | MultiSelectOption[] | null) => {

		if (local.error && local.onErrorClear) local.onErrorClear()

		const arr = opts == null ? [] : Array.isArray(opts) ? opts : [opts]

		local.onValueChange(arr.map((o) => o.value))

	}



	let searchInputRef: HTMLInputElement | undefined

	const handleOpenChange = (open: boolean) => {

		if (!open) setSearchQuery('')

		else if (local.searchable) {

			requestAnimationFrame(() => searchInputRef?.focus())

		}

	}

	/**
	 * Keep the keyboard-highlighted option visible inside the scrollable
	 * listbox. Kobalte sets `data-highlighted` on the active item but does
	 * not scroll the container — without this, arrow-down past the visible
	 * window leaves focus off-screen.
	 */
	const observeHighlightedScrollIntoView = (el: HTMLElement) => {
		const observer = new MutationObserver((mutations) => {
			for (const m of mutations) {
				if (
					m.attributeName === 'data-highlighted' &&
					m.target instanceof HTMLElement &&
					m.target.hasAttribute('data-highlighted') &&
					typeof m.target.scrollIntoView === 'function'
				) {
					m.target.scrollIntoView({ block: 'nearest' })
				}
			}
		})
		observer.observe(el, {
			attributes: true,
			attributeFilter: ['data-highlighted'],
			subtree: true,
		})
		onCleanup(() => observer.disconnect())
	}



	return (

		<div ref={local.ref} class={cn('w-full', local.class)}>

			<KobalteSelect<MultiSelectOption>

				multiple

				options={optionsForSelect()}



				optionValue="value"

				optionTextValue="label"

				value={selectedOptions()}



				onChange={handleChange}

				placeholder={local.placeholder ?? 'Select...'}

				disabled={local.disabled}

				closeOnSelection={false}

				onOpenChange={handleOpenChange}

				itemComponent={(itemProps) => (

					<Show

						when={(() => {

							if (!local.searchable) return true

							const q = normalizedSearchQuery()

							if (!q) return true

							return itemProps.item.rawValue.label.toLowerCase().includes(q)

						})()}

					>

						<KobalteSelect.Item

							item={itemProps.item}

							class="relative flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer outline-none text-ink-900 data-[highlighted]:bg-primary-50 data-[highlighted]:text-primary-900 data-[disabled]:bg-surface-dim data-[disabled]:text-ink-500 data-[disabled]:cursor-not-allowed"

						>

							<KobalteSelect.ItemLabel class="flex-1">

								<span class="flex items-center gap-2">

									<Show when={itemProps.item.rawValue.icon}>

										<span class="flex-shrink-0 text-ink-500">

											{itemProps.item.rawValue.icon}

										</span>

									</Show>

									<span class="truncate">{itemProps.item.rawValue.label}</span>

								</span>

							</KobalteSelect.ItemLabel>

							<KobalteSelect.ItemIndicator class="inline-flex items-center">

								{icons.check({ class: 'w-4 h-4 text-primary-500', 'aria-hidden': 'true' })}

							</KobalteSelect.ItemIndicator>

						</KobalteSelect.Item>

					</Show>

				)}

			>

				<Show when={!local.bare && local.label}>

					<div class="flex items-center justify-between mb-2">

						<KobalteSelect.Label class={cn('block text-sm font-medium', local.error ? 'text-danger-600' : 'text-ink-700')}>

							{local.label}

							<Show when={local.required}>

								<span class="text-danger-500 ml-0.5" aria-hidden="true">

									*

								</span>

							</Show>

						</KobalteSelect.Label>

						<Show when={local.label && !local.required && local.optional}>

							<span class="text-xs text-ink-500">optional</span>

						</Show>

					</div>

				</Show>



				<div

					class={cn(

						'w-full flex flex-col min-h-0 rounded-lg border transition-all overflow-hidden',

						minH(),

						local.error

							? 'border-danger-500 focus-within:ring-2 focus-within:ring-inset focus-within:ring-danger-500 focus-within:border-transparent'

							: 'border-surface-border focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 focus-within:border-transparent',

						'bg-surface-raised',

					)}

				>

					<div class="m-px">

						<KobalteSelect.Trigger

							as="button"

							type="button"

							aria-invalid={local.error ? 'true' : undefined}

							aria-describedby={describedBy()}

							aria-errormessage={local.error ? errorId() : undefined}

							class={cn(

								'w-full min-h-0 min-w-0 flex items-center gap-2 rounded-[7px] transition-all outline-none bg-transparent text-ink-900 text-left border-0 cursor-pointer',

								sc().py,

								sc().text,

								sc().pl,

								sc().pr,

								'data-[expanded]:hover:bg-transparent',

								'data-[disabled]:bg-surface-base data-[disabled]:text-ink-500 data-[disabled]:cursor-not-allowed',

								'data-[placeholder-shown]:text-ink-400',

							)}

						>

							<KobalteSelect.Value<MultiSelectOption> class="min-w-0 flex-1 flex flex-wrap items-center gap-2 basis-0">

								{(state) => {

									const selected = state.selectedOptions()

									if (selected.length === 0) {

										return (

											<span class="text-ink-400">

												{local.placeholder ?? 'Select...'}

											</span>

										)

									}

									return (

										<ChipsList

											selectedOptions={selected}

											onRemove={(opt) => state.remove(opt)}

											reorderable={local.reorderable ?? false}

											onReorder={(newOrder) => local.onValueChange(newOrder)}

											size={size()}

										/>

									)

								}}

							</KobalteSelect.Value>



							<KobalteSelect.Icon class="inline-flex shrink-0 w-4 items-center justify-center text-ink-400 transition-transform data-[expanded]:rotate-180">

								{icons.chevronDown({ class: 'h-3.5 w-3.5', 'aria-hidden': 'true' })}

							</KobalteSelect.Icon>

						</KobalteSelect.Trigger>

					</div>

				</div>



				<Show when={!local.bare && !local.error && local.helperText}>

					<KobalteSelect.Description id={helperId()} class="mt-2 text-sm text-ink-500">

						{local.helperText}

					</KobalteSelect.Description>

				</Show>



				<Show when={!local.bare && local.error}>

					<p id={errorId()} class="mt-2 text-sm text-danger-600" role="alert">

						{local.error}

					</p>

				</Show>



				<KobalteSelect.Portal>

					<KobalteSelect.Content

						class={cn(

							'bg-surface-raised rounded-lg border border-surface-border shadow-lg mt-2 z-[100] flex flex-col max-h-60',

							local.searchable ? 'py-0 overflow-hidden' : 'py-1 overflow-auto',

						)}

					>

						<Show when={local.searchable}>

							<div

								class="shrink-0 border-b border-surface-border p-2"

								onKeyDown={(e) => e.stopPropagation()}

								onPointerDown={(e) => e.stopPropagation()}

								onMouseDown={(e) => e.stopPropagation()}

							>

								<input

									ref={(el) => (searchInputRef = el)}

									type="text"

									value={searchQuery()}

									onInput={(e) => setSearchQuery(e.currentTarget.value)}

									placeholder="Search..."

									class={cn(

										'h-9 w-full rounded-md border border-surface-border bg-surface-raised px-3 py-1.5 text-sm text-ink-900 placeholder:text-ink-400 outline-none focus:ring-2 focus:ring-inset focus:border-transparent',

										local.error

											? 'focus:ring-danger-500'

											: 'focus:ring-primary-500',

									)}

								/>

							</div>

						</Show>

						<div

							ref={observeHighlightedScrollIntoView}

							class={cn(

								'outline-none min-h-0',

								local.searchable && 'flex-1 overflow-auto py-1',

							)}

						>

							<KobalteSelect.Listbox class="outline-none" />

						</div>

					</KobalteSelect.Content>

				</KobalteSelect.Portal>

			</KobalteSelect>

		</div>

	)

}

