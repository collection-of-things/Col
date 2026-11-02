import { createSignal, createUniqueId, onCleanup, splitProps, Show, type JSX } from 'solid-js'

import { Select as KobalteSelect } from '@kobalte/core/select'

import { cn } from '../../utilities/classNames'

import { type ComponentSize, inputSizeConfig } from '../../types/component-size'

import { useIcons } from '../../icons'

import { useComponentSize } from '../../utilities/componentSizeContext'



export interface SelectOption {

	value: string

	label: string

	/** Optional icon shown before the label. */

	icon?: JSX.Element

	/** Optional hex or CSS color for a status dot (e.g. #22c55e). When set, a small colored dot is shown before the label; useful for status/state fields. */

	color?: string | null

}

/** A labelled group of options rendered as a non-selectable section header in the dropdown. */
export interface SelectOptionGroup {
	/** The section heading text. */
	group: string
	/** Options belonging to this group. */
	options: SelectOption[]
}



function statusColorStyle(color: string | null | undefined): string | undefined {

	if (color == null || color === '') return undefined

	const t = color.trim()

	if (t.startsWith('#') || t.startsWith('rgb') || /^[a-z]+$/i.test(t)) return t

	return undefined

}



function StatusDot(props: { color?: string | null }) {

	const style = () => {

		const c = statusColorStyle(props.color)

		return c ? { 'background-color': c } : undefined

	}

	return (

		<span

			class="size-2.5 shrink-0 rounded-full border border-ink-200/80"

			classList={{ 'bg-ink-400': !statusColorStyle(props.color) }}

			style={style()}

			aria-hidden="true"

		/>

	)

}



export interface SelectProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'> {

	label?: string

	error?: JSX.Element

	helperText?: JSX.Element

	/** When true, never render label row or error/helper text (control only). */

	bare?: boolean

	required?: boolean

	/** When true, show "optional" on the label row when not required. Default false. */

	optional?: boolean

	placeholder?: string

	value?: string

	onValueChange?: (value: string) => void

	onErrorClear?: () => void

	disabled?: boolean

	/** Applied to the root wrapper (label + control + helper/error). Use for layout (e.g. max-w-sm). */

	class?: string

	/** Applied to the trigger element for height/sizing (e.g. min-h-[50px] h-[50px]). */

	triggerClass?: string

	/** Input size. Controls height, text size, and padding. Default: md (36px). */

	size?: ComponentSize

	/** Flat list of options. Provide either `options` or `groups`, not both. */
	options?: SelectOption[]

	/** Grouped options rendered with non-selectable section headers. Provide either `options` or `groups`, not both. */
	groups?: SelectOptionGroup[]

	/** When true, show a search input in the dropdown to filter options by label. Default false. */

	searchable?: boolean

	/** Ref forwarded to the root wrapper div. */

	ref?: (el: HTMLDivElement) => void

	/** Id for the root wrapper (e.g. for aria-labelledby / label for). */

	id?: string

}



export const Select = (props: SelectProps) => {

	const [local, others] = splitProps(props, [

		'label',

		'error',

		'helperText',

		'bare',

		'required',

		'optional',

		'options',

		'groups',

		'placeholder',

		'value',

		'onValueChange',

		'onErrorClear',

		'disabled',

		'class',

		'triggerClass',

		'size',

		'searchable',

		'ref',

		'id',

	])

	const icons = useIcons()

	const contextSize = useComponentSize()

	const [searchQuery, setSearchQuery] = createSignal('')

	const sc = () => inputSizeConfig[local.size ?? contextSize ?? 'md']



	const hasError = () => !!local.error

	const uid = createUniqueId()

	const helperId = () => (!local.bare && local.helperText ? `select-${uid}-help` : undefined)

	const errorId = () => (!local.bare && local.error ? `select-${uid}-error` : undefined)

	const describedBy = () => [helperId(), errorId()].filter(Boolean).join(' ') || undefined

	const allFlatOptions = (): SelectOption[] => {
		if (local.options) return local.options
		if (local.groups) return local.groups.flatMap((g) => g.options)
		return []
	}

	const selectedOption = () =>
		local.value != null && local.value !== ''
			? allFlatOptions().find((opt) => opt.value === local.value)
			: undefined

	const filteredOptions = (): SelectOption[] => {

		const opts = local.options ?? []

		if (!local.searchable) return opts

		const q = searchQuery().trim().toLowerCase()

		if (!q) return opts

		const selected = selectedOption()

		const filtered = opts.filter((o) => o.label.toLowerCase().includes(q))

		if (selected && !filtered.some((o) => o.value === selected.value))

			return [selected, ...filtered]

		return filtered

	}

	const filteredGroups = (): SelectOptionGroup[] => {
		const grps = local.groups ?? []
		if (!local.searchable) return grps
		const q = searchQuery().trim().toLowerCase()
		if (!q) return grps
		const selectedVal = local.value
		return grps
			.map((g) => ({
				...g,
				options: g.options.filter(
					(o) => o.label.toLowerCase().includes(q) || o.value === selectedVal,
				),
			}))
			.filter((g) => g.options.length > 0)
	}



	const handleChange = (option: SelectOption | null) => {

		if (local.error && local.onErrorClear) {

			local.onErrorClear()

		}

		local.onValueChange?.(option ? option.value : '')

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
	 * window leaves focus off-screen. We observe attribute mutations on the
	 * listbox subtree and call `scrollIntoView({ block: 'nearest' })`
	 * whenever an item gets highlighted (keyboard or mouse).
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

	// Shared item renderer used by both flat and grouped modes
	const renderItem = (itemProps: { item: { rawValue: SelectOption } }) => (
		<KobalteSelect.Item
			item={itemProps.item as never}
			class="relative flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer outline-none text-ink-900 data-[highlighted]:bg-primary-50 data-[highlighted]:text-primary-900 data-[disabled]:bg-surface-dim data-[disabled]:text-ink-500 data-[disabled]:cursor-not-allowed"
		>
			<KobalteSelect.ItemLabel class="flex-1">
				<span class="flex min-w-0 items-center gap-2">
					<Show when={statusColorStyle(itemProps.item.rawValue.color)}>
						<StatusDot color={itemProps.item.rawValue.color} />
					</Show>
					<Show when={itemProps.item.rawValue.icon}>
						<span class="flex-shrink-0 text-ink-500">{itemProps.item.rawValue.icon}</span>
					</Show>
					<span class="min-w-0 truncate">{itemProps.item.rawValue.label}</span>
				</span>
			</KobalteSelect.ItemLabel>
			<KobalteSelect.ItemIndicator class="inline-flex items-center">
				{icons.check({ class: 'w-4 h-4 text-primary-500', 'aria-hidden': 'true' })}
			</KobalteSelect.ItemIndicator>
		</KobalteSelect.Item>
	)

	// Shared section header renderer used in grouped mode
	const renderSection = (sectionProps: { section: { rawValue: SelectOptionGroup } }) => (
		<KobalteSelect.Section class="[&+&]:border-t [&+&]:border-surface-border [&+&]:mt-1 [&+&]:pt-1">
			<div class="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-400 select-none">
				{sectionProps.section.rawValue.group}
			</div>
		</KobalteSelect.Section>
	)

	// Shared inner content (label, trigger, helper, error, portal) — used by both modes.
	// Extracted as a render function since these components rely on KobalteSelect context.
	const renderInner = () => <>
		<Show when={!local.bare && local.label}>

			<div class="flex items-center justify-between mb-2">

				<KobalteSelect.Label class={cn('block text-sm font-medium', hasError() ? 'text-danger-600' : 'text-ink-700')}>

					{local.label}

					<Show when={local.required}>

						<span class="ml-0.5 text-danger-500" aria-hidden="true">*</span>

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

				sc().h,

				hasError()

					? 'border-danger-500 focus-within:ring-2 focus-within:ring-inset focus-within:ring-danger-500 focus-within:border-transparent'

					: 'border-surface-border focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 focus-within:border-transparent',

				'bg-surface-raised'

			)}

		>

			<KobalteSelect.Trigger

				aria-invalid={hasError() ? 'true' : undefined}

				aria-describedby={describedBy()}

				aria-errormessage={hasError() ? errorId() : undefined}

				class={cn(

					'w-full h-full min-w-0 flex items-center gap-1 rounded-lg transition-all outline-none bg-transparent text-ink-900 text-left border-0 focus:ring-0',

					sc().py, sc().text, sc().pl, sc().pr,

					hasError()

						? 'focus:border-transparent'

						: '',

					'disabled:bg-surface-dim disabled:text-ink-500 disabled:cursor-not-allowed',

					'data-[placeholder-shown]:text-ink-400',

					local.triggerClass

				)}

			>

				<KobalteSelect.Value<SelectOption> class="min-w-0 flex-1 truncate text-left basis-0">

					{(state) => {

						const opt = state.selectedOption()

						if (!opt) return <span class="truncate">{local.placeholder || 'Select an option'}</span>

						return (

							<span class="min-w-0 flex-1 truncate text-left flex items-center gap-2">

								<Show when={statusColorStyle(opt.color)}>

									<StatusDot color={opt.color} />

								</Show>

								<Show when={opt.icon}>

									<span class="shrink-0 text-ink-500">{opt.icon}</span>

								</Show>

								<span class="min-w-0 truncate">{opt.label}</span>

							</span>

						)

					}}

				</KobalteSelect.Value>

				<KobalteSelect.Icon class="inline-flex shrink-0 w-4 items-center justify-center text-ink-400">

					{icons.chevronDown({ class: 'h-3.5 w-3.5', 'aria-hidden': 'true' })}

				</KobalteSelect.Icon>

			</KobalteSelect.Trigger>

		</div>



		<Show when={!local.bare && !hasError() && local.helperText}>

			<KobalteSelect.Description id={helperId()} class="mt-2 text-sm text-ink-500">

				{local.helperText}

			</KobalteSelect.Description>

		</Show>



		<Show when={!local.bare && hasError()}>

			<KobalteSelect.ErrorMessage id={errorId()} class="mt-2 text-sm text-danger-600">

				{local.error}

			</KobalteSelect.ErrorMessage>

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

								hasError() ? 'focus:ring-danger-500' : 'focus:ring-primary-500'

							)}

						/>

					</div>

				</Show>

				<div
					ref={observeHighlightedScrollIntoView}
					class={cn('outline-none min-h-0', local.searchable && 'flex-1 overflow-auto py-1')}
				>

					<KobalteSelect.Listbox class="outline-none" />

				</div>

			</KobalteSelect.Content>

		</KobalteSelect.Portal>
	</>

	return (

		<div ref={local.ref} id={local.id} class={cn('w-full', local.class)} {...others}>

			<Show
				when={local.groups && local.groups.length > 0}
				fallback={
					<KobalteSelect<SelectOption>

						value={selectedOption() ?? undefined}

						onChange={handleChange}

						options={filteredOptions()}

						onOpenChange={handleOpenChange}

						optionValue="value"

						optionTextValue="label"

						placeholder={local.placeholder || 'Select an option'}

						disabled={local.disabled}

						validationState={hasError() ? 'invalid' : undefined}

						closeOnSelection={true}

						itemComponent={renderItem as never}

					>
						{renderInner()}
					</KobalteSelect>
				}
			>
				<KobalteSelect<SelectOption, SelectOptionGroup>

					value={selectedOption() ?? undefined}

					onChange={handleChange}

					options={filteredGroups()}

					onOpenChange={handleOpenChange}

					optionValue="value"

					optionTextValue="label"

					optionGroupChildren="options"

					placeholder={local.placeholder || 'Select an option'}

					disabled={local.disabled}

					validationState={hasError() ? 'invalid' : undefined}

					closeOnSelection={true}

					itemComponent={renderItem as never}

					sectionComponent={renderSection as never}

				>
					{renderInner()}
				</KobalteSelect>
		</Show>

		</div>

	)

}

