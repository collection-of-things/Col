import { createSignal, For } from "solid-js";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Combobox,
  ComboboxControl,
  ComboboxInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxGroup,
  ComboboxToken,
  ComboboxEmpty,
} from "@/components/ui/combobox";
interface CountryOption {
  value: string;
  label: string;
  flag: string;
  region: string;
}
interface UserOption {
  value: string;
  name: string;
  email: string;
  avatar: string;
  initials: string;
}
interface CountryGroup {
  region: string;
  countries: CountryOption[];
}
const COUNTRIES: CountryOption[] = [
  { value: "ge", label: "Georgia", flag: "🇬🇪", region: "Europe" },
  { value: "us", label: "United States", flag: "🇺🇸", region: "Americas" },
  { value: "uk", label: "United Kingdom", flag: "🇬🇧", region: "Europe" },
  { value: "de", label: "Germany", flag: "🇩🇪", region: "Europe" },
  { value: "fr", label: "France", flag: "🇫🇷", region: "Europe" },
  { value: "jp", label: "Japan", flag: "🇯🇵", region: "Asia" },
  { value: "ca", label: "Canada", flag: "🇨🇦", region: "Americas" },
];
const USERS: UserOption[] = [
  { value: "niko", name: "Niko Pirosmani", email: "niko@pirosmani.ge", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80", initials: "NP" },
  { value: "lasha", name: "Giorgi Magradze", email: "giorgi@magradze.dev", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80", initials: "LM" },
  { value: "alex", name: "Alex Rivers", email: "alex@nikala.dev", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80", initials: "AR" },
];
const GROUPS: CountryGroup[] = [
  {
    region: "Europe",
    countries: [COUNTRIES[0], COUNTRIES[2], COUNTRIES[3], COUNTRIES[4]],
  },
  {
    region: "Americas",
    countries: [COUNTRIES[1], COUNTRIES[6]],
  },
];
const importCode = `import {
  Combobox,
  ComboboxControl,
  ComboboxInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxGroup,
  ComboboxToken,
  ComboboxEmpty,
} from "@/components/ui/combobox";`;
export default function Demo() {
const [singleValue, setSingleValue] = createSignal<CountryOption | null>(COUNTRIES[0]);
const [multiValue, setMultiValue] = createSignal<CountryOption[]>([COUNTRIES[0], COUNTRIES[1]]);
const [userValue, setUserValue] = createSignal<UserOption | null>(USERS[0]);
const [groupedValue, setGroupedValue] = createSignal<CountryOption | null>(COUNTRIES[0]);
return <>
          <div class="w-full max-w-sm">
            <Combobox<CountryOption>
              options={COUNTRIES}
              optionValue="value"
              optionTextValue="label"
              optionLabel="label"
              value={singleValue()}
              onChange={setSingleValue}
              placeholder="Search country..."
              itemComponent={(props) => (
                <ComboboxItem item={props.item}>
                  <span class="text-base mr-1.5">{props.item.rawValue.flag}</span>
                  <span>{props.item.textValue}</span>
                </ComboboxItem>
              )}
            >
              <ComboboxControl clearable onClear={() => setSingleValue(null)}>
                <ComboboxInput />
              </ComboboxControl>
              <ComboboxContent />
            </Combobox>
          </div>
        </>;
}
