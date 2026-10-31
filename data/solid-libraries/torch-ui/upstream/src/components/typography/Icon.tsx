import { type JSX, splitProps } from 'solid-js'
import { cn } from '../../utilities/classNames'

export interface IconProps extends Omit<JSX.ImgHTMLAttributes<HTMLImageElement>, 'children' | 'width' | 'height'> {
	/** Image URL (local path or CDN). */
	src: string
	/** Size in pixels (sets both width and height). Default: 16. */
	size?: number
}

/**
 * Renders a custom icon image with consistent sizing and styling.
 * Point src at a local asset or CDN URL.
 *
 * Decorative by default (`alt=""`, `aria-hidden="true"`). To make the icon
 * meaningful to screen readers, pass both `alt="description"` and
 * `aria-hidden="false"` — the spread overrides both defaults.
 *
 * <Icon src="/images/icons/solid.svg" size={20} />
 */
export function Icon(props: IconProps) {
	const [local, others] = splitProps(props, ['src', 'size', 'class'])
	const size = () => local.size ?? 16

	return (
		<img
			alt=""
			aria-hidden="true"
			src={local.src}
			width={size()}
			height={size()}
			class={cn('inline-block shrink-0', local.class)}
			{...others}
		/>
	)
}
