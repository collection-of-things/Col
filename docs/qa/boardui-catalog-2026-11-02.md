# BoardUI catalog audit

Checked 2026-11-01T22:21:31Z (November 2 in Asia/Dubai).

The supplied repository and website describe one library. Col adds one BoardUI listing and one official MCP integration.

## Scope and method

- Compared the [free registry](https://www.boardui.com/r/registry.json), [Pro registry](https://www.boardui.com/r/registry-pro.json), [component catalog](https://www.boardui.com/components), and [agent index](https://www.boardui.com/llms.txt).
- Fetched all 102 unique documentation pages referenced by the registries as Markdown. Every request returned a component or foundation reference on the official domain without a redirect.
- Inspected all 88 free registry payloads, parsed every JavaScript/TypeScript source file for syntax and exports, and recorded file hashes, external imports, direct npm dependencies, and BoardUI registry dependencies. This does not establish runtime behavior or accessibility compliance.
- Cross-checked shared-page variants against the published source and documentation. Fetched the corresponding rendered HTML for shared pages to check their sections. No browser or live interaction testing was run.
- Stored a complete 128-item manifest in `data/boardui/audit.json`, with registry and documentation hashes. Source-based API snapshots for the 71 indexed free components live in `data/boardui/documentation.json`.

## Coverage and findings

- **111 indexed entries:** 71 free components, 30 Pro components, and 10 Pro templates. Each is searchable individually on Col and through `search_components`, and has a stable `boardui/<official name>` MCP identity.
- **17 excluded entries:** 15 foundations, styles, setup helpers, or server runtime items; plus App Shell and Agent Log, which the registry treats as internal application dependencies without their own component documentation pages. All 17 remain accounted for below.
- App Shell and Agent Log return HTTP 404 at `/components/app-shell` and `/components/agent-log`. Their official item JSON is linked below as source evidence; it is not substituted for a component documentation page.
- Multiple installable components share a page: card variants, keyboard hints, date inputs, medical cards, agent avatars, and templates. Col now selects a component by library slug and name rather than URL, so selecting one variant does not activate another. The index still rejects duplicate names and off-domain references.
- The public GitHub starter is older than the live registry: its README lists 69 free items, while the website lists 88 free registry items. The audit uses the live registry for coverage and dependencies. The GitHub revision is recorded separately; website snapshots use their own SHA-256 revisions.
- Free source is MIT licensed according to the official [pricing documentation](https://www.boardui.com/pricing). Source API snapshots preserve the upstream MIT notice. Pro records carry a paid-license statement; no Pro source or usage examples are ingested.
- Compatibility records distinguish the starter's React/React DOM 19.2.4 from unverified broader support. Tailwind CSS 4 is documented. No minimum Node version or other React range is inferred.
- The official MCP entry uses the documented local command for Claude Code, Cursor, VS Code, and Codex. Its HTTP note cites the provider's [agent guide](https://www.boardui.com/llms.txt), which documents `https://www.boardui.com/mcp` as a stateless, read-only Streamable HTTP endpoint. The same setup is documented when requesting the MCP guide with `Accept: text/markdown`; its HTML version instead says nothing is hosted.
- Rechecked the HTTP endpoint for PR #83: JSON-RPC `initialize` and `tools/list` requests both returned HTTP 200 with JSON responses. The server identifies itself as `boardui`, and all five advertised tools (`list_components`, `search_components`, `get_component`, `get_usage_examples`, `get_theme`) carry `readOnlyHint: true`. These were protocol requests, without browser testing or installation.
- No executable Col preview adapter is added. MCP lookups report preview availability independently of API documentation.

## Every indexed item

Names, tiers, and documentation links come from the official registries. A shared URL indicates documented variants, not a duplicate component.

| Registry item | Official name | Tier | Documentation |
| --- | --- | --- | --- |
| `modal` | Modal | Free | [Reference](https://www.boardui.com/components/modal) |
| `drawer` | Drawer | Free | [Reference](https://www.boardui.com/components/drawer) |
| `popover` | Popover | Free | [Reference](https://www.boardui.com/components/popover) |
| `combobox` | Combobox | Free | [Reference](https://www.boardui.com/components/combobox) |
| `toast` | Toast | Free | [Reference](https://www.boardui.com/components/toast) |
| `accordion` | Accordion | Free | [Reference](https://www.boardui.com/components/accordion) |
| `spinner` | Spinner | Free | [Reference](https://www.boardui.com/components/spinner) |
| `progress` | Progress | Free | [Reference](https://www.boardui.com/components/progress) |
| `meter` | Meter | Free | [Reference](https://www.boardui.com/components/meter) |
| `skeleton` | Skeleton | Free | [Reference](https://www.boardui.com/components/skeleton) |
| `command-palette` | Command Palette | Free | [Reference](https://www.boardui.com/components/command-palette) |
| `context-menu` | Context Menu | Free | [Reference](https://www.boardui.com/components/context-menu) |
| `search-field` | Search Field | Free | [Reference](https://www.boardui.com/components/search-field) |
| `number-field` | Number Field | Free | [Reference](https://www.boardui.com/components/number-field) |
| `time-field` | Time Field | Free | [Reference](https://www.boardui.com/components/time-field) |
| `tag-group` | Tag Group | Free | [Reference](https://www.boardui.com/components/tag-group) |
| `date-calendar` | Date Calendar | Free | [Reference](https://www.boardui.com/components/date-calendar) |
| `color-picker` | Color Picker | Free | [Reference](https://www.boardui.com/components/color-picker) |
| `tree-view` | Tree View | Free | [Reference](https://www.boardui.com/components/tree-view) |
| `button` | Button | Free | [Reference](https://www.boardui.com/components/button) |
| `icon-button` | Icon Button | Free | [Reference](https://www.boardui.com/components/icon-button) |
| `link-button` | Link Button | Free | [Reference](https://www.boardui.com/components/link-button) |
| `button-group` | Button Group | Free | [Reference](https://www.boardui.com/components/button-group) |
| `close-button` | Close Button | Free | [Reference](https://www.boardui.com/components/close-button) |
| `input` | Input | Free | [Reference](https://www.boardui.com/components/input) |
| `textarea` | Textarea | Free | [Reference](https://www.boardui.com/components/textarea) |
| `checkbox` | Checkbox | Free | [Reference](https://www.boardui.com/components/checkbox) |
| `checkbox-card` | Checkbox Card | Free | [Reference](https://www.boardui.com/components/checkbox) |
| `radio` | Radio | Free | [Reference](https://www.boardui.com/components/radio) |
| `radio-card` | Radio Card | Free | [Reference](https://www.boardui.com/components/radio) |
| `switch` | Switch | Free | [Reference](https://www.boardui.com/components/switch) |
| `switch-card` | Switch Card | Free | [Reference](https://www.boardui.com/components/switch) |
| `theme-toggle` | Theme Toggle | Free | [Reference](https://www.boardui.com/components/theme-toggle) |
| `select` | Select | Free | [Reference](https://www.boardui.com/components/select) |
| `slider` | Slider | Free | [Reference](https://www.boardui.com/components/slider) |
| `social-button` | Social Button | Free | [Reference](https://www.boardui.com/components/social-button) |
| `dropdown` | Dropdown | Free | [Reference](https://www.boardui.com/components/dropdown) |
| `divider` | Divider | Free | [Reference](https://www.boardui.com/components/divider) |
| `file-upload` | File Upload | Free | [Reference](https://www.boardui.com/components/file-upload) |
| `tabs` | Tabs | Free | [Reference](https://www.boardui.com/components/tabs) |
| `table` | Table | Free | [Reference](https://www.boardui.com/components/table) |
| `tooltip` | Tooltip | Free | [Reference](https://www.boardui.com/components/tooltip) |
| `badge` | Badge | Free | [Reference](https://www.boardui.com/components/badge) |
| `chip` | Chip | Free | [Reference](https://www.boardui.com/components/chip) |
| `status-dot` | Status Dot | Free | [Reference](https://www.boardui.com/components/chip) |
| `avatar` | Avatar | Free | [Reference](https://www.boardui.com/components/avatar) |
| `breadcrumb` | Breadcrumb | Free | [Reference](https://www.boardui.com/components/breadcrumb) |
| `pagination` | Pagination | Free | [Reference](https://www.boardui.com/components/pagination) |
| `carousel` | Carousel | Free | [Reference](https://www.boardui.com/components/carousel) |
| `input-otp` | Input OTP | Free | [Reference](https://www.boardui.com/components/input-otp) |
| `segmented-control` | Segmented Control | Free | [Reference](https://www.boardui.com/components/segmented-control) |
| `announcement` | Announcement | Free | [Reference](https://www.boardui.com/components/announcement) |
| `notification` | Notification | Free | [Reference](https://www.boardui.com/components/notification) |
| `kbd` | Kbd | Free | [Reference](https://www.boardui.com/components/badge) |
| `date-picker` | Date Picker | Free | [Reference](https://www.boardui.com/components/date-picker) |
| `date-range-picker` | Date Range Picker | Free | [Reference](https://www.boardui.com/components/date-picker) |
| `meeting-scheduler` | Meeting Scheduler | Free | [Reference](https://www.boardui.com/components/date-picker) |
| `agent-chat` | Agent Chat | Free | [Reference](https://www.boardui.com/components/chat-starter) |
| `agent-thinking` | Agent Thinking | Free | [Reference](https://www.boardui.com/components/agent-thinking) |
| `composer-loader` | Composer Loader | Free | [Reference](https://www.boardui.com/components/composer-loader) |
| `sidebar` | Sidebar | Free | [Reference](https://www.boardui.com/components/sidebar) |
| `settings-modal` | Settings Modal | Free | [Reference](https://www.boardui.com/components/settings-modal) |
| `auth-card` | Auth Card | Free | [Reference](https://www.boardui.com/components/auth-card) |
| `notification-center` | Notification Center | Free | [Reference](https://www.boardui.com/components/notification-center) |
| `data-grid` | Data Grid | Free | [Reference](https://www.boardui.com/components/data-grid) |
| `data-table` | Data Table | Free | [Reference](https://www.boardui.com/components/data-table) |
| `stat-cards` | Stat Cards | Free | [Reference](https://www.boardui.com/components/stat-cards) |
| `revenue-chart-card` | Revenue Chart Card | Free | [Reference](https://www.boardui.com/components/revenue-chart-card) |
| `orders-chart-card` | Orders Chart Card | Free | [Reference](https://www.boardui.com/components/orders-chart-card) |
| `important-alerts-card` | Important Alerts Card | Free | [Reference](https://www.boardui.com/components/medical-profile) |
| `patient-info-card` | Patient Info Card | Free | [Reference](https://www.boardui.com/components/medical-profile) |
| `web-search` | Web Search | Pro | [Reference](https://www.boardui.com/components/web-search) |
| `task-list` | Task List | Pro | [Reference](https://www.boardui.com/components/task-list) |
| `composer` | Composer | Pro | [Reference](https://www.boardui.com/components/composer) |
| `composer-panel` | Composer Panel | Pro | [Reference](https://www.boardui.com/components/composer-panel) |
| `composer-attachments` | Composer Attachments | Pro | [Reference](https://www.boardui.com/components/composer-attachments) |
| `agent-progress` | Agent Progress | Pro | [Reference](https://www.boardui.com/components/agent-progress) |
| `agent-limits-card` | Agent Limits Card | Pro | [Reference](https://www.boardui.com/components/agent-limits-card) |
| `questionnaire` | Questionnaire | Pro | [Reference](https://www.boardui.com/components/questionnaire) |
| `calendar` | Calendar | Pro | [Reference](https://www.boardui.com/components/calendar) |
| `earnings-chart-card` | Earnings Chart Card | Pro | [Reference](https://www.boardui.com/components/earnings-chart-card) |
| `line-chart-card` | Line Chart Card | Pro | [Reference](https://www.boardui.com/components/line-chart-card) |
| `contributions-card` | Contributions Card | Pro | [Reference](https://www.boardui.com/components/contributions-card) |
| `radar-chart-card` | Radar Chart Card | Pro | [Reference](https://www.boardui.com/components/radar-chart-card) |
| `radial-chart-card` | Radial Chart Card | Pro | [Reference](https://www.boardui.com/components/radial-chart-card) |
| `funnel-chart-card` | Funnel Chart Card | Pro | [Reference](https://www.boardui.com/components/funnel-chart-card) |
| `sankey-chart-card` | Sankey Chart Card | Pro | [Reference](https://www.boardui.com/components/sankey-chart-card) |
| `stage-bars-card` | Stage Bars Card | Pro | [Reference](https://www.boardui.com/components/stage-bars-card) |
| `bar-list-card` | Bar List Card | Pro | [Reference](https://www.boardui.com/components/bar-list-card) |
| `area-chart-card` | Area Chart Card | Pro | [Reference](https://www.boardui.com/components/area-chart-card) |
| `combo-chart-card` | Combo Chart Card | Pro | [Reference](https://www.boardui.com/components/combo-chart-card) |
| `scatter-chart-card` | Scatter Chart Card | Pro | [Reference](https://www.boardui.com/components/scatter-chart-card) |
| `heatmap-chart-card` | Heatmap Chart Card | Pro | [Reference](https://www.boardui.com/components/heatmap-chart-card) |
| `steps-card` | Steps Card | Pro | [Reference](https://www.boardui.com/components/steps-card) |
| `sleep-score-card` | Sleep Score Card | Pro | [Reference](https://www.boardui.com/components/sleep-score-card) |
| `activity-rings-card` | Activity Rings Card | Pro | [Reference](https://www.boardui.com/components/activity-rings-card) |
| `most-active-days-card` | Most Active Days Card | Pro | [Reference](https://www.boardui.com/components/most-active-days-card) |
| `project-board` | Project Board | Pro | [Reference](https://www.boardui.com/components/project-board) |
| `agent-avatar` | Agent Avatar | Pro | [Reference](https://www.boardui.com/components/multi-agent-chat) |
| `agent-creator` | Agent Creator | Pro | [Reference](https://www.boardui.com/components/agent-creator) |
| `multi-agent-chat` | Multi-agent Chat | Pro | [Reference](https://www.boardui.com/components/multi-agent-chat) |
| `template-multi-agent-chat` | Multi-agent Chat Template | Pro template | [Reference](https://www.boardui.com/components/multi-agent-chat) |
| `template-home-dashboard` | Home Dashboard Template | Pro template | [Reference](https://www.boardui.com/components/home-dashboard) |
| `template-project-board` | Project Board Template | Pro template | [Reference](https://www.boardui.com/components/project-board) |
| `template-marketing` | Marketing Dashboard Template | Pro template | [Reference](https://www.boardui.com/components/marketing-dashboard) |
| `template-finance` | Finance Dashboard Template | Pro template | [Reference](https://www.boardui.com/components/finance-dashboard) |
| `template-hr` | HR Management Template | Pro template | [Reference](https://www.boardui.com/components/hr-management) |
| `template-medical-profile` | Medical Report Template | Pro template | [Reference](https://www.boardui.com/components/medical-profile) |
| `template-ai-chat` | AI Chat Template | Pro template | [Reference](https://www.boardui.com/components/ai-chat) |
| `template-ai-profile` | AI Profile Template | Pro template | [Reference](https://www.boardui.com/components/ai-profile) |
| `template-ai-image-generation` | AI Image Generation Template | Pro template | [Reference](https://www.boardui.com/components/ai-image-generation) |

## Every excluded item

| Registry item | Reason | Official reference |
| --- | --- | --- |
| `template-copy` | Foundation, setup asset, or runtime helper; not a standalone UI component. | [Reference](https://www.boardui.com/r/template-copy.json) |
| `direction` | Foundation, setup asset, or runtime helper; not a standalone UI component. | [Reference](https://www.boardui.com/rtl#direction-provider) |
| `scroll-direction` | Foundation, setup asset, or runtime helper; not a standalone UI component. | [Reference](https://www.boardui.com/r/scroll-direction.json) |
| `directional-icon` | Foundation, setup asset, or runtime helper; not a standalone UI component. | [Reference](https://www.boardui.com/r/directional-icon.json) |
| `theme` | Foundation, setup asset, or runtime helper; not a standalone UI component. | [Reference](https://www.boardui.com/components/color) |
| `typography` | Foundation, setup asset, or runtime helper; not a standalone UI component. | [Reference](https://www.boardui.com/components/typography) |
| `globals` | Foundation, setup asset, or runtime helper; not a standalone UI component. | [Reference](https://www.boardui.com/r/globals.json) |
| `cx` | Foundation, setup asset, or runtime helper; not a standalone UI component. | [Reference](https://www.boardui.com/r/cx.json) |
| `rules` | Foundation, setup asset, or runtime helper; not a standalone UI component. | [Reference](https://www.boardui.com/r/rules.json) |
| `use-dismiss-on-outside-press` | Foundation, setup asset, or runtime helper; not a standalone UI component. | [Reference](https://www.boardui.com/r/use-dismiss-on-outside-press.json) |
| `scroll-fade` | Foundation, setup asset, or runtime helper; not a standalone UI component. | [Reference](https://www.boardui.com/r/scroll-fade.json) |
| `use-count-up` | Foundation, setup asset, or runtime helper; not a standalone UI component. | [Reference](https://www.boardui.com/r/use-count-up.json) |
| `chevrons` | Foundation, setup asset, or runtime helper; not a standalone UI component. | [Reference](https://www.boardui.com/components/dropdown) |
| `logo` | Foundation, setup asset, or runtime helper; not a standalone UI component. | [Reference](https://www.boardui.com/r/logo.json) |
| `agent-runtime` | Foundation, setup asset, or runtime helper; not a standalone UI component. | [Reference](https://www.boardui.com/components/chat-starter) |
| `app-shell` | Internal application dependency without a component documentation page. | [Reference](https://www.boardui.com/r/app-shell.json) |
| `agent-log` | Internal application dependency without a component documentation page. | [Reference](https://www.boardui.com/r/agent-log.json) |

## Verification

- `npm run typecheck`: passed.
- `npm test`: production build passed; all 252 Node tests passed.
- Focused BoardUI tests exercise all 111 search and MCP lookups, source attribution, permission gating, Pro restrictions, aliases, grouped pages, and the official MCP configuration.
- The component browser test exercises selection between distinct components that share one documentation page.
- Existing discovery tests check the generated listing pages, canonical and social metadata, `/llms.txt`, `/sitemap.xml`, and `/robots.txt`. These are generated from the catalog, so their generators and the agent guide require no manual BoardUI-specific copies.
