export const COMMON_LAYOUT_FILEPATH = "features/common/react/layouts";
export const COMMON_PAGE_FILEPATH = "features/common/react/pages";

export function getCommonLayoutFilePath(fileName: string) {
  return `${COMMON_LAYOUT_FILEPATH}/${fileName}`;
};

export function getCommonPageFilePath(fileName: string) {
  return `${COMMON_PAGE_FILEPATH}/${fileName}`;
};
