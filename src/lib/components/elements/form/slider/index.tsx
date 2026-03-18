import { use, useId, useImperativeHandle, useRef, type ChangeEvent, type HTMLAttributes, type InputHTMLAttributes } from "react";
import { ValidScriptsContext } from "../../../../shared/providers/valid-scripts";
import { Style } from "../../style";
import { clsx, getColorClassName } from "../../utilities";
import { InputDummyFocus } from "../dummy-focus";
import { InputLabelWrapper, type InputLabelProps, type InputLabelWrapperProps } from "../wrapper/input-label";

/** スライダー ref オブジェクト */
export interface Slider$Ref extends InputRef {
  /** DOM input[type="slider"] */
  inputElement: HTMLInputElement;
};

/** スライダー Props */
export type Slider$Props = Overwrite<
  InputLabelWrapperProps,
  InputLabelProps<{
    /** input Props */
    inputProps?: Overwrite<
      Omit<
        InputHTMLAttributes<HTMLInputElement>,
        InputOmitProps
      >,
      {
        /** 最小値 @default 0 */
        min?: number;
        /** 最大値 @default 100 */
        max?: number;
        /** ステップ @default 1 */
        step?: number;
      }
    >;
    /** 配色 */
    color?: StyleColor;
    /** 数値ラベル表示 */
    showValueText?: boolean;
    /** 数値ラベル Props */
    valueTextProps?: HTMLAttributes<HTMLSpanElement>;
    /** データリスト（目盛り） */
    dataList?: {
      /** id */
      id: string;
      /** 目盛りアイテム（配列） */
      source: Schema.Source<number | null | undefined>;
      /** 目盛り非表示 @default false */
      hideScales?: boolean;
    };
  } & InputValueProps<number, number | undefined>>
>;

const DEFAULT_MIN = 0; // デフォルト最小値
const DEFAULT_MAX = 100; // デフォルト最大値

/**
 * スライダー
 * @param param {@link Slider$Props}
 * @returns
 */
export function Slider$({
  ref,
  invalid,
  inputProps,
  state = "enabled",
  className,
  children,
  color,
  showValueText,
  valueTextProps,
  dataList,
  defaultValue,
  onChangeValue,
  ...props
}: Slider$Props) {
  const validScripts = use(ValidScriptsContext);

  const isControlled = "value" in props;
  const { value, ...wrapperProps } = props;

  const id = useId();
  const inputId = inputProps?.id || id;
  const min = inputProps?.min ?? DEFAULT_MIN;
  const max = inputProps?.max ?? DEFAULT_MAX;
  const step = Math.abs(inputProps?.step ?? 1);

  const wref = useRef<HTMLLabelElement>(null!);
  const iref = useRef<HTMLInputElement>(null!);
  const dref = useRef<HTMLDivElement | null>(null);

  function createSetter() {
    return Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  };
  const setterRef = useRef<ReturnType<typeof createSetter> | null>(null);

  function getRate(value: number | null | undefined) {
    if (value == null) return 0;
    return Math.round(((value - min) / (max - min)) * 100);
  };

  function handleClickOption(v: number | null | undefined) {
    if (state !== "enabled") return;
    if (setterRef.current == null) {
      setterRef.current = createSetter();
    }
    setterRef.current?.call(
      iref.current,
      v == null ? "" : String(v)
    );
    iref.current.dispatchEvent(
      new Event("input", { bubbles: true })
    );
  };

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (state === "enabled") {
      onChangeValue?.(
        e.currentTarget.value === ""
          ? undefined
          : e.currentTarget.valueAsNumber
      );
    }
    inputProps?.onChange?.(e);
  };

  useImperativeHandle(ref, () => ({
    element: wref.current,
    inputElement: iref.current,
    focus: () => (dref.current ?? iref.current).focus(),
  } as const satisfies Slider$Ref));

  return (
    <InputLabelWrapper
      {...wrapperProps}
      ref={wref}
      state={state}
      className={clsx(
        "_ipt-slider-wrap",
        className,
      )}
    >
      {
        validScripts &&
        <Style suppressHydrationWarning={!inputProps?.id}>
          {`#${inputId}{--rate:${getRate(value)}%}`}
        </Style>
      }
      <input
        disabled={state !== "enabled"}
        aria-disabled={state === "disabled"}
        aria-readonly={state === "readonly"}
        aria-invalid={invalid}
        list={dataList?.id}
        suppressHydrationWarning={!inputProps?.id}
        {...inputProps}
        id={inputId}
        className={clsx(
          "_ipt-slider",
          getColorClassName(color),
          inputProps?.className,
        )}
        ref={iref}
        type="range"
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        {...isControlled
          ? { value: value ?? "" }
          : { defaultValue: defaultValue ?? "" }
        }
      />
      {
        showValueText &&
        value != null &&
        <span
          {...valueTextProps}
          className={clsx(
            "_ipt-slider-label",
            valueTextProps?.className,
          )}
        >
          {value}
        </span>
      }
      {
        state === "readonly" &&
        <>
          {
            inputProps?.name &&
            <input
              type="hidden"
              name={inputProps.name}
              value={value == null ? "" : String(value)}
            />
          }
          <InputDummyFocus
            ref={dref}
          />
        </>
      }
      {
        dataList &&
        <>
          <datalist id={dataList.id}>
            {dataList.source.map(item => {
              return (
                <option
                  key={item.value}
                  value={item.value ?? ""}
                >
                  {item.text}
                </option>
              );
            })}
          </datalist>
          {
            !dataList.hideScales &&
            <ul
              className="_ipt-slider-scales"
            >
              <Style suppressHydrationWarning={!inputProps?.id}>
                {
                  dataList.source.map(item =>
                    `#${inputId}_${item.value}{--rate:${getRate(item.value)}%}`
                  ).join("")
                }
              </Style>
              {dataList.source.map(item => {
                return (
                  <li
                    key={item.value}
                    className="_ipt-slider-tick"
                    id={`${inputId}_${item.value}`}
                    suppressHydrationWarning={!inputProps?.id}
                    onClick={() => {
                      handleClickOption(item.value);
                    }}
                  >
                    {item.text}
                  </li>
                );
              })}
            </ul>
          }
        </>
      }
    </InputLabelWrapper>
  );
};
