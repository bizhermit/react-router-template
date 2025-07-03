export const Month = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] as const,
  en_s: ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."] as const,
  ja: ["１月", "２月", "３月", "４月", "５月", "６月", "７月", "８月", "９月", "１０月", "１１月", "１２月"] as const,
};

export const Week = {
  ja_s: ["日", "月", "火", "水", "木", "金", "土"] as const,
  en_s: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const,
};

export type TimeZoneOffset =
  | `+${number}:${number}`
  | `+${number}${number}`
  | `-${number}:${number}`
  | `-${number}${number}`
  ;

export type TimeZone =
  | "Z"
  | "UTC"
  | "Asia/Tokyo"
  ;

const TIME_ZONE_OFFSET = {
  "Z": 0,
  "UTC": 0,
  "Asia/Tokyo": -540,
} satisfies Partial<Record<TimeZone, number>>;

export function parseTimezoneOffset(tz: TimeZone | TimeZoneOffset) {
  const a = tz.match(/^(\+|-)(\d{1,2})[:]?(\d{1,2})/);
  if (a) return (Number(a[2] || 0) * 60 + Number(a[3] || 0)) * (a[1] === "-" ? 1 : -1);
  return TIME_ZONE_OFFSET[tz as TimeZone] ?? 0;
};

export function parseDate(value: unknown) {
  if (value == null || value === "") {
    return undefined;
  }
  if (typeof value === "string") {
    const a = value.match(/^(\d{1,4})[-|/|年]?(\d{1,2}|$)[-|/|月]?(\d{1,2}|$)[日]?[\s|T]?(\d{1,2}|$)[:]?(\d{1,2}|$)[:]?(\d{1,2}|$)[.]?(\d{0,3}|$)?(.*)/);
    if (a) {
      const tz = a[8];
      const d = new Date(
        Number(a[1]), Number(a[2] || 1) - 1, Number(a[3] || 1),
        Number(a[4] || 0), Number(a[5] || 0), Number(a[6] || 0), Number(a[7] || 0)
      );
      const offset = d.getTimezoneOffset();
      const tzOffset = tz ? parseTimezoneOffset(tz as TimeZoneOffset) : offset;
      const diff = offset - tzOffset;
      if (diff !== 0) d.setTime(d.getTime() - (diff * 60000));
      return d;
    }
    throw new Error("");
  }
  if (typeof value === "number") {
    return new Date(value);
  }
  if (value instanceof Date) {
    return value;
  }
};

export function formatDate(date: string | number | Date | null | undefined, pattern = "yyyy-MM-dd", week?: Array<string>) {
  if (date == null) return undefined;
  const d = parseDate(date);
  if (d == null) return undefined;
  return pattern
    .replace(/yyyy/g, String(d.getFullYear()))
    .replace(/yy/g, `00${d.getFullYear()}`.slice(-2))
    .replace(/~M/g, ` ${d.getMonth() + 1}`.slice(-2))
    .replace(/MM/g, `0${d.getMonth() + 1}`.slice(-2))
    .replace(/M/g, String(d.getMonth() + 1))
    .replace(/~d/g, ` ${d.getDate()}`.slice(-2))
    .replace(/dd/g, `0${d.getDate()}`.slice(-2))
    .replace(/d/g, String(d.getDate()))
    .replace(/~h/g, ` ${d.getHours()}`.slice(-2))
    .replace(/hh/g, `0${d.getHours()}`.slice(-2))
    .replace(/h/g, String(d.getHours()))
    .replace(/~m/g, ` ${d.getMinutes()}`.slice(-2))
    .replace(/mm/g, `0${d.getMinutes()}`.slice(-2))
    .replace(/m/g, String(d.getMinutes()))
    .replace(/~s/g, ` ${d.getSeconds()}`.slice(-2))
    .replace(/ss/g, `0${d.getSeconds()}`.slice(-2))
    .replace(/s/g, String(d.getSeconds()))
    .replace(/SSS/g, `00${d.getMilliseconds()}`.slice(-3))
    .replace(/SS/g, `00${d.getMilliseconds()}`.slice(-3).slice(2))
    .replace(/S/g, String(d.getMilliseconds()))
    .replace(/w/g, (week ?? Week.ja_s)[d.getDay()]);
};
