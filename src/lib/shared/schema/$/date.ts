import { getValue } from "$/shared/objects/data";
import { parseNumber } from "$/shared/objects/numeric";
import { $Date } from "$/shared/objects/timestamp";
import { getEmptyInjectParams, getSchemaItemPropsGenerator, getValidationArray, getValidationArrayAsArray } from ".";

export const SCHEMA_ITEM_TYPE_DATE = "date";

type DatePair = {
  name: string;
  position: "before" | "after";
  disallowSame?: boolean;
  basis?: "date" | "month";
};

type DateValidations = {
  required: $Schema.ValidationSchemaEntry<boolean, null | undefined>;
  minDate: $Schema.ValidationSchemaEntry<$Date, $Date, { minDate: $Date; }>;
  maxDate: $Schema.ValidationSchemaEntry<$Date, $Date, { maxDate: $Date; }>;
  pairs: $Schema.ValidationSchemaEntry<
    DatePair | DatePair[],
    $Date,
    Omit<Required<DatePair>, "name"> & { pairName: string; pairDate: $Date; }
  >;
};

export type DateSchemaMessage = $Schema.ValidationMessageFromSchema<
  DateValidations,
  typeof SCHEMA_ITEM_TYPE_DATE
>;

type DateProps = $Schema.SchemaItemAbstractProps
  & $Schema.ValidationOptionsFromSchema<DateValidations>
  & {
    parser?: $Schema.Parser<$Date>;
    rules?: $Schema.Rule<$Date>[];
  };

export type SplitDatePart = "Y" | "M" | "D";

type SplitDateValidations = {
  required: $Schema.ValidationSchemaEntry<boolean | "inherit", null | undefined>;
  min: $Schema.ValidationSchemaEntry<number | "inherit", number, { min: number; }>;
  max: $Schema.ValidationSchemaEntry<number | "inherit", number, { max: number; }>;
};

export type SplitDateSchemaMessage = $Schema.ValidationMessageFromSchema<
  SplitDateValidations,
  `${typeof SCHEMA_ITEM_TYPE_DATE}-${SplitDatePart}`
>;

type SplitDateProps = $Schema.SchemaItemAbstractProps
  & $Schema.ValidationOptionsFromSchema<SplitDateValidations>
  & {
    parser?: $Schema.Parser<number>;
    rules?: $Schema.Rule<number>[];
  };

type SplitDateBaseProps = Pick<
  DateProps & $Schema.SchemaItemInterfaceProps<$Date>,
  "required" | "minDate" | "maxDate" | "getActionType"
>;

function splitDate<const Base extends SplitDateBaseProps>(key: SplitDatePart, base: {
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

    const type = `${SCHEMA_ITEM_TYPE_DATE}-${key}` as const;
    return {
      ...splitProps,
      type,
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
            otype: type,
            code: "parse",
            name: params.name,
          }],
        };
      },
      validate: function (value, params = getEmptyInjectParams()) {
        if (this._validators == null) {
          this._validators = [];
          const commonMsgParams = {
            otype: type,
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
                        ...p as $Schema.RuleArgParamsAsValidation<number>,
                        params: {
                          min: ret[1],
                        },
                      });
                    } else {
                      const ret = base.isValidMin({ value: p.value, validationDate: baseMin });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p as $Schema.RuleArgParamsAsValidation<number>,
                        params: {
                          min: ret[1],
                        },
                      });
                    }
                  }
                  return null;
                }
                if (m <= p.value) return null;
                return getMessage({
                  ...p as $Schema.RuleArgParamsAsValidation<number>,
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
                      const baseM = baseMin(p);
                      if (baseM == null) return null;
                      const ret = base.isValidMin({ value: p.value, validationDate: baseM });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p as $Schema.RuleArgParamsAsValidation<number>,
                        params: {
                          min: ret[1],
                        },
                      });
                    });
                  } else {
                    this._validators.push((p) => {
                      if (p.value == null) return null;
                      const ret = base.isValidMin({ value: p.value, validationDate: baseMin });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p as $Schema.RuleArgParamsAsValidation<number>,
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
                    ...p as $Schema.RuleArgParamsAsValidation<number>,
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
                        ...p as $Schema.RuleArgParamsAsValidation<number>,
                        params: {
                          max: ret[1],
                        },
                      });
                    } else {
                      const ret = base.isValidMax({ value: p.value, validationDate: baseMax });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p as $Schema.RuleArgParamsAsValidation<number>,
                        params: {
                          max: ret[1],
                        },
                      });
                    }
                  }
                  return null;
                }
                if (p.value <= m) return null;
                return getMessage({
                  ...p as $Schema.RuleArgParamsAsValidation<number>,
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
                      const baseM = baseMax(p);
                      if (baseM == null) return null;
                      const ret = base.isValidMax({ value: p.value, validationDate: baseM });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p as $Schema.RuleArgParamsAsValidation<number>,
                        params: {
                          max: ret[1],
                        },
                      });
                    });
                  } else {
                    this._validators.push((p) => {
                      if (p.value == null) return null;
                      const ret = base.isValidMax({ value: p.value, validationDate: baseMax });
                      if (ret[0]) return null;
                      return getMessage({
                        ...p as $Schema.RuleArgParamsAsValidation<number>,
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
                    ...p as $Schema.RuleArgParamsAsValidation<number>,
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
    } as const satisfies SplitDateProps & $Schema.SchemaItemInterfaceProps<number>;
  };
};

export function $date<const P extends DateProps>(props: P = {} as P) {
  const fixedProps = {
    type: SCHEMA_ITEM_TYPE_DATE,
    _validators: null,
    getActionType: function () {
      return this.actionType || "select";
    },
    parse: function (value, params = getEmptyInjectParams()) {
      if (this.parser) return this.parser(value, params);
      if (value == null || value === "") return { value: undefined };
      try {
        const date = new $Date(value as string);
        return { value: date };
      } catch {
        return {
          value: null,
          messages: [{
            type: "e",
            label: this.label,
            actionType: this.getActionType(),
            otype: SCHEMA_ITEM_TYPE_DATE,
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
          otype: SCHEMA_ITEM_TYPE_DATE,
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
                if (p.value.isBefore(m)) {
                  return getMessage({
                    ...p as $Schema.RuleArgParamsAsValidation<$Date>,
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
                if (p.value.isBefore(minDate)) {
                  return getMessage({
                    ...p as $Schema.RuleArgParamsAsValidation<$Date>,
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
                if (p.value.isAfter(m)) {
                  return getMessage({
                    ...p as $Schema.RuleArgParamsAsValidation<$Date>,
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
                if (p.value.isAfter(maxDate)) {
                  return getMessage({
                    ...p as $Schema.RuleArgParamsAsValidation<$Date>,
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
                      ...p as $Schema.RuleArgParamsAsValidation<$Date>,
                      params: {
                        pairName: pair.name,
                        position: pair.position,
                        disallowSame: pair.disallowSame ?? false,
                        pairDate,
                        basis: pair.basis || "date",
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
                      ...p as $Schema.RuleArgParamsAsValidation<$Date>,
                      params: {
                        pairName: pair.name,
                        position: pair.position,
                        disallowSame: pair.disallowSame ?? false,
                        pairDate,
                        basis: pair.basis || "date",
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
      } as const satisfies $Schema.RuleArgParams<$Date>;

      for (const vali of this._validators) {
        const msg = vali(ruleArg);
        if (msg) return [msg];
      }
      return [];
    },
    getSplitYear: function <
      const This extends SplitDateBaseProps,
      const SP extends SplitDateProps
    >(
      this: This,
      splitProps: SP = {} as SP,
    ) {
      const getBase = () => this;
      return splitDate<This>("Y", {
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
      return splitDate<This>("M", {
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
      return splitDate<This>("D", {
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
  } as const satisfies DateProps & $Schema.SchemaItemInterfaceProps<$Date>;

  return getSchemaItemPropsGenerator<typeof fixedProps, DateProps, P>(fixedProps, props)({});
};
