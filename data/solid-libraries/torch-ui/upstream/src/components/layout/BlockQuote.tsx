import type { JSX } from 'solid-js'
import { cn } from '../../utilities/classNames'

export type BlockQuoteJustify = 'start' | 'center' | 'end'

export interface BlockQuoteProps {
	/** Quote content (paragraph(s) or text). */
	children: JSX.Element | string
	/** Optional attribution (e.g. "— Author Name"). Rendered in a footer. */
	citation?: string | JSX.Element
	/** Optional cite URL for the blockquote source. Maps to the cite attribute on <blockquote>. */
	cite?: string
	/** Optional icon shown at the start of the quote. */
	icon?: JSX.Element
	/** Optional avatar (e.g. Avatar or img) shown to the left of the quote. */
	avatar?: JSX.Element
	/** Text alignment: start (left), center, or end (right). Default: start. */
	justify?: BlockQuoteJustify
	/** When true, omit the left border. Default: false. */
	noBorder?: boolean
	/** Optional class for the blockquote root. */
	class?: string
}

const justifyClass: Record<BlockQuoteJustify, string> = {
	start: 'text-start',
	center: 'text-center',
	end: 'text-end',
}

/** Semantic blockquote with optional icon, avatar, citation, and justification. */
export function BlockQuote(props: BlockQuoteProps): JSX.Element {
	const justify = () => props.justify ?? 'start'
	const alignClass = () => justifyClass[justify()]
	const hasCitation = () =>
		props.citation != null &&
		(typeof props.citation !== 'string' || props.citation.trim() !== '')

	return (
		<blockquote
			cite={props.cite}
			class={cn(
				'text-ink-700',
				!props.noBorder && 'border-l-4 border-primary-500 pl-4',
				props.class
			)}
		>
			<div class={cn('flex gap-3', props.avatar && 'items-start')}>
				{props.avatar && (
					<div class="shrink-0" aria-hidden="true">
						{props.avatar}
					</div>
				)}
				<div class={cn('min-w-0 flex-1', alignClass())}>
					{props.icon && (
						<div class="mb-2 text-primary-500 [&>svg]:h-8 [&>svg]:w-8" aria-hidden="true">
							{props.icon}
						</div>
					)}
					<div class="[&>p]:mb-2 [&>p:last-child]:mb-0">{props.children}</div>
					{hasCitation() && (
						<footer class="mt-2 text-sm text-ink-500">
							{props.citation}
						</footer>
					)}
				</div>
			</div>
		</blockquote>
	)
}
