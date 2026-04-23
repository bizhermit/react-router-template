import { getValue } from "$/shared/objects/data";
import { parseNumber } from "$/shared/objects/numeric";
import { $Date, $DateTime, $Time } from "$/shared/objects/timestamp";
import { getSchemaItemPropsGenerator, getValidationArray, getValidationArrayAsArray } from ".";

export const SCHEMA_ITEM_TYPE_DATETIME = "datetime";

type DateTimePair = {
  name: string;
  position: "before" | "after";
  disallowSame?: boolean;
  basis?: "datetime" | "date" | "month";
};

type DateTimeValidation_MinDateTimeParams = { minDateTime: $DateTime; };
type DateTimeValidation_MaxDateTimeParams = { maxDateTime: $DateTime; };
type DateTimeValidation_MinDateParams = { minDate: $Date; };
type DateTimeValidation_MaxDateParams = { maxDate: $Date; };
type DateTimeValidation_MinTimeParams = { minTime: $Time; };
type DateTimeValidation_MaxTimeParams = { maxTime: $Time; };
type DateTimeValidation_PairParams = Omit<Required<DateTimePair>, "name"> & { pairName: string; pairDateTime: $DateTime; };

type DateTimeValidationAbstractMessage = $Schema.AbstractMessage & {
  otype: typeof SCHEMA_ITEM_TYPE_DATETIME;
};
export type DateTimeValidationMessage = DateTimeValidationAbstractMessage & (
  | { code: "parse"; }
  | { code: "required"; }
  | ({ code: "minDateTime"; } & DateTimeValidation_MinDateTimeParams)
  | ({ code: "maxDateTime"; } & DateTimeValidation_MaxDateTimeParams)
  | ({ code: "minDate"; } & DateTimeValidation_MinDateParams)
  | ({ code: "maxDate"; } & DateTimeValidation_MaxDateParams)
  | ({ code: "minTime"; } & DateTimeValidation_MinTimeParams)
  | ({ code: "maxTime"; } & DateTimeValidation_MaxTimeParams)
  | ({ code: "pair"; } & DateTimeValidation_PairParams)
);

type DateTimeOptions = {
  parser?: $Schema.Parser<$DateTime>;
  timeBasis?: "minute" | "hour" | "second";
  required?: $Schema.Validation<$Schema.Nullable<$DateTime>, boolean, undefined, DateTimeValidationMessage>;
  minDateTime?: $Schema.Validation<
    $DateTime,
    $DateTime,
    DateTimeValidation_MinDateTimeParams,
    DateTimeValidationMessage
  >;
  maxDateTime?: $Schema.Validation<
    $DateTime,
    $DateTime,
    DateTimeValidation_MaxDateTimeParams,
    DateTimeValidationMessage
  >;
  minDate?: $Schema.Validation<$DateTime, $Date, DateTimeValidation_MinDateParams, DateTimeValidationMessage>;
  maxDate?: $Schema.Validation<$DateTime, $Date, DateTimeValidation_MaxDateParams, DateTimeValidationMessage>;
  minTime?: $Schema.Validation<$DateTime, $Time, DateTimeValidation_MinTimeParams, DateTimeValidationMessage>;
  maxTime?: $Schema.Validation<$DateTime, $Time, DateTimeValidation_MaxTimeParams, DateTimeValidationMessage>;
  pairs?: $Schema.Validation<
    $DateTime,
    DateTimePair | DateTimePair[],
    DateTimeValidation_PairParams,
    DateTimeValidationMessage
  >;
  rules?: $Schema.Rule<$DateTime>[];
};

type DateTimeProps = $Schema.SchemaItemAbstractProps & DateTimeOptions;

const SCHEMA_ITEM_TYPE_SPLIT_DATETIME = `${SCHEMA_ITEM_TYPE_DATETIME}-s`;

type SplitDateTimeValidation_MinParams = { min: number; };
type SplitDateTimeValidation_MaxParams = { max: number; };

export type SplitDateTimeValidationAbstractMessage = $Schema.AbstractMessage & {
  otype: typeof SCHEMA_ITEM_TYPE_SPLIT_DATETIME;
};
export type SplitDateTimeValidationMessage = SplitDateTimeValidationAbstractMessage & (
  | { code: "parse"; }
  | { code: "required"; }
  | ({ code: "min"; } | SplitDateTimeValidation_MinParams)
  | ({ code: "max"; } | SplitDateTimeValidation_MaxParams)
);

type SplitDateTimeOptions = {
  parser?: $Schema.Parser<number>;
  required?: $Schema.Validation<$Schema.Nullable<number>, boolean | "inherit", undefined, SplitDateTimeValidationMessage>;
  min?: $Schema.Validation<number, number | "inherit", SplitDateTimeValidation_MinParams, SplitDateTimeValidationMessage>;
  max?: $Schema.Validation<number, number | "inherit", SplitDateTimeValidation_MaxParams, SplitDateTimeValidationMessage>;
  rules?: $Schema.Rule<number>[];
};

type SplitDateTimeProps = $Schema.SchemaItemAbstractProps & SplitDateTimeOptions;

type SplitDateTimeBaseProps = Pick<
  DateTimeProps & $Schema.SchemaItemInterfaceProps<$Date, DateTimeValidationAbstractMessage>,
  "required" | "minDateTime" | "maxDateTime" | "minDate" | "maxDate" | "minTime" | "maxTime" | "getActionType"
>;

function splitDateTime<const Base extends SplitDateTimeBaseProps>(base: {
  getThis: () => Base;
  isValidMin: (params: {
    value: number;
    validationDateTime: () => ($DateTime | null);
    validationDate: () => ($Date | null);
    validationTime: () => ($Time | null);
  }) => [boolean, number];
  isValidMax: (params: {
    value: number;
    validationDateTime: () => ($DateTime | null);
    validationDate: () => ($Date | null);
    validationTime: () => ($Time | null);
  }) => [boolean, number];
}) {
  return function <const SP extends SplitDateTimeProps>(splitProps: SP = {} as SP) {
    type Required = $Schema.ValidationArray<SP["required"]>[0] extends boolean
      ? SP["required"]
      : $Schema.ValidationArray<Base["required"]>;

    return {
      ...splitProps,
      type: SCHEMA_ITEM_TYPE_SPLIT_DATETIME,
      required: splitProps.required as Required,
      _validators: null,
      getActionType: function () {
        return this.actionType || base.getThis().getActionType();
      },
      getCommonTypeMessageParams: function () {
        return {
          otype: SCHEMA_ITEM_TYPE_SPLIT_DATETIME,
          label: this.label,
          type: "e",
          actionType: this.getActionType(),
        } as const;
      },
      parse: function (params) {
        if (this.parser) return this.parser(params);
        const [num, succeeded] = parseNumber(params.value);
        if (succeeded) return { value: num };
        return {
          value: num,
          message: {
            ...this.getCommonTypeMessageParams(),
            code: "parse",
          },
        };
      },
      validate: function (params) {
        if (this._validators == null) {
          this._validators = [];
          const commonMsgParams = this.getCommonTypeMessageParams();

          // required
          const [required, getRequiredMessage] = getValidationArray(this.required, "inherit");
          if (required) {
            const getMessage: $Schema.ValidationMessageGetter<typeof getRequiredMessage> =
              getRequiredMessage ??
              (() => ({
                ...commonMsgParams,
                code: "required",
              }));

            if (typeof required === "function") {
              this._validators.push((p) => {
                const r = required(p);
                if (!r) return null;
                if (r === "inherit") {
                  const [baseRequired] = getValidationArray(base.getThis().required);
                  if (baseRequired) {
                    if (typeof baseRequired === "function") {
                      if (!baseRequired(p)) return null;
                      if (p.value == null) {
                        return getMessage(p);
                      }
                    } else {
                      if (p.value == null) {
                        return getMessage(p);
                      }
                    }
                  }
                  return null;
                }
                if (p.value == null) {
                  return getMessage(p);
                }
                return null;
              });
            } else {
              if (required === "inherit") {
                const [baseRequired] = getValidationArray(base.getThis().required);
                if (baseRequired) {
                  if (typeof baseRequired === "function") {
                    this._validators.push((p) => {
                      if (!baseRequired(p)) return null;
                      if (p.value == null) {
                        return getMessage(p);
                      }
                      return null;
                    });
                  } else {
                    this._validators.push((p) => {
                      if (p.value == null) {
                        return getMessage(p);
                      }
                      return null;
                    });
                  }
                }
              } else {
                this._validators.push((p) => {
                  if (p.value == null) {
                    return getMessage(p);
                  }
                  return null;
                });
              }
            }
          }

          // min
          const [min, getMinMessage] = getValidationArray(this.min, "inherit");
          if (min != null) {
            const getMessage: $Schema.ValidationMessageGetter<typeof getMinMessage> =
              getMinMessage ??
              ((p) => ({
                ...commonMsgParams,
                code: "min",
                ...p,
              }));

            if (typeof min === "function") {
              this._validators.push((p) => {
                if (p.value == null) return null;
                const m = min(p);
                if (m == null) return null;
                if (m === "inherit") {
                  const [baseMin] = getValidationArray(base.getThis().minDate);
                  if (baseMin != null) {
                    if (typeof baseMin === "function") {
                      if (p.value == null) return null;
                      const m = baseMin(p);
                      if (m == null) return null;
                      const ret = base.isValidMin({
                        value: p.value,
                        // validationDateTime: m
                        validationDateTime: () => {
                          // TODO:
                          return null;
                        },
                        validationDate: () => {
                          // TODO:
                          return null;
                        },
                        validationTime: () => {
                          // TODO:
                          return null;
                        },
                      });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p,
                        min: ret[1],
                      });
                    } else {
                      if (p.value == null) return null;
                      const ret = base.isValidMin({
                        value: p.value,
                        //  validationDateTime: baseMin
                        validationDateTime: () => {
                          // TODO:
                          return null;
                        },
                        validationDate: () => {
                          // TODO:
                          return null;
                        },
                        validationTime: () => {
                          // TODO:
                          return null;
                        },
                      });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p,
                        min: ret[1],
                      });
                    }
                  }
                  return null;
                }
                if (m <= p.value) return null;
                return getMessage({
                  ...p,
                  min: m,
                });
              });
            } else {
              if (min === "inherit") {
                const [baseMin] = getValidationArray(base.getThis().minDate);
                if (baseMin != null) {
                  if (typeof baseMin === "function") {
                    this._validators.push((p) => {
                      if (p.value == null) return null;
                      const m = baseMin(p);
                      if (m == null) return null;
                      const ret = base.isValidMin({
                        value: p.value,
                        // validationDateTime: m,
                        validationDateTime: () => {
                          // TODO:
                          return null;
                        },
                        validationDate: () => {
                          // TODO:
                          return null;
                        },
                        validationTime: () => {
                          // TODO:
                          return null;
                        },
                      });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p,
                        min: ret[1],
                      });
                    });
                  } else {
                    this._validators.push((p) => {
                      if (p.value == null) return null;
                      const ret = base.isValidMin({
                        value: p.value,
                        // validationDateTime: baseMin
                        validationDateTime: () => {
                          // TODO:
                          return null;
                        },
                        validationDate: () => {
                          // TODO:
                          return null;
                        },
                        validationTime: () => {
                          // TODO:
                          return null;
                        },
                      });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p,
                        min: ret[1],
                      });
                    });
                  }
                }
              } else {
                this._validators.push((p) => {
                  if (p.value == null) return null;
                  if (min <= p.value) return null;
                  return getMessage({
                    ...p,
                    min,
                  });
                });
              }
            }
          }

          // max
          const [max, getMaxMessage] = getValidationArray(this.max, "inherit");
          if (max != null) {
            const getMessage: $Schema.ValidationMessageGetter<typeof getMaxMessage> =
              getMaxMessage ??
              ((p) => ({
                ...commonMsgParams,
                code: "max",
                ...p,
              }));

            if (typeof max === "function") {
              this._validators.push((p) => {
                if (p.value == null) return null;
                const m = max(p);
                if (m == null) return null;
                if (m === "inherit") {
                  const [baseMax] = getValidationArray(base.getThis().maxDate);
                  if (baseMax != null) {
                    if (typeof baseMax === "function") {
                      if (p.value == null) return null;
                      const m = baseMax(p);
                      if (m == null) return null;
                      const ret = base.isValidMax({
                        value: p.value,
                        // validationDateTime: m,
                        validationDateTime: () => {
                          // TODO:
                          return null;
                        },
                        validationDate: () => {
                          // TODO:
                          return null;
                        },
                        validationTime: () => {
                          // TODO:
                          return null;
                        },
                      });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p,
                        max: ret[1],
                      });
                    } else {
                      if (p.value == null) return null;
                      const ret = base.isValidMax({
                        value: p.value,
                        // validationDateTime: baseMax,
                        validationDateTime: () => {
                          // TODO:
                          return null;
                        },
                        validationDate: () => {
                          // TODO:
                          return null;
                        },
                        validationTime: () => {
                          // TODO:
                          return null;
                        },
                      });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p,
                        max: ret[1],
                      });
                    }
                  }
                  return null;
                }
                if (p.value <= m) return null;
                return getMessage({
                  ...p,
                  max: m,
                });
              });
            } else {
              if (max === "inherit") {
                const [baseMax] = getValidationArray(base.getThis().maxDate);
                if (baseMax != null) {
                  if (typeof baseMax === "function") {
                    this._validators.push((p) => {
                      if (p.value == null) return null;
                      const m = baseMax(p);
                      if (m == null) return null;
                      const ret = base.isValidMax({
                        value: p.value,
                        // validationDateTime: m,
                        validationDateTime: () => {
                          // TODO:
                          return null;
                        },
                        validationDate: () => {
                          // TODO:
                          return null;
                        },
                        validationTime: () => {
                          // TODO:
                          return null;
                        },
                      });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p,
                        max: ret[1],
                      });
                    });
                  } else {
                    this._validators.push((p) => {
                      if (p.value == null) return null;
                      const ret = base.isValidMax({
                        value: p.value,
                        // validationDateTime: baseMax,
                        validationDateTime: () => {
                          // TODO:
                          return null;
                        },
                        validationDate: () => {
                          // TODO:
                          return null;
                        },
                        validationTime: () => {
                          // TODO:
                          return null;
                        },
                      });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p,
                        max: ret[1],
                      });
                    });
                  }
                }
              } else {
                this._validators.push((p) => {
                  if (p.value == null) return null;
                  if (p.value <= max) return null;
                  return getMessage({
                    ...p,
                    max,
                  });
                });
              }
            }
          }

          // rules
          if (this.rules) {
            this._validators.push(...this.rules);
          }
        }

        let msg: $Schema.Message | null = null;
        for (const vali of this._validators) {
          msg = vali(params);
          if (msg) break;
        }
        return msg;
      },
    } as const satisfies SplitDateTimeProps & $Schema.SchemaItemInterfaceProps<
      number,
      SplitDateTimeValidationAbstractMessage
    >;
  };
};

export function $datetime<const P extends DateTimeProps>(props: P = {} as P) {
  const fixedProps = {
    type: SCHEMA_ITEM_TYPE_DATETIME,
    _validators: null,
    getActionType: function () {
      return this.actionType || "select";
    },
    getCommonTypeMessageParams: function () {
      return {
        otype: SCHEMA_ITEM_TYPE_DATETIME,
        label: this.label,
        type: "e",
        actionType: this.getActionType(),
      } as const;
    },
    getTimeBasis: function () {
      return this.timeBasis || "minute";
    },
    parse: function (params) {
      if (this.parser) return this.parser(params);
      if (params.value == null || params.value === "") return { value: undefined };
      try {
        const value = new $DateTime(params.value as string);
        return { value };
      } catch {
        return {
          value: null,
          message: {
            ...this.getCommonTypeMessageParams(),
            code: "parse",
          },
        };
      }
    },
    validate: function (params) {
      if (this._validators == null) {
        this._validators = [];
        const commonMsgParams = this.getCommonTypeMessageParams();

        // required
        if (this.required != null) {
          const [required, getRequiredMessage] = getValidationArray(this.required);
          if (required) {
            const getMessage: $Schema.ValidationMessageGetter<typeof getRequiredMessage> =
              getRequiredMessage ??
              (() => ({
                ...commonMsgParams,
                code: "required",
              }));

            if (typeof required === "function") {
              this._validators.push((p) => {
                if (!required(p)) return null;
                if (p.value == null) {
                  return getMessage(p);
                }
                return null;
              });
            } else {
              this._validators.push((p) => {
                if (p.value == null) {
                  return getMessage(p);
                }
                return null;
              });
            }
          }
        }

        // minDateTime
        if (this.minDateTime) {
          const [minDateTime, getMinDateTimeMessage] = getValidationArray(this.minDateTime);
          if (minDateTime != null) {
            const getMessage: $Schema.ValidationMessageGetter<typeof getMinDateTimeMessage> =
              getMinDateTimeMessage ??
              ((p) => ({
                ...commonMsgParams,
                code: "minDateTime",
                ...p,
              }));

            if (typeof minDateTime === "function") {
              this._validators.push((p) => {
                if (p.value == null) return null;
                const m = minDateTime(p);
                if (m == null) return null;
                if (p.value.isBefore(m)) {
                  return getMessage({
                    ...p,
                    minDateTime: m,
                  });
                }
                return null;
              });
            } else {
              this._validators.push((p) => {
                if (p.value == null) return null;
                if (p.value.isBefore(minDateTime)) {
                  return getMessage({
                    ...p,
                    minDateTime,
                  });
                }
                return null;
              });
            }
          }
        }

        // maxDateTime
        if (this.maxDateTime) {
          const [maxDateTime, getMaxDateTimeMessage] = getValidationArray(this.maxDateTime);
          if (maxDateTime != null) {
            const getMessage: $Schema.ValidationMessageGetter<typeof getMaxDateTimeMessage> =
              getMaxDateTimeMessage ??
              ((p) => ({
                ...commonMsgParams,
                code: "maxDateTime",
                ...p,
              }));

            if (typeof maxDateTime === "function") {
              this._validators.push((p) => {
                if (p.value == null) return null;
                const m = maxDateTime(p);
                if (m == null) return null;
                if (p.value.isAfter(m)) {
                  return getMessage({
                    ...p,
                    maxDateTime: m,
                  });
                }
                return null;
              });
            } else {
              this._validators.push((p) => {
                if (p.value == null) return null;
                if (p.value.isAfter(maxDateTime)) {
                  return getMessage({
                    ...p,
                    maxDateTime,
                  });
                }
                return null;
              });
            }
          }
        }

        if (this.minDate) {
          const [minDate, getMinDateMessage] = getValidationArray(this.minDate);
          if (minDate != null) {
            const getMessage: $Schema.ValidationMessageGetter<typeof getMinDateMessage> =
              getMinDateMessage ??
              ((p) => ({
                ...commonMsgParams,
                code: "minDate",
                ...p,
              }));

            if (typeof minDate === "function") {
              this._validators.push((p) => {
                if (p.value == null) return null;
                const m = minDate(p);
                if (m == null) return null;
                if (p.value.isBeforeDate(m)) {
                  return getMessage({
                    ...p,
                    minDate: m,
                  });
                }
                return null;
              });
            } else {
              this._validators.push((p) => {
                if (p.value == null) return null;
                if (p.value.isBeforeDate(minDate)) {
                  return getMessage({
                    ...p,
                    minDate,
                  });
                }
                return null;
              });
            }
          }
        }

        if (this.maxDate) {
          const [maxDate, getMaxDateMessage] = getValidationArray(this.maxDate);
          if (maxDate != null) {
            const getMessage: $Schema.ValidationMessageGetter<typeof getMaxDateMessage> =
              getMaxDateMessage ??
              ((p) => ({
                ...commonMsgParams,
                code: "maxDate",
                ...p,
              }));

            if (typeof maxDate === "function") {
              this._validators.push((p) => {
                if (p.value == null) return null;
                const m = maxDate(p);
                if (m == null) return null;
                if (p.value.isAfterDate(m)) {
                  return getMessage({
                    ...p,
                    maxDate: m,
                  });
                }
                return null;
              });
            } else {
              this._validators.push((p) => {
                if (p.value == null) return null;
                if (p.value.isAfterDate(maxDate)) {
                  return getMessage({
                    ...p,
                    maxDate,
                  });
                }
                return null;
              });
            }
          }
        }

        // TODO:
        // minTime
        // maxTime

        // pair
        if (this.pairs) {
          const [pairs, getPairsMessage] = getValidationArrayAsArray(this.pairs);
          if (pairs) {
            const getMessage: $Schema.ValidationMessageGetter<typeof getPairsMessage> =
              getPairsMessage ??
              ((p) => ({
                ...commonMsgParams,
                code: "pair",
                ...p,
              }));

            if (typeof pairs === "function") {
              this._validators.push((p) => {
                if (p.value == null) return null;
                let ps = pairs(p);
                if (ps == null) return null;
                if (!Array.isArray(ps)) ps = [ps];
                if (ps == null || ps.length === 0) return null;
                for (const pair of ps) {
                  const pairValue = getValue(p.values, p.name, pair.name)[0];
                  if (!pairValue) continue;
                  try {
                    const pairDateTime = new $DateTime(pairValue as string);
                    if (!pair.disallowSame && p.value.isEqual(pairDateTime)) continue;
                    if (pair.position === "after") {
                      if (p.value.isBefore(pairDateTime)) continue;
                    } else {
                      if (p.value.isAfter(pairDateTime)) continue;
                    }
                    return getMessage({
                      ...p,
                      pairName: pair.name,
                      position: pair.position,
                      disallowSame: pair.disallowSame ?? false,
                      pairDateTime,
                      basis: pair.basis || "datetime",
                    });
                  } catch {
                    // ignore
                    continue;
                  }
                }
                return null;
              });
            } else {
              const ps = Array.isArray(pairs) ? pairs : [pairs];
              this._validators.push((p) => {
                if (p.value == null) return null;
                for (const pair of ps) {
                  const pairValue = getValue(p.values, p.name, pair.name)[0];
                  if (!pairValue) continue;
                  try {
                    const pairDateTime = new $DateTime(pairValue as string);
                    if (!pair.disallowSame && p.value.isEqual(pairDateTime)) continue;
                    if (pair.position === "after") {
                      if (p.value.isBefore(pairDateTime)) continue;
                    } else {
                      if (p.value.isAfter(pairDateTime)) continue;
                    }
                    return getMessage({
                      ...p,
                      pairName: pair.name,
                      position: pair.position,
                      disallowSame: pair.disallowSame ?? false,
                      pairDateTime,
                      basis: pair.basis || "datetime",
                    });
                  } catch {
                    // ignore
                    continue;
                  }
                }
                return null;
              });
            }
          }
        }

        // rules
        if (this.rules) {
          this._validators.push(...this.rules);
        }
      }

      let msg: $Schema.Message | null = null;
      for (const vali of this._validators) {
        msg = vali(params);
        if (msg) break;
      }
      return msg;
    },
    getSplitYear: function <
      const This extends SplitDateTimeBaseProps,
      const SP extends SplitDateTimeProps
    >(
      this: This,
      splitProps: SP = {} as SP,
    ) {
      const getBase = () => this;
      return splitDateTime<This>({
        getThis: getBase,
        isValidMin: ({ value, validationDateTime: validationValue }) => {
          // return [
          //   validationValue.getYear() <= value,
          //   validationValue.getYear(),
          // ];
          return [true, -1]; // TODO:
        },
        isValidMax: ({ value, validationDateTime: validationValue }) => {
          // return [
          //   value <= validationValue.getYear(),
          //   validationValue.getYear(),
          // ];
          return [true, -1]; // TODO:
        },
      })<SP>(splitProps);
    },
    getSplitMonth: function <
      const This extends SplitDateTimeBaseProps,
      const SP extends SplitDateTimeProps
    >(
      this: This,
      splitProps: SP = {} as SP,
    ) {
      const getBase = () => this;
      return splitDateTime<This>({
        getThis: getBase,
        isValidMin: ({ value }) => {
          // NOTE: 最小値および年の値によって変動するため、最小日付と比較を行わない
          return [1 <= value, 1];
        },
        isValidMax: ({ value }) => {
          // NOTE: 最小値および年の値によって変動するため、最大日付と比較を行わない
          return [value <= 12, 12];
        },
      })<SP>(splitProps);
    },
    getSplitDay: function <
      const This extends SplitDateTimeBaseProps,
      const SP extends SplitDateTimeProps
    >(
      this: This,
      splitProps: SP = {} as SP,
    ) {
      const getBase = () => this;
      return splitDateTime<This>({
        getThis: getBase,
        isValidMin: ({ value }) => {
          // NOTE: 最小値および年月の値によって変動するため、最小日付と比較を行わない
          return [1 <= value, 1];
        },
        isValidMax: ({ value }) => {
          // NOTE: 最小値および年月の値によって変動するため、最大日付と比較を行わない
          return [value <= 31, 31];
        },
      })<SP>(splitProps);
    },
  } as const satisfies DateTimeProps & $Schema.SchemaItemInterfaceProps<$DateTime, DateTimeValidationAbstractMessage>;

  return getSchemaItemPropsGenerator<typeof fixedProps, DateTimeProps, P>(fixedProps, props)({});
};
