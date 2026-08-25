import type { CvJson } from "./types";

// Static demo data used to seed a fully-populated ranking dashboard without
// waiting on live AI calls — used both by the CLI script
// (scripts/seed-ranking-demo.ts) and the "Generate Example Dashboard" button in
// /hr/dev-tools, so presenters have a safe backup if live AI is slow.
//
// The cv_json values here mirror the shape the Candidate module (ResumeForge)
// actually produces, so the dashboard's CV panel is exercised realistically.

export const DEMO_RANKING_JOB = {
  title: "Backend Engineer (Ranking Demo)",
  jd_text:
    "We are looking for a Backend Engineer experienced with Node.js, PostgreSQL, and REST API design. You will build and scale our core services and optimize database performance.",
};

export const DEMO_RANKING_QUESTIONS = [
  {
    question: "Walk me through diagnosing a slow production API endpoint.",
    focus_area: "Performance debugging",
  },
  {
    question: "Design a REST API for a new bookmarking feature.",
    focus_area: "API design",
  },
  {
    question: "Describe a time you optimized a slow database query.",
    focus_area: "Database optimization",
  },
];

export type DemoRankingCandidate = {
  full_name: string;
  cv_json: CvJson;
  match_score: number;
  pitch_summary: string;
};

export const DEMO_RANKING_CANDIDATES: DemoRankingCandidate[] = [
  {
    full_name: "Siti Rahma",
    match_score: 94,
    pitch_summary:
      "Siti gave concrete, measurable answers backed by real production incidents. Strong STAR structure across all 3 answers, directly verifying her CV's performance-tuning claims. Highly recommended for interview.",
    cv_json: {
      full_name: "Siti Rahma",
      contact: {
        fullName: "Siti Rahma",
        email: "siti.rahma@example.com",
        phone: "+62 812-1100-4471",
        location: "Jakarta, ID",
        linkedin: "linkedin.com/in/sitirahma",
      },
      summary:
        "Backend engineer with 3 years of experience building and scaling high-traffic services. Focused on latency reduction, observability, and pragmatic database design.",
      experience: [
        {
          role: "Backend Engineer",
          company: "Kirana Commerce",
          location: "Jakarta, ID",
          startDate: "Feb 2023",
          endDate: "Present",
          bullets: [
            "Cut checkout API p95 latency from 1.4s to 240ms by removing N+1 queries and adding covering indexes.",
            "Introduced Redis caching for catalogue reads, absorbing a 6x traffic spike during flash sales with no downtime.",
            "Owned the on-call rotation runbook; reduced mean time to recovery from 45 to 12 minutes.",
          ],
        },
        {
          role: "Junior Backend Developer",
          company: "Sigap Logistics",
          startDate: "Jul 2021",
          endDate: "Jan 2023",
          bullets: [
            "Built the shipment-tracking REST API consumed by 3 internal apps and 2 partner integrations.",
            "Migrated a monolithic cron job into queue workers, cutting nightly batch time by 70%.",
          ],
        },
      ],
      education: [
        {
          institution: "Institut Teknologi Bandung",
          degree: "S.Kom",
          fieldOfStudy: "Informatika",
          startDate: "2017",
          endDate: "2021",
        },
      ],
      skills: [
        "Node.js",
        "PostgreSQL",
        "Redis",
        "Docker",
        "REST API",
        "TypeScript",
        "Observability",
      ],
      certifications: ["AWS Certified Developer – Associate"],
      languages: ["Indonesian (native)", "English (professional)"],
      atsKeywords: [
        "Backend Engineer",
        "Node.js",
        "PostgreSQL",
        "Redis",
        "Query Optimization",
        "REST API",
        "Latency Reduction",
      ],
    },
  },
  {
    full_name: "Andi Wijaya",
    match_score: 72,
    pitch_summary:
      "Andi's answers were solid but generic in places — good grasp of fundamentals with one strong example (query optimization), though the API design answer lacked depth. Worth a technical interview.",
    cv_json: {
      full_name: "Andi Wijaya",
      contact: {
        fullName: "Andi Wijaya",
        email: "andi.wijaya@example.com",
        location: "Surabaya, ID",
        linkedin: "linkedin.com/in/andiwijaya",
      },
      summary:
        "Mid-level backend developer with 2 years of experience delivering internal tools and reporting services.",
      experience: [
        {
          role: "Backend Developer",
          company: "Nusantara Retail Group",
          startDate: "Mar 2023",
          endDate: "Present",
          bullets: [
            "Maintained the inventory sync service between 40+ store locations and the central warehouse.",
            "Rewrote the daily sales report query, reducing runtime from 90s to under 10s.",
          ],
        },
      ],
      education: [
        {
          institution: "Universitas Airlangga",
          degree: "S.Kom",
          fieldOfStudy: "Sistem Informasi",
          startDate: "2018",
          endDate: "2022",
        },
      ],
      skills: ["Node.js", "PostgreSQL", "TypeScript", "Express"],
      languages: ["Indonesian (native)", "English (intermediate)"],
      atsKeywords: ["Backend Developer", "Node.js", "PostgreSQL", "SQL Tuning"],
    },
  },
  {
    full_name: "Budi Santoso",
    match_score: 38,
    pitch_summary:
      "Budi has a basic internship background with Node.js, PostgreSQL, and REST APIs, but his answers are vague, lack STAR detail, and provide no measurable results or concrete implementation depth.",
    cv_json: {
      full_name: "Budi Santoso",
      contact: {
        fullName: "Budi Santoso",
        email: "budi.santoso@example.com",
        location: "Yogyakarta, ID",
      },
      summary:
        "Fresh graduate backend engineer with a passion for APIs and a 6-month internship background.",
      experience: [
        {
          role: "Backend Intern",
          company: "Startup XYZ",
          startDate: "Jan 2025",
          endDate: "Jun 2025",
          bullets: [
            "Built REST APIs using Node.js and PostgreSQL for an internal admin panel.",
            "Reduced query latency by 30% by adding indexes.",
          ],
        },
      ],
      education: [
        {
          institution: "Universitas Contoh",
          degree: "S1",
          fieldOfStudy: "Informatika",
          startDate: "2021",
          endDate: "2025",
        },
      ],
      skills: ["Node.js", "PostgreSQL", "TypeScript", "REST API"],
      languages: ["Indonesian (native)", "English (basic)"],
      atsKeywords: ["Fresh Graduate", "Node.js", "PostgreSQL", "REST API"],
    },
  },
  {
    full_name: "Dewi Lestari",
    match_score: 21,
    pitch_summary:
      "Dewi's answers do not demonstrate backend or database optimization experience matching the role. CV claims are not verified by her scenario responses. Not recommended for this specific role.",
    cv_json: {
      full_name: "Dewi Lestari",
      contact: {
        fullName: "Dewi Lestari",
        email: "dewi.lestari@example.com",
        location: "Bandung, ID",
      },
      summary:
        "Junior developer with mostly frontend experience, currently expanding into Node.js.",
      experience: [
        {
          role: "Frontend Developer",
          company: "Studio Kreatif",
          startDate: "Sep 2023",
          endDate: "Present",
          bullets: [
            "Built marketing landing pages and a small internal dashboard in React.",
          ],
        },
      ],
      education: [
        {
          institution: "Universitas Padjadjaran",
          degree: "S.Kom",
          fieldOfStudy: "Teknik Informatika",
          startDate: "2019",
          endDate: "2023",
        },
      ],
      skills: ["React", "Node.js", "MongoDB", "Express"],
      languages: ["Indonesian (native)"],
      atsKeywords: ["Frontend", "React", "Node.js"],
    },
  },
];

// Generic dummy candidate used by "Simulate Candidate Application" in
// /hr/dev-tools — deliberately role-agnostic, since the presenter may have just
// created a job for any title.
export const DEMO_SIMULATED_CANDIDATE: { full_name: string; cv_json: CvJson } = {
  full_name: "Demo Candidate",
  cv_json: {
    full_name: "Demo Candidate",
    contact: {
      fullName: "Demo Candidate",
      email: "demo.candidate@example.com",
      phone: "+62 811-0000-0000",
      location: "Remote",
      linkedin: "linkedin.com/in/demo-candidate",
    },
    summary:
      "Mid-level professional with hands-on experience shipping production features end to end and collaborating across product, design, and engineering.",
    experience: [
      {
        role: "Software Engineer",
        company: "Acme Corp",
        location: "Remote",
        startDate: "2022",
        endDate: "Present",
        bullets: [
          "Built and maintained backend services handling 10k+ daily requests.",
          "Improved API response time by 40% through query optimization and caching.",
          "Partnered with design to ship 4 customer-facing features per quarter.",
        ],
      },
      {
        role: "Associate Engineer",
        company: "Northlight Studio",
        startDate: "2020",
        endDate: "2022",
        bullets: [
          "Automated the release checklist, cutting deploy prep from 2 hours to 15 minutes.",
        ],
      },
    ],
    education: [
      {
        institution: "State University",
        degree: "B.S.",
        fieldOfStudy: "Computer Science",
        startDate: "2016",
        endDate: "2020",
      },
    ],
    skills: [
      "Node.js",
      "PostgreSQL",
      "TypeScript",
      "REST API",
      "Communication",
    ],
    languages: ["English (professional)", "Indonesian (native)"],
    atsKeywords: ["Software Engineer", "Node.js", "PostgreSQL", "TypeScript"],
  },
};
