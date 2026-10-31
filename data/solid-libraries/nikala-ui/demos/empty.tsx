import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyAction,
  EmptyDescription,
  EmptyIcon,
  EmptyTitle,
} from "@/components/ui/empty";
import { FolderOpen, Plus, SearchX } from "lucide-solid";
const importCode = `import {
  Empty,
  EmptyAction,
  EmptyDescription,
  EmptyIcon,
  EmptyTitle,
} from "@/components/ui/empty";`;
const defaultCode = `<Empty>
  <EmptyIcon>
    <FolderOpen />
  </EmptyIcon>
  <EmptyTitle>No projects yet</EmptyTitle>
  <EmptyDescription>
    Create your first project to get started.
  </EmptyDescription>
  <EmptyAction>
    <Button>
      <Plus />
      Create project
    </Button>
  </EmptyAction>
</Empty>`;
const searchCode = `<Empty class="min-h-52">
  <EmptyIcon>
    <SearchX />
  </EmptyIcon>
  <EmptyTitle>No results found</EmptyTitle>
  <EmptyDescription>
    Try adjusting your search or filter criteria.
  </EmptyDescription>
</Empty>`;
export default function Demo() {

return <>
          <Empty>
            <EmptyIcon>
              <FolderOpen />
            </EmptyIcon>
            <EmptyTitle>No projects yet</EmptyTitle>
            <EmptyDescription>
              Create your first project to get started.
            </EmptyDescription>
            <EmptyAction>
              <Button>
                <Plus />
                Create project
              </Button>
            </EmptyAction>
          </Empty>
        </>;
}
