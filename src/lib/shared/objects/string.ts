const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

/**
 * 文字数を取得する
 * @param str
 * @returns
 */
export function getLength(str: string | null | undefined) {
  return !str ? 0 : [...segmenter.segment(str)].length;
};
