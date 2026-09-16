export function getScoreDetails(score: number) {
  if (score >= 80) {
    return {
      label: "Excellent fit",
      color: "positive" as const,
      advice: "You meet most requirements. Polish the application and apply.",
    };
  }
  if (score >= 70) {
    return {
      label: "Strong match",
      color: "positive" as const,
      advice: "You have solid experience. Address the gaps and apply with confidence.",
    };
  }
  if (score >= 60) {
    return {
      label: "Moderate match",
      color: "caution" as const,
      advice: "You're in the range. Use the suggestions to strengthen your resume before applying.",
    };
  }
  if (score >= 50) {
    return {
      label: "Possible match",
      color: "caution" as const,
      advice: "The gaps are significant. Focus on the critical skills first, then apply if interested.",
    };
  }
  return {
    label: "Long shot",
    color: "negative" as const,
    advice: "The role requires skills you don't have yet. Consider a similar role or gain experience.",
  };
}
