import {
  type ComponentProps,
  splitProps,
} from "solid-js";
import {
  TableHeadContext,
} from "@/components/TableHeadContext";

export type TableHeadProps = ComponentProps<"thead">;

const TableHead = (
  props: TableHeadProps,
) => {

  const [local, rest] = splitProps(props, [
    "children",
  ]);

  const tableHeadContextValue = {
    isHead: true,
  };

  return (
    <thead
      {...rest}
    >
      <TableHeadContext.Provider
        value={tableHeadContextValue}
      >
        {local.children}
      </TableHeadContext.Provider>
    </thead>
  );
};

export default TableHead;