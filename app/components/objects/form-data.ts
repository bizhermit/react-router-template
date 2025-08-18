type Options = {
  removeItem?: "un" | "null" | "null-blank";
};

export const appendStructData = (
  formData: FormData,
  struct: { [v: string]: any; } | null | undefined,
  options?: Options
) => {
  if (struct == null) return formData;
  const setFormValue = (key: string, v: any) => {
    if (options?.removeItem) {
      switch (options.removeItem) {
        case "un":
          if (v === undefined) return;
          break;
        case "null":
          if (v == null) return;
          break;
        case "null-blank":
          if (v == null || v === "") return;
          break;
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
        Object.keys(v).forEach(k => {
          setFormValue(`${key}.${k}`, v[k]);
        });
      } catch {
        console.warn(`convert to form-data warning: ${key} is not supportted object type. try converting to json-stringify.`);
        formData.append(key, JSON.stringify(v));
      }
      return;
    }
    formData.append(key, v);
  };
  Object.keys(struct).forEach(key => {
    setFormValue(key, struct[key]);
  });
  return formData;
};

export const convertStructToFormData = (
  struct: { [v: string]: any; } | null | undefined,
  options?: Options
) => {
  return appendStructData(new FormData(), struct, options);
};

export const removeFormDataValue = (formData: FormData, options?: Options) => {
  if (!formData) return formData;
  Array.from(formData.keys()).forEach(key => {
    const v = formData.get(key);
    if (options?.removeItem) {
      switch (options.removeItem) {
        case "un":
          if (v === undefined) formData.delete(key);
          break;
        case "null":
          if (v == null) formData.delete(key);
          break;
        case "null-blank":
          if (v == null || v === "") formData.delete(key);
          break;
      }
    }
  });
  return formData;
};
