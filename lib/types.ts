// Shared types matching the Supabase schema (see ERD / case study data model).
//
// The Candidate module (ResumeForge) owns the shape of `cv_json` — these types
// describe what it currently emits, but every field is optional on purpose:
// the HR module must keep rendering even when that team adds, renames, or drops
// fields. Some fields have two spellings because generated CVs in the wild use
// both (`role`/`title`, `institution`/`school`, a single `period` vs split
// `startDate`/`endDate`); the CV renderer accepts either.

export type CvContact = {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  portfolio?: string;
};

export type CvExperience = {
  role?: string;
  title?: string;
  company?: string;
  location?: string;
  period?: string;
  startDate?: string;
  endDate?: string;
  bullets?: string[];
};

export type CvEducation = {
  institution?: string;
  school?: string;
  degree?: string;
  fieldOfStudy?: string;
  gpa?: string;
  period?: string;
  startDate?: string;
  endDate?: string;
};

export type CvProject = {
  name?: string;
  title?: string;
  description?: string;
  link?: string;
  bullets?: string[];
};

export type CvJson = {
  full_name?: string;
  contact?: CvContact;
  summary?: string;
  experience?: CvExperience[];
  education?: CvEducation[];
  skills?: string[];
  projects?: CvProject[];
  languages?: string[];
  certifications?: string[];
  atsKeywords?: string[];
  [key: string]: unknown;
};

export type CandidateProfile = {
  id: string;
  full_name: string;
  cv_json: CvJson;
  created_at: string;
};

export type ScenarioQuestion = {
  question: string;
  focus_area: string;
};

export type JobVacancy = {
  id: string;
  title: string;
  jd_text: string;
  scenarios: ScenarioQuestion[];
  created_at: string;
};

export type TranscriptEntry = {
  question: string;
  focus_area: string;
  answer: string;
  feedback?: string;
};

export type Transcript = {
  entries: TranscriptEntry[];
  pitch_summary?: string;
};

export type ApplicationStatus = "pending" | "in_progress" | "completed";

export type Application = {
  id: string;
  candidate_id: string;
  job_id: string;
  match_score: number;
  transcript: Transcript | null;
  status: ApplicationStatus;
  created_at: string;
};

export type ApplicationWithCandidate = Application & {
  candidate_profiles: CandidateProfile;
};
