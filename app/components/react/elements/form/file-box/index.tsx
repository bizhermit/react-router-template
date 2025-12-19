import { use, useImperativeHandle, useRef, type DragEvent, type InputHTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode, type RefObject } from "react";
import { ValidScriptsContext } from "~/components/react/providers/valid-scripts";
import { clsx } from "../../utilities";
import { InputField, Placeholder, type InputFieldProps, type InputRef } from "../common";

export interface FileBox$Ref extends InputRef {
  inputElement: HTMLInputElement;
};

export type FileBox$Props = Overwrite<InputFieldProps, {
  ref?: RefObject<InputRef | null>;
  inputProps?: Overwrite<InputHTMLAttributes<HTMLInputElement>, {
    placeholder?: ReactNode;
  }>;
  children?: ReactNode;
}>;

const DRAGGING_CLASSNAME = ["bg-sky-500", "dark:bg-sky-900"];

export function FileBox$({
  ref,
  inputProps,
  state = { current: "enabled" },
  children,
  ...props
}: FileBox$Props) {
  const validScripts = use(ValidScriptsContext).valid;

  const wref = useRef<HTMLDivElement>(null!);
  const iref = useRef<HTMLInputElement>(null!);

  function handleDragEnter(e: DragEvent<HTMLInputElement>) {
    if (state.current === "enabled") {
      e.currentTarget.parentElement?.classList.add(...DRAGGING_CLASSNAME);
    }
    inputProps?.onDragEnter?.(e);
  };

  function handleDragLeave(e: DragEvent<HTMLInputElement>) {
    if (state.current === "enabled") {
      e.currentTarget.parentElement?.classList.remove(...DRAGGING_CLASSNAME);
    }
    inputProps?.onDragLeave?.(e);
  };

  function handleDrop(e: DragEvent<HTMLInputElement>) {
    if (state.current === "enabled") {
      e.currentTarget.parentElement?.classList.remove(...DRAGGING_CLASSNAME);
    } else {
      e.preventDefault();
    }
    inputProps?.onDrop?.(e);
  };

  function handleClick(e: MouseEvent<HTMLInputElement>) {
    if (state.current !== "enabled") e.preventDefault();
    inputProps?.onClick?.(e);
  };

  function handleKeydown(e: KeyboardEvent<HTMLInputElement>) {
    if (state.current !== "enabled") {
      if (e.key === "Enter" || e.key === " ") e.preventDefault();
    }
    inputProps?.onKeyDown?.(e);
  }

  useImperativeHandle(ref, () => ({
    element: wref.current,
    inputElement: iref.current,
    focus: () => iref.current.focus(),
  } as const satisfies FileBox$Ref));

  return (
    <InputField
      {...props}
      ref={wref}
      state={state}
    >
      <input
        disabled={state.current === "disabled"}
        aria-disabled={state.current === "disabled"}
        aria-readonly={state.current === "readonly"}
        {...inputProps}
        className={clsx(
          "_ipt-file",
          state.current === "enabled" && "cursor-pointer",
          validScripts && inputProps?.placeholder && "absolute opacity-0",
          inputProps?.className
        )}
        ref={iref}
        type="file"
        placeholder={undefined}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeydown}
      />
      {
        validScripts &&
        inputProps?.placeholder &&
        <Placeholder
          className="relative pr-input-pad-x"
          state={state}
          validScripts={validScripts}
        >
          {inputProps?.placeholder}
        </Placeholder>
      }
    </InputField>
  );
}
