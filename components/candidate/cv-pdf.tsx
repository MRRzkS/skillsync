import { Document, Page, View, Text, StyleSheet, Link } from "@react-pdf/renderer";
import type { CvData } from "@/lib/candidate/cv-schema";
import type { CvTemplate } from "@/components/candidate/cv-preview";
import { normalizeUrl } from "@/lib/utils";

/**
 * Plain, ATS-friendly PDF rendering of a CvData object.
 * Kept deliberately simple (no tables, no images, no multi-column layout)
 * so applicant tracking systems can parse it reliably.
 * This must always be driven by the same CvData used in <CvPreview /> —
 * including which template is selected, so the downloaded file matches what
 * was actually previewed.
 */

const TEMPLATE_ACCENT: Record<CvTemplate, { side: "left" | "top" | null; color: string }> = {
  classic: { side: null, color: "" },
  modern: { side: "left", color: "#7C5CFC" },
  minimal: { side: "top", color: "#F59E0B" },
};

const COLORS = {
  ocean: "#1A5F7A",
  purple: "#7C5CFC",
  dark: "#172033",
  gray: "#667085",
  line: "#E4ECE9",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 44,
    fontSize: 10.5,
    fontFamily: "Helvetica",
    color: COLORS.dark,
  },
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ocean,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    gap: 10,
  },
  contactItem: {
    fontSize: 9.5,
    color: COLORS.gray,
  },
  divider: {
    marginTop: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ocean,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  section: {
    marginBottom: 14,
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.5,
    color: COLORS.dark,
  },
  entry: {
    marginBottom: 8,
  },
  entryHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  entryTitle: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: COLORS.dark,
  },
  entryDates: {
    fontSize: 9.5,
    color: COLORS.gray,
  },
  entrySubtitle: {
    fontSize: 9.5,
    color: COLORS.gray,
    marginTop: 1,
  },
  bulletRow: {
    flexDirection: "row",
    marginTop: 3,
    paddingLeft: 2,
  },
  bulletDot: {
    width: 10,
    fontSize: 10,
    color: COLORS.purple,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.45,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    fontSize: 9,
    color: COLORS.ocean,
    backgroundColor: "#EAF3F6",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
  },
  contactLink: {
    fontSize: 9.5,
    color: COLORS.ocean,
    textDecoration: "none",
  },
});

function ContactLine({ cv }: { cv: CvData }) {
  const plainItems = [cv.contact.email, cv.contact.phone, cv.contact.location].filter(Boolean);
  const linkItems = [cv.contact.linkedin, cv.contact.portfolio].filter(Boolean);

  return (
    <View style={styles.contactRow}>
      {plainItems.map((item, i) => (
        <Text key={`plain-${i}`} style={styles.contactItem}>
          {item}
        </Text>
      ))}
      {linkItems.map((item, i) => (
        <Link key={`link-${i}`} src={normalizeUrl(item as string)} style={styles.contactLink}>
          {item}
        </Link>
      ))}
    </View>
  );
}

export function CvPdfDocument({ cv, template = "classic" }: { cv: CvData; template?: CvTemplate }) {
  const latestRole = cv.experience[0]?.role;
  const accent = TEMPLATE_ACCENT[template];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {accent.side === "left" && (
          <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, backgroundColor: accent.color }} />
        )}
        {accent.side === "top" && (
          <View style={{ position: "absolute", left: 0, right: 0, top: 0, height: 4, backgroundColor: accent.color }} />
        )}

        {/* Header */}
        <View>
          <Text style={styles.name}>{cv.contact.fullName || "Candidate"}</Text>
          {latestRole && <Text style={styles.entrySubtitle}>{latestRole}</Text>}
          <ContactLine cv={cv} />
        </View>

        <View style={styles.divider} />

        {/* Summary */}
        {cv.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.paragraph}>{cv.summary}</Text>
          </View>
        ) : null}

        {/* Experience */}
        {cv.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {cv.experience.map((exp, i) => (
              <View key={i} style={styles.entry} wrap={false}>
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.entryTitle}>
                    {exp.role}
                    {exp.company ? ` — ${exp.company}` : ""}
                  </Text>
                  <Text style={styles.entryDates}>
                    {exp.startDate}
                    {exp.startDate || exp.endDate ? " – " : ""}
                    {exp.endDate}
                  </Text>
                </View>
                {exp.location ? <Text style={styles.entrySubtitle}>{exp.location}</Text> : null}
                {exp.bullets.map((b, j) => (
                  <View key={j} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {cv.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {cv.education.map((ed, i) => (
              <View key={i} style={styles.entry} wrap={false}>
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.entryTitle}>
                    {ed.degree}
                    {ed.fieldOfStudy ? `, ${ed.fieldOfStudy}` : ""}
                  </Text>
                  <Text style={styles.entryDates}>
                    {ed.startDate}
                    {ed.startDate || ed.endDate ? " – " : ""}
                    {ed.endDate}
                  </Text>
                </View>
                <Text style={styles.entrySubtitle}>
                  {ed.institution}
                  {ed.gpa ? ` · GPA ${ed.gpa}` : ""}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {cv.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {cv.projects.map((p, i) => (
              <View key={i} style={styles.entry} wrap={false}>
                <Text style={styles.entryTitle}>{p.name}</Text>
                {p.description ? <Text style={styles.paragraph}>{p.description}</Text> : null}
                {p.technologies.length > 0 && (
                  <Text style={styles.entrySubtitle}>{p.technologies.join(", ")}</Text>
                )}
                {p.link ? (
                  <Link src={normalizeUrl(p.link)} style={{ fontSize: 9, color: COLORS.purple }}>
                    {p.link}
                  </Link>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {cv.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.chipsRow}>
              {cv.skills.map((s, i) => (
                <Text key={i} style={styles.chip}>
                  {s}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Certifications & Languages */}
        {(cv.certifications.length > 0 || cv.languages.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional</Text>
            {cv.certifications.length > 0 && (
              <Text style={styles.paragraph}>
                Certifications: {cv.certifications.join(", ")}
              </Text>
            )}
            {cv.languages.length > 0 && (
              <Text style={styles.paragraph}>Languages: {cv.languages.join(", ")}</Text>
            )}
          </View>
        )}
      </Page>
    </Document>
  );
}
