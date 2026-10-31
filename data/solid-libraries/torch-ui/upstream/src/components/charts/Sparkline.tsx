import { onMount, onCleanup, createEffect, createMemo, createSignal, splitProps } from 'solid-js'
import type { ChartConfiguration } from 'chart.js'
import { cn } from '../../utilities/classNames'

export interface SparklineProps {
	/** Data points for the line (e.g. [12, 19, 8, 15, 22, 18]). */
	data: number[]
	/** Line and fill color (CSS color, e.g. rgb(59, 130, 246) or #3b82f6). Default: primary blue. */
	color?: string
	/** Fill area under the line. Default true. */
	fill?: boolean
	/** Line tension (0 = straight, 0.4 = smooth). Default 0.3. */
	tension?: number
	/** Show a point at the last value. Default true. */
	showPoint?: boolean
	/** Fix the y-axis minimum. Useful to prevent the line from filling the full height when values are close together. */
	min?: number
	/** Fix the y-axis maximum. */
	max?: number
	/** Accessible label for the sparkline. When provided, the chart is exposed to assistive tech. */
	'aria-label'?: string
	/** ID of an element that labels the sparkline. When provided, the chart is exposed to assistive tech. */
	'aria-labelledby'?: string
	class?: string
}

function resolveDefaultColor(): string {
	if (typeof window === 'undefined') return '#3b82f6'
	const v = getComputedStyle(document.documentElement).getPropertyValue('--color-primary-500').trim()
	return v || '#3b82f6'
}

/**
 * Minimal line chart for inline use (e.g. stat cards, table cells). Wraps
 * Chart.js with no axes, legend, or tooltip.
 *
 * Unlike {@link Chart}, Sparkline does not auto-adapt to dark mode — consumers
 * are responsible for passing a theme-appropriate `color` prop.
 */
export function Sparkline(props: SparklineProps) {
	const [local] = splitProps(props, ['data', 'color', 'fill', 'tension', 'showPoint', 'min', 'max', 'aria-label', 'aria-labelledby', 'class'])
	let canvasEl: HTMLCanvasElement | undefined
	let chartInstance: import('chart.js').Chart | null = null
	const [chartReady, setChartReady] = createSignal(false)

	const color = () => local.color ?? resolveDefaultColor()
	const fill = () => local.fill !== false
	/** Derive a 25% opacity fill from the line color using color-mix(), which handles any CSS color format (hex, rgb, oklch, etc.). */
	const fillColor = createMemo(() => `color-mix(in srgb, ${color()} 25%, transparent)`)

	let ChartCtor: typeof import('chart.js').Chart | null = null
	let skipNextUpdate = false

	onMount(async () => {
		if (!canvasEl) return
		try {
			const { Chart } = await import('chart.js/auto')
			ChartCtor = Chart
			const config: ChartConfiguration<'line'> = {
				type: 'line',
				data: {
					labels: local.data.map((_, i) => i.toString()),
					datasets: [
						{
							data: local.data,
							borderColor: color(),
							backgroundColor: fill() ? fillColor() : undefined,
							fill: fill(),
							tension: local.tension ?? 0.3,
							borderWidth: 1.5,
							pointRadius: local.showPoint !== false ? 2.5 : 0,
							pointHoverRadius: 4,
							pointBackgroundColor: color(),
							pointBorderColor: color(),
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: { display: false },
						tooltip: { enabled: false },
					},
					scales: {
						x: { display: false },
						y: {
							display: false,
							grace: local.min == null && local.max == null ? '5%' : undefined,
							beginAtZero: false,
							min: local.min,
							max: local.max,
						},
					},
					interaction: { intersect: false, mode: 'index' },
				},
			}
			chartInstance = new ChartCtor(canvasEl, config)
			skipNextUpdate = true
			setChartReady(true)
		} catch (e) {
			if (import.meta.env.DEV) console.error('Sparkline: failed to load chart.js/auto', e)
		}
	})

	createEffect(() => {
		if (!chartReady()) return

		const data = local.data
		const c = color()
		const fillEnabled = fill()
		const fc = fillColor()
		const showPt = local.showPoint !== false ? 2.5 : 0
		const tension = local.tension ?? 0.3
		const yMin = local.min
		const yMax = local.max

		if (skipNextUpdate) {
			skipNextUpdate = false
			return
		}

		const ci = chartInstance
		if (!ci) return
		if (!data.length) {
			ci.data.labels = []
			ci.data.datasets[0].data = []
			ci.update('none')
			return
		}
		const nextLen = data.length
		if ((ci.data.labels?.length ?? 0) !== nextLen) {
			ci.data.labels = Array.from({ length: nextLen }, (_, i) => String(i))
		}
		ci.data.datasets[0].data = data
		ci.data.datasets[0].borderColor = c
		ci.data.datasets[0].backgroundColor = fillEnabled ? fc : undefined
		const ds = ci.data.datasets[0] as { fill?: boolean; pointRadius?: number; tension?: number }
		ds.fill = fillEnabled
		ds.pointRadius = showPt
		ds.tension = tension
		const yScale = ci.options.scales?.['y'] as { min?: number; max?: number; grace?: string } | undefined
		if (yScale) {
			yScale.min = yMin
			yScale.max = yMax
			yScale.grace = yMin == null && yMax == null ? '5%' : undefined
		}
		ci.update('none')
	})

	onCleanup(() => {
		if (chartInstance) {
			chartInstance.destroy()
			chartInstance = null
		}
	})

	const hasAccessibleName = () => !!local['aria-label'] || !!local['aria-labelledby']

	return (
		<div
			class={cn('h-full w-full min-h-[32px]', local.class)}
			aria-hidden={hasAccessibleName() ? undefined : 'true'}
			aria-label={local['aria-label']}
			aria-labelledby={local['aria-labelledby']}
			role={hasAccessibleName() ? 'img' : undefined}
		>
			<canvas ref={canvasEl} />
		</div>
	)
}
