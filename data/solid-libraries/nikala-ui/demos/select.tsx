import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
const importCode = `import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";`;
const defaultCode = `<Select<string>
  options={["SolidJS", "SolidStart", "Vite", "Tauri", "Electron"]}
  placeholder="Select a framework..."
  itemComponent={(props) => (
    <SelectItem item={props.item}>
      {props.item.rawValue}
    </SelectItem>
  )}
>
  <SelectTrigger class="w-45">
    <SelectValue<string>>
      {(state) => state.selectedOption()}
    </SelectValue>
  </SelectTrigger>
  <SelectContent />
</Select>`;
const disabledCode = `<Select<string>
  disabled={true}
  options={["SolidJS", "Vite"]}
  placeholder="Disabled select..."
  itemComponent={(props) => (
    <SelectItem item={props.item}>
      {props.item.rawValue}
    </SelectItem>
  )}
>
  <SelectTrigger class="w-45">
    <SelectValue<string>>
      {(state) => state.selectedOption()}
    </SelectValue>
  </SelectTrigger>
  <SelectContent />
</Select>`;
export default function Demo() {

return <>
          <Select<string>
            options={["SolidJS", "SolidStart", "Vite", "Tauri", "Electron"]}
            placeholder="Select a framework..."
            itemComponent={(props) => (
              <SelectItem item={props.item}>
                {props.item.rawValue}
              </SelectItem>
            )}
          >
            <SelectTrigger class="w-45">
              <SelectValue<string>>
                {(state) => state.selectedOption()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent />
          </Select>
        </>;
}
