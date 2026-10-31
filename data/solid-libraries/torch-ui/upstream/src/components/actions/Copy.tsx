import { type JSX, createMemo, splitProps } from 'solid-js'
import { Button } from './Button'
import type { ButtonVariant } from './Button'
import { type ComponentSize } from '../../types/component-size'
import { useCopyToClipboard } from './useCopyToClipboard'
import { cn } from '../../utilities/classNames'
import { useIcons } from '../../icons'

export type CopyDisplay = 'text' | 'icon-and-text' | 'icon-only'

const filledVariants: ButtonVariant[] = ['primary', 'danger', 'success', 'warning', 'info']
const borderlessVariants: ButtonVariant[] = ['ghost', 'link', 'danger-link']

export interface CopyProps extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'href' | 'target' | 'rel'> {
	/** Text to copy to clipboard. */
	text: string
	/** How to show the button: "Copy" only, icon + "Copy", or icon only. */
	display?: CopyDisplay
	/** Label when not copied. Default: "Copy" */
	label?: string
	/** Label after copy. Default: "Copied" */
	copiedLabel?: string
	/** Button visual variant. Default: outlined */
	variant?: ButtonVariant
	size?: ComponentSize
	class?: string
	/** Called after successful copy. */
	onCopied?: () => void
}

/**
 * Button that copies the given text to the clipboard and shows visual feedback when copied.
 * Use display="text" | "icon-and-text" | "icon-only" for word only, icon + word, or icon only.
 */
export function Copy(props: CopyProps) {
	const [copy, copied] = useCopyToClipboard()
	const icons = useIcons()
	const [local, rest] = splitProps(props, [
		'text',
		'display',
		'label',
		'copiedLabel',
		'variant',
		'size',
		'class',
		'onCopied',
	])
	async function handleClick() {
		const ok = await copy(local.text)
		if (ok) local.onCopied?.()
	}

	const display = () => local.display ?? 'icon-and-text'
	const label = () => local.label ?? 'Copy'
	const copiedLabel = () => local.copiedLabel ?? 'Copied'
	const isIconOnly = () => display() === 'icon-only'
	const showIcon = () => display() === 'icon-and-text' || display() === 'icon-only'

	const checkIcon = createMemo(() => icons.check({ class: 'h-4 w-4 shrink-0', 'aria-hidden': 'true' }))
	const copyIcon = createMemo(() => icons.copy({ class: 'h-4 w-4 shrink-0', 'aria-hidden': 'true' }))
	const currentVariant = () => local.variant ?? 'outlined'
	const resolvedVariant = (): ButtonVariant =>
		copied()
			? filledVariants.includes(currentVariant())
				? 'success'
				: 'success-outline'
			: currentVariant()
	/** When copied, ghost/link stay borderless (success-outline has a border; we remove it). */
	const copiedClass = () =>
		copied() && borderlessVariants.includes(currentVariant())
			? '!border-0'
			: ''

	return (
		<Button
			type="button"
			variant={resolvedVariant()}
			size={local.size ?? 'sm'}
			iconOnly={isIconOnly()}
			icon={isIconOnly() ? (copied() ? checkIcon() : copyIcon()) : undefined}
			startIcon={!isIconOnly() && showIcon() ? (copied() ? checkIcon() : copyIcon()) : undefined}
			label={copied() ? copiedLabel() : label()}
			class={cn('shrink-0', copiedClass(), local.class)}
			title={isIconOnly() ? (copied() ? copiedLabel() : label()) : undefined}
			aria-label={isIconOnly() ? (copied() ? copiedLabel() : label()) : undefined}
			onClick={handleClick}
			{...(rest as Partial<import('./Button').ButtonProps>)}
		/>
	)
}
