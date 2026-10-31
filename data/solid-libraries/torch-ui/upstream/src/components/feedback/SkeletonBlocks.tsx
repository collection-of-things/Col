/**
 * Composable skeleton blocks for common layouts (Card, Table, Section, etc.).
 * These do NOT set role="status" or aria-label — they are intended to be
 * wrapped by a container that provides accessibility (e.g. <Loading>).
 */
import type { JSX } from 'solid-js'
import { For, Show, splitProps } from 'solid-js'
import { cn } from '../../utilities/classNames'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

const SKELETON_CLASS = 'animate-pulse'
const BAR = 'rounded bg-ink-200'
const BAR_LIGHT = 'rounded bg-surface-overlay'
const CARD_BASE =
	'rounded-xl border border-surface-border bg-surface-raised'
const TABLE_HEAD = 'border-b border-surface-border'
const TABLE_DIVIDE = 'divide-y divide-surface-border'

/** Skeleton that matches Card layout: optional header, body with N lines. Compose to match your Card structure. */
export interface SkeletonCardProps {
	/** Show a header bar (like Card.Header). Default true. */
	header?: boolean
	/** Number of body lines. Default 2. */
	bodyLines?: number
	/** Horizontal layout: image/avatar placeholder on left (like Card horizontal). */
	horizontal?: boolean
	class?: string
}

export function SkeletonCard(props: SkeletonCardProps): JSX.Element {
	const [local] = splitProps(props, ['header', 'bodyLines', 'horizontal', 'class'])

	const header = () => local.header !== false
	const bodyLines = () => local.bodyLines ?? 2
	const horizontal = () => local.horizontal === true
	return (
		<div
			class={cn(
				SKELETON_CLASS,
				CARD_BASE,
				horizontal() ? 'flex flex-row overflow-hidden' : 'flex flex-col',
				local.class
			)}
			aria-hidden="true"
		>
			<Show when={horizontal()}>
				<div class="h-24 w-24 shrink-0 rounded-l-xl bg-surface-overlay sm:h-28 sm:w-28" />
			</Show>
			<div class="min-w-0 flex-1 flex flex-col">
				<Show when={header()}>
					<div class="flex shrink-0 items-center justify-between gap-3 border-b border-surface-border px-6 py-4">
						<div class={cn('h-5 w-32', BAR)} />
					</div>
				</Show>
				<div class="flex flex-1 flex-col gap-2 p-6">
					<For each={range(bodyLines())}>
						{(i) => (
							<div
								class={cn('h-4 rounded', BAR_LIGHT)}
								style={{ width: `${Math.max(50, 90 - (i + 1) * 15)}%` }}
							/>
						)}
					</For>
				</div>
			</div>
		</div>
	)
}

/** Skeleton that matches Table layout: header row + N body rows × M cells. Compose to match your Table structure. */
export interface SkeletonTableProps {
	/** Number of body rows. Default 5. */
	rows?: number
	/** Number of columns (header + each row). Default 4. */
	columns?: number
	class?: string
}

export function SkeletonTable(props: SkeletonTableProps): JSX.Element {
	const [local] = splitProps(props, ['rows', 'columns', 'class'])

	const rows = () => local.rows ?? 5
	const columns = () => local.columns ?? 4
	return (
		<div class={cn(SKELETON_CLASS, 'overflow-hidden rounded-xl border border-surface-border bg-surface-raised', local.class)} aria-hidden="true">
			<div class={cn('flex gap-4 px-6 py-3', TABLE_HEAD)}>
				<For each={range(columns())}>
					{() => <div class={cn('h-4 flex-1 rounded', BAR_LIGHT)} />}
				</For>
			</div>
			<div class={TABLE_DIVIDE}>
				<For each={range(rows())}>
					{() => (
						<div class="flex gap-4 px-6 py-4">
							<For each={range(columns())}>
								{() => <div class={cn('h-4 flex-1 rounded', BAR_LIGHT)} />}
							</For>
						</div>
					)}
				</For>
			</div>
		</div>
	)
}

/** Skeleton that matches Section / PageHeading: title bar + optional description + content block. Compose to match your Section structure. */
export interface SkeletonSectionProps {
	/** Show a description line under the title. Default true. */
	description?: boolean
	/** Show a content block below (e.g. form or card placeholder). Default true. */
	content?: boolean
	/** Content block lines. Default 3. */
	contentLines?: number
	class?: string
}

export function SkeletonSection(props: SkeletonSectionProps): JSX.Element {
	const [local] = splitProps(props, ['description', 'content', 'contentLines', 'class'])

	const description = () => local.description !== false
	const content = () => local.content !== false
	const contentLines = () => local.contentLines ?? 3
	return (
		<div class={cn(SKELETON_CLASS, 'space-y-4', local.class)} aria-hidden="true">
			<div>
				<div class={cn('h-7 w-48 rounded', BAR)} />
				<Show when={description()}>
					<div class={cn('mt-2 h-4 max-w-md rounded', BAR_LIGHT)} />
				</Show>
			</div>
			<Show when={content()}>
				<div class="rounded-xl border border-surface-border bg-surface-raised p-6">
					<div class="flex flex-col gap-3">
						<For each={range(contentLines())}>
							{(i) => (
								<div
									class={cn('h-4 rounded', BAR_LIGHT)}
									style={{ width: `${90 - (i + 1) * 10}%` }}
								/>
							)}
						</For>
					</div>
				</div>
			</Show>
		</div>
	)
}

/** Skeleton block for a simple title + one line (e.g. PageHeading only, no section content). */
export interface SkeletonHeadingProps {
	/** Show description line. Default true. */
	description?: boolean
	class?: string
}

export function SkeletonHeading(props: SkeletonHeadingProps): JSX.Element {
	const [local] = splitProps(props, ['description', 'class'])

	const description = () => local.description !== false
	return (
		<div class={cn(SKELETON_CLASS, local.class)} aria-hidden="true">
			<div class={cn('h-8 w-48 rounded', BAR)} />
			<Show when={description()}>
				<div class={cn('mt-2 h-4 max-w-sm rounded', BAR_LIGHT)} />
			</Show>
		</div>
	)
}

/** Skeleton for a form-like block: label lines + inputs + buttons. */
export interface SkeletonFormProps {
	fields?: number
	buttons?: number
	class?: string
}

export function SkeletonForm(props: SkeletonFormProps): JSX.Element {
	const [local] = splitProps(props, ['fields', 'buttons', 'class'])

	const fields = () => local.fields ?? 2
	const buttons = () => local.buttons ?? 2
	return (
		<div class={cn(SKELETON_CLASS, 'space-y-4 rounded-xl border border-surface-border bg-surface-raised p-6', local.class)} aria-hidden="true">
			<For each={range(fields())}>
				{() => (
					<div class="space-y-1">
						<div class={cn('h-4 w-32 rounded', BAR_LIGHT)} />
						<div class={cn('h-10 w-full rounded-lg', BAR_LIGHT)} />
					</div>
				)}
			</For>
			<div class="flex gap-2 pt-2">
				<For each={range(buttons())}>
					{() => <div class={cn('h-10 w-24 rounded-lg', BAR)} />}
				</For>
			</div>
		</div>
	)
}

/** Skeleton for a sidebar nav block: section label + list of items. */
export interface SkeletonNavBlockProps {
	items?: number
	class?: string
}

export function SkeletonNavBlock(props: SkeletonNavBlockProps): JSX.Element {
	const [local] = splitProps(props, ['items', 'class'])

	const items = () => local.items ?? 4
	return (
		<div class={cn(SKELETON_CLASS, 'space-y-2', local.class)} aria-hidden="true">
			<div class={cn('h-3 w-20 rounded', BAR)} />
			<div class="space-y-0.5">
				<For each={range(items())}>
					{() => <div class={cn('h-9 rounded-lg', BAR_LIGHT)} />}
				</For>
			</div>
		</div>
	)
}
