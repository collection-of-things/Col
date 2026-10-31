import { merge } from "ts-deepmerge";
import { safeParse, type BaseIssue } from "valibot";
import defaultTheme, { type Theme } from "./theme/";
import ThemeSchema from "./theme/themeSchema";

type ThemeInput = {};

function formatThemeIssue(
  issue: BaseIssue<unknown>
): string {
  const path =
    issue.path
      ?.map((item) => String(item.key))
      .join(".") || "theme";

  return `${path}: ${issue.message}`;
}

function createTheme<T extends ThemeInput>(
  theme: T,
): Theme & T {
  const result = safeParse(ThemeSchema, theme);
  if (!result.success) {
    const details = result.issues
      .map(formatThemeIssue)
      .map((message) => `  - ${message}`)
      .join("\n");
    throw new Error(`Invalid theme configuration.\n\n${details}`);
  }
  return merge(defaultTheme, theme) as Theme & T;
}

export default createTheme;