import { type JSX, createSignal, createMemo, Show, For, splitProps, createEffect, on, createUniqueId } from 'solid-js'

import { Popover as KobaltePopover } from '@kobalte/core/popover'

import { ColorArea as KobalteColorArea } from '@kobalte/core/color-area'

import { ColorSlider as KobalteColorSlider } from '@kobalte/core/color-slider'

import { ColorChannelField as KobalteColorChannelField } from '@kobalte/core/color-channel-field'

import { parseColor as KobalteParseColor } from '@kobalte/core/colors'

import type { Color as KobalteColor } from '@kobalte/core/colors'

import { Button } from '../../actions'

import { cn } from '../../../utilities/classNames'

import { type ComponentSize } from '../../../types/component-size'

import { normalizeHex, rgbaToHex } from '../../../utilities/colorUtils'

import { useIcons } from '../../../icons'



const DEFAULT_PRESETS = [

	'#000000',

	'#374151',

	'#6b7280',

	'#9ca3af',

	'#d1d5db',

	'#ffffff',

	'#ef4444',

	'#f97316',

	'#eab308',

	'#22c55e',

	'#3b82f6',

	'#8b5cf6',

	'#ec4899',

] as const



export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'hsb'



export interface ColorPickerProps {

	/** Current value as hex (e.g. #3b82f6). */

	value?: string

	onValueChange?: (hex: string) => void

	/** Preset hex colors shown as swatches. Defaults to a built-in set. */

	presets?: string[]

	/** Optional label above the control. */

	label?: string

	/** Error message and invalid styling. */

	error?: JSX.Element

	/** Hint text below the control. */

	helperText?: JSX.Element

	/** When true, never render label row or error/helper text (control only). */

	bare?: boolean

	/** When true, show required indicator on label. */

	required?: boolean

	/** When true, show "optional" on the label row when not required. Default false. */

	optional?: boolean

	/** Called when the user interacts with the control while an error is shown, allowing the parent to clear the error. */

	onErrorClear?: () => void

	/** Component size. 'sm' hides preset strip and shows trigger only. Default 'md'. */

	size?: ComponentSize

	disabled?: boolean

	class?: string

	/** Max number of "last used" colors to keep. 0 to hide. Default 9. */

	lastUsedCount?: number

	/** Which format(s) to show in the custom panel. Default ['hex']. Use more for Hex/RGB/HSL/HSB tabs. */

	allowedFormats?: ColorFormat[]

	/** Predefined hex colors shown at the bottom of the custom panel, below last used. Use for theme presets etc. */

	predefined?: string[]

}



/** Returns 6-digit hex only. Used for Apply and public value (alpha not persisted). */

function colorToHex(c: KobalteColor): string {

	const rgb = c.toFormat('rgb')

	const r = Math.round(rgb.getChannelValue('red'))

	const g = Math.round(rgb.getChannelValue('green'))

	const b = Math.round(rgb.getChannelValue('blue'))

	return rgbaToHex(r, g, b, 1)

}



function safeParseColor(hex: string): KobalteColor {

	const normalized = normalizeHex(hex)

	if (!normalized) return KobalteParseColor('#000000')

	try {

		return KobalteParseColor(normalized)

	} catch {

		return KobalteParseColor('#000000')

	}

}



export function ColorPicker(props: ColorPickerProps) {

	const [local, rest] = splitProps(props, [

		'value',

		'onValueChange',

		'presets',

		'label',

		'error',

		'helperText',

		'bare',

		'required',

		'optional',

		'onErrorClear',

		'size',

		'disabled',

		'class',

		'lastUsedCount',

		'allowedFormats',

		'predefined',

	])

	const icons = useIcons()

	const triggerId = createUniqueId()

	const hasError = () => !!local.error



	const presets = () => local.presets ?? [...DEFAULT_PRESETS]

	const lastUsedMax = () => local.lastUsedCount ?? 9



	const [customOpen, setCustomOpen] = createSignal(false)

	const [lastUsed, setLastUsed] = createSignal<string[]>([])



	const currentHex = () => {

		const v = local.value?.trim()

		if (!v) return ''

		return normalizeHex(v)

	}



	const addToLastUsed = (hex: string) => {

		const n = normalizeHex(hex)

		if (!n) return

		setLastUsed((prev) => {

			const next = [n, ...prev.filter((c) => c !== n)].slice(0, lastUsedMax())

			return next

		})

	}



	const handlePresetClick = (hex: string) => {

		const n = normalizeHex(hex)

		if (n) {

			if (local.error && local.onErrorClear) local.onErrorClear()

			local.onValueChange?.(n)

			addToLastUsed(n)

		}

	}



	const handleCustomApply = (hex: string) => {

		const n = normalizeHex(hex)

		if (!n) return

		if (local.error && local.onErrorClear) local.onErrorClear()

		local.onValueChange?.(n)

		addToLastUsed(n)

		setCustomOpen(false)

	}



	const presetSet = createMemo(() => new Set(presets().map(normalizeHex).filter(Boolean)))

	const isPreset = (hex: string) => presetSet().has(normalizeHex(hex))



	return (

		<div class={cn('w-full', local.class)} {...rest}>

			<Show when={!local.bare && local.label}>

				<div class="flex items-center justify-between gap-2 mb-1.5">

					<label for={triggerId} class={cn('block text-sm font-medium', hasError() ? 'text-danger-600' : 'text-ink-700')}>

						{local.label}

						<Show when={local.required}>

							<span class="text-danger-500 ml-0.5" aria-hidden="true">*</span>

						</Show>

					</label>

					<Show when={!local.required && local.optional}>

						<span class="text-xs text-ink-500">optional</span>

					</Show>

				</div>

			</Show>



			<div class="flex flex-wrap items-center gap-2">

				{/* Current color swatch + trigger for custom */}

				<KobaltePopover open={customOpen()} onOpenChange={setCustomOpen}>

					<KobaltePopover.Trigger

						as="button"

						type="button"

						id={triggerId}

						disabled={local.disabled}

						class={cn(

							'h-10 w-10 shrink-0 rounded-lg border-2 shadow-sm transition outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 disabled:opacity-50 disabled:cursor-pointer',

							hasError() ? 'border-danger-500 hover:border-danger-600' : 'border-surface-border hover:border-ink-300',

						)}

						style={{ 'background-color': currentHex() || 'transparent' }}

						title="Choose color"

						aria-label="Choose color"

					/>

					<KobaltePopover.Portal>

						<KobaltePopover.Content

							class="z-[200] outline-none"

						>

							<ColorPickerCustomPanel

								value={currentHex()}

								isOpen={customOpen()}

								onApply={handleCustomApply}

								onCancel={() => setCustomOpen(false)}

								lastUsed={lastUsed()}

								onLastUsedClick={(hex) => {

									handleCustomApply(hex)

								}}

								allowedFormats={local.allowedFormats ?? ['hex']}

								predefined={local.predefined}

							/>

						</KobaltePopover.Content>

					</KobaltePopover.Portal>

				</KobaltePopover>



				<Show when={(local.size ?? 'md') !== 'sm'}>

					{/* Preset swatches */}

					<div class="flex flex-wrap gap-1.5">

						<For each={presets()}>

							{(hex) => (

								<button

									type="button"

									class={cn(

										'h-8 w-8 shrink-0 rounded-full border-2 shadow-sm transition hover:scale-105 outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',

										normalizeHex(hex) === currentHex()

											? 'border-primary-500 ring-2 ring-primary-200'

											: 'border-surface-border hover:border-ink-300',

									)}

									style={{ 'background-color': hex }}

									title={hex}

									aria-label={`Set color to ${hex}`}

									onClick={() => handlePresetClick(hex)}

									disabled={local.disabled}

								/>

							)}

						</For>

						{/* Custom button */}

						<button

							type="button"

							class={cn(

								'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-surface-border bg-surface-base text-ink-500 transition hover:border-primary-400 hover:bg-primary-50 hover:text-primary-600 outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',

								!isPreset(currentHex()) && currentHex()

									? 'border-primary-400 bg-primary-50 text-primary-600'

									: '',

							)}

							title="Custom color"

							aria-label="Custom color"

							onClick={() => setCustomOpen(true)}

							disabled={local.disabled}

						>

							{icons.pipette({ class: 'h-4 w-4', 'aria-hidden': 'true' })}

						</button>

					</div>

				</Show>

			</div>



			<Show when={!local.bare && local.helperText && !hasError()}>

				<p class="mt-2 text-sm text-ink-500">{local.helperText}</p>

			</Show>

			<Show when={!local.bare && hasError()}>

				<p class="mt-2 text-sm text-danger-600">{local.error}</p>

			</Show>

		</div>

	)

}



/** Matches 3, 6, or 8 digit hex (with optional leading #). 8-digit = #RRGGBBAA (CSS Color Level 4). */

function isValidHex(v: string): boolean {

	const hex = v.trim().replace(/^#/, '')

	return /^[0-9a-fA-F]{3}$/.test(hex) || /^[0-9a-fA-F]{6}$/.test(hex) || /^[0-9a-fA-F]{8}$/.test(hex)

}



interface ColorPickerCustomPanelProps {

	value: string

	/** When true, panel is visible. Used to sync color from value when popover opens. */

	isOpen?: boolean

	onApply: (hex: string) => void

	onCancel: () => void

	lastUsed: string[]

	onLastUsedClick: (hex: string) => void

	allowedFormats: ColorFormat[]

	/** Predefined colors shown below last used. */

	predefined?: string[]

}



function ColorPickerCustomPanel(props: ColorPickerCustomPanelProps) {

	const icons = useIcons()

	const formats = () => props.allowedFormats

	const defaultFormat = () => (formats().includes('hex') ? 'hex' : formats()[0] ?? 'hex')

	const [format, setFormat] = createSignal<ColorFormat>(defaultFormat())



	const thumbBaseClass = 'absolute rounded-full border-2 border-white shadow touch-none'



	createEffect(() => {

		if (!props.allowedFormats.includes(format())) setFormat(defaultFormat())

	})



	const initialColor = () => {

		const v = props.value

		if (v && isValidHex(v)) return safeParseColor(normalizeHex(v))

		return KobalteParseColor('#000000')

	}



	const [color, setColor] = createSignal<KobalteColor>(initialColor())

	const [hexText, setHexText] = createSignal(colorToHex(initialColor()))

	createEffect(on(() => props.isOpen ?? false, (open, wasOpen) => {

		if (open && !wasOpen && props.value && isValidHex(props.value)) {

			const c = safeParseColor(normalizeHex(props.value))

			setColor(c)

			setHexText(colorToHex(c))

		}

	}, { defer: true }))



	const hex = () => colorToHex(color())



	createEffect(on(hex, setHexText))



	const formatTabs: { id: ColorFormat; label: string }[] = [

		{ id: 'hex', label: 'Hex' },

		{ id: 'rgb', label: 'RGB' },

		{ id: 'hsl', label: 'HSL' },

		{ id: 'hsb', label: 'HSB' },

	]

	const visibleFormatTabs = () => formatTabs.filter((tab) => props.allowedFormats.includes(tab.id))

	const showFormatTabs = () => visibleFormatTabs().length > 1



	return (

		<div class="w-[320px] overflow-hidden rounded-xl border border-surface-border bg-surface-raised p-4 shadow-xl">

			<div class="mb-3 flex items-center justify-between">

				<span class="text-sm font-semibold text-ink-900">Color Picker</span>

				<button

					type="button"

					class="rounded p-1 text-ink-400 hover:bg-surface-overlay hover:text-ink-600"

					onClick={props.onCancel}

					aria-label="Close"

				>

					{icons.close({ class: 'h-4 w-4', 'aria-hidden': 'true' })}

				</button>

			</div>



			{/* 2D saturation/brightness area (HSB). Use Kobalte default gradient so brightness (dark/light) axis matches interaction. */}

			<div class="mb-3">

				<KobalteColorArea

					value={color()}

					onChange={setColor}

					colorSpace="hsb"

					xChannel="saturation"

					yChannel="brightness"

					class="relative block w-full"

				>

					<KobalteColorArea.Background class="relative block h-32 w-full rounded-lg border border-surface-border cursor-crosshair touch-none" />

					<KobalteColorArea.Thumb

						class={cn('pointer-events-none h-4 w-4 shadow-md [transform:translate(-50%,-50%)]', thumbBaseClass)}

					>

						<KobalteColorArea.HiddenInputX />

						<KobalteColorArea.HiddenInputY />

					</KobalteColorArea.Thumb>

				</KobalteColorArea>

			</div>



			{/* Hue slider */}

			<div class="mb-3">

				<KobalteColorSlider channel="hue" value={color()} onChange={setColor} colorSpace="hsb">

					<KobalteColorSlider.Track class="relative block h-6 w-full rounded-full border border-surface-border cursor-pointer touch-none">

						<KobalteColorSlider.Thumb

							class={cn('h-6 w-6', thumbBaseClass)}

							style={{ top: 'calc(50%)', transform: 'translate(-50%, -50%)' }}

						>

							<KobalteColorSlider.Input class="sr-only" />

						</KobalteColorSlider.Thumb>

					</KobalteColorSlider.Track>

				</KobalteColorSlider>

			</div>



			{/* Format tabs (only when more than one format allowed) */}

			<Show when={showFormatTabs()}>

				<div class="mb-3 flex gap-1 rounded-lg bg-surface-overlay p-1">

					<For each={visibleFormatTabs()}>

						{(tab) => (

							<button

								type="button"

								class={cn(

									'flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition',

									format() === tab.id

										? 'bg-surface-raised text-ink-900 shadow-sm'

										: 'text-ink-600 hover:text-ink-900',

								)}

								onClick={() => setFormat(tab.id)}

							>

								{tab.label}

							</button>

						)}

					</For>

				</div>

			</Show>



			{/* Channel fields based on format */}

			<div class="mb-4 flex flex-wrap items-center gap-2">

				<Show when={format() === 'hex'}>

					<div class="flex flex-1 items-center gap-2">

						{icons.pipette({ class: 'h-4 w-4 shrink-0 text-ink-400', 'aria-hidden': 'true' })}

						<input

							type="text"

							value={hexText()}

							onInput={(e) => {

								const v = (e.target as HTMLInputElement).value

								setHexText(v)

								if (isValidHex(v)) setColor(safeParseColor(v))

							}}

							aria-label="Hex color value"

							class="w-full rounded-lg border border-surface-border bg-surface-raised px-2 py-1.5 font-mono text-sm text-ink-900"

						/>

					</div>

				</Show>

				<Show when={format() === 'hsl'}>

					<KobalteColorChannelField value={color()} onChange={setColor} channel="hue" colorSpace="hsl">

						<div class="flex items-center gap-1">

							<KobalteColorChannelField.Label class="sr-only">H</KobalteColorChannelField.Label>

							<KobalteColorChannelField.Input class="w-14 rounded border border-surface-border bg-surface-raised px-1.5 py-1 text-sm text-ink-900" />

						</div>

					</KobalteColorChannelField>

					<KobalteColorChannelField value={color()} onChange={setColor} channel="saturation" colorSpace="hsl">

						<div class="flex items-center gap-1">

							<KobalteColorChannelField.Label class="sr-only">S</KobalteColorChannelField.Label>

							<KobalteColorChannelField.Input class="w-14 rounded border border-surface-border bg-surface-raised px-1.5 py-1 text-sm text-ink-900" />

						</div>

					</KobalteColorChannelField>

					<KobalteColorChannelField value={color()} onChange={setColor} channel="lightness" colorSpace="hsl">

						<div class="flex items-center gap-1">

							<KobalteColorChannelField.Label class="sr-only">L</KobalteColorChannelField.Label>

							<KobalteColorChannelField.Input class="w-14 rounded border border-surface-border bg-surface-raised px-1.5 py-1 text-sm text-ink-900" />

						</div>

					</KobalteColorChannelField>

				</Show>

				<Show when={format() === 'rgb'}>

					<KobalteColorChannelField value={color()} onChange={setColor} channel="red" colorSpace="rgb">

						<div class="flex items-center gap-1">

							<KobalteColorChannelField.Label class="sr-only">R</KobalteColorChannelField.Label>

							<KobalteColorChannelField.Input class="w-14 rounded border border-surface-border bg-surface-raised px-1.5 py-1 text-sm text-ink-900" />

						</div>

					</KobalteColorChannelField>

					<KobalteColorChannelField value={color()} onChange={setColor} channel="green" colorSpace="rgb">

						<div class="flex items-center gap-1">

							<KobalteColorChannelField.Label class="sr-only">G</KobalteColorChannelField.Label>

							<KobalteColorChannelField.Input class="w-14 rounded border border-surface-border bg-surface-raised px-1.5 py-1 text-sm text-ink-900" />

						</div>

					</KobalteColorChannelField>

					<KobalteColorChannelField value={color()} onChange={setColor} channel="blue" colorSpace="rgb">

						<div class="flex items-center gap-1">

							<KobalteColorChannelField.Label class="sr-only">B</KobalteColorChannelField.Label>

							<KobalteColorChannelField.Input class="w-14 rounded border border-surface-border bg-surface-raised px-1.5 py-1 text-sm text-ink-900" />

						</div>

					</KobalteColorChannelField>

				</Show>

				<Show when={format() === 'hsb'}>

					<KobalteColorChannelField value={color()} onChange={setColor} channel="hue" colorSpace="hsb">

						<div class="flex items-center gap-1">

							<KobalteColorChannelField.Label class="sr-only">H</KobalteColorChannelField.Label>

							<KobalteColorChannelField.Input class="w-14 rounded border border-surface-border bg-surface-raised px-1.5 py-1 text-sm text-ink-900" />

						</div>

					</KobalteColorChannelField>

					<KobalteColorChannelField value={color()} onChange={setColor} channel="saturation" colorSpace="hsb">

						<div class="flex items-center gap-1">

							<KobalteColorChannelField.Label class="sr-only">S</KobalteColorChannelField.Label>

							<KobalteColorChannelField.Input class="w-14 rounded border border-surface-border bg-surface-raised px-1.5 py-1 text-sm text-ink-900" />

						</div>

					</KobalteColorChannelField>

					<KobalteColorChannelField value={color()} onChange={setColor} channel="brightness" colorSpace="hsb">

						<div class="flex items-center gap-1">

							<KobalteColorChannelField.Label class="sr-only">B</KobalteColorChannelField.Label>

							<KobalteColorChannelField.Input class="w-14 rounded border border-surface-border bg-surface-raised px-1.5 py-1 text-sm text-ink-900" />

						</div>

					</KobalteColorChannelField>

				</Show>

			</div>



			{/* Last used */}

			<Show when={props.lastUsed.length > 0}>

				<div class="mb-4">

					<p class="mb-1.5 text-xs font-medium text-ink-500">Last used</p>

					<div class="flex flex-wrap gap-1.5">

						<For each={props.lastUsed}>

							{(hex) => (

								<button

									type="button"

									class="h-7 w-7 shrink-0 rounded-md border border-surface-border shadow-sm transition hover:scale-105 outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"

									style={{ 'background-color': hex }}

									title={hex}

									aria-label={`Set color to ${hex}`}

									onClick={() => props.onLastUsedClick(hex)}

								/>

							)}

						</For>

					</div>

				</div>

			</Show>



			{/* Predefined (e.g. theme presets) */}

			<Show when={props.predefined && props.predefined.length > 0}>

				<div class="mb-4">

					<p class="mb-1.5 text-xs font-medium text-ink-500">Presets</p>

					<div class="flex flex-wrap gap-1.5">

						<For each={props.predefined!}>

							{(hex) => (

								<button

									type="button"

									class="h-7 w-7 shrink-0 rounded-md border border-surface-border shadow-sm transition hover:scale-105 outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"

									style={{ 'background-color': hex }}

									title={hex}

									aria-label={`Set color to ${hex}`}

									onClick={() => { const n = normalizeHex(hex); if (n) props.onApply(n) }}

								/>

							)}

						</For>

					</div>

				</div>

			</Show>



			<div class="flex justify-end gap-2">

				<Button variant="outlined" size="sm" onClick={props.onCancel}>

					Cancel

				</Button>

				<Button variant="primary" size="sm" onClick={() => props.onApply(hex())} aria-label="Apply selected color">

					Apply

				</Button>

			</div>

		</div>

	)

}

