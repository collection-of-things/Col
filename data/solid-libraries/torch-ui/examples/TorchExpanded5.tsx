import Mount0 from "./items/Pie-Chart";
import Mount1 from "./items/Sparkline";
import Mount2 from "./items/Other-Charts";
import Mount3 from "./items/Login-Form";
import Mount4 from "./items/Register-Form";
import Mount5 from "./items/Settings-Form";
import Mount6 from "./items/Form-Dialog";
import Mount7 from "./items/Form-Drawer";
import Mount8 from "./items/Wizard-Flow";
import Mount9 from "./items/Stat-Grid";
import Mount10 from "./items/User-Card";
import Mount11 from "./items/Comment-Thread";
import Mount12 from "./items/Filter-Builder";
import Mount13 from "./items/View-Customizer";
import Mount14 from "./items/Icons";
const examples = { "torch-ui/Pie Chart": Mount0, "torch-ui/Sparkline": Mount1, "torch-ui/Other charts": Mount2, "torch-ui/Login Form": Mount3, "torch-ui/Register Form": Mount4, "torch-ui/Settings Form": Mount5, "torch-ui/Form Dialog": Mount6, "torch-ui/Form Drawer": Mount7, "torch-ui/Wizard Flow": Mount8, "torch-ui/Stat Grid": Mount9, "torch-ui/User Card": Mount10, "torch-ui/Comment Thread": Mount11, "torch-ui/Filter Builder": Mount12, "torch-ui/View Customizer": Mount13, "torch-ui/Icons": Mount14 };
export default function mount(target) { const selected = examples[PREVIEW_COMPONENT]; if (!selected) throw new Error("Unknown TorchUI example"); return selected(target); }
