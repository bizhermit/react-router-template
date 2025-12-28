const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

export function getLength(str: string | null | undefined) {
  return !str ? 0 : [...segmenter.segment(str)].length;
}
