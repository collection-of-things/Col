import { type JSX, splitProps } from 'solid-js'
import { cn } from '../../utilities/classNames'
import { WizardStepper, type WizardStepperVariant } from './WizardStepper'

export interface VerticalWizardProps {
	/** Current step (1-based) */
	step: number
	/** Label for each step */
	stepLabels: string[]
	/** Visual style: default or compact. Default: default. */
	variant?: WizardStepperVariant
	/** Width of the stepper sidebar. Default: md (w-48 / 192 px). */
	sidebarWidth?: 'sm' | 'md' | 'lg'
	/** Gap between sidebar and content. Default: md. */
	gap?: 'sm' | 'md' | 'lg' | 'xl'
	/** Optional class for the root wrapper */
	class?: string
	/** Optional class override for the sidebar panel */
	sidebarClass?: string
	/** Optional class override for the content panel */
	contentClass?: string
	/** Active step content */
	children: JSX.Element
}

const sidebarWidths: Record<NonNullable<VerticalWizardProps['sidebarWidth']>, string> = {
	sm: 'w-36',
	md: 'w-48',
	lg: 'w-64',
}

const gaps: Record<NonNullable<VerticalWizardProps['gap']>, string> = {
	sm: 'gap-4',
	md: 'gap-8',
	lg: 'gap-12',
	xl: 'gap-16',
}

/** Two-column wizard layout: vertical stepper on the left, step content on the right. */
export function VerticalWizard(props: VerticalWizardProps) {
	const [local] = splitProps(props, [
		'step',
		'stepLabels',
		'variant',
		'sidebarWidth',
		'gap',
		'class',
		'sidebarClass',
		'contentClass',
		'children',
	])

	return (
		<div class={cn('flex', gaps[local.gap ?? 'md'], local.class)}>
			<div class={cn('shrink-0', sidebarWidths[local.sidebarWidth ?? 'md'], local.sidebarClass)}>
				<WizardStepper
					step={local.step}
					totalSteps={local.stepLabels.length}
					stepLabels={local.stepLabels}
					orientation="vertical"
					variant={local.variant}
				/>
			</div>
			<div class={cn('min-w-0 flex-1', local.contentClass)}>
				{local.children}
			</div>
		</div>
	)
}
