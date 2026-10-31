import { createSignal, createEffect, type JSX, Show, For, splitProps, onCleanup } from 'solid-js'
import { Copy } from '../actions'
import { CollapsibleRoot, CollapsibleTrigger, CollapsibleContentStyled } from './Collapsible'
import { PopoverRoot, PopoverTrigger, PopoverContent } from '../overlays/Popover'
import { cn } from '../../utilities/classNames'
import { useIcons } from '../../icons'

export interface CodeBlockLanguage {
	/** Unique id for the tab (e.g. "js", "ts"). */
	id: string
	/** Tab label (e.g. "JavaScript", "TypeScript"). */
	label: string
	/** Code content for this variant. */
	content: string
	/** Language identifier passed to the highlighter. Defaults to id. */
	language?: string
	/** Optional icon (e.g. SVG). Pass a function to show the icon in both the trigger and the list (e.g. `() => <Icon name="JS" />`); a static element can only appear in one place. */
	icon?: JSX.Element | (() => JSX.Element)
}

export interface CodeBlockProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'> {
	/** Code content (single block). When used, language applies. */
	content?: string
	/** Alternate content (e.g. component-only snippet). When set, a toggle in the header switches between content and alternateContent. */
	alternateContent?: string
	/** Language identifier passed to the highlighter (e.g. "tsx", "bash"). No-op when no highlighter is provided. */
	language?: string
	/** Multiple language variants with a tab switcher. When set, content/language are ignored for initial display. */
	languages?: CodeBlockLanguage[]
	/** Optional filename or title shown in the header (e.g. "Table.jsx"). */
	filename?: string
	/** Optional label in the header (e.g. "Embed Code"). Shown with or instead of filename. */
	label?: string
	/** Optional icon or image (e.g. SVG) shown to the left of the filename/label in the header. */
	headerIcon?: JSX.Element
	/** Show line numbers. */
	showLineNumbers?: boolean
	/** Line numbers to highlight (e.g. [2, 3, 5]). */
	highlightLines?: number[]
	/** When true, force dark appearance regardless of app theme. When undefined, follow app light/dark (e.g. .dark on root). */
	dark?: boolean
	/** Use primary (brand) background. Overrides dark. */
	primary?: boolean
	/** Minimum height (e.g. "min-h-[120px]"). Default none (min-h-0) so short snippets don't reserve extra space. */
	minHeight?: string
	/** When true, code is in a collapsible section with a "Show code" / "Hide code" trigger. */
	collapsible?: boolean
	/** When collapsible, whether the code is open by default. Default false. */
	defaultCodeOpen?: boolean
	/**
	 * Embedded mode for placing the CodeBlock inside another surface (e.g. Card).
	 * Removes the outer border/radius and uses a flat trigger.
	 */
	embedded?: boolean
	/** Label for the trigger when code is hidden. Default "Show code". */
	collapsibleLabelShow?: string
	/** Label for the trigger when code is visible. Default "Hide code". */
	collapsibleLabelHide?: string
	/**
	 * Optional syntax highlighter. Called with `(code, language)`, must return highlighted HTML or a Promise.
	 * When omitted, code is rendered as plain text.
	 * Example (Prism): `(code, lang) => highlightCode(code, lang)` where highlightCode loads grammars on demand.
	 */
	highlighter?: (code: string, language: string) => string | Promise<string>
	class?: string
	preProps?: JSX.HTMLAttributes<HTMLPreElement>
}

function getHeaderTitle(props: CodeBlockProps): string | undefined {
	if (props.filename != null && props.filename !== '') return props.filename
	if (props.label != null && props.label !== '') return props.label
	return undefined
}

/**
 * Code block with optional copy button, language switcher, line numbers, and optional syntax highlighting.
 * Pass a `highlighter` function to enable syntax highlighting — the function receives `(code, language)` and
 * must return highlighted HTML (or a Promise resolving to it). Without a highlighter, code renders as plain text.
 * Import token styles for your highlighter's output: `import '@torch-ui/solid/styles/code-block-tokens.css'`
 */
const CODE_BLOCK_PROP_KEYS = [
	'content',
	'alternateContent',
	'language',
	'languages',
	'filename',
	'label',
	'headerIcon',
	'showLineNumbers',
	'highlightLines',
	'dark',
	'primary',
	'minHeight',
	'collapsible',
	'defaultCodeOpen',
	'embedded',
	'collapsibleLabelShow',
	'collapsibleLabelHide',
	'highlighter',
	'class',
	'preProps',
	'ref',
] as const

export function CodeBlock(props: CodeBlockProps) {
	const [local, others] = splitProps(props, [...CODE_BLOCK_PROP_KEYS])
	const icons = useIcons()
	const primary = () => local.primary === true
	/** Follow app theme when not forcing dark. */
	const themeAuto = () => !primary() && local.dark !== true
	const dark = () => local.dark === true
	const minHeight = () => local.minHeight ?? 'min-h-0'
	const showLineNumbers = () => local.showLineNumbers === true
	const highlightLines = () => local.highlightLines ?? []

	const [selectedIndex, setSelectedIndex] = createSignal(0)
	const [languageOpen, setLanguageOpen] = createSignal(false)
	const [showAlternate, setShowAlternate] = createSignal(true)
	const [codeOpen, setCodeOpen] = createSignal(local.defaultCodeOpen ?? false)
	const collapsible = () => local.collapsible === true
	const embedded = () => local.embedded === true
	const triggerClass = () =>
		cn(
			'flex w-full items-center justify-center gap-2 py-2.5 text-sm font-medium',
			codeOpen() ? 'rounded-none border-t border-surface-border' : 'rounded-b-xl',
			'text-ink-600 hover:text-ink-900',
			'bg-surface-overlay hover:bg-surface-dim',
			'outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500'
		)

	const currentContent = (): string => {
		const langs = local.languages
		if (langs && langs.length > 0) {
			const idx = selectedIndex()
			return langs[idx]?.content ?? langs[0].content
		}
		return local.content ?? ''
	}

	/** When alternateContent is set, this is the content actually displayed (full vs snippet). */
	const effectiveContent = (): string => {
		if (local.alternateContent != null && showAlternate()) return local.alternateContent
		return currentContent()
	}

	const currentLanguage = (): string => {
		const langs = local.languages
		if (langs && langs.length > 0) {
			const idx = selectedIndex()
			const item = langs[idx] ?? langs[0]
			return item?.language ?? item?.id ?? 'text'
		}
		return local.language ?? 'text'
	}

	/** Currently selected language item (for icon, etc.). */
	const selectedLanguageItem = (): CodeBlockLanguage | undefined => {
		const langs = local.languages ?? []
		const idx = selectedIndex()
		return langs[idx] ?? langs[0]
	}

	const hasHeader = () => {
		const title = getHeaderTitle(local)
		const hasLangs = local.languages && local.languages.length > 1
		const hasAlternate = local.alternateContent != null && local.alternateContent.trim() !== ''
		return !!(title || hasLangs || hasAlternate)
	}

	const lines = () => {
		const text = effectiveContent()
		return text.split(/\r?\n/)
	}

	const containerClass = () => {
		const base = primary() ? 'bg-primary-600' : dark() ? '' : 'bg-surface-raised'
		if (embedded()) return base
		return cn(
			base,
			primary() ? 'border border-primary-600/80' : 'border border-surface-border'
		)
	}

	const containerStyle = () =>
		dark() && !primary()
			? { 'background-color': 'color-mix(in oklch, white 6%, #020b13)' }
			: undefined

	const headerBorderClass = () =>
		primary() ? 'border-primary-500/60' : 'border-surface-border'

	const headerTextClass = () =>
		primary() ? 'text-white/90' : 'text-ink-500'

	/* Minimal copy: icon only, no border/outline, blends into header */
	const copyButtonClass = () =>
		primary()
			? '!border-0 !bg-transparent !shadow-none text-white/70 hover:!bg-white/15 hover:text-white focus-visible:ring-white/50'
			: '!border-0 !bg-transparent !shadow-none text-ink-500 hover:!bg-surface-overlay hover:text-ink-700'

	/* Line numbers: light grey, right-aligned, subtle separator (like reference) */
	const lineNumClass = () =>
		primary() ? 'text-white/40' : 'text-ink-400'

	const [codeEl, setCodeEl] = createSignal<HTMLElement | null>(null)
	createEffect(() => {
		const el = codeEl()
		if (!el) return
		let cancelled = false

		const content = effectiveContent()
		const _lang = currentLanguage()
		const h = local.highlighter

		// Always set textContent first — safe plain-text fallback
		el.textContent = content

		if (h) {
			Promise.resolve(h(content, _lang))
				.then((html) => {
					if (cancelled) return
					el.innerHTML = html
				})
				.catch((err) => {
					console.warn(`[torch-ui] CodeBlock highlighter failed for language "${_lang}".`, err)
				})
		}

		onCleanup(() => {
			cancelled = true
		})
	})
	/* Token styling: .code-block (follows app .dark) or forced .code-block-dark / .code-block-primary */
	const themeClass = () =>
		primary()
			? 'code-block-primary'
			: dark()
				? 'code-block-dark'
				: 'code-block'

	const codeContent = (
		<>
			<Show when={hasHeader()}>
				<div
					class={cn(
						'flex items-center justify-between gap-2 px-3 py-2 border-b',
						headerBorderClass()
					)}
				>
					<div class="min-w-0 flex-1 flex items-center gap-2 truncate">
						<Show when={local.headerIcon}>
							<span class="shrink-0 flex items-center [&>svg]:size-4 [&>img]:size-4" aria-hidden="true">
								{local.headerIcon}
							</span>
						</Show>
						<Show when={getHeaderTitle(local)}>
							<span
								class={cn(
									'text-xs font-medium truncate',
									headerTextClass()
								)}
							>
								{getHeaderTitle(local)}
							</span>
						</Show>
					</div>
					<div class="flex shrink-0 items-center gap-2">
						<Show when={local.languages && local.languages.length > 1}>
							<PopoverRoot open={languageOpen()} onOpenChange={setLanguageOpen} align="end">
								<PopoverTrigger
									as="button"
									type="button"
									aria-label="Language"
									class={cn(
										'h-7 min-w-0 flex items-center gap-1.5 rounded border text-xs font-medium overflow-hidden cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500',
										primary()
											? 'bg-white/10 border-white/30 text-white hover:bg-white/15'
											: themeAuto()
												? 'bg-surface-raised border-surface-border text-ink-700 hover:bg-surface-overlay'
												: dark()
													? 'bg-surface-overlay border-surface-border text-ink-300 hover:bg-surface-dim'
													: 'bg-surface-overlay border-surface-border text-ink-700 hover:bg-surface-dim'
									)}
								>
									<Show when={selectedLanguageItem()?.icon}>
										<span class="shrink-0 flex items-center pl-2 [&>svg]:size-3.5 [&>img]:size-3.5 text-inherit" aria-hidden="true">
											{(typeof selectedLanguageItem()!.icon === 'function'
												? (selectedLanguageItem()!.icon as () => JSX.Element)()
												: selectedLanguageItem()!.icon) as JSX.Element}
										</span>
									</Show>
									<span class="min-w-0 flex-1 truncate text-left py-1 pr-1 pl-1.5">
										{selectedLanguageItem()?.label ?? ''}
									</span>
									{icons.chevronDown({ class: 'h-3.5 w-3.5 shrink-0 mr-1.5 opacity-70', 'aria-hidden': 'true' })}
								</PopoverTrigger>
								<PopoverContent
									class={cn(
										'min-w-0 p-1 max-h-60 overflow-auto',
										primary()
											? 'bg-ink-900 border-white/20'
											: 'bg-surface-raised border-surface-border'
									)}
								>
									<div class="flex flex-col" role="menu" aria-label="Language">
										<For each={local.languages ?? []}>
											{(item, idx) => (
												<button
													type="button"
													role="menuitemradio"
													aria-checked={selectedIndex() === idx()}
													class={cn(
														'w-full flex items-center gap-2 rounded px-2 py-1.5 text-left text-xs font-medium transition-colors',
														primary()
															? 'text-ink-200 hover:bg-white/10 hover:text-white'
															: themeAuto()
																? 'text-ink-700 hover:bg-surface-overlay'
																: dark()
																	? 'text-ink-300 hover:bg-surface-overlay'
																	: 'text-ink-700 hover:bg-surface-overlay',
														selectedIndex() === idx() && 'bg-primary-500/20 text-primary-600'
													)}
													onClick={() => {
														setSelectedIndex(idx())
														setLanguageOpen(false)
													}}
												>
													<Show when={item.icon && (typeof item.icon === 'function' || selectedIndex() !== idx())}>
														<span class="shrink-0 flex items-center [&>svg]:size-3.5 [&>img]:size-3.5 text-inherit" aria-hidden="true">
															{typeof item.icon === 'function' ? (item.icon as () => JSX.Element)() : item.icon}
														</span>
													</Show>
													<Show when={item.icon && typeof item.icon !== 'function' && selectedIndex() === idx()}>
														<span class="w-3.5 shrink-0" aria-hidden="true" />
													</Show>
													<span class="min-w-0 truncate">{item.label}</span>
												</button>
											)}
										</For>
									</div>
								</PopoverContent>
							</PopoverRoot>
						</Show>
						<Show when={local.alternateContent != null && local.alternateContent.trim() !== ''}>
							<button
								type="button"
								onClick={() => setShowAlternate((p) => !p)}
								aria-pressed={showAlternate()}
								class={cn(
									'flex items-center gap-1.5 shrink-0 px-2 py-1 text-xs font-medium rounded transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500',
									primary()
										? 'text-white/80 hover:bg-white/15 hover:text-white'
										: themeAuto()
											? 'text-ink-600 hover:bg-surface-overlay hover:text-ink-900'
											: dark()
												? 'text-ink-400 hover:bg-surface-overlay hover:text-ink-100'
												: 'text-ink-600 hover:bg-surface-overlay hover:text-ink-900'
								)}
							>
								{showAlternate() ? 'Full code' : 'Component only'}
							</button>
						</Show>
						<Copy
							text={effectiveContent()}
							display="icon-only"
							variant="ghost"
							size="sm"
							class={copyButtonClass()}
						/>
					</div>
				</div>
			</Show>

			<Show when={!hasHeader()}>
				<div
					class={cn(
						'absolute right-4 z-10 opacity-80 transition-opacity hover:opacity-100 focus-within:opacity-100',
						collapsible() ? 'top-14' : 'top-1/2 -translate-y-1/2'
					)}
				>
					<Copy
						text={effectiveContent()}
						display="icon-only"
						variant="ghost"
						size="sm"
						class={copyButtonClass()}
					/>
				</div>
			</Show>

			<pre
				data-torchui="code-block"
				class={cn(
					'w-full py-3 px-4 text-sm font-mono whitespace-pre overflow-x-auto overflow-y-auto outline-none',
					minHeight(),
					themeClass(),
					/* No text-* on pre: let Prism theme (or token CSS) color tokens; otherwise inherited color overrides .token */
					showLineNumbers() && 'pl-0',
					local.preProps?.class
				)}
				{...(local.preProps ? (() => {
					const { class: _, ...rest } = local.preProps
					return rest
				})() : {})}
			>
				<Show
					when={showLineNumbers()}
					fallback={
						<code ref={setCodeEl} class={cn('block leading-5', `language-${currentLanguage()}`)} />
					}
				>
					<div class="flex min-w-0">
						<div
							class={cn(
								'select-none py-3 pr-3 pl-0 w-8 shrink-0 text-right text-xs font-mono tabular-nums',
								lineNumClass()
							)}
							aria-hidden="true"
						>
							<For each={lines()}>
								{(_, i) => {
									const num = i() + 1
									const isHighlighted = () => highlightLines().includes(num)
									return (
										<div
											class={cn(
												'leading-5',
												isHighlighted() &&
													(primary()
														? 'bg-white/20 -mx-1 px-1 rounded'
														: 'bg-surface-dim -mx-1 px-1 rounded'
													)
											)}
										>
											{num}
										</div>
									)
								}}
							</For>
						</div>
						<code
							ref={setCodeEl}
							class={cn('block flex-1 min-w-0 py-4 pr-4 pl-4 leading-6', `language-${currentLanguage()}`)}
						/>
					</div>
				</Show>
			</pre>
		</>
	)

	return (
		<div
			ref={local.ref}
			data-torchui="code-block-container"
			class={cn(
				embedded()
					? 'overflow-hidden relative'
					: 'rounded-lg overflow-hidden relative mt-4',
				!hasHeader() && !collapsible() && 'group',
				themeClass(),
				containerClass(),
				local.class
			)}
			style={containerStyle()}
			{...others}
		>
			<Show when={collapsible()} fallback={codeContent}>
				<CollapsibleRoot open={codeOpen()} onOpenChange={setCodeOpen}>
					<CollapsibleTrigger class={triggerClass()}>
						{codeOpen() ? (
							<>
								{icons.chevronUp({ class: 'h-4 w-4', 'aria-hidden': 'true' })}
								{local.collapsibleLabelHide ?? 'Hide code'}
							</>
						) : (
							<>
								{icons.chevronDown({ class: 'h-4 w-4', 'aria-hidden': 'true' })}
								{local.collapsibleLabelShow ?? 'Show code'}
							</>
						)}
					</CollapsibleTrigger>
					<CollapsibleContentStyled variant="minimal">
						{codeContent}
					</CollapsibleContentStyled>
				</CollapsibleRoot>
			</Show>
		</div>
	)
}
