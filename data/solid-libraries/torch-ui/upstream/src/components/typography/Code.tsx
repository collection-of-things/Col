import { type JSX, Show, splitProps } from 'solid-js'
import { Copy } from '../actions'
import { cn } from '../../utilities/classNames'

type InlineProps = JSX.HTMLAttributes<HTMLElement> & { block?: false }
type BlockProps = JSX.HTMLAttributes<HTMLDivElement> & { block: true }

type Copyable = { copyable: true; text: string }
type NotCopyable = { copyable?: false; text?: string }

type BaseProps = {
	/** Inline or single-line code. */
	children?: JSX.Element
	/** Optional class. */
	class?: string
} & (Copyable | NotCopyable)

export type CodeProps = (InlineProps | BlockProps) & BaseProps

/**
 * Inline or single-line code. Use for variable names, commands, or short snippets in text.
 * Set block to get a one-line block with optional copy button.
 */
export function Code(props: CodeProps) {
	// mx-0.5: intentional horizontal spacing so inline code doesn't touch adjacent text.
	const inlineClass =
		'inline-flex items-baseline rounded bg-surface-overlay px-2 leading-none text-[0.9em] font-mono text-ink-800 mx-0.5'

	const blockClass =
		'flex items-center gap-2 rounded-lg border border-surface-border bg-surface-base px-3 py-2 text-sm font-mono text-ink-800'

	if (props.block) {
		const [local, divProps] = splitProps(props, [
			'children',
			'block',
			'copyable',
			'text',
			'class',
		])

		const copyText = () => (local.text ?? '').trim()
		const displayText = () => (local.children ?? copyText())

		return (
			<div
				class={cn('w-full relative', blockClass, local.copyable && 'pr-12', local.class)}
				{...divProps}
			>
				<code class="flex-1 min-w-0 truncate block">{displayText()}</code>

				<Show when={local.copyable && copyText()}>
					<div class="absolute right-2 top-1/2 -translate-y-1/2 shrink-0">
						<Copy text={copyText()} display="icon-only" variant="ghost" size="xs" />
					</div>
				</Show>
			</div>
		)
	}

	const [local, codeProps] = splitProps(props, [
		'children',
		'block',
		'copyable',
		'text',
		'class',
	])

	return (
		<code class={cn(inlineClass, local.class)} {...codeProps}>
			{local.children}
		</code>
	)
}
