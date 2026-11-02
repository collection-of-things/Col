import {
  type ComponentProps,
  createMemo,
  splitProps,
} from "solid-js";
import {
  useThemeContext,
} from "@/components/ThemeProvider/";
import cn from "@/components/utils/cn";
import tableRowDefaultStyles from "./style";

export type TableRowProps = {
  class?: string;
  selected?: boolean;
} & ComponentProps<"tr">;

const TableRow = (
  props: TableRowProps,
) => {

  const [local, rest] = splitProps(props, [
    "children",
    "class",
    "selected",
  ]);

  const themeContextValue = useThemeContext();
  
  const classes = createMemo(() => {
    const state = {
      selected: local.selected,
    };
    if (themeContextValue) {
      return themeContextValue.componentsTV.tableRow(state);
    }
    return tableRowDefaultStyles(state);
  });

  return (
    <tr
      aria-selected={local.selected}
      {...rest}
      class={cn(
        classes(),
        local.class,
      )}
    >
      {local.children}
    </tr>
  );
};

export default TableRow;