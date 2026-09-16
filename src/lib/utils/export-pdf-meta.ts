export function generatePDFMetadata(analysis: any) {
  return {
    title: analysis.roleTitle || "Resume Analysis",
    subject: "Resume to Job Alignment Analysis",
    author: "Alignly",
    keywords: [
      analysis.roleTitle,
      "resume analysis",
      "job matching",
      ...analysis.matchedSkills.map((s: any) => s.skill),
    ].filter(Boolean),
    producer: "Alignly",
  };
}
