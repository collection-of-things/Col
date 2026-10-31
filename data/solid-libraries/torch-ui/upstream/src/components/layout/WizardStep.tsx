import type { JSX, ParentComponent } from 'solid-js'

export interface WizardStepProps {
	/** Step number (1-based) for display */
	stepNumber?: number
	/** Step title */
	title: string
	/** Optional description below title */
	description?: string
	/** Optional class for the wrapper */
	class?: string
	children: JSX.Element
}

/** Wraps one wizard step's content with optional step badge, title, and description. */
export const WizardStep: ParentComponent<WizardStepProps> = (props) => {
	return (
		<div class={props.class}>
			<div class="mb-1 flex items-center gap-3">
				{props.stepNumber != null && (
					<span
						class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-500/15 text-sm font-semibold text-primary-600"
						aria-hidden="true"
					>
						{props.stepNumber}
					</span>
				)}
				<h2 class="font-semibold tracking-tight text-xl text-ink-900">
					{props.title}
				</h2>
			</div>
			{props.description && (
				<p class="mb-6 text-[0.9375rem] text-ink-500">
					{props.description}
				</p>
			)}
			{props.children}
		</div>
	)
}
