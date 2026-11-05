import { useLocation } from "@tanstack/react-router";

/** The current path without query or hash, for active-link state and per-page effects. */
export function usePathname() {
  return useLocation({ select: (location) => location.pathname });
}
