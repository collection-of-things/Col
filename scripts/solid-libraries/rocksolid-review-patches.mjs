// Preview-only repairs applied after the pinned RockSolid source is authenticated.
const replacements = {
  "upstream/src/components/AccordionDetails/AccordionDetails.tsx": [
    [
      `      {...a11yAttrs()}
      {...rest}
      class={cn(`,
      `      {...a11yAttrs()}
      {...rest}
      inert={!isExpanded()}
      aria-hidden={!isExpanded()}
      class={cn(`,
    ],
  ],
  "upstream/src/components/Avatar/Avatar.tsx": [
    [
      "  type ComponentProps,\n  type ValidComponent,",
      "  type ComponentProps,\n  type JSX,\n  type ValidComponent,",
    ],
    [
      "  const handleImageError = (event: ErrorEvent) => {",
      "  const handleImageError: JSX.EventHandler<HTMLImageElement, ErrorEvent> = (event) => {",
    ],
    [
      `    local.slotProps?.img?.onError(event);`,
      `    const onError: NonNullable<AvatarSlotProps["img"]>["onError"] = local.slotProps?.img?.onError;
    if (typeof onError === "function") onError(event);
    else onError?.[0](onError[1], event);`,
    ],
    ["          alt={avatarLetters()}", "          alt={local.alt ?? avatarLetters()}"],
  ],
  "upstream/src/components/Breadcrumbs/Breadcrumbs.tsx": [
    ["  const items = resolved.toArray();", "  const items = () => resolved.toArray().filter(item => item != null && typeof item !== \"boolean\");"],
    ["        <For each={items}>", "        <For each={items()}>"],
    ["(items.length - 1)", "(items().length - 1)"],
  ],
  "upstream/src/components/Dialog/Dialog.tsx": [
    [
      "const Dialog = (",
      "let dialogLockCount = 0;\nlet dialogBodyWasLocked = false;\n\nconst Dialog = (",
    ],
    [
      `    if (!local.open) {
      document.body.classList.remove("overflow-hidden");
      return;
    }

    document.body.classList.add("overflow-hidden");`,
      `    if (!local.open) return;

    if (dialogLockCount++ === 0) {
      dialogBodyWasLocked = document.body.classList.contains("overflow-hidden");
      document.body.classList.add("overflow-hidden");
    }`,
    ],
    [
      `    onCleanup(() => {
      document.removeEventListener("keydown", handleKeyDown);`,
      `    onCleanup(() => {
      if (--dialogLockCount === 0 && !dialogBodyWasLocked) {
        document.body.classList.remove("overflow-hidden");
      }
      document.removeEventListener("keydown", handleKeyDown);`,
    ],
  ],
  "upstream/src/components/Select/Select.tsx": [
    ["    selectRef.value =  local.value ?? \"\";", "    if (local.value !== undefined) selectRef.value = local.value;"],
  ],
  "upstream/src/components/Tab/Tab.tsx": [
    [
      `  const tabsContextValue = useTabsContext("Tab");`,
      `  const tabsContextValue = useTabsContext("Tab") as ReturnType<typeof useTabsContext> & {
    registerTab: (tab: { value: () => string; disabled: () => boolean }) => () => boolean;
  };
  const isTabbable = tabsContextValue.registerTab({
    value: () => local.value,
    disabled: () => Boolean(rest.disabled) || rest["aria-disabled"] === true || rest["aria-disabled"] === "true",
  });`,
    ],
    ["      tabIndex={isSelected() ? 0 : -1}", "      tabIndex={isTabbable() ? 0 : -1}"],
  ],
  "upstream/src/components/Tabs/Tabs.tsx": [
    [
      `  const handleTabListKeyDown = (event: KeyboardEvent) => {
    if (![
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
    ].includes(event.key)) {
      local.onKeyDown?.(event);
      return;
    }
\x20\x20\x20\x20
    const tabs = ((Array.from((
      event.currentTarget as HTMLElement
    ).querySelectorAll("[role=tab]"))) as HTMLButtonElement[])
    .filter((tab) => (
      tab.disabled !== true &&
      tab.getAttribute("aria-disabled") !== "true"
    ));

    const activeTabIndex = Math.max(
      tabs.findIndex(tab => (
        document.activeElement ===  tab
      )),\x20
      0
    );

    switch (event.key) {
      case "ArrowLeft":
        focusTab(activeTabIndex === 0 ? (
          tabs[tabs.length - 1]
        ) : (
          tabs[activeTabIndex - 1]
        ));
        break
      case "ArrowRight": {
        focusTab(activeTabIndex === (tabs.length - 1) ? (
          tabs[0]
        ) : (
          tabs[activeTabIndex + 1]
        ));
        break;
      };
      case "Home": {
        focusTab(tabs[0]);
        break;
      };
      case "End": {
        focusTab(tabs[tabs.length - 1]);
        break;
      };
    }
    local.onKeyDown?.(event);
  };`,
      `  const handleTabListKeyDown = (event: KeyboardEvent) => {
    const vertical = local.orientation === "vertical";
    const rtl = getComputedStyle(event.currentTarget as HTMLElement).direction === "rtl";
    const previous = vertical ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
    const next = vertical ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
    if (![previous, next, "Home", "End"].includes(event.key)) {
      local.onKeyDown?.(event);
      return;
    }

    const tabs = Array.from((event.currentTarget as HTMLElement)
      .querySelectorAll<HTMLButtonElement>("[role=tab]"))
      .filter(tab => !tab.disabled && tab.getAttribute("aria-disabled") !== "true");
    if (!tabs.length) {
      local.onKeyDown?.(event);
      return;
    }

    event.preventDefault();
    const index = Math.max(tabs.indexOf(document.activeElement as HTMLButtonElement), 0);
    const target = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 :
      (index + (event.key === next ? 1 : -1) + tabs.length) % tabs.length;
    focusTab(tabs[target]);
    local.onKeyDown?.(event);
  };`,
    ],
    ["      role=\"tablist\"\n      {...rest}", "      role=\"tablist\"\n      aria-orientation={local.orientation}\n      {...rest}"],
  ],
  "upstream/src/components/TabsContext/TabsContext.tsx": [
    ["  createSignal,\n", "  createSignal,\n  onCleanup,\n"],
    [
      "  const conextValue: TabsContextValue = {",
      `  type RegisteredTab = { value: () => string; disabled: () => boolean };
  const [tabs, setTabs] = createSignal<RegisteredTab[]>([]);
  const registerTab = (tab: RegisteredTab) => {
    setTabs(current => [...current, tab]);
    onCleanup(() => setTabs(current => current.filter(item => item !== tab)));
    return () => {
      const enabled = tabs().filter(item => !item.disabled());
      return (enabled.find(item => item.value() === activeTabValue()) ?? enabled[0]) === tab;
    };
  };

  const conextValue: TabsContextValue & { registerTab: typeof registerTab } = {`,
    ],
    ["    activeTabValue,\n    handleChange,", "    activeTabValue,\n    registerTab,\n    handleChange,"],
  ],
  "upstream/src/components/ThemeProvider/ThemeProvider.tsx": [
    ["  type JSXElement,\n  splitProps,", "  type JSXElement,\n  createMemo,\n  splitProps,"],
    [
      `  const componentsTV = (
    Object.fromEntries(
      Object.entries(ComponentsTVs)
      .map(([key, fn]) => [key, fn(local.theme)])
    ) as ComponentsTV
  );

  const themeContextValue = {
    theme: local.theme,
    componentsTV,
  };`,
      `  const componentsTV = createMemo(() => (
    Object.fromEntries(
      Object.entries(ComponentsTVs)
      .map(([key, fn]) => [key, fn(local.theme)])
    ) as ComponentsTV
  ));

  const themeContextValue = {
    get theme() { return local.theme; },
    get componentsTV() { return componentsTV(); },
  };`,
    ],
  ],
  "upstream/src/components/styles/theme/themeSchema.ts": [
    [
      "  rawCheck(({ dataset, addIssue }) => {\n    const colors =",
      "  rawCheck(({ dataset, addIssue }) => {\n    if (!dataset.typed) return;\n    const colors =",
    ],
  ],
};

export const rockSolidPreviewFiles = Object.keys(replacements);

export function patchRockSolidPreview(path, source) {
  for (const [original, replacement] of replacements[path] ?? []) {
    if (source.split(original).length !== 2) throw new Error(`RockSolid ${path} preview source changed`);
    source = source.replace(original, replacement);
  }
  return source;
}
