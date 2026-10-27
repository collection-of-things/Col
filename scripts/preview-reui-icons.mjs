/** ReUI's application bundler expands this template import against its icon
 * registry directory. esbuild cannot enumerate files in our verified-source
 * namespace, so resolve its original default registry explicitly. */
export function resolveReuiIconRegistry(contents) {
  const expression = 'import(`./__${libraryName}__`)';
  if (contents.split(expression).length !== 2) throw new Error("The reviewed ReUI icon-loader import changed; review the adapter before rebuilding.");
  return contents.replace(expression, '(libraryName === "lucide" ? import("./__lucide__") : Promise.reject(new Error("This preview supports ReUI’s original Lucide icon library; the application’s alternative icon-library customizer is unavailable.")))');
}

export const reuiIconRegistryGap = "Uses ReUI’s original default Lucide icon registry and actual lucide-react@1.17.0 icons. The application’s alternative icon-library customizer is unavailable; selecting another icon library reports an explicit error.";
