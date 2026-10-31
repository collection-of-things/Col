import Button from "rocksolidjs/Button";
import Card from "rocksolidjs/Card";
import CardContent from "rocksolidjs/CardContent";
import CardFooter from "rocksolidjs/CardFooter";
import Divider from "rocksolidjs/Divider";
import Typography from "rocksolidjs/Typography";

export default function Example() {
  return (
    <Card class="w-full max-w-sm" variant="outlined">
      <CardContent>
        <Typography variant="h5">Upgrade your plan</Typography>
        <Typography variant="body2" class="text-muted-foreground mt-1">
          Get more storage and advanced features.
        </Typography>
      </CardContent>

      <Divider aria-hidden />

      <CardFooter class="justify-end">
        <Button variant="ghost">Not now</Button>
        <Button color="success">Upgrade</Button>
      </CardFooter>
    </Card>
  );
}
