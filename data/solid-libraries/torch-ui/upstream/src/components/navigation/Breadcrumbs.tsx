import { type JSX, For, Show, splitProps } from 'solid-js'
import { Breadcrumbs as KobalteBreadcrumbs } from '@kobalte/core/breadcrumbs'
import { cn } from '../../utilities/classNames'
import { useIcons } from '../../icons'

export interface BreadcrumbItem {
	/** Label to show. */
	label: string
	/** If set, rendered as a link (anchor). Use your router's Link in the app if needed. */
	href?: string
}

export interface BreadcrumbsProps {
	/** List of items. Last item is typically current page (no href). */
	items: BreadcrumbItem[]
	/** Optional separator between items. Default ChevronRight. */
	separator?: JSX.Element
	/** Use light (white-based) text for dark backgrounds in light mode */
	inverted?: boolean
	/** Root class. */
	class?: string
}

function DefaultSeparator(props: { inverted?: boolean }): JSX.Element {
	const icons = useIcons()
	return icons.chevronRight({
		class: cn('h-4 w-4 shrink-0', props.inverted ? 'text-white/50' : 'text-ink-400'),
		'aria-hidden': 'true',
	})
}

export function Breadcrumbs(props: BreadcrumbsProps) {
	const [local] = splitProps(props, ['items', 'separator', 'inverted', 'class'])

	const separator = () => local.separator ?? <DefaultSeparator inverted={local.inverted} />
	const inv = () => local.inverted ?? false

	return (
		<KobalteBreadcrumbs class={cn('flex flex-wrap items-center gap-1 text-sm', local.class)}>
			<ol class="flex flex-wrap items-center gap-1">
				<For each={local.items}>
					{(item, i) => {
						const isLast = () => i() === local.items.length - 1
						return (
							<li
								class="flex items-center gap-1"
								classList={{
									'text-ink-500': !isLast() && !inv(),
									'text-white/50': !isLast() && inv(),
								}}
							>
								<Show when={i() > 0}>
									<KobalteBreadcrumbs.Separator class="flex shrink-0">
										{separator()}
									</KobalteBreadcrumbs.Separator>
								</Show>
								<Show
									when={!!item.href && !isLast()}
									fallback={
										<span
											class={cn('font-medium', isLast() ? (inv() ? 'text-white' : 'text-ink-800') : (inv() ? 'text-white/50' : 'text-ink-500'))}
											{...(isLast() && { 'aria-current': 'page' })}
										>
											{item.label}
										</span>
									}
								>
									<KobalteBreadcrumbs.Link
										href={item.href!}
										class={cn(
											'underline-offset-2 hover:underline',
											inv()
												? 'text-white/70 hover:text-white'
												: 'text-ink-600 hover:text-ink-900',
										)}
									>
										{item.label}
									</KobalteBreadcrumbs.Link>
								</Show>
							</li>
						)
					}}
				</For>
			</ol>
		</KobalteBreadcrumbs>
	)
}
