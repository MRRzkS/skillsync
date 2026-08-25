import { Loader2, Sparkles } from "lucide-react";

export default function CvReviewLoading() {
  return (
    <main className="min-h-screen bg-cloud">
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-8 lg:px-8 lg:pt-12">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-ocean-600 to-sync-purple-600">
            <Sparkles className="h-[18px] w-[18px] text-white" />
          </div>
          <h1 className="font-candidate-heading text-xl font-bold text-text-dark">
            CV Review
          </h1>
        </div>
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-sync-purple-600" />
          <p className="text-sm text-text-gray">
            AI is checking your CV against the STAR method...
          </p>
        </div>
      </div>
    </main>
  );
}
