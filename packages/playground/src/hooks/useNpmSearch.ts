import { useState } from "react";
import useDebounce from "react-use/esm/useDebounce";
import { NpmSearchResultItem, Searcher } from "../lib/npm/searcher-npms";

const perPage = 20;
const searcher = new Searcher();

export function useNpmSearch() {
  const [error, setError] = useState<Error | null>(null);
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [objects, setObjects] = useState<NpmSearchResultItem[]>([]);
  const [total, setTotal] = useState<number>(-1);

  useDebounce(
    () => {
      if (query.trim() === "") {
        return;
      }
      if (loading) {
        return;
      }

      setLoading(true);
      setError(null);
      searcher
        .search(query, { page, perPage })
        .then(({ objects, total }) => {
          setTotal(total);
          setObjects(objects);
        })
        .catch(e => {
          setError(e);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    400,
    [query]
  );

  return {
    query,
    error,
    loading,
    objects,
    setQuery,
    page,
    setPage,
    total
  };
}
