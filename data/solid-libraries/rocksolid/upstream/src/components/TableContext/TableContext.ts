import {
  createContext,
  useContext,
  type Accessor,
} from "solid-js";

export type TableContextValue = {
  dense: Accessor<boolean>;
};

export const TableContext = (
  createContext<TableContextValue>()
);

export const useTableContext = () => {
  return useContext(TableContext);
};