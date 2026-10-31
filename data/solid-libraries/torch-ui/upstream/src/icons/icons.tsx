import { createContext, useContext, splitProps, createMemo, type Accessor, type JSX } from 'solid-js'

export type TorchUIIconComponent = (props: JSX.SvgSVGAttributes<SVGSVGElement>) => JSX.Element

export interface TorchUIIcons {
	chevronDown: TorchUIIconComponent
	chevronUp: TorchUIIconComponent
	chevronLeft: TorchUIIconComponent
	chevronRight: TorchUIIconComponent
	chevronsLeft: TorchUIIconComponent
	chevronsRight: TorchUIIconComponent
	close: TorchUIIconComponent
	copy: TorchUIIconComponent
	check: TorchUIIconComponent
	search: TorchUIIconComponent
	spinner: TorchUIIconComponent
	sun: TorchUIIconComponent
	moon: TorchUIIconComponent
	eye: TorchUIIconComponent
	eyeOff: TorchUIIconComponent
	plus: TorchUIIconComponent
	minus: TorchUIIconComponent
	dragHandle: TorchUIIconComponent
	calendar: TorchUIIconComponent
	clock: TorchUIIconComponent
	pipette: TorchUIIconComponent
	refresh: TorchUIIconComponent
	trash: TorchUIIconComponent
	pin: TorchUIIconComponent
	file: TorchUIIconComponent
	fileText: TorchUIIconComponent
	fileCode: TorchUIIconComponent
	fileImage: TorchUIIconComponent
	filePlay: TorchUIIconComponent
	fileSpreadsheet: TorchUIIconComponent
	fileUpload: TorchUIIconComponent
	folderArchive: TorchUIIconComponent
	checkCircle: TorchUIIconComponent
	alertCircle: TorchUIIconComponent
	triangleAlert: TorchUIIconComponent
	infoCircle: TorchUIIconComponent
}

function baseSvgProps(others: JSX.SvgSVGAttributes<SVGSVGElement>) {
	return {
		xmlns: 'http://www.w3.org/2000/svg',
		viewBox: '0 0 24 24',
		fill: 'none',
		stroke: 'currentColor',
		'stroke-width': 2,
		'stroke-linecap': 'round',
		'stroke-linejoin': 'round',
		...others,
	} as const
}

function icon(getChildren: () => JSX.Element): TorchUIIconComponent {
	return (props) => (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width={2}
			stroke-linecap="round"
			stroke-linejoin="round"
			{...props}
		>
			{getChildren()}
		</svg>
	)
}

export const defaultIcons: TorchUIIcons = {
	chevronDown: icon(() => <path d="m6 9 6 6 6-6" />),
	chevronUp: icon(() => <path d="m18 15-6-6-6 6" />),
	chevronLeft: icon(() => <path d="m15 18-6-6 6-6" />),
	chevronRight: icon(() => <path d="m9 18 6-6-6-6" />),
	chevronsLeft: icon(() => (
		<>
			<path d="m11 17-5-5 5-5" />
			<path d="m18 17-5-5 5-5" />
		</>
	)),
	chevronsRight: icon(() => (
		<>
			<path d="m6 17 5-5-5-5" />
			<path d="m13 17 5-5-5-5" />
		</>
	)),
	close: icon(() => (
		<>
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</>
	)),
	copy: icon(() => (
		<>
			<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
			<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
		</>
	)),
	check: icon(() => <path d="M20 6 9 17l-5-5" />),
	search: icon(() => (
		<>
			<path d="m21 21-4.34-4.34" />
			<circle cx="11" cy="11" r="8" />
		</>
	)),
	spinner: icon(() => <path d="M21 12a9 9 0 1 1-6.219-8.56" />),
	sun: icon(() => (
		<>
			<circle cx="12" cy="12" r="4" />
			<path d="M12 2v2" />
			<path d="M12 20v2" />
			<path d="m4.93 4.93 1.41 1.41" />
			<path d="m17.66 17.66 1.41 1.41" />
			<path d="M2 12h2" />
			<path d="M20 12h2" />
			<path d="m6.34 17.66-1.41 1.41" />
			<path d="m19.07 4.93-1.41 1.41" />
		</>
	)),
	moon: icon(() => <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9" />),
	eye: icon(() => (
		<>
			<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
			<circle cx="12" cy="12" r="3" />
		</>
	)),
	eyeOff: icon(() => (
		<>
			<path d="m15 18-.722-3.25" />
			<path d="M2 8a10.645 10.645 0 0 0 20 0" />
			<path d="m20 15-1.726-2.05" />
			<path d="m4 15 1.726-2.05" />
			<path d="m9 18 .722-3.25" />
		</>
	)),
	plus: icon(() => (
		<>
			<path d="M5 12h14" />
			<path d="M12 5v14" />
		</>
	)),
	minus: icon(() => <path d="M5 12h14" />),
	dragHandle: icon(() => (
		<>
			<circle cx="9" cy="12" r="1" />
			<circle cx="9" cy="5" r="1" />
			<circle cx="9" cy="19" r="1" />
			<circle cx="15" cy="12" r="1" />
			<circle cx="15" cy="5" r="1" />
			<circle cx="15" cy="19" r="1" />
		</>
	)),
	clock: icon(() => (
		<>
			<circle cx="12" cy="12" r="10" />
			<polyline points="12 6 12 12 16 14" />
		</>
	)),
	calendar: icon(() => (
		<>
			<path d="M8 2v4" />
			<path d="M16 2v4" />
			<rect width="18" height="18" x="3" y="4" rx="2" />
			<path d="M3 10h18" />
		</>
	)),
	pipette: icon(() => (
		<>
			<path d="m12 9-8.414 8.414A2 2 0 0 0 3 18.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 3.828 21h1.344a2 2 0 0 0 1.414-.586L15 12" />
			<path d="m18 9 .4.4a1 1 0 1 1-3 3l-3.8-3.8a1 1 0 1 1 3-3l.4.4 3.4-3.4a1 1 0 1 1 3 3z" />
			<path d="m2 22 .414-.414" />
		</>
	)),
	refresh: icon(() => (
		<>
			<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
			<path d="M21 3v5h-5" />
			<path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
			<path d="M8 16H3v5" />
		</>
	)),
	trash: icon(() => (
		<>
			<path d="M10 11v6" />
			<path d="M14 11v6" />
			<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
			<path d="M3 6h18" />
			<path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
		</>
	)),
	pin: icon(() => (
		<>
			<path d="M12 17v5" />
			<path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
		</>
	)),
	file: icon(() => (
		<>
			<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
			<path d="M14 2v5a1 1 0 0 0 1 1h5" />
		</>
	)),
	fileText: icon(() => (
		<>
			<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
			<path d="M14 2v5a1 1 0 0 0 1 1h5" />
			<path d="M10 9H8" />
			<path d="M16 13H8" />
			<path d="M16 17H8" />
		</>
	)),
	fileCode: icon(() => (
		<>
			<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
			<path d="M14 2v5a1 1 0 0 0 1 1h5" />
			<path d="M10 12.5 8 15l2 2.5" />
			<path d="m14 12.5 2 2.5-2 2.5" />
		</>
	)),
	fileImage: icon(() => (
		<>
			<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
			<path d="M14 2v5a1 1 0 0 0 1 1h5" />
			<circle cx="10" cy="12" r="2" />
			<path d="m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22" />
		</>
	)),
	filePlay: icon(() => (
		<>
			<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
			<path d="M14 2v5a1 1 0 0 0 1 1h5" />
			<path d="M15.033 13.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56v-4.704a.645.645 0 0 1 .967-.56z" />
		</>
	)),
	fileSpreadsheet: icon(() => (
		<>
			<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
			<path d="M14 2v5a1 1 0 0 0 1 1h5" />
			<path d="M8 13h2" />
			<path d="M14 13h2" />
			<path d="M8 17h2" />
			<path d="M14 17h2" />
		</>
	)),
	fileUpload: icon(() => (
		<>
			<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
			<path d="M14 2v5a1 1 0 0 0 1 1h5" />
			<path d="M12 12v6" />
			<path d="m15 15-3-3-3 3" />
		</>
	)),
	folderArchive: icon(() => (
		<>
			<circle cx="15" cy="19" r="2" />
			<path d="M20.9 19.8A2 2 0 0 0 22 18V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h5.1" />
			<path d="M15 11v-1" />
			<path d="M15 17v-2" />
		</>
	)),
	checkCircle: icon(() => (
		<>
			<circle cx="12" cy="12" r="10" />
			<path d="m9 12 2 2 4-4" />
		</>
	)),
	alertCircle: icon(() => (
		<>
			<circle cx="12" cy="12" r="10" />
			<path d="M12 8v4" />
			<path d="M12 16h.01" />
		</>
	)),
	triangleAlert: icon(() => (
		<>
			<path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
			<path d="M12 9v4" />
			<path d="M12 17h.01" />
		</>
	)),
	infoCircle: icon(() => (
		<>
			<circle cx="12" cy="12" r="10" />
			<path d="M12 16v-4" />
			<path d="M12 8h.01" />
		</>
	)),
}

const IconsContext = createContext<Accessor<TorchUIIcons>>(() => defaultIcons)

export function useIcons(): TorchUIIcons {
	return useContext(IconsContext)()
}

export interface IconsProviderProps {
	icons?: Partial<TorchUIIcons>
	children: JSX.Element
}

export function IconsProvider(props: IconsProviderProps) {
	const [local] = splitProps(props, ['icons', 'children'])
	const value = createMemo(() => ({ ...defaultIcons, ...(local.icons ?? {}) }))
	return <IconsContext.Provider value={value}>{local.children}</IconsContext.Provider>
}
