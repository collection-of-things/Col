import type { JSX } from 'solid-js'
import { Show, splitProps, createUniqueId } from 'solid-js'
import { cn } from '../../utilities/classNames'

export interface EmptyStateProps extends JSX.HTMLAttributes<HTMLDivElement> {
	title: string
	description?: JSX.Element
	icon?: JSX.Element
	actions?: JSX.Element
	/** When true, sets role="status" + aria-live="polite" so screen readers announce the empty state. Default: false. */
	announce?: boolean
}

export function EmptyState(props: EmptyStateProps) {
	const [local, rest] = splitProps(props, [
		'title',
		'description',
		'icon',
		'actions',
		'announce',
		'class',
	])

	const uid = createUniqueId()
	const titleId = `empty-title-${uid}`
	const descId = `empty-desc-${uid}`

	return (
		<div
			{...rest}
			class={cn(
				'flex flex-col items-center justify-center gap-4 px-6 py-16 text-center',
				local.class
			)}
			role={local.announce ? 'status' : undefined}
			aria-live={local.announce ? 'polite' : undefined}
			aria-labelledby={local.announce ? titleId : undefined}
			aria-describedby={local.announce && local.description ? descId : undefined}
		>
			<Show when={local.icon}>
				<div
					class="flex h-16 w-16 items-center justify-center rounded-full bg-surface-overlay text-ink-400"
					aria-hidden="true"
				>
					{local.icon}
				</div>
			</Show>
			<div class="space-y-1">
				<h3 id={titleId} class="text-base font-semibold text-ink-900">{local.title}</h3>
				<Show when={local.description}>
					<p id={descId} class="max-w-sm text-sm text-ink-500">{local.description}</p>
				</Show>
			</div>
			<Show when={local.actions}>
				<div class="flex flex-wrap items-center justify-center gap-2">
					{local.actions}
				</div>
			</Show>
		</div>
	)
}
