export function convertBase64ToFile(base64: string | ArrayBuffer | null | undefined, fileName: string, options?: FilePropertyBag) {
  if (base64 == null) throw new Error("base64 not set");
  if (typeof base64 === "string") {
    const bin = decodeURIComponent(escape(atob(base64.replace(/^.*,/, ""))));
    const u8a = new Uint8Array(bin.length);
    for (let i = 0, il = bin.length; i < il; i++) {
      u8a[i] = bin.charCodeAt(i);
    }
    return new File([u8a.buffer], fileName, options);
  }
  return new File([new Uint8Array(base64)], fileName, options);
};

export function convertFileToBase64(file: File | null | undefined) {
  return new Promise<string | ArrayBuffer>((resolve, reject) => {
    if (file == null) {
      reject("file not set.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result == null || typeof reader.result !== "string") reject("convert failed.");
      else resolve(reader.result.replace(/^.*,/, ""));
    };
    reader.onerror = () => {
      reject("convert failed.");
    };
    reader.readAsDataURL(file);
  });
};

export function convertFileToBlob(file: File | null | undefined) {
  return file == null ? file : new Blob([file], { type: file.type });
};

export function convertBlobToFile(blob: Blob | null | undefined, fileName: string) {
  return blob == null ? blob : new File([blob], fileName, { type: blob.type });
};

export function getFileSize2Text(size: number) {
  if (size < 1024) return `${size}byte`;
  if (size < 1048576) return `${Math.floor(size / 1024 * 10) / 10}KiB`;
  if (size < 1073741824) return `${Math.floor(size / 1048576 * 10) / 10}MiB`;
  return `${Math.floor(size / 1073741824 * 10) / 10}GiB`;
};

export function getFileSize10Text(size: number) {
  if (size < 1000) return `${size}B`;
  if (size < 1000000) return `${Math.floor(size / 1000 * 10) / 10}KB`;
  if (size < 1000000000) return `${Math.floor(size / 1000000 * 10) / 10}MB`;
  return `${Math.floor(size / 1000000000 * 10) / 10}GB`;
};
