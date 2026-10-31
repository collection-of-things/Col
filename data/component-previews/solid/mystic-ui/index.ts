import seed from "../mystic-ui.json" with { type: "json" };
import expanded from "./expanded.json" with { type: "json" };

export default { ...expanded, entries: { ...seed.entries, ...expanded.entries }, groups: { ...expanded.groups,  }, sources: [...new Map([...seed.sources, ...expanded.sources].map(item => [item.url, item])).values()], notices: [...new Map([...seed.notices, ...expanded.notices].map(item => [item.url, item])).values()] };
