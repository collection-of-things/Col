import Demo0 from "./items/Chip";
import Demo1 from "./items/Divider";
import Demo2 from "./items/IconButton";
import Demo3 from "./items/Input";
import Demo4 from "./items/Label";
import Demo5 from "./items/Link";
import Demo6 from "./items/Progress";
import Demo7 from "./items/Radio";
import { render } from "solid-js/web";
const examples = { "rocksolid/Chip": Demo0, "rocksolid/Divider": Demo1, "rocksolid/IconButton": Demo2, "rocksolid/Input": Demo3, "rocksolid/Label": Demo4, "rocksolid/Link": Demo5, "rocksolid/Progress": Demo6, "rocksolid/Radio": Demo7 };
export default function mount(target) { const Demo = examples[PREVIEW_COMPONENT]; if (!Demo) throw new Error("Unknown RockSolid example"); return render(() => <Demo />, target); }
