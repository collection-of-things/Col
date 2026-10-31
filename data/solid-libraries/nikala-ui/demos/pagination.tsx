import { For, createSignal } from "solid-js";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationFirst,
  PaginationLast,
  PaginationEllipsis,
  PaginationSummary,
} from "@/components/ui/pagination";
import { createPagination } from "@/hooks/create-pagination";
const importCode = `import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationFirst,
  PaginationLast,
  PaginationEllipsis,
  PaginationSummary,
} from "@/components/ui/pagination";
import { createPagination } from "@/hooks/create-pagination";`;
const defaultCode = `const pagination = createPagination({
  totalPages: 10,
  defaultPage: 2,
  siblingCount: 1,
  boundaries: 1,
});

return (
  <Pagination>
    <PaginationContent>
      <PaginationItem>
        <PaginationPrevious
          disabled={!pagination.hasPrevious()}
          onClick={pagination.previous}
        />
      </PaginationItem>

      <For each={pagination.range()}>
        {(item) =>
          item === "ellipsis" ? (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem>
              <PaginationLink
                isActive={pagination.page() === item}
                onClick={() => pagination.setPage(item)}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          )
        }
      </For>

      <PaginationItem>
        <PaginationNext
          disabled={!pagination.hasNext()}
          onClick={pagination.next}
        />
      </PaginationItem>
    </PaginationContent>
  </Pagination>
);`;
const outlineCode = `const pagination = createPagination({
  totalPages: 8,
  defaultPage: 3,
});

return (
  <Pagination>
    <PaginationContent>
      <PaginationItem>
        <PaginationFirst
          variant="outline"
          disabled={!pagination.hasPrevious()}
          onClick={pagination.first}
        />
      </PaginationItem>
      <PaginationItem>
        <PaginationPrevious
          variant="outline"
          disabled={!pagination.hasPrevious()}
          onClick={pagination.previous}
        />
      </PaginationItem>

      <For each={pagination.range()}>
        {(item) =>
          item === "ellipsis" ? (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem>
              <PaginationLink
                variant="outline"
                isActive={pagination.page() === item}
                onClick={() => pagination.setPage(item)}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          )
        }
      </For>

      <PaginationItem>
        <PaginationNext
          variant="outline"
          disabled={!pagination.hasNext()}
          onClick={pagination.next}
        />
      </PaginationItem>
      <PaginationItem>
        <PaginationLast
          variant="outline"
          disabled={!pagination.hasNext()}
          onClick={pagination.last}
        />
      </PaginationItem>
    </PaginationContent>
  </Pagination>
);`;
const compactCode = `const [page, setPage] = createSignal(1);

return (
  <div class="flex items-center justify-between gap-4 w-full max-w-sm p-3 rounded-lg border border-border bg-card">
    <span class="text-xs text-muted-foreground font-mono">Page {page()} of 12</span>
    <div class="flex items-center gap-1">
      <PaginationPrevious
        variant="outline"
        size="sm"
        hideText
        disabled={page() <= 1}
        onClick={() => setPage((p) => Math.max(1, p - 1))}
      />
      <PaginationNext
        variant="outline"
        size="sm"
        hideText
        disabled={page() >= 12}
        onClick={() => setPage((p) => Math.min(12, p + 1))}
      />
    </div>
  </div>
);`;
export default function Demo() {
const defaultPagination = createPagination({
    totalPages: 10,
    defaultPage: 2,
    siblingCount: 1,
    boundaries: 1,
  });
const outlinePagination = createPagination({
    totalPages: 8,
    defaultPage: 3,
    siblingCount: 1,
    boundaries: 1,
  });
const [compactPage, setCompactPage] = createSignal(1);
return <>
          <div class="flex flex-col items-center justify-center p-8 w-full min-h-[160px] space-y-4">
            <PaginationSummary>
              Page {defaultPagination.page()} of {defaultPagination.totalPages()}
            </PaginationSummary>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    disabled={!defaultPagination.hasPrevious()}
                    onClick={defaultPagination.previous}
                  />
                </PaginationItem>

                <For each={defaultPagination.range()}>
                  {(item) =>
                    item === "ellipsis" ? (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem>
                        <PaginationLink
                          isActive={defaultPagination.page() === item}
                          onClick={() => defaultPagination.setPage(item)}
                        >
                          {item}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  }
                </For>

                <PaginationItem>
                  <PaginationNext
                    disabled={!defaultPagination.hasNext()}
                    onClick={defaultPagination.next}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>;
}
