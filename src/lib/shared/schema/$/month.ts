import { parseNumber } from "$/shared/objects/numeric";
import { $Month } from "$/shared/objects/timestamp";
import { getSchemaItemPropsGenerator, getValidationArray } from ".";

export const SCHEMA_ITEM_TYPE_MONTH = "month";

type MonthPair = { name: string; position: "before" | "after"; noSame?: boolean; };

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
  pair?: $Schema.Validation<
    $Month,
    MonthPair | MonthPair[],
    MonthValidation_PairParams,
    MonthValidationMessage
  >;
  rules?: $Schema.Rule<$Month>[];
};

type MonthProps = $Schema.SchemaItemAbstractProps & MonthOptions;

const SCHEMA_ITEM_TYPE_SPLIT_DATE = `${SCHEMA_ITEM_TYPE_MONTH}-s`;

type SplitMonthValidation_MinParams = { min: number; };
type SplitMonthValidation_MaxParams = { max: number; };

export type SplitMonthValidationAbstractMessage = $Schema.AbstractMessage & {
  otype: typeof SCHEMA_ITEM_TYPE_SPLIT_DATE;
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
  MonthProps & $Schema.SchemaItemInterfaceProps<$Month, MonthValidationAbstractMessage>,
  "required" | "minMonth" | "maxMonth" | "getActionType"
>;

function splitMonth<const Base extends SplitMonthBaseProps>(base: {
  getThis: () => Base;
  isValidMin: (params: { value: number; validationValue: $Month; }) => [boolean, number];
  isValidMax: (params: { value: number; validationValue: $Month; }) => [boolean, number];
}) {
  return function <const SP extends SplitMonthProps>(splitProps: SP = {} as SP) {
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
                min: p.validationValues.min,
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
                      if (p.value == null) return null;
                      const m = baseMin(p);
                      if (m == null) return null;
                      const ret = base.isValidMin({ value: p.value, validationValue: m });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p,
                        validationValues: {
                          min: ret[1],
                        },
                      });
                    } else {
                      if (p.value == null) return null;
                      const ret = base.isValidMin({ value: p.value, validationValue: baseMin });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p,
                        validationValues: {
                          min: ret[1],
                        },
                      });
                    }
                  }
                  return null;
                }
                if (m <= p.value) return null;
                return getMessage({
                  ...p,
                  validationValues: {
                    min: m,
                  },
                });
              });
            } else {
              if (min === "inherit") {
                const [baseMin] = getValidationArray(base.getThis().minMonth);
                if (baseMin != null) {
                  if (typeof baseMin === "function") {
                    this._validators.push((p) => {
                      if (p.value == null) return null;
                      const m = baseMin(p);
                      if (m == null) return null;
                      const ret = base.isValidMin({ value: p.value, validationValue: m });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p,
                        validationValues: {
                          min: ret[1],
                        },
                      });
                    });
                  } else {
                    this._validators.push((p) => {
                      if (p.value == null) return null;
                      const ret = base.isValidMin({ value: p.value, validationValue: baseMin });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p,
                        validationValues: {
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
                    ...p,
                    validationValues: {
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
            const getMessage: $Schema.ValidationMessageGetter<typeof getMaxMessage> =
              getMaxMessage ??
              ((p) => ({
                ...commonMsgParams,
                code: "max",
                max: p.validationValues.max,
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
                      if (p.value == null) return null;
                      const m = baseMax(p);
                      if (m == null) return null;
                      const ret = base.isValidMax({ value: p.value, validationValue: m });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p,
                        validationValues: {
                          max: ret[1],
                        },
                      });
                    } else {
                      if (p.value == null) return null;
                      const ret = base.isValidMax({ value: p.value, validationValue: baseMax });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p,
                        validationValues: {
                          max: ret[1],
                        },
                      });
                    }
                  }
                  return null;
                }
                if (p.value <= m) return null;
                return getMessage({
                  ...p,
                  validationValues: {
                    max: m,
                  },
                });
              });
            } else {
              if (max === "inherit") {
                const [baseMax] = getValidationArray(base.getThis().maxMonth);
                if (baseMax != null) {
                  if (typeof baseMax === "function") {
                    this._validators.push((p) => {
                      if (p.value == null) return null;
                      const m = baseMax(p);
                      if (m == null) return null;
                      const ret = base.isValidMax({ value: p.value, validationValue: m });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p,
                        validationValues: {
                          max: ret[1],
                        },
                      });
                    });
                  } else {
                    this._validators.push((p) => {
                      if (p.value == null) return null;
                      const ret = base.isValidMax({ value: p.value, validationValue: baseMax });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p,
                        validationValues: {
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
                    ...p,
                    validationValues: {
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

        let msg: $Schema.Message | null = null;
        for (const vali of this._validators) {
          msg = vali(params);
          if (msg) break;
        }
        return msg;
      },
    } as const satisfies SplitMonthProps & $Schema.SchemaItemInterfaceProps<
      number,
      SplitMonthValidationAbstractMessage
    >;
  };
};

export function $month<const P extends MonthProps>(props: P = {} as P) {
  const fixedProps = {
    type: SCHEMA_ITEM_TYPE_MONTH,
    _validators: null,
    getActionType: function () {
      return this.actionType || "select";
    },
    getCommonTypeMessageParams: function () {
      return {
        otype: SCHEMA_ITEM_TYPE_MONTH,
        label: this.label,
        type: "e",
        actionType: this.getActionType(),
      } as const;
    },
    parse: function (params) {
      if (this.parser) return this.parser(params);
      if (params.value == null || params.value === "") return { value: undefined };
      try {
        const value = new $Month(params.value as string);
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

        // TODO:

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
      const This extends SplitMonthBaseProps,
      const SP extends SplitMonthProps
    >(
      this: This,
      splitProps: SP = {} as SP,
    ) {
      const getBase = () => this;
      return splitMonth<This>({
        getThis: getBase,
        isValidMin: ({ value, validationValue }) => {
          return [
            validationValue.getYear() <= value,
            validationValue.getYear(),
          ];
        },
        isValidMax: ({ value, validationValue }) => {
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
          // NOTE: 最小値および年の値によって変動するため、最大日付と比較を行わない
          return [value <= 12, 12];
        },
      })<SP>(splitProps);
    },
  } as const satisfies MonthProps & $Schema.SchemaItemInterfaceProps<$Month, MonthValidationAbstractMessage>;

  return getSchemaItemPropsGenerator<typeof fixedProps, MonthProps, P>(fixedProps, props)({});
};
