import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useEntityList } from "@/lib/useEntityList";
import { DEFAULT_SYLLABUS } from "@/lib/syllabus";

export function useSyllabus() {
  const { items, reload, setItems } = useEntityList("Chapter", {}, "order_index", 500);
  const seeding = useRef(false);

  useEffect(() => {
    if (!items || items.length > 0 || seeding.current) return;
    seeding.current = true;
    base44.entities.Chapter.bulkCreate(
      DEFAULT_SYLLABUS.map((chapter, index) => ({
        ...chapter,
        status: "Not Started",
        confidence: 0,
        revision_count: 0,
        order_index: index,
      }))
    )
      .then(() => reload())
      .catch(() => {
        seeding.current = false;
      });
  }, [items, reload]);

  return { chapters: items, reload, setItems };
}