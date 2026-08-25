import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Shown instantly on navigation while the (dynamic) job list is fetched.
// Having this boundary also lets <Link> prefetch the route shell.
export default function JobsLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-6 md:p-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="p-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-52" />
              <Skeleton className="h-3 w-64" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
