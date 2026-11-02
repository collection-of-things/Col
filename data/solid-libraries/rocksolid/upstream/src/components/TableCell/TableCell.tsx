import {
  type ComponentProps,
  createMemo,
  mergeProps,
  splitProps,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import {
  type VariantProps,
} from "tailwind-variants";
import cn from "@/components/utils/cn";
import {
  useThemeContext,
} from "@/components/ThemeProvider/";
import {
  useTableContext,
} from "@/components/TableContext";
import {
  useTableHeadContext,
} from "@/components/TableHeadContext";
import tableCellDefaultStyles from "./style";

type TableCellVariants = VariantProps<typeof tableCellDefaultStyles>;

export type TableCellProps = {
  as?: "th" | "td",
  class?: string;
  align?: TableCellVariants["align"];
} & ComponentProps<"th" | "td">;

const TableCell = (
  props: TableCellProps,
) => {

  const merged = mergeProps({
    align: "left" as const,
  }, props);

  const [local, rest] = splitProps(merged, [
    "align",
    "as",
    "class",
    "children",
  ]);

  const themeContextValue = useThemeContext();
  
  const tableContextValue = useTableContext();

  const tableHeadContextValue = useTableHeadContext();

  const component = createMemo(() => {
    if (tableHeadContextValue?.isHead) {
      return "th";
    }
    return local.as === "th" ? "th" : "td";
  });

  const classes = createMemo(() => {
    const state = {
      align: local.align,
      dense: !!tableContextValue?.dense?.(),
    };
    if (themeContextValue) {
      return themeContextValue.componentsTV.tableCell(state);
    }
    return tableCellDefaultStyles(state);
  });

  return (
    <Dynamic
      component={component()}
      {...rest}
      class={cn(
        classes(),
        local.class,
      )}
    >
      {local.children}
    </Dynamic>
  );
};

export default TableCell;