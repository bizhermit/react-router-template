import { useId, useMemo, useRef, type ChangeEvent, type ReactNode } from "react";
import { InputField, InputGroup, Placeholder, type InputWrapProps } from "./common";
import { parseDate } from "~/components/objects/date";
import { clsx } from "../utilities";
import { useSchemaEffect, useSchemaItem } from "~/components/schema/hooks";

export type DateSelectBoxProps<D extends Schema.DataItem<Schema.$SplitDate>> = InputWrapProps & {
  $: D;
  placeholder?: [string, string] | [string, string, string] | [string, string, string, string] | [string, string, string, string, string] | [string, string, string, string, string, string];
};

const DEFAULT_MIN_DATE = new Date("1970-01-01T00:00:00");
const DEFAULT_MAX_DATE = new Date("2099-12-31T23:59:59");

function SepSpan(props: { children: ReactNode }) {
  return <span className="px-2">{props.children}</span>
};

export function DateSelectBox<P extends Schema.DataItem<Schema.$SplitDate>>({
  $,
  placeholder,
  ...props
}: DateSelectBoxProps<P>) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null!);

  const $date = $.core;
  const $year = $date.splits.Y;
  const $month = $date.splits.M;
  const $day = $date.splits.D;
  const $hour = $date.splits.h;
  const $minute = $date.splits.m;
  const $second = $date.splits.s;

  const schema = useSchemaEffect((params) => {
    switch (params.type) {
      case "data":
        break;
      case "value-result":
        break;
      case "value":
        break;
      case "result":
        break;
      case "dep":
        break;
    }
  }, () => {
    return {
      id,
      name: id,
    };
  });

  return (
    <InputGroup
      ref={ref}
    >
    </InputGroup>
  );
  // function updateValue(name: string, value: number | null | undefined) {
  //   const elem = ref.current.querySelector(`select[name=${name}]`);
  //   if (!elem) return;
  //   (elem as HTMLSelectElement).value = value == null ? "" : String(value);
  // };

  // const {
  //   name,
  //   dataItem,
  //   state,
  //   required,
  //   value,
  //   setValue,
  //   result,
  //   label,
  //   invalid,
  //   errormessage,
  //   validScripts,
  //   props,
  // } = useSchemaItem<Schema.DataItem<Schema.$SplitDate>>($props, {
  //   effect: function ({ value }) {
  //     if (!ref.current) return;
  //     updateValue(names.year, value?.Y);
  //     updateValue(names.month, value?.M);
  //     updateValue(names.date, value?.D);
  //     updateValue(names.hour, value?.h);
  //     updateValue(names.minute, value?.m);
  //     updateValue(names.second, value?.s);
  //   },
  // });

  // const {} = dataItem._.core.splits;
  // const type = dataItem._.type;
  // const time = dataItem._.time || "minute";
  // const names = getSplitDateNames(name);
  // const split = typeof dataItem.split === "object" ? dataItem.split : undefined;

  // const min = useMemo(() => {
  //   try {
  //     return parseDate(dataItem.min?.[0]?.()) ?? DEFAULT_MIN_DATE;
  //   } catch {
  //     return DEFAULT_MIN_DATE;
  //   }
  // }, [dataItem.min]);

  // const max = useMemo(() => {
  //   try {
  //     return parseDate(dataItem.max?.[0]?.()) ?? DEFAULT_MAX_DATE;
  //   } catch {
  //     return DEFAULT_MAX_DATE;
  //   }
  // }, [dataItem.max]);

  // const minTime = useMemo(() => {
  //   return parseTimeNums(dataItem.minTime?.[0]?.());
  // }, [dataItem.minTime]);

  // const maxTime = useMemo(() => {
  //   return parseTimeNums(dataItem.maxTime?.[0]?.(), { h: 23, m: 59, s: 59 });
  // }, [dataItem.maxTime]);

  // function handleChange(key: keyof Exclude<typeof value, null | undefined>, v: string) {
  //   const newValue = {
  //     ...value,
  //     [key]: v ? Number(v) : undefined,
  //   };
  //   setValue(newValue);
  // };

  // function handleChangeYear(e: ChangeEvent<HTMLSelectElement>) {
  //   handleChange("Y", e.target.value);
  // };

  // function handleChangeMonth(e: ChangeEvent<HTMLSelectElement>) {
  //   handleChange("M", e.target.value);
  // };

  // function handleChangeDay(e: ChangeEvent<HTMLSelectElement>) {
  //   handleChange("D", e.target.value);
  // };

  // function handleChangeHour(e: ChangeEvent<HTMLSelectElement>) {
  //   handleChange("h", e.target.value);
  // };

  // function handleChangeMinute(e: ChangeEvent<HTMLSelectElement>) {
  //   handleChange("m", e.target.value);
  // };

  // function handleChangeSecond(e: ChangeEvent<HTMLSelectElement>) {
  //   handleChange("s", e.target.value);
  // };

  // const yearOptions = useMemo(() => {
  //   const options: Array<ReactNode> = [];
  //   const minY = min.getFullYear();
  //   const maxY = max.getFullYear();
  //   for (let i = minY; i <= maxY; i++) {
  //     options.push(
  //       <option
  //         key={i}
  //         value={i}
  //       >
  //         {i}
  //       </option>
  //     );
  //   }
  //   return options;
  // }, [
  //   validScripts,
  //   min,
  //   max,
  // ]);

  // const monthOptions = useMemo(() => {
  //   const options: Array<ReactNode> = [];
  //   let minM = 0, maxM = 11;
  //   if (min.getFullYear() === max.getFullYear()) {
  //     minM = min.getMonth();
  //     maxM = max.getMonth();
  //   }
  //   if (validScripts && value?.Y) {
  //     if (min.getFullYear() === value.Y) {
  //       minM = min.getMonth();
  //     }
  //     if (max.getFullYear() === value.Y) {
  //       maxM = max.getMonth();
  //     }
  //   }
  //   for (let i = minM; i <= maxM; i++) {
  //     options.push(
  //       <option
  //         key={i}
  //         value={i + 1}
  //       >
  //         {i + 1}
  //       </option>
  //     )
  //   }
  //   return options;
  // }, [
  //   validScripts,
  //   min,
  //   max,
  //   value?.Y,
  // ]);

  // const dayOptions = useMemo(() => {
  //   const options: Array<ReactNode> = [];
  //   if (dataItem.type === "month") return options;
  //   let minD = 1, maxD = 31;
  //   if (validScripts) {
  //     if ((min.getMonth() + 1) === value?.M && min.getFullYear() === value.Y) {
  //       minD = min.getDate();
  //     }
  //     if ((max.getMonth() + 1) === value?.M && max.getFullYear() === value.Y) {
  //       maxD = max.getDate();
  //     }
  //     if (value?.Y != null && value.M != null) {
  //       maxD = Math.min(maxD, new Date(value.Y, value.M, 0).getDate());
  //     }
  //   }
  //   for (let i = minD; i <= maxD; i++) {
  //     options.push(
  //       <option
  //         key={i}
  //         value={i}
  //       >
  //         {i}
  //       </option>
  //     );
  //   }
  //   return options;
  // }, [
  //   validScripts,
  //   min,
  //   max,
  //   value?.Y,
  //   value?.M,
  // ]);

  // const hourOptions = useMemo(() => {
  //   const options: Array<ReactNode> = [];
  //   if (dataItem.type !== "datetime") return options;
  //   let minH = 0, maxH = 23, step = 1;
  //   if (validScripts) {
  //     if (value?.Y != null && value.M != null && value.D != null) {
  //       if (min.getDate() === value.D && (min.getMonth() + 1) === value.M && min.getFullYear() === value.Y) {
  //         minH = min.getHours();
  //       }
  //       if (max.getDate() === value.D && (max.getMonth() + 1) === value.M && max.getFullYear() === value.Y) {
  //         maxH = max.getHours();
  //       }
  //     }
  //   }
  //   minH = Math.max(minH, minTime.h);
  //   maxH = Math.min(maxH, maxTime.h);
  //   if (time === "hour") {
  //     step = Math.ceil(dataItem.step || 1);
  //   }
  //   for (let i = minH; i <= maxH; i += step) {
  //     options.push(
  //       <option
  //         key={i}
  //         value={i}
  //       >
  //         {`0${i}`.slice(-2)}
  //       </option>
  //     );
  //   }
  //   return options;
  // }, [
  //   validScripts,
  //   min,
  //   max,
  //   value?.Y,
  //   value?.M,
  //   value?.D,
  // ]);

  // const minuteOptions = useMemo(() => {
  //   const options: Array<ReactNode> = [];
  //   if (dataItem.type !== "datetime" || time === "hour") return options;
  //   let minM = 0, maxM = 59, step = 1;
  //   if (validScripts) {
  //     if (value?.Y != null && value.M != null && value.D != null) {
  //       if (min.getHours() === value.h && min.getDate() === value.D && (min.getMonth() + 1) === value.M && min.getFullYear() === value.Y) {
  //         minM = min.getMinutes();
  //       }
  //       if (max.getHours() === value.h && max.getDate() === value.D && (max.getMonth() + 1) === value.M && max.getFullYear() === value.Y) {
  //         maxM = max.getMinutes();
  //       }
  //     }
  //     if (minTime.h === value?.h) {
  //       minM = Math.max(minM, minTime.m);
  //     }
  //     if (maxTime.h === value?.h) {
  //       maxM = Math.min(maxM, maxTime.m);
  //     }
  //   }
  //   if (time === "minute") {
  //     step = Math.ceil(dataItem.step || 1);
  //   }
  //   for (let i = minM; i <= maxM; i += step) {
  //     options.push(
  //       <option
  //         key={i}
  //         value={i}
  //       >
  //         {`0${i}`.slice(-2)}
  //       </option>
  //     );
  //   }
  //   return options;
  // }, [
  //   validScripts,
  //   min,
  //   max,
  //   value?.Y,
  //   value?.M,
  //   value?.D,
  //   value?.h,
  // ]);

  // const secondOptions = useMemo(() => {
  //   const options: Array<ReactNode> = [];
  //   if (dataItem.type !== "datetime" || time !== "second") return options;
  //   let minS = 0, maxS = 59, step = 1;
  //   if (validScripts) {
  //     if (value?.Y != null && value.M != null && value.D != null) {
  //       if (min.getMinutes() === value.m && min.getHours() === value.h && min.getDate() === value.D && (min.getMonth() + 1) === value.M && min.getFullYear() === value.Y) {
  //         minS = min.getSeconds();
  //       }
  //       if (max.getMinutes() === value.m && max.getHours() === value.h && max.getDate() === value.D && (max.getMonth() + 1) === value.M && max.getFullYear() === value.Y) {
  //         maxS = max.getSeconds();
  //       }
  //     }
  //     if (minTime.m === value?.m && minTime.h === value.h) {
  //       minS = Math.max(minS, minTime.s);
  //     }
  //     if (maxTime.m === value?.m && maxTime.h === value.h) {
  //       maxS = Math.min(maxS, maxTime.s);
  //     }
  //   }
  //   if (time === "second") {
  //     step = Math.ceil(dataItem.step || 1);
  //   }
  //   for (let i = minS; i <= maxS; i += step) {
  //     options.push(
  //       <option
  //         key={i}
  //         value={i}
  //       >
  //         {`0${i}`.slice(-2)}
  //       </option>
  //     );
  //   }
  //   return options;
  // }, [
  //   validScripts,
  //   min,
  //   max,
  //   value?.Y,
  //   value?.M,
  //   value?.D,
  //   value?.h,
  //   value?.m,
  // ]);

  // const isReadOnly = !state.current.disabled && state.current.readonly;

  // return (
  //   <InputGroup
  //     {...props}
  //     ref={ref}
  //     core={{
  //       state,
  //       result,
  //     }}
  //   >
  //     <InputField
  //       core={{
  //         state: {
  //           current: {
  //             ...state.current,
  //             disabled: state.current.disabled || split?.Y?.disabled,
  //             readonly: state.current.readonly || split?.Y?.readOnly,
  //           },
  //         },
  //       }}
  //     >
  //       <select
  //         className="ipt-main ipt-select"
  //         name={names.year}
  //         required={required || !!split?.Y?.required}
  //         disabled={!state.current.enabled || split?.Y?.readOnly || split?.Y?.disabled}
  //         aria-disabled={state.current.disabled || split?.Y?.disabled}
  //         aria-readonly={state.current.readonly || split?.Y?.readOnly}
  //         defaultValue={value?.Y || undefined}
  //         onChange={handleChangeYear}
  //         aria-label={label}
  //         aria-invalid={invalid}
  //         aria-errormessage={errormessage}
  //       >
  //         <option
  //           value=""
  //           data-notext="true"
  //         >
  //           &nbsp;
  //         </option>
  //         {yearOptions}
  //       </select>
  //       <Placeholder>{placeholder?.[0]}</Placeholder>
  //       <div
  //         className={clsx(
  //           "ipt-btn",
  //           !state.current.enabled && "opacity-0"
  //         )}
  //       />
  //       {(isReadOnly && !split?.Y?.disabled && split?.Y?.readOnly) &&
  //         <input
  //           type="hidden"
  //           name={names.year}
  //           value={value?.Y || undefined}
  //         />
  //       }
  //     </InputField>
  //     <SepSpan>/</SepSpan>
  //     <InputField
  //       core={{
  //         disabled: state.current.disabled || split?.M?.disabled,
  //         readOnly: state.current.readonly || split?.M?.readOnly,
  //       }}
  //     >
  //       <select
  //         className="ipt-main ipt-select"
  //         name={names.month}
  //         required={required || !!split?.M?.required}
  //         disabled={!state.current.enabled || split?.M?.readOnly || split?.M?.disabled}
  //         aria-disabled={state.current.disabled || split?.M?.disabled}
  //         aria-readonly={state.current.readonly || split?.M?.readOnly}
  //         defaultValue={value?.M || undefined}
  //         onChange={handleChangeMonth}
  //         aria-label={label}
  //         aria-invalid={invalid}
  //         aria-errormessage={errormessage}
  //       >
  //         <option
  //           value=""
  //           data-notext="true"
  //         >
  //           &nbsp;
  //         </option>
  //         {monthOptions}
  //       </select>
  //       <Placeholder>{placeholder?.[1]}</Placeholder>
  //       <div
  //         className={clsx(
  //           "ipt-btn",
  //           !state.current.enabled && "opacity-0"
  //         )}
  //       />
  //       {(isReadOnly && !split?.M?.disabled && split?.M?.readOnly) &&
  //         <input
  //           type="hidden"
  //           name={names.month}
  //           value={value?.M || undefined}
  //         />
  //       }
  //     </InputField>
  //     {dataItem.type !== "month" &&
  //       <>
  //         <SepSpan>/</SepSpan>
  //         <InputField
  //           core={{
  //             disabled: state.current.disabled || split?.D?.disabled,
  //             readOnly: state.current.readonly || split?.D?.readOnly,
  //           }}
  //         >
  //           <select
  //             className="ipt-main ipt-select"
  //             name={names.date}
  //             required={required || !!split?.D?.required}
  //             disabled={!state.current.enabled || split?.D?.readOnly || split?.D?.disabled}
  //             aria-disabled={state.current.disabled || split?.D?.disabled}
  //             aria-readonly={state.current.readonly || split?.D?.readOnly}
  //             defaultValue={value?.D || undefined}
  //             onChange={handleChangeDay}
  //             aria-label={label}
  //             aria-invalid={invalid}
  //             aria-errormessage={errormessage}
  //           >
  //             <option
  //               value=""
  //               data-notext="true"
  //             >
  //               &nbsp;
  //             </option>
  //             {dayOptions}
  //           </select>
  //           <Placeholder>{placeholder?.[2]}</Placeholder>
  //           <div
  //             className={clsx(
  //               "ipt-btn",
  //               !state.current.enabled && "opacity-0"
  //             )}
  //           />
  //           {(isReadOnly && !split?.D?.disabled && split?.D?.readOnly) &&
  //             <input
  //               type="hidden"
  //               name={names.date}
  //               value={value?.D || undefined}
  //             />
  //           }
  //         </InputField>
  //         {dataItem.type === "datetime" &&
  //           <>
  //             <SepSpan>&nbsp;</SepSpan>
  //             <InputField
  //               core={{
  //                 state: {
  //                   current: {
  //                     ...state.current,
  //                     disabled: state.current.disabled || split?.h?.disabled,
  //                     readonly: state.current.readonly || split?.h?.readOnly,
  //                   },
  //                 },
  //               }}
  //             >
  //               <select
  //                 className="ipt-main ipt-select"
  //                 name={names.hour}
  //                 required={required || !!split?.h?.required}
  //                 disabled={!state.current.enabled || split?.h?.readOnly || split?.h?.disabled}
  //                 aria-disabled={state.current.disabled || split?.h?.disabled}
  //                 aria-readonly={state.current.readonly || split?.h?.readOnly}
  //                 defaultValue={value?.h || undefined}
  //                 onChange={handleChangeHour}
  //                 aria-label={label}
  //                 aria-invalid={invalid}
  //                 aria-errormessage={errormessage}
  //               >
  //                 <option
  //                   value=""
  //                   data-notext="true"
  //                 >
  //                   &nbsp;
  //                 </option>
  //                 {hourOptions}
  //               </select>
  //               <Placeholder>{placeholder?.[3]}</Placeholder>
  //               <div
  //                 className={clsx(
  //                   "ipt-btn",
  //                   !state.current.enabled && "opacity-0"
  //                 )}
  //               />
  //               {(isReadOnly && !split?.h?.disabled && split?.h?.readOnly) &&
  //                 <input
  //                   type="hidden"
  //                   name={names.hour}
  //                   value={value?.h || undefined}
  //                 />
  //               }
  //             </InputField>
  //             <SepSpan>:</SepSpan>
  //             {time === "hour" ?
  //               <span>00</span>
  //               :
  //               <>
  //                 <InputField
  //                   core={{
  //                     state: {
  //                       current: {
  //                         ...state.current,
  //                         disabled: state.current.disabled || split?.m?.disabled,
  //                         readonly: state.current.readonly || split?.m?.readOnly,
  //                       },
  //                     },
  //                   }}
  //                 >
  //                   <select
  //                     className="ipt-main ipt-select"
  //                     name={names.minute}
  //                     required={required || !!split?.m?.required}
  //                     disabled={!state.current.enabled || split?.m?.readOnly || split?.m?.disabled}
  //                     aria-disabled={state.current.disabled || split?.m?.disabled}
  //                     aria-readonly={state.current.readonly || split?.m?.readOnly}
  //                     defaultValue={value?.m || undefined}
  //                     onChange={handleChangeMinute}
  //                     aria-label={label}
  //                     aria-invalid={invalid}
  //                     aria-errormessage={errormessage}
  //                   >
  //                     <option
  //                       value=""
  //                       data-notext="true"
  //                     >
  //                       &nbsp;
  //                     </option>
  //                     {minuteOptions}
  //                   </select>
  //                   <Placeholder>{placeholder?.[4]}</Placeholder>
  //                   <div
  //                     className={clsx(
  //                       "ipt-btn",
  //                       !state.current.enabled && "opacity-0"
  //                     )}
  //                   />
  //                   {(isReadOnly && !split?.m?.disabled && split?.m?.readOnly) &&
  //                     <input
  //                       type="hidden"
  //                       name={names.month}
  //                       value={value?.m || undefined}
  //                     />
  //                   }
  //                 </InputField>
  //                 {time === "second" &&
  //                   <>
  //                     <SepSpan>:</SepSpan>
  //                     <InputField
  //                       core={{
  //                         state: {
  //                           current: {
  //                             ...state.current,
  //                             disabled: state.current.disabled || split?.s?.disabled,
  //                             readonly: state.current.readonly || split?.s?.readOnly,
  //                           },
  //                         },
  //                       }}
  //                     >
  //                       <select
  //                         className="ipt-main ipt-select"
  //                         name={names.second}
  //                         required={required || !!split?.s?.required}
  //                         disabled={!state.current.enabled || split?.s?.readOnly || split?.s?.disabled}
  //                         aria-disabled={state.current.disabled || split?.s?.disabled}
  //                         aria-readonly={state.current.readonly || split?.s?.readOnly}
  //                         defaultValue={value?.s || undefined}
  //                         onChange={handleChangeSecond}
  //                         aria-label={label}
  //                         aria-invalid={invalid}
  //                         aria-errormessage={errormessage}
  //                       >
  //                         <option
  //                           value=""
  //                           data-notext="true"
  //                         >
  //                           &nbsp;
  //                         </option>
  //                         {secondOptions}
  //                       </select>
  //                       <Placeholder>{placeholder?.[5]}</Placeholder>
  //                       <div
  //                         className={clsx(
  //                           "ipt-btn",
  //                           !state.current.enabled && "opacity-0"
  //                         )}
  //                       />
  //                       {(isReadOnly && !split?.s?.disabled && split?.s?.readOnly) &&
  //                         <input
  //                           type="hidden"
  //                           name={names.second}
  //                           value={value?.s || undefined}
  //                         />
  //                       }
  //                     </InputField>
  //                   </>
  //                 }
  //               </>
  //             }
  //           </>
  //         }
  //       </>
  //     }
  //   </InputGroup>
  // );
};