import type { JSX } from 'solid-js'
import { Button } from '../actions'
import { cn } from '../../utilities/classNames'

export interface FormActionsProps {
	/** Label for the back/secondary button */
	backLabel: string
	onBack: () => void
	/** Label for the primary button */
	primaryLabel: string
	loading?: boolean
	disabled?: boolean
	class?: string
}

export interface FormActionsSubmitProps extends FormActionsProps {
	/** Primary button type */
	primaryType?: 'submit'
}

export interface FormActionsButtonProps extends FormActionsProps {
	/** Primary button type */
	primaryType: 'button'
	/** Handler for primary button click (required when type='button') */
	onPrimary: () => void
}

export type FormActionsAllProps = FormActionsSubmitProps | FormActionsButtonProps

/** Back + primary button row for forms (e.g. wizard steps). */
export function FormActions(props: FormActionsAllProps): JSX.Element {
	const isSubmit = props.primaryType !== 'button'
	return (
		<div class={cn('flex gap-3 pt-2', props.class)}>
			<Button type="button" variant="ghost" onClick={props.onBack} class="rounded-lg">
				{props.backLabel}
			</Button>
			<Button
				type={isSubmit ? 'submit' : 'button'}
				variant="primary"
				loading={props.loading ?? false}
				disabled={props.disabled ?? false}
				onClick={isSubmit ? undefined : (props.primaryType === 'button' ? props.onPrimary : undefined)}
				class="rounded-lg py-2.5 font-semibold"
			>
				{props.primaryLabel}
			</Button>
		</div>
	)
}
