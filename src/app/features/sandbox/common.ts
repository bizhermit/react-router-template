export const SANDBOX_LAYOUT_FILEPATH = "features/sandbox/react/layouts";
export const SANDBOX_PAGE_FILEPATH = "features/sandbox/react/pages";

export function getSandboxLayoutFilePath(fileName: string) {
  return `${SANDBOX_LAYOUT_FILEPATH}/${fileName}`;
};

export function getSandboxPageFilePath(fileName: string) {
  return `${SANDBOX_PAGE_FILEPATH}/${fileName}`;
};
