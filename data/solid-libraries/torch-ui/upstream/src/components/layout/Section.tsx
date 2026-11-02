import type { JSX } from 'solid-js'
import { splitProps } from 'solid-js'
import { cn } from '../../utilities/classNames'

export interface SectionProps extends Omit<JSX.HTMLAttributes<HTMLElement>, 'children'> {
	/** Section title (e.g. h2) */
	title?: string
	/** Optional description below title */
	description?: string
	/** Optional description as JSX */
	descriptionContent?: JSX.Element
	/** Optional id for the section element (for anchor links / "On this page" TOC). */
	id?: string
	/** Optional class for the section wrapper */
	class?: string
	/** Optional class for the title */
	titleClass?: string
	/** Optional class for the description paragraph */
	descriptionClass?: string
	children: JSX.Element
}

/** Section block with optional title and description. Use for repeated content blocks (e.g. admin pages). */
export function Section(props: SectionProps): JSX.Element {
	const [local, others] = splitProps(props, [
		'title',
		'description',
		'descriptionContent',
		'id',
		'class',
		'titleClass',
		'descriptionClass',
		'children',
		'ref',
	])
	return (
		<section ref={local.ref} id={local.id} class={cn(local.class)} {...others}>
			{local.title != null && local.title !== '' && (
				<h2
					class={cn(
						'mb-2 text-lg font-semibold text-ink-900',
						local.titleClass
					)}
				>
					{local.title}
				</h2>
			)}
			{local.descriptionContent != null ? (
				<div class={cn('mb-4 text-sm text-ink-500', local.descriptionClass)}>
					{local.descriptionContent}
				</div>
			) : local.description != null && local.description !== '' ? (
				<p class={cn('mb-4 text-sm text-ink-500', local.descriptionClass)}>
					{local.description}
				</p>
			) : null}
			{local.children}
		</section>
	)
}
