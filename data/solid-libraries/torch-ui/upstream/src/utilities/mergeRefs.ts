/** Merge multiple refs (callback or object form) so the same element is forwarded to each. */
export function mergeRefs<T>(...refs: unknown[]): (el: T) => void {
	return (el: T) => {
		for (const ref of refs) {
			if (ref == null) continue
			if (typeof ref === 'function') (ref as (el: T) => void)(el)
			else if (typeof ref === 'object' && 'current' in (ref as { current?: T })) {
				(ref as { current: T }).current = el
			}
		}
	}
}
