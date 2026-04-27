import { useFormInput, type FormInputProps, type FormInputStyleProps } from "$/shared/hooks/$schema";
import { convertBase64ToFile } from "$/shared/objects/file";
import { ValidScriptsContext } from "$/shared/providers/valid-scripts";
import type { $FileSchema } from "$/shared/schema/$/file";
import type { FormItem } from "$/shared/schema/$/form";
import { use, useEffect, useImperativeHandle, useMemo, useRef, useState, type ChangeEvent, type InputHTMLAttributes, type MouseEvent, type ReactNode, type RefObject } from "react";
import { FileBox$, type FileBox$Ref } from ".";
import { WithMessage$ } from "../message";

export interface FileBoxRef extends FileBox$Ref { }

export type FileBoxProps<S extends $FileSchema<any>> =
  & FormInputStyleProps
  & FormInputProps
  & {
    ref?: RefObject<InputRef | null>;
    formItem: FormItem<S>;
  } & (
    | {
      /** ファイル表示方法: リンク */
      viewMode?: "link";
      /** リンククリック時のコールバック */
      onViewClick?: (context: LinkContext, e: MouseEvent<HTMLAnchorElement>) => void;
    }
    | {
      /** ファイル表示方法: 画像 */
      viewMode?: "image";
      /** 画像クリック時のコールバック */
      onViewClick?: (context: ImageContext, e: MouseEvent<HTMLImageElement>) => void;
    }
  )
  & Pick<InputHTMLAttributes<HTMLInputElement>,
    | "placeholder"
    | "autoFocus"
  >;

export function FileBox<S extends $FileSchema<any>>({
  ref,
  formItem,
  hideMessage,
  omitOnSubmit,
  className,
  style,
  viewMode,
  onViewClick,
  ...props
}: FileBoxProps<S>) {
  const ref$ = useRef<FileBox$Ref>(null!);

  const {
    schemaItem,
    id,
    name,
    label,
    state,
    value,
    setValue,
    message,
    isInvalid,
    errormMessageId,
    errormessage,
    injectParams,
  } = useFormInput(formItem, {
    hideMessage,
    omitOnSubmit,
  });

  const {
    required,
    accept,
    maxSize,
  } = useMemo(() => {
    return {
      required: schemaItem.getRequired(injectParams) ?? undefined,
      accept: schemaItem.getAccept(injectParams) ?? undefined,
      maxSize: schemaItem.getMaxSize(injectParams) ?? undefined,
    };
  }, [
    schemaItem,
    injectParams,
  ]);

  useImperativeHandle(ref, () => ref$.current);

  const isValidScripts = use(ValidScriptsContext).valid;

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
      <WithMessage$
        id={errormMessageId}
        hide={hideMessage}
        state={state}
        message={message}
      >
        <FileBox$
          className={className}
          style={style}
          ref={ref}
          invalid={isInvalid}
          state={state}
          inputProps={{
            ...props,
            id,
            name: omitOnSubmit ? undefined : name,
            title: isValidScripts ?
              (valueType === "url" ? (value as string) : undefined) :
              undefined,
            required,
            "aria-required": isValidScripts ?
              (required && valueType !== "url") :
              required,
            accept,
            max: maxSize,
            "aria-label": label,
            "aria-errormessage": errormessage,
            onChange: handleChange,
          }}
        />
      </WithMessage$>
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

/** ファイルボックス表示 Props */
type ViewerProps = {
  value: unknown;
  fileName: string;
};

/** リンク表示コンテキスト */
type LinkContext = {
  /** データ形式 */
  type: "url" | "base64" | "file" | "null";
  /** リンクURL */
  href: string;
  /** 子要素 */
  children: ReactNode;
  /** 取り消しコールバック */
  revoke?: () => void;
};

/**
 * リンク表示変換
 * @param value ファイルオブジェクト または リンクURL
 * @param fileName ファイル名
 * @returns
 */
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

/**
 * ファイルリンク表示
 * @param param
 * @returns
 */
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

/** 画像表示コンテキスト */
type ImageContext = {
  /** データ形式 */
  type: "url" | "base64" | "file" | "null";
  /** src */
  src: string;
  /** alt */
  alt: string;
  /** 取り消しコールバック */
  revoke?: () => void;
};

/** 画像変換失敗時コンテキスト */
const FAILED_IMAGE_CONTEXT: ImageContext = {
  type: "null",
  src: "",
  alt: "Not image.",
};

/**
 * 画像表示変換（データ文字列）
 * @param value ファイルオブジェクト
 * @returns
 */
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

/**
 * 画像表示変換
 * @param value ファイルオブジェクト または リンクURL
 * @param fileName ファイル名
 * @returns
 */
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

/**
 * 簡易画像判定
 * @param src
 * @returns
 */
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

/**
 * ファイル画像表示
 * @param param
 * @returns
 */
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
