import Demo0 from "./items/Select";
import Demo1 from "./items/Skeleton";
import Demo2 from "./items/Spinner";
import Demo3 from "./items/Switch";
import Demo4 from "./items/Table";
import Demo5 from "./items/Textarea";
import Demo6 from "./items/Typography";
import { render } from "solid-js/web";
const examples = { "rocksolid/Select": Demo0, "rocksolid/Skeleton": Demo1, "rocksolid/Spinner": Demo2, "rocksolid/Switch": Demo3, "rocksolid/Table": Demo4, "rocksolid/Textarea": Demo5, "rocksolid/Typography": Demo6 };
export default function mount(target) { const Demo = examples[PREVIEW_COMPONENT]; if (!Demo) throw new Error("Unknown RockSolid example"); return render(() => <Demo />, target); }
