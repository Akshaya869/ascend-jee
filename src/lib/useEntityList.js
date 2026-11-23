import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export function useEntityList(entityName, query = {}, sort = "-created_date", limit = 500) {
  const [items, setItems] = useState(null);
  const queryKey = JSON.stringify(query);

  const reload = useCallback(async () => {
    const page = await base44.entities[entityName].filter(JSON.parse(queryKey), { sort, limit });
    setItems(page?.items ?? page ?? []);
  }, [entityName, queryKey, sort, limit]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { items, reload, setItems };
}