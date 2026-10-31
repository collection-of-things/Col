import { type ComponentProps } from "solid-js";

const RadioChecked = (
  props: ComponentProps<"svg">,
) => (
  <svg
    aria-hidden={true}
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="1.05em"
    height="1.05em"
    viewBox="0 0 24 24"
  >
    <path
      d="M12 3.75a8.25 8.25 0 1 1 0 16.5 8.25 8.25 0 0 1 0-16.5ZM12 5.25a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"
      fill="currentColor"
      fill-rule="evenodd"
      clip-rule="evenodd"
    />
  </svg>
);

export default RadioChecked;