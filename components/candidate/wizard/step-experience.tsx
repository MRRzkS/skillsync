"use client";

import { Input } from "@/components/candidate/ui/input";
import { Label } from "@/components/candidate/ui/label";
import { Button } from "@/components/candidate/ui/button";
import { Checkbox } from "@/components/candidate/ui/checkbox";
import {
  emptyExperience,
  type WizardExperience,
} from "@/components/candidate/wizard/types";
import { Plus, Trash2, Briefcase } from "lucide-react";

export function StepExperience({
  experience,
  noExperience,
  onChangeExperience,
  onChangeNoExperience,
}: {
  experience: WizardExperience[];
  noExperience: boolean;
  onChangeExperience: (next: WizardExperience[]) => void;
  onChangeNoExperience: (value: boolean) => void;
}) {
  function updateEntry(id: string, patch: Partial<WizardExperience>) {
    onChangeExperience(experience.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function removeEntry(id: string) {
    onChangeExperience(experience.filter((e) => e.id !== id));
  }

  function addEntry() {
    onChangeExperience([...experience, emptyExperience()]);
  }

  function updateBullet(id: string, index: number, value: string) {
    const entry = experience.find((e) => e.id === id);
    if (!entry) return;
    const bullets = [...entry.bullets];
    bullets[index] = value;
    updateEntry(id, { bullets });
  }

  function addBullet(id: string) {
    const entry = experience.find((e) => e.id === id);
    if (!entry) return;
    updateEntry(id, { bullets: [...entry.bullets, ""] });
  }

  function removeBullet(id: string, index: number) {
    const entry = experience.find((e) => e.id === id);
    if (!entry) return;
    const bullets = entry.bullets.filter((_, i) => i !== index);
    updateEntry(id, { bullets: bullets.length > 0 ? bullets : [""] });
  }

  return (
    <div>
      <h2 className="font-candidate-heading text-xl font-bold text-text-dark">Your Work Experience</h2>
      <p className="mt-1.5 text-sm text-text-gray">
        Add each role you&apos;ve held. You can reorder or remove them any time.
      </p>

      <label className="mt-5 flex items-center gap-2.5 rounded-lg border border-ocean-100 bg-ocean-50/40 px-3.5 py-3 text-sm text-text-dark">
        <Checkbox
          checked={noExperience}
          onCheckedChange={(checked) => {
            onChangeNoExperience(checked);
            if (checked) onChangeExperience([]);
          }}
        />
        I don&apos;t have work experience yet
      </label>

      {!noExperience && (
        <div className="mt-5 space-y-4">
          {experience.map((exp, idx) => (
            <div
              key={exp.id}
              className="rounded-xl border border-ocean-100/70 bg-white p-5 shadow-card"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-text-dark">
                  <Briefcase className="h-4 w-4 text-ocean-600" />
                  Experience {idx + 1}
                </div>
                <button
                  type="button"
                  onClick={() => removeEntry(exp.id)}
                  className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Job Title</Label>
                  <Input
                    className="mt-1.5"
                    placeholder="Senior Software Engineer"
                    value={exp.role}
                    onChange={(e) => updateEntry(exp.id, { role: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Company Name</Label>
                  <Input
                    className="mt-1.5"
                    placeholder="Northwind Labs"
                    value={exp.company}
                    onChange={(e) => updateEntry(exp.id, { company: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Location (optional)</Label>
                  <Input
                    className="mt-1.5"
                    placeholder="Austin, TX"
                    value={exp.location}
                    onChange={(e) => updateEntry(exp.id, { location: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      className="mt-1.5"
                      placeholder="Mar 2022"
                      value={exp.startDate}
                      onChange={(e) => updateEntry(exp.id, { startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      className="mt-1.5"
                      placeholder="Present"
                      value={exp.current ? "Present" : exp.endDate}
                      disabled={exp.current}
                      onChange={(e) => updateEntry(exp.id, { endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <label className="mt-3 flex items-center gap-2.5 text-sm text-text-dark">
                <Checkbox
                  checked={exp.current}
                  onCheckedChange={(checked) =>
                    updateEntry(exp.id, { current: checked, endDate: checked ? "Present" : "" })
                  }
                />
                I currently work here
              </label>

              <div className="mt-4">
                <Label>Achievements</Label>
                <div className="mt-1.5 space-y-2">
                  {exp.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-center gap-2">
                      <Input
                        placeholder={`Achievement ${bIdx + 1}`}
                        value={bullet}
                        onChange={(e) => updateBullet(exp.id, bIdx, e.target.value)}
                      />
                      {exp.bullets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBullet(exp.id, bIdx)}
                          className="shrink-0 text-text-gray hover:text-red-500"
                          aria-label="Remove achievement"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addBullet(exp.id)}
                  className="mt-2 flex items-center gap-1 text-xs font-medium text-sync-purple-600 hover:text-sync-purple-700"
                >
                  <Plus className="h-3.5 w-3.5" /> Add another achievement
                </button>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline-soft" onClick={addEntry} className="gap-2">
            <Plus className="h-4 w-4" /> Add Work Experience
          </Button>
        </div>
      )}
    </div>
  );
}
