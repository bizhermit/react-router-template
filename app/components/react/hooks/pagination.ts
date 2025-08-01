import { useEffect, useMemo, useState } from "react";

interface PaginationProps<T> {
  value: Array<T> | null | undefined;
  limit: number;
  initPage?: number;
};

export const usePagination = <T>(props: PaginationProps<T>) => {
  const maxPage = Math.max(1, Math.ceil((props.value?.length ?? 0) / props.limit));
  const [page, setPage] = useState<number>(() => Math.min(maxPage, Math.max(1, props.initPage ?? 1)));
  const hasValue = props.value != null;
  const length = props.value?.length ?? 0;

  useEffect(() => {
    setPage(c => Math.min(maxPage, c));
  }, [maxPage]);

  const value = useMemo(() => {
    if (!hasValue) return props.value;
    return props.value!.slice(props.limit * (page - 1), props.limit * page);
  }, [page, props.limit, props.value]);

  return {
    originValue: props.value,
    value,
    length,
    page,
    maxPage,
    limit: props.limit,
    hasValue,
    noData: hasValue ? length === 0 : false,
    setPage: function (page: number) {
      setPage(Math.max(1, Math.min(page, maxPage)));
    },
  };
};
