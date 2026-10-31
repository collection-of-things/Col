import {
  createContext,
  useContext,
} from "solid-js";

export type TableHeadContextValue = {
  isHead: boolean;
};

export const TableHeadContext = (
  createContext<TableHeadContextValue>()
);

export const useTableHeadContext = () => {
  return useContext(TableHeadContext);
};