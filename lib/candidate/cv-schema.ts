import { z } from "zod";

/**
 * Structured, ATS-friendly CV representation.
 * This is the single source of truth for:
 *  - the JSON shape the AI model must return (generateObject)
 *  - the shape stored in candidate_profiles.cv_json
 *  - the props the CV preview component renders
 */

export const contactSchema = z.object({
  fullName: z.string().describe("Candidate's full name as written on the resume"),
  email: z.string().describe("Email address, empty string if not found"),
  phone: z.string().describe("Phone number, empty string if not found"),
  location: z.string().describe("City/Country, empty string if not found"),
  linkedin: z.string().describe("LinkedIn URL, empty string if not found"),
  portfolio: z.string().describe("Portfolio/GitHub/personal site URL, empty string if not found"),
});

export const experienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  startDate: z.string().describe("e.g. 'Jan 2021', best-effort normalization"),
  endDate: z.string().describe("e.g. 'Present' or 'Mar 2023'"),
  location: z.string().describe("empty string if not found"),
  bullets: z
    .array(z.string())
    .describe(
      "Achievement-oriented bullet points, rewritten to start with a strong action verb. Quantify impact where the source text implies a number."
    ),
});

export const educationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  fieldOfStudy: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  gpa: z.string().describe("empty string if not found"),
});

export const projectSchema = z.object({
  name: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
  link: z.string().describe("empty string if not found"),
});

export const cvSchema = z.object({
  contact: contactSchema,
  summary: z
    .string()
    .describe(
      "A concise 2-3 sentence professional summary, ATS-optimized. Write this even if the source has no explicit summary section, by synthesizing the candidate's profile."
    ),
  skills: z
    .array(z.string())
    .describe("Flat list of hard/technical and key soft skills, deduplicated, no categories"),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  projects: z.array(projectSchema),
  certifications: z.array(z.string()),
  languages: z.array(z.string()),
  atsKeywords: z
    .array(z.string())
    .describe(
      "10-20 industry/role keywords extracted or inferred from the text, useful for ATS keyword matching"
    ),
});

export type CvContact = z.infer<typeof contactSchema>;
export type CvExperience = z.infer<typeof experienceSchema>;
export type CvEducation = z.infer<typeof educationSchema>;
export type CvProject = z.infer<typeof projectSchema>;
export type CvData = z.infer<typeof cvSchema>;
