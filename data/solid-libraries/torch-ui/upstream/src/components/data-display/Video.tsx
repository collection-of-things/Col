import { type JSX, createSignal, Show, splitProps } from 'solid-js'
import { cn } from '../../utilities/classNames'

export interface VideoProps {
	/** Video source URL */
	src: string
	/** Poster image URL shown before playback */
	poster?: string
	/** Show native browser controls. Default: true */
	controls?: boolean
	/** Autoplay the video. Default: false. Note: forces muted=true to satisfy browser autoplay policy. */
	autoplay?: boolean
	/** Mute the video. Default: false */
	muted?: boolean
	/** Loop the video. Default: false */
	loop?: boolean
	/** CSS aspect-ratio value e.g. '16/9', '4/3', '1/1', '9/16'. Default: '16/9' */
	aspectRatio?: string
	/** Max width of the container (CSS value). Default: '100%' */
	width?: string
	/** Max height of the container (CSS value). Rarely needed with aspect-ratio. */
	height?: string
	/** Fallback content to render when the video fails to load */
	fallback?: JSX.Element
	/** Preload strategy. Default: 'metadata' */
	preload?: 'none' | 'metadata' | 'auto'
	/** Whether the video fills its container. Default: true */
	fluid?: boolean
	class?: string
	/** Forwarded to the <video> element */
	videoClass?: string
}

export function Video(props: VideoProps) {
	const [local, others] = splitProps(props, [
		'src', 'poster', 'controls', 'autoplay', 'muted', 'loop',
		'aspectRatio', 'width', 'height', 'fallback', 'preload',
		'fluid', 'class', 'videoClass',
	])

	const [error, setError] = createSignal(false)

	const aspectRatio = () => local.aspectRatio ?? '16/9'
	const fluid = () => local.fluid !== false

	return (
		<div
			class={cn('relative overflow-hidden rounded-xl', local.class)}
			style={{
				'aspect-ratio': aspectRatio(),
				'max-width': local.width ?? (fluid() ? '100%' : undefined),
				'max-height': local.height,
			}}
			{...others}
		>
			<Show
				when={!error()}
				fallback={
					<div class="absolute inset-0 flex items-center justify-center bg-surface-raised">
						<Show
							when={local.fallback}
							fallback={
								<div class="flex flex-col items-center gap-3 p-6 text-center">
									<div class="flex h-12 w-12 items-center justify-center rounded-full bg-surface-overlay">
										<svg class="h-6 w-6 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 01-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.164.841-.26 1.298-.26H19.5m-14.25 0A2.25 2.25 0 013 16.5V9.75m0 0A2.25 2.25 0 015.25 7.5H12M3 9.75l9-4.5" />
										</svg>
									</div>
									<div>
										<p class="text-sm font-medium text-ink-700">Video unavailable</p>
										<p class="mt-0.5 text-xs text-ink-400">This video could not be loaded.</p>
									</div>
								</div>
							}
						>
							{local.fallback}
						</Show>
					</div>
				}
			>
				<video
					class={cn('h-full w-full object-cover', local.videoClass)}
					src={local.src}
					poster={local.poster}
					controls={local.controls !== false}
					autoplay={local.autoplay}
					muted={local.autoplay ? true : local.muted}
					loop={local.loop}
					preload={local.preload ?? 'metadata'}
					onError={() => setError(true)}
					playsinline
				/>
			</Show>
		</div>
	)
}
