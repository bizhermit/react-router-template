import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { convertBase64ToFile } from "~/components/objects/file";
import { useSchemaItem } from "~/components/react/hooks/schema";
import { clsx } from "../utilities";
import { getValidationValue, OldInputField, Placeholder, type InputWrapProps } from "./common";
import type { FormItemHookProps } from "./hooks";

export type FileBoxProps<D extends Schema.DataItem<Schema.$File>> = InputWrapProps & {
  $: D;
  placeholder?: ReactNode;
  hook?: FormItemHookProps;
} & (
    | {
      viewMode?: "link";
      onViewClick?: (context: LinkContext, e: MouseEvent<HTMLAnchorElement>) => void;
    }
    | {
      viewMode?: "image";
      onViewClick?: (context: ImageContext, e: MouseEvent<HTMLImageElement>) => void;
    }
  );

const draggingClassName = ["bg-sky-500", "dark:bg-sky-900"];

export function FileBox<D extends Schema.DataItem<Schema.$File>>({
  placeholder,
  viewMode,
  onViewClick,
  autoFocus,
  hook,
  ...$props
}: FileBoxProps<D>) {
  const ref = useRef<HTMLInputElement>(null!);

  const {
    name,
    dataItem,
    state,
    required,
    value,
    setValue,
    result,
    label,
    invalid,
    errormessage,
    validScripts,
    getCommonParams,
    omitOnSubmit,
    props,
  } = useSchemaItem<Schema.DataItem<Schema.$File>>($props, {
    effect: function ({ value }) {
      if (!ref.current) return;
      if (value == null) {
        ref.current.value = "";
        return;
      }
      if (typeof value === "string") {
        return;
      }
      const dt = new DataTransfer();
      dt.items.add(value);
      ref.current.value = "";
      ref.current.files = dt.files;
    },
    effectContext: function () {
      setAccept(getAccept);
      setMaxSize(getMaxSize);
    },
  });

  function getAccept() {
    return getValidationValue(getCommonParams(), dataItem._.accept);
  };

  const [accept, setAccept] = useState(getAccept);

  function getMaxSize() {
    return getValidationValue(getCommonParams(), dataItem._.maxSize);
  };

  const [maxSize, setMaxSize] = useState(getMaxSize);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (state.current !== "enabled") return;
    setValue(e.target.files?.[0]);
  };

  function handleDragEnter(e: DragEvent<HTMLInputElement>) {
    if (state.current !== "enabled") return;
    e.currentTarget.parentElement?.classList.add(...draggingClassName);
  };

  function handleDragLeave(e: DragEvent<HTMLInputElement>) {
    if (state.current !== "enabled") return;
    e.currentTarget.parentElement?.classList.remove(...draggingClassName);
  };

  function handleDrop(e: DragEvent<HTMLInputElement>) {
    if (state.current !== "enabled") {
      e.preventDefault();
      return;
    }
    e.currentTarget.parentElement?.classList.remove(...draggingClassName);
  };

  function handleClick(e: MouseEvent<HTMLInputElement>) {
    if (state.current !== "enabled") e.preventDefault();
  };

  function handleKeydown(e: KeyboardEvent<HTMLInputElement>) {
    if (state.current !== "enabled") {
      if (e.key === "Enter" || e.key === " ") e.preventDefault();
      return;
    }
  }

  const valueType = typeof value === "string" ? "url" : value == null ? undefined : "file";

  if (hook) {
    hook.focus = () => ref.current.focus();
  }

  return (
    <>
      <OldInputField
        {...props}
        core={{
          state,
          result,
        }}
      >
        <input
          className={clsx(
            "_ipt-file",
            state.current === "enabled" && "cursor-pointer",
            validScripts && placeholder && "absolute opacity-0",
          )}
          ref={ref}
          type="file"
          name={omitOnSubmit ? undefined : name}
          title={validScripts ? (valueType === "url" ? (value as string) : undefined) : undefined}
          disabled={state.current === "disabled"}
          aria-disabled={state.current === "disabled"}
          aria-readonly={state.current === "readonly"}
          required={required}
          aria-required={validScripts ? (required && valueType !== "url") : required}
          accept={accept}
          max={maxSize}
          onChange={handleChange}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          onKeyDown={handleKeydown}
          aria-label={label}
          aria-invalid={invalid}
          aria-errormessage={errormessage}
          autoFocus={autoFocus}
        />
        {
          validScripts && placeholder &&
          <Placeholder
            className="relative pr-input-pad-x"
            state={state}
            validScripts={validScripts}
          >
            {placeholder}
          </Placeholder>
        }
      </OldInputField>
      {
        value && (
          viewMode === "link"
            ? (
              <FileBoxLinkView
                value={value}
                fileName={name}
                onClick={onViewClick}
              />
            ) :
            viewMode === "image"
              ? (
                <FileBoxImageView
                  value={value}
                  fileName={name}
                  onClick={onViewClick}
                />
              ) :
              undefined
        )
      }
    </>
  );
};

type ViewerProps = {
  value: unknown;
  fileName: string;
};

type LinkContext = {
  type: "url" | "base64" | "file" | "null";
  href: string;
  children: ReactNode;
  revoke?: () => void;
};

function parseToLinkContext(value: unknown, fileName: string): LinkContext {
  if (value == null) {
    return { type: "null", href: "", children: null };
  }
  if (value instanceof File) {
    try {
      const href = URL.createObjectURL(value);
      return {
        type: "file",
        href,
        children: value.name || fileName,
        revoke: () => URL.revokeObjectURL(href),
      };
    } catch (e) {
      console.error(e);
      return { type: "file", href: "", children: null };
    }
  }
  if (typeof value !== "string") {
    return { type: "null", href: "", children: null };
  }
  if (value.match(/^(https?|file):\/\//)) {
    return { type: "url", href: value, children: value };
  }

  try {
    const file = convertBase64ToFile(value, fileName);
    if (!file) throw new Error("Failed to convert.");
    const href = URL.createObjectURL(file);
    return {
      type: "base64",
      href,
      children: "show",
      revoke: () => URL.revokeObjectURL(href),
    };
  } catch (e) {
    console.error(e);
    return { type: "base64", href: "", children: null };
  }
};

export function FileBoxLinkView({ value, fileName, onClick }: ViewerProps & {
  onClick?: (context: LinkContext, e: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const [ctx, setCtx] = useState<LinkContext | undefined>();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(ctx!, e);
  };

  useEffect(() => {
    const context = parseToLinkContext(value, fileName);
    setCtx(context);
    return () => {
      context.revoke?.();
    };
  }, [value, fileName]);

  if (!ctx || !ctx.href || ctx.children == null) return null;
  return (
    <a
      className="_ipt-file-link-view"
      href={ctx.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
    >
      {ctx.children}
    </a>
  );
};

type ImageContext = {
  type: "url" | "base64" | "file" | "null";
  src: string;
  alt: string;
  revoke?: () => void;
};

const FAILED_IMAGE_CONTEXT: ImageContext = {
  type: "null",
  src: "",
  alt: "Not image.",
};

function parseFileToSrc(value: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      if (e.target == null) {
        reject("Failed to convert.");
        return;
      }
      resolve(e.target.result as string);
    };
    reader.onerror = function () {
      reject("Failed to convert.");
    };
    reader.onabort = function () {
      reject("Failed to convert.");
    };
    reader.readAsDataURL(value);
  });
};

async function parseToImageContext(value: unknown, fileName: string): Promise<ImageContext | null> {
  if (value == null) return FAILED_IMAGE_CONTEXT;
  if (value instanceof File) {
    try {
      return {
        type: "file",
        src: await parseFileToSrc(value),
        alt: value.name || fileName,
      };
    } catch (e) {
      console.error(e);
      return { ...FAILED_IMAGE_CONTEXT, type: "file" };
    }
  }
  if (typeof value !== "string") {
    return FAILED_IMAGE_CONTEXT;
  }
  if (value.match(/^(https?|file):\/\//)) {
    return { type: "url", src: value, alt: value };
  }

  try {
    const file = convertBase64ToFile(value, fileName);
    if (!file) throw new Error("Failed to convert.");
    return {
      type: "base64",
      src: await parseFileToSrc(file),
      alt: file.name || fileName,
    };
  } catch (e) {
    console.error(e);
    return { ...FAILED_IMAGE_CONTEXT, type: "base64" };
  }
};

function isValidImgSrc(src: string) {
  try {
    const url = new URL(src, window.location.href);
    if (url.protocol === "data:") {
      return /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(src);
    }
    return /\.(jpe?g|png|gif|bmp|webp|svg|ico|avif|apng)$/i.test(url.pathname);
  } catch {
    return false;
  }
};

export function FileBoxImageView({ value, fileName, onClick }: ViewerProps & {
  onClick?: (context: ImageContext, e: MouseEvent<HTMLImageElement>) => void;
}) {
  const [ctx, setCtx] = useState<ImageContext | undefined>();

  function handleClick(e: MouseEvent<HTMLImageElement>) {
    onClick?.(ctx!, e);
  };

  function handleError() {
    setCtx(c => {
      if (!c || !c.src) return c;
      return {
        ...c,
        src: "",
        alt: FAILED_IMAGE_CONTEXT.alt,
      };
    });
  };

  useEffect(() => {
    parseToImageContext(value, fileName)
      .then(c => {
        const context = c ?? FAILED_IMAGE_CONTEXT;
        if (!isValidImgSrc(context.src)) {
          context.src = "";
          context.alt = FAILED_IMAGE_CONTEXT.alt;
        }
        setCtx(context);
      })
      .catch(() => setCtx(FAILED_IMAGE_CONTEXT));
  }, [value, fileName]);

  if (!ctx) return null;
  if (!ctx.src) {
    return (
      <span>
        {ctx.alt}
      </span>
    );
  }
  return (
    <img
      role="img"
      src={ctx.src}
      alt={ctx.alt}
      title={ctx.alt}
      onClick={handleClick}
      onError={handleError}
    />
  );
};
