export interface FilterGroup {
	id: string
	type: 'and' | 'or'
	logic: 'and' | 'or'
	children: FilterRule[]
}

export interface FilterRule {
	id: string
	field: string
	operator: string
	/** Value for the rule; type depends on field/operator (string, number, boolean, or null). */
	value: string | number | boolean | null
}

export interface FilterField {
	id: string
	label: string
	type: string
}

/** @internal Placeholder: returns a human-readable filter summary. Implement for your app's field labels and operators. */
export function formatFilterSummary(group: FilterGroup, options: { fields: FilterField[]; getOperators: (type: string) => unknown[] }): string {
	return 'Filter summary'
}

/** @internal Placeholder: returns code or query string for the filter. Implement for your app. */
export function formatFilterCode(group: FilterGroup, ruleNumbers: Map<string, string>): string {
	return 'Filter code'
}

/** @internal Placeholder: assigns display numbers to rules. Implement for your app. */
export function assignRuleNumbers(group: FilterGroup): Map<string, string> {
	return new Map()
}

/** @internal Placeholder: returns true if any rule has an empty field. Implement for validation. */
export function hasRulesWithEmptyField(group: FilterGroup): boolean {
	return false
}
