export const USER_LAYOUT_FILEPATH = "features/user/react/layouts";
export const USER_PAGE_FILEPATH = "features/user/react/pages";

export function getUserLayoutFilePath(fileName: string) {
  return `${USER_LAYOUT_FILEPATH}/${fileName}`;
};

export function getUserPageFilePath(fileName: string) {
  return `${USER_PAGE_FILEPATH}/${fileName}`;
};
