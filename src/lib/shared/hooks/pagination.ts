import { useMemo, useState } from "react";

interface PaginationProps<T> {
  value: Array<T> | null | undefined;
  limit: number;
  initPage?: number;
};

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
