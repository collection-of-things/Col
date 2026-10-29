import { createContext, createComponent, useContext, type JSX } from 'solid-js'
import type { ComponentSize } from '../types/component-size'

const ComponentSizeContext = createContext<ComponentSize | undefined>(undefined)

export interface ComponentSizeProviderProps {
	size?: ComponentSize
	children: JSX.Element
}

export function ComponentSizeProvider(props: ComponentSizeProviderProps) {
	return createComponent(ComponentSizeContext.Provider, {
		value: props.size,
		get children() {
			return props.children
		},
	})
}

export function useComponentSize() {
	return useContext(ComponentSizeContext)
}
