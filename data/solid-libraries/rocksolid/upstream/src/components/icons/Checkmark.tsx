import { type ComponentProps } from "solid-js";

const Checkmark = (
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
      d="M12 2.75a9.25 9.25 0 1 0 0 18.5a9.25 9.25 0 0 0 0-18.5m0 17a7.75 7.75 0 1 1 0-15.5a7.75 7.75 0 0 1 0 15.5m4.28-10.03a.75.75 0 0 0-1.06 0l-4.1 4.1l-2.34-2.34a.75.75 0 1 0-1.06 1.06l2.87 2.87a.75.75 0 0 0 1.06 0l4.63-4.63a.75.75 0 0 0 0-1.06"
    />
  </svg>
);

export default Checkmark;