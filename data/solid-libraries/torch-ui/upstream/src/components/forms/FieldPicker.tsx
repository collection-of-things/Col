import { splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { Button } from '../actions'
import { Autocomplete } from './Autocomplete'
import { cn } from '../../utilities/classNames'

export interface FieldPickerOption {
	value: string
	label: string
}

export interface FieldPickerProps {
	label?: string
	options: FieldPickerOption[]
	value: string
	onValueChange: (value: string) => void
	onAdd: () => void
	addLabel?: string
	addIcon?: JSX.Element
	addDisabled?: boolean
	placeholder?: string
	class?: string
}

export const FieldPicker = (props: FieldPickerProps) => {
	const [local] = splitProps(props, [
		'label',
		'options',
		'value',
		'onValueChange',
		'onAdd',
		'addLabel',
		'addIcon',
		'addDisabled',
		'placeholder',
		'class',
	])

	return (
		<div class={cn('space-y-2', local.class)}>
			<div class="flex items-end gap-2">
				<Autocomplete
					label={local.label}
					value={local.value}
					onValueChange={local.onValueChange}
					options={local.options}
					placeholder={local.placeholder || 'Search fields...'}
					class="flex-1 min-w-0"
				/>
				<Button
					type="button"
					variant="outlined"
					size="md"
					startIcon={local.addIcon}
					class="shrink-0 h-10"
					disabled={local.addDisabled}
					onClick={local.onAdd}
				>
					{local.addLabel || 'Add'}
				</Button>
			</div>
		</div>
	)
}
