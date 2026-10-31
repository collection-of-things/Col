import {
  type Accessor,
  createContext,
  useContext,
} from "solid-js";

export type RadioGroupContextValue = {
  name?: Accessor<string | undefined>;
  value: Accessor<string>;
  onChange: (event: Event, value: string) => void;
};

export const RadioGroupContext = (
  createContext<RadioGroupContextValue>()
);

export const useRadioGroupContext = () => {
  return useContext(RadioGroupContext);
};