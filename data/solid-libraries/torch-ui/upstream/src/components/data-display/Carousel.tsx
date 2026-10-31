import { type JSX, createSignal, createMemo, createEffect, on, onMount, onCleanup, splitProps, For, Show } from 'solid-js'
import { cn } from '../../utilities/classNames'
import { useIcons } from '../../icons'

export interface CarouselSlide {
	id: string
	content: JSX.Element
}

export interface CarouselProps extends JSX.HTMLAttributes<HTMLDivElement> {
	slides: CarouselSlide[]
	/** Auto-advance interval in ms (cycle time); 0 to disable */
	autoPlayInterval?: number
	/** Show dot indicators below the carousel. Default true; set false to hide. */
	showDots?: boolean
	/** Show prev/next arrow buttons. Default false; set showArrows or showArrows={true} to enable. */
	showArrows?: boolean
	/** Dot indicators alignment: start, center, or end. Default start. */
	dotsPosition?: 'start' | 'center' | 'end'
	/** Dot color scheme: 'light' (white dots, for dark/colored backgrounds) or 'dark' (ink dots, for light backgrounds). Default 'light'. */
	dotsVariant?: 'light' | 'dark'
	/** Optional Tailwind class(es) applied as a background strip behind the dots row (e.g. 'bg-primary-500'). Forces white dots when set. */
	dotsBgClass?: string
	/** When true, renders dots absolutely positioned over the bottom of the slide (instead of below it). Slide content should add bottom padding to avoid overlap. */
	dotsOverlay?: boolean
	/** Custom color for the progress bar (e.g. '#3b82f6', 'var(--color-primary-500)', or 'bg-primary-500'). When set, overrides the default progress bar color. */
	progressBarColor?: string
	/** Accessible label for the carousel region. */
	'aria-label'?: string
}

export function Carousel(props: CarouselProps) {
	const [local, others] = splitProps(props, [
		'slides',
		'autoPlayInterval',
		'showDots',
		'showArrows',
		'dotsPosition',
		'dotsVariant',
		'dotsBgClass',
		'dotsOverlay',
		'progressBarColor',
		'aria-label',
		'class',
	])
	const icons = useIcons()

	const [currentSlide, setCurrentSlide] = createSignal(0)
	const [progressBarReady, setProgressBarReady] = createSignal(false)
	const autoPlayInterval = () => local.autoPlayInterval ?? 5000
	const [autoPlayReset, setAutoPlayReset] = createSignal(0)

	// Memoize slides so the array (and any JSX inside it) is created inside a
	// proper reactive owner. Timer callbacks can then read slides() safely without
	// triggering "computations created outside createRoot" warnings.
	const slides = createMemo(() => local.slides)

	createEffect(on(
		() => slides().length,
		(len) => { setCurrentSlide(i => Math.min(i, Math.max(len - 1, 0))) }
	))

	createEffect(() => {
		autoPlayReset() // track manual resets from goToSlide
		const interval = autoPlayInterval()
		const len = slides().length
		if (interval > 0 && len > 1) {
			const id = setInterval(nextSlide, interval)
			onCleanup(() => clearInterval(id))
		}
		restartProgressBar()
	})

	function nextSlide() {
		const len = slides().length
		if (len === 0) return
		setCurrentSlide((prev) => (prev + 1) % len)
		restartProgressBar()
	}

	function restartProgressBar() {
		setProgressBarReady(false)
		requestAnimationFrame(() => setProgressBarReady(true))
	}

	function goToSlide(index: number) {
		const len = slides().length
		if (len === 0) return
		const i = ((index % len) + len) % len
		setCurrentSlide(i)
		restartProgressBar()
		setAutoPlayReset(n => n + 1) // triggers autoplay effect to restart the interval
	}

	function goPrev() { goToSlide(currentSlide() - 1) }
	function goNext() { goToSlide(currentSlide() + 1) }

	onMount(() => {
		const styleId = 'torch-carousel-styles'
		if (!document.getElementById(styleId)) {
			const style = document.createElement('style')
			style.id = styleId
			style.textContent = `@keyframes carouselProgressBar { from { width: 0%; } to { width: 100%; } }`
			document.head.appendChild(style)
		}
		const raf = requestAnimationFrame(() => setProgressBarReady(true))
		onCleanup(() => cancelAnimationFrame(raf))
	})

	const dotsAlign = () => {
		const p = local.dotsPosition ?? 'start'
		return p === 'end' ? 'justify-end' : p === 'center' ? 'justify-center' : 'justify-start'
	}

	return (
		<div
			role="region"
			aria-roledescription="carousel"
			aria-label={local['aria-label'] ?? 'Carousel'}
			{...others}
			class={cn('relative w-full', local.class)}
		>
			{/* Track: inline styles so overflow/position always apply regardless of Tailwind scan */}
			<div
				class="min-h-0 transition-opacity duration-500"
				style={{ position: 'relative', width: '100%', overflow: 'hidden' }}
			>
				<For each={slides()}>
					{(slide, index) => {
						const isActive = () => index() === currentSlide()
						return (
							<div
								aria-hidden={!isActive() ? 'true' : undefined}
								class={cn('transition-opacity duration-500', isActive() ? 'pointer-events-auto' : 'pointer-events-none')}
								style={
									isActive()
										? {
												position: 'relative' as const,
												opacity: 1,
												visibility: 'visible' as const,
												'z-index': 2,
										  }
										: {
												position: 'absolute' as const,
												inset: 0,
												width: '100%',
												height: '100%',
												opacity: 0,
												visibility: 'hidden' as const,
												'z-index': 1,
										  }
								}
							>
								{slide.content}
							</div>
						)
					}}
				</For>
			</div>

			<Show when={local.showArrows === true && slides().length > 1}>
				<button
					type="button"
					onClick={goPrev}
					class={cn(
						'absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full p-2',
						'bg-surface-raised/80 hover:bg-surface-raised text-ink-700 shadow-sm',
						'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50'
					)}
					aria-label="Previous slide"
				>
					{icons.chevronLeft({ class: 'h-4 w-4', 'aria-hidden': 'true' })}
				</button>
				<button
					type="button"
					onClick={goNext}
					class={cn(
						'absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full p-2',
						'bg-surface-raised/80 hover:bg-surface-raised text-ink-700 shadow-sm',
						'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50'
					)}
					aria-label="Next slide"
				>
					{icons.chevronRight({ class: 'h-4 w-4', 'aria-hidden': 'true' })}
				</button>
			</Show>

			<Show when={local.showDots !== false && slides().length > 1}>
				<div
					class={cn(
						local.dotsOverlay
							? cn('absolute bottom-3 left-0 right-0 z-10 flex gap-2 px-5 py-2', dotsAlign())
							: local.dotsBgClass
								? cn('flex gap-2 px-4 py-3 rounded-b-xl', local.dotsBgClass, dotsAlign())
								: cn('flex gap-2 my-3', dotsAlign())
					)}
				>
					<For each={slides()}>
						{(_, index) => (
							<button
								type="button"
								onClick={() => goToSlide(index())}
								class={cn(
									'h-2 rounded-full transition-all duration-300',
									index() === currentSlide() ? 'w-8 relative overflow-hidden' : 'w-2'
								)}
								style={{
									'background-color': (local.dotsVariant === 'light' || !!local.dotsBgClass)
										? 'rgba(255,255,255,0.4)'
										: 'var(--color-ink-400)',
								}}
								aria-label={`Go to slide ${index() + 1}`}
								aria-current={index() === currentSlide() ? 'true' : undefined}
							>
								<Show when={index() === currentSlide() && autoPlayInterval() > 0}>
									<div
										class="absolute top-0 left-0 h-full rounded-full"
										style={
											progressBarReady()
												? {
														'background-color': local.progressBarColor ?? ((local.dotsVariant === 'light' || !!local.dotsBgClass) ? 'white' : 'var(--color-ink-700)'),
														animation: `carouselProgressBar ${autoPlayInterval()}ms linear forwards`,
														'animation-fill-mode': 'forwards',
													}
												: {
														'background-color': local.progressBarColor ?? ((local.dotsVariant === 'light' || !!local.dotsBgClass) ? 'white' : 'var(--color-ink-700)'),
														width: '0%',
													}
										}
									/>
								</Show>
							</button>
						)}
					</For>
				</div>
			</Show>

			</div>
	)
}
