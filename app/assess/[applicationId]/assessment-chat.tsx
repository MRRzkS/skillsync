"use client";

import { useRef, useState, useTransition } from "react";
import { useObject } from "@ai-sdk/react";
import { saveDraftAnswerAction } from "@/actions/submit-assessment";
import { scoringResultSchema } from "@/lib/ai/schemas";
import { useElapsedSeconds } from "@/lib/use-elapsed-seconds";
import type { ScenarioQuestion } from "@/lib/types";

export default function AssessmentChat({
  applicationId,
  questions,
  savedDraftAnswers,
}: {
  applicationId: string;
  questions: ScenarioQuestion[];
  savedDraftAnswers: string[];
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(
    savedDraftAnswers.length === questions.length
      ? savedDraftAnswers
      : questions.map(() => "")
  );
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSavingDraft, startDraftSave] = useTransition();
  // One-shot retry against Gemini when OpenRouter fails — see
  // app/api/assess/[applicationId]/stream/route.ts.
  const hasRetried = useRef(false);

  const { object, submit, isLoading } = useObject({
    api: `/api/assess/${applicationId}/stream`,
    schema: scoringResultSchema,
    onFinish: ({ error: finishError }) => {
      if (finishError) {
        // OpenRouter's rate-limit surfaces here (stream completes with no
        // valid object), not via onError — same one-shot Gemini retry.
        if (!hasRetried.current) {
          hasRetried.current = true;
          submit({ answers, fallback: true });
          return;
        }
        setError("AI scoring failed. Please try submitting again.");
        return;
      }
      setSubmitted(true);
    },
    onError: (err) => {
      if (!hasRetried.current) {
        hasRetried.current = true;
        submit({ answers, fallback: true });
        return;
      }
      setError(err.message);
    },
  });

  const elapsedSeconds = useElapsedSeconds(isLoading);

  const currentQuestion = questions[step];
  const isLastStep = step === questions.length - 1;

  function updateAnswer(value: string) {
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = value;
      return next;
    });
  }

  function handleNext() {
    setError(null);
    startDraftSave(async () => {
      const result = await saveDraftAnswerAction({ applicationId, answers });
      if (result.error) {
        setError(result.error);
        return;
      }

      if (!isLastStep) {
        setStep((s) => s + 1);
        return;
      }

      hasRetried.current = false;
      submit({ answers });
    });
  }

  if (submitted) {
    return (
      <div className="flex flex-col gap-3">
        {object?.match_score !== undefined && (
          <div className="rounded border border-green-200 bg-green-50 p-4">
            <p className="font-medium text-green-800">
              Match Score: {object.match_score}
            </p>
            {object.pitch_summary && (
              <p className="mt-1 text-sm text-green-700">
                {object.pitch_summary}
              </p>
            )}
          </div>
        )}
        {/*
          No link to the HR dashboard from here: it lists every other
          candidate's score, CV and transcript, so it isn't a candidate's to
          see — and /hr/* is behind HR auth anyway.
        */}
        <p className="text-sm text-slate-600">
          Thanks for completing the assessment! The HR team will review your
          results shortly.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-slate-500">
          Analyzing your answers... ({elapsedSeconds}s)
        </p>
        {questions.map((q, i) => {
          const entry = object?.entries?.[i];
          return (
            <div key={i} className="rounded border border-slate-200 p-3">
              <p className="text-xs font-medium text-slate-500">
                {q.focus_area}
              </p>
              <p className="text-sm font-medium">{q.question}</p>
              {entry?.feedback ? (
                <p className="mt-1 text-sm text-slate-700">{entry.feedback}</p>
              ) : (
                <p className="mt-1 text-sm text-slate-400">Evaluating...</p>
              )}
            </div>
          );
        })}
        {object?.match_score !== undefined && (
          <div className="rounded border border-green-200 bg-green-50 p-4">
            <p className="font-medium text-green-800">
              Match Score: {object.match_score}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-500">
        Question {step + 1} of {questions.length}
        {currentQuestion?.focus_area ? ` — ${currentQuestion.focus_area}` : ""}
      </p>
      <p className="font-medium">{currentQuestion?.question}</p>
      <textarea
        rows={6}
        className="rounded border border-slate-300 px-3 py-2"
        placeholder="Type your answer here..."
        value={answers[step] ?? ""}
        onChange={(e) => updateAnswer(e.target.value)}
      />
      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        type="button"
        disabled={isSavingDraft || !answers[step]?.trim()}
        onClick={handleNext}
        className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {isSavingDraft
          ? "Saving..."
          : isLastStep
            ? "Submit Assessment"
            : "Next Question"}
      </button>
    </div>
  );
}
