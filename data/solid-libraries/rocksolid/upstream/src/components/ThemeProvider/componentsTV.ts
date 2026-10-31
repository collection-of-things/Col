import { accordion } from "@/components/Accordion/style";
import { accordionDetails } from "@/components/AccordionDetails/style";
import { accordionSummary } from "@/components/AccordionSummary/style";
import { alert } from "@/components/Alert/style";
import { avatar } from "@/components/Avatar/style";
import { backdrop } from "@/components/Backdrop/style";
import { badge } from "@/components/Badge/style";
import { breadcrumbs } from "@/components/Breadcrumbs/style";
import { button } from "@/components/Button/style";
import { buttonGroup } from "@/components/ButtonGroup/style";
import { card } from "@/components/Card/style";
import { cardHeader } from "@/components/CardHeader/style";
import { cardTitle } from "@/components/CardTitle/style";
import { cardDescription } from "@/components/CardDescription/style";
import { cardFooter } from "@/components/CardFooter/style";
import { cardContent } from "@/components/CardContent/style";
import { checkbox } from "@/components/Checkbox/style";
import { chip } from "@/components/Chip/style";
import { dialog } from "@/components/Dialog/style";
import { dialogContent } from "@/components/DialogContent/style";
import { dialogActions } from "@/components/DialogActions/style";
import { dialogTitle } from "@/components/DialogTitle/style";
import { divider } from "@/components/Divider/style";
import { iconButton } from "@/components/IconButton/style";
import { input } from "@/components/Input/style";
import { label } from "@/components/Label/style";
import { link } from "@/components/Link/style";
import { progress } from "@/components/Progress/style";
import { radio } from "@/components/Radio/style";
import { select } from "@/components/Select/style";
import { skeleton } from "@/components/Skeleton/style";
import { spinner } from "@/components/Spinner/style";
import { switchTv } from "@/components/Switch/style";
import { table } from "@/components/Table/style";
import { tableCell } from "@/components/TableCell/style";
import { tableFooter } from "@/components/TableFooter/style";
import { tableRow } from "@/components/TableRow/style";
import { tab } from "@/components/Tab/style";
import { tabs } from "@/components/Tabs/style";
import { textarea } from "@/components/Textarea/style";
import { typography } from "@/components/Typography/style";

const ComponentsTV =  ({
  // Accordion
  accordion,
  accordionDetails,
  accordionSummary,
  // Alert
  alert,
  // Avatar
  avatar,
  // Backdrop
  backdrop,
  // Badge
  badge,
  // Breadcrumbs
  breadcrumbs,
  // Button
  button,
  // ButtonGroup
  buttonGroup,
  // Card
  card,
  cardHeader,
  cardTitle,
  cardDescription,
  cardContent,
  cardFooter,
  // Checkbox
  checkbox,
  // Chip
  chip,
  // Dialog
  dialog,
  dialogContent,
  dialogActions,
  dialogTitle,
  // Divider
  divider,
  // IconButton
  iconButton,
  // Input
  input,
  // Label
  label,
  // Link
  link,
  // Progress
  progress,
  // Radio
  radio,
  // Select
  select,
  // Skeleton
  skeleton,
  // Spinner
  spinner,
  // Switch
  switch: switchTv,
  // Table
  table,
  tableCell,
  tableFooter,
  tableRow,
  // Tabs
  tab,
  tabs,
  // Textarea
  textarea,
  // Typography
  typography,
});

export type ComponentsTV = {
  -readonly [K in keyof typeof ComponentsTV]:
    ReturnType<typeof ComponentsTV[K]>;
};

export default ComponentsTV;