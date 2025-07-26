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
  | "America/Los_Angeles"
  ;

const TIME_ZONE_OFFSET = {
  "Z": 0,
  "UTC": 0,
  "Asia/Tokyo": -540,
  "America/Los_Angeles": 480,
} satisfies Partial<Record<TimeZone, number>>;

export function parseTimezoneOffset(tz: TimeZone | TimeZoneOffset) {
  const a = tz.match(/^(\+|-)(\d{1,2})[:]?(\d{1,2})/);
  if (a) return (Number(a[2] || 0) * 60 + Number(a[3] || 0)) * (a[1] === "-" ? 1 : -1);
  return TIME_ZONE_OFFSET[tz as TimeZone] ?? 0;
};

export function parseOffsetString(offset: number) {
  if (offset === 0) return "Z";
  const o = Math.abs(offset);
  const h = Math.floor(o / 60);
  return `${offset > 0 ? "-" : "+"}${`00${h}`.slice(-2)}:${`00${o - (h * 60)}`.slice(-2)}`;
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
    throw new Error(`Invalid date string: ${value}`);
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

const env_tz = typeof process === "undefined" ? undefined : process.env.TZ?.trim() as TimeZone | TimeZoneOffset | undefined;
const env_offset = env_tz ? parseTimezoneOffset(env_tz) : new Date().getTimezoneOffset();

export class DateTime {

  private date: Date;
  private offset: number;

  public static now(timezone?: number | TimeZone | TimeZoneOffset) {
    return new DateTime(undefined, timezone);
  }

  constructor(
    datetime?: string | number | Date | DateTime | null | undefined,
    timezone?: number | TimeZone | TimeZoneOffset
  ) {
    this.date = new Date();
    this.offset = this.date.getTimezoneOffset();
    this.set(datetime, timezone ?? env_offset);
  }

  public set(
    datetime: string | number | Date | DateTime | null | undefined,
    timezone?: number | TimeZone | TimeZoneOffset
  ) {
    const offset = (() => {
      if (timezone == null) return this.offset;
      if (typeof timezone === "number") return timezone;
      return parseTimezoneOffset(timezone);
    })();

    if (datetime == null) {
      this.date.setTime(Date.now() - (offset - this.date.getTimezoneOffset()) * 60000);
    } else if (datetime instanceof DateTime) {
      this.date.setTime(datetime.getTime() - (-datetime.getTimezoneOffset()) * 60000);
    } else if (datetime instanceof Date) {
      this.date.setTime(datetime.getTime() - (offset - datetime.getTimezoneOffset()) * 60000);
    } else {
      if (typeof datetime === "number") {
        this.date.setTime(datetime + this.date.getTimezoneOffset() * 60000);
      } else {
        const a = datetime.match(/^(\d{1,4})[-|/|年]?(\d{1,2}|$)[-|/|月]?(\d{1,2}|$)[日]?[\s|T]?(\d{1,2}|$)[:]?(\d{1,2}|$)[:]?(\d{1,2}|$)[.]?(\d{0,3}|$)?(.*)/);
        if (a) {
          const tz = a[8];
          const d = new Date(
            Number(a[1]),
            Number(a[2] || 1) - 1,
            Number(a[3] || 1),
            Number(a[4] || 0),
            Number(a[5] || 0),
            Number(a[6] || 0),
            Number(a[7] || 0)
          );
          if (!tz) {
            this.date.setTime(d.getTime());
          } else {
            this.date.setTime(d.getTime() - (offset - parseTimezoneOffset(tz as TimeZone)) * 60000);
          }
        } else {
          throw new Error(`Invalid date format: ${datetime}`);
        }
      }
    }
    this.offset = offset;
    return this;
  }

  public setDateTime({ date, time, timeUnit, timezone }: {
    date: string | Date | number;
    time?: number | null | undefined;
    timeUnit?: "h" | "m" | "s" | "S";
    timezone?: TimeZone | number;
  }) {
    this.set(date);
    this.removeTime();
    if (time != null) {
      switch (timeUnit) {
        case "S":
          this.setMilliseconds(time);
          break;
        case "s":
          this.setSeconds(time);
          break;
        case "m":
          this.setMinutes(time);
          break;
        case "h":
          this.setHours(time);
          break;
        default:
          this.setMinutes(time);
          break;
      }
    }
    if (timezone != null) {
      this.offset = typeof timezone === "number" ? timezone : parseTimezoneOffset(timezone);
    }
    return this;
  }

  public getCloneDate() {
    return new Date(this.date.getTime());
  }

  public static timezoneOffset() {
    return new Date().getTimezoneOffset();
  }

  public static timezone() {
    return parseOffsetString(DateTime.timezoneOffset());
  }

  public getTimezoneOffset() {
    return this.offset;
  }

  public setTimezoneOffset(offset: number) {
    if (this.offset === offset) return this;
    const diff = (this.offset - offset) * 60000;
    this.offset = offset;
    this.date.setTime(this.date.getTime() + diff);
    return this;
  }

  public getTimezone() {
    return parseOffsetString(this.offset);
  }

  public setTimezone(tz: TimeZone) {
    return this.setTimezoneOffset(parseTimezoneOffset(tz));
  }

  public replaceTimezoneOffset(offset: number) {
    this.offset = offset;
    return this;
  }

  public replaceTimezone(tz: TimeZone) {
    return this.replaceTimezoneOffset(parseTimezoneOffset(tz));
  }

  public setDefaultTimezone() {
    this.setTimezoneOffset(this.date.getTimezoneOffset());
  }

  public getTime() {
    return this.date.getTime();
  }

  public getUTCTime() {
    return this.evacuateOffset(() => this.getTime());
  }

  public toString(pattern: string = "yyyy-MM-ddThh:mm:ss.SSSt", week?: Array<string>) {
    return formatDate(this.date, pattern, week)?.replace(/t/g, this.getTimezone()) || "";
  }

  private evacuateOffset<T>(func: () => T) {
    const o = this.offset;
    this.setTimezoneOffset(0);
    const r = func();
    this.setTimezoneOffset(o);
    return r;
  }

  public toISOString() {
    return this.evacuateOffset(() => this.toString());
  }

  public toDateString() {
    return this.toString("yyyy-MM-dd");
  }

  public toTimeString() {
    return this.toString("hh:mm:ss");
  }

  public toJSON() {
    return this.toISOString();
  }

  public setCurrent(removeTime = false) {
    this.set(null);
    if (removeTime) this.removeTime();
    return this;
  }

  public getFullYear() {
    return this.date.getFullYear();
  }

  public setFullYear(year: number, month?: number, date?: number) {
    this.date.setFullYear(year, month ?? this.getMonth(), date ?? this.getDate());
    return this;
  }

  public getUTCFullYear() {
    return this.evacuateOffset(() => this.getFullYear());
  }

  public setUTCFullYear(year: number, month?: number, date?: number) {
    return this.evacuateOffset(() => this.setFullYear(year, month, date));
  }

  public getMonth() {
    return this.date.getMonth();
  }

  public setMonth(month: number, date?: number) {
    this.date.setMonth(month, date ?? this.getDate());
    return this;
  }

  public getUTCMonth() {
    return this.evacuateOffset(() => this.getMonth());
  }

  public setUTCMonth(month: number, date?: number) {
    return this.evacuateOffset(() => this.setMonth(month, date));
  }

  public getDate() {
    return this.date.getDate();
  }

  public setDate(date: number) {
    this.date.setDate(date);
    return this;
  }

  public getUTCDate() {
    return this.evacuateOffset(() => this.getDate());
  }

  public setUTCDate(date: number) {
    return this.evacuateOffset(() => this.setDate(date));
  }

  public getDay() {
    return this.date.getDay();
  }

  public getUTCDay() {
    return this.evacuateOffset(() => this.getDay());
  }

  public getHours() {
    return this.date.getHours();
  }

  public setHours(hours: number, min?: number, sec?: number, ms?: number) {
    this.date.setHours(hours, min ?? this.getMinutes(), sec ?? this.getSeconds(), ms ?? this.getMilliseconds());
    return this;
  }

  public getUTCHours() {
    return this.evacuateOffset(() => this.getHours());
  }

  public setUTCHours(hours: number, min?: number, sec?: number, ms?: number) {
    return this.evacuateOffset(() => this.setHours(hours, min, sec, ms));
  }

  public getMinutes() {
    return this.date.getMinutes();
  }

  public setMinutes(min: number, sec?: number, ms?: number) {
    this.date.setMinutes(min, sec ?? this.getSeconds(), ms ?? this.getMilliseconds());
    return this;
  }

  public getUTCMinutes() {
    return this.evacuateOffset(() => this.getMinutes());
  }

  public setUTCMinutes(min: number, sec?: number, ms?: number) {
    return this.evacuateOffset(() => this.setMinutes(min, sec, ms));
  }

  public getSeconds() {
    return this.date.getSeconds();
  }

  public setSeconds(sec: number, ms?: number) {
    this.date.setSeconds(sec, ms ?? this.getMilliseconds());
    return this;
  }

  public getUTCSeconds() {
    return this.evacuateOffset(() => this.getSeconds());
  }

  public setUTCSeconds(sec: number, ms?: number) {
    return this.evacuateOffset(() => this.setSeconds(sec, ms));
  }

  public getMilliseconds() {
    return this.date.getMilliseconds();
  }

  public setMilliseconds(ms: number) {
    this.date.setMilliseconds(ms);
    return this;
  }

  public getUTCMilliseconds() {
    return this.evacuateOffset(() => this.getMilliseconds());
  }

  public setUTCMilliseconds(ms: number) {
    return this.evacuateOffset(() => this.setMilliseconds(ms));
  }

  public removeTime() {
    this.date.setHours(0, 0, 0, 0);
    return this;
  }

  public addYear(num: number) {
    const d = this.getDate();
    this.setFullYear(this.getFullYear() + num);
    if (d !== this.getDate()) this.date.setDate(0);
    return this;
  }

  public addMonth(num: number) {
    const d = this.getDate();
    this.setMonth(this.getMonth() + num);
    if (d !== this.getDate()) this.date.setDate(0);
    return this;
  }

  public addDate(num: number) {
    this.setDate(this.getDate() + num);
    return this;
  }

  public addHours(num: number) {
    this.setHours(this.getHours() + num);
    return this;
  }

  public addMin(num: number) {
    this.setMinutes(this.getMinutes() + num);
    return this;
  }

  public addSec(num: number) {
    this.setSeconds(this.getSeconds() + num);
    return this;
  }

  public addMs(num: number) {
    this.setMilliseconds(this.getMilliseconds() + num);
    return this;
  }

  public setFirstDateAtYear() {
    this.date.setMonth(0, 1);
    return this;
  }

  public setLastDateAtYear() {
    this.date.setFullYear(this.getFullYear() + 1, 0, 0);
    return this;
  }

  public setFirstDateAtMonth() {
    this.setDate(1);
    return this;
  }

  public setLastDateAtMonth() {
    this.date.setMonth(this.getMonth() + 1, 0);
    return this;
  }

  public setPrevWeek() {
    return this.addDate(-7);
  }

  public setNextWeek() {
    return this.addDate(7);
  }

  public setPrevYear() {
    return this.addYear(-1);
  }

  public setNextYear() {
    return this.addYear(1);
  }

  public setPrevMonth() {
    return this.addMonth(-1);
  }

  public setNextMonth() {
    return this.addMonth(1);
  }

};

export function addDay(date: Date, num: number) {
  date.setDate(date.getDate() + num);
  return date;
}

export function addMonth(date: Date, num: number) {
  const d = date.getDate();
  date.setMonth(date.getMonth() + num);
  if (d !== date.getDate()) date.setDate(0);
  return date;
}

export function addYear(date: Date, num: number) {
  const d = date.getDate();
  date.setFullYear(date.getFullYear() + num);
  if (d !== date.getDate()) date.setDate(0);
  return date;
}

export function getFirstDateAtMonth(date = new Date()) {
  return new DateTime(date).setFirstDateAtMonth().getCloneDate();
}

export function getLastDateAtMonth(date = new Date()) {
  return new DateTime(date).setLastDateAtMonth().getCloneDate();
}

export function getFirstDateAtYear(date = new Date()) {
  return new DateTime(date).setFirstDateAtYear().getCloneDate();
}

export function getLastDateAtYear(date = new Date()) {
  return new DateTime(date).setLastDateAtYear().getCloneDate();
}

export function getPrevDate(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
}

export function getNextDate(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}

export function getPrevWeekDate(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7);
}

export function getNextWeekDate(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7);
}

export function getPrevMonthDate(date = new Date()) {
  return new DateTime(date).setPrevMonth().getCloneDate();
}

export function getNextMonthDate(date = new Date()) {
  return new DateTime(date).setNextMonth().getCloneDate();
}

export function getPrevYearDate(date = new Date()) {
  return new DateTime(date).setPrevYear().getCloneDate();
}

export function getNextYearDate(date = new Date()) {
  return new DateTime(date).setNextYear().getCloneDate();
}
