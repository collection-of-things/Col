import Chip from "rocksolidjs/Chip";

export default function Example() {
  const handleDelete = (event: MouseEvent) => {
    console.log("Chip deleted", event);
  };
  return (
    <div class="flex gap-4">
      <Chip
        label="Chip 1"
        variant="solid"
        onDelete={handleDelete}
        onClick={(e) => {}}
      />
      <Chip
        label="Chip 2"
        onDelete={handleDelete}
      />
    </div>
  );
}
