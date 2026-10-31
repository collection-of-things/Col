import type { JSX } from 'solid-js'
import { Show, For, splitProps } from 'solid-js'
import { cn } from '../../utilities/classNames'
import { Alert } from '../feedback/Alert'
import type { ComponentSize } from '../../types/component-size'
import { ComponentSizeProvider } from '../../utilities/componentSizeContext'

export interface FormProps extends Omit<JSX.FormHTMLAttributes<HTMLFormElement>, 'class'> {
	/** Optional class for the form element */
	class?: string
	/** Default size for supported field components inside this form. Individual fields can override with their own size prop. */
	size?: ComponentSize
	/** Form content (fields, sections, actions) */
	children: JSX.Element
	/** Optional form-level validation summary. When set, rendered at the top. Alert component provides alert semantics. Use for listing all field errors. */
	errorSummary?: string[] | JSX.Element
}

/** Form wrapper with consistent spacing. Use with layout primitives and WizardActions for the button row. Supports errorSummary for validation summary. */
export function Form(props: FormProps): JSX.Element {
	const [local, rest] = splitProps(props, ['class', 'children', 'errorSummary', 'size'])
	return (
		<ComponentSizeProvider size={local.size}>
			<form data-torchui-form-size={local.size} class={cn('flex flex-col gap-6', local.class)} {...rest}>
				<Show when={local.errorSummary && (Array.isArray(local.errorSummary) ? local.errorSummary.length > 0 : true)}>
					<>
						{Array.isArray(local.errorSummary) ? (
							<Alert status="error" class="mb-0">
								<p class="font-medium">Please fix the following:</p>
								<ul class="mt-1 list-inside list-disc">
									<For each={local.errorSummary}>
										{(msg) => <li>{msg}</li>}
									</For>
								</ul>
							</Alert>
						) : (
							local.errorSummary
						)}
					</>
				</Show>
				{local.children}
			</form>
		</ComponentSizeProvider>
	)
}
