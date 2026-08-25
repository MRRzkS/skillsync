"use client";

import { Input } from "@/components/candidate/ui/input";
import { Label } from "@/components/candidate/ui/label";
import { Button } from "@/components/candidate/ui/button";
import {
  emptyEducation,
  type WizardEducation,
} from "@/components/candidate/wizard/types";
import { Plus, Trash2, GraduationCap } from "lucide-react";

export function StepEducation({
  education,
  onChange,
}: {
  education: WizardEducation[];
  onChange: (next: WizardEducation[]) => void;
}) {
  function updateEntry(id: string, patch: Partial<WizardEducation>) {
    onChange(education.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function removeEntry(id: string) {
    onChange(education.filter((e) => e.id !== id));
  }

  function addEntry() {
    onChange([...education, emptyEducation()]);
  }

  return (
    <div>
      <h2 className="font-candidate-heading text-xl font-bold text-text-dark">Education Background</h2>
      <p className="mt-1.5 text-sm text-text-gray">
        Add your degrees, bootcamps, or other formal education.
      </p>

      <div className="mt-5 space-y-4">
        {education.map((ed, idx) => (
          <div key={ed.id} className="rounded-xl border border-ocean-100/70 bg-white p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-dark">
                <GraduationCap className="h-4 w-4 text-ocean-600" />
                Education {idx + 1}
              </div>
              <button
                type="button"
                onClick={() => removeEntry(ed.id)}
                className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Institution / University</Label>
                <Input
                  className="mt-1.5"
                  placeholder="University of Texas at Austin"
                  value={ed.institution}
                  onChange={(e) => updateEntry(ed.id, { institution: e.target.value })}
                />
              </div>
              <div>
                <Label>Degree</Label>
                <Input
                  className="mt-1.5"
                  placeholder="B.S."
                  value={ed.degree}
                  onChange={(e) => updateEntry(ed.id, { degree: e.target.value })}
                />
              </div>
              <div>
                <Label>Field of Study</Label>
                <Input
                  className="mt-1.5"
                  placeholder="Computer Science"
                  value={ed.fieldOfStudy}
                  onChange={(e) => updateEntry(ed.id, { fieldOfStudy: e.target.value })}
                />
              </div>
              <div>
                <Label>Start Year</Label>
                <Input
                  className="mt-1.5"
                  placeholder="2015"
                  value={ed.startDate}
                  onChange={(e) => updateEntry(ed.id, { startDate: e.target.value })}
                />
              </div>
              <div>
                <Label>End Year</Label>
                <Input
                  className="mt-1.5"
                  placeholder="2019"
                  value={ed.endDate}
                  onChange={(e) => updateEntry(ed.id, { endDate: e.target.value })}
                />
              </div>
            </div>
          </div>
        ))}

        <Button type="button" variant="outline-soft" onClick={addEntry} className="gap-2">
          <Plus className="h-4 w-4" /> Add Education
        </Button>
      </div>
    </div>
  );
}
