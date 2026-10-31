import { type ComponentProps } from "solid-js";

const Cross = (
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
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-width="2" d="m8 8l4 4m0 0l4 4m-4-4l4-4m-4 4l-4 4"
    />
  </svg>
);

export default Cross;