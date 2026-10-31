import {
  type ComponentProps,
  type JSXElement,
  createMemo,
  mergeProps,
  createEffect,
  onCleanup,
  Show,
  splitProps,
} from "solid-js";
import { Portal } from "solid-js/web";
import {
  type Prettify,
} from "@/components/types/Prettify";
import {
  type WithExtendedComponentProps
} from "@/components/types/ExtendedComponentProps";
import {
  type VariantProps,
} from "tailwind-variants";
import cn from "@/components/utils/cn";
import Backdrop, {
  type BackdropProps,
} from "@/components/Backdrop";
import {
  useThemeContext,
} from "@/components/ThemeProvider/";
import dialogDefaultStyles from "./style";

type DialogVariants = VariantProps<typeof dialogDefaultStyles>;

type DialogSlotProps = Prettify<{
  backdrop?: Prettify<BackdropProps & WithExtendedComponentProps>;
}>;

export type DialogCloseReason = "escape" | "backdrop";

export type DialogProps = {
  children?: JSXElement;
  class?: string;
  fullscreen?: DialogVariants["fullscreen"];
  onClose?: (event: Event, reason: DialogCloseReason) => void;
  open?: boolean;
  ref?: (element: HTMLDivElement) => void;
  role?: "alertdialog" | "dialog";
  slotProps?: DialogSlotProps;
} & Omit<
  ComponentProps<"div">,
  "onClose" | "ref"
>;

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const Dialog = (
  props: DialogProps,
) => {

  const merged = mergeProps({
    fullscreen: false as const,
  }, props);

  const [local, rest] = splitProps(merged, [
    "class",
    "children",
    "fullscreen",
    "open",
    "onClose",
    "ref",
    "slotProps",
  ]);

  const themeContextValue = useThemeContext();

  let dialog!: HTMLDivElement;

  const getFocusableElements = (): HTMLElement[] => {
    if (!dialog) return [];
    return Array.from(
      dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter((element) => {
      const style = getComputedStyle(element);
      return (
        !element.hasAttribute("disabled") &&
        style.display !== "none" &&
        style.visibility !== "hidden"
      );
    });
  };

  const focusFirst = () => {
    const first = getFocusableElements()[0];
    if (first) {
      first.focus();
    } else {
      dialog.focus();
    }
  };

  const focusLast = () => {
    const elements = getFocusableElements();
    const last = elements[elements.length - 1];
    if (last) {
      last.focus();
    } else {
      dialog.focus();
    }
  };

  const handleKeyDown = (
    event: KeyboardEvent
  ): void => {
    if (!local.open || !dialog) return;

    if (event.key === "Escape") {
      event.preventDefault();
      local.onClose?.(event, "escape");
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = getFocusableElements();

    if (focusable.length === 0) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    // Focus has escaped the dialog.
    if (!dialog.contains(active)) {
      event.preventDefault();
      if (event.shiftKey) {
        focusLast();
      } else {
        focusFirst();
      }
      return;
    }

    // Shift + Tab: first -> last
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    // Tab: last -> first
    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleFocusIn = (
    event: FocusEvent,
  ): void => {
    if (!local.open || !dialog) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (!dialog.contains(target)) {
      focusFirst();
    }
  };

  createEffect(() => {
    if (!local.open) {
      document.body.classList.remove("overflow-hidden");
      return;
    }

    document.body.classList.add("overflow-hidden");
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);

    onCleanup(() => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);
    });
  });

  const handleBackdropClick = (
    event: MouseEvent,
  ) => {
    if (
      event.target === dialog || 
      dialog.contains(event.target as Node)
    ) {
      return;
    }
    local.onClose?.(event, "backdrop");
    local.slotProps?.backdrop?.onClick?.(event);
  };

  const classes = createMemo(() => {
    const state = {
      fullscreen: local.fullscreen,
    };
    if (themeContextValue) {
      return themeContextValue.componentsTV.dialog(state);
    }
    return dialogDefaultStyles(state);
  });

  return (
    <Show when={local.open}>
      <Portal>
        <Backdrop
          {...local.slotProps?.backdrop}
          onClick={handleBackdropClick}
        >
          <div
            role="dialog"
            aria-modal="true"
            {...rest}
            class={cn(
              classes(),
              local.class,
            )}
            ref={(element) => {
              dialog = element;
              local.ref?.(element);
            }}
          >
            {local.children}
          </div>
        </Backdrop>
      </Portal>
    </Show>
  );
};

export default Dialog;