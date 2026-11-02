import {
  type ComponentProps,
  createMemo,
  splitProps,
} from "solid-js";
import cn from "@/components/utils/cn";
import {
  useThemeContext,
} from "@/components/ThemeProvider/";
import tableFooterDefaultStyles from "./style";

export type TableFooterProps = ComponentProps<"tfoot">;

const TableFooter = (
  props: TableFooterProps,
) => {

  const [local, rest] = splitProps(props, [
    "class",
  ]);

  const themeContextValue = useThemeContext();

  const classes = createMemo(() => {
    if (themeContextValue) {
      return themeContextValue.componentsTV.tableFooter();
    }
    return tableFooterDefaultStyles();
  });

  return (
    <tfoot
      {...rest}
      class={cn(
        classes(),
        local.class,
      )}
    />
  );
};

export default TableFooter;