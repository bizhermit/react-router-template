import { getValue } from "$/shared/objects/data";
import { $Date } from "$/shared/objects/timestamp";
import { getSchemaItemPropsGenerator, getValidationArray, getValidationArrayAsArray } from ".";

export const SCHEMA_ITEM_TYPE_DATE = "date";

type DatePair = { name: string; position: "before" | "after"; noSame?: boolean; };

type DateValidation_MinDate = { minDate: $Date; };
type DateValidation_MaxDate = { maxDate: $Date; };
type DateValidation_Pair = Omit<Required<DatePair>, "name"> & { pairName: string; pairDate: $Date; };

type DateValidationAbstractMessage = $Schema.AbstractMessage & {
  otype: typeof SCHEMA_ITEM_TYPE_DATE;
};
export type DateValidationMessage = DateValidationAbstractMessage & (
  | { code: "parse"; }
  | { code: "required"; }
  | ({ code: "minDate"; } & DateValidation_MinDate)
  | ({ code: "maxDate"; } & DateValidation_MaxDate)
  | ({ code: "pair"; } & DateValidation_Pair)
);

type DateOptions = {
  parser?: $Schema.Parser<$Date>;
  required?: $Schema.Validation<$Schema.Nullable<$Date>, boolean, undefined, DateValidationMessage>;
  minDate?: $Schema.Validation<$Date, $Date, DateValidation_MinDate, DateValidationMessage>;
  maxDate?: $Schema.Validation<$Date, $Date, DateValidation_MaxDate, DateValidationMessage>;
  pairs?: $Schema.Validation<
    $Date,
    DatePair | DatePair[],
    DateValidation_Pair,
    DateValidationMessage
  >;
  rules?: $Schema.Rule<$Date>[];
};

type DateProps = $Schema.SchemaItemAbstractProps & DateOptions;

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

        if (this.minDate) {
          const [minDate, getMinDateMessage] = getValidationArray(this.minDate);
          if (minDate != null) {
            const getMessage: $Schema.ValidationMessageGetter<typeof getMinDateMessage> =
              getMinDateMessage ??
              ((p) => ({
                ...commonMsgParams,
                code: "minDate",
                minDate: p.validationValues.minDate,
              }));

            if (typeof minDate === "function") {
              this._validators.push((p) => {
                if (p.value == null) return null;
                const m = minDate(p);
                if (m == null) return null;
                if (p.value.isBefore(m)) {
                  return getMessage({
                    ...p,
                    validationValues: {
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
                    ...p,
                    validationValues: {
                      minDate,
                    },
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
                maxDate: p.validationValues.maxDate,
              }));

            if (typeof maxDate === "function") {
              this._validators.push((p) => {
                if (p.value == null) return null;
                const m = maxDate(p);
                if (m == null) return null;
                if (p.value.isAfter(m)) {
                  return getMessage({
                    ...p,
                    validationValues: {
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
                    ...p,
                    validationValues: {
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
            const getMessage: $Schema.ValidationMessageGetter<typeof getPairsMessage> =
              getPairsMessage ??
              ((p) => ({
                ...commonMsgParams,
                code: "pair",
                pairName: p.validationValues.pairName,
                pairDate: p.validationValues.pairDate,
                position: p.validationValues.position,
                noSame: p.validationValues.noSame ?? false,
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
                    if (!pair.noSame && p.value.isEqual(pairDate)) continue;
                    if (pair.position === "after") {
                      if (p.value.isBefore(pairDate)) continue;
                    } else {
                      if (p.value.isAfter(pairDate)) continue;
                    }
                    return getMessage({
                      ...p,
                      validationValues: {
                        pairName: pair.name,
                        position: pair.position,
                        noSame: pair.noSame ?? false,
                        pairDate,
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
                    if (!pair.noSame && p.value.isEqual(pairDate)) continue;
                    if (pair.position === "after") {
                      if (p.value.isBefore(pairDate)) continue;
                    } else {
                      if (p.value.isAfter(pairDate)) continue;
                    }
                    return getMessage({
                      ...p,
                      validationValues: {
                        pairName: pair.name,
                        position: pair.position,
                        noSame: pair.noSame ?? false,
                        pairDate,
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

      let msg: $Schema.Message | null = null;
      for (const vali of this._validators) {
        msg = vali(params);
        if (msg) break;
      }
      return msg;
    },
  } as const satisfies DateProps & $Schema.SchemaItemInterfaceProps<$Date, DateValidationAbstractMessage>;

  return getSchemaItemPropsGenerator<typeof fixedProps, DateProps, P>(fixedProps, props)({});
};
