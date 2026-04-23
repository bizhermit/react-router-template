import { getValue } from "$/shared/objects/data";
import { parseNumber } from "$/shared/objects/numeric";
import { $Date } from "$/shared/objects/timestamp";
import { getSchemaItemPropsGenerator, getValidationArray, getValidationArrayAsArray } from ".";

export const SCHEMA_ITEM_TYPE_DATE = "date";

type DatePair = {
  name: string;
  position: "before" | "after";
  disallowSame?: boolean;
  basis?: "date" | "month";
};

type DateValidation_MinDateParams = { minDate: $Date; };
type DateValidation_MaxDateParams = { maxDate: $Date; };
type DateValidation_PairParams = Omit<Required<DatePair>, "name"> & { pairName: string; pairDate: $Date; };

type DateValidationAbstractMessage = $Schema.AbstractMessage & {
  otype: typeof SCHEMA_ITEM_TYPE_DATE;
};
export type DateValidationMessage = DateValidationAbstractMessage & (
  | { code: "parse"; }
  | { code: "required"; }
  | ({ code: "minDate"; } & DateValidation_MinDateParams)
  | ({ code: "maxDate"; } & DateValidation_MaxDateParams)
  | ({ code: "pair"; } & DateValidation_PairParams)
);

type DateOptions = {
  parser?: $Schema.Parser<$Date>;
  required?: $Schema.Validation<$Schema.Nullable<$Date>, boolean, undefined, DateValidationMessage>;
  minDate?: $Schema.Validation<$Date, $Date, DateValidation_MinDateParams, DateValidationMessage>;
  maxDate?: $Schema.Validation<$Date, $Date, DateValidation_MaxDateParams, DateValidationMessage>;
  pairs?: $Schema.Validation<
    $Date,
    DatePair | DatePair[],
    DateValidation_PairParams,
    DateValidationMessage
  >;
  rules?: $Schema.Rule<$Date>[];
};

type DateProps = $Schema.SchemaItemAbstractProps & DateOptions;

const SCHEMA_ITEM_TYPE_SPLIT_DATE = `${SCHEMA_ITEM_TYPE_DATE}-s`;

type SplitDateValidation_MinParams = { min: number; };
type SplitDateValidation_MaxParams = { max: number; };

export type SplitDateValidationAbstractMessage = $Schema.AbstractMessage & {
  otype: typeof SCHEMA_ITEM_TYPE_SPLIT_DATE;
};
export type SplitDateValidationMessage = SplitDateValidationAbstractMessage & (
  | { code: "parse"; }
  | { code: "required"; }
  | ({ code: "min"; } | SplitDateValidation_MinParams)
  | ({ code: "max"; } | SplitDateValidation_MaxParams)
);

type SplitDateOptions = {
  parser?: $Schema.Parser<number>;
  required?: $Schema.Validation<$Schema.Nullable<number>, boolean | "inherit", undefined, SplitDateValidationMessage>;
  min?: $Schema.Validation<number, number | "inherit", SplitDateValidation_MinParams, SplitDateValidationMessage>;
  max?: $Schema.Validation<number, number | "inherit", SplitDateValidation_MaxParams, SplitDateValidationMessage>;
  rules?: $Schema.Rule<number>[];
};

type SplitDateProps = $Schema.SchemaItemAbstractProps & SplitDateOptions;

type SplitDateBaseProps = Pick<
  DateProps & $Schema.SchemaItemInterfaceProps<$Date, DateValidationAbstractMessage>,
  "required" | "minDate" | "maxDate" | "getActionType"
>;

function splitDate<const Base extends SplitDateBaseProps>(base: {
  getThis: () => Base;
  isValidMin: (params: {
    value: number;
    validationDate: $Date;
  }) => [boolean, number];
  isValidMax: (params: {
    value: number;
    validationDate: $Date;
  }) => [boolean, number];
}) {
  return function <const SP extends SplitDateProps>(splitProps: SP = {} as SP) {
    type Required = $Schema.ValidationArray<SP["required"]>[0] extends boolean
      ? SP["required"]
      : $Schema.ValidationArray<Base["required"]>;

    return {
      ...splitProps,
      type: SCHEMA_ITEM_TYPE_SPLIT_DATE,
      required: splitProps.required as Required,
      _validators: null,
      getActionType: function () {
        return this.actionType || base.getThis().getActionType();
      },
      getCommonTypeMessageParams: function () {
        return {
          otype: SCHEMA_ITEM_TYPE_SPLIT_DATE,
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
                      const baseM = baseMin(p);
                      if (baseM == null) return null;
                      const ret = base.isValidMin({ value: p.value, validationDate: baseM });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p,
                        min: ret[1],
                      });
                    } else {
                      const ret = base.isValidMin({ value: p.value, validationDate: baseMin });
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
                      const baseM = baseMin(p);
                      if (baseM == null) return null;
                      const ret = base.isValidMin({ value: p.value, validationDate: baseM });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p,
                        min: ret[1],
                      });
                    });
                  } else {
                    this._validators.push((p) => {
                      if (p.value == null) return null;
                      const ret = base.isValidMin({ value: p.value, validationDate: baseMin });
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
                      const baseM = baseMax(p);
                      if (baseM == null) return null;
                      const ret = base.isValidMax({ value: p.value, validationDate: baseM });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p,
                        max: ret[1],
                      });
                    } else {
                      const ret = base.isValidMax({ value: p.value, validationDate: baseMax });
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
                      const baseM = baseMax(p);
                      if (baseM == null) return null;
                      const ret = base.isValidMax({ value: p.value, validationDate: baseM });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p,
                        max: ret[1],
                      });
                    });
                  } else {
                    this._validators.push((p) => {
                      if (p.value == null) return null;
                      const ret = base.isValidMax({ value: p.value, validationDate: baseMax });
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
    } as const satisfies SplitDateProps & $Schema.SchemaItemInterfaceProps<
      number,
      SplitDateValidationAbstractMessage
    >;
  };
};

export function $date<const P extends DateProps>(props: P = {} as P) {
  const fixedProps = {
    type: SCHEMA_ITEM_TYPE_DATE,
    _validators: null,
    getActionType: function () {
      return this.actionType || "select";
    },
    getCommonTypeMessageParams: function () {
      return {
        otype: SCHEMA_ITEM_TYPE_DATE,
        label: this.label,
        type: "e",
        actionType: this.getActionType(),
      } as const;
    },
    parse: function (params) {
      if (this.parser) return this.parser(params);
      if (params.value == null || params.value === "") return { value: undefined };
      try {
        const value = new $Date(params.value as string);
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

        // minDate
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
                if (p.value.isBefore(m)) {
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
                if (p.value.isBefore(minDate)) {
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

        // maxDate
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
                if (p.value.isAfter(m)) {
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
                if (p.value.isAfter(maxDate)) {
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
                    const pairDate = new $Date(pairValue as string);
                    if (pair.basis === "month") {
                      if (!pair.disallowSame && p.value.isEqualYearMonth(pairDate)) continue;
                      if (pair.position === "after") {
                        if (p.value.isBeforeYearMonth(pairDate)) continue;
                      } else {
                        if (p.value.isAfterYearMonth(pairDate)) continue;
                      }
                    } else {
                      if (!pair.disallowSame && p.value.isEqual(pairDate)) continue;
                      if (pair.position === "after") {
                        if (p.value.isBefore(pairDate)) continue;
                      } else {
                        if (p.value.isAfter(pairDate)) continue;
                      }
                    }
                    return getMessage({
                      ...p,
                      pairName: pair.name,
                      position: pair.position,
                      disallowSame: pair.disallowSame ?? false,
                      pairDate,
                      basis: pair.basis || "date",
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
                    const pairDate = new $Date(pairValue as string);

                    if (pair.basis === "month") {
                      if (!pair.disallowSame && p.value.isEqualYearMonth(pairDate)) continue;
                      if (pair.position === "after") {
                        if (p.value.isBeforeYearMonth(pairDate)) continue;
                      } else {
                        if (p.value.isAfterYearMonth(pairDate)) continue;
                      }
                    } else {
                      if (!pair.disallowSame && p.value.isEqual(pairDate)) continue;
                      if (pair.position === "after") {
                        if (p.value.isBefore(pairDate)) continue;
                      } else {
                        if (p.value.isAfter(pairDate)) continue;
                      }
                    }
                    return getMessage({
                      ...p,
                      pairName: pair.name,
                      position: pair.position,
                      disallowSame: pair.disallowSame ?? false,
                      pairDate,
                      basis: pair.basis || "date",
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
      const This extends SplitDateBaseProps,
      const SP extends SplitDateProps
    >(
      this: This,
      splitProps: SP = {} as SP,
    ) {
      const getBase = () => this;
      return splitDate<This>({
        getThis: getBase,
        isValidMin: ({ value, validationDate: validationValue }) => {
          return [
            validationValue.getYear() <= value,
            validationValue.getYear(),
          ];
        },
        isValidMax: ({ value, validationDate: validationValue }) => {
          return [
            value <= validationValue.getYear(),
            validationValue.getYear(),
          ];
        },
      })<SP>(splitProps);
    },
    getSplitMonth: function <
      const This extends SplitDateBaseProps,
      const SP extends SplitDateProps
    >(
      this: This,
      splitProps: SP = {} as SP,
    ) {
      const getBase = () => this;
      return splitDate<This>({
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
      const This extends SplitDateBaseProps,
      const SP extends SplitDateProps
    >(
      this: This,
      splitProps: SP = {} as SP,
    ) {
      const getBase = () => this;
      return splitDate<This>({
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
  } as const satisfies DateProps & $Schema.SchemaItemInterfaceProps<$Date, DateValidationAbstractMessage>;

  return getSchemaItemPropsGenerator<typeof fixedProps, DateProps, P>(fixedProps, props)({});
};
