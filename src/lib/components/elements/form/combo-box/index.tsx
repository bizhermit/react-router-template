import { createContext, use, useId, useImperativeHandle, useMemo, useRef, useState, type ChangeEvent, type HTMLAttributes, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { ValidScriptsContext } from "../../../../shared/providers/valid-scripts";
import { DownIcon } from "../../icon";
import { clsx } from "../../utilities";
import { InputFieldWrapper, type InputFieldWrapperProps } from "../wrapper/input-field";

type AtomValueType = string | number | boolean;

export interface ComboBox$Ref extends InputRef {
  inputElement: HTMLInputElement;
};

export type ComboBox$Props = Overwrite<
  InputFieldWrapperProps,
  {
    invalid?: boolean;
    name?: string;
    initValue?: AtomValueType | null | undefined;
    placeholder?: string;
    children?: ReactNode;
  } & (
    | ({
      multiple?: false;
    } & InputValueProps<AtomValueType, string>)
    | ({
      multiple: true;
    } & InputValueProps<AtomValueType[]>)
  )
>;

export interface ComboBoxContextProps {
  name: string;
  popoverId: string;
  multiple: boolean;
  state: Schema.Mode;
  value: AtomValueType[];
  isControlled: boolean;
  filterText: string;
  change: () => void;
};

const SelectBoxContext = createContext<ComboBoxContextProps | null>(null);

export function ComboBox$({
  ref,
  invalid,
  className,
  style,
  placeholder,
  state = "enabled",
  children,
  name,
  multiple = false,
  defaultValue,
  initValue,
  onChange,
  onKeyDown,
  onChangeValue,
  ...props
}: ComboBox$Props) {
  const validScripts = use(ValidScriptsContext).valid;

  const isControlled = "value" in props;
  const { value, ...wrapperProps } = props;

  const id = useId();
  const $name = name || id;
  const popoverId = `${$name}_picker`;

  const arrayValue = useMemo(() => {
    if (value == null || value === "") return [];
    if (Array.isArray(value)) return value;
    return [value];
  }, [value]);

  const [filterText, setFilterText] = useState("");

  function handleChangeText(e: ChangeEvent<HTMLInputElement>) {
    setFilterText(e.currentTarget.value);
  };

  return (
    <InputFieldWrapper
      {...wrapperProps}
      className={clsx(
        "_ipt-combox-box",
        className,
      )}
      style={{
        ...style,
        anchorName: `--${popoverId}`,
      }}
      state={state}
    >
      <input
        type="text"
        disabled={state === "disabled"}
        readOnly={state === "readonly" || !validScripts}
        aria-invalid={invalid}
        className="_ipt-box _ipt-combo-text"
        onChange={handleChangeText}
        placeholder={placeholder}
        data-validjs={validScripts}
      />
      <button
        type="button"
        className={clsx(
          "_ipt-btn",
          state === "enabled" ? "cursor-pointer" : "opacity-0",
        )}
        tabIndex={-1}
      >
        <DownIcon />
      </button>
      <div
        className="_ipt-combo-picker"
      // style={{
      //   anchorName: `--${popoverId}`,
      // }}
      >
        <div
          className="_ipt-combo-list"
          tabIndex={-1}
          style={{
            positionAnchor: `--${popoverId}`,
          }}
        >
          <SelectBoxContext
            value={{
              name: $name,
              popoverId,
              multiple,
              state,
              value: arrayValue,
              isControlled,
              filterText,
              change: () => { },
            }}
          >
            {children}
          </SelectBoxContext>
        </div>
      </div>
    </InputFieldWrapper>
  );

  // const arrayValue = value
  //   ? (Array.isArray(value) ? value : [value])
  //   : [];

  // const wref = useRef<HTMLDivElement>(null!);
  // const iref = useRef<HTMLInputElement>(null!);
  // const dref = useRef<HTMLDivElement>(null!);
  // const lref = useRef<HTMLDivElement>(null!);

  // const [filterText, setFilterText] = useState("");
  // const [selectedItems, setSelectedItems] = useState<{ value: string; label: string; }[]>([]);

  // const id = useId();
  // const $name = name || id;
  // const popoverId = `${$name}_picker`;

  // function scrollToInitValue() {
  //   if (initValue == null) return;
  //   if (lref.current.querySelector(`input:checked`)) return;
  //   const iv = String(initValue ?? "");
  //   const target = lref.current.querySelector(`input[value="${iv}"]`) as HTMLElement | null;
  //   if (!target) return;
  //   lref.current.scrollTop = target.offsetTop - (lref.current.offsetHeight - target.offsetHeight) / 2;
  // };

  // function focusComboListItem() {
  //   let target = lref.current.querySelector(`label[aria-hidden="false"]:has(input:checked)`);
  //   if (!target && initValue != null) {
  //     target = lref.current.querySelector(`label[aria-hidden="false"]:has(input[value="${initValue}"])`);
  //   }
  //   if (!target) target = lref.current.querySelector(`label[aria-hidden="false"]:has(input)`);
  //   if (!target) return;
  //   (target as HTMLLabelElement).focus();
  // };

  // function selectByText(text: string) {
  //   if (state !== "enabled") return;
  //   if (multiple) return;
  //   if (text == null || text === "") return;
  //   const elems = Array.from(lref.current.querySelectorAll(`label[aria-hidden="false"]`));
  //   if (elems.length !== 1) return;
  //   const elem = elems[0].querySelector("input") as HTMLInputElement | null;
  //   if (!elem) return;
  //   if (elem.getAttribute("aria-label") !== text) return;
  //   elem.checked = true;
  //   change(false);
  // }

  // const showPopover = useCallback(() => {
  //   dref.current.showPopover();
  // }, []);

  // const hidePopover = useCallback(() => {
  //   dref.current.hidePopover();
  // }, []);

  // function change(focus = true) {
  //   if (state !== "enabled") return;
  //   if (multiple) {
  //     const elems = Array.from(dref.current.querySelectorAll(`input:checked`)) as HTMLInputElement[];
  //     (onChangeValue as (v: string[]) => void | undefined)?.(
  //       elems.map(elem => {
  //         return (elem as HTMLInputElement).value;
  //       })
  //     );
  //     setSelectedItems(
  //       elems.map(elem => {
  //         return {
  //           value: elem.value || "",
  //           label: elem.getAttribute("aria-label") || "",
  //         };
  //       }).filter(item => !(item.value == null || item.value === ""))
  //     );
  //   } else {
  //     const checkedElem = dref.current.querySelector(`input:checked`) as (HTMLInputElement | null);
  //     const v = checkedElem?.value || "";
  //     const label = checkedElem?.getAttribute("aria-label") || "";
  //     iref.current.value = label;
  //     (onChangeValue as (v: string) => void | undefined)?.(v);
  //     setSelectedItems((v == null || v === "") ? [] : [{ value: v, label }]);
  //     if (focus) iref.current.focus();
  //     hidePopover();
  //   }
  // };

  // function handleChange(e: ChangeEvent<HTMLDivElement>) {
  //   change();
  //   onChange?.(e);
  // };

  // function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
  //   switch (e.key) {
  //     case "Escape":
  //       iref.current.focus();
  //       setFilterText("");
  //       hidePopover();
  //       break;
  //     default:
  //       break;
  //   }
  //   onKeyDown?.(e);
  // };

  // function handleChangeText(e: ChangeEvent<HTMLInputElement>) {
  //   e.stopPropagation();
  //   setFilterText(e.currentTarget.value || "");
  //   showPopover();
  // };

  // function handleFocusText() {
  //   if (state === "enabled") {
  //     showPopover();
  //   }
  // };

  // function handleMouseDownText() {
  //   if (state === "enabled") {
  //     showPopover();
  //   }
  // };

  // function handleKeyDownText(e: KeyboardEvent<HTMLInputElement>) {
  //   switch (e.key) {
  //     case "Tab":
  //       hidePopover();
  //       break;
  //     case "F2":
  //     case "ArrowUp":
  //     case "ArrowDown":
  //       e.preventDefault();
  //       showPopover();
  //       focusComboListItem();
  //       break;
  //     case "Enter":
  //       selectByText(filterText);
  //       break;
  //     default:
  //       break;
  //   }
  // };

  // function handleScroll(e: UIEvent) {
  //   e.stopPropagation();
  // };

  // const windowClickEventListener = useCallback((e: MouseEvent) => {
  //   if (containElement(wref.current, e.target as Element)) return;
  //   hidePopover();
  // }, []);

  // function removePopoveredEvents() {
  //   window.removeEventListener("scroll", hidePopover);
  //   window.removeEventListener("click", windowClickEventListener);
  // };

  // function handleToggle(e: ToggleEvent) {
  //   if (e.newState === "open") {
  //     iref.current.focus();
  //     scrollToInitValue();
  //     window.addEventListener("scroll", hidePopover, { once: true });
  //     window.addEventListener("click", windowClickEventListener);
  //   } else {
  //     if (multiple) {
  //       iref.current.value = "";
  //     } else {
  //       iref.current.value = selectedItems[0]?.label || "";
  //     }
  //     selectByText(filterText);
  //     setFilterText("");
  //     removePopoveredEvents();
  //   }
  // };

  // useEffect(() => {
  //   return () => {
  //     removePopoveredEvents();
  //   };
  // }, []);

  // return (
  //   <InputFieldWrapper
  //     {...wrapperProps}
  //     className={clsx(
  //       "_ipt-combo-box",
  //       className,
  //     )}
  //     style={{
  //       ...style,
  //       anchorName: `--${popoverId}`,
  //     }}
  //     ref={wref}
  //     state={state}
  //     onChange={handleChange}
  //     onKeyDown={handleKeyDown}
  //   >
  //     <input
  //       type="text"
  //       disabled={state === "disabled"}
  //       readOnly={state === "readonly" || !validScripts}
  //       aria-invalid={invalid}
  //       ref={iref}
  //       className="_ipt-box _ipt-combo-text"
  //       onChange={handleChangeText}
  //       onFocus={handleFocusText}
  //       onMouseDown={handleMouseDownText}
  //       onKeyDown={handleKeyDownText}
  //       popoverTarget={popoverId}
  //       placeholder={selectedItems.length > 0 ? undefined : placeholder}
  //     />
  //     {
  //       validScripts && multiple &&
  //       <ol className="_ipt-combo-display">
  //         {
  //           selectedItems.map(item => {
  //             return (
  //               <div
  //                 key={item.value}
  //                 className="_ipt-combo-display-item"
  //               >
  //                 {item.label}
  //               </div>
  //             );
  //           })
  //         }
  //       </ol>
  //     }
  //     <button
  //       type="button"
  //       className={clsx(
  //         "_ipt-combo-btn",
  //         state !== "enabled" && "opacity-0"
  //       )}
  //       disabled={state !== "enabled"}
  //       tabIndex={validScripts ? -1 : undefined}
  //       popoverTarget={popoverId}
  //       data-js={validScripts}
  //     >
  //       <div
  //         className="_ipt-btn"
  //       >
  //         <DownIcon />
  //       </div>
  //     </button>
  //     <SelectBoxContext
  //       value={{
  //         name: $name,
  //         popoverId,
  //         multiple,
  //         state,
  //         value: arrayValue,
  //         isControlled,
  //         filterText,
  //         change,
  //       }}
  //     >
  //       <div
  //         popover={validScripts ? "manual" : "auto"}
  //         id={popoverId}
  //         ref={dref}
  //         className="_ipt-combo-popover"
  //         style={{
  //           positionAnchor: `--${popoverId}`,
  //         }}
  //         onToggle={handleToggle}
  //         onClick={e => e.stopPropagation()}
  //         data-js={validScripts}
  //       >
  //         <div className="_ipt-combo-list-wrapper">
  //           <div
  //             ref={lref}
  //             className="_ipt-combo-list"
  //             onScroll={handleScroll}
  //           >
  //             {children}
  //           </div>
  //         </div>
  //       </div>
  //     </SelectBoxContext>
  //   </InputFieldWrapper>
  // );
};

export type ComboBox$OptionProps = Overwrite<
  HTMLAttributes<HTMLLabelElement>,
  {
    ref?: RefObject<HTMLLabelElement>;
    value: string | number | boolean | null | undefined;
    onMovePrev?: () => void;
    onMoveNext?: () => void;
  } & (
    | {
      displayValue: string;
      children: ReactNode;
    }
    | {
      displayValue?: never;
      children: string;
    }
  )
>;

export function ComboBox$Item({
  ref,
  value,
  className,
  children,
  displayValue,
  onMovePrev,
  onMoveNext,
  ...props
}: ComboBox$OptionProps) {
  const ctx = use(SelectBoxContext);

  const text = displayValue ?? children;

  const wref = useRef<HTMLLabelElement>(null!);
  const iref = useRef<HTMLInputElement>(null!);

  function movePrevItem() {
    // if (onMovePrev) {
    //   onMovePrev();
    //   return;
    // }
    // let elem: HTMLElement | null = wref.current;
    // while (elem) {
    //   elem = (elem.previousElementSibling as HTMLElement | null);
    //   if (!elem) return;
    //   if (elem.getAttribute("aria-hidden") === "true") continue;
    //   elem.focus();
    //   break;
    // }
  };

  function moveNextItem() {
    // if (onMoveNext) {
    //   onMoveNext();
    //   return;
    // }
    // let elem: HTMLElement | null = wref.current;
    // while (elem) {
    //   elem = (elem.nextElementSibling as HTMLElement | null);
    //   if (!elem) return;
    //   if (elem.getAttribute("aria-hidden") === "true") continue;
    //   elem.focus();
    //   break;
    // }
  };

  function handleKeydown(e: KeyboardEvent<HTMLLabelElement>) {
    // switch (e.key) {
    //   case " ":
    //   case "Enter": {
    //     e.preventDefault();
    //     iref.current.checked = ctx?.multiple ? !iref.current.checked : true;
    //     ctx?.change();
    //     break;
    //   }
    //   case "ArrowUp":
    //     e.preventDefault();
    //     e.stopPropagation();
    //     movePrevItem();
    //     break;
    //   case "ArrowDown":
    //     e.preventDefault();
    //     e.stopPropagation();
    //     moveNextItem();
    //     break;
    //   case "Tab":
    //     e.preventDefault();
    //     if (e.shiftKey) movePrevItem();
    //     else moveNextItem();
    //     break;
    //   default:
    //     break;
    // }
  };

  useImperativeHandle(ref, () => wref.current);

  if (ctx == null) return null;

  const isHidden = !!ctx?.filterText && !text.includes(ctx.filterText);

  return (
    <label
      {...props}
      ref={wref}
      className={clsx(
        "_ipt-combo-item",
        className,
      )}
      aria-hidden={isHidden}
    >
      <input
        ref={iref}
        className="_ipt-combo-item-check"
        name={ctx.name ?? undefined}
        type={ctx.multiple ? "checkbox" : "radio"}
        disabled={ctx.state !== "enabled"}
        aria-disabled={ctx.state === "disabled"}
        aria-readonly={ctx.state === "readonly"}
        value={String(value ?? "")}
        aria-label={text}
        {...ctx.isControlled
          ? { checked: ctx.value.some(v => v === value) }
          : { defaultChecked: ctx.value.some(v => v === value) }
        }
      />
      <div className="_ipt-combo-item-label">
        {children}
      </div>
    </label>
  );
}
