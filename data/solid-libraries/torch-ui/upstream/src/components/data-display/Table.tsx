import { type JSX, Show, splitProps, createContext, useContext } from 'solid-js'
import { cn } from '../../utilities/classNames'

type TableSection = 'head' | 'body' | 'foot'

const TableContext = createContext<boolean>(false)
/** Which table section a row lives in. Hover/stripe only apply to 'body' rows. */
const TableSectionContext = createContext<TableSection | undefined>(undefined)

export interface TableProps extends JSX.HTMLAttributes<HTMLTableElement> {
	/** When true, even rows get a subtle background (striped). Default: false.
	 * Note: striping uses CSS `even:` which counts every `<tr>` in the `<tbody>`,
	 * including group headers, add-form rows, etc. If you mix data rows with non-data
	 * rows, stripes will be based on DOM order, not logical data-row index. */
	striped?: boolean
	/** Accessible caption for the table. Rendered as a visually-hidden `<caption>` by default. Pass JSX for a visible caption. */
	caption?: JSX.Element | string
}

export function Table(props: TableProps) {
	const [local, others] = splitProps(props, ['class', 'striped', 'caption', 'children'])
	const striped = () => local.striped === true
	return (
		<TableContext.Provider value={striped()}>
			<table
				class={cn('w-full text-sm text-ink-900', local.class)}
				{...others}
			>
				<Show when={local.caption != null}>
					<caption class={typeof local.caption === 'string' ? 'sr-only' : undefined}>
						{local.caption}
					</caption>
				</Show>
				{local.children}
			</table>
		</TableContext.Provider>
	)
}

export interface TableHeaderProps
	extends JSX.HTMLAttributes<HTMLTableSectionElement> {}

/**
 * Renders `<thead>` with sticky positioning.
 * Sticky header requires a vertically scrollable ancestor (e.g. `max-h-* overflow-y-auto`).
 */
export function TableHeader(props: TableHeaderProps) {
	const [local, others] = splitProps(props, ['class', 'children'])
	return (
		<thead
			class={cn(
				'sticky top-0 z-10 border-b border-surface-border bg-surface-overlay',
				local.class,
			)}
			{...others}
		>
			<TableSectionContext.Provider value={'head'}>{local.children}</TableSectionContext.Provider>
		</thead>
	)
}

export interface TableBodyProps
	extends JSX.HTMLAttributes<HTMLTableSectionElement> {}

export function TableBody(props: TableBodyProps) {
	const [local, others] = splitProps(props, ['class', 'children'])
	return (
		<tbody
			class={cn(
				'divide-y divide-surface-border bg-surface-raised',
				local.class,
			)}
			{...others}
		>
			<TableSectionContext.Provider value={'body'}>{local.children}</TableSectionContext.Provider>
		</tbody>
	)
}

export interface TableFooterProps
	extends JSX.HTMLAttributes<HTMLTableSectionElement> {}

export function TableFooter(props: TableFooterProps) {
	const [local, others] = splitProps(props, ['class', 'children'])
	return (
		<tfoot
			class={cn(
				'border-t border-surface-border bg-surface-base',
				local.class,
			)}
			{...others}
		>
			<TableSectionContext.Provider value={'foot'}>{local.children}</TableSectionContext.Provider>
		</tfoot>
	)
}

export interface TableRowProps extends JSX.HTMLAttributes<HTMLTableRowElement> {
	/** When false, hover background is not applied (e.g. for empty state, loading, or group header rows). Default true for body rows. */
	hover?: boolean
	/**
	 * Explicit stripe override for grouped tables. When defined, overrides CSS `even:` striping so
	 * the stripe pattern resets to white at the start of each group.
	 * Omit (undefined) to fall back to CSS `even:bg-surface-stripe` (flat tables).
	 */
	stripe?: boolean
}

export function TableRow(props: TableRowProps) {
	const [local, others] = splitProps(props, ['class', 'hover', 'stripe'])
	const striped = useContext(TableContext) ?? false
	const section = useContext(TableSectionContext)
	const inBody = section === 'body'
	const allowHover = () => local.hover !== false && inBody
	const stripeClass = () => {
		if (!inBody) return ''
		if (local.stripe !== undefined) return local.stripe ? 'bg-surface-stripe' : ''
		return striped ? 'even:bg-surface-stripe' : ''
	}
	return (
		<tr
			class={cn(
				'transition-colors',
				stripeClass(),
				allowHover() ? 'hover:bg-ink-900/5' : '',
				local.class,
			)}
			{...others}
		/>
	)
}

export interface TableHeadProps
	extends JSX.ThHTMLAttributes<HTMLTableCellElement> {}

export function TableHead(props: TableHeadProps) {
	const [local, others] = splitProps(props, ['class', 'scope'])
	return (
		<th
			scope={local.scope ?? 'col'}
			class={cn(
				'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-500',
				local.class,
			)}
			{...others}
		/>
	)
}

export interface TableCellProps
	extends JSX.TdHTMLAttributes<HTMLTableCellElement> {}

export function TableCell(props: TableCellProps) {
	const [local, others] = splitProps(props, ['class'])
	return (
		<td class={cn('px-4 py-3 align-middle text-sm text-ink-900', local.class)} {...others} />
	)
}
