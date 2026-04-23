export const MONTH = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] as const,
  en_s: ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."] as const,
  ja: ["１月", "２月", "３月", "４月", "５月", "６月", "７月", "８月", "９月", "１０月", "１１月", "１２月"] as const,
};

export const WEEK = {
  ja_s: ["日", "月", "火", "水", "木", "金", "土"] as const,
  en_s: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const,
};

type TimeZoneOffset =
  | `+${number}:${number}`
  | `+${number}${number}`
  | `-${number}:${number}`
  | `-${number}${number}`
  ;

type TimeZone =
  | "Z"
  | "UTC"
  | "Asia/Tokyo"
  | "America/Los_Angeles"
  ;

const TIME_ZONE_OFFSET = {
  // eslint-disable-next-line @stylistic/quote-props
  "Z": 0,
  // eslint-disable-next-line @stylistic/quote-props
  "UTC": 0,
  "Asia/Tokyo": -540,
  "America/Los_Angeles": +480,
} satisfies Partial<Record<TimeZone, number>>;

function parseTimezoneOffset(tz: TimeZone | TimeZoneOffset) {
  const a = tz.match(/^(\+|-)(\d{1,2})[:]?(\d{1,2})/);
  if (a) return (Number(a[2] || 0) * 60 + Number(a[3] || 0)) * (a[1] === "-" ? 1 : -1);
  return TIME_ZONE_OFFSET[tz as TimeZone] ?? 0;
};

function getMsOfDay(ms: number) {
  const days = Math.floor(ms / MS_PER_DAY);
  return ms - days * MS_PER_DAY;
}

function getYMD(ms: number) {
  const { yoe, era, mp, doy, days } = getGregorianParts(ms);
  const month = mp + (mp < 10 ? 3 : -9);
  const year = (yoe + era * 400) + (month <= 2 ? 1 : 0);
  const day = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const week = ((days + 4) % 7 + 7) % 7;
  return {
    year,
    month,
    day,
    week,
  } as const;
};

function getHMS(ms: number) {
  const msOfDay = getMsOfDay(ms);
  const hour = Math.floor(msOfDay / MS_PER_HOUR);
  const minute = Math.floor((msOfDay % MS_PER_HOUR) / MS_PER_MINUTE);
  const second = Math.floor((msOfDay % MS_PER_MINUTE) / MS_PER_SECOND);
  const millisecond = msOfDay % MS_PER_SECOND;
  return {
    hour,
    minute,
    second,
    millisecond,
  } as const;
};

function getAll(ms: number) {
  return {
    ...getYMD(ms),
    ...getHMS(ms),
  } as const;
};

function compareTimestampMs(before: Timestamp, after: Timestamp) {
  return before.getTime() - after.getTime();
};

function compareTimestampDate(before: Timestamp, after: Timestamp) {
  return Math.floor(before.getTime() / MS_PER_DAY) - Math.floor(after.getTime() / MS_PER_DAY);
};

function compareTimestampMonth(before: Timestamp, after: Timestamp) {
  const beforeYmd = getYMD(before.getTime());
  const afterYmd = getYMD(after.getTime());
  return (beforeYmd.year * 12 + beforeYmd.month) - (afterYmd.year * 12 + afterYmd.month);
};

function compareTimestampTime(before: Timestamp, after: Timestamp) {
  return getMsOfDay(before.getTime()) - getMsOfDay(after.getTime());
};

/** 時間単位 */
const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

function getOffset() {
  const tz = typeof process === "undefined" ? undefined : process.env.TZ?.trim() as TimeZone | TimeZoneOffset | undefined;
  return (tz ? parseTimezoneOffset(tz) : new Date().getTimezoneOffset()) * MS_PER_MINUTE;
}

function getGregorianParts(ms: number) {
  // `1970-01-01 00:00:00`からの経過ミリ秒を取得
  const days = Math.floor(ms / MS_PER_DAY);
  // 1970-01-01 → 0000-03-01 に変換するための補正
  // （アルゴリズム上、3月始まりにすると計算が簡単になる）
  const z = days + 719468;

  // 400年周期（146097日）で分解
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097;

  // 年（400年周期内の年数）
  const yoe = Math.floor(
    (doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365
  );

  // 年内の日数（0始まり）
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));

  // 月計算用（3月を起点とした月インデックス）
  const mp = Math.floor((5 * doy + 2) / 153);

  return {
    yoe,
    doe,
    era,
    doy,
    mp,
    days,
  } as const;
}

function isLeapYear(y: number) {
  return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
}

function daysInMonth(y: number, m: number) {
  if (m === 2) return isLeapYear(y) ? 29 : 28;
  if ([4, 6, 9, 11].includes(m)) return 30;
  return 31;
}

function timeToMs(h: number, m: number, s: number, ms: number) {
  return (
    h * MS_PER_HOUR +
    m * MS_PER_MINUTE +
    s * MS_PER_SECOND +
    ms
  );
}

function daysFromCivil(y: number, m: number, d: number) {
  y -= m <= 2 ? 1 : 0;
  const era = Math.floor(y / 400);
  const yoe = y - era * 400;

  const mp = m + (m > 2 ? -3 : 9);
  const doy = Math.floor((153 * mp + 2) / 5) + d - 1;

  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;

  return era * 146097 + doe - 719468;
}

function pad(num: number | string, maxLen: number = 2) {
  return String(num).padStart(maxLen, "0");
}

function slice(num: number | string, len = 2) {
  return String(num).slice(len * -1);
}

abstract class Timestamp {

  protected offset: number;
  protected ms: number;

  constructor(init?: Timestamp | Date | string | number) {
    this.offset = getOffset();
    if (init == null) {
      this.ms = Date.now() - this.offset;
    } else if (init instanceof Timestamp) {
      this.ms = init.getTime();
      this.offset = init.getOffset();
    } else if (init instanceof Date) {
      this.ms = init.getTime() - this.offset;
    } else if (typeof init === "string") {
      if (!init) {
        this.ms = Date.now() - this.offset;
      } else {
        const a = init.match(/^(\d{1,4})[-|/|年]?(\d{1,2}|$)[-|/|月]?(\d{1,2}|$)[日]?[\s|T]?(\d{1,2}|$)[:]?(\d{1,2}|$)[:]?(\d{1,2}|$)[.]?(\d{0,3}|$)?(.*)/);
        if (a) {
          const days = daysFromCivil(
            Number(a[1]),
            Number(a[2] || 1),
            Number(a[3] || 1),
          );
          const time = timeToMs(
            Number(a[4] || 0),
            Number(a[5] || 0),
            Number(a[6] || 0),
            Number(a[7] || 0),
          );
          const tz = a[8];
          const offsetDiff = tz ? parseTimezoneOffset(tz as TimeZoneOffset) * MS_PER_MINUTE - this.offset : 0;
          this.ms = days * MS_PER_DAY + time - offsetDiff;
        } else {
          // eslint-disable-next-line no-useless-catch
          try {
            const date = new Date(init);
            if (isNaN(date.getTime())) throw new Error(`Invalid date string: ${init}`);
            this.ms = date.getTime() - this.offset;
          } catch (e) {
            throw e;
          }
        }
      }
    } else if (typeof init === "number") {
      if (isNaN(init)) {
        throw new Error(`Invalid date number: ${init}`);
      }
      this.ms = init;
    } else {
      this.ms = Date.now() - this.offset;
    }
  };

  public getTime() {
    return this.ms;
  }

  public getOffset() {
    return this.offset;
  }

  protected setNow() {
    this.ms = Date.now() - this.offset;
  }

  protected getMsOfDay() {
    return getMsOfDay(this.ms);
  }

  protected getYear() {
    const { yoe, era, mp } = getGregorianParts(this.ms);
    // 西暦年（仮）
    // 月（1〜12に変換）
    const month = mp + (mp < 10 ? 3 : -9);
    // 1〜2月の場合は前年扱いなので補正
    return yoe + era * 400 + (month <= 2 ? 1 : 0);
  }

  protected setYear(year: number, month?: number, day?: number) {
    const cur = getAll(this.ms);
    const y = year;
    const m = month ?? cur.month;
    const d = day ?? Math.min(cur.day, daysInMonth(y, m));
    const days = daysFromCivil(y, m, d);
    const time = timeToMs(cur.hour, cur.minute, cur.second, cur.millisecond);
    this.ms = days * MS_PER_DAY + time;
    return this;
  }

  protected getMonth() {
    const { mp } = getGregorianParts(this.ms);
    // 月（1〜12に変換）
    return mp + (mp < 10 ? 3 : -9);
  }

  protected setMonth(month: number, day?: number) {
    const cur = getAll(this.ms);
    const m = month;
    const d = day ?? Math.min(cur.day, daysInMonth(cur.year, m));
    const days = daysFromCivil(cur.year, m, d);
    const time = timeToMs(cur.hour, cur.minute, cur.second, cur.millisecond);
    this.ms = days * MS_PER_DAY + time;
    return this;
  }

  protected getDay() {
    const { doy, mp } = getGregorianParts(this.ms);
    // 日（1始まり）
    return doy - Math.floor((153 * mp + 2) / 5) + 1;
  }

  protected setDay(day: number) {
    const cur = getAll(this.ms);
    const days = daysFromCivil(cur.year, cur.month, day);
    const time = timeToMs(cur.hour, cur.minute, cur.second, cur.millisecond);
    this.ms = days * MS_PER_DAY + time;
    return this;
  }

  protected getWeek() {
    // 1970-01-01 は木曜(4)。負の値でも 0-6 に収めるため正規化する。
    const days = Math.floor(this.ms / MS_PER_DAY);
    return ((days + 4) % 7 + 7) % 7;
  }

  protected getHour() {
    return Math.floor(this.getMsOfDay() / MS_PER_HOUR);
  }

  protected setHour(hour: number, minute?: number, second?: number, millisecond?: number) {
    const cur = getHMS(this.ms);
    const h = hour;
    const m = minute ?? cur.minute;
    const s = second ?? cur.second;
    const ms = millisecond ?? cur.millisecond;
    const days = Math.floor(this.ms / MS_PER_DAY);
    this.ms = days * MS_PER_DAY + timeToMs(h, m, s, ms);
    return this;
  }

  protected getMinute() {
    return Math.floor((this.getMsOfDay() % MS_PER_HOUR) / MS_PER_MINUTE);
  }

  protected setMinute(minute: number, second?: number, millisecond?: number) {
    const cur = getHMS(this.ms);
    const m = minute;
    const s = second ?? cur.second;
    const ms = millisecond ?? cur.millisecond;
    const days = Math.floor(this.ms / MS_PER_DAY);
    this.ms = days * MS_PER_DAY + timeToMs(cur.hour, m, s, ms);
    return this;
  }

  protected getSecond() {
    return Math.floor((this.getMsOfDay() % MS_PER_MINUTE) / MS_PER_SECOND);
  }

  protected setSecond(second: number, millisecond?: number) {
    const cur = getHMS(this.ms);
    const s = second;
    const ms = millisecond ?? cur.millisecond;
    const days = Math.floor(this.ms / MS_PER_DAY);
    this.ms = days * MS_PER_DAY + timeToMs(cur.hour, cur.minute, s, ms);
    return this;
  }

  protected getMillisecond() {
    return this.getMsOfDay() % MS_PER_SECOND;
  }

  protected setMillisecond(millisecond: number) {
    const cur = getHMS(this.ms);
    const days = Math.floor(this.ms / MS_PER_DAY);
    this.ms = days * MS_PER_DAY + timeToMs(cur.hour, cur.minute, cur.second, millisecond);
    return this;
  }

  protected toString(pattern: string | ((parts: ReturnType<typeof getAll>) => string) = "") {
    const v = getAll(this.ms);
    if (typeof pattern === "function") {
      return pattern(v);
    }
    return pattern
      .replace(/yyyy/g, String(v.year))
      .replace(/yy/g, slice(pad(v.year)))
      .replace(/MM/g, pad(v.month))
      .replace(/M/g, String(v.month))
      .replace(/dd/g, pad(v.day))
      .replace(/d/g, String(v.day))
      .replace(/hh/g, pad(v.hour))
      .replace(/h/g, String(v.hour))
      .replace(/mm/g, pad(v.minute))
      .replace(/m/g, String(v.minute))
      .replace(/ss/g, pad(v.second))
      .replace(/s/g, String(v.second))
      .replace(/SSS/g, pad(v.millisecond, 3))
      .replace(/S/g, String(v.millisecond))
      .replace(/W/g, String(WEEK.ja_s[v.week]));
  }

  public toISOString() {
    const v = getAll(this.ms + this.offset);
    return `${v.year}-${pad(v.month)}-${pad(v.day)}T${pad(v.hour)}:${pad(v.minute)}:${pad(v.second)}.${pad(v.millisecond, 3)}Z`;
  }

  public toJSON() {
    return this.toISOString();
  }

  protected addYear(diff: number) {
    this.setYear(this.getYear() + diff);
    return this;
  }

  protected addMonth(diff: number) {
    this.setMonth(this.getMonth() + diff);
    return this;
  }

  protected addDay(diff: number) {
    this.setDay(this.getDay() + diff);
    return this;
  }

  protected addHour(diff: number) {
    this.setHour(this.getHour() + diff);
    return this;
  }

  protected addMinute(diff: number) {
    this.setMinute(this.getMinute() + diff);
    return this;
  }

  protected addSecond(diff: number) {
    this.setSecond(this.getSecond() + diff);
    return this;
  }

  protected addMillisecond(diff: number) {
    this.setMillisecond(this.getMillisecond() + diff);
    return this;
  }

  protected moveFirstDay() {
    this.setDay(1);
    return this;
  }

  protected moveLastDay() {
    this.setMonth(this.getMonth() + 1);
    this.setDay(0);
    return this;
  }

  protected removeTime() {
    this.setHour(0, 0, 0, 0);
    return this;
  }

};

export class $Date extends Timestamp {

  constructor(init?: Timestamp | Date | string | number) {
    super(init);
    this.removeTime();
  }

  public setNow() {
    super.setNow();
    this.removeTime();
  }

  protected getAll() {
    return {
      ...getYMD(this.ms),
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    } as const;
  };

  public getYear() {
    return super.getYear();
  }

  public setYear(year: number, month?: number, day?: number) {
    super.setYear(year, month, day);
    return this;
  }

  public getMonth() {
    return super.getMonth();
  }

  public setMonth(month: number, day?: number) {
    super.setMonth(month, day);
    return this;
  }

  public getDay() {
    return super.getDay();
  }

  public setDay(day: number) {
    super.setDay(day);
    return this;
  }

  public getWeek(): number {
    return super.getWeek();
  }

  public toString(pattern: string | ((parts: ReturnType<typeof getAll>) => string) = "yyyy/MM/dd") {
    return super.toString(pattern);
  };

  public addYear(diff: number): this {
    super.addYear(diff);
    return this;
  }

  public addMonth(diff: number): this {
    super.addMonth(diff);
    return this;
  }

  public moveFirstDay(): this {
    super.moveFirstDay();
    return this;
  }

  public moveLastDay(): this {
    super.moveLastDay();
    return this;
  }

  public isBefore(after: Timestamp) {
    return compareTimestampDate(this, after) < 0;
  }

  public isAfter(before: Timestamp) {
    return compareTimestampDate(this, before) > 0;
  }

  public isEqual(same: Timestamp) {
    return compareTimestampDate(this, same) === 0;
  }

  public isBeforeYearMonth(after: Timestamp) {
    return compareTimestampMonth(this, after) < 0;
  }

  public isAfterYearMonth(before: Timestamp) {
    return compareTimestampMonth(this, before) > 0;
  }

  public isEqualYearMonth(same: Timestamp) {
    return compareTimestampMonth(this, same) === 0;
  }

};

export class $Month extends Timestamp {

  constructor(init?: Timestamp | Date | string | number) {
    super(init);
    this.setDay(1).removeTime();
  }

  public setNow() {
    super.setNow();
    this.setDay(1).removeTime();
  }

  public getAll() {
    return {
      ...getYMD(this.ms),
      day: 0,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    } as const;
  }

  public getYear() {
    return super.getYear();
  }

  public setYear(year: number, month?: number, day?: number) {
    super.setYear(year, month, day);
    return this;
  }

  public getMonth() {
    return super.getMonth();
  }

  public setMonth(month: number, day?: number) {
    super.setMonth(month, day);
    return this;
  }

  public toString(pattern: string | ((parts: ReturnType<typeof getAll>) => string) = "yyyy/MM") {
    return super.toString(pattern);
  };

  public addYear(diff: number): this {
    super.addYear(diff);
    return this;
  }

  public addMonth(diff: number): this {
    super.addMonth(diff);
    return this;
  }

  public addDay(diff: number): this {
    super.addDay(diff);
    return this;
  }

  public isBefore(after: Timestamp) {
    return compareTimestampMonth(this, after) < 0;
  }

  public isAfter(before: Timestamp) {
    return compareTimestampMonth(this, before) > 0;
  }

  public isEqual(same: Timestamp) {
    return compareTimestampMonth(this, same) === 0;
  }

};

export class $DateTime extends Timestamp {

  constructor(init?: Timestamp | Date | string | number) {
    super(init);
  }

  public setNow() {
    super.setNow();
  }

  public getAll() {
    return getAll(this.ms);
  }

  public getYear() {
    return super.getYear();
  }

  public setYear(year: number, month?: number, day?: number) {
    super.setYear(year, month, day);
    return this;
  }

  public getMonth() {
    return super.getMonth();
  }

  public setMonth(month: number, day?: number) {
    super.setMonth(month, day);
    return this;
  }

  public getDay() {
    return super.getDay();
  }

  public setDay(day: number) {
    super.setDay(day);
    return this;
  }

  public getWeek(): number {
    return super.getWeek();
  }

  public getHour() {
    return super.getHour();
  }

  public setHour(hour: number, minute?: number, second?: number, millisecond?: number) {
    super.setHour(hour, minute, second, millisecond);
    return this;
  }

  public getMinute() {
    return super.getMinute();
  }

  public setMinute(minute: number, second?: number, millisecond?: number) {
    super.setMinute(minute, second, millisecond);
    return this;
  }

  public getSecond() {
    return super.getSecond();
  }

  public setSecond(second: number, millisecond?: number) {
    super.setSecond(second, millisecond);
    return this;
  }

  public getMillisecond() {
    return super.getMillisecond();
  }

  public setMillisecond(millisecond: number) {
    super.setMillisecond(millisecond);
    return this;
  }

  public toString(pattern: string | ((parts: ReturnType<typeof getAll>) => string) = "yyyy/MM/dd hh:mm:ss") {
    return super.toString(pattern);
  };

  public toDateString() {
    return super.toString("yyyy/MM/dd");
  }

  public toTimeString() {
    return super.toString("hh:mm:ss");
  }

  public addYear(diff: number): this {
    super.addYear(diff);
    return this;
  }

  public addMonth(diff: number): this {
    super.addMonth(diff);
    return this;
  }

  public addDay(diff: number): this {
    super.addDay(diff);
    return this;
  }

  public addHour(diff: number): this {
    super.addHour(diff);
    return this;
  }

  public addMinute(diff: number): this {
    super.addMinute(diff);
    return this;
  }

  public addSecond(diff: number): this {
    super.addSecond(diff);
    return this;
  }

  public addMillisecond(diff: number): this {
    super.addMillisecond(diff);
    return this;
  }

  public moveFirstDay(): this {
    super.moveFirstDay();
    return this;
  }

  public moveLastDay(): this {
    super.moveLastDay();
    return this;
  }

  public removeTime(): this {
    super.removeTime();
    return this;
  }

  public isBefore(after: Timestamp) {
    return compareTimestampMs(this, after) < 0;
  }

  public isAfter(before: Timestamp) {
    return compareTimestampMs(this, before) > 0;
  }

  public isEqual(same: Timestamp) {
    return compareTimestampMs(this, same) === 0;
  };

  public isBeforeDate(after: Timestamp) {
    return compareTimestampDate(this, after) < 0;
  }

  public isAfterDate(before: Timestamp) {
    return compareTimestampDate(this, before) > 0;
  }

  public isEqualDate(same: Timestamp) {
    return compareTimestampDate(this, same) === 0;
  }

  public isBeforeYearMonth(after: Timestamp) {
    return compareTimestampMonth(this, after) < 0;
  }

  public isAfterYearMonth(before: Timestamp) {
    return compareTimestampMonth(this, before) > 0;
  }

  public isEqualYearMonth(same: Timestamp) {
    return compareTimestampMonth(this, same) === 0;
  }

  public isBeforeTime(after: Timestamp) {
    return compareTimestampTime(this, after) < 0;
  }

  public isAfterTime(before: Timestamp) {
    return compareTimestampTime(this, before) > 0;
  }

  public isEqualTime(same: Timestamp) {
    return compareTimestampTime(this, same) === 0;
  }

};

export class $Time {

  constructor() {

  }

};
