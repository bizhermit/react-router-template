import { useMemo, useState } from "react";

/** ページネーション Props */
interface PaginationProps<T> {
  /** 配列 */
  value: Array<T> | null | undefined;
  /** １ページあたりの件数 */
  limit: number;
  /** 初期ページ（1 base） */
  initPage?: number;
};

/**
 * ページネーション
 * @param props {@link PaginationProps}
 * @returns
 */
export function usePagination<T>(props: PaginationProps<T>) {
  const length = props.value?.length ?? 0;
  const maxPage = Math.max(1, Math.ceil(length / props.limit));

  const [rawPage, setRawPage] = useState(() => {
    return Math.min(maxPage, Math.max(1, props.initPage ?? 1));
  });

  const page = Math.min(maxPage, rawPage);
  const hasValue = props.value != null;

  const value = useMemo(() => {
    if (!hasValue) return props.value;
    return props.value!.slice(
      props.limit * (page - 1),
      props.limit * page
    );
  }, [
    page,
    props.limit,
    props.value,
  ]);

  function setPage(next: number) {
    setRawPage(Math.max(1, next));
  };

  return {
    originValue: props.value,
    value,
    length,
    page,
    maxPage,
    limit: props.limit,
    hasValue,
    noData: hasValue ? length === 0 : false,
    setPage,
  } as const;
};
