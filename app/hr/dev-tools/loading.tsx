import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DevToolsLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6 md:p-10">
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-80" />
      </div>

      {[0, 1].map((i) => (
        <Card key={i} className="space-y-3 border-dashed p-6">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-9 w-48" />
        </Card>
      ))}
    </div>
  );
}
