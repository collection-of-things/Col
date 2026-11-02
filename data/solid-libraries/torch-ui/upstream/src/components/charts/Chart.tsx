import { onMount, onCleanup, createEffect, createSignal, createRoot, splitProps, untrack } from 'solid-js'
import type { ChartConfiguration } from 'chart.js'
import { cn } from '../../utilities/classNames'

export type ChartType = 'line' | 'bar' | 'doughnut' | 'pie' | 'radar' | 'polarArea' | 'scatter' | 'bubble'

/** Point for scatter charts (x, y) or bubble charts (x, y, r = radius). */
export type ScatterPoint = { x: number; y: number }
export type BubblePoint = { x: number; y: number; r: number }

export interface ChartDataset {
	label: string
	/** For line/bar/pie/doughnut/radar/polarArea: number[]. For scatter: ScatterPoint[]. For bubble: BubblePoint[]. */
	data: number[] | ScatterPoint[] | BubblePoint[]
	backgroundColor?: string | string[]
	borderColor?: string | string[]
	hoverBackgroundColor?: string | string[]
	hoverBorderColor?: string | string[]
}

export interface ChartData {
	/** For scatter/bubble can be empty []. For other types, one label per data point. */
	labels: string[]
	datasets: ChartDataset[]
}

export interface ChartProps {
	/** Chart type: line, bar, doughnut, pie, radar, polarArea, scatter, or bubble */
	type: ChartType
	/** Chart data: labels and datasets */
	data: ChartData
	/** When type is 'line', fill area under the line. Default false. Same idea as Sparkline fill. */
	fill?: boolean
	/** Dataset border width. Defaults: line=2, bar=0, doughnut/pie handled by segment borders. */
	borderWidth?: number
	/** Optional Chart.js options override (merged with defaults) */
	options?: ChartConfiguration<ChartType>['options']
	/** Accessible label for the chart wrapper. When provided, the chart is exposed to assistive tech. */
	'aria-label'?: string
	/** ID of an element that labels the chart. When provided, the chart is exposed to assistive tech. */
	'aria-labelledby'?: string
	class?: string
}

/** Recursively merges plain-object values; arrays and primitives from `override` replace base. */
function deepMerge(base: Record<string, unknown>, override: Record<string, unknown>): Record<string, unknown> {
	const result: Record<string, unknown> = { ...base }
	for (const key of Object.keys(override)) {
		const bv = base[key]
		const ov = override[key]
		if (
			ov !== null && typeof ov === 'object' && !Array.isArray(ov) &&
			bv !== null && typeof bv === 'object' && !Array.isArray(bv)
		) {
			result[key] = deepMerge(bv as Record<string, unknown>, ov as Record<string, unknown>)
		} else if (ov !== undefined) {
			result[key] = ov
		}
	}
	return result
}

/** Reads current theme from html element class. */
function isDark(): boolean {
	if (typeof document === 'undefined') return false
	return document.documentElement.classList.contains('dark')
}

/** Shared dark-mode signal — one MutationObserver for all Chart instances.
 *  Created inside createRoot so the signal is ownerless/global and not tied
 *  to the reactive root of whichever component first calls getSharedDark().
 *
 *  Module-level state: persists for the lifetime of the module. In test
 *  environments that share module instances across tests, the observer from a
 *  previous test will persist. Reset sharedDarkSignal = null and
 *  sharedDarkRefCount = 0 in test teardown if needed. */
let sharedDarkSignal: { dark: () => boolean; subscribe: () => void; unsubscribe: () => void } | null = null
let sharedDarkRefCount = 0

function getSharedDark() {
	if (!sharedDarkSignal) {
		createRoot(() => {
			const [dark, setDark] = createSignal(isDark())
			let observer: MutationObserver | null = null
			sharedDarkSignal = {
				dark,
				subscribe() {
					sharedDarkRefCount++
					if (sharedDarkRefCount === 1 && typeof document !== 'undefined') {
						observer = new MutationObserver(() => setDark(isDark()))
						observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
					}
				},
				unsubscribe() {
					sharedDarkRefCount--
					if (sharedDarkRefCount <= 0 && observer) {
						observer.disconnect()
						observer = null
						sharedDarkRefCount = 0
					}
				},
			}
		})
	}
	return sharedDarkSignal!
}

const THEME = {
	gridColor: (dark: boolean) => (dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'),
	tickColor: (dark: boolean) => (dark ? '#a1a1aa' : '#52525b'),
	textColor: (dark: boolean) => (dark ? '#e4e4e7' : '#18181b'),
	subtitleColor: (dark: boolean) => (dark ? '#a1a1aa' : '#52525b'),
	tooltipBg: (dark: boolean) => (dark ? '#1e2328' : '#ffffff'),
	tooltipBorder: (dark: boolean) => (dark ? '#3f3f46' : '#e4e4e7'),
}

/** Theme-aware options for plugins (legend, title, tooltip) and scale colors. Merged so charts read well in light/dark. */
function getThemeOptions(dark: boolean, type: ChartType): ChartConfiguration<ChartType>['options'] {
	const textColor = THEME.textColor(dark)
	const opts: ChartConfiguration<ChartType>['options'] = {
		plugins: {
			legend: { labels: { color: textColor } },
			title: { color: textColor },
			subtitle: { color: THEME.subtitleColor(dark) },
			tooltip: {
				titleColor: textColor,
				bodyColor: textColor,
				backgroundColor: THEME.tooltipBg(dark),
				borderColor: THEME.tooltipBorder(dark),
				borderWidth: 1,
			},
		},
	}
	const gridColor = THEME.gridColor(dark)
	const tickColor = THEME.tickColor(dark)
	if (type === 'line' || type === 'bar' || type === 'scatter' || type === 'bubble') {
		opts.scales = {
			x: { grid: { color: gridColor }, ticks: { color: tickColor } },
			y: { grid: { color: gridColor }, ticks: { color: tickColor } },
		}
	}
	if (type === 'radar' || type === 'polarArea') {
		opts.scales = {
			r: { grid: { color: gridColor }, ticks: { color: tickColor, backdropColor: 'transparent' } },
		}
	}
	return opts
}

/** Segment border style for doughnut/pie so lines are visible in light and dark mode */
function getSegmentBorderForMode(dark: boolean): { borderColor: string; borderWidth: number } {
	return dark
		? { borderColor: 'rgba(255,255,255,0.25)', borderWidth: 1 }
		: { borderColor: 'rgba(0,0,0,0.08)', borderWidth: 1 }
}

function applySegmentBorders(
	chartInstance: import('chart.js').Chart,
	type: ChartType,
	dark: boolean
): void {
	if (type !== 'doughnut' && type !== 'pie') return
	const { borderColor, borderWidth } = getSegmentBorderForMode(dark)
	chartInstance.data.datasets.forEach((ds) => {
		const len = 'data' in ds && Array.isArray(ds.data) ? ds.data.length : 0
		;(ds as { borderColor?: string | string[]; borderWidth?: number }).borderColor = Array(len).fill(borderColor)
		;(ds as { borderWidth?: number }).borderWidth = borderWidth
	})
	chartInstance.update('none')
}

function buildConfig(
	type: ChartType,
	data: ChartData,
	dark: boolean,
	optionsOverride?: ChartConfiguration<ChartType>['options'],
	lineFill?: boolean,
	borderWidthProp?: number
): ChartConfiguration<ChartType> {
	const segmentBorder =
		type === 'doughnut' || type === 'pie' ? getSegmentBorderForMode(dark) : null
	const isLine = type === 'line'
	const themeOpts = getThemeOptions(dark, type)
	const gridColor = THEME.gridColor(dark)
	const tickColor = THEME.tickColor(dark)
	const isScatterOrBubble = type === 'scatter' || type === 'bubble'

	type ChartDataConfig = ChartConfiguration<ChartType>['data']
	type DatasetItem = NonNullable<ChartDataConfig>['datasets'] extends (infer D)[] ? D : never
	const datasets: DatasetItem[] = data.datasets.map((ds) => {
		if (isScatterOrBubble) {
			return {
				label: ds.label,
				data: ds.data,
				backgroundColor: ds.backgroundColor,
				borderColor: ds.borderColor,
			} as DatasetItem
		}
		const len = (ds.data as number[]).length
		const defaultBorderWidth = isLine ? 2 : (segmentBorder?.borderWidth ?? 0)
		const out: Record<string, unknown> = {
			label: ds.label,
			data: ds.data,
			backgroundColor: ds.backgroundColor,
			borderColor: ds.borderColor,
			hoverBackgroundColor: ds.hoverBackgroundColor,
			hoverBorderColor: ds.hoverBorderColor,
			borderWidth: borderWidthProp ?? defaultBorderWidth,
			tension: isLine ? 0.3 : 0,
			fill: isLine ? (lineFill ?? false) : undefined,
		}
		if (segmentBorder && !ds.borderColor) {
			out.borderColor = Array(len).fill(segmentBorder.borderColor)
		}
		return out as unknown as DatasetItem
	})
	const baseOpts: Record<string, unknown> = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			...(themeOpts?.plugins ?? {}),
			legend: { position: 'bottom' as const, ...(themeOpts?.plugins?.legend ?? {}) },
		},
		...(isLine || type === 'bar'
			? {
					scales: {
						x: { grid: { display: false, color: gridColor }, ticks: { color: tickColor } },
						y: { beginAtZero: true, grace: '5%', grid: { color: gridColor }, ticks: { color: tickColor } },
					},
				}
			: {}),
		...(isScatterOrBubble
			? {
					scales: {
						x: { type: 'linear' as const, grid: { color: gridColor }, ticks: { color: tickColor } },
						y: { type: 'linear' as const, beginAtZero: true, grace: '5%', grid: { color: gridColor }, ticks: { color: tickColor } },
					},
				}
			: {}),
		...(type === 'radar' || type === 'polarArea' ? { scales: themeOpts?.scales } : {}),
	}

	const base: ChartConfiguration<ChartType> = {
		type,
		data: {
			labels: data.labels,
			datasets,
		},
		options: (
			optionsOverride
				? deepMerge(baseOpts, optionsOverride as Record<string, unknown>)
				: baseOpts
		) as ChartConfiguration<ChartType>['options'],
	}
	return base
}

/**
 * Chart.js wrapper with automatic dark-mode theming. Renders to canvas which is
 * inherently inaccessible — consumers should provide an accessible alternative
 * (caption, summary text, or data table) when the chart conveys meaningful data.
 */
export function Chart(props: ChartProps) {
	const [local] = splitProps(props, ['type', 'data', 'fill', 'borderWidth', 'options', 'aria-label', 'aria-labelledby', 'class'])
	let canvasEl: HTMLCanvasElement | undefined
	let chartInstance: import('chart.js').Chart | null = null
	let ChartConstructor: typeof import('chart.js').Chart | null = null
	const [chartReady, setChartReady] = createSignal(false)
	const sharedDark = getSharedDark()
	const dark = sharedDark.dark
	const [currentType, setCurrentType] = createSignal<ChartType>(local.type)
	let skipNextUpdate = false

	function destroyChart() {
		if (chartInstance) {
			chartInstance.destroy()
			chartInstance = null
		}
	}

	function createChart(type: ChartType) {
		if (!canvasEl || !ChartConstructor) return
		destroyChart()
		const config = buildConfig(type, local.data, dark(), local.options, local.fill, local.borderWidth)
		chartInstance = new ChartConstructor(canvasEl, config as ChartConfiguration<ChartType>)
		if (type === 'doughnut' || type === 'pie') {
			applySegmentBorders(chartInstance, type, dark())
		}
		setCurrentType(type)
	}

	onMount(async () => {
		if (!canvasEl) return
		try {
			const mod = await import('chart.js/auto')
			ChartConstructor = mod.Chart
			createChart(local.type)
			sharedDark.subscribe()
			skipNextUpdate = true
			setChartReady(true)
		} catch (e) {
			if (import.meta.env.DEV) console.error('Chart: failed to load chart.js/auto', e)
		}
	})


	createEffect(() => {
		if (!chartReady()) return

		const currentDark = dark()
		const opts = local.options
		const fill = local.fill
		const type = local.type
		const data = local.data

		if (skipNextUpdate) {
			skipNextUpdate = false
			return
		}

		if (type !== untrack(currentType)) {
			createChart(type)
			return
		}

		const ci = chartInstance
		if (!ci) return

		if (!data.datasets.length) {
			ci.data.labels = []
			ci.data.datasets = []
			ci.update('none')
			return
		}

		const config = buildConfig(type, data, currentDark, opts, fill, local.borderWidth)
		ci.options = config.options!
		ci.data.labels = data.labels
		ci.data.datasets = data.datasets.map((ds, i) => {
			const prev = ci.data.datasets[i] as unknown as Record<string, unknown> | undefined
			return {
				...(prev ?? {}),
				label: ds.label,
				data: ds.data,
				backgroundColor: ds.backgroundColor,
				borderColor: ds.borderColor,
				hoverBackgroundColor: ds.hoverBackgroundColor,
				hoverBorderColor: ds.hoverBorderColor,
				fill: type === 'line' ? (fill ?? false) : undefined,
			}
		})
		if (type === 'doughnut' || type === 'pie') {
			applySegmentBorders(ci, type, currentDark)
		} else {
			ci.update()
		}
	})

	onCleanup(() => {
		sharedDark.unsubscribe()
		destroyChart()
	})

	const hasAccessibleName = () => !!local['aria-label'] || !!local['aria-labelledby']

	return (
		<div
			class={cn('h-full w-full min-h-[200px]', local.class)}
			aria-hidden={hasAccessibleName() ? undefined : 'true'}
			aria-label={local['aria-label']}
			aria-labelledby={local['aria-labelledby']}
			role={hasAccessibleName() ? 'img' : undefined}
			tabIndex={hasAccessibleName() ? 0 : undefined}
		>
			<canvas ref={canvasEl} />
		</div>
	)
}
