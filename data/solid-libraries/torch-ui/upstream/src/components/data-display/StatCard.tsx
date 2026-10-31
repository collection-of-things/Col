import { type JSX, Show, splitProps, createMemo } from 'solid-js'
import { cn } from '../../utilities/classNames'

export interface StatCardProps extends JSX.HTMLAttributes<HTMLDivElement> {
	label: string
	/** Optional subtitle or category below the label (e.g. "Travel and tourism"). */
	subtitle?: string
	/** Optional icon (e.g. app logo) shown at top left. */
	icon?: JSX.Element
	/** Accessible label for the icon when it conveys meaning. When set, icon wrapper gets role="img" + aria-label. When omitted, the wrapper is transparent — the icon child controls its own accessibility. */
	iconLabel?: string
	/** Optional content at top right (e.g. Tag or "Connect" button). */
	topRight?: JSX.Element
	value?: string | number | null
	helperText?: string
	trendLabel?: string
	/** Optional secondary line below trendLabel (e.g. "last week"). Rendered smaller and muted. */
	trendSubLabel?: string
	/** Default: 'positive' (emerald). */
	trendVariant?: 'positive' | 'neutral' | 'negative'
	trendIcon?: JSX.Element
	emptyText?: string
	/** Optional content rendered below the trend block. Use for breakdown rows, sub-metrics, or any body content. Works with both chartPosition values. */
	body?: JSX.Element
	/** Optional chart or sparkline. Use chartPosition to place under the trend or to the right. */
	chart?: JSX.Element
	/** Where to render the chart: under the trend (default) or in a column to the right of the value/trend. */
	chartPosition?: 'under' | 'right'
	/** When set, the chart wrapper gets role="img" + aria-label instead of aria-hidden. The chart child should be decorative (aria-hidden) to avoid duplicate announcements. */
	chartA11yLabel?: string
	/** Tailwind height class for the chart wrapper. Default 'h-10' (under) or 'h-20' (right). */
	chartHeight?: string
	/** Tailwind width classes for the right-position chart wrapper. Default 'w-36 sm:w-44'. Only applies when chartPosition is 'right'. */
	chartWidth?: string
}

export function StatCard(props: StatCardProps) {
	const [local, others] = splitProps(props, [
		'label',
		'subtitle',
		'icon',
		'topRight',
		'value',
		'helperText',
		'trendLabel',
		'trendSubLabel',
		'trendVariant',
		'trendIcon',
		'emptyText',
		'body',
		'chart',
		'chartPosition',
		'chartA11yLabel',
		'chartHeight',
		'chartWidth',
		'iconLabel',
		'class',
	])

	const chartOnRight = () => local.chart != null && local.chartPosition === 'right'
	const hasHeaderContent = () => local.icon != null || local.topRight != null
	const contentMt = () => (hasHeaderContent() ? 'mt-5' : 'mt-2')
	const hasValue = () => local.value != null && local.value !== ''

	// Default: positive (success). Semantic tokens used per §1 — never raw Tailwind equivalents.
	const trendClasses = createMemo(() => {
		if (local.trendVariant === 'negative') return 'text-danger-600 dark:text-danger-400'
		if (local.trendVariant === 'neutral') return 'text-ink-600'
		return 'text-success-600 dark:text-success-400'
	})

	/** Value or empty-state placeholder. `small` uses text-2xl sm:text-3xl for the right-chart layout. */
	const ValueOrEmpty = (p: { small?: boolean }) => (
		<Show
			when={hasValue()}
			fallback={
				<div class="text-xs font-normal text-ink-400">
					{local.emptyText ?? 'No data yet'}
				</div>
			}
		>
			<div class={cn(
				'font-bold tracking-tight text-ink-900',
				p.small ? 'text-2xl sm:text-3xl' : 'text-3xl',
			)}>
				{local.value}
			</div>
		</Show>
	)

	/** Helper text + trend label/icon. `gap` controls top margin between value and trend. */
	const TrendBlock = (p: { gap?: string }) => (
		<>
			<Show when={local.helperText}>
				<div class="mt-1 text-sm text-ink-500">{local.helperText}</div>
			</Show>
			<Show when={local.trendLabel}>
				<div class={cn(p.gap ?? 'mt-3')}>
					<div class="flex items-center gap-1.5 text-sm font-medium">
						<Show when={local.trendIcon}>
							<span class={cn('flex shrink-0', trendClasses())}>{local.trendIcon}</span>
						</Show>
						<span class={cn('whitespace-nowrap', trendClasses())}>{local.trendLabel}</span>
					</div>
					<Show when={local.trendSubLabel}>
						<div class="mt-0.5 text-xs text-ink-500">{local.trendSubLabel}</div>
					</Show>
				</div>
			</Show>
		</>
	)

	return (
		<div
			class={cn(
				'flex flex-col rounded-2xl border border-surface-border bg-surface-raised p-5 shadow-sm',
				local.class,
			)}
			{...others}
		>
			{/* Top row: optional icon + label, optional topRight */}
			<div class="flex items-start justify-between gap-3">
				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-2">
						<Show when={local.icon}>
							<span
								class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg text-[0]"
								role={local.iconLabel ? 'img' : undefined}
								aria-label={local.iconLabel}
							>
								{local.icon}
							</span>
						</Show>
						<div class="min-w-0">
							<div class="text-sm font-semibold text-ink-700">{local.label}</div>
							<Show when={local.subtitle}>
								<div class="mt-0.5 text-xs text-ink-500">{local.subtitle}</div>
							</Show>
						</div>
					</div>
				</div>
				<Show when={local.topRight}>
					<div class="shrink-0">{local.topRight}</div>
				</Show>
			</div>

			{/* Main content: when chart on right, use two columns; otherwise single column */}
			<Show
				when={chartOnRight()}
				fallback={
					<>
						<div class={cn(contentMt(), 'flex-1')}>
							<ValueOrEmpty />
							<TrendBlock />
							<Show when={local.body}>
								<div class="mt-3">{local.body}</div>
							</Show>
						</div>
						<Show when={local.chart != null && local.chartPosition !== 'right'}>
							<div
								class={cn('mt-auto pt-3 w-full min-w-0', local.chartHeight ?? 'h-10')}
								aria-hidden={local.chartA11yLabel ? undefined : 'true'}
								role={local.chartA11yLabel ? 'img' : undefined}
								aria-label={local.chartA11yLabel}
							>
								{local.chart}
							</div>
						</Show>
					</>
				}
			>
				<div class={cn(contentMt(), 'flex gap-4')}>
					<div class="min-w-0 flex-1">
						<ValueOrEmpty small />
						<TrendBlock gap="mt-2" />
						<Show when={local.body}>
							<div class="mt-3">{local.body}</div>
						</Show>
					</div>
					<div
						class={cn(local.chartHeight ?? 'h-20', local.chartWidth ?? 'w-28 sm:w-36', 'shrink-0')}
						aria-hidden={local.chartA11yLabel ? undefined : 'true'}
						role={local.chartA11yLabel ? 'img' : undefined}
						aria-label={local.chartA11yLabel}
					>
						{local.chart}
					</div>
				</div>
			</Show>
		</div>
	)
}
