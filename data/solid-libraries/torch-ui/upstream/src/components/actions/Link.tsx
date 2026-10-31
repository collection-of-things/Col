import { type JSX, splitProps, Show } from 'solid-js'
import { cn } from '../../utilities/classNames'

export type LinkVariant = 'primary' | 'muted'

export interface LinkProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
	/** Visual style. Default: "primary" */
	variant?: LinkVariant
	children?: JSX.Element
	/** Icon rendered before the text. */
	iconStart?: JSX.Element
	/** Icon rendered after the text. */
	iconEnd?: JSX.Element
}

const linkVariants: Record<LinkVariant, string> = {
	primary:
		'text-primary-500 font-medium hover:text-primary-600 hover:underline hover:underline-offset-4 focus-visible:ring-primary-500/50',
	muted:
		'text-ink-500 hover:text-ink-700 hover:underline hover:underline-offset-4 focus-visible:ring-ink-500/50',
}

/** Styled anchor link with primary and muted variants. */
export function Link(props: LinkProps) {
	const [local, others] = splitProps(props, ['variant', 'class', 'children', 'iconStart', 'iconEnd'])
	const hasIcon = () => !!local.iconStart || !!local.iconEnd

	return (
		<a
			class={cn(
				'outline-none focus-visible:ring-2 rounded',
				'inline-flex items-center',
			hasIcon() && 'gap-1',
			linkVariants[local.variant ?? 'primary'],
			local.class
			)}
			{...others}
		>
			<Show when={local.iconStart}>{local.iconStart}</Show>
			{local.children}
			<Show when={local.iconEnd}>{local.iconEnd}</Show>
		</a>
	)
}
