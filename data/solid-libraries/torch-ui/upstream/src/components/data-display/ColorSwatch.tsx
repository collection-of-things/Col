import { splitProps, createMemo, type JSX } from 'solid-js'
import { ColorSwatch as KobalteColorSwatch } from '@kobalte/core/color-swatch'
import { parseColor } from '@kobalte/core/colors'
import { cn } from '../../utilities/classNames'
import { normalizeHex } from '../../utilities/colorUtils'

export type ColorSwatchVariant = 'rounded' | 'circle' | 'square'

export interface ColorSwatchProps {
	/** Color as hex string (e.g. #3b82f6). */
	value: string
	/** Shape: rounded (default), circle, or square. */
	variant?: ColorSwatchVariant
	/** Optional accessible name for the color. */
	colorName?: string
	class?: string
	style?: JSX.CSSProperties
	'aria-label'?: string
}

const variantClass: Record<ColorSwatchVariant, string> = {
	rounded: 'rounded-lg',
	circle: 'rounded-full',
	square: 'rounded-none',
}

/** Renders a color swatch (Kobalte ColorSwatch). Value is a hex string. */
export function ColorSwatch(props: ColorSwatchProps) {
	const [local, a11y, rest] = splitProps(props, ['value', 'variant', 'colorName', 'class', 'style'], ['aria-label'])
	const normalized = createMemo(() => normalizeHex(local.value ?? ''))
	const color = createMemo(() => {
		const hex = normalized()
		if (!hex) return parseColor('hsl(0, 0%, 50%)')
		try {
			return parseColor(hex)
		} catch {
			if (import.meta.env.DEV) console.warn(`ColorSwatch: invalid hex value "${hex}" — falling back to gray.`)
			return parseColor('hsl(0, 0%, 50%)')
		}
	})
	const shapeClass = createMemo(() => variantClass[local.variant ?? 'rounded'])
	return (
		<KobalteColorSwatch
			value={color()}
			colorName={local.colorName}
			aria-label={a11y['aria-label'] ?? local.colorName ?? normalized() ?? 'Color swatch'}
			class={cn(
				'block shrink-0 border-2 border-surface-border shadow-sm',
				shapeClass(),
				local.class
			)}
			style={local.style}
			{...rest}
		/>
	)
}
