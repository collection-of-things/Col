import { type ComponentProps } from "solid-js";

const Info = (
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
      d="M12 2.75a9.25 9.25 0 1 0 0 18.5a9.25 9.25 0 0 0 0-18.5m0 17a7.75 7.75 0 1 1 0-15.5a7.75 7.75 0 0 1 0 15.5m-.75-10.5v7a.75.75 0 1 0 1.5 0v-7a.75.75 0 1 0-1.5 0m0-2.5a.75.75 0 1 0 1.5 0a.75.75 0 0 0-1.5 0"
    />
  </svg>
);

export default Info;