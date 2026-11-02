import {
  type ComponentProps,
} from "solid-js";

export type TableBodyProps = ComponentProps<"tbody">;

const TableBody = (
  props: TableBodyProps,
) => {
  return (
    <tbody
      {...props}
    />
  );
};

export default TableBody;