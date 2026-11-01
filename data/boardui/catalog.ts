import type { LibraryComponent } from "../components.ts";
import audit from "./audit.json" with { type: "json" };

export const BOARDUI_VERIFIED_AT = audit.checkedAt;

const aliases: Partial<Record<string, string[]>> = {
  "modal": ["dialog", "alert dialog"],
  "drawer": ["sheet", "bottom sheet"],
  "combobox": ["combo box", "autocomplete"],
  "command-palette": ["cmdk", "command menu"],
  "input": ["text field"],
  "input-otp": ["one time password", "verification code"],
  "dropdown": ["dropdown menu"],
  "kbd": ["keyboard shortcut"],
  "date-calendar": ["range calendar"],
  "project-board": ["kanban"],
  "agent-limits-card": ["context window", "token usage"],
  "contributions-card": ["contribution heatmap"],
};

/** Each documented registry item keeps its own identity, including shared-page variants. */
export const boarduiComponents: LibraryComponent[] = audit.items.flatMap((item) => {
  if (!item.indexed || !item.docs) return [];
  return [{
    name: item.title,
    url: item.docs.url,
    summary: item.summary,
    kind: item.type === "template" || item.name === "sidebar" ? "layout"
      : item.group === "base" ? "primitive" : "full-pattern",
    verifiedAt: BOARDUI_VERIFIED_AT,
    ...(aliases[item.name] ? { aliases: aliases[item.name] } : {}),
    ...(item.name === "modal" ? { concept: "dialog" } : {}),
    ...(item.name === "command-palette" ? { concept: "command-palette" } : {}),
    ...(item.tier === "free" ? {
      dependencies: item.dependencies,
      registryDependencies: item.registryDependencies,
      ...(item.dependencies.some(dependency => dependency.startsWith("react-aria-components@"))
        ? { builtOn: "react-aria-components" } : {}),
    } : {}),
  }];
});
