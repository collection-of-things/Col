import '@testing-library/jest-dom'
import { vi, expect } from 'vitest'
import { toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
})

// ResizeObserver is not available in JSDOM — required by Kobalte (Pagination, ViewSwitcher, etc.)
global.ResizeObserver = class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}

// getBoundingClientRect returns zeros in JSDOM, causing calc(NaN%) in Kobalte Slider
Element.prototype.getBoundingClientRect = vi.fn(() => ({
	x: 0, y: 0, width: 200, height: 40, top: 0, right: 200, bottom: 40, left: 0,
	toJSON: () => {},
}))

// Suppress CSS parse errors thrown by JSDOM when Kobalte sets calc(NaN%) custom properties
const _origSetProperty = CSSStyleDeclaration.prototype.setProperty
CSSStyleDeclaration.prototype.setProperty = function (prop: string, value: string, priority?: string) {
	try { _origSetProperty.call(this, prop, value, priority) } catch { /* suppress calc(NaN%) */ }
}

// navigator.clipboard is not available in JSDOM
Object.defineProperty(navigator, 'clipboard', {
	value: { writeText: vi.fn().mockResolvedValue(undefined) },
	writable: true,
	configurable: true,
})
