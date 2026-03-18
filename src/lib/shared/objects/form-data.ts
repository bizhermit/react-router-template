type Options = {
  /** 削除モード */
  removeItem?: {
    undefined?: boolean;
    null?: boolean;
    blank?: boolean;
  };
};

/**
 * FormDataに値を追加する
 * @param formData
 * @param struct
 * @param options
 * @returns
 */
export const appendStructData = (
  formData: FormData,
  struct: { [v: string]: unknown; } | null | undefined,
  options?: Options
) => {
  if (struct == null) return formData;
  const setFormValue = (key: string, v: unknown) => {
    if (options?.removeItem) {
      if (v === undefined) {
        if (options.removeItem.undefined) return;
      } else if (v === null) {
        if (options.removeItem.null) return;
      } else if (v === "") {
        if (options.removeItem.blank) return;
      }
    } else {
      if (v == null) {
        formData.append(key, "");
        return;
      }
    }
    if (typeof v === "object") {
      if (v instanceof Blob) {
        formData.append(key, v);
        return;
      }
      if (v instanceof File) {
        formData.append(key, new Blob([v], { type: v.type }));
        return;
      }
      if (Array.isArray(v)) {
        v.forEach((val, i) => setFormValue(`${key}[${i}]`, val));
        return;
      }
      try {
        Object.entries(v as Record<string, unknown>).forEach(([k, val]) => {
          setFormValue(`${key}.${k}`, val);
        });
      } catch {
        console.warn(`convert to form-data warning: ${key} is not supportted object type. try converting to json-stringify.`);
        formData.append(key, JSON.stringify(v));
      }
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formData.append(key, v as any);
  };
  Object.entries(struct).forEach(([key, value]) => {
    setFormValue(key, value);
  });
  return formData;
};

/**
 * 連想配列をFormDataに変換する
 * @param struct
 * @param options
 * @returns
 */
export const convertStructToFormData = (
  struct: { [v: string]: unknown; } | null | undefined,
  options?: Options
) => {
  return appendStructData(new FormData(), struct, options);
};

/**
 * FormDataからnull系の値を削除する
 * @param formData
 * @param options
 * @returns
 */
export const removeFormDataValue = (formData: FormData, options?: Options) => {
  if (!formData) return formData;
  Array.from(formData.keys()).forEach(key => {
    const v = formData.get(key);
    if (options?.removeItem) {
      if (v === undefined) {
        if (options.removeItem.undefined) return;
      } else if (v === null) {
        if (options.removeItem.null) return;
      } else if (v === "") {
        if (options.removeItem.blank) return;
      }
    }
  });
  return formData;
};
