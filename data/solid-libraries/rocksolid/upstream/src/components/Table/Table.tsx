import {
  type ComponentProps,
  createMemo,
  mergeProps,
  splitProps,
} from "solid-js";
import {
  useThemeContext,
} from "@/components/ThemeProvider/";
import cn from "@/components/utils/cn";
import {
  TableContext,
} from "@/components/TableContext";
import tableDefaultStyles from "./style";

export type TableProps = {
  class?: string;
  dense?: boolean;
} & ComponentProps<"table">;

const Table = (
  props: TableProps,
) => {

  const mergedProps = mergeProps({
    dense: false,
  }, props);

  const [local, rest] = splitProps(mergedProps, [
    "children",
    "class",
    "dense",
  ]);

  const themeContextValue = useThemeContext();

  const classes = createMemo(() => {
    if (themeContextValue) {
      return themeContextValue.componentsTV.table();
    }
    return tableDefaultStyles();
  });

  const tableContextValue = {
    dense: () => local.dense,
  };

  return (
    <table
      {...rest}
      class={cn(
        classes(),
        local.class,
      )}
    >
      <TableContext.Provider
        value={tableContextValue}
      >
        {local.children}
      </TableContext.Provider>
    </table>
  );
};

export default Table;