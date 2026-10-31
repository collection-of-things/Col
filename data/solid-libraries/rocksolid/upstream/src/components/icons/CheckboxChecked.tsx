import { type ComponentProps } from "solid-js";

const CheckboxChecked = (
  props: ComponentProps<"svg">,
) => (
  <svg
    aria-hidden={true}
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
  >
    <path
      d="M5 3.75h14A1.25 1.25 0 0 1 20.25 5v14A1.25 1.25 0 0 1 19 20.25H5A1.25 1.25 0 0 1 3.75 19V5A1.25 1.25 0 0 1 5 3.75ZM7.5 10.9l2.8 2.8 5.9-5.9 1.4 1.4-7.3 7.3-4.2-4.2 1.4-1.4Z"
      fill="currentColor"
      fill-rule="evenodd"
      clip-rule="evenodd"
    />
  </svg>
);

export default CheckboxChecked;