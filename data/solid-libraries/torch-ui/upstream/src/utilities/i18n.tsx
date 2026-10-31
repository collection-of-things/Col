import { I18nProvider, useLocale } from '@kobalte/core/i18n'
import type { JSX } from 'solid-js'

export interface AppI18nProviderProps {
	children: JSX.Element
	/** Override locale (e.g. "fr-FR", "ar-SA"). If not provided, uses browser/system locale. */
	locale?: string
}

/**
 * Provides internationalization context for the app.
 * Wraps Kobalte's I18nProvider to override browser/system locale with app settings.
 * 
 * This enables:
 * - Proper lang and dir HTML attributes for accessibility
 * - RTL language support (Arabic, Hebrew, Persian, etc.)
 * - Locale-aware behavior in Kobalte components
 * - Foundation for future i18n features
 * 
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <AppI18nProvider locale="fr-FR">
 *       <MyApp />
 *     </AppI18nProvider>
 *   )
 * }
 * ```
 */
export function AppI18nProvider(props: AppI18nProviderProps) {
	return (
		<I18nProvider locale={props.locale}>
			{props.children}
		</I18nProvider>
	)
}

/**
 * Hook to access the current locale and direction.
 * Returns reactive locale and direction values from Kobalte's useLocale.
 * 
 * Use this in your app root to set proper HTML attributes:
 * 
 * @example
 * ```tsx
 * function MyApp() {
 *   const { locale, direction } = useAppLocale()
 *   return (
 *     <div lang={locale()} dir={direction()}>
 *       Your app content
 *     </div>
 *   )
 * }
 * ```
 */
export function useAppLocale() {
	const { locale, direction } = useLocale()
	return { locale, direction }
}
