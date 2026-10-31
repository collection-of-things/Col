import { type JSX, Show, For, createSignal, splitProps } from 'solid-js'
import { cn } from '../../utilities/classNames'
import { useIcons } from '../../icons'

export interface TreeNode {
	/** Unique identifier */
	id: string
	/** Display label */
	label: JSX.Element
	/** Optional icon shown before the label */
	icon?: JSX.Element
	/** Child nodes */
	children?: TreeNode[]
	/** Prevents selection and interaction */
	disabled?: boolean
}

export interface TreeViewProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children' | 'onSelect'> {
	/** Tree data */
	nodes: TreeNode[]
	/** Controlled selected node id */
	selected?: string
	/** Callback when a node is selected */
	onSelect?: (id: string) => void
	/** Default selected node id (uncontrolled) */
	defaultSelected?: string
	/** Controlled expanded node ids */
	expanded?: string[]
	/** Callback when expanded state changes */
	onExpandedChange?: (ids: string[]) => void
	/** Default expanded ids (uncontrolled) */
	defaultExpanded?: string[]
	/** Pixels of indentation per level. Default: 16. */
	indent?: number
	/** Show connecting lines between nodes. Default: true. */
	showLines?: boolean
}

export function TreeView(props: TreeViewProps) {
	const [local, others] = splitProps(props, [
		'nodes',
		'selected',
		'onSelect',
		'defaultSelected',
		'expanded',
		'onExpandedChange',
		'defaultExpanded',
		'indent',
		'showLines',
		'class',
	])
	const icons = useIcons()

	const [internalSelected, setInternalSelected] = createSignal<string | undefined>(
		local.defaultSelected,
	)
	const [internalExpanded, setInternalExpanded] = createSignal<string[]>(
		local.defaultExpanded ?? [],
	)

	const selectedId = () => local.selected ?? internalSelected()
	const expandedIds = () => local.expanded ?? internalExpanded()

	const isSelected = (id: string) => selectedId() === id
	const isExpanded = (id: string) => expandedIds().includes(id)

	const handleSelect = (id: string) => {
		if (local.selected === undefined) setInternalSelected(id)
		local.onSelect?.(id)
	}

	const toggleExpand = (id: string) => {
		const current = expandedIds()
		const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
		if (local.expanded === undefined) setInternalExpanded(next)
		local.onExpandedChange?.(next)
	}

	const indent = () => local.indent ?? 16
	const showLines = () => local.showLines !== false

	const renderNodes = (nodes: TreeNode[], level = 0): JSX.Element => (
		<ul role={level === 0 ? 'tree' : 'group'} class="list-none">
			<For each={nodes}>
				{(node) => {
					const hasChildren = () => (node.children?.length ?? 0) > 0
					const expanded = () => isExpanded(node.id)
					const selected = () => isSelected(node.id)

					return (
						<li role="treeitem" aria-expanded={hasChildren() ? (expanded() ? 'true' : 'false') : undefined} aria-selected={selected() ? 'true' : 'false'}>
							<button
								type="button"
								disabled={node.disabled}
								data-tree-item
								data-tree-level={level}
								onClick={() => {
									if (node.disabled) return
									if (hasChildren()) toggleExpand(node.id)
									handleSelect(node.id)
								}}
								onKeyDown={(e: KeyboardEvent) => {
									if (node.disabled) return
									const btn = e.currentTarget as HTMLElement
									const root = btn.closest('[data-tree-root]')
									const treeBtns = () => root
										? Array.from(root.querySelectorAll<HTMLElement>('button[data-tree-item]:not(:disabled)'))
										: []
									if (e.key === 'ArrowDown') {
										e.preventDefault()
										const btns = treeBtns()
										btns[btns.indexOf(btn) + 1]?.focus()
									} else if (e.key === 'ArrowUp') {
										e.preventDefault()
										const btns = treeBtns()
										btns[btns.indexOf(btn) - 1]?.focus()
									} else if (e.key === 'Home') {
										e.preventDefault()
										treeBtns()[0]?.focus()
									} else if (e.key === 'End') {
										e.preventDefault()
										const btns = treeBtns()
										btns[btns.length - 1]?.focus()
									} else if (e.key === 'ArrowRight') {
										e.preventDefault()
										if (hasChildren() && !expanded()) {
											toggleExpand(node.id)
											queueMicrotask(() => {
												const btns = treeBtns()
												btns[btns.indexOf(btn) + 1]?.focus()
											})
										} else if (hasChildren() && expanded()) {
											const btns = treeBtns()
											btns[btns.indexOf(btn) + 1]?.focus()
										}
									} else if (e.key === 'ArrowLeft') {
										e.preventDefault()
										if (hasChildren() && expanded()) {
											toggleExpand(node.id)
										} else {
											const nodeLevel = Number(btn.dataset.treeLevel ?? 0)
											const btns = treeBtns()
											const idx = btns.indexOf(btn)
											const parent = btns.slice(0, idx).reverse().find(
												(b) => Number(b.dataset.treeLevel ?? 0) < nodeLevel
											)
											parent?.focus()
										}
									} else if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault()
										if (hasChildren()) toggleExpand(node.id)
										handleSelect(node.id)
									}
								}}
								class={cn(
									'flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
									'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
									selected()
										? 'bg-primary-50 text-primary-700 font-medium'
										: 'text-ink-700 hover:bg-surface-overlay hover:text-ink-900',
									node.disabled && 'opacity-40',
								)}
								style={{ 'padding-left': `${level * indent() + 8}px` }}
							>
								{/* Expand/collapse chevron */}
								<span class={cn('flex h-4 w-4 shrink-0 items-center justify-center')}>
									<Show when={hasChildren()} fallback={<span class="h-4 w-4" />}>
										{icons.chevronRight({
											class: cn('h-3.5 w-3.5 text-ink-400 transition-transform duration-150', expanded() && 'rotate-90'),
											'aria-hidden': 'true',
										})}
									</Show>
								</span>

								{/* Node icon */}
								<Show when={node.icon}>
									<span class={cn('flex h-4 w-4 shrink-0 items-center justify-center [&>svg]:h-4 [&>svg]:w-4', selected() ? 'text-primary-500' : 'text-ink-500')}>
										{node.icon}
									</span>
								</Show>

								{/* Label */}
								<span class="min-w-0 truncate">{node.label}</span>
							</button>

							{/* Children */}
							<Show when={hasChildren() && expanded()}>
								<div
									class={cn(
										showLines() && level < 2
												? 'relative ml-[calc(var(--indent-offset)+8px)] border-l border-surface-border pl-0'
											: '',
									)}
									style={{ '--indent-offset': `${level * indent() + 14}px` } as any}
								>
									{renderNodes(node.children ?? [], level + 1)}
								</div>
							</Show>
						</li>
					)
				}}
			</For>
		</ul>
	)

	return (
		<div class={cn('select-none', local.class)} data-tree-root {...others}>
			{renderNodes(local.nodes)}
		</div>
	)
}
