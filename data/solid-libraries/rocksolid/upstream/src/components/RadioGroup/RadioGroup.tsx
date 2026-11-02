import {
  type ComponentProps,
  type JSXElement,
  createSignal,
  mergeProps,
  splitProps,
} from "solid-js";
import {
  RadioGroupContext,
} from "@/components/RadioGroupContext";

export type RadioGroupProps = {
  defaultValue?: string;
  name?: string;
  onChange?: (event: Event, value: string) => void;
  value?: string;
  children?: JSXElement;
} & Omit<
  ComponentProps<"div">,
  "onChange"
>;

const RadioGroup = (
  props: RadioGroupProps,
) => {

  const merged = mergeProps({
    defaultValue: "" as const,
  }, props);

  const [local, rest] = splitProps(merged, [
    "children",
    "value",
    "defaultValue",
    "name",
    "onChange",
  ]);

  const isControlled = typeof local.value !== "undefined";
    
  const [localValue, setLocalValue] = createSignal<string>(local.defaultValue);

  const value = () => isControlled ? local.value! : localValue();

  const handleChange = (event: Event, value: string) => {
    if (!isControlled) {
      setLocalValue(value);
    }
    local.onChange?.(event, value);
  };

  const contextValue = {
    name: () => local.name,
    value,
    onChange: handleChange,
  };

  return (
    <div
      {...rest}
      role="radiogroup"
    >
      <RadioGroupContext.Provider
        value={contextValue}
      >
        {local.children}
      </RadioGroupContext.Provider>
    </div>
  );
};

export default RadioGroup;