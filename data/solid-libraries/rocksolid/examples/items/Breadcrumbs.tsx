import Breadcrumbs from "rocksolidjs/Breadcrumbs";
import Link from "rocksolidjs/Link";
import Typography from "rocksolidjs/Typography";

export default function Example() {
  return (
    <Breadcrumbs aria-label="Breadcrumb">
      <Link color="inherit" href="/">Home</Link>
      <Link color="inherit" href="/products">Products</Link>
      <Typography as="span" color="textPrimary">Details</Typography>
    </Breadcrumbs>
  );
}
