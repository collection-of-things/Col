import { type JSX, Show, For, splitProps, createMemo } from 'solid-js'
import { cn } from '../../utilities/classNames'
import { useIcons } from '../../icons'

export type TimelineItemStatus = 'completed' | 'active' | 'pending' | 'error'
export type TimelineVariant = 'default' | 'compact' | 'outlined'
export type TimelineConnector = 'solid' | 'dashed' | 'dotted'

export interface TimelineItem {
	id?: string
	/** Main heading for the event */
	title: JSX.Element
	/** Secondary description text */
	description?: JSX.Element
	/** Timestamp or label shown beside the title */
	time?: JSX.Element
	/** Custom icon/content inside the dot. If omitted, a default dot or status icon renders. */
	icon?: JSX.Element
	/** Controls the dot color and default icon. Default: 'pending'. */
	status?: TimelineItemStatus
	/** Extra content slot rendered below description */
	content?: JSX.Element
	/** Override the dot color with any Tailwind bg class e.g. 'bg-purple-500' */
	color?: string
}

export interface TimelineProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'> {
	/** Timeline entries */
	items: TimelineItem[]
	/** Visual style. Default: 'default'. */
	variant?: TimelineVariant
	/** Connector line style. Default: 'solid'. */
	connector?: TimelineConnector
	/** Show connector line between items. Default: true. */
	showConnector?: boolean
	/** Place timestamp to the left of the connector. Default: false. */
	timeLeft?: boolean
}

const statusDotClass: Record<TimelineItemStatus, string> = {
	completed: 'bg-success-500 text-white',
	active: 'bg-primary-500 text-white ring-4 ring-primary-500/20',
	pending: 'bg-surface-raised text-ink-400 border-2 border-surface-border',
	error: 'bg-danger-500 text-white',
}

const statusConnectorClass: Record<TimelineItemStatus, string> = {
	completed: 'border-success-300',
	active: 'border-primary-300',
	pending: 'border-surface-border',
	error: 'border-danger-300',
}

function DefaultDotIcon(props: { status: TimelineItemStatus }) {
	const icons = useIcons()
	if (props.status === 'completed') return icons.check({ class: 'h-3 w-3', 'aria-hidden': 'true' })
	if (props.status === 'error') return icons.close({ class: 'h-3 w-3', 'aria-hidden': 'true' })
	if (props.status === 'active') {
		return <span class="block h-2 w-2 rounded-full bg-white" />
	}
	return null
}

export function Timeline(props: TimelineProps) {
	const [local, others] = splitProps(props, [
		'items',
		'variant',
		'connector',
		'showConnector',
		'timeLeft',
		'class',
	])

	const variant = () => local.variant ?? 'default'
	const connector = () => local.connector ?? 'solid'
	const showConnector = () => local.showConnector !== false
	const timeLeft = () => local.timeLeft ?? false

	const compact = createMemo(() => variant() === 'compact')
	const outlined = createMemo(() => variant() === 'outlined')

	const connectorBorderStyle = createMemo(() => {
		const style = connector()
		if (style === 'dashed') return 'border-dashed'
		if (style === 'dotted') return 'border-dotted'
		return 'border-solid'
	})

	return (
		<div
			class={cn('relative', local.class)}
			{...others}
		>
			<ol class="list-none">
				<For each={local.items}>
					{(item, idx) => {
						const isLast = () => idx() === local.items.length - 1
						const status = () => item.status ?? 'pending'
						const dotClass = () => item.color
							? `${item.color} text-white`
							: statusDotClass[status()]

						return (
							<li class={cn('relative flex', timeLeft() ? 'flex-row-reverse' : 'flex-row', compact() ? 'gap-3' : 'gap-4')}>
								{/* Left side: timestamp (when timeLeft) */}
								<Show when={timeLeft() && item.time}>
									<div class="w-28 shrink-0 pt-0.5 text-right">
										<span class="text-xs text-ink-400">{item.time}</span>
									</div>
								</Show>

								{/* Center: dot + connector */}
								<div class={cn('flex flex-col items-center', timeLeft() ? 'mx-0' : '')}>
									{/* Dot */}
									<div
										class={cn(
											'relative z-10 flex shrink-0 items-center justify-center rounded-full transition-all',
											compact() ? 'h-5 w-5' : 'h-8 w-8',
											dotClass(),
											outlined() && 'ring-2 ring-offset-2 ring-offset-surface-base',
										)}
										aria-hidden="true"
									>
										<Show when={item.icon} fallback={<DefaultDotIcon status={status()} />}>
											<span class={cn('flex items-center justify-center', compact() ? '[&>svg]:h-2.5 [&>svg]:w-2.5' : '[&>svg]:h-4 [&>svg]:w-4')}>
												{item.icon}
											</span>
										</Show>
									</div>

									{/* Connector line */}
									<Show when={showConnector() && !isLast()}>
										<div
											class={cn(
												'flex-1 border-l-2 my-1',
												connectorBorderStyle(),
												item.color
													? 'border-surface-border'
													: statusConnectorClass[status()],
											)}
											style={{ 'min-height': compact() ? '1rem' : '1.5rem' }}
											aria-hidden="true"
										/>
									</Show>
								</div>

								{/* Right side: content */}
								<div
									class={cn(
										'min-w-0 flex-1',
										!isLast() ? (compact() ? 'pb-4' : 'pb-6') : 'pb-0',
										timeLeft() ? 'text-right' : '',
									)}
								>
									{/* Title row */}
									<div class={cn('flex items-start gap-2', timeLeft() ? 'flex-row-reverse' : 'flex-row')}>
										<span class={cn('font-medium text-ink-900 leading-none text-sm')}>
											{item.title}
										</span>
										<Show when={!timeLeft() && item.time}>
											<span class="shrink-0 text-xs text-ink-400 mt-0.5">{item.time}</span>
										</Show>
									</div>

									{/* Description */}
									<Show when={item.description}>
										<div class={cn('mt-1 text-ink-500 leading-relaxed', compact() ? 'text-xs' : 'text-sm')}>
											{item.description}
										</div>
									</Show>

									{/* Extra content slot */}
									<Show when={item.content}>
										<div class="mt-2">
											{item.content}
										</div>
									</Show>
								</div>
							</li>
						)
					}}
				</For>
			</ol>
		</div>
	)
}
