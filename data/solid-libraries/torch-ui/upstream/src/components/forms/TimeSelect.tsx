import { Select as KobalteSelect } from '@kobalte/core/select'
import { cn } from '../../utilities/classNames'

interface TimeSelectProps {
	value: number
	options: number[]
	onChange: (v: number) => void
}

const fmt = (v: number) => String(v).padStart(2, '0')

export function TimeSelect(props: TimeSelectProps) {
	return (
		<KobalteSelect<string>
			value={fmt(props.value)}
			onChange={(v) => { if (v !== null) props.onChange(Number(v)) }}
			options={props.options.map(fmt)}
			gutter={4}
			sameWidth
			itemComponent={(p) => (
				<KobalteSelect.Item
					item={p.item}
					class="flex cursor-default select-none items-center rounded px-2 py-0.5 text-xs text-ink-900 data-[highlighted]:bg-primary-50 data-[highlighted]:text-primary-900 data-[selected]:font-semibold"
				>
					<KobalteSelect.ItemLabel>{p.item.rawValue}</KobalteSelect.ItemLabel>
				</KobalteSelect.Item>
			)}
		>
			<KobalteSelect.Trigger class={cn(
				'flex min-w-[2.75rem] items-center justify-between gap-1 rounded-md border border-surface-border bg-surface-raised px-2 py-1',
				'text-xs text-ink-900 focus:outline-none focus:ring-1 focus:ring-primary-500',
			)}>
				<KobalteSelect.Value<string>>
					{(state) => state.selectedOption()}
				</KobalteSelect.Value>
				<KobalteSelect.Icon class="text-[8px] text-ink-400 leading-none">▾</KobalteSelect.Icon>
			</KobalteSelect.Trigger>
			<KobalteSelect.Portal>
				<KobalteSelect.Content class={cn(
					'z-[80] min-w-[3rem] rounded-md border border-surface-border bg-surface-raised shadow-md',
					'origin-top data-[expanded]:animate-in data-[expanded]:fade-in-0 data-[expanded]:zoom-in-95',
					'data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95',
				)}>
					<KobalteSelect.Listbox class="max-h-48 overflow-y-auto p-1 focus:outline-none" />
				</KobalteSelect.Content>
			</KobalteSelect.Portal>
		</KobalteSelect>
	)
}
