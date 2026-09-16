export function getJobSimilarity(jd1: string, jd2: string): number {
  const words1 = new Set(jd1.toLowerCase().split(/\W+/));
  const words2 = new Set(jd2.toLowerCase().split(/\W+/));
  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  return Math.round((intersection.size / union.size) * 100);
}
