import Card from "rocksolidjs/Card";
import CardHeader from "rocksolidjs/CardHeader";
import CardTitle from "rocksolidjs/CardTitle";
import CardDescription from "rocksolidjs/CardDescription";
import CardContent from "rocksolidjs/CardContent";
import CardFooter from "rocksolidjs/CardFooter";
import Button from "rocksolidjs/Button";

export default function Example() {
  return (
    <Card class="max-w-sm">
      <CardHeader>
        <CardTitle>Project overview</CardTitle>
        <CardDescription>
          Track your project progress.
        </CardDescription>
      </CardHeader>
      <CardContent>
        Your project is currently on track and all milestones are
        progressing as expected.
      </CardContent>
      <CardFooter>
        <Button>View project</Button>
      </CardFooter>
    </Card>
  );
}
