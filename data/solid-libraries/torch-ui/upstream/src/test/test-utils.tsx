import type { JSX } from 'solid-js'
import { render } from '@solidjs/testing-library'
import { IconsProvider, defaultIcons } from '../icons'

/**
 * Renders a component wrapped with the required TorchUI providers
 * (IconsProvider). Use this in all unit tests instead of bare `render()`.
 */
export function renderUI(ui: () => JSX.Element) {
	return render(() => (
		<IconsProvider icons={defaultIcons}>
			{ui()}
		</IconsProvider>
	))
}
