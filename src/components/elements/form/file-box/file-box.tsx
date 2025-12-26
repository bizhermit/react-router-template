import { useSchemaItem } from "$/shared/hooks/schema";
import { convertBase64ToFile } from "$/shared/objects/file";
import { getValidationValue } from "$/shared/schema/utilities";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type MouseEvent, type ReactNode } from "react";
import { FileBox$, type FileBox$Ref } from ".";
import { WithMessage } from "../message";

export interface FileBoxRef extends FileBox$Ref { };

export type FileBoxProps<D extends Schema.DataItem<Schema.$File>> = Overwrite<
  InputPropsWithDataItem<D>,
  {
    placeholder?: ReactNode;
  } & (
    | {
      viewMode?: "link";
      onViewClick?: (context: LinkContext, e: MouseEvent<HTMLAnchorElement>) => void;
    }
    | {
      viewMode?: "image";
      onViewClick?: (context: ImageContext, e: MouseEvent<HTMLImageElement>) => void;
    }
  )
>;

export function FileBox<D extends Schema.DataItem<Schema.$File>>({
  className,
  style,
  placeholder,
  viewMode,
  onViewClick,
  autoFocus,
  ...$props
}: FileBoxProps<D>) {
  const ref = useRef<FileBox$Ref>(null!);

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
    getCommonParams,
    omitOnSubmit,
    hideMessage,
    validScripts,
  } = useSchemaItem<Schema.DataItem<Schema.$File>>($props, {
    effect: function ({ value }) {
      if (!ref.current) return;
      if (value == null) {
        ref.current.inputElement.value = "";
        return;
      }
      if (typeof value === "string") {
        return;
      }
      const dt = new DataTransfer();
      dt.items.add(value);
      ref.current.inputElement.value = "";
      ref.current.inputElement.files = dt.files;
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
    if (state !== "enabled") return;
    setValue(e.target.files?.[0]);
  };

  const valueType = typeof value === "string"
    ? "url"
    : value == null
      ? undefined
      : "file";

  return (
    <>
      <WithMessage
        hide={hideMessage}
        state={state}
        result={result}
      >
        <FileBox$
          className={className}
          style={style}
          ref={ref}
          invalid={invalid}
          state={state}
          inputProps={{
            name: omitOnSubmit ? undefined : name,
            title: validScripts ?
              (valueType === "url" ? (value as string) : undefined) :
              undefined,
            placeholder,
            required,
            "aria-required": validScripts ?
              (required && valueType !== "url") :
              required,
            accept,
            max: maxSize,
            "aria-label": label,
            "aria-errormessage": errormessage,
            autoFocus,
            onChange: handleChange,
          }}
        />
      </WithMessage>
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
  const ctx = useMemo(() => {
    return parseToLinkContext(value, fileName);
  }, [
    value,
    fileName,
  ]);

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(ctx!, e);
  };

  useEffect(() => {
    return () => ctx.revoke?.();
  }, [ctx]);

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
