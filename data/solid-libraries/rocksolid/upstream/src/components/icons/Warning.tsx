import { type ComponentProps } from "solid-js";

const Warning = (
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
      d="M0 0h24v24H0z"
      fill="none"
    />
    <path
      fill="currentColor"
      d="M10.96 3.73a1.2 1.2 0 0 1 2.08 0l8.02 14a1.2 1.2 0 0 1-1.04 1.8H3.98a1.2 1.2 0 0 1-1.04-1.8zM12 5.24L4.9 17.99h14.2zM11.25 9.5V14a.75.75 0 1 0 1.5 0V9.5a.75.75 0 1 0-1.5 0m0 7a.75.75 0 1 0 1.5 0a.75.75 0 0 0-1.5 0"
    />
  </svg>
);

export default Warning;