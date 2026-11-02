import Demo0 from "./items/Accordion";
import Demo1 from "./items/Alert";
import Demo2 from "./items/Avatar";
import Demo3 from "./items/Badge";
import Demo4 from "./items/Breadcrumbs";
import Demo5 from "./items/ButtonGroup";
import Demo6 from "./items/Card";
import Demo7 from "./items/Checkbox";
import { render } from "solid-js/web";
const examples = { "rocksolid/Accordion": Demo0, "rocksolid/Alert": Demo1, "rocksolid/Avatar": Demo2, "rocksolid/Badge": Demo3, "rocksolid/Breadcrumbs": Demo4, "rocksolid/ButtonGroup": Demo5, "rocksolid/Card": Demo6, "rocksolid/Checkbox": Demo7 };
export default function mount(target) { const Demo = examples[PREVIEW_COMPONENT]; if (!Demo) throw new Error("Unknown RockSolid example"); return render(() => <Demo />, target); }
