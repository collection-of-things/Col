import { Dynamic } from 'solid-js/web'
import type { JSX } from 'solid-js'
import { cn } from '../../utilities/classNames'

export interface PageHeadingProps {
	/** Main heading text */
	title: string
	/** Optional description (plain string) */
	description?: string
	/** Optional description as JSX (e.g. with links or emphasis). Takes precedence over description. */
	descriptionContent?: JSX.Element
	/** Optional class for the description paragraph */
	descriptionClass?: string
	/** Optional class for the wrapper */
	class?: string
	/** Optional class for the heading element */
	titleClass?: string
	/** Heading level: 1 or 2. Default 1. */
	level?: 1 | 2
	/** Semantic heading element to render. Defaults to h1/h2 based on level. */
	as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

/** Page title + optional description. Use for consistent page headers. */
export function PageHeading(props: PageHeadingProps): JSX.Element {
	const descClass = () =>
		cn('text-[0.9375rem] text-ink-500', props.descriptionClass ?? 'mt-3')
	const level = () => props.level ?? 1
	const headingTag = () => props.as ?? (level() === 2 ? 'h2' : 'h1')
	return (
		<div class={cn(props.class)}>
			<Dynamic
				component={headingTag()}
				class={cn(
					'font-bold tracking-tight text-ink-900',
					level() === 2 ? 'text-xl' : 'text-2xl',
					props.titleClass
				)}
			>
				{props.title}
			</Dynamic>
			{props.descriptionContent != null ? (
				<p class={descClass()}>{props.descriptionContent}</p>
			) : props.description != null && props.description !== '' ? (
				<p class={descClass()}>{props.description}</p>
			) : null}
		</div>
	)
}
