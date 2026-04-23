import { getValue } from "$/shared/objects/data";
import { parseNumber } from "$/shared/objects/numeric";
import { $Month } from "$/shared/objects/timestamp";
import { getSchemaItemPropsGenerator, getValidationArray, getValidationArrayAsArray } from ".";

export const SCHEMA_ITEM_TYPE_MONTH = "month";

type MonthPair = {
  name: string;
  position: "before" | "after";
  disallowSame?: boolean;
};

type MonthValidation_MinMonthParams = { minMonth: $Month; };
type MonthValidation_MaxMonthParams = { maxMonth: $Month; };
type MonthValidation_PairParams = Omit<Required<MonthPair>, "name"> & { pairName: string; pairMonth: $Month; };

type MonthValidationAbstractMessage = $Schema.AbstractMessage & {
  otype: typeof SCHEMA_ITEM_TYPE_MONTH;
};
export type MonthValidationMessage = MonthValidationAbstractMessage & (
  | { code: "parse"; }
  | { code: "required"; }
  | ({ code: "minMonth"; } & MonthValidation_MinMonthParams)
  | ({ code: "maxMonth"; } & MonthValidation_MaxMonthParams)
  | ({ code: "pair"; } & MonthValidation_PairParams)
);

type MonthOptions = {
  parser?: $Schema.Parser<$Month>;
  required?: $Schema.Validation<$Schema.Nullable<$Month>, boolean, undefined, MonthValidationMessage>;
  minMonth?: $Schema.Validation<$Month, $Month, MonthValidation_MinMonthParams, MonthValidationMessage>;
  maxMonth?: $Schema.Validation<$Month, $Month, MonthValidation_MaxMonthParams, MonthValidationMessage>;
  pairs?: $Schema.Validation<
    $Month,
    MonthPair | MonthPair[],
    MonthValidation_PairParams,
    MonthValidationMessage
  >;
  rules?: $Schema.Rule<$Month>[];
};

type MonthProps = $Schema.SchemaItemAbstractProps & MonthOptions;

const SCHEMA_ITEM_TYPE_SPLIT_MONTH = `${SCHEMA_ITEM_TYPE_MONTH}-s`;

type SplitMonthValidation_MinParams = { min: number; };
type SplitMonthValidation_MaxParams = { max: number; };

export type SplitMonthValidationAbstractMessage = $Schema.AbstractMessage & {
  otype: typeof SCHEMA_ITEM_TYPE_SPLIT_MONTH;
};
export type SplitMonthValidationMessage = SplitMonthValidationAbstractMessage & (
  | { code: "parse"; }
  | { code: "required"; }
  | ({ code: "min"; } | SplitMonthValidation_MinParams)
  | ({ code: "max"; } | SplitMonthValidation_MaxParams)
);

type SplitMonthOptions = {
  parser?: $Schema.Parser<number>;
  required?: $Schema.Validation<$Schema.Nullable<number>, boolean | "inherit", undefined, SplitMonthValidationMessage>;
  min?: $Schema.Validation<number, number | "inherit", SplitMonthValidation_MinParams, SplitMonthValidationMessage>;
  max?: $Schema.Validation<number, number | "inherit", SplitMonthValidation_MaxParams, SplitMonthValidationMessage>;
  rules?: $Schema.Rule<number>[];
};

type SplitMonthProps = $Schema.SchemaItemAbstractProps & SplitMonthOptions;

type SplitMonthBaseProps = Pick<
  MonthProps & $Schema.SchemaItemInterfaceProps<$Month>,
  "required" | "minMonth" | "maxMonth" | "getActionType"
>;

function splitMonth<const Base extends SplitMonthBaseProps>(base: {
  getThis: () => Base;
  isValidMin: (params: {
    value: number;
    validationMonth: $Month;
  }) => [boolean, number];
  isValidMax: (params: {
    value: number;
    validationMonth: $Month;
  }) => [boolean, number];
}) {
  return function <const SP extends SplitMonthProps>(splitProps: SP = {} as SP) {
    type Required = $Schema.ValidationArray<SP["required"]>[0] extends boolean
      ? SP["required"]
      : $Schema.ValidationArray<Base["required"]>;

    return {
      ...splitProps,
      type: SCHEMA_ITEM_TYPE_SPLIT_MONTH,
      required: splitProps.required as Required,
      _validators: null,
      getActionType: function () {
        return this.actionType || base.getThis().getActionType();
      },
      parse: function (value, params) {
        if (this.parser) return this.parser(value, params);
        const [num, succeeded] = parseNumber(value);
        if (succeeded) return { value: num };
        return {
          value: num,
          message: {
            type: "e",
            label: this.label,
            actionType: this.getActionType(),
            otype: SCHEMA_ITEM_TYPE_SPLIT_MONTH,
            code: "parse",
          },
        };
      },
      validate: function (value, params) {
        if (this._validators == null) {
          this._validators = [];
          const commonMsgParams = {
            otype: SCHEMA_ITEM_TYPE_SPLIT_MONTH,
            type: "e",
          } as const satisfies {
            otype: string;
            type: $Schema.AbstractMessage["type"];
          };

          // required
          const [required, getRequiredMessage] = getValidationArray(this.required, "inherit");
          if (required) {
            const getMessage: $Schema.ValidationMessageGetter<typeof getRequiredMessage> =
              getRequiredMessage ??
              ((p) => ({
                ...commonMsgParams,
                code: "required",
                ...p,
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
                  const [baseMin] = getValidationArray(base.getThis().minMonth);
                  if (baseMin != null) {
                    if (typeof baseMin === "function") {
                      const baseM = baseMin(p);
                      if (baseM == null) return null;
                      const ret = base.isValidMin({ value: p.value, validationMonth: baseM });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p,
                        min: ret[1],
                      });
                    } else {
                      const ret = base.isValidMin({ value: p.value, validationMonth: baseMin });
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
                const [baseMin] = getValidationArray(base.getThis().minMonth);
                if (baseMin != null) {
                  if (typeof baseMin === "function") {
                    this._validators.push((p) => {
                      if (p.value == null) return null;
                      const baseM = baseMin(p);
                      if (baseM == null) return null;
                      const ret = base.isValidMin({ value: p.value, validationMonth: baseM });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p,
                        min: ret[1],
                      });
                    });
                  } else {
                    this._validators.push((p) => {
                      if (p.value == null) return null;
                      const ret = base.isValidMin({ value: p.value, validationMonth: baseMin });
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
                  const [baseMax] = getValidationArray(base.getThis().maxMonth);
                  if (baseMax != null) {
                    if (typeof baseMax === "function") {
                      const baseM = baseMax(p);
                      if (baseM == null) return null;
                      const ret = base.isValidMax({ value: p.value, validationMonth: baseM });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p,
                        max: ret[1],
                      });
                    } else {
                      const ret = base.isValidMax({ value: p.value, validationMonth: baseMax });
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
                const [baseMax] = getValidationArray(base.getThis().maxMonth);
                if (baseMax != null) {
                  if (typeof baseMax === "function") {
                    this._validators.push((p) => {
                      if (p.value == null) return null;
                      const baseM = baseMax(p);
                      if (baseM == null) return null;
                      const ret = base.isValidMax({ value: p.value, validationMonth: baseM });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p,
                        max: ret[1],
                      });
                    });
                  } else {
                    this._validators.push((p) => {
                      if (p.value == null) return null;
                      const ret = base.isValidMax({ value: p.value, validationMonth: baseMax });
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
        const ruleArg = {
          ...params,
          label: this.label,
          actionType: this.getActionType(),
          value,
        } as const satisfies $Schema.RuleArgParams<number>;

        for (const vali of this._validators) {
          msg = vali(ruleArg);
          if (msg) break;
        }
        return msg;
      },
    } as const satisfies SplitMonthProps & $Schema.SchemaItemInterfaceProps<number>;
  };
};

export function $month<const P extends MonthProps>(props: P = {} as P) {
  const fixedProps = {
    type: SCHEMA_ITEM_TYPE_MONTH,
    _validators: null,
    getActionType: function () {
      return this.actionType || "select";
    },
    parse: function (value, params) {
      if (this.parser) return this.parser(value, params);
      if (value == null || value === "") return { value: undefined };
      try {
        const month = new $Month(value as string);
        return { value: month };
      } catch {
        return {
          value: null,
          message: {
            type: "e",
            label: this.label,
            actionType: this.getActionType(),
            otype: SCHEMA_ITEM_TYPE_MONTH,
            code: "parse",
          },
        };
      }
    },
    validate: function (value, params) {
      if (this._validators == null) {
        this._validators = [];
        const commonMsgParams = {
          otype: SCHEMA_ITEM_TYPE_MONTH,
          type: "e",
        } as const satisfies {
          otype: string;
          type: $Schema.AbstractMessage["type"];
        };

        // required
        if (this.required != null) {
          const [required, getRequiredMessage] = getValidationArray(this.required);
          if (required) {
            const getMessage: $Schema.ValidationMessageGetter<typeof getRequiredMessage> =
              getRequiredMessage ??
              ((p) => ({
                ...commonMsgParams,
                code: "required",
                ...p,
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

        // minMonth
        if (this.minMonth) {
          const [minMonth, getMinMonthMessage] = getValidationArray(this.minMonth);
          if (minMonth != null) {
            const getMessage: $Schema.ValidationMessageGetter<typeof getMinMonthMessage> =
              getMinMonthMessage ??
              ((p) => ({
                ...commonMsgParams,
                code: "minMonth",
                ...p,
              }));

            if (typeof minMonth === "function") {
              this._validators.push((p) => {
                if (p.value == null) return null;
                const m = minMonth(p);
                if (m == null) return null;
                if (p.value.isBefore(m)) {
                  return getMessage({
                    ...p,
                    minMonth: m,
                  });
                }
                return null;
              });
            } else {
              this._validators.push((p) => {
                if (p.value == null) return null;
                if (p.value.isBefore(minMonth)) {
                  return getMessage({
                    ...p,
                    minMonth,
                  });
                }
                return null;
              });
            }
          }
        }

        // maxMonth
        if (this.maxMonth) {
          const [maxMonth, getMaxMonthMessage] = getValidationArray(this.maxMonth);
          if (maxMonth != null) {
            const getMessage: $Schema.ValidationMessageGetter<typeof getMaxMonthMessage> =
              getMaxMonthMessage ??
              ((p) => ({
                ...commonMsgParams,
                code: "maxMonth",
                ...p,
              }));

            if (typeof maxMonth === "function") {
              this._validators.push((p) => {
                if (p.value == null) return null;
                const m = maxMonth(p);
                if (m == null) return null;
                if (p.value.isAfter(m)) {
                  return getMessage({
                    ...p,
                    maxMonth: m,
                  });
                }
                return null;
              });
            } else {
              this._validators.push((p) => {
                if (p.value == null) return null;
                if (p.value.isAfter(maxMonth)) {
                  return getMessage({
                    ...p,
                    maxMonth,
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
                    const pairMonth = new $Month(pairValue as string);
                    if (!pair.disallowSame && p.value.isEqual(pairMonth)) continue;
                    if (pair.position === "after") {
                      if (p.value.isBefore(pairMonth)) continue;
                    } else {
                      if (p.value.isAfter(pairMonth)) continue;
                    }
                    return getMessage({
                      ...p,
                      pairName: pair.name,
                      position: pair.position,
                      disallowSame: pair.disallowSame ?? false,
                      pairMonth,
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
                    const pairMonth = new $Month(pairValue as string);
                    if (!pair.disallowSame && p.value.isEqual(pairMonth)) continue;
                    if (pair.position === "after") {
                      if (p.value.isBefore(pairMonth)) continue;
                    } else {
                      if (p.value.isAfter(pairMonth)) continue;
                    }
                    return getMessage({
                      ...p,
                      pairName: pair.name,
                      position: pair.position,
                      disallowSame: pair.disallowSame ?? false,
                      pairMonth,
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
      const ruleArg = {
        ...params,
        label: this.label,
        actionType: this.getActionType(),
        value,
      } as const satisfies $Schema.RuleArgParams<$Month>;

      for (const vali of this._validators) {
        msg = vali(ruleArg);
        if (msg) break;
      }
      return msg;
    },
    getSplitYear: function <
      const This extends SplitMonthBaseProps,
      const SP extends SplitMonthProps
    >(
      this: This,
      splitProps: SP = {} as SP,
    ) {
      const getBase = () => this;
      return splitMonth<This>({
        getThis: getBase,
        isValidMin: ({ value, validationMonth: validationValue }) => {
          return [
            validationValue.getYear() <= value,
            validationValue.getYear(),
          ];
        },
        isValidMax: ({ value, validationMonth: validationValue }) => {
          return [
            value <= validationValue.getYear(),
            validationValue.getYear(),
          ];
        },
      })<SP>(splitProps);
    },
    getSplitMonth: function <
      const This extends SplitMonthBaseProps,
      const SP extends SplitMonthProps
    >(
      this: This,
      splitProps: SP = {} as SP,
    ) {
      const getBase = () => this;
      return splitMonth<This>({
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
  } as const satisfies MonthProps & $Schema.SchemaItemInterfaceProps<$Month>;

  return getSchemaItemPropsGenerator<typeof fixedProps, MonthProps, P>(fixedProps, props)({});
};
