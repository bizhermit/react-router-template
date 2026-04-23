import { getValue } from "$/shared/objects/data";
import { parseNumber } from "$/shared/objects/numeric";
import { $Clock, $Date, $DateTime } from "$/shared/objects/timestamp";
import { getEmptyInjectParams, getSchemaItemPropsGenerator, getValidationArray, getValidationArrayAsArray } from ".";

export const SCHEMA_ITEM_TYPE_DATETIME = "datetime";

type DateTimePair = {
  name: string;
  position: "before" | "after";
  disallowSame?: boolean;
  basis?: "datetime" | "date" | "month";
};

type DateTimeOptions = {
  parser?: $Schema.Parser<$DateTime>;
  timeBasis?: "minute" | "hour" | "second";
  required?: $Schema.ValidationItem<boolean, null | undefined>;
  minDateTime?: $Schema.ValidationItem<$DateTime, $DateTime, { minDateTime: $DateTime; }>;
  maxDateTime?: $Schema.ValidationItem<$DateTime, $DateTime, { maxDateTime: $DateTime; }>;
  minDate?: $Schema.ValidationItem<$Date, $DateTime, { minDate: $Date; }>;
  maxDate?: $Schema.ValidationItem<$Date, $DateTime, { maxDate: $Date; }>;
  minTime?: $Schema.ValidationItem<$Clock, $DateTime, { minTime: $Clock; }>;
  maxTime?: $Schema.ValidationItem<$Clock, $DateTime, { maxTime: $Clock; }>;
  pairs?: $Schema.ValidationItem<
    DateTimePair | DateTimePair[],
    $DateTime,
    Omit<Required<DateTimePair>, "name"> & { pairName: string; pairDateTime: $DateTime; }
  >;
  rules?: $Schema.Rule<$DateTime>[];
};

type DateTimeProps = $Schema.SchemaItemAbstractProps & DateTimeOptions;

const SCHEMA_ITEM_TYPE_SPLIT_DATETIME = `${SCHEMA_ITEM_TYPE_DATETIME}-s`;

type SplitDateTimeOptions = {
  parser?: $Schema.Parser<number>;
  required?: $Schema.ValidationItem<boolean | "inherit", null | undefined>;
  min?: $Schema.ValidationItem<number | "inherit", number, { min: number; }>;
  max?: $Schema.ValidationItem<number | "inherit", number, { max: number; }>;
  rules?: $Schema.Rule<number>[];
};

type SplitDateTimeProps = $Schema.SchemaItemAbstractProps & SplitDateTimeOptions;

type SplitDateTimeBaseProps = Pick<
  DateTimeProps & $Schema.SchemaItemInterfaceProps<$Date>,
  "required" | "minDateTime" | "maxDateTime" | "minDate" | "maxDate" | "minTime" | "maxTime" | "getActionType"
>;

function splitDateTime<const Base extends SplitDateTimeBaseProps>(base: {
  getThis: () => Base;
  isValidMin: (params: {
    value: number;
    getValidationDateTime: () => ($DateTime | null);
    getValidationDate: () => ($Date | null);
    getValidationTime: () => ($Clock | null);
  }) => [boolean, number];
  isValidMax: (params: {
    value: number;
    getValidationDateTime: () => ($DateTime | null);
    getValidationDate: () => ($Date | null);
    getValidationTime: () => ($Clock | null);
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
      parse: function (value, params = getEmptyInjectParams()) {
        if (this.parser) return this.parser(value, params);
        const [num, succeeded] = parseNumber(value);
        if (succeeded) return { value: num };
        return {
          value: num,
          messages: [{
            type: "e",
            label: this.label,
            actionType: this.getActionType(),
            otype: SCHEMA_ITEM_TYPE_SPLIT_DATETIME,
            code: "parse",
            name: params.name,
          }],
        };
      },
      validate: function (value, params = getEmptyInjectParams()) {
        if (this._validators == null) {
          this._validators = [];
          const commonMsgParams = {
            otype: SCHEMA_ITEM_TYPE_SPLIT_DATETIME,
            type: "e",
          } as const satisfies {
            otype: string;
            type: $Schema.AbstractMessage["type"];
          };

          // required
          const [required, getRequiredMessage] = getValidationArray(this.required, "inherit");
          if (required) {
            const getMessage = getRequiredMessage ?? ((p) => ({
              ...commonMsgParams,
              code: "required",
              label: p.label,
              params: p.params,
              name: p.name,
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
                        return getMessage(p as $Schema.ValidationResultArgParams);
                      }
                    } else {
                      if (p.value == null) {
                        return getMessage(p as $Schema.ValidationResultArgParams);
                      }
                    }
                  }
                  return null;
                }
                if (p.value == null) {
                  return getMessage(p as $Schema.ValidationResultArgParams);
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
                        return getMessage(p as $Schema.ValidationResultArgParams);
                      }
                      return null;
                    });
                  } else {
                    this._validators.push((p) => {
                      if (p.value == null) {
                        return getMessage(p as $Schema.ValidationResultArgParams);
                      }
                      return null;
                    });
                  }
                }
              } else {
                this._validators.push((p) => {
                  if (p.value == null) {
                    return getMessage(p as $Schema.ValidationResultArgParams);
                  }
                  return null;
                });
              }
            }
          }

          // min
          const [min, getMinMessage] = getValidationArray(this.min, "inherit");
          if (min != null) {
            const getMessage = getMinMessage ?? ((p) => ({
              ...commonMsgParams,
              code: "min",
              label: p.label,
              params: p.params,
              name: p.name,
            }));

            const getValidationDateTimeGetter = (p: $Schema.RuleArgParams<number>) => {
              return () => {
                const [baseMin] = getValidationArray(base.getThis().minDateTime);
                if (baseMin == null) return null;
                if (typeof baseMin === "function") {
                  const baseM = baseMin(p);
                  if (baseM == null) return null;
                  return baseM;
                }
                return baseMin;
              };
            };
            const getValidationDateGetter = (p: $Schema.RuleArgParams<number>) => {
              return () => {
                const [baseMin] = getValidationArray(base.getThis().minDate);
                if (baseMin == null) return null;
                if (typeof baseMin === "function") {
                  const baseM = baseMin(p);
                  if (baseM == null) return null;
                  return baseM;
                }
                return baseMin;
              };
            };
            const getValidationTimeGetter = (p: $Schema.RuleArgParams<number>) => {
              return () => {
                const [baseMin] = getValidationArray(base.getThis().minTime);
                if (baseMin == null) return null;
                if (typeof baseMin === "function") {
                  const baseM = baseMin(p);
                  if (baseM == null) return null;
                  return baseM;
                }
                return baseMin;
              };
            };

            if (typeof min === "function") {
              this._validators.push((p) => {
                if (p.value == null) return null;
                const m = min(p);
                if (m == null) return null;
                if (m === "inherit") {
                  const ret = base.isValidMin({
                    value: p.value,
                    getValidationDateTime: getValidationDateTimeGetter(p),
                    getValidationDate: getValidationDateGetter(p),
                    getValidationTime: getValidationTimeGetter(p),
                  });
                  if (ret[0]) return null;
                  return getMessage({
                    ...p as $Schema.ValidationResultArgParams<number>,
                    params: {
                      min: ret[1],
                    },
                  });
                }
                if (m <= p.value) return null;
                return getMessage({
                  ...p as $Schema.ValidationResultArgParams<number>,
                  params: {
                    min: m,
                  },
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
                        getValidationDateTime: getValidationDateTimeGetter(p),
                        getValidationDate: getValidationDateGetter(p),
                        getValidationTime: getValidationTimeGetter(p),
                      });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p as $Schema.ValidationResultArgParams<number>,
                        params: {
                          min: ret[1],
                        },
                      });
                    });
                  } else {
                    this._validators.push((p) => {
                      if (p.value == null) return null;
                      const ret = base.isValidMin({
                        value: p.value,
                        getValidationDateTime: getValidationDateTimeGetter(p),
                        getValidationDate: getValidationDateGetter(p),
                        getValidationTime: getValidationTimeGetter(p),
                      });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p as $Schema.ValidationResultArgParams<number>,
                        params: {
                          min: ret[1],
                        },
                      });
                    });
                  }
                }
              } else {
                this._validators.push((p) => {
                  if (p.value == null) return null;
                  if (min <= p.value) return null;
                  return getMessage({
                    ...p as $Schema.ValidationResultArgParams<number>,
                    params: {
                      min,
                    },
                  });
                });
              }
            }
          }

          // max
          const [max, getMaxMessage] = getValidationArray(this.max, "inherit");
          if (max != null) {
            const getMessage = getMaxMessage ?? ((p) => ({
              ...commonMsgParams,
              code: "max",
              label: p.label,
              params: p.params,
              name: p.name,
            }));

            const getValidationDateTimeGetter = (p: $Schema.RuleArgParams<number>) => {
              return () => {
                const [baseMax] = getValidationArray(base.getThis().maxDateTime);
                if (baseMax == null) return null;
                if (typeof baseMax === "function") {
                  const baseM = baseMax(p);
                  if (baseM == null) return null;
                  return baseM;
                }
                return baseMax;
              };
            };
            const getValidationDateGetter = (p: $Schema.RuleArgParams<number>) => {
              return () => {
                const [baseMax] = getValidationArray(base.getThis().maxDate);
                if (baseMax == null) return null;
                if (typeof baseMax === "function") {
                  const baseM = baseMax(p);
                  if (baseM == null) return null;
                  return baseM;
                }
                return baseMax;
              };
            };
            const getValidationTimeGetter = (p: $Schema.RuleArgParams<number>) => {
              return () => {
                const [baseMax] = getValidationArray(base.getThis().maxTime);
                if (baseMax == null) return null;
                if (typeof baseMax === "function") {
                  const baseM = baseMax(p);
                  if (baseM == null) return null;
                  return baseM;
                }
                return baseMax;
              };
            };

            if (typeof max === "function") {
              this._validators.push((p) => {
                if (p.value == null) return null;
                const m = max(p);
                if (m == null) return null;
                if (m === "inherit") {
                  const ret = base.isValidMin({
                    value: p.value,
                    getValidationDateTime: getValidationDateTimeGetter(p),
                    getValidationDate: getValidationDateGetter(p),
                    getValidationTime: getValidationTimeGetter(p),
                  });
                  if (ret[0]) return null;
                  return getMessage({
                    ...p as $Schema.ValidationResultArgParams<number>,
                    params: {
                      max: ret[1],
                    },
                  });
                }
                if (p.value <= m) return null;
                return getMessage({
                  ...p as $Schema.ValidationResultArgParams<number>,
                  params: {
                    max: m,
                  },
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
                        getValidationDateTime: getValidationDateTimeGetter(p),
                        getValidationDate: getValidationDateGetter(p),
                        getValidationTime: getValidationTimeGetter(p),
                      });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p as $Schema.ValidationResultArgParams<number>,
                        params: {
                          max: ret[1],
                        },
                      });
                    });
                  } else {
                    this._validators.push((p) => {
                      if (p.value == null) return null;
                      const ret = base.isValidMax({
                        value: p.value,
                        getValidationDateTime: getValidationDateTimeGetter(p),
                        getValidationDate: getValidationDateGetter(p),
                        getValidationTime: getValidationTimeGetter(p),
                      });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p as $Schema.ValidationResultArgParams<number>,
                        params: {
                          max: ret[1],
                        },
                      });
                    });
                  }
                }
              } else {
                this._validators.push((p) => {
                  if (p.value == null) return null;
                  if (p.value <= max) return null;
                  return getMessage({
                    ...p as $Schema.ValidationResultArgParams<number>,
                    params: {
                      max,
                    },
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

        const ruleArg = {
          ...params,
          label: this.label,
          actionType: this.getActionType(),
          value,
        } as const satisfies $Schema.RuleArgParams<number>;

        for (const vali of this._validators) {
          const msg = vali(ruleArg);
          if (msg) return [msg];
        }
        return [];
      },
    } as const satisfies SplitDateTimeProps & $Schema.SchemaItemInterfaceProps<number>;
  };
};

export function $datetime<const P extends DateTimeProps>(props: P = {} as P) {
  const fixedProps = {
    type: SCHEMA_ITEM_TYPE_DATETIME,
    _validators: null,
    getActionType: function () {
      return this.actionType || "select";
    },
    getTimeBasis: function () {
      return this.timeBasis || "minute";
    },
    parse: function (value, params = getEmptyInjectParams()) {
      if (this.parser) return this.parser(value, params);
      if (value == null || value === "") return { value: undefined };
      try {
        const datetime = new $DateTime(value as string);
        return { value: datetime };
      } catch {
        return {
          value: null,
          messages: [{
            type: "e",
            label: this.label,
            actionType: this.getActionType(),
            otype: SCHEMA_ITEM_TYPE_DATETIME,
            code: "parse",
            name: params.name,
          }],
        };
      }
    },
    validate: function (value, params = getEmptyInjectParams()) {
      if (this._validators == null) {
        this._validators = [];
        const commonMsgParams = {
          otype: SCHEMA_ITEM_TYPE_DATETIME,
          type: "e",
        } as const satisfies {
          otype: string;
          type: $Schema.AbstractMessage["type"];
        };

        // required
        if (this.required != null) {
          const [required, getRequiredMessage] = getValidationArray(this.required);
          if (required) {
            const getMessage = getRequiredMessage ?? ((p) => ({
              ...commonMsgParams,
              code: "required",
              label: p.label,
              params: p.params,
              name: p.name,
            }));

            if (typeof required === "function") {
              this._validators.push((p) => {
                if (!required(p)) return null;
                if (p.value == null) {
                  return getMessage(p as $Schema.ValidationResultArgParams);
                }
                return null;
              });
            } else {
              this._validators.push((p) => {
                if (p.value == null) {
                  return getMessage(p as $Schema.ValidationResultArgParams);
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
            const getMessage = getMinDateTimeMessage ?? ((p) => ({
              ...commonMsgParams,
              code: "minDateTime",
              label: p.label,
              params: p.params,
              name: p.name,
            }));

            if (typeof minDateTime === "function") {
              this._validators.push((p) => {
                if (p.value == null) return null;
                const m = minDateTime(p);
                if (m == null) return null;
                if (p.value.isBefore(m)) {
                  return getMessage({
                    ...p as $Schema.ValidationResultArgParams<$DateTime>,
                    params: {
                      minDateTime: m,
                    },
                  });
                }
                return null;
              });
            } else {
              this._validators.push((p) => {
                if (p.value == null) return null;
                if (p.value.isBefore(minDateTime)) {
                  return getMessage({
                    ...p as $Schema.ValidationResultArgParams<$DateTime>,
                    params: {
                      minDateTime,
                    },
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
            const getMessage = getMaxDateTimeMessage ?? ((p) => ({
              ...commonMsgParams,
              code: "maxDateTime",
              label: p.label,
              params: p.params,
              name: p.name,
            }));

            if (typeof maxDateTime === "function") {
              this._validators.push((p) => {
                if (p.value == null) return null;
                const m = maxDateTime(p);
                if (m == null) return null;
                if (p.value.isAfter(m)) {
                  return getMessage({
                    ...p as $Schema.ValidationResultArgParams<$DateTime>,
                    params: {
                      maxDateTime: m,
                    },
                  });
                }
                return null;
              });
            } else {
              this._validators.push((p) => {
                if (p.value == null) return null;
                if (p.value.isAfter(maxDateTime)) {
                  return getMessage({
                    ...p as $Schema.ValidationResultArgParams<$DateTime>,
                    params: {
                      maxDateTime,
                    },
                  });
                }
                return null;
              });
            }
          }
        }

        // minDate
        if (this.minDate) {
          const [minDate, getMinDateMessage] = getValidationArray(this.minDate);
          if (minDate != null) {
            const getMessage = getMinDateMessage ?? ((p) => ({
              ...commonMsgParams,
              code: "minDate",
              label: p.label,
              params: p.params,
              name: p.name,
            }));

            if (typeof minDate === "function") {
              this._validators.push((p) => {
                if (p.value == null) return null;
                const m = minDate(p);
                if (m == null) return null;
                if (p.value.isBeforeDate(m)) {
                  return getMessage({
                    ...p as $Schema.ValidationResultArgParams<$DateTime>,
                    params: {
                      minDate: m,
                    },
                  });
                }
                return null;
              });
            } else {
              this._validators.push((p) => {
                if (p.value == null) return null;
                if (p.value.isBeforeDate(minDate)) {
                  return getMessage({
                    ...p as $Schema.ValidationResultArgParams<$DateTime>,
                    params: {
                      minDate,
                    },
                  });
                }
                return null;
              });
            }
          }
        }

        // maxDate
        if (this.maxDate) {
          const [maxDate, getMaxDateMessage] = getValidationArray(this.maxDate);
          if (maxDate != null) {
            const getMessage = getMaxDateMessage ?? ((p) => ({
              ...commonMsgParams,
              code: "maxDate",
              label: p.label,
              params: p.params,
              name: p.name,
            }));

            if (typeof maxDate === "function") {
              this._validators.push((p) => {
                if (p.value == null) return null;
                const m = maxDate(p);
                if (m == null) return null;
                if (p.value.isAfterDate(m)) {
                  return getMessage({
                    ...p as $Schema.ValidationResultArgParams<$DateTime>,
                    params: {
                      maxDate: m,
                    },
                  });
                }
                return null;
              });
            } else {
              this._validators.push((p) => {
                if (p.value == null) return null;
                if (p.value.isAfterDate(maxDate)) {
                  return getMessage({
                    ...p as $Schema.ValidationResultArgParams<$DateTime>,
                    params: {
                      maxDate,
                    },
                  });
                }
                return null;
              });
            }
          }
        }

        // minTime
        if (this.minTime) {
          const [minTime, getMinTimeMessage] = getValidationArray(this.minTime);
          if (minTime != null) {
            const getMessage = getMinTimeMessage ?? ((p) => ({
              ...commonMsgParams,
              code: "minTime",
              label: p.label,
              params: p.params,
              name: p.name,
            }));

            if (typeof minTime === "function") {
              this._validators.push((p) => {
                if (p.value == null) return null;
                const m = minTime(p);
                if (m == null) return null;
                if (p.value.isBeforeTime(m)) {
                  return getMessage({
                    ...p as $Schema.ValidationResultArgParams<$DateTime>,
                    params: {
                      minTime: m,
                    },
                  });
                }
                return null;
              });
            } else {
              this._validators.push((p) => {
                if (p.value == null) return null;
                if (p.value.isBeforeTime(minTime)) {
                  return getMessage({
                    ...p as $Schema.ValidationResultArgParams<$DateTime>,
                    params: {
                      minTime,
                    },
                  });
                }
                return null;
              });
            }
          }
        }

        // maxTime
        if (this.maxTime) {
          const [maxTime, getMaxTimeMessage] = getValidationArray(this.maxTime);
          if (maxTime != null) {
            const getMessage = getMaxTimeMessage ?? ((p) => ({
              ...commonMsgParams,
              code: "maxTime",
              label: p.label,
              params: p.params,
              name: p.name,
            }));

            if (typeof maxTime === "function") {
              this._validators.push((p) => {
                if (p.value == null) return null;
                const m = maxTime(p);
                if (m == null) return null;
                if (p.value.isAfterTime(m)) {
                  return getMessage({
                    ...p as $Schema.ValidationResultArgParams<$DateTime>,
                    params: {
                      maxTime: m,
                    },
                  });
                }
                return null;
              });
            } else {
              this._validators.push((p) => {
                if (p.value == null) return null;
                if (p.value.isAfterTime(maxTime)) {
                  return getMessage({
                    ...p as $Schema.ValidationResultArgParams<$DateTime>,
                    params: {
                      maxTime,
                    },
                  });
                }
                return null;
              });
            }
          }
        }

        // pair
        if (this.pairs) {
          const [pairs, getPairsMessage] = getValidationArrayAsArray(this.pairs);
          if (pairs) {
            const getMessage = getPairsMessage ?? ((p) => ({
              ...commonMsgParams,
              code: "pair",
              label: p.label,
              params: p.params,
              name: p.name,
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
                      ...p as $Schema.ValidationResultArgParams<$DateTime>,
                      params: {
                        pairName: pair.name,
                        position: pair.position,
                        disallowSame: pair.disallowSame ?? false,
                        pairDateTime,
                        basis: pair.basis || "datetime",
                      },
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
                      ...p as $Schema.ValidationResultArgParams<$DateTime>,
                      params: {
                        pairName: pair.name,
                        position: pair.position,
                        disallowSame: pair.disallowSame ?? false,
                        pairDateTime,
                        basis: pair.basis || "datetime",
                      },
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

      const ruleArg = {
        ...params,
        label: this.label,
        actionType: this.getActionType(),
        value,
      } as const satisfies $Schema.RuleArgParams<$DateTime>;

      for (const vali of this._validators) {
        const msg = vali(ruleArg);
        if (msg) return [msg];
      }
      return [];
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
        isValidMin: ({ value, getValidationDateTime, getValidationDate }) => {
          let min = getValidationDateTime()?.getYear();
          const d = getValidationDate();
          if (min == null) min = d?.getYear();
          else if (d) min = Math.max(d.getYear());
          if (min == null) return [true, -1];
          return [min <= value, min];
        },
        isValidMax: ({ value, getValidationDateTime, getValidationDate }) => {
          let max = getValidationDateTime()?.getYear();
          const d = getValidationDate();
          if (max == null) max = d?.getYear();
          else if (d) max = Math.min(d.getYear());
          if (max == null) return [true, -1];
          return [value <= max, max];
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
          // NOTE: 最大値および年の値によって変動するため、最大日付と比較を行わない
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
          // NOTE: 最大値および年月の値によって変動するため、最大日付と比較を行わない
          return [value <= 31, 31];
        },
      })<SP>(splitProps);
    },
    getSplitHour: function <
      const This extends SplitDateTimeBaseProps,
      const SP extends SplitDateTimeProps
    >(
      this: This,
      splitProps: SP = {} as SP,
    ) {
      const getBase = () => this;
      return splitDateTime<This>({
        getThis: getBase,
        isValidMin: ({ value, getValidationTime }) => {
          const hour = getValidationTime()?.getHour();
          if (hour == null) return [true, -1];
          return [hour <= value, hour];
        },
        isValidMax: ({ value, getValidationTime }) => {
          const hour = getValidationTime()?.getHour();
          if (hour == null) return [true, -1];
          return [value <= hour, hour];
        },
      })<SP>(splitProps);
    },
    getSplitMinute: function <
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
          return [0 <= value, 0];
        },
        isValidMax: ({ value }) => {
          return [value <= 59, 59];
        },
      })<SP>(splitProps);
    },
    getSplitSecond: function <
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
          return [0 <= value, 0];
        },
        isValidMax: ({ value }) => {
          return [value <= 59, 59];
        },
      })<SP>(splitProps);
    },
  } as const satisfies DateTimeProps & $Schema.SchemaItemInterfaceProps<$DateTime>;

  return getSchemaItemPropsGenerator<typeof fixedProps, DateTimeProps, P>(fixedProps, props)({});
};
