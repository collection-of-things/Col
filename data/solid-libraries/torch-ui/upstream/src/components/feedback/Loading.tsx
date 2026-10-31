import { type JSX, Show, splitProps } from 'solid-js'
import { cn } from '../../utilities/classNames'
import { useIcons } from '../../icons'
import {
	SkeletonCard,
	SkeletonTable,
	SkeletonSection,
	SkeletonHeading,
	SkeletonForm,
	SkeletonNavBlock,
} from './SkeletonBlocks'

export type LoadingVariant =
	| 'spinner'
	| 'dashboard'
	| 'tablePage'
	| 'admin'
	| 'generic'

export interface LoadingProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** Spinner (default) or skeleton layout for full-page loading. Omit for spinner. */
	variant?: LoadingVariant
	/** For spinner: message (default "Loading…"). Omit or set iconOnly for no message. */
	message?: string
	/** For spinner: when true, show only the spinner (no message). */
	iconOnly?: boolean
	/** For spinner: size of the icon. Ignored when icon is provided. */
	size?: 'sm' | 'md' | 'lg'
	/** For spinner: custom icon element. Add animate-spin and size classes. */
	icon?: JSX.Element
	/** For spinner: minimum height (default 200px when not iconOnly). */
	minHeight?: string | number
}

/** Single loading component: spinner (for Suspense/panels) or skeleton layout (for full-page). */
export function Loading(props: LoadingProps) {
	const [local, others] = splitProps(props, [
		'variant',
		'class',
		'message',
		'iconOnly',
		'size',
		'icon',
		'minHeight',
		'aria-label',
	])
	const icons = useIcons()

	const variant = () => local.variant ?? 'spinner'
	if (variant() === 'spinner') {
		const iconOnly = () => local.iconOnly === true
		const size = () => local.size ?? 'md'
		const sizeClasses = () =>
			size() === 'sm' ? 'h-4 w-4' : size() === 'lg' ? 'h-6 w-6' : 'h-5 w-5'
		const minHeight = () =>
			local.minHeight != null
				? typeof local.minHeight === 'number'
					? `${local.minHeight}px`
					: local.minHeight
				: iconOnly()
					? undefined
					: '200px'
		const defaultIcon = () => (
			icons.spinner({ class: cn('shrink-0 animate-spin text-ink-400', sizeClasses()), 'aria-hidden': 'true' })
		)
		const resolvedIcon = () => local.icon ?? defaultIcon()
		const label = () => local['aria-label'] ?? (iconOnly() ? (local.message ?? 'Loading') : undefined)
		return (
			<div
				{...others}
				class={cn('flex items-center justify-center gap-2', local.class)}
				style={minHeight() ? { 'min-height': minHeight() } : undefined}
				role="status"
				aria-live="polite"
				aria-label={label()}
			>
				<span aria-hidden="true">{resolvedIcon()}</span>
				<Show when={!iconOnly()}>
					<span
						class="text-sm text-ink-500"
						aria-hidden={local['aria-label'] ? 'true' : undefined}
					>
						{local.message ?? 'Loading…'}
					</span>
				</Show>
			</div>
		)
	}

	// Skeleton layout: composed from SkeletonBlocks that map to Card, Table, Section, etc.
	return (
		<div {...others} class={cn(local.class)} role="status" aria-live="polite" aria-atomic="true" aria-label="Loading">
			{variant() === 'dashboard' ? (
				<DashboardSkeletonLayout />
			) : variant() === 'tablePage' ? (
				<TablePageSkeletonLayout />
			) : variant() === 'admin' ? (
				<AdminSkeletonLayout />
			) : (
				<GenericSkeletonLayout />
			)}
		</div>
	)
}

function DashboardSkeletonLayout() {
	return (
		<div class="space-y-8">
			<SkeletonHeading />
			<div class="grid gap-6 sm:grid-cols-2">
				<SkeletonCard header bodyLines={2} />
				<SkeletonCard header bodyLines={2} />
			</div>
		</div>
	)
}

function TablePageSkeletonLayout() {
	return (
		<div class="space-y-6">
			<div class="mb-6">
				<SkeletonHeading />
			</div>
			<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
				<div class="flex min-w-0 max-w-2xl flex-1 items-center gap-4">
					<div class="h-10 min-w-0 flex-1 rounded-lg bg-surface-overlay animate-pulse" />
					<div class="h-10 w-28 rounded-lg bg-surface-overlay animate-pulse" />
				</div>
				<div class="flex items-center gap-2">
					<div class="h-10 w-20 rounded-lg bg-surface-overlay animate-pulse" />
					<div class="h-10 w-28 rounded-lg bg-surface-overlay animate-pulse" />
				</div>
			</div>
			<SkeletonTable rows={6} columns={5} />
		</div>
	)
}

function AdminSkeletonLayout() {
	return (
		<div class="flex gap-8">
			<aside class="w-64 flex-shrink-0 space-y-6">
				<SkeletonNavBlock items={3} />
				<SkeletonNavBlock items={5} />
			</aside>
			<div class="min-w-0 flex-1 space-y-6">
				<SkeletonHeading />
				<SkeletonForm fields={2} buttons={2} />
			</div>
		</div>
	)
}

function GenericSkeletonLayout() {
	return (
		<div class="space-y-6">
			<SkeletonSection description content contentLines={3} />
		</div>
	)
}
