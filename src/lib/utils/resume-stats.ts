export function getResumeStats(text: string) {
  const words = text.trim().split(/\s+/).length;
  const lines = text.split("\n").length;
  const chars = text.length;
  const bullets = (text.match(/^[\s]*[-•*]/gm) || []).length;

  return { words, lines, chars, bullets };
}
